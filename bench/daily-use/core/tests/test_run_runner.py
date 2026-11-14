"""The runner: slot and request rules, judging, the live gate, dry runs.

Every transport here is a fake. The live-gate tests switch `LIVE_ENABLED`
on inside the test only, and still use a fake transport and a fake key file.
"""

import glob
import io
import json
import os
import sys
import tempfile
import types
import unittest
from decimal import Decimal
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cli  # noqa: E402
import judges  # noqa: E402
import keys  # noqa: E402
import preflight  # noqa: E402
import providers  # noqa: E402
import records  # noqa: E402
import runner  # noqa: E402
import test_run_support as support  # noqa: E402
from test_run_support import ScriptedTransport, http, prompt_of, reply_body  # noqa: E402

QUIET = lambda line: None  # noqa: E731
NO_SCORES = lambda rows, tasks: None  # noqa: E731
# The other bench modules, as absent as they are on this branch: the tests
# below behave the same before and after those modules are merged.
ABSENT = {"core.outcome": None, "core.graders": None, "core.scores": None, "core.tasks": None}


def answered(task, reply, judged=None):
    """A grade function with no judging: every reply is a right answer."""
    return {"outcome": "answered", "pass": True, "pending": False, "needs_judge": []}


def is_judge_prompt(prompt):
    return prompt.startswith(judges.CHECKLIST_PROMPT[:60]) or \
        prompt.startswith(judges.OUTCOME_PROMPT[:60])


def model_only(step_for_model, judge_text=None):
    """A transport: `step_for_model(request, n)` handles model requests (n counts
    them from 1); judge requests get the stub's verdicts or `judge_text`."""
    counter = {"n": 0}

    def transport(request):
        prompt = prompt_of(request)
        if is_judge_prompt(prompt):
            text = judge_text(request, prompt) if judge_text else runner.stub_reply(
                request.provider, request.body["model"], prompt)
            if isinstance(text, BaseException):
                raise text
            return reply_body(request, text)
        counter["n"] += 1
        step = step_for_model(request, counter["n"])
        if isinstance(step, BaseException):
            raise step
        return step
    return ScriptedTransport(default=transport)


