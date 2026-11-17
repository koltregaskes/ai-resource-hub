"""What a resume does after a run died: kills at each write, torn journals,
unknown requests and the `reconcile` command.

Every transport here is a fake, and nothing touches the network or a key.

A kill is a real one wherever the harness's own handlers would otherwise
write something a kill would not: the scenario runs in a child process that
ends with `os._exit` at the chosen point, and the parent then resumes the
run from the disk alone. The fake transport writes every call it sees to a
file, fsynced, so the calls of the child and of every resume can be counted
together, per model and per prompt, over the whole life of a run.

The scenario is a dry canary: one model (m-oa) and two tasks, each once.
t1 has two judged checks, so both judges get a checklist prompt; t2 has no
knowable answer, so both judges get an outcome prompt. Every logical call
therefore has a prompt of its own, and "no second call" can be counted.
"""

import base64
import collections
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from decimal import Decimal
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cli  # noqa: E402
import config as config_module  # noqa: E402
import judges  # noqa: E402
import keys  # noqa: E402
import ledger  # noqa: E402
import records  # noqa: E402
import runner  # noqa: E402
import test_run_runner as cases  # noqa: E402
import test_run_support as support  # noqa: E402

KILLED = 74
ANSWER = "an answer"


def scenario_tasks():
    return [support.task("t1", family=4, checks=2),
            support.task("t2", family=2, answerable=False)]


def scenario_config():
    return support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")])


def label(prompt):
    """A short name for the logical call a prompt belongs to."""
    if prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
        return "checklist"
    if prompt.startswith(judges.OUTCOME_PROMPT[:60]):
        return "outcome"
    for task in scenario_tasks():
        if prompt == task["prompt"]:
            return task["id"]
    return "unknown prompt"


# Every logical call of the scenario, made exactly once.
ONCE = {("m-oa", "t1"): 1, ("m-oa", "t2"): 1,
        ("j-oa", "checklist"): 1, ("j-an", "checklist"): 1,
        ("j-oa", "outcome"): 1, ("j-an", "outcome"): 1}


class CountingTransport:
    """A fake transport that writes each call to `path`, fsynced, before it
    answers. `kill` is (kind, nth) to end the process at the nth model or
    judge call, before the call is written: the request never left."""

    def __init__(self, path, kill=None):
        self.path = path
        self.kill = kill
        self.seen = {"model": 0, "judge": 0}
        self.requests = []

    def __call__(self, request):
        prompt = support.prompt_of(request)
        kind = "judge" if cases.is_judge_prompt(prompt) else "model"
        self.seen[kind] += 1
        if self.kill == (kind, self.seen[kind]):
            os._exit(KILLED)
        self.requests.append(request)
        line = json.dumps({"model": request.body["model"], "call": label(prompt),
                           "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest()})
        with open(self.path, "ab") as stream:
            stream.write(line.encode("utf-8") + b"\n")
            stream.flush()
            os.fsync(stream.fileno())
        text = ANSWER if kind == "model" else runner.stub_reply(
            request.provider, request.body["model"], prompt)
        return support.reply_body(request, text)


def _kind(request_id):
    return "judge" if "/judge/" in request_id else "model"


def _arm(point, which, nth):
    """Make the child process end, with `os._exit`, at one point of the run.
    Returns the (kind, nth) for the transport when the point is the send."""
    seen = collections.Counter()

    def at(kind):
        seen[kind] += 1
        return kind == which and seen[kind] == nth

    def before(owner, name, kind_of):
        real = getattr(owner, name)

        def wrapped(*args, **kwargs):
            if at(kind_of(*args, **kwargs)):
                os._exit(KILLED)
            return real(*args, **kwargs)
        setattr(owner, name, wrapped)

    if point == "transport":
        return (which, nth)
    if point == "before_reserve":
        before(ledger.Budget, "reserve", lambda self, provider, request, worst: _kind(request))
    elif point == "before_sent":
        before(records.RunRecord, "request_sent", lambda self, request, payload: _kind(request))
    elif point == "before_received":
        before(records.RunRecord, "request_received",
               lambda self, request, payload: _kind(request))
    elif point == "before_settle":
        before(ledger.Budget, "settle",
               lambda self, provider, request, *rest, **more: _kind(request))
    elif point == "before_done":
        before(records.RunRecord, "request_done", lambda self, request, payload: _kind(request))
    elif point == "half_reserve":
        # The ledger's own write is cut off: half the line reaches the disk.
        real = ledger.ProviderLedger._append

        def torn(self, event):
            if event["event"] == "reserve" and at(_kind(event["request_id"])):
                data = json.dumps(dict(event, provider=self.provider), sort_keys=True)
                with open(self.path, "ab") as stream:
                    stream.write(data[:len(data) // 2].encode("utf-8"))
                    stream.flush()
                    os.fsync(stream.fileno())
                os._exit(KILLED)
            return real(self, event)
        ledger.ProviderLedger._append = torn
    elif point in ("replace_before", "replace_after"):
        # `which` is the file name: the nth move of a temporary file onto it.
        real = os.replace

        def replace(source, destination):
            hit = at(os.path.basename(destination))
            if hit and point == "replace_before":
                os._exit(KILLED)
            real(source, destination)
            if hit:
                os._exit(KILLED)
        records.os.replace = replace
    elif point == "before_rename":
        records.os.rename = lambda source, destination: os._exit(KILLED)
    else:
        raise SystemExit("unknown kill point: " + point)
    return None


def child(argv):
    """Run the scenario in this process and die at the chosen point."""
    store, calls_path, point, which, nth = argv
    seen = {"n": 0}

    def grade(task, reply, judged=None):
        if judged is None:
            seen["n"] += 1
            if point == "before_grade" and seen["n"] == int(nth):
                os._exit(KILLED)
        return cases.JudgingTests.grade(task, reply, judged)
    kill = None if point == "before_grade" else _arm(point, which, int(nth))
    runner.run_stage("canary", scenario_config(), scenario_tasks(), private_store=store,
                     grade=grade, transport=CountingTransport(calls_path, kill=kill),
                     out=cases.QUIET, seed=11, scores=cases.NO_SCORES)
    os._exit(0)


CHILD = ("import sys; sys.path[:0] = sys.argv[1:3]; import test_run_recovery; "
         "test_run_recovery.child(sys.argv[3:])")


class KillCase(cases.RunnerCase):
    """The scenario, a way to kill it in a child process, and the counts."""

    def setUp(self):
        super().setUp()
        self.tasks = scenario_tasks()
        self.cfg = scenario_config()
        side = tempfile.TemporaryDirectory()
        self.addCleanup(side.cleanup)
        self.calls_path = os.path.join(side.name, "calls.jsonl")

    def kill(self, point, which="model", nth=1):
        """Run the scenario in a child that dies at `point`; the run id."""
        here = os.path.dirname(os.path.abspath(__file__))
        env = {name: value for name, value in os.environ.items()
               if name not in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY")}
        done = subprocess.run(
            [sys.executable, "-I", "-B", "-c", CHILD, os.path.dirname(here), here, self.store,
             self.calls_path, point, which, str(nth)],
            env=env, capture_output=True, text=True, timeout=120)
        self.assertEqual(done.returncode, KILLED, done.stderr)
        folder = os.path.join(self.store, "runs", "_staging")
        names = os.listdir(folder) if os.path.isdir(folder) else []
        final = [name for name in os.listdir(os.path.join(self.store, "runs"))
                 if name != "_staging"]
        (run_id,) = names + final
        return run_id

    def calls(self):
        """{(model, logical call): how often the fake transports were asked},
        over the child and every resume so far."""
        counts = collections.Counter()
        if os.path.exists(self.calls_path):
            with open(self.calls_path, encoding="utf-8") as stream:
                for line in stream:
                    item = json.loads(line)
                    counts[(item["model"], item["call"])] += 1
        return dict(counts)

    def resume(self, run_id, **kwargs):
        transport = CountingTransport(self.calls_path)
        printed = []
        kwargs.setdefault("grade", cases.JudgingTests.grade)
        summary = self.run_stage(stage="canary", transport=transport, resume=run_id,
                                 out=printed.append, **kwargs)
        return summary, transport, printed

    def staged(self, run_id, name="requests.jsonl"):
        return os.path.join(self.store, "runs", "_staging", run_id, name)

    def staged_log(self, run_id):
        with open(self.staged(run_id), encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def book_path(self, run_id, provider="openai"):
        return os.path.join(self.store, "ledgers-dry", run_id, provider + ".jsonl")

    def book(self, run_id, provider="openai"):
        return ledger.ProviderLedger(provider, "50", self.book_path(run_id, provider))

    def ledger_lines(self, run_id, provider="openai"):
        with open(self.book_path(run_id, provider), encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def finished(self, summary):
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual(summary["awaiting_reconciliation"], [])
        records.verify_manifest(summary["dir"])
        sent = [line["request_id"] for line in self.log(summary) if line["event"] == "sent"]
        self.assertEqual(len(sent), len(set(sent)))
        self.assertEqual([name for name in os.listdir(summary["dir"])
                          if name.endswith(".tmp")], [])


class NoSecondCallTests(KillCase):
    """Finding 1. A kill after the API response never makes a resume send
    the same model or judge prompt again."""

    # (i) after the transport returned, before the received line -----------

    def test_model_killed_before_the_received_line_is_blocked_until_reconciled(self):
        run_id = self.kill("before_received", "model")
        ((flying, provider),) = self.in_flight(run_id)
        slot = flying.rpartition("/")[0]
        task = slot.split("/")[-2]
        other = "t2" if task == "t1" else "t1"
        self.assertEqual(self.calls(), {("m-oa", task): 1})
        self.assertEqual([line["event"] for line in self.staged_log(run_id)], ["sent"])
        self.assertIsNone(self.book(run_id).entries[flying]["charge"])
        # Resumed: the response is not on record, so the request may have been
        # billed. Nothing is sent for the slot; the other slot carries on.
        waiting, transport, printed = self.resume(run_id)
        self.assertEqual((waiting["status"], waiting["awaiting_reconciliation"]),
                         ("interrupted", [flying]))
        self.assertEqual(waiting["recovered_requests"], [])
        self.assertIn(flying, waiting["report"]["interrupt_reason"])
        counts = self.calls()
        self.assertEqual(counts[("m-oa", task)], 1)               # no second call
        self.assertEqual(counts[("m-oa", other)], 1)
        self.assertEqual(sum(counts.values()), 4)                 # other slot: answer + 2 judges
        self.assertNotIn(slot, [row["slot_id"] for row in self.rows(waiting)])   # no row
        self.assertEqual(waiting["report"]["models"]["m-oa"]["unstarted_slots"], [slot])
        command = next(line for line in printed if "cli.py reconcile" in line)
        self.assertIn('--provider %s --request-id "%s"' % (provider, flying), command)
        # Resumed again, still not reconciled: nothing at all is sent.
        still, idle, _ = self.resume(run_id)
        self.assertEqual((still["status"], idle.requests), ("interrupted", []))
        self.assertEqual(self.calls(), counts)
        # Accounting alone leaves the lost response blocked. Only an explicit
        # retry permits a replacement, and the warning precedes dispatch.
        self.assertEqual(self.reconcile(run_id), [flying])
        for _ in range(3):
            blocked, idle, _ = self.resume(run_id)
            self.assertIn(flying, blocked["awaiting_reconciliation"])
            self.assertEqual(idle.requests, [])
            self.assertEqual(self.calls(), counts)
        self.reconcile(run_id, retry_lost_paid=True)
        done, _, printed = self.resume(run_id)
        self.assertTrue(any("SECOND PAID CALL for request " + flying in line for line in printed))
        self.finished(done)
        row = next(r for r in self.rows(done) if r["slot_id"] == slot)
        self.assertEqual([(q["request_id"], q["status"]) for q in row["requests"]],
                         [(flying, "in_flight_when_stopped"), (slot + "/2", "ok")])
        self.assertEqual(row["requests"][0]["ledger_flags"], ["reconciled_by_hand"])
        self.assertEqual(Decimal(row["requests"][0]["charge_usd"]),
                         self.book(run_id).entries[flying]["reserved"])
        self.assertEqual(self.calls(), {**ONCE, ("m-oa", task): 2})

    def test_judge_killed_before_the_received_line_is_blocked_until_reconciled(self):
        run_id = self.kill("before_received", "judge")
        ((flying, provider),) = self.in_flight(run_id)
        slot, kind = flying.split("/judge/")[0], flying.split("/")[-2]
        call = "checklist" if kind == "checklist_judging" else "outcome"
        task = slot.split("/")[-2]
        self.assertEqual((provider, flying.split("/")[-3]), ("openai", "j-oa"))
        self.assertEqual(self.calls(), {("m-oa", task): 1, ("j-oa", call): 1})
        # Resumed: nothing is sent for that judge call. The other judge of the
        # slot is a different call and is asked; the slot stays pending.
        waiting, _, printed = self.resume(run_id)
        self.assertEqual((waiting["status"], waiting["awaiting_reconciliation"]),
                         ("pending_judging", [flying]))
        counts = self.calls()
        self.assertEqual(counts, ONCE)                            # each call once, j-oa's too
        row = next(r for r in self.rows(waiting) if r["slot_id"] == slot)
        self.assertEqual((row["pass"], row["pending"]), (None, True))
        self.assertEqual(row["flags"],
                         ["finished_on_resume", "judge_request_awaiting_reconciliation"])
        detail = row["judged"]["detail"]["checklist" if call == "checklist" else "outcome"]
        self.assertEqual([item["result"] for item in detail[0]["attempts"]],
                         ["awaiting_reconciliation"])
        self.assertTrue(any("cli.py reconcile" in line and flying in line for line in printed))
        # Again, not reconciled: nothing is sent, the row stays pending.
        still, idle, _ = self.resume(run_id)
        self.assertEqual((still["status"], idle.requests), ("pending_judging", []))
        # Reconciliation alone blocks; explicit consent permits request two.
        self.assertEqual(self.reconcile(run_id), [flying])
        for _ in range(3):
            blocked, idle, _ = self.resume(run_id)
            self.assertIn(flying, blocked["awaiting_reconciliation"])
            self.assertEqual(idle.requests, [])
            self.assertEqual(self.calls(), counts)
        self.reconcile(run_id, retry_lost_paid=True)
        done, transport, printed = self.resume(run_id)
        self.assertTrue(any("SECOND PAID CALL for request " + flying in line for line in printed))
        self.finished(done)
        self.assertEqual([r.body["model"] for r in transport.requests], ["j-oa"])
        row = next(r for r in self.rows(done) if r["slot_id"] == slot)
        base = flying.rpartition("/")[0]
        self.assertEqual([(q["request_id"], q["status"]) for q in row["judge_requests"]],
                         [(flying, "in_flight_when_stopped"),
                          (base.replace("/j-oa/", "/j-an/") + "/1", "ok"), (base + "/2", "ok")])
        self.assertEqual(len(row["requests"]), 1)
        self.assertEqual(self.calls(), {**ONCE, ("j-oa", call): 2})

    # (ii) and (iii): the response is in the log ---------------------------

    def recovered(self, point, which, settled_before):
        run_id = self.kill(point, which)
        log = self.staged_log(run_id)
        (flying,) = [line["request_id"] for line in log if line["event"] == "received"
                     and line["request_id"] not in
                     {done["request_id"] for done in log if done["event"] == "done"}]
        self.assertEqual(self.in_flight(run_id), [])
        before = dict(self.calls())
        entry = self.book(run_id).entries[flying]
        self.assertEqual(entry["charge"] is not None, settled_before)
        done, transport, printed = self.resume(run_id)
        self.finished(done)
        self.assertEqual(done["recovered_requests"], [flying])
        # Over the whole life of the run every logical call was made once.
        self.assertEqual(self.calls(), ONCE)
        for key, count in before.items():
            self.assertEqual(count, 1, key)
        # Settled exactly once in the ledger, and the done line says the same.
        events = [line for line in self.ledger_lines(run_id) if line["request_id"] == flying]
        self.assertEqual([line["event"] for line in events], ["reserve", "settle"])
        lines = [line for line in self.log(done) if line.get("request_id") == flying]
        self.assertEqual([line["event"] for line in lines],
                         ["sent", "received", "done", runner.RECOVERED_EVENT])
        self.assertEqual(lines[2]["result"], lines[1]["result"])
        self.assertEqual((lines[2]["charge_usd"], lines[2]["finished_on_resume"]),
                         (events[1]["usd"], True))
        self.assertEqual(lines[3]["settled_on_resume"], not settled_before)
        self.assertTrue(any(flying in line and "It is not sent again" in line
                            for line in printed))
        # Nothing is left open: the run's ledgers hold only settled entries.
        for provider in ("openai", "anthropic"):
            self.assertEqual(self.book(run_id, provider).reserved, Decimal(0))
        return done, flying

    def test_model_killed_before_the_settle_is_recovered_from_the_log(self):
        done, flying = self.recovered("before_settle", "model", settled_before=False)
        row = next(r for r in self.rows(done) if r["slot_id"] == flying.rpartition("/")[0])
        self.assertEqual([(q["request_id"], q["status"]) for q in row["requests"]],
                         [(flying, "ok")])
        self.assertEqual((row["reply"], row["flags"]), (ANSWER, ["finished_on_resume"]))
        # Charged from the logged usage: (10 x 3 + 5 x 30) / 1e6.
        self.assertEqual(Decimal(row["cost_usd_exact"]), Decimal("0.00018"))

    def test_model_killed_before_the_done_line_is_recovered_from_the_log(self):
        done, flying = self.recovered("before_done", "model", settled_before=True)
        row = next(r for r in self.rows(done) if r["slot_id"] == flying.rpartition("/")[0])
        self.assertEqual((row["reply"], len(row["requests"])), (ANSWER, 1))
        self.assertEqual(Decimal(row["cost_usd_exact"]), Decimal("0.00018"))

    def test_judge_killed_before_the_settle_is_recovered_from_the_log(self):
        done, flying = self.recovered("before_settle", "judge", settled_before=False)
        row = next(r for r in self.rows(done) if r["slot_id"] == flying.split("/judge/")[0])
        self.assertEqual([q["status"] for q in row["judge_requests"]], ["ok", "ok"])
        self.assertFalse(row["pending"])

    def test_judge_killed_before_the_done_line_is_recovered_from_the_log(self):
        done, flying = self.recovered("before_done", "judge", settled_before=True)
        row = next(r for r in self.rows(done) if r["slot_id"] == flying.split("/judge/")[0])
        self.assertEqual([q["status"] for q in row["judge_requests"]], ["ok", "ok"])
        self.assertFalse(row["pending"])

    def test_a_recovered_overrun_stops_the_resume_before_anything_is_sent(self):
        # The response is in the log and the ledger is still open. The price
        # in force makes the logged usage cost more than was reserved.
        run_id = self.kill("before_settle", "model")
        path = self.book_path(run_id)
        with open(path, encoding="utf-8") as stream:
            lines = [json.loads(line) for line in stream]
        lines[-1]["usd"] = "0.00001"                              # a reservation too small
        with open(path, "w", encoding="utf-8", newline="\n") as stream:
            stream.write("".join(json.dumps(line, sort_keys=True) + "\n" for line in lines))
        stopped, transport, _ = self.resume(run_id)
        self.assertEqual((stopped["status"], transport.requests), ("interrupted", []))
        self.assertIn("a charge was above its reservation", stopped["report"]["interrupt_reason"])
        self.assertEqual(len(stopped["recovered_requests"]), 1)
        # It is on file as an overrun, so the next start is refused.
        self.assertEqual(self.book(run_id).overruns(), stopped["recovered_requests"])


class TornJournalTests(KillCase):
    """Finding 4. A journal that ends in a part-written record is recovered
    on resume, with no repair by hand."""

    @staticmethod
    def cut(path, whole):
        """Tear the last record of a journal: cut it mid-line, or (with
        `whole`) take away only its newline. Returns (the bytes before the
        record, the torn bytes left behind, the record as it was)."""
        with open(path, "rb") as stream:
            data = stream.read()
        assert data.endswith(b"\n")
        start = data.rfind(b"\n", 0, len(data) - 1) + 1
        last = data[start:-1]
        torn = last if whole else last[:len(last) // 2]
        with open(path, "wb") as stream:
            stream.write(data[:start] + torn)
        return data[:start], torn, json.loads(last)

    def sidecar(self, path):
        with open(path + ".torn", encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def torn(self, point, journal, event, check, which="model", nth=2):
        """Kill the scenario at `point`, tear the last record of `journal`
        (the run log, or a provider's ledger), resume, and check."""
        for whole in (False, True):
            with self.subTest(event=event, whole_record_without_newline=whole):
                self.setUp()
                run_id = self.kill(point, which, nth)
                path = self.staged(run_id) if journal == "log" else self.book_path(run_id)
                kept, torn, record = self.cut(path, whole)
                self.assertEqual(record["event"], event)
                self.assertGreater(len(kept), 0)                  # earlier records exist
                before = dict(self.calls())
                summary, transport, printed = self.resume(run_id)
                # The torn bytes are in the sidecar and gone from the journal;
                # everything before them is kept exactly.
                final = path if os.path.exists(path) else os.path.join(
                    summary["dir"], os.path.basename(path))
                with open(final, "rb") as stream:
                    self.assertTrue(stream.read().startswith(kept))
                (moved,) = self.sidecar(final)
                self.assertEqual(base64.b64decode(moved["bytes_base64"]), torn)
                self.assertEqual((moved["offset"], moved["length"]), (len(kept), len(torn)))
                (told,) = summary["torn_tails"]
                self.assertEqual(told["sha256"], hashlib.sha256(torn).hexdigest())
                self.assertEqual(told["provider"], None if journal == "log" else "openai")
                self.assertTrue(any("part-written" in line for line in printed))
                check(summary, record, before, transport)
                self.doCleanups()

    def earlier_reservations_intact(self, summary, kept):
        book = self.book(summary["run_id"])
        for line in kept.splitlines():
            event = json.loads(line)
            if event["event"] == "reserve":
                self.assertEqual(book.entries[event["request_id"]]["reserved"],
                                 Decimal(event["usd"]))

    def test_a_torn_reserve_was_never_sent(self):
        def check(summary, record, before, transport):
            # The request of the torn reservation never left: the slot sends
            # its first request, and every call is made exactly once.
            self.finished(summary)
            self.assertEqual(self.calls(), ONCE)
            self.assertEqual(summary["ledger_only_requests"], [])
            self.assertEqual(summary["recovered_requests"], [])
            sent = [line["request_id"] for line in self.log(summary) if line["event"] == "sent"]
            self.assertIn(record["request_id"], sent)             # the id is used after all
            with open(self.book_path(summary["run_id"]), "rb") as stream:
                self.earlier_reservations_intact(summary, stream.read())
        self.torn("before_sent", "ledger", "reserve", check)

    def test_a_torn_settle_is_settled_again_from_the_received_line(self):
        def check(summary, record, before, transport):
            self.finished(summary)
            self.assertEqual(summary["recovered_requests"], [record["request_id"]])
            self.assertEqual(self.calls(), ONCE)                  # nothing sent twice
            settles = [line for line in self.ledger_lines(summary["run_id"])
                       if line["request_id"] == record["request_id"]
                       and line["event"] == "settle"]
            self.assertEqual([line["usd"] for line in settles], [record["usd"]])
        self.torn("before_done", "ledger", "settle", check)

    def test_a_torn_sent_line_leaves_a_request_that_only_the_ledger_knows(self):
        def check(summary, record, before, transport):
            # Reserved, never sent: it counts as used, blocks nothing, and
            # the slot goes on with its next request.
            self.finished(summary)
            self.assertEqual(summary["ledger_only_requests"], [record["request_id"]])
            self.assertEqual(self.calls(), ONCE)
            slot = record["request_id"].rpartition("/")[0]
            row = next(r for r in self.rows(summary) if r["slot_id"] == slot)
            self.assertEqual([(q["request_id"], q["status"]) for q in row["requests"]],
                             [(slot + "/1", "reserved_never_logged"), (slot + "/2", "ok")])
        self.torn("transport", "log", "sent", check)

    def test_a_torn_received_line_leaves_the_call_blocked(self):
        def check(summary, record, before, transport):
            # The response was lost with the line, so the request may have
            # been billed and nothing says what came back: blocked.
            self.assertEqual(summary["status"], "interrupted")
            self.assertEqual(summary["awaiting_reconciliation"], [record["request_id"]])
            self.assertEqual(summary["recovered_requests"], [])
            self.assertEqual(transport.requests, [])
            self.assertEqual(self.calls(), before)
            self.assertEqual(max(before.values()), 1)
        self.torn("before_settle", "log", "received", check)

    def test_a_torn_done_line_is_built_again_from_the_received_line(self):
        def check(summary, record, before, transport):
            self.finished(summary)
            self.assertEqual(summary["recovered_requests"], [record["request_id"]])
            self.assertEqual(self.calls(), ONCE)
            done = [line for line in self.log(summary) if line["event"] == "done"
                    and line["request_id"] == record["request_id"]]
            self.assertEqual([(line["charge_usd"], line["result"]) for line in done],
                             [(record["charge_usd"], record["result"])])
        self.torn("before_grade", "log", "done", check)

    def test_a_torn_slot_row_is_built_again_from_the_requests(self):
        def check(summary, record, before, transport):
            self.finished(summary)
            self.assertEqual(self.calls(), ONCE)
            slot = record["slot"]["slot_id"]
            # Nothing was sent for the slot whose row was torn: its answer
            # and both verdicts were in the log.
            task = slot.split("/")[-2]
            self.assertNotIn(task, [label(support.prompt_of(r)) for r in transport.requests])
            self.assertEqual(len(transport.requests), 3)          # the other slot only
            row = next(r for r in self.rows(summary) if r["slot_id"] == slot)
            self.assertEqual(row["flags"], ["finished_on_resume"])
            for name in ("reply", "outcome", "pass", "checks", "cost_usd_exact",
                         "judge_cost_usd"):
                self.assertEqual(row[name], record["slot"][name], name)
        self.torn("before_reserve", "log", "slot", check)

    def test_a_ledger_write_cut_off_by_a_real_kill_is_recovered(self):
        # No cutting by hand: the child dies half-way through the reserve
        # line of its second model request.
        run_id = self.kill("half_reserve", "model", 2)
        with open(self.book_path(run_id), "rb") as stream:
            data = stream.read()
        self.assertFalse(data.endswith(b"\n"))
        done, _, printed = self.resume(run_id)
        self.finished(done)
        self.assertEqual(self.calls(), ONCE)
        (moved,) = self.sidecar(self.book_path(run_id))
        self.assertEqual(base64.b64decode(moved["bytes_base64"]),
                         data[data.rfind(b"\n") + 1:])
        self.assertEqual([item["provider"] for item in done["torn_tails"]], ["openai"])
        self.earlier_reservations_intact(done, data[:data.rfind(b"\n") + 1])

    def test_damage_in_the_middle_of_a_journal_still_refuses_the_resume(self):
        run_id = self.kill("before_reserve", "model", 2)
        for journal, error in ((self.staged(run_id), records.RecordError),
                               (self.book_path(run_id), ledger.LedgerError)):
            with open(journal, "rb") as stream:
                good = stream.read()
            lines = good.splitlines(keepends=True)
            with open(journal, "wb") as stream:
                stream.write(lines[0] + lines[1][:len(lines[1]) // 2] + b"\n"
                             + b"".join(lines[2:]))
            transport = CountingTransport(self.calls_path)
            with self.assertRaises(error):
                self.run_stage(stage="canary", transport=transport, resume=run_id,
                               grade=cases.JudgingTests.grade)
            self.assertEqual(transport.requests, [])
            self.assertFalse(os.path.exists(journal + ".torn"))
            with open(journal, "wb") as stream:
                stream.write(good)
        done, _, _ = self.resume(run_id)                          # repaired by hand: goes on
        self.finished(done)


class StatusWriteKillTests(KillCase):
    """Finding 3. A real kill in the middle of a whole-file write leaves a
    complete run.json, and the run is resumed."""

    def test_killed_before_the_move_of_the_sealing_write(self):
        # The third write of run.json is the one that seals the folder.
        run_id = self.kill("replace_before", "run.json", 3)
        self.assertEqual(self.calls(), ONCE)
        self.assertTrue(os.path.exists(self.staged(run_id, "run.json.tmp")))
        # The destination is the old document, whole; the new one is only in
        # the temporary file, which is never read as the record.
        staged = records.read_staged(self.store, run_id)
        self.assertEqual(staged["status"], "running")
        with open(self.staged(run_id, "run.json.tmp"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream)["status"], "finalised")
        self.assertFalse(records.is_sealed(self.store, run_id))
        done, transport, _ = self.resume(run_id)
        self.finished(done)
        self.assertEqual((transport.requests, self.calls()), ([], ONCE))

    def test_killed_after_the_move_of_the_sealing_write(self):
        run_id = self.kill("replace_after", "run.json", 3)
        self.assertFalse(os.path.exists(self.staged(run_id, "run.json.tmp")))
        self.assertEqual(records.read_staged(self.store, run_id)["status"], "finalised")
        self.assertTrue(records.is_sealed(self.store, run_id))
        self.assertFalse(os.path.exists(self.staged(run_id, "manifest.json")))
        done, transport, printed = self.resume(run_id)
        self.finished(done)
        self.assertEqual((transport.requests, self.calls()), ([], ONCE))
        self.assertEqual((done["resumed"], done["already_finalised"]), (True, False))
        self.assertTrue(any("was stopped while it was being finalised" in line
                            for line in printed))

    def test_killed_before_the_move_of_an_early_status_write(self):
        # The second write of run.json follows the plan. The run.json on disk
        # is the first one, whole, and the plan is there.
        run_id = self.kill("replace_before", "run.json", 2)
        self.assertEqual(self.calls(), {})
        self.assertEqual(records.read_staged(self.store, run_id)["status"], "running")
        done, _, _ = self.resume(run_id)
        self.finished(done)
        self.assertEqual(self.calls(), ONCE)

    def test_killed_before_the_move_of_the_slot_rows(self):
        run_id = self.kill("replace_before", "slots.json", 1)
        self.assertTrue(os.path.exists(self.staged(run_id, "slots.json.tmp")))
        self.assertFalse(os.path.exists(self.staged(run_id, "slots.json")))
        done, transport, _ = self.resume(run_id)
        self.finished(done)
        self.assertEqual((transport.requests, self.calls()), ([], ONCE))
        self.assertEqual(len(self.rows(done)), 2)


class Killed(BaseException):
    """Stands in for a kill where nothing in the harness catches it."""


class FinalisationRestartTests(cases.PassCase):
    """Finding 5. A full run that was stopped while it was being finalised,
    or whose scoring failed, is finished by `--resume` with nothing sent.

    `record.finalise` and what follows it run outside every handler of the
    runner, so raising a private BaseException there leaves the disk exactly
    as a kill would. One test uses a real kill as well."""

    SCORES = staticmethod(lambda rows, tasks: {"day_to_day": 50})

    def killed_in_finalise(self, patch):
        transport = self.fine()
        with patch:
            with self.assertRaises(Killed):
                self.run_stage(transport=transport, scores=self.SCORES)
        self.assertEqual(len(transport.requests), 6)
        names = self.staged() + [name for name in os.listdir(os.path.join(self.store, "runs"))
                                 if name != "_staging"]
        (run_id,) = names
        return run_id

    def resumed(self, run_id):
        transport = self.fine()
        printed = []

        def never(rows, tasks):
            raise AssertionError("a sealed run is not scored again")
        with mock.patch.object(ledger, "ProviderLedger") as books:
            done = self.run_stage(transport=transport, resume=run_id, scores=never,
                                  out=printed.append)
        self.assertFalse(books.called)                            # no ledger is touched
        self.assertEqual(transport.requests, [])
        self.assertEqual((done["status"], done["run_id"], done["resumed"]),
                         ("finalised", run_id, True))
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        self.assertEqual(self.staged(), [])
        records.verify_manifest(done["dir"])
        self.assertTrue(os.path.isfile(done["finalised"]["public_path"]))
        with open(os.path.join(done["dir"], "scores.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream), {"day_to_day": 50})
        self.assertEqual(done["finalised"]["public_record"]["scores"], {"day_to_day": 50})
        self.assertEqual(done["finalised"]["public_record"]["manifest_sha256"],
                         done["finalised"]["manifest_sha256"])
        return done, printed

    def test_resume_finishes_a_run_stopped_at_each_step_of_finalising(self):
        real_write = records.atomic_write

        def no_manifest(path, data):
            if os.path.basename(path) == "manifest.json":
                raise Killed()
            return real_write(path, data)
        cases_ = (
            ("after the seal, before the manifest",
             lambda: mock.patch.object(records, "atomic_write", no_manifest)),
            ("after the manifest, before the rename",
             lambda: mock.patch.object(records.os, "rename", side_effect=Killed())),
            ("after the rename, before the public record",
             lambda: mock.patch.object(records, "build_public_record", side_effect=Killed())),
        )
        for name, patch in cases_:
            with self.subTest(name):
                self.setUp()
                run_id = self.killed_in_finalise(patch())
                done, printed = self.resumed(run_id)
                self.assertFalse(done["already_finalised"])
                self.assertTrue(any("was stopped while it was being finalised" in line
                                    for line in printed))
                # Once more: already finalised, nothing changes.
                everything = support.read_everything(self.store)
                again, printed = self.resumed(run_id)
                self.assertTrue(again["already_finalised"])
                self.assertTrue(any("is already finalised" in line for line in printed))
                self.assertEqual(support.read_everything(self.store), everything)
                self.doCleanups()

    def test_a_sealed_run_is_only_finished_as_the_same_run(self):
        run_id = self.killed_in_finalise(
            mock.patch.object(records.os, "rename", side_effect=Killed()))
        other = support.config.validate(support.config_dict(
            models=[support.spec_dict("openai", "m-oa", "4", "30")]))
        for kwargs, fragment in (
                (dict(cfg=other), "the run config has changed"),
                (dict(tasks=[support.task("t1"), support.task("t2", prompt="Another prompt")]),
                 "the task set has changed"),
                (dict(stage="canary"), "it is a full run")):
            transport = self.fine()
            with self.assertRaises(records.RecordError) as caught:
                self.run_stage(transport=transport, resume=run_id, **kwargs)
            self.assertIn(fragment, str(caught.exception))
            self.assertEqual(transport.requests, [])
        self.assertEqual(self.staged(), [run_id])                 # nothing was moved
        self.resumed(run_id)

    def test_a_run_whose_scoring_failed_is_complete_and_is_scored_on_resume(self):
        def broken(rows, tasks):
            raise RuntimeError("the scorer is not available")
        first = self.fine()
        with self.assertRaises(RuntimeError):
            self.run_stage(transport=first, scores=broken)
        self.assertEqual(len(first.requests), 6)
        (run_id,) = self.staged()
        self.assertEqual(records.read_staged(self.store, run_id)["status"], "complete")
        # Still broken: nothing is sent, and the run stays complete in staging.
        again = self.fine()
        with self.assertRaises(RuntimeError):
            self.run_stage(transport=again, scores=broken, resume=run_id)
        self.assertEqual(again.requests, [])
        self.assertEqual(records.read_staged(self.store, run_id)["status"], "complete")
        # The scorer works: the run is scored and finalised with nothing sent.
        scored = []
        second = self.fine()
        done = self.run_stage(transport=second, resume=run_id,
                              scores=lambda rows, tasks: scored.append(len(rows)) or {"s": 1})
        self.assertEqual((done["status"], second.requests, scored), ("finalised", [], [6]))
        self.assertEqual(done["pass_gates"], [])
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        records.verify_manifest(done["dir"])
        sent = self.sent(done)
        self.assertEqual((len(sent), len(set(sent))), (6, 6))

    def test_the_command_line_finishes_a_sealed_run(self):
        run_id = self.killed_in_finalise(
            mock.patch.object(records, "build_public_record", side_effect=Killed()))
        summary = {}
        real = runner.run_stage

        def run_stage(stage, config, tasks, **kwargs):
            kwargs.update(grade=cases.answered, scores=self.SCORES)
            summary.update(real(stage, self.cfg, self.tasks, **kwargs))
            return summary
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        cfg_path = os.path.join(folder.name, "cfg.json")
        tasks_path = os.path.join(folder.name, "tasks.json")
        with open(cfg_path, "w", encoding="utf-8") as stream:
            json.dump(support.config_dict(
                models=[support.spec_dict("openai", "m-oa", "3", "30")]), stream)
        with open(tasks_path, "w", encoding="utf-8") as stream:
            json.dump(self.tasks, stream)
        lines = []
        with mock.patch.object(runner, "run_stage", run_stage), \
                mock.patch.dict(sys.modules, cases.ABSENT):
            code = cli.main(["dry-run", "--config", cfg_path, "--public-tasks", tasks_path,
                             "--private-store", self.store, "--resume", run_id],
                            out=lines.append)
        text = "\n".join(lines)
        self.assertEqual(code, cli.EXIT_OK, text)
        self.assertIn("status finalised", text)
        self.assertIn("was stopped while it was being finalised", text)
        self.assertNotIn("committed by this run", text)           # no ledger was read
        self.assertTrue(os.path.isfile(summary["finalised"]["public_path"]))


class FinalisationRealKillTests(KillCase):
    def test_a_real_kill_before_the_rename_is_finished_on_resume(self):
        run_id = self.kill("before_rename")
        self.assertTrue(records.is_sealed(self.store, run_id))
        self.assertTrue(os.path.isfile(self.staged(run_id, "manifest.json")))
        with open(self.staged(run_id, "manifest.json"), "rb") as stream:
            manifest = stream.read()
        done, transport, _ = self.resume(run_id)
        self.finished(done)
        self.assertEqual((transport.requests, self.calls()), ([], ONCE))
        # The manifest written before the kill is the one that stands.
        with open(os.path.join(done["dir"], "manifest.json"), "rb") as stream:
            self.assertEqual(stream.read(), manifest)
        self.assertEqual(done["finalised"]["manifest_sha256"],
                         hashlib.sha256(manifest).hexdigest())


class ReconcileCommandTests(unittest.TestCase):
    """The `reconcile` command: one request, one ledger, no config, no key."""

    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.store = os.path.join(folder.name, "store")
        os.mkdir(self.store)
        self.live_path = os.path.join(self.store, "ledgers", "openai.jsonl")
        self.dry_path = os.path.join(self.store, "ledgers-dry", "run-1", "anthropic.jsonl")
        live = ledger.ProviderLedger("openai", "5", self.live_path)
        live.reserve("run-9/m/t/1/1", Decimal("0.25"))
        live.reserve("run-9/m/t/1/2", Decimal("0.25"))
        dry = ledger.ProviderLedger("anthropic", "5", self.dry_path)
        dry.reserve("run-1/m/t/1/1", Decimal("0.40"))

    def main(self, *argv):
        lines = []
        code = cli.main(["reconcile", "--private-store", self.store] + list(argv),
                        out=lines.append)
        return code, "\n".join(lines)

    def events(self, path):
        with open(path, encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def test_the_console_figure_is_written_to_the_live_ledger(self):
        with mock.patch.object(config_module, "load_config",
                               side_effect=AssertionError("no config is read")), \
                mock.patch.object(keys, "load_keys",
                                  side_effect=AssertionError("no key file is read")):
            code, text = self.main("--provider", "openai", "--request-id", "run-9/m/t/1/1",
                                   "--usd", "0.0123", "--note", "console, 15 November")
        self.assertEqual(code, cli.EXIT_OK, text)
        last = self.events(self.live_path)[-1]
        self.assertEqual((last["event"], last["request_id"], last["usd"], last["note"],
                          last["flags"], last["reconciled"]),
                         ("reconcile", "run-9/m/t/1/1", "0.0123", "console, 15 November",
                          ["reconciled_by_hand"], True))
        self.assertEqual(len(self.events(self.live_path)), 3)
        for fragment in ("Reconciled request run-9/m/t/1/1 in the openai ledger.",
                         "charge written: 0.0123 USD", "reserved: 0.25 USD",
                         "before this it was an open reservation",
                         "note: console, 15 November"):
            self.assertIn(fragment, text)
        # The real ledger, under its cap, sees it: 0.0123 spent, 0.25 held.
        book = ledger.ProviderLedger("openai", "5", self.live_path)
        self.assertEqual((book.spent, book.reserved), (Decimal("0.0123"), Decimal("0.25")))
        # The store's execution lock was let go.
        self.assertIsNone(ledger.store_owner(self.store))

    def test_at_reserved_maximum_charges_the_request_its_own_reservation(self):
        code, text = self.main("--provider", "anthropic", "--request-id", "run-1/m/t/1/1",
                               "--at-reserved-maximum", "--note", "not in the console yet",
                               "--dry-ledger", "run-1")
        self.assertEqual(code, cli.EXIT_OK, text)
        last = self.events(self.dry_path)[-1]
        self.assertEqual((last["event"], last["usd"]), ("reconcile", "0.40"))
        self.assertIn("charge written: 0.40 USD (its reserved maximum)", text)
        self.assertIn("in the anthropic ledger of dry run run-1.", text)
        self.assertEqual(len(self.events(self.live_path)), 2)     # the live ledger is untouched
        # A second figure replaces the first, and the output says what stood.
        code, text = self.main("--provider", "anthropic", "--request-id", "run-1/m/t/1/1",
                               "--usd", "0.02", "--note", "console figure",
                               "--dry-ledger", "run-1")
        self.assertEqual(code, cli.EXIT_OK, text)
        self.assertIn("before this it was a charge of 0.40 USD", text)
        book = ledger.ProviderLedger("anthropic", "5", self.dry_path)
        self.assertEqual(book.entries["run-1/m/t/1/1"]["charge"], Decimal("0.02"))

    def test_refusals_write_nothing(self):
        before = support.read_everything(self.store)
        cases_ = (
            (["--provider", "openai", "--request-id", "run-9/m/t/1/7", "--usd", "0.01",
              "--note", "n"], "holds no reservation for request run-9/m/t/1/7"),
            # The dry ledger's id is not in the live ledger.
            (["--provider", "anthropic", "--request-id", "run-1/m/t/1/1", "--usd", "0.01",
              "--note", "n"], "there is no ledger for anthropic"),
            (["--provider", "openai", "--request-id", "run-9/m/t/1/1", "--usd", "0.01",
              "--note", "n", "--dry-ledger", "run-2"], "there is no ledger for openai"),
            (["--provider", "openai", "--request-id", "run-9/m/t/1/1", "--usd", "0.01",
              "--note", "n", "--dry-ledger", os.path.join("..", "ledgers")],
             "--dry-ledger takes a run id, not a path"),
        )
        for argv, fragment in cases_:
            code, text = self.main(*argv)
            self.assertEqual(code, cli.EXIT_REFUSED, text)
            self.assertTrue(text.startswith("REFUSED: "), text)
            self.assertIn(fragment, text)
        self.assertEqual(support.read_everything(self.store).replace("execution.lock\n\n", ""),
                         before.replace("execution.lock\n\n", ""))
        # No store at that place: nothing is made there.
        missing = os.path.join(os.path.dirname(self.store), "nowhere")
        lines = []
        code = cli.main(["reconcile", "--private-store", missing, "--provider", "openai",
                         "--request-id", "x", "--usd", "0", "--note", "n"], out=lines.append)
        self.assertEqual((code, os.path.exists(missing)), (cli.EXIT_REFUSED, False))

    def test_the_command_needs_one_amount_a_note_and_a_known_provider(self):
        common = ["--provider", "openai", "--request-id", "run-9/m/t/1/1"]
        for argv in (common + ["--note", "n"],
                     common + ["--note", "n", "--usd", "0.01", "--at-reserved-maximum"],
                     common + ["--usd", "0.01"],
                     common + ["--usd", "-1", "--note", "n"],
                     common + ["--usd", "lots", "--note", "n"],
                     ["--provider", "other", "--request-id", "x", "--usd", "0", "--note", "n"]):
            with mock.patch("sys.stderr"):
                with self.assertRaises(SystemExit) as caught:
                    self.main(*argv)
            self.assertNotEqual(caught.exception.code, 0)
        self.assertEqual(len(self.events(self.live_path)), 2)

    def test_it_is_refused_while_a_run_holds_the_store_or_a_key_is_in_the_environment(self):
        argv = ["--provider", "openai", "--request-id", "run-9/m/t/1/1", "--usd", "0.01",
                "--note", "n"]
        lock = ledger.StoreLock(self.store).acquire("run-held")
        try:
            code, text = self.main(*argv)
        finally:
            lock.release()
        self.assertEqual(code, cli.EXIT_REFUSED)
        self.assertIn("the private store is in use by another run", text)
        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": support.FAKE_OPENAI_KEY}):
            code, text = self.main(*argv)
        self.assertEqual(code, cli.EXIT_REFUSED)
        self.assertNotIn(support.FAKE_OPENAI_KEY, text)
        self.assertEqual(len(self.events(self.live_path)), 2)
        code, text = self.main(*argv)
        self.assertEqual(code, cli.EXIT_OK, text)


if __name__ == "__main__":
    unittest.main()