class RunnerCase(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.store = folder.name
        self.tasks = [support.task("t1"), support.task("t2")]
        self.cfg = support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")])

    def run_stage(self, stage="full", transport=None, grade=answered, cfg=None, tasks=None,
                  **kwargs):
        kwargs.setdefault("out", QUIET)
        kwargs.setdefault("seed", 11)
        kwargs.setdefault("scores", NO_SCORES)
        return runner.run_stage(stage, cfg or self.cfg, tasks or self.tasks,
                                private_store=self.store, grade=grade, transport=transport,
                                **kwargs)

    def rows(self, summary):
        name = "slots.json"
        path = os.path.join(summary["dir"], name)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as stream:
                return json.load(stream)
        rows = {}
        for line in self.log(summary):
            if line["event"] == "slot":
                rows[line["slot"]["slot_id"]] = line["slot"]
        return list(rows.values())

    def log(self, summary):
        with open(os.path.join(summary["dir"], "requests.jsonl"), encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]


class SlotAndRequestTests(RunnerCase):
    def test_three_slots_per_model_per_task_each_a_fresh_conversation(self):
        transport = model_only(lambda request, n: reply_body(request, "answer %d" % n))
        cfg = support.make_config()                         # two models
        summary = self.run_stage(transport=transport, cfg=cfg)
        rows = self.rows(summary)
        self.assertEqual(len(rows), 2 * 2 * 3)
        for model in ("m-oa", "m-an"):
            for task_id in ("t1", "t2"):
                repeats = sorted(r["repeat"] for r in rows
                                 if r["model_id"] == model and r["task_id"] == task_id)
                self.assertEqual(repeats, [1, 2, 3])
        self.assertEqual(len(transport.requests), 12)
        for request in transport.requests:
            # One request holds the whole conversation: the prompt and nothing else.
            if request.provider == "openai":
                self.assertIsInstance(request.body["input"], str)
                self.assertNotIn("instructions", request.body)
                self.assertNotIn("previous_response_id", request.body)
            else:
                self.assertEqual(len(request.body["messages"]), 1)
                self.assertNotIn("system", request.body)
            self.assertNotIn("tools", request.body)
            self.assertIn(request.body.get("max_output_tokens", request.body.get("max_tokens")),
                          (4096,))
        self.assertEqual(transport.max_in_flight, 1)
        self.assertEqual(summary["status"], "finalised")
        self.assertTrue(all(r["outcome"] == "answered" and r["pass"] is True for r in rows))
        self.assertEqual(sorted(len(r["requests"]) for r in rows), [1] * 12)

    def test_ids_follow_the_method(self):
        summary = self.run_stage(transport=model_only(lambda r, n: reply_body(r, "x")))
        run_id = summary["run_id"]
        self.assertRegex(run_id, r"^\d{4}-\d{2}-\d{2}T\d{6}Z-[0-9a-f]{8}$")
        for row in self.rows(summary):
            self.assertEqual(row["slot_id"], "%s/%s/%s/%d" % (
                run_id, row["model_id"], row["task_id"], row["repeat"]))
            self.assertEqual(row["requests"][0]["request_id"], row["slot_id"] + "/1")
        sent = [line["request_id"] for line in self.log(summary) if line["event"] == "sent"]
        self.assertEqual(len(sent), len(set(sent)))

    def test_transport_error_is_retried_and_then_succeeds(self):
        def step(request, n):
            return http(429) if n == 1 else reply_body(request, "fine")
        waits = []
        summary = self.run_stage(transport=model_only(step), sleep=waits.append)
        rows = self.rows(summary)
        first = [r for r in rows if len(r["requests"]) == 2]
        self.assertEqual(len(first), 1)
        self.assertEqual([q["status"] for q in first[0]["requests"]], ["transport_error", "ok"])
        self.assertEqual([q["request_id"][-2:] for q in first[0]["requests"]], ["/1", "/2"])
        self.assertEqual((first[0]["outcome"], first[0]["pass"]), ("answered", True))
        self.assertEqual(first[0]["reply"], "fine")
        self.assertEqual(waits, [2])

    def test_exhausted_slot_stays_failed_and_is_never_replaced(self):
        def step(request, n):
            return http(503) if n <= 3 else reply_body(request, "fine")
        transport = model_only(step)
        summary = self.run_stage(transport=transport)
        rows = self.rows(summary)
        failed = [r for r in rows if r["outcome"] == "execution_error"]
        self.assertEqual(len(failed), 1)
        self.assertEqual(len(failed[0]["requests"]), 3)
        self.assertIs(failed[0]["pass"], False)
        self.assertFalse(failed[0]["pending"])
        self.assertEqual(failed[0]["failure_reason"], "HTTP 503")
        self.assertEqual(failed[0]["failure_class"], "transport_error")
        self.assertIsNone(failed[0]["reply"])
        # 6 slots: 3 requests for the failed one, 1 each for the other 5. No fourth
        # request and no replacement slot.
        self.assertEqual(len(transport.requests), 8)
        self.assertEqual(len(rows), 6)
        self.assertEqual(summary["status"], "finalised")

    def test_timeout_is_not_retried(self):
        def step(request, n):
            return providers.TransportTimeout() if n == 1 else reply_body(request, "fine")
        transport = model_only(step)
        rows = self.rows(self.run_stage(transport=transport))
        failed = [r for r in rows if r["outcome"] == "execution_error"]
        self.assertEqual(len(failed), 1)
        self.assertEqual(len(failed[0]["requests"]), 1)
        self.assertEqual(failed[0]["failure_class"], "timeout")
        # A timed-out request may have been billed: it keeps its full reservation.
        self.assertIn("charged_at_reserved_maximum", failed[0]["requests"][0]["ledger_flags"])
        self.assertGreater(Decimal(failed[0]["cost_usd"]), Decimal("0.12"))
        self.assertEqual(len(transport.requests), 6)

    def test_provider_error_is_not_retried(self):
        def step(request, n):
            return http(400, {"error": {"type": "invalid_request_error"}}) if n == 1 \
                else reply_body(request, "fine")
        rows = self.rows(self.run_stage(transport=model_only(step)))
        failed = [r for r in rows if r["outcome"] == "execution_error"]
        self.assertEqual(len(failed), 1)
        self.assertEqual(len(failed[0]["requests"]), 1)
        self.assertEqual(failed[0]["failure_reason"], "HTTP 400 invalid_request_error")
        self.assertEqual(failed[0]["cost_usd_exact"], "0")
        self.assertEqual(failed[0]["cost_usd"], 0.0)

    def test_truncated_answer_is_kept_flagged_and_graded(self):
        graded = []

        def grade(task, reply, judged=None):
            graded.append(reply)
            return {"outcome": "answered", "pass": False, "pending": False, "needs_judge": []}

        def step(request, n):
            return support.ok(support.openai_body("Cut off mid", status="incomplete",
                                                  reason="max_output_tokens"))
        rows = self.rows(self.run_stage(transport=model_only(step), grade=grade))
        self.assertEqual(graded, ["Cut off mid"] * 6)
        for row in rows:
            self.assertTrue(row["truncated"])
            self.assertIn("truncated", row["flags"])
            self.assertEqual(row["reply"], "Cut off mid")
            self.assertEqual(row["finish_reason"], "incomplete:max_output_tokens")
            self.assertEqual((row["outcome"], row["pass"]), ("answered", False))

    def test_task_order_is_shuffled_with_a_recorded_seed(self):
        tasks = [support.task("t%02d" % n) for n in range(12)]

        def order(seed):
            summary = self.run_stage(tasks=tasks, seed=seed,
                                     transport=model_only(lambda r, n: reply_body(r, "x")))
            with open(os.path.join(summary["dir"], "plan.json"), encoding="utf-8") as stream:
                plan = json.load(stream)
            with open(os.path.join(summary["dir"], "run.json"), encoding="utf-8") as stream:
                self.assertEqual(json.load(stream)["seed"], seed)
            self.assertEqual(summary["seed"], seed)
            return [slot["task_id"] for slot in plan if slot["repeat"] == 1]

        first, again, other = order(5), order(5), order(6)
        self.assertEqual(first, again)
        self.assertNotEqual(first, other)
        self.assertNotEqual(first, sorted(first))
        self.assertEqual(sorted(first), sorted(t["id"] for t in tasks))
        self.assertIsInstance(self.run_stage(
            seed=None, transport=model_only(lambda r, n: reply_body(r, "x")))["seed"], int)

    def test_reservation_and_record_are_on_disk_before_each_request_is_sent(self):
        seen = []

        def step(request, n):
            ledger_files = glob.glob(os.path.join(self.store, "ledgers-dry", "*", "openai.jsonl"))
            with open(ledger_files[0], encoding="utf-8") as stream:
                reserves = [json.loads(line) for line in stream]
            logs = glob.glob(os.path.join(self.store, "runs", "_staging", "*", "requests.jsonl"))
            with open(logs[0], encoding="utf-8") as stream:
                lines = [json.loads(line) for line in stream]
            sent = [line for line in lines if line["event"] == "sent"]
            done = [line for line in lines if line["event"] == "done"]
            seen.append((len([e for e in reserves if e["event"] == "reserve"]), len(sent),
                         len(done), sent[-1]["request_id"] == reserves[-1]["request_id"],
                         sent[-1]["reserved_usd"] == reserves[-1]["usd"]))
            return reply_body(request, "x")
        self.run_stage(transport=model_only(step))
        self.assertEqual(seen, [(n, n, n - 1, True, True) for n in range(1, 7)])

    def test_charges_are_reconciled_to_usage(self):
        def step(request, n):
            return support.ok(support.openai_body("x", input_tokens=1000, output_tokens=500))
        summary = self.run_stage(transport=model_only(step))
        for row in self.rows(summary):
            # 1000 x 3 + 500 x 30 = 18000 per million
            self.assertEqual(Decimal(row["cost_usd_exact"]), Decimal("0.018"))
            self.assertEqual(row["cost_usd"], 0.018)
            self.assertEqual(row["tokens"]["output_tokens"], 500)
        self.assertEqual(summary["run_committed_usd"], Decimal("0.108"))
        self.assertEqual(summary["remaining_caps"]["openai"], Decimal("50") - Decimal("0.108"))

    def test_run_is_interrupted_by_the_cap_and_lists_unstarted_slots(self):
        plan = preflight.preflight(self.cfg, self.tasks, {"openai": 50, "anthropic": 50},
                                   stage="full", checklist_samples=[], outcome_samples=[],
                                   out=None)
        bound = plan["plan_still_to_run"]["openai"]["planning_bound"]
        raw = support.config_dict(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                  caps_usd={"openai": str(bound), "anthropic": "50"})
        cfg = support.config.validate(raw)
        # The cap is exactly the planning bound, which has room for 9 requests held
        # at their reserved maximum. Request 2 succeeds; every other request fails to
        # connect and keeps its full reservation: far above the 15% retry allowance.
        # Slot 1: fail, success. Slots 2 and 3: three failures each. Slot 4: two
        # failures, then its third request is refused by the cap.
        def step(request, n):
            return reply_body(request, "fine") if n == 2 else providers.TransportFailure("down")
        transport = model_only(step)
        summary = self.run_stage(transport=transport, cfg=cfg)
        self.assertEqual(summary["status"], "interrupted")
        self.assertFalse(summary["publishable"])
        self.assertIsNone(summary["finalised"])
        report = summary["report"]
        self.assertEqual(report["stopped_providers"], ["openai"])
        self.assertIn("interrupted by cap", report["interrupt_reason"])
        counts = report["models"]["m-oa"]
        self.assertEqual((counts["planned"], counts["attempted"], counts["unstarted"]), (6, 4, 2))
        self.assertEqual(len(counts["unstarted_slots"]), 2)
        self.assertEqual(len(transport.requests), 10)
        self.assertIn(os.path.join("runs", "_staging"), summary["dir"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", summary["run_id"])))
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))
        self.assertLessEqual(summary["run_committed_usd"], bound)
        rows = self.rows(summary)
        self.assertEqual([r["outcome"] for r in rows],
                         ["answered", "execution_error", "execution_error", "execution_error"])
        self.assertEqual([len(r["requests"]) for r in rows], [2, 3, 3, 2])
        self.assertIn("retry_refused_by_cap", rows[-1]["flags"])
        self.assertIs(rows[-1]["pass"], False)
        self.assertEqual(rows[-1]["slot_id"] in counts["unstarted_slots"], False)

    def test_preflight_refusal_stops_a_dry_run_before_any_request(self):
        raw = support.config_dict(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                  caps_usd={"openai": "0.01", "anthropic": "50"})
        transport = model_only(lambda r, n: reply_body(r, "x"))
        with self.assertRaises(preflight.PreflightRefused):
            self.run_stage(transport=transport, cfg=support.config.validate(raw))
        self.assertEqual(transport.requests, [])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs")))


class JudgingTests(RunnerCase):
    def setUp(self):
        super().setUp()
        self.tasks = [support.task("t1", family=4, checks=2),
                      support.task("t2", family=2, answerable=False)]

    @staticmethod
    def grade(task, reply, judged=None):
        ids = [c["id"] for c in judges.judged_checks(task)]
        if judged is None:
            if ids:
                return {"outcome": "answered", "pass": None, "pending": True,
                        "needs_judge": ids, "script_pass": True}
            return {"outcome": None, "pass": None, "pending": True, "needs_judge": ["outcome"]}
        return runner.fallback_resolve(
            task, {"outcome": "answered", "script_pass": True, "pass_if_answered": True}, judged)

    def judge_text(self, checklist=None, outcome=None):
        def text(request, prompt):
            judge = request.body["model"]
            if prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
                value = (checklist or {}).get(judge, {"c1": True, "c2": True})
                if not isinstance(value, dict):
                    return value
                return json.dumps({"checks": {k: {"pass": v, "reason": "r"}
                                              for k, v in value.items()}})
            value = (outcome or {}).get(judge, "abstained")
            if value in judges.JUDGE_OUTCOMES:
                return json.dumps({"outcome": value, "reason": "r"})
            return value
        return text

    def run_judged(self, **verdicts):
        transport = model_only(lambda r, n: reply_body(r, "an answer"),
                               judge_text=self.judge_text(**verdicts))
        summary = self.run_stage(transport=transport, grade=self.grade)
        rows = self.rows(summary)
        return summary, rows, transport

    def test_both_judges_pass_every_check(self):
        summary, rows, transport = self.run_judged()
        self.assertEqual(summary["status"], "finalised")
        for row in rows:
            if row["task_id"] == "t1":
                self.assertEqual(row["judged"]["checks"], {"c1": "pass", "c2": "pass"})
                self.assertEqual((row["outcome"], row["pass"]), ("answered", True))
                self.assertFalse(row["needed_judge_classification"])
                # One call per judge per answer.
                self.assertEqual(len(row["judge_requests"]), 2)
            else:
                # Unanswerable task, both judges say abstained: that is a pass.
                self.assertEqual((row["outcome"], row["pass"]), ("abstained", True))
                self.assertTrue(row["needed_judge_classification"])
                self.assertEqual(len(row["judge_requests"]), 2)
            self.assertGreater(Decimal(row["judge_cost_usd"]), 0)
        # 6 model requests + 6 slots x 2 judges.
        self.assertEqual(len(transport.requests), 18)
        judge_ids = [q["request_id"] for row in rows for q in row["judge_requests"]]
        self.assertTrue(all("/judge/j-" in i for i in judge_ids))
        self.assertEqual(len(judge_ids), len(set(judge_ids)))

    def test_the_judge_sees_the_prompt_and_answer_but_not_the_key(self):
        self.tasks[0]["expected"] = "THE-ANSWER-KEY-VALUE"
        _, _, transport = self.run_judged()
        judge_prompts = [prompt_of(r) for r in transport.requests if is_judge_prompt(prompt_of(r))]
        self.assertTrue(judge_prompts)
        for prompt in judge_prompts:
            self.assertIn("an answer", prompt)
            self.assertNotIn("THE-ANSWER-KEY-VALUE", prompt)
        self.assertTrue(any(self.tasks[0]["prompt"] in p for p in judge_prompts))

    def test_judge_calls_use_both_providers_and_both_ledgers(self):
        summary, rows, transport = self.run_judged()
        providers_used = {r.provider for r in transport.requests
                          if is_judge_prompt(prompt_of(r))}
        self.assertEqual(providers_used, {"openai", "anthropic"})
        self.assertLess(summary["remaining_caps"]["anthropic"], Decimal("50"))

    def test_disagreement_marks_the_check_disputed_and_fails_the_slot(self):
        summary, rows, _ = self.run_judged(checklist={"j-an": {"c1": True, "c2": False}})
        for row in (r for r in rows if r["task_id"] == "t1"):
            self.assertEqual(row["judged"]["checks"], {"c1": "pass", "c2": "disputed"})
            self.assertEqual((row["outcome"], row["pass"], row["pending"]),
                             ("answered", False, False))
        self.assertEqual(summary["status"], "finalised")

    def test_outcome_disagreement_is_answered_which_fails_an_unanswerable_task(self):
        _, rows, _ = self.run_judged(outcome={"j-oa": "abstained", "j-an": "refused"})
        for row in (r for r in rows if r["task_id"] == "t2"):
            self.assertEqual((row["outcome"], row["pass"]), ("answered", False))

    def test_malformed_verdict_is_retried_once_then_resolves(self):
        attempts = {"n": 0}

        def text(request, prompt):
            if request.body["model"] == "j-oa" and \
                    prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
                attempts["n"] += 1
                if attempts["n"] % 2 == 1:
                    return "```json not strict```"
            return runner.stub_reply(request.provider, request.body["model"], prompt)
        transport = model_only(lambda r, n: reply_body(r, "an answer"), judge_text=text)
        summary = self.run_stage(transport=transport, grade=self.grade,
                                 tasks=[support.task("t1", family=4, checks=2),
                                        support.task("t2")])
        self.assertEqual(summary["status"], "finalised")
        for row in (r for r in self.rows(summary) if r["task_id"] == "t1"):
            self.assertEqual(len(row["judge_requests"]), 3)       # j-oa twice, j-an once
            self.assertEqual(row["judged"]["checks"], {"c1": "pass", "c2": "pass"})
            ids = [q["request_id"] for q in row["judge_requests"]]
            self.assertTrue(ids[0].endswith("/judge/j-oa/checklist_judging/1"))
            self.assertTrue(ids[1].endswith("/judge/j-oa/checklist_judging/2"))

    def test_unresolved_judge_leaves_the_slot_pending_and_the_run_unfinalised(self):
        summary, rows, _ = self.run_judged(checklist={"j-oa": "never valid"})
        self.assertEqual(summary["status"], "pending_judging")
        self.assertFalse(summary["publishable"])
        self.assertIsNone(summary["finalised"])
        self.assertIn(os.path.join("runs", "_staging"), summary["dir"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", summary["run_id"])))
        for row in (r for r in rows if r["task_id"] == "t1"):
            self.assertEqual(row["judged"]["checks"],
                             {"c1": "judge_unresolved", "c2": "judge_unresolved"})
            self.assertIsNone(row["pass"])
            self.assertTrue(row["pending"])
            # The model's own outcome is not turned into a failure by the judge's failure.
            self.assertEqual(row["outcome"], "answered")
            self.assertEqual(len(row["judge_requests"]), 3)       # j-oa first + one retry, j-an
        self.assertEqual(summary["report"]["models"]["m-oa"]["pending"], 3)

    def test_judge_timeout_is_retried_once(self):
        calls = {"n": 0}

        def text(request, prompt):
            if request.body["model"] == "j-an":
                calls["n"] += 1
                if calls["n"] == 1:
                    return providers.TransportTimeout()
            return runner.stub_reply(request.provider, request.body["model"], prompt)
        transport = model_only(lambda r, n: reply_body(r, "an answer"), judge_text=text)
        summary = self.run_stage(transport=transport, grade=self.grade,
                                 tasks=[support.task("t1", family=4, checks=1),
                                        support.task("t2")])
        self.assertEqual(summary["status"], "finalised")
        retried = [r for r in self.rows(summary) if len(r["judge_requests"]) == 3]
        self.assertEqual(len(retried), 1)
        self.assertEqual([q["status"] for q in retried[0]["judge_requests"]],
                         ["ok", "timeout", "ok"])

    def test_grader_that_takes_judged_gets_the_last_word(self):
        seen = []

        def grade(task, reply, judged=None):
            if judged is None:
                return {"outcome": "answered", "pass": None, "pending": True,
                        "needs_judge": ["c1"]}
            seen.append(judged["checks"])
            return {"outcome": "answered", "pass": True, "pending": False}
        tasks = [support.task("t1", family=4, checks=1), support.task("t2", family=4, checks=1)]
        summary = self.run_stage(transport=model_only(lambda r, n: reply_body(r, "x")),
                                 grade=grade, tasks=tasks)
        self.assertEqual(seen, [{"c1": "pass"}] * 6)
        self.assertEqual(summary["status"], "finalised")

    def test_fallback_resolution_rules(self):
        task = {"answerable": True}
        resolve = runner.fallback_resolve
        base = {"outcome": "answered", "script_pass": True}
        self.assertEqual(resolve(task, base, {"outcome": None, "checks": {"c1": "pass"}}),
                         {"outcome": "answered", "pass": True, "pending": False})
        self.assertEqual(resolve(task, base, {"outcome": None, "checks": {"c1": "fail"}})["pass"],
                         False)
        self.assertEqual(resolve(task, dict(base, script_pass=False),
                                 {"outcome": None, "checks": {"c1": "pass"}})["pass"], False)
        unresolved = resolve(task, base, {"outcome": "judge_unresolved", "checks": {}})
        self.assertEqual(unresolved, {"outcome": "judge_unresolved", "pass": None,
                                      "pending": True})
        self.assertEqual(resolve(task, base, {"outcome": "abstained", "checks": {}})["pass"], False)
        self.assertEqual(resolve(task, base, {"outcome": "refused", "checks": {}})["pass"], False)
        self.assertEqual(resolve({"answerable": False}, base,
                                 {"outcome": "refused", "checks": {}})["pass"], False)
        undecided = resolve(task, {"outcome": None}, {"outcome": "answered", "checks": {}})
        self.assertTrue(undecided["pending"])


class DryRunTests(RunnerCase):
    def setUp(self):
        super().setUp()
        self.cfg = support.make_config()
        self.tasks = [support.task("p1"), support.task("p2", family=4, checks=2),
                      support.task("h1", family=2, split="held-out",
                                   prompt="HELD-OUT PROMPT that must stay private")]

    def test_dry_run_end_to_end_with_stub_grading(self):
        lines = []
        scored = []

        def scores(rows, tasks):
            scored.append((len(rows), len(tasks)))
            return {"note": "injected"}
        summary = runner.run_stage("full", self.cfg, self.tasks, private_store=self.store,
                                   grade=runner.stub_grade, scores=scores, seed=3,
                                   key_file=os.path.join(self.store, "no-such-key-file.txt"),
                                   out=lines.append)
        self.assertEqual((summary["status"], summary["live"], summary["publishable"]),
                         ("finalised", False, False))
        self.assertEqual(scored, [(18, 3)])
        final = summary["finalised"]
        self.assertEqual(final["dir"], os.path.join(self.store, "runs", summary["run_id"]))
        records.verify_manifest(final["dir"])
        rows = self.rows(summary)
        self.assertEqual(len(rows), 2 * 3 * 3)
        self.assertTrue(all(r["outcome"] == "answered" and r["pass"] is True for r in rows))
        self.assertTrue(all(r["reply"].startswith("stub answer ") for r in rows))
        judged = [r for r in rows if r["task_id"] == "p2"]
        self.assertTrue(all(r["judged"]["checks"] == {"c1": "pass", "c2": "pass"} for r in judged))
        # The public record is built as a rehearsal and is marked not publishable.
        public = final["public_record"]
        self.assertFalse(public["publishable"])
        self.assertFalse(public["live"])
        self.assertEqual(public["scores"], {"note": "injected"})
        text = json.dumps(public)
        self.assertNotIn("HELD-OUT PROMPT", text)
        held = [s for s in public["models"]["m-oa"]["slots"] if s["task_id"] == "h1"]
        self.assertEqual(len(held), 3)
        self.assertEqual(sorted(held[0]), sorted(
            ["task_id", "family", "outcome", "pass", "tokens", "cost_usd", "timing"]))
        # The pre-flight was printed, and dry ledgers are kept apart from live ones.
        self.assertIn("Pre-flight for the whole plan (USD)", lines)
        self.assertTrue(os.path.isdir(os.path.join(self.store, "ledgers-dry", summary["run_id"])))
        self.assertFalse(os.path.exists(os.path.join(self.store, "ledgers")))
        self.assertFalse(os.path.exists(os.path.join(self.store, runner.STAGE_INDEX)))

    def test_canary_is_two_public_tasks_one_repeat_and_never_published(self):
        summary = self.run_stage(stage="canary", grade=runner.stub_grade, cfg=self.cfg)
        rows = self.rows(summary)
        self.assertEqual(len(rows), 2 * 2 * 1)
        self.assertEqual({r["task_id"] for r in rows}, {"p1", "p2"})
        self.assertEqual({r["repeat"] for r in rows}, {1})
        self.assertEqual({r["split"] for r in rows}, {"public"})
        self.assertEqual(summary["status"], "finalised")
        self.assertFalse(summary["publishable"])
        self.assertIsNone(summary["finalised"]["public_record"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))

    def test_replay_transport_plays_recorded_fixtures(self):
        import hashlib
        fixtures = []
        for model, provider in (("m-oa", "openai"), ("m-an", "anthropic")):
            for item in self.tasks[:2]:
                body = support.openai_body("recorded") if provider == "openai" \
                    else support.anthropic_body("recorded")
                fixtures.append({"model": model, "status": 200, "body": body,
                                 "prompt_sha256": hashlib.sha256(
                                     item["prompt"].encode("utf-8")).hexdigest()})
        tasks = [self.tasks[0], support.task("p2")]
        summary = self.run_stage(stage="canary", cfg=self.cfg, tasks=tasks,
                                 transport=runner.ReplayTransport(fixtures))
        self.assertTrue(all(r["reply"] == "recorded" for r in self.rows(summary)))
        with self.assertRaises(LookupError):
            self.run_stage(stage="canary", cfg=self.cfg,
                           tasks=[support.task("zz1"), support.task("zz2")],
                           transport=runner.ReplayTransport(fixtures))

    def qualification_samples(self):
        return support.qualification_samples("p2", "p1")

    def qualify(self, cfg=None, wrong=(), **kwargs):
        """A dry qualify stage. Candidates named in `wrong` say true to every
        check and "answered" to every reply; the others agree with the reference."""
        checklist, outcome = self.qualification_samples()
        asked = []

        def responder(provider, model_id, prompt):
            asked.append(model_id)
            if model_id in wrong:
                return runner.stub_reply(provider, model_id, prompt)
            return support.reference_verdict(prompt, outcome)
        summary = self.run_stage(stage="qualify", cfg=cfg or self.cfg,
                                 checklist_samples=checklist, outcome_samples=outcome,
                                 transport=runner.StubTransport(responder), **kwargs)
        return summary, asked

    def test_qualify_stage_fails_an_always_true_judge(self):
        checklist, outcome = self.qualification_samples()
        # The stub judge says true to every check and "answered" to every reply.
        summary = self.run_stage(stage="qualify", cfg=self.cfg, checklist_samples=checklist,
                                 outcome_samples=outcome)
        result = summary["qualification"]
        self.assertFalse(result["qualified"])
        self.assertIsNone(result["panel"])
        self.assertEqual(result["sample_set_problems"], [])
        for judge in ("j-oa", "j-an"):
            figures = result["candidates"][judge]["checklist"]
            self.assertEqual(figures["agreement"], 0.5)          # right on every true item
            self.assertEqual(figures["agreement_on_true"], 1.0)
            self.assertEqual(figures["agreement_on_false"], 0.0)  # and wrong on every false one
            self.assertFalse(figures["passed"])
            self.assertFalse(result["candidates"][judge]["qualified"])
            self.assertEqual(result["candidates"][judge]["requests"], 24)
        self.assertEqual(len(result["failures"]), 2)
        self.assertEqual(summary["status"], "finalised")
        self.assertFalse(summary["publishable"])
        self.assertTrue(os.path.isfile(os.path.join(summary["dir"], "qualification.json")))
        records.verify_manifest(summary["dir"])

    def test_qualify_stage_passes_judges_that_match_the_reference(self):
        summary, _ = self.qualify()
        result = summary["qualification"]
        self.assertTrue(result["qualified"])
        self.assertEqual([item["model_id"] for item in result["panel"]], ["j-oa", "j-an"])
        self.assertEqual(result["failures"], [])

    def test_qualify_needs_both_sample_files(self):
        with self.assertRaises(ValueError):
            self.run_stage(stage="qualify", cfg=self.cfg)

    def candidate_cfg(self, **over):
        over.setdefault("judge_candidates", support.candidates_dict())
        return support.make_config(**over)

    def test_every_candidate_is_qualified_by_itself_and_reported(self):
        summary, asked = self.qualify(cfg=self.candidate_cfg(), wrong={"j-oa-dear"})
        result = summary["qualification"]
        self.assertEqual(sorted(result["candidates"]),
                         ["j-an", "j-an-cheap", "j-oa", "j-oa-cheap", "j-oa-dear"])
        # 24 calls each (4 checklist samples + 20 outcome samples), cheapest first per side.
        self.assertEqual(asked, ["j-oa-cheap"] * 24 + ["j-oa"] * 24 + ["j-oa-dear"] * 24
                         + ["j-an-cheap"] * 24 + ["j-an"] * 24)
        good = result["candidates"]["j-oa-cheap"]
        self.assertEqual((good["checklist"]["agreement"], good["checklist"]["agreement_on_true"],
                          good["checklist"]["agreement_on_false"], good["outcome"]["agreement"]),
                         (1.0, 1.0, 1.0, 1.0))
        self.assertEqual((good["checklist"]["items"], good["checklist"]["reference_true_items"],
                          good["checklist"]["reference_false_items"],
                          good["outcome"]["samples"]), (8, 4, 4, 20))
        self.assertEqual(good["price_sum_per_mtok"], "3")
        self.assertTrue(good["qualified"])
        # One candidate failing does not touch the others.
        bad = result["candidates"]["j-oa-dear"]
        self.assertEqual(bad["checklist"]["agreement_on_false"], 0.0)
        self.assertEqual(bad["outcome"]["agreement"], 0.35)       # 7 of 20 are "answered"
        self.assertFalse(bad["qualified"])
        self.assertEqual(bad["requests"], 24)

    def test_the_panel_is_the_cheapest_passing_candidate_on_each_side(self):
        summary, _ = self.qualify(cfg=self.candidate_cfg())
        result = summary["qualification"]
        self.assertTrue(result["qualified"])
        self.assertEqual([(item["provider"], item["model_id"]) for item in result["panel"]],
                         [("openai", "j-oa-cheap"), ("anthropic", "j-an-cheap")])
        # The cheapest on one side fails: the next cheapest that passed is named.
        summary, _ = self.qualify(cfg=self.candidate_cfg(), wrong={"j-oa-cheap"})
        self.assertEqual([item["model_id"] for item in summary["qualification"]["panel"]],
                         ["j-oa", "j-an-cheap"])
        # The record carries the figures, the thresholds, the hashes and the panel.
        record = summary["qualification_record"]
        self.assertEqual(record["panel"], summary["qualification"]["panel"])
        self.assertEqual(record["thresholds"], {
            "checklist_overall": "0.90", "checklist_on_true": "0.85",
            "checklist_on_false": "0.85", "outcome": "0.90"})
        self.assertEqual([(c["model_id"], c["passed"]) for c in record["candidates"]], [
            ("j-oa-cheap", False), ("j-oa", True), ("j-oa-dear", True),
            ("j-an-cheap", True), ("j-an", True)])
        self.assertEqual(len(record["samples"]["checklist"]["sha256"]), 64)
        self.assertEqual((record["samples"]["checklist"]["samples"],
                          record["samples"]["outcome"]["samples"]), (4, 20))
        self.assertTrue(record["passed"])
        self.assertFalse(record["live"])

    def test_no_panel_when_no_candidate_passes_on_one_side(self):
        summary, asked = self.qualify(cfg=self.candidate_cfg(),
                                      wrong={"j-oa-cheap", "j-oa", "j-oa-dear"})
        result = summary["qualification"]
        self.assertFalse(result["qualified"])
        self.assertIsNone(result["panel"])                         # never half a panel
        self.assertEqual(len(result["failures"]), 1)
        self.assertIn("no judge candidate passed qualification on the openai side",
                      result["failures"][0])
        self.assertTrue(result["candidates"]["j-an-cheap"]["qualified"])
        self.assertEqual(len(asked), 120)                          # every candidate was still tried
        self.assertFalse(summary["qualification_record"]["passed"])
        self.assertIsNone(summary["qualification_record"]["panel"])

    def test_a_bad_sample_set_stops_the_stage_before_any_call(self):
        checklist, outcome = self.qualification_samples()
        transport = runner.StubTransport()
        summary = self.run_stage(stage="qualify", cfg=self.candidate_cfg(),
                                 checklist_samples=checklist[:3], outcome_samples=outcome,
                                 transport=transport)
        result = summary["qualification"]
        self.assertEqual(transport.calls, 0)
        self.assertFalse(result["qualified"])
        self.assertIsNone(result["panel"])
        self.assertEqual(result["sample_set_problems"], ["task p2 has fewer than 4 samples"])
        self.assertIn("no candidate was tried", result["failures"][0])

    def test_a_dry_qualification_writes_no_record_and_opens_nothing(self):
        summary, _ = self.qualify()
        self.assertTrue(summary["qualification"]["qualified"])
        self.assertIsNone(summary["qualification_record_path"])
        self.assertFalse(os.path.exists(os.path.join(self.store, runner.QUALIFICATION_DIR)))
        self.assertFalse(os.path.exists(os.path.join(self.store, runner.STAGE_INDEX)))
        record, problem = runner.check_qualification(self.cfg, self.store, {})
        self.assertIsNone(record)
        self.assertIn("no judge qualification is on record", problem)


class LiveGateTests(RunnerCase):
    def setUp(self):
        super().setUp()
        self.cfg = support.make_config()
        self.tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        self.checklist, self.outcome = support.qualification_samples()
        key_folder = tempfile.TemporaryDirectory()
        self.addCleanup(key_folder.cleanup)
        self.key_file = support.write_key_file(key_folder.name)
        self.wrong_judges = set()
        self.transport = self.new_transport("live-shaped answer")
        self.factory_calls = []

    def judge_text(self, request, prompt):
        """Judges agree with the reference, except those in `wrong_judges`,
        which say true to every check and "answered" to every reply."""
        if request.body["model"] in self.wrong_judges:
            return runner.stub_reply(request.provider, request.body["model"], prompt)
        return support.reference_verdict(prompt, self.outcome)

    def new_transport(self, answer):
        return model_only(lambda r, n: reply_body(r, answer), judge_text=self.judge_text)

    def factory(self, gate_pass):
        self.factory_calls.append(gate_pass)
        return self.transport

    def live(self, stage="canary", cfg=None, **kwargs):
        kwargs.setdefault("key_file", self.key_file)
        kwargs.setdefault("environ", {})
        kwargs.setdefault("live", True)
        kwargs.setdefault("sleep", lambda seconds: None)
        kwargs.setdefault("checklist_samples", self.checklist)
        kwargs.setdefault("outcome_samples", self.outcome)
        return self.run_stage(stage=stage, cfg=cfg or self.cfg,
                              live_transport_factory=self.factory, **kwargs)

    def refused(self, fragment, **kwargs):
        before = (len(self.factory_calls), len(self.transport.requests))
        with self.assertRaises(runner.LiveRefused) as caught:
            self.live(**kwargs)
        self.assertIn(fragment, str(caught.exception))
        self.assertEqual((len(self.factory_calls), len(self.transport.requests)), before)
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, str(caught.exception))
        return caught.exception

    def model_requests(self):
        return [r for r in self.transport.requests if not is_judge_prompt(prompt_of(r))]

    def stage_index(self):
        with open(os.path.join(self.store, runner.STAGE_INDEX), encoding="utf-8") as stream:
            return [json.loads(line) for line in stream if line.strip()]

    def test_ships_with_live_disabled(self):
        self.assertIs(runner.LIVE_ENABLED, False)
        with open(os.path.join(support.CORE, "runner.py"), encoding="utf-8") as stream:
            self.assertIn("\nLIVE_ENABLED = False\n", stream.read())

    def test_live_is_refused_before_the_key_file_is_read_or_a_transport_exists(self):
        missing = os.path.join(self.store, "this-key-file-does-not-exist.txt")
        for stage in runner.STAGES:
            with mock.patch.object(keys, "load_keys") as load_keys, \
                    mock.patch.object(providers, "UrllibTransport") as real_transport, \
                    mock.patch("builtins.open", side_effect=AssertionError("nothing may be opened")):
                try:
                    self.live(stage=stage, key_file=missing)
                except runner.LiveRefused as refusal:
                    self.assertIn("LIVE_ENABLED is False", str(refusal))
                except FileNotFoundError:                        # pragma: no cover
                    self.fail("the key file was touched")
                else:                                            # pragma: no cover
                    self.fail("a live run was not refused")
                load_keys.assert_not_called()
                real_transport.assert_not_called()
        self.assertEqual(self.factory_calls, [])
        self.assertEqual(os.listdir(self.store), [])

    def test_cli_live_is_refused_with_a_missing_key_file(self):
        cfg_path = os.path.join(self.store, "cfg.json")
        tasks_path = os.path.join(self.store, "tasks.json")
        with open(cfg_path, "w", encoding="utf-8") as stream:
            json.dump(support.config_dict(), stream)
        with open(tasks_path, "w", encoding="utf-8") as stream:
            json.dump(self.tasks, stream)
        for command in ("qualify", "canary", "full"):
            lines = []
            with mock.patch.object(keys, "load_keys") as load_keys:
                code = cli.main([command, "--live", "--config", cfg_path,
                                 "--public-tasks", tasks_path,
                                 "--private-store", os.path.join(self.store, "store"),
                                 "--key-file", os.path.join(self.store, "absent-keys.txt")],
                                out=lines.append)
                load_keys.assert_not_called()
            self.assertEqual(code, 2)
            self.assertEqual(len(lines), 1)
            self.assertTrue(lines[0].startswith("REFUSED: live runs are switched off"))
            self.assertFalse(os.path.exists(os.path.join(self.store, "store")))

    def test_every_condition_is_needed(self):
        # Qualification is the first paid step, so conditions 2 to 6, 8 and 9 are
        # shown on it: nothing earlier has to be on record.
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            # 2. --live
            with self.assertRaises(runner.LiveRefused) as caught:
                runner.open_live_gate(live=False, config=self.cfg, key_file=self.key_file,
                                      tasks=preflight.normalise_tasks(self.tasks), stage="qualify",
                                      private_store=self.store,
                                      remaining_caps=dict(self.cfg.caps_usd), environ={},
                                      out=QUIET)
            self.assertIn("--live was not given", str(caught.exception))
            # 3. approval
            self.refused("not approved", stage="qualify",
                         cfg=support.make_config(live_approved=False))
            self.refused("not approved", stage="qualify", cfg=support.make_config(approved_by="  "))
            # 4. nothing left to pin
            unpinned = support.spec_dict("openai", "m-oa", "3", "30",
                                         api_version="TO PIN BEFORE RUN")
            self.refused("TO PIN BEFORE RUN", stage="qualify",
                         cfg=support.make_config(models=[unpinned]))
            null_cached = support.spec_dict("openai", "m-oa", "3", "30", cached=None)
            self.refused("cached_input_per_mtok is null", stage="qualify",
                         cfg=support.make_config(models=[null_cached]))
            # 5. --key-file
            self.refused("--key-file was not given", stage="qualify", key_file=None)
            # 6. clean environment
            for name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
                self.refused(name + " is set", stage="qualify", environ={name: "FAKE-ENV-VALUE"})
            # 7. earlier steps on record: the canary and the full run need a
            # passed judge qualification, and there is none yet.
            self.refused("no judge qualification is on record", stage="canary")
            self.refused("no judge qualification is on record", stage="full")
            # 8. pre-flight
            self.refused("pre-flight refused", stage="qualify", cfg=support.make_config(
                caps_usd={"openai": "0.01", "anthropic": "50"}))
            self.refused("--max-usd", stage="qualify", max_usd="0.0001")
            # 9. keys load
            folder = tempfile.TemporaryDirectory()
            self.addCleanup(folder.cleanup)
            only_one = support.write_key_file(
                folder.name, ["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY])
            refusal = self.refused("key not found: CLAUDE_API", stage="qualify",
                                   key_file=only_one)
            self.assertEqual(str(refusal), "key not found: CLAUDE_API")
            self.refused("key file unavailable", stage="qualify",
                         key_file=os.path.join(folder.name, "absent.txt"))
        # Nothing was sent and no live ledger entry was written by any refusal.
        self.assertFalse(os.path.exists(os.path.join(self.store, "ledgers")))
        self.assertFalse(os.path.exists(os.path.join(self.store, runner.QUALIFICATION_DIR)))

    def test_gate_open_runs_on_the_fake_transport_and_never_leaks_a_key(self):
        printed = []
        stdout, stderr = io.StringIO(), io.StringIO()
        before = dict(os.environ)
        with mock.patch.object(runner, "LIVE_ENABLED", True), \
                mock.patch("sys.stdout", stdout), mock.patch("sys.stderr", stderr):
            qualified = self.live(stage="qualify", out=printed.append)
            summary = self.live(out=printed.append)
        self.assertEqual((qualified["status"], qualified["live"]), ("finalised", True))
        self.assertEqual((summary["status"], summary["live"]), ("finalised", True))
        self.assertFalse(summary["publishable"])                    # a canary never is
        self.assertEqual(len(self.factory_calls), 2)
        self.assertIsInstance(self.factory_calls[0], runner.LiveGatePass)
        self.assertEqual(len(self.model_requests()), 4)             # 2 models x 2 tasks x 1
        # The adapter hands the transport the right key, and only inside the Secret.
        by_provider = {r.provider: r for r in self.transport.requests}
        self.assertEqual(by_provider["openai"].secret.reveal(), support.FAKE_OPENAI_KEY)
        self.assertEqual(by_provider["anthropic"].secret.reveal(), support.FAKE_ANTHROPIC_KEY)
        # Scan every output for the fake values: files, printed lines, the summaries,
        # the requests as recorded, the environment.
        outputs = [support.read_everything(self.store), "\n".join(printed), stdout.getvalue(),
                   stderr.getvalue(), repr(summary), json.dumps(summary, default=repr),
                   repr(qualified), json.dumps(qualified, default=repr),
                   repr(self.factory_calls), repr(self.transport.requests),
                   json.dumps([r.to_record() for r in self.transport.requests]),
                   "\n".join(os.environ.values())]
        for text in outputs:
            for value in support.FAKE_VALUES:
                self.assertNotIn(value, text)
        self.assertEqual(dict(os.environ), before)
        # A live run uses the shared ledgers and records each finished stage.
        self.assertTrue(os.path.isfile(os.path.join(self.store, "ledgers", "openai.jsonl")))
        self.assertFalse(os.path.exists(os.path.join(self.store, "ledgers-dry")))
        self.assertEqual([(e["stage"], e["live"], e["qualification_run_id"])
                          for e in self.stage_index()],
                         [("qualify", True, qualified["run_id"]),
                          ("canary", True, qualified["run_id"])])

    def test_stages_unlock_in_order_qualify_then_canary_then_full(self):
        common = dict(grade=runner.stub_grade)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            # Nothing runs before the judges are qualified.
            self.refused("no judge qualification is on record", stage="canary", **common)
            self.refused("no judge qualification is on record", stage="full", **common)
            qualified = self.live(stage="qualify", **common)
            self.assertTrue(qualified["qualification"]["qualified"])
            # The full run still needs the canary.
            self.refused("no finished live canary is on record", stage="full", **common)
            sent = len(self.transport.requests)
            canary = self.live(stage="canary", **common)
            self.assertEqual(canary["status"], "finalised")
            # The canary's answers are judged by the qualified panel.
            judge_models = {r.body["model"] for r in self.transport.requests[sent:]
                            if is_judge_prompt(prompt_of(r))}
            self.assertEqual(judge_models, {"j-oa", "j-an"})
            self.assertEqual(canary["qualification_run_id"], qualified["run_id"])
            full = self.live(stage="full", **common)
        self.assertEqual(full["status"], "finalised")
        self.assertTrue(full["publishable"])
        self.assertTrue(os.path.isfile(full["finalised"]["public_path"]))
        self.assertEqual([e["stage"] for e in self.stage_index()], ["qualify", "canary", "full"])
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, support.read_everything(self.store))

    def test_the_qualification_record_is_signed_off_and_written_once(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            qualified = self.live(stage="qualify",
                                  sample_file_hashes={"checklist": "c" * 64, "outcome": "o" * 64})
        path = qualified["qualification_record_path"]
        self.assertEqual(path, os.path.join(self.store, "qualification",
                                            qualified["run_id"] + ".json"))
        with open(path, encoding="utf-8") as stream:
            record = json.load(stream)
        self.assertEqual(record, qualified["qualification_record"])
        self.assertEqual((record["record"], record["run_id"], record["live"], record["passed"]),
                         ("judge-qualification", qualified["run_id"], True, True))
        self.assertEqual(record["signed_off_by"], "Test Owner")
        self.assertRegex(record["date_utc"], r"^\d{4}-\d{2}-\d{2}T")
        self.assertEqual(record["samples"], {"checklist": {"sha256": "c" * 64, "samples": 4},
                                             "outcome": {"sha256": "o" * 64, "samples": 20}})
        self.assertEqual(record["task_set_version"], "test")
        self.assertEqual(record["run_manifest_sha256"],
                         qualified["finalised"]["manifest_sha256"])
        self.assertEqual([(c["provider"], c["model_id"], c["passed"], c["price_sum_per_mtok"])
                          for c in record["candidates"]],
                         [("openai", "j-oa", True, "18"), ("anthropic", "j-an", True, "27")])
        first = record["candidates"][0]
        self.assertEqual(first["settings_sha256"], self.cfg.judges[0].settings_sha256())
        self.assertEqual(
            (first["checklist"]["agreement"], first["checklist"]["agreement_on_true"],
             first["checklist"]["agreement_on_false"], first["outcome"]["agreement"]),
            (1.0, 1.0, 1.0, 1.0))
        self.assertEqual([(e["provider"], e["model_id"]) for e in record["panel"]],
                         [("openai", "j-oa"), ("anthropic", "j-an")])
        self.assertEqual(record["thresholds"]["checklist_on_false"], "0.85")
        body = {k: v for k, v in record.items() if k != "record_sha256"}
        self.assertEqual(record["record_sha256"], runner.content_sha256(body))
        # Written once: the same run id can never be written again.
        with self.assertRaises(FileExistsError):
            runner.write_qualification_record(self.store, record)
        # The finalised run folder is untouched by the record.
        records.verify_manifest(qualified["dir"])

    def test_a_changed_samples_file_or_judge_invalidates_the_record(self):
        other = dict(self.checklist[0], answer="An edited answer")
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify")
            for stage in ("canary", "full"):
                # A changed samples file.
                self.refused("the checklist samples file has changed since judge qualification",
                             stage=stage, checklist_samples=[other] + self.checklist[1:])
                self.refused("the outcome samples file has changed since judge qualification",
                             stage=stage, outcome_samples=self.outcome[:-1])
                # The sample files must be given, so that they can be compared.
                self.refused("give --checklist-samples", stage=stage, checklist_samples=None)
                self.refused("give --outcome-samples", stage=stage, outcome_samples=None)
                # A changed judge id.
                swapped = support.make_config(judges=[
                    support.spec_dict("openai", "j-oa-2", "6", "12", judge=True),
                    support.spec_dict("anthropic", "j-an", "9", "18", judge=True)])
                refusal = self.refused("differ from the panel named by judge qualification",
                                       stage=stage, cfg=swapped)
                self.assertIn("j-oa-2", str(refusal))
                self.assertIn("j-an, j-oa)", str(refusal))
                # The same judge id with a changed setting.
                retuned = support.make_config(judges=[
                    support.spec_dict("openai", "j-oa", "6", "12", judge=True,
                                      reasoning_effort="high"),
                    support.spec_dict("anthropic", "j-an", "9", "18", judge=True)])
                self.refused("the settings of judge j-oa have changed since it was qualified",
                             stage=stage, cfg=retuned)
                # A changed task set version.
                self.refused("the task set version has changed", stage=stage,
                             cfg=support.make_config(task_set_version="test-2"))
            # A re-read price does not undo the qualification: the canary runs.
            repriced = support.spec_dict("openai", "j-oa", "7", "14", judge=True)
            repriced["price"]["read_on"] = "2026-11-20"
            cfg = support.make_config(judges=[
                repriced, support.spec_dict("anthropic", "j-an", "9", "18", judge=True)])
            self.assertEqual(self.live(stage="canary", cfg=cfg)["status"], "finalised")

    def test_an_edited_or_missing_record_is_not_accepted(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            qualified = self.live(stage="qualify", cfg=support.make_config(
                judge_candidates=support.candidates_dict()))
            path = qualified["qualification_record_path"]
            # The cheapest candidates were named, not the config's judges.
            self.refused("differ from the panel named by judge qualification", stage="canary")
            with open(path, encoding="utf-8") as stream:
                record = json.load(stream)
            # Editing the record to name the config's judges is caught by its hash.
            record["panel"] = [dict(entry, model_id=name) for entry, name in
                               zip(record["panel"], ("j-oa", "j-an"))]
            with open(path, "w", encoding="utf-8") as stream:
                json.dump(record, stream)
            self.refused("has been changed since it was written", stage="canary")
            os.remove(path)
            self.refused("is missing", stage="canary")

    def test_a_failed_later_qualification_replaces_an_earlier_pass(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify")
            self.assertEqual(self.live(stage="canary")["status"], "finalised")
            self.wrong_judges = {"j-an"}
            failed = self.live(stage="qualify")
            self.assertFalse(failed["qualification"]["qualified"])
            self.assertFalse(failed["qualification_record"]["passed"])
            for stage in ("canary", "full"):
                refusal = self.refused("did not pass, so there is no panel", stage=stage)
                self.assertIn("anthropic side", str(refusal))

    def test_the_canary_and_full_run_refuse_a_config_that_differs_from_the_panel(self):
        candidates = support.candidates_dict()
        listed = support.make_config(judge_candidates=candidates)
        named = support.make_config(judge_candidates=candidates, judges=support.cheap_panel())
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            qualified = self.live(stage="qualify", cfg=listed)
            self.assertEqual([item["model_id"] for item in qualified["qualification"]["panel"]],
                             ["j-oa-cheap", "j-an-cheap"])
            # 5 candidates x 24 samples.
            self.assertEqual(len(self.transport.requests), 120)
            for stage in ("canary", "full"):
                refusal = self.refused("differ from the panel named by judge qualification",
                                       stage=stage, cfg=listed, grade=runner.stub_grade)
                self.assertIn("(j-an, j-oa)", str(refusal))
                self.assertIn("(j-an-cheap, j-oa-cheap)", str(refusal))
            # With judges set to the panel the canary runs, judged by that panel.
            sent = len(self.transport.requests)
            canary = self.live(stage="canary", cfg=named, grade=runner.stub_grade)
            self.assertEqual(canary["status"], "finalised")
            self.assertEqual({r.body["model"] for r in self.transport.requests[sent:]
                              if is_judge_prompt(prompt_of(r))}, {"j-oa-cheap", "j-an-cheap"})
            self.assertEqual(self.live(stage="full", cfg=named,
                                       grade=runner.stub_grade)["status"], "finalised")

    def test_a_dry_qualification_never_opens_the_canary(self):
        dry = self.run_stage(stage="qualify", cfg=self.cfg, checklist_samples=self.checklist,
                             outcome_samples=self.outcome, transport=self.transport)
        self.assertTrue(dry["qualification"]["qualified"])
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.refused("no judge qualification is on record", stage="canary")

    def test_preflight_uses_the_worst_case_until_a_panel_is_recorded(self):
        candidates = support.candidates_dict()
        listed = support.make_config(judge_candidates=candidates)
        named = support.make_config(judge_candidates=candidates, judges=support.cheap_panel())
        samples = dict(checklist_samples=self.checklist, outcome_samples=self.outcome)

        def dry(cfg, stage="canary"):
            lines = []
            summary = self.run_stage(stage=stage, cfg=cfg, out=lines.append, **samples)
            return summary["preflight"], "\n".join(lines)

        before, text = dry(named)
        self.assertEqual(before["judging"]["case"], "worst_case")
        self.assertEqual(before["judging"]["judges"], {"openai": "j-oa-dear", "anthropic": "j-an"})
        self.assertIn("WORST CASE", text)
        self.assertIn("no judge qualification is on record", text)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            qualified = self.live(stage="qualify", cfg=listed)
            in_gate = []
            self.live(stage="canary", cfg=named, out=in_gate.append)
        self.assertIn("RECORDED PANEL of qualification " + qualified["run_id"],
                      "\n".join(in_gate))
        after, text = dry(named)
        self.assertEqual(after["judging"], {
            "case": "recorded_panel",
            "judges": {"openai": "j-oa-cheap", "anthropic": "j-an-cheap"},
            "qualification_run_id": qualified["run_id"], "note": None})
        self.assertIn("RECORDED PANEL of qualification " + qualified["run_id"], text)
        for provider in ("openai", "anthropic"):
            self.assertLess(after["by_stage"]["full"][provider]["planning_bound"],
                            before["by_stage"]["full"][provider]["planning_bound"])
        # A config whose judges are not the recorded panel falls back to the worst
        # case, and the output says why.
        fallback, text = dry(listed)
        self.assertEqual(fallback["judging"]["case"], "worst_case")
        self.assertIn("differ from the panel named by judge qualification", text)
        # The qualification stage itself is always costed at the worst case.
        again, text = dry(named, stage="qualify")
        self.assertEqual(again["judging"]["case"], "worst_case")
        self.assertIn("this is the qualification stage", text)

    def test_a_key_echoed_by_the_provider_is_refused_by_the_record(self):
        def echo(request, n):
            return reply_body(request, "you sent " + request.secret.reveal())
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify")
            self.transport = model_only(echo)
            with self.assertRaises(records.RecordError) as caught:
                self.live()
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, str(caught.exception))
            self.assertNotIn(value, support.read_everything(self.store))

    def test_dry_run_secret_cannot_be_revealed(self):
        def nosy(request, n):
            with self.assertRaises(keys.KeyFileError):
                request.secret.reveal()
            return reply_body(request, "x")
        summary = self.run_stage(transport=model_only(nosy), cfg=self.cfg,
                                 key_file=self.key_file)
        self.assertEqual(summary["status"], "finalised")
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, support.read_everything(self.store))

    def test_gate_pass_is_single_purpose(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify")
            gate_pass = self.factory_calls[0]
            runner.require_live_pass(gate_pass)                     # issued by the gate
            with self.assertRaises(runner.LiveRefused):
                runner.require_live_pass(runner.LiveGatePass(gate_pass.keys))
        with self.assertRaises(runner.LiveRefused):
            runner.require_live_pass(gate_pass)                     # live disabled again
        self.assertNotIn(support.FAKE_OPENAI_KEY, repr(gate_pass) + repr(gate_pass.keys))

    def test_a_live_run_is_refused_without_graders_or_scorer_before_any_request(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True), mock.patch.dict(sys.modules, ABSENT):
            self.live(stage="qualify")
            self.live(stage="canary")
            sent = len(self.transport.requests)
            with self.assertRaises(runner.GraderUnavailable):
                self.live(stage="full", grade=None)
            with self.assertRaises(runner.LiveRefused) as caught:
                self.live(stage="full", scores=None)
            self.assertIn("no scorer available", str(caught.exception))
        self.assertEqual(len(self.transport.requests), sent)


class CommandLineTests(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.folder = folder.name
        self.cfg_path = os.path.join(self.folder, "cfg.json")
        self.tasks_path = os.path.join(self.folder, "public")
        os.mkdir(self.tasks_path)
        with open(self.cfg_path, "w", encoding="utf-8") as stream:
            json.dump(support.config_dict(), stream)
        with open(os.path.join(self.tasks_path, "a.json"), "w", encoding="utf-8") as stream:
            json.dump([support.task("t1"), support.task("t2", family=4, checks=1)], stream)
        self.held_path = os.path.join(self.folder, "held.json")
        with open(self.held_path, "w", encoding="utf-8") as stream:
            json.dump({"tasks": [support.task("h1", split="held-out")]}, stream)
        absent = mock.patch.dict(sys.modules, ABSENT)
        absent.start()
        self.addCleanup(absent.stop)

    def write(self, name, value):
        path = os.path.join(self.folder, name)
        with open(path, "w", encoding="utf-8") as stream:
            json.dump(value, stream)
        return path

    def sample_files(self):
        checklist, outcome = support.qualification_samples("t2", "t1")
        checklist = [dict(item, reference={"c1": n % 2 == 0})
                     for n, item in enumerate(checklist)]
        return ["--checklist-samples", self.write("checklist.json", checklist),
                "--outcome-samples", self.write("outcome.json", outcome)]

    def main(self, *argv):
        lines = []
        code = cli.main(list(argv), out=lines.append)
        return code, "\n".join(lines)

    def common(self):
        return ["--config", self.cfg_path, "--public-tasks", self.tasks_path,
                "--held-out-tasks", self.held_path]

    def test_preflight_command(self):
        code, text = self.main("preflight", *self.common())
        self.assertEqual(code, 0)
        self.assertIn("models 2, tasks 3, full-run slots 18, canary slots 4", text)
        self.assertIn("tasks with a judged check: 1", text)
        code, text = self.main("preflight", *self.common(), "--max-usd", "0.0001")
        self.assertEqual(code, 2)
        self.assertIn("REFUSED", text)

    def test_dry_run_command_with_stub_grading(self):
        store = os.path.join(self.folder, "store")
        code, text = self.main("dry-run", *self.common(), "--private-store", store,
                               "--stub-grade", "--seed", "4")
        self.assertEqual(code, 0, text)
        self.assertIn("status finalised, publishable False", text)
        self.assertIn("m-oa: planned 9, attempted 9, unstarted 0, pending 0", text)
        self.assertTrue(os.path.isdir(os.path.join(store, "runs")))

    def test_stage_command_without_live_is_a_dry_run(self):
        store = os.path.join(self.folder, "store")
        code, text = self.main("canary", *self.common(), "--private-store", store,
                               "--stub-grade", "--key-file",
                               os.path.join(self.folder, "never-read.txt"))
        self.assertEqual(code, 0, text)
        self.assertIn("Dry run", text)

    def test_dry_run_without_graders_says_so(self):
        store = os.path.join(self.folder, "store")
        with self.assertRaises(runner.GraderUnavailable):
            runner.default_grade({}, "")
        code, text = self.main("dry-run", *self.common(), "--private-store", store)
        self.assertEqual(code, 2)
        self.assertIn("no grader available", text)
        self.assertFalse(os.path.exists(os.path.join(store, "runs")))

    def test_preflight_covers_the_whole_plan_from_the_qualify_stage(self):
        code, text = self.main("preflight", *self.common(), *self.sample_files())
        self.assertEqual(code, 0)
        self.assertIn("Result: within the remaining caps for stage qualify", text)
        self.assertIn("qualification: 24 calls per candidate (4 checklist samples + 20 outcome "
                      "samples), 48 calls in all", text)
        self.assertIn("judging costed at the WORST CASE", text)
        self.assertIn("sample set: meets the method's rules", text)
        self.assertIn("built-in reader", text)

    def test_every_refusal_has_a_non_zero_exit_code(self):
        store = os.path.join(self.folder, "store")
        tight = self.write("tight.json", support.config_dict(
            caps_usd={"openai": "0.01", "anthropic": "50"}))
        tight_args = ["--config", tight, "--public-tasks", self.tasks_path]
        cases = [
            # pre-flight above a cap: the figures are printed, then the refusal
            (("preflight", *tight_args), "REFUSED: openai: planning bound"),
            (("dry-run", *tight_args, "--private-store", store, "--stub-grade"),
             "REFUSED: pre-flight refused"),
            (("canary", *tight_args, "--private-store", store, "--stub-grade"),
             "REFUSED: pre-flight refused"),
            # --max-usd below the stage's planning bound
            (("preflight", *self.common(), "--stage", "canary", "--max-usd", "0.0001"),
             "REFUSED: --max-usd"),
            # qualify without its sample files
            (("qualify", *self.common(), "--private-store", store),
             "REFUSED: the qualify stage needs both sample files"),
            # a config that does not validate, and files that are missing or broken
            (("preflight", "--config", self.write("bad.json", {"models": []}),
              "--public-tasks", self.tasks_path), "REFUSED: config rejected"),
            (("preflight", "--config", os.path.join(self.folder, "absent.json"),
              "--public-tasks", self.tasks_path), "REFUSED: cannot read absent.json"),
            (("preflight", "--config", self.cfg_path,
              "--public-tasks", os.path.join(self.folder, "absent-tasks.json")),
             "REFUSED: cannot read absent-tasks.json"),
            (("preflight", *self.common(), "--checklist-samples",
              self.write("not-a-list.json", {"a": 1})), "REFUSED: not a list of samples"),
            (("dry-run", *self.common(), "--private-store", store),
             "REFUSED: no grader available"),
        ]
        for argv, fragment in cases:
            code, text = self.main(*argv)
            self.assertEqual(code, 2, argv)
            self.assertIn(fragment, text, argv)
        # The three figures are printed with a pre-flight refusal, not instead of it.
        code, text = self.main("dry-run", *tight_args, "--private-store", store, "--stub-grade")
        for word in ("expected", "planning bound", "absolute bound"):
            self.assertIn(word, text)
        self.assertFalse(os.path.exists(os.path.join(store, "runs")))
        with self.assertRaises(SystemExit) as caught:
            self.main("dry-run", *self.common(), "--stub-grade")        # no --private-store
        self.assertNotIn(caught.exception.code, (0, None))

    def test_max_usd_can_only_lower_a_cap(self):
        store = os.path.join(self.folder, "store")
        tight = self.write("tight.json", support.config_dict(
            caps_usd={"openai": "0.01", "anthropic": "50"}))
        # A --max-usd far above the provider cap does not lift it.
        code, text = self.main("dry-run", "--config", tight, "--public-tasks", self.tasks_path,
                               "--private-store", store, "--stub-grade", "--max-usd", "100000")
        self.assertEqual(code, 2)
        self.assertIn("above the remaining cap 0.0100 USD", text)
        self.assertNotIn("--max-usd", text.split("REFUSED:", 1)[1])
        # Below the stage's planning bound it lowers the cap, and the run is refused.
        code, text = self.main("dry-run", *self.common(), "--private-store", store,
                               "--stub-grade", "--max-usd", "0.5")
        self.assertEqual(code, 2)
        self.assertIn("--max-usd 0.5000 is below this stage's planning bound", text)
        # Above the bound and inside the caps, it changes nothing.
        code, text = self.main("dry-run", *self.common(), "--private-store", store,
                               "--stub-grade", "--max-usd", "100000")
        self.assertEqual(code, 0, text)

    def test_a_qualification_that_names_no_panel_fails_the_stage(self):
        store = os.path.join(self.folder, "store")
        cfg = self.write("candidates.json", support.config_dict(
            judge_candidates=support.candidates_dict()))
        # The dry-run stub judge says true to everything, so no candidate passes.
        code, text = self.main("qualify", "--config", cfg, "--public-tasks", self.tasks_path,
                               "--held-out-tasks", self.held_path, "--private-store", store,
                               *self.sample_files())
        self.assertEqual(code, 4, text)
        self.assertIn("status finalised", text)
        self.assertIn("QUALIFICATION FAILED, no panel: no judge candidate passed qualification "
                      "on the openai side", text)
        self.assertIn("on the anthropic side", text)
        rows = [line.split() for line in text.split("\n")
                if line.strip().startswith("j-") and line.split()[-1] in ("PASS", "FAIL")]
        self.assertEqual([(row[0], row[1], row[2], row[-1]) for row in rows], [
            ("j-oa-cheap", "openai", "3", "FAIL"), ("j-oa", "openai", "18", "FAIL"),
            ("j-oa-dear", "openai", "60", "FAIL"), ("j-an-cheap", "anthropic", "6", "FAIL"),
            ("j-an", "anthropic", "27", "FAIL")])
        # overall, on true items, on false items, outcome samples
        self.assertEqual(rows[0][3:7], ["0.5000", "1.0000", "0.0000", "0.3500"])
        self.assertIn("no qualification record was written", text)
        self.assertNotIn("recommended panel", text)

    def test_a_qualification_that_passes_prints_the_recommended_panel(self):
        _, outcome = support.qualification_samples("t2", "t1")
        qualification = {
            "sample_set_problems": [], "failures": [],
            "panel": [{"provider": "openai", "model_id": "j-oa-cheap", "settings_sha256": "x"},
                      {"provider": "anthropic", "model_id": "j-an", "settings_sha256": "y"}],
            "qualified": True,
            "candidates": {
                "j-oa-cheap": {"price_sum_per_mtok": "3", "qualified": True, "checklist": {
                    "agreement": 0.9531, "agreement_on_true": 0.9, "agreement_on_false": 1.0},
                    "outcome": {"agreement": 0.95}},
                "j-an": {"price_sum_per_mtok": "27", "qualified": True, "checklist": {
                    "agreement": 1.0, "agreement_on_true": 1.0, "agreement_on_false": 1.0},
                    "outcome": {"agreement": 1.0}}}}
        cfg = support.make_config(judge_candidates=support.candidates_dict())
        text = "\n".join(cli.qualification_lines(qualification, cfg))
        self.assertIn("recommended panel, the cheapest candidate that passed on each side: "
                      "openai j-oa-cheap, anthropic j-an", text)
        self.assertIn("0.9531", text)
        self.assertIn("not tried", text)                           # candidates with no result
        self.assertNotIn("QUALIFICATION FAILED", text)

    def test_a_key_on_the_command_line_is_refused_without_echo(self):
        stderr = io.StringIO()
        with mock.patch("sys.stderr", stderr):
            with self.assertRaises(SystemExit) as caught:
                cli.main(["dry-run", *self.common(), "--api-key", support.FAKE_OPENAI_KEY])
        self.assertIn("looks like a key", str(caught.exception))
        self.assertNotIn(support.FAKE_OPENAI_KEY, str(caught.exception) + stderr.getvalue())

    def test_private_store_is_required_for_runs(self):
        with self.assertRaises(SystemExit):
            self.main("dry-run", *self.common(), "--stub-grade")

    def test_commands_and_flags_exist(self):
        parser = cli.build_parser()
        for command in ("preflight", "dry-run", "qualify", "canary", "full"):
            args = parser.parse_args([command, "--config", "c", "--public-tasks", "p",
                                      "--held-out-tasks", "h", "--key-file", "k",
                                      "--private-store", "s", "--max-usd", "5"])
            self.assertEqual(args.max_usd, Decimal("5"))
        self.assertTrue(parser.parse_args(["full", "--config", "c", "--public-tasks", "p",
                                           "--live"]).live)


if __name__ == "__main__":
    unittest.main()
