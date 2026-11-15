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
import ledger  # noqa: E402
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
        # The cap is exactly the planning bound of one pass, so pass 1 starts. Every
        # request fails to connect and keeps its full reservation of 0.123759: far
        # above the 15% retry allowance. Slot 1 holds three (0.371277). Slot 2 holds
        # a fourth (0.495036); its second request would be the fifth held (0.618795),
        # which is above the cap, and it is refused.
        bound = pass_bound_openai(self.tasks)
        held = ledger.worst_case_usd(
            ledger.input_token_bound(self.tasks[0]["prompt"]), 4096, self.cfg.models[0].price)
        self.assertEqual(held, Decimal("0.123759"))
        self.assertEqual(len(self.tasks[0]["prompt"]), len(self.tasks[1]["prompt"]))
        self.assertLess(4 * held, bound)
        self.assertGreater(5 * held, bound)
        raw = support.config_dict(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                  caps_usd={"openai": str(bound), "anthropic": "50"})
        cfg = support.config.validate(raw)
        transport = model_only(lambda request, n: providers.TransportFailure("down"))
        summary = self.run_stage(transport=transport, cfg=cfg)
        self.assertEqual(summary["status"], "interrupted")
        self.assertFalse(summary["publishable"])
        self.assertIsNone(summary["finalised"])
        report = summary["report"]
        self.assertEqual(report["stopped_providers"], ["openai"])
        self.assertIn("interrupted by cap", report["interrupt_reason"])
        counts = report["models"]["m-oa"]
        self.assertEqual((counts["planned"], counts["attempted"], counts["unstarted"]), (6, 2, 4))
        self.assertEqual(len(counts["unstarted_slots"]), 4)
        self.assertEqual(len(transport.requests), 4)
        self.assertIn(os.path.join("runs", "_staging"), summary["dir"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", summary["run_id"])))
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))
        self.assertEqual(summary["run_committed_usd"], Decimal("0.495036"))
        self.assertLessEqual(summary["run_committed_usd"], bound)
        rows = self.rows(summary)
        self.assertEqual([r["outcome"] for r in rows], ["execution_error"] * 2)
        self.assertEqual([len(r["requests"]) for r in rows], [3, 1])
        self.assertIn("retry_refused_by_cap", rows[-1]["flags"])
        self.assertIs(rows[-1]["pass"], False)
        self.assertEqual(rows[-1]["slot_id"] in counts["unstarted_slots"], False)
        # A stop inside a pass is an interruption, not an incomplete run.
        self.assertEqual([(g["pass"], g["ok"]) for g in summary["pass_gates"]], [(1, True)])
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

    def test_the_live_switch_is_one_literal_line_in_the_source(self):
        # The switch was turned on in the reviewed run-config commit of
        # 15 November 2026. It is one plain assignment, so a change to it
        # always shows in a diff.
        self.assertIs(runner.LIVE_ENABLED, True)
        with open(os.path.join(support.CORE, "runner.py"), encoding="utf-8") as stream:
            source = stream.read()
        self.assertEqual(source.count("\nLIVE_ENABLED = True\n"), 1)
        self.assertEqual(source.count("\nLIVE_ENABLED ="), 1)

    def test_live_is_refused_before_the_key_file_is_read_or_a_transport_exists(self):
        missing = os.path.join(self.store, "this-key-file-does-not-exist.txt")
        for stage in runner.STAGES:
            with mock.patch.object(runner, "LIVE_ENABLED", False), \
                    mock.patch.object(keys, "load_keys") as load_keys, \
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
            with mock.patch.object(runner, "LIVE_ENABLED", False), \
                    mock.patch.object(keys, "load_keys") as load_keys:
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
            # 6. clean environment: the gate itself refuses, and `run_stage`
            # refuses even earlier (see EnvironmentGuardTests).
            for name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
                with self.assertRaises(runner.LiveRefused) as caught:
                    runner.open_live_gate(
                        live=True, config=self.cfg, key_file=self.key_file,
                        tasks=preflight.normalise_tasks(self.tasks), stage="qualify",
                        private_store=self.store, remaining_caps=dict(self.cfg.caps_usd),
                        environ={name: "FAKE-ENV-VALUE"}, out=QUIET)
                self.assertIn(name + " is set", str(caught.exception))
                self.assertNotIn("FAKE-ENV-VALUE", str(caught.exception))
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

    def test_an_overrun_in_the_live_ledger_refuses_every_later_stage_until_named(self):
        # The first model request of the canary reports 50,000 input tokens:
        # (50000 x 3 + 5 x 30) / 1e6 = 0.15015 USD, above its reservation.
        def step(request, n):
            if n == 1:
                return support.ok(support.openai_body("costly", input_tokens=50000))
            return reply_body(request, "fine")
        common = dict(grade=runner.stub_grade)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify", **common)
            self.transport = model_only(step, judge_text=self.judge_text)
            canary = self.live(stage="canary", **common)
            self.assertEqual(canary["status"], "interrupted")
            request = self.rows(canary)[0]["requests"][0]["request_id"]
            self.assertEqual(self.rows(canary)[0]["requests"][0]["ledger_flags"],
                             ["charge_above_reservation"])
            # The shared live ledger holds the overrun: a new canary, a new
            # qualification and a resume of the stopped canary are all refused,
            # before the key file is read or a transport exists.
            self.transport = self.new_transport("fine")
            for kwargs in (dict(stage="canary"), dict(stage="qualify"),
                           dict(stage="canary", resume=canary["run_id"])):
                problem = self.refused("was charged above its reservation", **kwargs, **common)
                self.assertIn(request, str(problem))
            named = support.make_config(acknowledged_overruns=[request])
            again = self.live(stage="canary", cfg=named, **common)
        self.assertEqual(again["status"], "finalised")
        self.assertEqual(len(self.model_requests()), 4)

    def test_a_live_resume_with_a_higher_cap_or_a_held_store_stops_before_the_key_file(self):
        common = dict(grade=runner.stub_grade)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.live(stage="qualify", **common)
            self.transport = model_only(lambda r, n: KeyboardInterrupt(),
                                        judge_text=self.judge_text)
            with self.assertRaises(KeyboardInterrupt):
                self.live(stage="canary", **common)
            (run_id,) = os.listdir(os.path.join(self.store, "runs", "_staging"))
            self.transport = self.new_transport("fine")
            calls = len(self.factory_calls)
            higher = support.make_config(caps_usd={"openai": "50.01", "anthropic": "50"})
            with mock.patch.object(keys, "load_keys") as load_keys:
                with self.assertRaises(records.RecordError) as caught:
                    self.live(stage="canary", cfg=higher, resume=run_id, **common)
                self.assertIn("cannot be resumed with a higher cap: the openai cap is 50.01 "
                              "USD, above the 50 USD the run started with",
                              str(caught.exception))
                lock = ledger.StoreLock(self.store).acquire("another-run")
                self.addCleanup(lock.release)
                for kwargs in (dict(stage="canary", resume=run_id), dict(stage="canary"),
                               dict(stage="qualify")):
                    self.refused("the private store is in use by another run (pid",
                                 **kwargs, **common)
                lock.release()
            self.assertFalse(load_keys.called)
            self.assertEqual((len(self.factory_calls), self.transport.requests), (calls, []))
            # Under the caps it started with, and with the store free, it carries on.
            done = self.live(stage="canary", resume=run_id, **common)
        self.assertEqual((done["status"], done["run_id"]), ("finalised", run_id))

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
        with mock.patch.object(runner, "LIVE_ENABLED", False):
            with self.assertRaises(runner.LiveRefused):
                runner.require_live_pass(gate_pass)                 # live disabled again
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


class EnvironmentGuardTests(RunnerCase):
    """OPENAI_API_KEY and ANTHROPIC_API_KEY refuse every start, dry runs and
    the pre-flight included, before anything else is read. The values used
    here are dummies, patched into `os.environ` for the test only."""

    NAMES = ("OPENAI_API_KEY", "ANTHROPIC_API_KEY")
    DUMMY = "FAKE-ENV-VALUE-not-a-key"

    def test_run_stage_refuses_a_dry_run_of_every_stage(self):
        checklist, outcome = support.qualification_samples()
        for name in self.NAMES:
            for stage in runner.STAGES:
                transport = model_only(lambda r, n: reply_body(r, "x"))
                for how in ("argument", "os.environ"):
                    kwargs = {"environ": {name: self.DUMMY}} if how == "argument" else {}
                    patch = mock.patch.dict(os.environ, {} if how == "argument"
                                            else {name: self.DUMMY})
                    with patch, self.assertRaises(keys.EnvironmentNotClean) as caught:
                        self.run_stage(stage=stage, transport=transport,
                                       checklist_samples=checklist, outcome_samples=outcome,
                                       **kwargs)
                    self.assertIn(name + " is set", str(caught.exception))
                    self.assertNotIn(self.DUMMY, str(caught.exception))
                self.assertEqual(transport.requests, [])
        # Nothing was written: no record, no ledger, not even a dry one.
        self.assertEqual(os.listdir(self.store), [])

    def test_run_stage_checks_the_environment_before_anything_else(self):
        # Every other argument is unusable; the environment is still what is reported.
        for name in self.NAMES:
            with self.assertRaises(keys.EnvironmentNotClean):
                runner.run_stage("no-such-stage", None, None, private_store=None,
                                 environ={name: self.DUMMY})
            with mock.patch.object(runner, "LIVE_ENABLED", True), \
                    self.assertRaises(keys.EnvironmentNotClean):
                runner.run_stage("full", None, None, private_store=None, live=True,
                                 environ={name: self.DUMMY})

    def test_the_live_gate_checks_the_environment_first(self):
        for name in self.NAMES:
            # With live runs switched off, and with nothing else valid.
            with self.assertRaises(runner.LiveRefused) as caught:
                runner.open_live_gate(live=False, config=None, key_file=None, tasks=None,
                                      stage="qualify", private_store=None, remaining_caps=None,
                                      environ={name: self.DUMMY})
            self.assertIn(name + " is set", str(caught.exception))
            with mock.patch.dict(os.environ, {name: self.DUMMY}), \
                    self.assertRaises(runner.LiveRefused) as caught:
                runner.open_live_gate(live=False, config=None, key_file=None, tasks=None,
                                      stage="qualify", private_store=None, remaining_caps=None)
            self.assertIn(name + " is set", str(caught.exception))

    def test_every_cli_command_is_refused_and_nothing_is_read(self):
        store = os.path.join(self.store, "store")
        absent = os.path.join(self.store, "absent")
        for name in self.NAMES:
            for command in ("preflight", "dry-run", "qualify", "canary", "full"):
                for live in ((False, True) if command in cli.STAGE_COMMANDS else (False,)):
                    argv = [command, "--config", absent + "-config.json",
                            "--public-tasks", absent + "-tasks",
                            "--checklist-samples", absent + "-checklist.json",
                            "--outcome-samples", absent + "-outcome.json",
                            "--key-file", absent + "-keys.txt", "--private-store", store]
                    if live:
                        argv.append("--live")
                    lines = []
                    with mock.patch.dict(os.environ, {name: self.DUMMY}), \
                            mock.patch("builtins.open",
                                       side_effect=AssertionError("nothing may be opened")), \
                            mock.patch.object(cli.config_module, "load_config") as load_config:
                        code = cli.main(argv, out=lines.append)
                        load_config.assert_not_called()
                    self.assertEqual(code, 2, argv)
                    self.assertEqual(lines, ["REFUSED: refusing to start: %s is set in the "
                                             "environment" % name], argv)
                    self.assertNotIn(self.DUMMY, "\n".join(lines))
        self.assertFalse(os.path.exists(store))
        # The check comes before the arguments are parsed at all.
        with mock.patch.dict(os.environ, {self.NAMES[0]: self.DUMMY}):
            lines = []
            self.assertEqual(cli.main(["no-such-command"], out=lines.append), 2)
            self.assertTrue(lines[0].startswith("REFUSED: "))

    def test_a_clean_environment_still_starts(self):
        clean = {key: value for key, value in os.environ.items() if key not in self.NAMES}
        with mock.patch.dict(os.environ, clean, clear=True):
            summary = self.run_stage(transport=model_only(lambda r, n: reply_body(r, "x")))
        self.assertEqual(summary["status"], "finalised")


class OverrunBackstopTests(RunnerCase):
    """If a settled charge is ever above its reservation, the ledger records
    it, nothing more is sent, and the run ends interrupted (exit code 3)."""

    HUGE = 50000000          # input tokens reported by the fake provider: 150 USD at 3 per million

    def overrun_on(self, wanted):
        def step(request, n):
            if n == wanted:
                return support.ok(support.openai_body("costly", input_tokens=self.HUGE))
            return reply_body(request, "fine")
        return step

    def ledger_lines(self, summary, provider="openai"):
        path = os.path.join(self.store, "ledgers-dry", summary["run_id"], provider + ".jsonl")
        with open(path, encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def test_a_model_overrun_stops_the_run_before_the_next_request(self):
        transport = model_only(self.overrun_on(2))
        summary = self.run_stage(transport=transport)
        # Request 1 was fine, request 2 overran, request 3 was never sent.
        self.assertEqual(len(transport.requests), 2)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIsNone(summary["finalised"])
        self.assertFalse(summary["publishable"])
        report = summary["report"]
        self.assertIn("a charge was above its reservation on openai", report["interrupt_reason"])
        self.assertEqual(report["stopped_providers"], ["openai"])
        counts = report["models"]["m-oa"]
        self.assertEqual((counts["planned"], counts["attempted"], counts["unstarted"]), (6, 2, 4))
        # The ledger holds the overrun: the charge, the reservation, the flag.
        settles = [line for line in self.ledger_lines(summary) if line["event"] == "settle"]
        self.assertEqual(len(settles), 2)
        self.assertEqual(settles[0]["flags"], [])
        self.assertEqual(settles[1]["flags"], ["charge_above_reservation"])
        self.assertGreater(Decimal(settles[1]["usd"]), Decimal(settles[1]["reserved_usd"]))
        self.assertGreater(Decimal(settles[1]["usd"]), Decimal("150"))
        # The paid answer is kept on its slot, with the flag on its request.
        rows = self.rows(summary)
        self.assertEqual([r["reply"] for r in rows], ["fine", "costly"])
        self.assertEqual(rows[1]["requests"][0]["ledger_flags"], ["charge_above_reservation"])
        self.assertEqual(rows[1]["outcome"], "answered")
        self.assertIn(os.path.join("runs", "_staging"), summary["dir"])

    def test_no_judge_request_is_sent_after_a_model_overrun(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2", family=4, checks=2)]
        transport = model_only(self.overrun_on(1))
        summary = self.run_stage(transport=transport, tasks=tasks, grade=JudgingTests.grade)
        self.assertEqual(len(transport.requests), 1)             # the model request only
        self.assertEqual(summary["status"], "interrupted")
        row = self.rows(summary)[0]
        self.assertEqual(row["reply"], "costly")
        self.assertTrue(row["pending"])
        self.assertIsNone(row["pass"])
        self.assertIn("judging_refused_after_overrun", row["flags"])
        self.assertEqual(row["judge_requests"], [])

    def test_a_judge_overrun_stops_the_run_before_the_next_request(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2", family=4, checks=2)]
        calls = []

        def judge_text(request, prompt):
            calls.append(request.body["model"])
            return json.dumps({"checks": {"c1": {"pass": True, "reason": "r"},
                                          "c2": {"pass": True, "reason": "r"}}})

        def transport(request):
            if is_judge_prompt(prompt_of(request)):
                judge_text(request, prompt_of(request))
                if len(calls) == 1:
                    body = support.openai_body if request.provider == "openai" \
                        else support.anthropic_body
                    return support.ok(body("{}", input_tokens=self.HUGE))
            return reply_body(request, "an answer")
        fake = ScriptedTransport(default=transport)
        summary = self.run_stage(transport=fake, tasks=tasks, grade=JudgingTests.grade)
        # One model request, then the first judge request overran: nothing after it,
        # not the retry of the malformed verdict and not the second judge.
        self.assertEqual(len(fake.requests), 2)
        self.assertEqual(len(calls), 1)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIn("above its reservation", summary["report"]["interrupt_reason"])
        row = self.rows(summary)[0]
        self.assertTrue(row["pending"])
        self.assertEqual(row["judge_requests"][0]["ledger_flags"], ["charge_above_reservation"])

    def test_an_overrun_on_the_last_request_of_a_stage_is_never_finalised(self):
        # The model stage: the very last slot overruns, so there is no next request
        # to refuse. The run still ends interrupted.
        transport = model_only(self.overrun_on(6))
        summary = self.run_stage(transport=transport)
        self.assertEqual(len(transport.requests), 6)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIsNone(summary["finalised"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", summary["run_id"])))
        # The qualification stage: the last sample of the last candidate overruns.
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        checklist, outcome = support.qualification_samples()
        seen = []

        def judge(request):
            seen.append(request)
            text = support.reference_verdict(prompt_of(request), outcome)
            body = support.openai_body if request.provider == "openai" else support.anthropic_body
            return support.ok(body(text, input_tokens=self.HUGE if len(seen) == 48 else 10))
        summary = self.run_stage(stage="qualify", transport=ScriptedTransport(default=judge),
                                 cfg=support.make_config(), tasks=tasks,
                                 checklist_samples=checklist, outcome_samples=outcome)
        self.assertEqual(len(seen), 48)                           # 24 samples x 2 judges
        self.assertEqual(summary["status"], "interrupted")
        self.assertIsNone(summary["finalised"])
        self.assertIsNone(summary["qualification_record"])
        self.assertIn("above its reservation", summary["report"]["interrupt_reason"])

    def test_a_qualification_overrun_stops_before_the_next_sample(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        checklist, outcome = support.qualification_samples()
        seen = []

        def judge(request):
            seen.append(request)
            text = support.reference_verdict(prompt_of(request), outcome)
            body = support.openai_body if request.provider == "openai" else support.anthropic_body
            return support.ok(body(text, input_tokens=self.HUGE if len(seen) == 3 else 10))
        summary = self.run_stage(stage="qualify", transport=ScriptedTransport(default=judge),
                                 cfg=support.make_config(), tasks=tasks,
                                 checklist_samples=checklist, outcome_samples=outcome)
        self.assertEqual(len(seen), 3)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIsNone(summary["qualification"])

    def test_the_command_line_exits_non_zero_after_an_overrun(self):
        huge = self.HUGE

        class Overrunning(runner.StubTransport):
            def __call__(self, request):
                response = super().__call__(request)
                if self.calls == 2:
                    payload = json.loads(response.body)
                    payload["usage"]["input_tokens"] = huge
                    return providers.Response(status=200, body=json.dumps(payload),
                                              elapsed_seconds=0.0)
                return response

        cfg_path = os.path.join(self.store, "cfg.json")
        tasks_path = os.path.join(self.store, "tasks.json")
        with open(cfg_path, "w", encoding="utf-8") as stream:
            json.dump(support.config_dict(), stream)
        with open(tasks_path, "w", encoding="utf-8") as stream:
            json.dump(self.tasks, stream)
        lines = []
        with mock.patch.object(runner, "StubTransport", Overrunning), \
                mock.patch.dict(sys.modules, ABSENT):
            code = cli.main(["dry-run", "--config", cfg_path, "--public-tasks", tasks_path,
                             "--private-store", os.path.join(self.store, "store"),
                             "--stub-grade"], out=lines.append)
        text = "\n".join(lines)
        self.assertEqual(code, 3, text)
        self.assertNotEqual(code, 0)
        self.assertIn("status interrupted", text)
        self.assertIn("stopped: interrupted: a charge was above its reservation", text)

    def test_reservations_cover_ordinary_replies_so_the_backstop_stays_quiet(self):
        # The fake provider reports exactly as many input tokens as the prompt has
        # bytes, and a full-length answer: within the bound, so no overrun.
        def step(request, n):
            used = len(prompt_of(request).encode("utf-8"))
            return support.ok(support.openai_body("x", input_tokens=used, output_tokens=4096))
        summary = self.run_stage(transport=model_only(step))
        self.assertEqual(summary["status"], "finalised")
        for line in self.ledger_lines(summary):
            self.assertNotIn("charge_above_reservation", line.get("flags", []))


def pass_bound_openai(tasks):
    """The openai planning bound of one pass for one openai model (3 in / 30
    out) and the fixture's openai judge (6 in / 12 out, limit 400), worked
    the long way: per task, the model request once at its 4096 limit plus one
    outcome classification, input counted as bytes + 256, the answer planned
    as 4096 x 4 = 16384 bytes; then 15% on top."""
    total = Decimal(0)
    for item in tasks:
        prompt_bytes = len(item["prompt"].encode("utf-8"))
        model = (Decimal(prompt_bytes + 256) * 3 + Decimal(4096) * 30) / Decimal(1000000)
        prefix = len(judges.build_outcome_prompt(item["prompt"], "").encode("utf-8")) + 256
        judge = (Decimal(prefix + 16384) * 6 + Decimal(400) * 12) / Decimal(1000000)
        total += model + judge
    return total * Decimal("1.15")


class PassCase(RunnerCase):
    """One openai model and two tasks with 37-byte prompts and no judged
    checks, graded without judges.

    One model request at its limit: (37 + 256) x 3 + 4096 x 30 = 123759 per
    million = 0.123759 USD reserved. The fake provider reports 10 input and 5
    output tokens, so each request is charged (10 x 3 + 5 x 30) / 1e6 =
    0.00018 USD. A pass is 2 slots; with every reply fine it costs 0.00036.
    """

    HELD = Decimal("0.123759")
    CHARGE = Decimal("0.00018")

    def setUp(self):
        super().setUp()
        self.bound = pass_bound_openai(self.tasks)
        for item in self.tasks:
            self.assertEqual(len(item["prompt"].encode("utf-8")), 37)

    def capped(self, openai, **over):
        raw = support.config_dict(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                  caps_usd={"openai": str(openai), "anthropic": "50"}, **over)
        return support.config.validate(raw)

    def fine(self):
        return model_only(lambda request, n: reply_body(request, "answer %d" % n))

    def sent(self, summary):
        return [line["request_id"] for line in self.log(summary) if line["event"] == "sent"]

    def staged(self):
        return os.listdir(os.path.join(self.store, "runs", "_staging"))


class PassOrderTests(RunnerCase):
    def test_the_full_run_is_dispatched_one_pass_at_a_time_judging_included(self):
        cfg = support.make_config()                         # m-oa then m-an
        tasks = [support.task("t1", family=4, checks=2),
                 support.task("t2", family=2, answerable=False), support.task("t3")]
        transport = model_only(lambda r, n: reply_body(r, "an answer"),
                               judge_text=JudgingTests.judge_text(None))
        summary = self.run_stage(transport=transport, cfg=cfg, tasks=tasks,
                                 grade=JudgingTests.grade)
        self.assertEqual(summary["status"], "finalised")
        run_id = summary["run_id"]
        order = []
        for line in self.log(summary):
            if line["event"] != "sent":
                continue
            model, task_id, repeat, rest = line["request_id"][len(run_id) + 1:].split("/", 3)
            order.append((int(repeat), model, task_id, "judge" if rest.startswith("judge/")
                          else "model"))
        # 2 models x 3 tasks = 6 slots a pass, each one model request and 2 judge calls.
        self.assertEqual(len(order), 3 * 6 * 3)
        # Pass 1 is sent in full, judging included, before pass 2; then pass 3.
        self.assertEqual([item[0] for item in order], [1] * 18 + [2] * 18 + [3] * 18)
        passes = [order[start:start + 18] for start in (0, 18, 36)]
        for number, sent in enumerate(passes, 1):
            # Models in config order; every task once per model.
            self.assertEqual([item[1] for item in sent], ["m-oa"] * 9 + ["m-an"] * 9)
            for model in ("m-oa", "m-an"):
                self.assertEqual(sorted({item[2] for item in sent if item[1] == model}),
                                 ["t1", "t2", "t3"])
            # Each slot: its model request, then both judge calls, then the next slot.
            self.assertEqual([item[3] for item in sent], ["model", "judge", "judge"] * 6)
            for start in range(0, 18, 3):
                self.assertEqual(len({item[:3] for item in sent[start:start + 3]}), 1)
            # The same slot order in every pass.
            self.assertEqual([item[1:] for item in sent], [item[1:] for item in passes[0]])
        with open(os.path.join(summary["dir"], "plan.json"), encoding="utf-8") as stream:
            plan = json.load(stream)
        self.assertEqual([slot["repeat"] for slot in plan], [1] * 6 + [2] * 6 + [3] * 6)
        # Slot records keep their `repeat` field.
        rows = self.rows(summary)
        self.assertEqual([row["repeat"] for row in rows], [1] * 6 + [2] * 6 + [3] * 6)
        self.assertEqual(summary["passes"], {"required": 3, "complete": 3})
        self.assertEqual([gate["pass"] for gate in summary["pass_gates"]], [1, 2, 3])
        self.assertTrue(all(gate["ok"] and gate["slots"] == 6 for gate in summary["pass_gates"]))

    def test_plan_slots_follows_the_configured_repeats(self):
        cfg = support.make_config()
        tasks = preflight.normalise_tasks([support.task("t1"), support.task("t2")])
        slots = runner.plan_slots(cfg, tasks, "full", 5, "RUN")
        self.assertEqual([slot["repeat"] for slot in slots], [1] * 4 + [2] * 4 + [3] * 4)
        self.assertEqual([slot["model_id"] for slot in slots], ["m-oa", "m-oa", "m-an", "m-an"] * 3)
        with mock.patch.object(preflight, "REPEATS", 2):
            self.assertEqual([slot["repeat"] for slot in
                              runner.plan_slots(cfg, tasks, "full", 5, "RUN")], [1] * 4 + [2] * 4)
        # The canary is one pass.
        self.assertEqual([slot["repeat"] for slot in
                          runner.plan_slots(cfg, tasks, "canary", 5, "RUN")], [1] * 4)


class PassGateRunTests(PassCase):
    def test_pass_two_is_not_started_when_the_remaining_cap_is_short(self):
        # The cap is exactly one pass's planning bound. Pass 1 starts (the bound
        # is not above the cap). It costs 2 x 0.00018 = 0.00036, so what is left
        # is 0.00036 short of the bound and pass 2 does not start.
        scored, printed = [], []
        transport = self.fine()
        summary = self.run_stage(transport=transport, cfg=self.capped(self.bound),
                                 out=printed.append,
                                 scores=lambda rows, tasks: scored.append(rows))
        self.assertEqual(summary["status"], "incomplete")
        self.assertNotEqual(summary["status"], "interrupted")
        self.assertIsNone(summary["finalised"])
        self.assertFalse(summary["publishable"])
        self.assertEqual(scored, [])                              # never scored
        self.assertEqual(len(transport.requests), 2)              # pass 1 only
        self.assertEqual(summary["passes"], {"required": 3, "complete": 1})
        # Pass 1 is intact: both slots final, with their answers.
        rows = self.rows(summary)
        self.assertEqual([(r["repeat"], r["outcome"], r["pass"], r["pending"]) for r in rows],
                         [(1, "answered", True, False)] * 2)
        self.assertEqual(sorted(r["reply"] for r in rows), ["answer 1", "answer 2"])
        counts = summary["report"]["models"]["m-oa"]
        self.assertEqual((counts["planned"], counts["attempted"], counts["unstarted"]), (6, 2, 4))
        self.assertEqual(summary["run_committed_usd"], Decimal("0.00036"))
        # The gates: pass 1 passed, pass 2 refused, pass 3 never reached.
        first, second = summary["pass_gates"]
        self.assertEqual((first["pass"], first["ok"]), (1, True))
        self.assertEqual((second["pass"], second["ok"], second["provider"]), (2, False, "openai"))
        self.assertEqual(second["planning_bound"]["openai"], self.bound)
        self.assertEqual(second["remaining_caps"]["openai"], self.bound - Decimal("0.00036"))
        # A printed line names the provider, the pass, its bound and the remaining cap.
        line = ("  INCOMPLETE: pass 2 of 3 not started: the openai planning bound of this "
                "pass, %s USD, is above the remaining cap %s USD. Finished passes are kept; "
                "the run is not scored." % (
                    (self.bound).quantize(Decimal("0.0001")),
                    (self.bound - Decimal("0.00036")).quantize(Decimal("0.0001"))))
        self.assertIn(line, printed)
        report = summary["report"]
        self.assertEqual(report["status"], "incomplete")
        self.assertEqual(report["stopped_providers"], ["openai"])
        self.assertIn("pass 2 of 3 not started", report["interrupt_reason"])
        # It stays in staging, unscored and unpublished.
        self.assertIn(os.path.join("runs", "_staging"), summary["dir"])
        self.assertFalse(os.path.exists(os.path.join(summary["dir"], "slots.json")))
        self.assertFalse(os.path.exists(os.path.join(summary["dir"], "scores.json")))
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))
        with open(os.path.join(summary["dir"], "run.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream)["status"], "incomplete")

    def test_pass_three_is_gated_on_what_the_first_two_really_cost(self):
        # 0.00036 more cap: pass 2 fits exactly (bound + 0.00036 - 0.00036), and
        # after it 0.00072 is spent, so pass 3 is 0.00036 short.
        transport = self.fine()
        summary = self.run_stage(transport=transport,
                                 cfg=self.capped(self.bound + Decimal("0.00036")))
        self.assertEqual(summary["status"], "incomplete")
        self.assertEqual(len(transport.requests), 4)
        self.assertEqual(summary["passes"], {"required": 3, "complete": 2})
        self.assertEqual([(g["pass"], g["ok"]) for g in summary["pass_gates"]],
                         [(1, True), (2, True), (3, False)])
        self.assertEqual(summary["pass_gates"][1]["remaining_caps"]["openai"], self.bound)
        self.assertEqual(summary["pass_gates"][2]["remaining_caps"]["openai"],
                         self.bound - Decimal("0.00036"))
        self.assertIn("pass 3 of 3 not started", summary["report"]["interrupt_reason"])
        # 0.00072 more than one bound: all three passes start, and the run is finalised.
        transport = self.fine()
        summary = self.run_stage(transport=transport,
                                 cfg=self.capped(self.bound + Decimal("0.00072")))
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual(len(transport.requests), 6)
        self.assertEqual(summary["passes"], {"required": 3, "complete": 3})

    def test_the_gate_counts_a_request_held_at_its_reserved_maximum(self):
        # Every request of pass 1 times out and is held at its full reservation
        # (0.123759 each, 0.247518 for the two). With 0.2 of cap above one
        # bound, pass 2 would fit after two ordinary replies (0.00036) and does
        # not fit after 0.247518.
        def step(request, n):
            return providers.TransportTimeout()
        cap = self.bound + Decimal("0.2")
        transport = model_only(step)
        summary = self.run_stage(transport=transport, cfg=self.capped(cap))
        self.assertEqual(summary["status"], "incomplete")
        self.assertEqual(len(transport.requests), 2)
        self.assertEqual(summary["pass_gates"][1]["remaining_caps"]["openai"],
                         cap - Decimal("0.247518"))

    def test_the_whole_plan_gate_refuses_a_stage_before_any_request(self):
        # The expected cost of the full run is far above 0.01 on openai.
        transport = self.fine()
        with self.assertRaises(preflight.PreflightRefused) as caught:
            self.run_stage(transport=transport, cfg=self.capped("0.01"))
        self.assertIn("openai: whole-plan gate: 2 x the expected cost", str(caught.exception))
        self.assertEqual(transport.requests, [])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs")))

    def test_the_canary_is_one_gated_pass(self):
        printed = []
        summary = self.run_stage(stage="canary", transport=self.fine(), out=printed.append)
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual([(g["pass"], g["passes"], g["ok"]) for g in summary["pass_gates"]],
                         [(1, 1, True)])
        self.assertIsNone(summary["passes"]["required"])
        self.assertTrue(any(line.startswith("  pass 1 of 1, 2 slots to run") for line in printed))

    def test_an_incomplete_run_cannot_be_finalised_or_scored_by_hand(self):
        summary = self.run_stage(transport=self.fine(), cfg=self.capped(self.bound))
        record = records.RunRecord.reopen(self.store, summary["run_id"])
        self.addCleanup(record._log.close)
        with self.assertRaises(records.RecordError) as caught:
            record.finalise({"day_to_day": 100})
        self.assertIn("has 1 of 3 passes complete: a run with fewer than 3 complete passes is "
                      "never finalised or scored", str(caught.exception))
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", summary["run_id"])))


class ResumeTests(PassCase):
    def timeouts_then_fine(self, timeouts=2):
        def step(request, n):
            if n <= timeouts:
                return providers.TransportTimeout()
            return reply_body(request, "answer %d" % n)
        return model_only(step)

    def run_json(self, summary):
        with open(os.path.join(summary["dir"], "run.json"), encoding="utf-8") as stream:
            return json.load(stream)

    def test_an_incomplete_run_resumes_at_the_refused_pass_and_sends_nothing_twice(self):
        # Both requests of pass 1 time out and keep their full reservation:
        # 2 x 0.123759 = 0.247518. With 0.2 of cap above one bound, pass 2 has
        # bound - 0.047518 left and does not start.
        cap = self.bound + Decimal("0.2")
        first = self.timeouts_then_fine()
        stopped = self.run_stage(transport=first, cfg=self.capped(cap))
        self.assertEqual(stopped["status"], "incomplete")
        run_id = stopped["run_id"]
        before_rows = self.rows(stopped)
        before_sent = self.sent(stopped)
        self.assertEqual(len(before_sent), 2)
        with open(os.path.join(stopped["dir"], "plan.json"), "rb") as stream:
            plan_bytes = stream.read()
        # The caps the run started with are in its record.
        started = self.run_json(stopped)
        self.assertEqual(started["caps_usd"], {"anthropic": "50", "openai": str(cap)})
        self.assertIsNone(started["max_usd"])
        # Resumed under the same cap: still short, so nothing is sent.
        again = self.fine()
        same = self.run_stage(transport=again, cfg=self.capped(cap), resume=run_id)
        self.assertEqual((same["status"], same["run_id"], same["resumed"]),
                         ("incomplete", run_id, True))
        self.assertEqual(again.requests, [])
        # Raising the cap is not a way out: the resume is refused, nothing is
        # sent, and the run stays incomplete on disk with no new resume line.
        raised = self.fine()
        with self.assertRaises(records.RecordError) as caught:
            self.run_stage(transport=raised, resume=run_id,
                           cfg=self.capped(cap + Decimal("0.00072")))
        self.assertIn("cannot be resumed with a higher cap: the openai cap is %s USD, above "
                      "the %s USD the run started with" % (cap + Decimal("0.00072"), cap),
                      str(caught.exception))
        self.assertEqual(raised.requests, [])
        self.assertEqual(self.run_json(same)["status"], "incomplete")
        self.assertEqual(len(self.run_json(same)["resumed"]), 1)
        # The legitimate way: the two held requests are reconciled against the
        # provider console at what they really cost, 0.00018 each. That frees
        # room inside the same cap, and the run carries on under it.
        path = os.path.join(self.store, "ledgers-dry", run_id, "openai.jsonl")
        book = ledger.ProviderLedger("openai", cap, path)
        for request in before_sent:
            book.reconcile(request, self.CHARGE, "console figure")
        scored = []
        second = self.fine()
        done = self.run_stage(transport=second, resume=run_id, cfg=self.capped(cap),
                              scores=lambda rows, tasks: scored.append(rows) or {"s": 1})
        self.assertEqual((done["status"], done["run_id"]), ("finalised", run_id))
        self.assertEqual(len(second.requests), 4)                 # passes 2 and 3 only
        self.assertEqual([g["pass"] for g in done["pass_gates"]], [2, 3])
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        # Nothing was sent twice: 6 request ids, all different, pass 1's unchanged.
        sent = self.sent(done)
        self.assertEqual(len(sent), 6)
        self.assertEqual(len(set(sent)), 6)
        self.assertEqual(sent[:2], before_sent)
        rows = self.rows(done)
        self.assertEqual(rows[:2], before_rows)
        self.assertEqual([r["repeat"] for r in rows], [1, 1, 2, 2, 3, 3])
        self.assertEqual(len(scored), 1)
        self.assertEqual(len(scored[0]), 6)
        # The plan was not rewritten, and the finalised folder verifies.
        with open(os.path.join(done["dir"], "plan.json"), "rb") as stream:
            self.assertEqual(stream.read(), plan_bytes)
        records.verify_manifest(done["dir"])
        # One ledger for the whole run: 6 reservations, each settled once, and
        # the two reconciliations.
        with open(path, encoding="utf-8") as stream:
            events = [json.loads(line) for line in stream]
        self.assertEqual(sorted(e["request_id"] for e in events if e["event"] == "reserve"),
                         sorted(sent))
        self.assertEqual(len([e for e in events if e["event"] == "settle"]), 6)
        self.assertEqual(len([e for e in events if e["event"] == "reconcile"]), 2)
        # The whole run stayed inside the cap it started with.
        self.assertEqual(done["run_committed_usd"], 6 * self.CHARGE)
        self.assertLessEqual(done["run_committed_usd"], cap)
        # The caps at the start are unchanged in the record, and each of the
        # two resumes that went ahead wrote its own line.
        final = self.run_json(done)
        self.assertEqual(final["caps_usd"], started["caps_usd"])
        self.assertEqual(len(final["resumed"]), 2)
        # A finalised run is not resumed.
        with self.assertRaises(records.RecordError):
            self.run_stage(transport=self.fine(), resume=run_id, cfg=self.capped(cap))

    def test_a_resume_never_raises_a_cap_and_a_refused_pass_stays_incomplete(self):
        # The cap is exactly one pass's bound and the run starts with
        # --max-usd 5. Pass 1 costs 0.00036, so pass 2 does not fit: incomplete.
        start_cfg = self.capped(self.bound)
        stopped = self.run_stage(transport=self.fine(), cfg=start_cfg, max_usd=Decimal("5"))
        self.assertEqual(stopped["status"], "incomplete")
        run_id = stopped["run_id"]
        started = self.run_json(stopped)
        self.assertEqual(started["caps_usd"], {"anthropic": "50", "openai": str(self.bound)})
        self.assertEqual(started["max_usd"], "5")
        more = self.bound + Decimal("0.000001")
        refusals = [
            (dict(cfg=self.capped(more), max_usd=Decimal("5")),
             "the openai cap is %s USD, above the %s USD the run started with"
             % (more, self.bound)),
            (dict(cfg=support.config.validate(support.config_dict(
                models=[support.spec_dict("openai", "m-oa", "3", "30")],
                caps_usd={"openai": str(self.bound), "anthropic": "50.01"})),
                max_usd=Decimal("5")),
             "the anthropic cap is 50.01 USD, above the 50 USD the run started with"),
            (dict(cfg=start_cfg, max_usd=Decimal("5.01")),
             "--max-usd is 5.01, above the 5 the run started with"),
            (dict(cfg=start_cfg), "the run started with --max-usd 5 and none was given"),
            (dict(cfg=self.capped("50"), max_usd=Decimal("100")),
             "the openai cap is 50 USD"),
        ]
        for kwargs, fragment in refusals:
            transport = self.fine()
            with self.assertRaises(records.RecordError) as caught:
                self.run_stage(transport=transport, resume=run_id, **kwargs)
            self.assertIn("cannot be resumed with a higher cap", str(caught.exception))
            self.assertIn(fragment, str(caught.exception))
            self.assertEqual(transport.requests, [])
        self.assertNotIn("resumed", self.run_json(stopped))       # nothing was reopened
        # The same caps, or lower ones, are accepted. There is still no room
        # for pass 2, so the run stays incomplete and nothing is sent.
        lower = self.bound - Decimal("0.1")
        accepted = [dict(cfg=start_cfg, max_usd=Decimal("5")),
                    dict(cfg=self.capped(lower), max_usd=Decimal("4")),
                    # back up to the starting caps, never above them
                    dict(cfg=start_cfg, max_usd=Decimal("5"))]
        for kwargs in accepted:
            transport = self.fine()
            again = self.run_stage(transport=transport, resume=run_id, **kwargs)
            self.assertEqual((again["status"], again["resumed"]), ("incomplete", True))
            self.assertEqual(transport.requests, [])
            self.assertEqual(again["run_committed_usd"], Decimal("0.00036"))
        final = self.run_json(stopped)
        self.assertEqual((final["status"], final["caps_usd"], final["max_usd"]),
                         ("incomplete", started["caps_usd"], "5"))
        # Each resume is on file with the caps it ran under and the config hash.
        notes = final["resumed"]
        self.assertEqual(len(notes), 3)
        for note in notes:
            self.assertEqual(note["caps_at_start"],
                             {"caps_usd": started["caps_usd"], "max_usd": "5"})
            self.assertRegex(note["config_sha256"], r"^[0-9a-f]{0,64}$")
        self.assertEqual(notes[1]["caps_in_force"],
                         {"caps_usd": {"anthropic": "50", "openai": str(lower)},
                          "max_usd": "4"})
        self.assertEqual(notes[2]["caps_in_force"],
                         {"caps_usd": started["caps_usd"], "max_usd": "5"})
        logged = [line for line in self.log(stopped) if line["event"] == "resumed"]
        self.assertEqual([line["caps_in_force"] for line in logged],
                         [note["caps_in_force"] for note in notes])
        self.assertEqual(logged[1]["caps_at_start"]["caps_usd"], started["caps_usd"])
        # A --max-usd may be added to a run that started without one.
        bare = self.run_stage(transport=self.fine(), cfg=start_cfg)
        added = self.run_stage(transport=self.fine(), cfg=start_cfg, resume=bare["run_id"],
                               max_usd=Decimal("3"))
        self.assertEqual(added["status"], "incomplete")
        self.assertIsNone(self.run_json(added)["max_usd"])
        self.assertEqual(self.run_json(added)["resumed"][0]["caps_in_force"]["max_usd"], "3")

    def test_a_record_without_its_starting_caps_is_not_resumed(self):
        stopped = self.run_stage(transport=self.fine(), cfg=self.capped(self.bound))
        path = os.path.join(stopped["dir"], "run.json")
        document = self.run_json(stopped)
        del document["caps_usd"]
        with open(path, "w", encoding="utf-8") as stream:
            json.dump(document, stream)
        transport = self.fine()
        with self.assertRaises(records.RecordError) as caught:
            self.run_stage(transport=transport, resume=stopped["run_id"],
                           cfg=self.capped(self.bound))
        self.assertIn("its record does not hold the caps it started with",
                      str(caught.exception))
        self.assertEqual(transport.requests, [])

    def test_a_run_stopped_mid_pass_resumes_in_order_without_reusing_a_request_id(self):
        # The third model request (the first slot of pass 2) is in flight when
        # the run is stopped from outside.
        def step(request, n):
            return KeyboardInterrupt() if n == 3 else reply_body(request, "answer %d" % n)
        first = model_only(step)
        with self.assertRaises(KeyboardInterrupt):
            self.run_stage(transport=first)
        self.assertEqual(len(first.requests), 3)
        (run_id,) = self.staged()
        # The gate at resume counts the reservation that was left open. With 0.1
        # of cap above one bound, pass 2 would fit after the 0.00036 really
        # spent; with the open 0.123759 as well it does not, and nothing is sent.
        short = self.fine()
        held = self.run_stage(transport=short, resume=run_id,
                              cfg=self.capped(self.bound + Decimal("0.1")))
        self.assertEqual(held["status"], "incomplete")
        self.assertEqual(short.requests, [])
        self.assertEqual(held["pass_gates"][0]["remaining_caps"]["openai"],
                         self.bound + Decimal("0.1") - Decimal("0.00036") - self.HELD)
        second = self.fine()
        printed = []
        done = self.run_stage(transport=second, resume=run_id, out=printed.append)
        self.assertEqual(done["status"], "finalised")
        # Pass 1 is not sent again. Pass 2 resumes with both of its slots: the
        # stopped slot has no row yet. Then pass 3. 4 requests.
        self.assertEqual(len(second.requests), 4)
        self.assertTrue(any(line.startswith("  pass 2 of 3, 2 slots to run")
                            for line in printed))
        self.assertEqual([g["pass"] for g in done["pass_gates"]], [2, 3])
        sent = self.sent(done)
        self.assertEqual(len(sent), 7)
        self.assertEqual(len(set(sent)), 7)
        rows = self.rows(done)
        self.assertEqual([r["repeat"] for r in rows], [1, 1, 2, 2, 3, 3])
        stopped = rows[2]
        # The request that was in flight is kept on the slot and counted as one
        # of its three; the slot went on with request 2, never request 1 again.
        self.assertEqual([q["request_id"] for q in stopped["requests"]],
                         [stopped["slot_id"] + "/1", stopped["slot_id"] + "/2"])
        self.assertEqual([q["status"] for q in stopped["requests"]],
                         ["in_flight_when_stopped", "ok"])
        self.assertEqual(stopped["requests"][0]["ledger_flags"], ["reservation_left_open"])
        self.assertEqual((stopped["outcome"], stopped["pass"]), ("answered", True))
        # Its cost holds the open reservation in full: 0.123759 + 0.00018.
        self.assertEqual(Decimal(stopped["cost_usd_exact"]), Decimal("0.123939"))
        # The ledger still holds that reservation open: 6 fine requests settled
        # at 0.00018 each, plus 0.123759 never settled.
        self.assertEqual(done["remaining_caps"]["openai"],
                         Decimal("50") - 6 * self.CHARGE - self.HELD)

    def test_a_slot_that_had_used_its_requests_is_not_sent_again(self):
        # Requests 3 and 4 fail to connect; request 5, the slot's third, is in
        # flight when the run stops.
        def step(request, n):
            if n in (3, 4):
                return providers.TransportFailure("down")
            return KeyboardInterrupt() if n == 5 else reply_body(request, "x")
        with self.assertRaises(KeyboardInterrupt):
            self.run_stage(transport=model_only(step))
        (run_id,) = self.staged()
        second = self.fine()
        done = self.run_stage(transport=second, resume=run_id)
        self.assertEqual(len(second.requests), 3)                 # not the used-up slot
        rows = self.rows(done)
        used = rows[2]
        self.assertEqual(len(used["requests"]), 3)
        self.assertEqual((used["outcome"], used["pass"], used["pending"]),
                         ("execution_error", False, False))
        self.assertEqual(used["failure_reason"],
                         "the slot had used its requests before the run was resumed")
        self.assertEqual(done["status"], "finalised")

    def test_a_paid_answer_without_a_row_is_kept_and_never_asked_for_again(self):
        calls = {"n": 0}

        def grade(task, reply, judged=None):
            calls["n"] += 1
            if calls["n"] == 3:
                raise KeyboardInterrupt()           # stopped after the answer was paid for
            return answered(task, reply)
        first = self.fine()
        with self.assertRaises(KeyboardInterrupt):
            self.run_stage(transport=first, grade=grade)
        self.assertEqual(len(first.requests), 3)
        (run_id,) = self.staged()
        second = self.fine()
        printed = []
        done = self.run_stage(transport=second, resume=run_id, out=printed.append)
        # The third answer is settled and on record: only the 3 slots after it
        # are sent, and the kept answer is graded without a model request.
        self.assertEqual(len(second.requests), 3)
        self.assertEqual([prompt_of(r) for r in second.requests].count(
            self.rows(done)[2]["prompt"]), 1)                    # in pass 3 only
        sent = self.sent(done)
        self.assertEqual((len(sent), len(set(sent))), (6, 6))
        kept = self.rows(done)[2]
        self.assertEqual(kept["reply"], "answer 3")
        self.assertEqual((kept["outcome"], kept["pass"], kept["pending"]),
                         ("answered", True, False))
        self.assertEqual(kept["flags"], ["finished_on_resume"])
        self.assertEqual([q["request_id"] for q in kept["requests"]], [kept["slot_id"] + "/1"])
        self.assertEqual(kept["requests"][0]["status"], "ok")
        self.assertEqual(Decimal(kept["cost_usd_exact"]), self.CHARGE)
        self.assertEqual(kept["time_s"], 0.5)
        # The gate of the resumed pass counted the slot to finish.
        self.assertEqual([(g["pass"], g["slots"], g["finishing"]) for g in done["pass_gates"]],
                         [(2, 2, 1), (3, 2, 0)])
        self.assertTrue(any(line.startswith(
            "  pass 2 of 3, 2 slots to run (1 of them only to grade and judge")
            for line in printed))
        # Every pass is complete, so the run is finalised.
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        records.verify_manifest(done["dir"])

    def test_a_slot_left_pending_by_the_grader_is_graded_again_on_resume(self):
        calls = {"n": 0}

        def broken(task, reply, judged=None):
            calls["n"] += 1
            if calls["n"] >= 3:
                raise RuntimeError("the grader is not available")
            return answered(task, reply)
        first = self.fine()
        stopped = self.run_stage(transport=first, grade=broken)
        self.assertEqual(stopped["status"], "interrupted")
        self.assertIn("the grader could not run", stopped["report"]["interrupt_reason"])
        self.assertEqual(len(first.requests), 3)
        run_id = stopped["run_id"]
        pending = self.rows(stopped)[2]
        self.assertEqual((pending["outcome"], pending["pass"], pending["pending"],
                          pending["flags"]),
                         ("judge_unresolved", None, True, ["grader_error:RuntimeError"]))
        # Still unavailable: the answer is graded again, fails again, and the
        # model is not asked. The slot stays pending and the run unscored.
        still = self.fine()
        again = self.run_stage(transport=still, grade=broken, resume=run_id)
        self.assertEqual((again["status"], still.requests), ("interrupted", []))
        self.assertEqual(again["passes"], {"required": 3, "complete": 1})
        self.assertIsNone(again["finalised"])
        # Available: graded from the record, then the unsent slots are sent.
        second = self.fine()
        done = self.run_stage(transport=second, resume=run_id)
        self.assertEqual(len(second.requests), 3)
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        row = self.rows(done)[2]
        self.assertEqual(row["slot_id"], pending["slot_id"])
        self.assertEqual((row["reply"], row["outcome"], row["pass"], row["pending"]),
                         ("answer 3", "answered", True, False))
        self.assertEqual(row["flags"], ["finished_on_resume"])
        self.assertEqual([q["request_id"] for q in row["requests"]], [row["slot_id"] + "/1"])
        sent = self.sent(done)
        self.assertEqual((len(sent), len(set(sent))), (6, 6))
        # The log is append-only: all three rows of the slot are in it, and
        # the last one is the one in slots.json.
        states = [line["slot"]["pending"] for line in self.log(done)
                  if line["event"] == "slot" and line["slot"]["slot_id"] == row["slot_id"]]
        self.assertEqual(states, [True, True, False])

    def test_a_run_is_only_resumed_as_the_same_run(self):
        stopped = self.run_stage(transport=self.fine(), cfg=self.capped(self.bound))
        run_id = stopped["run_id"]
        cases = [
            # another model price: anything but the money fields makes it a different run
            (dict(cfg=support.config.validate(support.config_dict(
                models=[support.spec_dict("openai", "m-oa", "4", "30")]))),
             "the run config has changed"),
            (dict(cfg=self.capped(self.bound), tasks=[support.task("t1"), support.task(
                "t2", prompt="Another prompt")]), "the task set has changed"),
            (dict(cfg=self.capped(self.bound), stage="canary"), "it is a full run"),
        ]
        for kwargs, fragment in cases:
            transport = self.fine()
            with self.assertRaises(records.RecordError) as caught:
                self.run_stage(transport=transport, resume=run_id, **kwargs)
            self.assertIn(fragment, str(caught.exception))
            self.assertEqual(transport.requests, [])
        with self.assertRaises(records.RecordError) as caught:
            self.run_stage(transport=self.fine(), resume="2026-01-01T000000Z-00000000")
        self.assertIn("no run in staging to resume", str(caught.exception))
        with self.assertRaises(records.RecordError) as caught:
            self.run_stage(stage="qualify", resume=run_id, checklist_samples=[],
                           outcome_samples=[])
        self.assertIn("a judge qualification is not resumed", str(caught.exception))


class FinishJudgingOnResumeTests(JudgingTests):
    """A resume finishes the judging a stopped run left undone, without
    asking the model again. One openai model; t1 has two judged checks and
    t2 has no knowable answer, so every slot goes to both judges."""

    def sent(self, summary):
        return [line["request_id"] for line in self.log(summary) if line["event"] == "sent"]

    def staged(self):
        return os.listdir(os.path.join(self.store, "runs", "_staging"))

    def transport(self, stop_at_judge_request=None, **verdicts):
        text = self.judge_text(**verdicts)
        seen = {"n": 0}

        def judge(request, prompt):
            seen["n"] += 1
            if seen["n"] == stop_at_judge_request:
                return KeyboardInterrupt()
            return text(request, prompt)
        return model_only(lambda r, n: reply_body(r, "an answer"), judge_text=judge)

    @staticmethod
    def split(transport):
        prompts = [(r.body["model"], is_judge_prompt(prompt_of(r))) for r in transport.requests]
        return ([model for model, judge in prompts if not judge],
                [model for model, judge in prompts if judge])

    def test_a_run_stopped_between_answer_and_judging_is_finished_without_a_second_answer(self):
        # Each slot makes 2 judge requests, j-oa then j-an. The 6th is j-an on
        # the third slot (the first of pass 2): the run is stopped from outside
        # while it is in flight. The answer and j-oa's verdict are on record.
        first = self.transport(stop_at_judge_request=6)
        with self.assertRaises(KeyboardInterrupt):
            self.run_stage(transport=first, grade=self.grade)
        self.assertEqual(self.split(first), (["m-oa"] * 3, ["j-oa", "j-an"] * 3))
        (run_id,) = self.staged()
        second = self.transport()
        printed = []
        done = self.run_stage(transport=second, grade=self.grade, resume=run_id,
                              out=printed.append)
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        models, asked = self.split(second)
        # No second model request for the stopped slot: 3 slots were unsent.
        self.assertEqual(models, ["m-oa"] * 3)
        # Only the judging that was missing: j-an for the stopped slot, then
        # both judges for each of the 3 unsent slots. j-oa is not asked again.
        self.assertEqual(asked, ["j-an"] + ["j-oa", "j-an"] * 3)
        rows = self.rows(done)
        stopped = rows[2]
        answers = [r for r in first.requests + second.requests
                   if prompt_of(r) == stopped["prompt"]]
        self.assertEqual(len(answers), 3)                        # once per pass, never twice
        self.assertEqual([q["request_id"] for q in stopped["requests"]],
                         [stopped["slot_id"] + "/1"])
        kind = "outcome_classification" if stopped["task_id"] == "t2" else "checklist_judging"
        base = stopped["slot_id"] + "/judge/"
        # The request that was in flight counts as one of j-an's two; the
        # resume used number 2 and never number 1 again.
        self.assertEqual([(q["request_id"], q["status"]) for q in stopped["judge_requests"]],
                         [(base + "j-oa/%s/1" % kind, "ok"),
                          (base + "j-an/%s/1" % kind, "in_flight_when_stopped"),
                          (base + "j-an/%s/2" % kind, "ok")])
        self.assertEqual((stopped["pass"], stopped["pending"]), (True, False))
        self.assertEqual(stopped["flags"], ["finished_on_resume"])
        detail = stopped["judged"]["detail"]["outcome" if stopped["task_id"] == "t2"
                                             else "checklist"]
        self.assertEqual(detail[0]["attempts"], [{
            "attempt": 1, "result": "ok",
            "detail": "verdict taken from the run log; the judge was not asked again"}])
        self.assertEqual(detail[1]["attempts"][-1], {"attempt": 2, "result": "ok"})
        # Its judge cost holds every judge request of the slot.
        self.assertEqual(Decimal(stopped["judge_cost_usd"]),
                         sum(Decimal(q["charge_usd"]) for q in stopped["judge_requests"]))
        sent = self.sent(done)
        self.assertEqual((len(sent), len(set(sent))), (19, 19))
        self.assertEqual([(g["pass"], g["slots"], g["finishing"]) for g in done["pass_gates"]],
                         [(2, 2, 1), (3, 2, 0)])
        self.assertFalse(any("one further request" in line for line in printed))
        records.verify_manifest(done["dir"])

    def test_an_unresolved_judge_gets_one_further_request_per_resume_and_then_resolves(self):
        bad = {"checklist": {"j-oa": "never valid"}}
        first = self.transport(**bad)
        waiting = self.run_stage(transport=first, grade=self.grade)
        self.assertEqual(waiting["status"], "pending_judging")
        self.assertEqual(waiting["passes"], {"required": 3, "complete": 0})
        run_id = waiting["run_id"]
        pending = [r["slot_id"] for r in self.rows(waiting) if r["pending"]]
        self.assertEqual(len(pending), 3)                        # t1 in each pass
        # Resume 1, the judge still unresolved. Each pending slot gets one
        # further j-oa request, number 3, and no more. j-an's verdict is on
        # record and it is not asked. No model request at all.
        still = self.transport(**bad)
        printed = []
        again = self.run_stage(transport=still, grade=self.grade, resume=run_id,
                               out=printed.append)
        self.assertEqual(self.split(still), ([], ["j-oa"] * 3))
        self.assertEqual((again["status"], again["finalised"]), ("pending_judging", None))
        self.assertFalse(again["publishable"])
        self.assertEqual(again["passes"], {"required": 3, "complete": 0})
        notes = [line for line in self.log(again)
                 if line["event"] == "judge_attempt_added_on_resume"]
        self.assertEqual([n["slot_id"] for n in notes], pending)
        for note in notes:
            self.assertEqual(note["request_id"],
                             note["slot_id"] + "/judge/j-oa/checklist_judging/3")
            self.assertEqual((note["judge"], note["earlier_requests"], note["allowed"]),
                             ("j-oa", 2, 2))
        self.assertEqual(len([line for line in printed if "one further request" in line]), 3)
        for row in (r for r in self.rows(again) if r["task_id"] == "t1"):
            self.assertEqual((row["pass"], row["pending"]), (None, True))
            self.assertEqual(row["flags"],
                             ["finished_on_resume", "judge_attempt_added_on_resume"])
        # Resume 2, the judge answers. One further request each, number 4.
        fine = self.transport()
        done = self.run_stage(transport=fine, grade=self.grade, resume=run_id)
        self.assertEqual(self.split(fine), ([], ["j-oa"] * 3))
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        for row in (r for r in self.rows(done) if r["task_id"] == "t1"):
            self.assertEqual(row["judged"]["checks"], {"c1": "pass", "c2": "pass"})
            self.assertEqual((row["outcome"], row["pass"], row["pending"]),
                             ("answered", True, False))
            self.assertEqual(len(row["requests"]), 1)
            self.assertEqual([q["request_id"].rpartition("/judge/")[2]
                              for q in row["judge_requests"]],
                             ["j-oa/checklist_judging/1", "j-oa/checklist_judging/2",
                              "j-an/checklist_judging/1", "j-oa/checklist_judging/3",
                              "j-oa/checklist_judging/4"])
            self.assertEqual(Decimal(row["judge_cost_usd"]),
                             sum(Decimal(q["charge_usd"]) for q in row["judge_requests"]))
        # 6 answers, 15 judge requests in the first run, 3 in each resume.
        sent = self.sent(done)
        self.assertEqual((len(sent), len(set(sent))), (27, 27))
        self.assertEqual(len(self.run_json(done)["resumed"]), 2)
        records.verify_manifest(done["dir"])

    def run_json(self, summary):
        with open(os.path.join(summary["dir"], "run.json"), encoding="utf-8") as stream:
            return json.load(stream)

    def capped(self, openai):
        return support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                   caps_usd={"openai": str(openai), "anthropic": "50"})

    def test_the_caps_and_the_pass_gate_still_refuse_a_resume_that_only_has_judging_left(self):
        bad = {"checklist": {"j-oa": "never valid"}}
        waiting = self.run_stage(transport=self.transport(**bad), grade=self.grade)
        self.assertEqual(waiting["status"], "pending_judging")
        run_id = waiting["run_id"]
        spent = Decimal("50") - waiting["remaining_caps"]["openai"]
        # A raised cap is refused before anything is reopened or sent.
        raised = self.transport()
        with self.assertRaises(records.RecordError) as caught:
            self.run_stage(transport=raised, grade=self.grade, resume=run_id,
                           cfg=self.capped("50.01"))
        self.assertIn("cannot be resumed with a higher cap", str(caught.exception))
        self.assertEqual(raised.requests, [])
        self.assertNotIn("resumed", self.run_json(waiting))
        # The pass gate counts the pending judging of the pass. With next to
        # nothing left of a lowered openai cap, pass 1 is not started: no
        # request is sent and the slot stays pending.
        tight = self.transport()
        held = self.run_stage(transport=tight, grade=self.grade, resume=run_id,
                              cfg=self.capped(spent + Decimal("0.000001")))
        self.assertEqual((held["status"], tight.requests), ("incomplete", []))
        gate = held["pass_gates"][0]
        self.assertEqual((gate["pass"], gate["ok"], gate["provider"]), (1, False, "openai"))
        self.assertEqual((gate["slots"], gate["finishing"]), (1, 1))
        self.assertEqual(held["passes"], {"required": 3, "complete": 0})
        self.assertEqual(len([r for r in self.rows(held) if r["pending"]]), 3)
        # The reservation does not lean on the gate. With a gate that admits
        # everything, the ledger still refuses the one further request under
        # the same cap: nothing is sent and the run stops.
        real_gate = preflight.pass_gate

        def admits(*args, **kwargs):
            return dict(real_gate(*args, **kwargs), ok=True, reason=None, provider=None)
        short = self.transport()
        with mock.patch.object(preflight, "pass_gate", admits):
            stopped = self.run_stage(transport=short, grade=self.grade, resume=run_id,
                                     cfg=self.capped(spent + Decimal("0.000001")))
        self.assertEqual((stopped["status"], short.requests), ("interrupted", []))
        self.assertIn("interrupted by cap", stopped["report"]["interrupt_reason"])
        row = next(r for r in self.rows(stopped) if r["pending"])
        self.assertIn("judging_refused_by_cap", row["flags"])
        # A second owner of the store is refused as before.
        lock = ledger.StoreLock(self.store).acquire("run-held")
        try:
            with self.assertRaises(runner.LiveRefused):
                self.run_stage(transport=short, grade=self.grade, resume=run_id)
        finally:
            lock.release()
        self.assertEqual(short.requests, [])
        # Under the caps it started with, the run is finished.
        done = self.run_stage(transport=self.transport(), grade=self.grade, resume=run_id)
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        sent = self.sent(done)
        self.assertEqual(len(sent), len(set(sent)))

    def test_a_canary_left_pending_is_finished_on_resume(self):
        # j-an gives no verdict on the checklist: its first request and its
        # retry are both malformed.
        waiting = self.run_stage(transport=self.transport(checklist={"j-an": "no"}),
                                 grade=self.grade, stage="canary")
        self.assertEqual(waiting["status"], "pending_judging")
        fine = self.transport()
        done = self.run_stage(transport=fine, grade=self.grade, stage="canary",
                              resume=waiting["run_id"])
        self.assertEqual(done["status"], "finalised")
        models, asked = self.split(fine)
        self.assertEqual((models, set(asked)), ([], {"j-an"}))


# Run in a process of its own by CrashBetweenReserveAndLogTests. It starts a
# dry full run on fake transports and hard-exits, with os._exit, inside
# `request_sent` for the chosen request: after `ledger.reserve` has written
# and fsynced the reservation and before the sent line reaches the run log.
CRASH_CHILD = r"""
import os, sys
core, tests, store, which = sys.argv[1:5]
sys.path.insert(0, core)
sys.path.insert(0, tests)
import records, runner
import test_run_support as support
import test_run_runner as cases

seen = {"model": 0, "judge": 0}
real = records.RunRecord.request_sent

def request_sent(self, request, payload):
    kind = "model" if payload["kind"] == "model" else "judge"
    seen[kind] += 1
    if kind == which and seen[kind] == {"judge": 1, "model": 3}[which]:
        os._exit(74)
    return real(self, request, payload)

records.RunRecord.request_sent = request_sent
tasks = [support.task("t1", family=4, checks=2), support.task("t2", family=2, answerable=False)]
cfg = support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")])
transport = cases.model_only(lambda r, n: support.reply_body(r, "an answer"))
runner.run_stage("full", cfg, tasks, private_store=store, grade=cases.JudgingTests.grade,
                 transport=transport, out=cases.QUIET, seed=11, scores=cases.NO_SCORES)
os._exit(0)
"""


class CrashBetweenReserveAndLogTests(JudgingTests):
    """A real process dies between a successful `ledger.reserve` and the
    `request_sent` write. The reservation is in the ledger; the run log has
    never seen the id. The same run is then resumed here."""

    def crash(self, which):
        import subprocess
        here = os.path.dirname(os.path.abspath(__file__))
        env = {name: value for name, value in os.environ.items()
               if name not in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY")}
        done = subprocess.run(
            [sys.executable, "-I", "-c", CRASH_CHILD, os.path.dirname(here), here, self.store,
             which], env=env, capture_output=True, text=True, timeout=120)
        self.assertEqual(done.returncode, 74, done.stderr)
        (run_id,) = os.listdir(os.path.join(self.store, "runs", "_staging"))
        return run_id

    def book(self, run_id, provider="openai"):
        return ledger.ProviderLedger(provider, "50", os.path.join(
            self.store, "ledgers-dry", run_id, provider + ".jsonl"))

    def resume(self, run_id):
        transport = model_only(lambda r, n: reply_body(r, "an answer"))
        printed = []
        summary = self.run_stage(transport=transport, grade=self.grade, resume=run_id,
                                 out=printed.append)
        return summary, transport, printed

    def check(self, run_id, orphan, done, printed):
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(done["passes"], {"required": 3, "complete": 3})
        self.assertEqual(done["ledger_only_requests"], [orphan])
        log = self.log(done)
        sent = [line["request_id"] for line in log if line["event"] == "sent"]
        self.assertEqual(len(sent), len(set(sent)))
        self.assertNotIn(orphan, sent)                           # never issued again
        # The audit line, before anything was sent by the resume.
        events = [line["event"] for line in log]
        audit = events.index("ledger_only_request_found")
        self.assertEqual(events[audit - 1], "resumed")
        self.assertEqual(events.count("ledger_only_request_found"), 1)
        line = log[audit]
        entry = self.book(run_id).entries[orphan]
        self.assertEqual((line["request_id"], line["provider"], line["reserved_usd"]),
                         (orphan, "openai", str(entry["reserved"])))
        self.assertTrue(any(orphan in text and "not in the run log" in text
                            for text in printed))
        # The orphan reservation is still on the ledger, open, and still
        # counts against the cap. Every other request of the run is settled.
        self.assertIsNone(entry["charge"])
        self.assertGreater(entry["reserved"], 0)
        book = self.book(run_id)
        self.assertEqual(book.reserved, entry["reserved"])
        self.assertEqual(done["remaining_caps"]["openai"],
                         Decimal("50") - book.spent - entry["reserved"])
        self.assertEqual(set(book.entries) - {orphan},
                         {i for i in sent if "/judge/j-an/" not in i})
        records.verify_manifest(done["dir"])

    def test_a_judge_request_reserved_and_never_logged_is_recovered_on_resume(self):
        run_id = self.crash("judge")
        # Before the resume: the answer is logged, the judge id is in the
        # ledger only.
        (orphan,) = [i for i in self.book(run_id).entries if "/judge/" in i]
        self.assertTrue(orphan.endswith("/judge/j-oa/%s/1" % orphan.split("/")[-2]))
        with open(os.path.join(self.store, "runs", "_staging", run_id, "requests.jsonl"),
                  encoding="utf-8") as stream:
            before = [json.loads(text) for text in stream]
        self.assertEqual([line["event"] for line in before], ["sent", "done"])
        done, transport, printed = self.resume(run_id)
        self.check(run_id, orphan, done, printed)
        # No second answer for the stopped slot: 5 slots were unsent.
        models = [r for r in transport.requests if not is_judge_prompt(prompt_of(r))]
        self.assertEqual(len(models), 5)
        row = self.rows(done)[0]
        self.assertEqual(len(row["requests"]), 1)
        base = orphan.rpartition("/")[0]
        # The orphan counts as one of j-oa's two; the resume went on with 2.
        self.assertEqual([(q["request_id"], q["status"]) for q in row["judge_requests"]],
                         [(orphan, "reserved_never_logged"), (base + "/2", "ok"),
                          (base.replace("/j-oa/", "/j-an/") + "/1", "ok")])
        self.assertEqual(row["judge_requests"][0]["ledger_flags"], ["reservation_left_open"])
        self.assertEqual((row["pass"], row["pending"]), (True, False))
        # A second resume is refused (the run is finalised); nothing is found twice.

    def test_a_model_request_reserved_and_never_logged_is_recovered_on_resume(self):
        run_id = self.crash("model")
        logged = self.sent_in_staging(run_id)
        (orphan,) = [i for i in self.book(run_id).entries if i not in logged]
        self.assertNotIn("/judge/", orphan)
        self.assertTrue(orphan.endswith("/1"))
        done, transport, printed = self.resume(run_id)
        self.check(run_id, orphan, done, printed)
        models = [r for r in transport.requests if not is_judge_prompt(prompt_of(r))]
        self.assertEqual(len(models), 4)                          # slots 3 to 6, once each
        row = self.rows(done)[2]
        slot = orphan.rpartition("/")[0]
        self.assertEqual(row["slot_id"], slot)
        # It counts as one of the slot's three; the slot went on with 2.
        self.assertEqual([(q["request_id"], q["status"]) for q in row["requests"]],
                         [(orphan, "reserved_never_logged"), (slot + "/2", "ok")])
        self.assertEqual((row["pass"], row["pending"]), (True, False))
        # Its cost holds the open reservation in full.
        self.assertEqual(Decimal(row["cost_usd_exact"]),
                         self.book(run_id).entries[orphan]["reserved"]
                         + Decimal(row["requests"][1]["charge_usd"]))

    def sent_in_staging(self, run_id):
        with open(os.path.join(self.store, "runs", "_staging", run_id, "requests.jsonl"),
                  encoding="utf-8") as stream:
            return [line["request_id"] for line in map(json.loads, stream)
                    if line["event"] == "sent"]

    def test_an_orphan_found_once_stays_used_on_later_resumes_and_after_reconciling(self):
        run_id = self.crash("judge")
        (orphan,) = [i for i in self.book(run_id).entries if "/judge/" in i]
        # First resume: the judge gives no verdict, so the slot stays pending.
        bad = model_only(lambda r, n: reply_body(r, "an answer"),
                         judge_text=lambda request, prompt: "never valid")
        first = self.run_stage(transport=bad, grade=self.grade, resume=run_id)
        self.assertEqual(first["ledger_only_requests"], [orphan])
        self.assertEqual(first["status"], "pending_judging")
        # The known-unsent reservation is reconciled to zero by hand. The id
        # stays used: the next resume neither reports it again nor reuses it.
        self.book(run_id).reconcile(orphan, 0, "known not to have been sent")
        done, _, _ = self.resume(run_id)
        self.assertEqual(done["ledger_only_requests"], [])
        self.assertEqual(done["status"], "finalised")
        log = self.log(done)
        self.assertEqual([line["event"] for line in log].count("ledger_only_request_found"), 1)
        sent = [line["request_id"] for line in log if line["event"] == "sent"]
        self.assertEqual(len(sent), len(set(sent)))
        self.assertNotIn(orphan, sent)


class StoreLockRunTests(PassCase):
    def held(self, run_id="run-held"):
        lock = ledger.StoreLock(self.store).acquire(run_id)
        self.addCleanup(lock.release)
        return lock

    def test_a_second_owner_is_refused_for_every_stage_and_for_resume(self):
        stopped = self.run_stage(transport=self.fine(), cfg=self.capped(self.bound))
        before = sorted(glob.glob(os.path.join(self.store, "**"), recursive=True))
        self.held()
        checklist, outcome = support.qualification_samples()
        for kwargs in (dict(stage="full"), dict(stage="canary"),
                       dict(stage="qualify", checklist_samples=checklist,
                            outcome_samples=outcome),
                       dict(stage="full", resume=stopped["run_id"],
                            cfg=self.capped(self.bound))):
            transport = self.fine()
            with self.assertRaises(runner.LiveRefused) as caught:
                self.run_stage(transport=transport, **kwargs)
            self.assertIn("the private store is in use by another run (pid %d, run run-held"
                          % os.getpid(), str(caught.exception))
            self.assertEqual(transport.requests, [])
        # Nothing in the store was read into a new record or written.
        self.assertEqual(sorted(glob.glob(os.path.join(self.store, "**"), recursive=True)),
                         before)
        with open(os.path.join(stopped["dir"], "run.json"), encoding="utf-8") as stream:
            self.assertNotIn("resumed", json.load(stream))

    def test_the_lock_is_taken_before_a_ledger_is_read_or_a_record_is_opened(self):
        self.held()
        with mock.patch.object(runner, "_ledgers") as ledgers, \
                mock.patch.object(records, "read_staged") as read_staged, \
                mock.patch.object(records, "RunRecord") as record:
            with self.assertRaises(runner.LiveRefused):
                self.run_stage(transport=self.fine(), resume="2026-01-01T000000Z-00000000")
            with self.assertRaises(runner.LiveRefused):
                self.run_stage(transport=self.fine())
        self.assertEqual((ledgers.called, read_staged.called, record.called),
                         (False, False, False))

    def test_the_lock_names_the_run_and_is_let_go_when_the_run_ends(self):
        seen = []

        def step(request, n):
            seen.append(ledger.store_owner(self.store))
            with self.assertRaises(runner.LiveRefused):
                self.run_stage(transport=self.fine())      # a second run, mid-run
            return reply_body(request, "answer %d" % n)
        summary = self.run_stage(transport=model_only(step))
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual(len(seen), 6)
        for owner in seen:
            self.assertIn("pid %d, run %s, started" % (os.getpid(), summary["run_id"]), owner)
        self.assertEqual(self.staged(), [])                 # the refused runs made no record
        self.assertIsNone(ledger.store_owner(self.store))
        # Let go after a refusal and after an error in the harness as well.
        with self.assertRaises(preflight.PreflightRefused):
            self.run_stage(transport=self.fine(), cfg=self.capped("0.01"))
        self.assertIsNone(ledger.store_owner(self.store))
        with self.assertRaises(KeyboardInterrupt):
            self.run_stage(transport=model_only(lambda request, n: KeyboardInterrupt()))
        self.assertIsNone(ledger.store_owner(self.store))
        self.assertEqual(self.run_stage(transport=self.fine())["status"], "finalised")


class AdmittedPassTests(PassCase):
    """The pass gate admits a pass; it does not promise that the pass
    finishes. Codex's probe in miniature."""

    def test_connection_failures_use_up_the_room_and_the_run_stops_inside_the_cap(self):
        # One pass at its planning bound is 0.5408703 on openai. A request that
        # fails to connect keeps its full reservation of 0.123759. The cap, 0.75,
        # holds six of them (0.742554) and not a seventh.
        cap = Decimal("0.75")
        self.assertLessEqual(self.bound, cap)
        self.assertLessEqual(6 * self.HELD, cap)
        self.assertGreater(7 * self.HELD, cap)
        path = []
        committed = []

        def step(request, n):
            # What the ledger holds on disk while this request is in flight.
            book = ledger.ProviderLedger("openai", cap, path[0])
            committed.append(book.spent + book.reserved)
            return providers.TransportFailure("down")
        transport = model_only(step)
        real = runner._ledgers

        def ledgers(config, private_store, live, run_id):
            books = real(config, private_store, live, run_id)
            path.append(books["openai"].path)
            return books
        with mock.patch.object(runner, "_ledgers", ledgers):
            summary = self.run_stage(transport=transport, cfg=self.capped(cap))
        # Pass 1 was admitted: its bound fitted the cap.
        first = summary["pass_gates"][0]
        self.assertEqual((first["pass"], first["ok"]), (1, True))
        self.assertEqual(first["planning_bound"]["openai"], self.bound)
        self.assertIn("likely to finish, not certain to", first["lines"][1])
        # Each of its two slots used all three requests, every one of which kept
        # its reservation: six in all, far more than the 15% allowed for retries.
        self.assertEqual(len(transport.requests), 6)
        rows = self.rows(summary)
        self.assertEqual([(r["outcome"], len(r["requests"])) for r in rows],
                         [("execution_error", 3)] * 2)
        self.assertEqual(summary["run_committed_usd"], 6 * self.HELD)
        # No room is left for pass 2, so the run stops, unscored, in staging.
        self.assertIn(summary["status"], ("incomplete", "interrupted"))
        self.assertEqual(summary["status"], "incomplete")
        self.assertEqual([(g["pass"], g["ok"]) for g in summary["pass_gates"]],
                         [(1, True), (2, False)])
        self.assertIsNone(summary["finalised"])
        self.assertFalse(summary["publishable"])
        self.assertEqual(summary["passes"], {"required": 3, "complete": 1})
        self.assertFalse(os.path.exists(os.path.join(summary["dir"], "scores.json")))
        # Inside the cap at every moment, and no charge above its reservation.
        self.assertEqual(committed, [n * self.HELD for n in range(1, 7)])
        self.assertLessEqual(max(committed), cap)
        book = ledger.ProviderLedger("openai", cap, path[0])
        self.assertEqual(book.overruns(), [])
        self.assertEqual(book.spent + book.reserved, 6 * self.HELD)
        self.assertLessEqual(book.spent + book.reserved, cap)
        self.assertEqual(summary["remaining_caps"]["openai"], cap - 6 * self.HELD)

    def test_a_tighter_cap_stops_the_admitted_pass_part_way_still_inside_the_cap(self):
        # With the cap at exactly one bound, the fifth held request does not fit
        # and the pass itself is cut short: interrupted, not incomplete.
        transport = model_only(lambda request, n: providers.TransportFailure("down"))
        summary = self.run_stage(transport=transport, cfg=self.capped(self.bound))
        self.assertEqual(summary["pass_gates"][0]["ok"], True)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIn("interrupted by cap", summary["report"]["interrupt_reason"])
        self.assertIsNone(summary["finalised"])
        self.assertEqual(summary["run_committed_usd"], 4 * self.HELD)
        self.assertLessEqual(summary["run_committed_usd"], self.bound)
        books = runner._ledgers(self.capped(self.bound), self.store, False, summary["run_id"])
        self.assertEqual(runner.overruns_on_file(books), {})


class OverrunOnFileRunTests(PassCase):
    """A settled charge above its reservation refuses every later start until
    the run config names the request. The second model request reports 50,000
    input tokens: (50000 x 3 + 5 x 30) / 1e6 = 0.15015 USD against a
    reservation of 0.123759."""

    def overrun(self):
        def step(request, n):
            if n == 2:
                return support.ok(support.openai_body("costly", input_tokens=50000))
            return reply_body(request, "fine")
        summary = self.run_stage(transport=model_only(step))
        self.assertEqual(summary["status"], "interrupted")
        request = self.rows(summary)[1]["requests"][0]
        self.assertEqual(Decimal(request["charge_usd"]), Decimal("0.15015"))
        return summary, request["request_id"]

    def test_the_run_is_not_resumed_until_the_overrun_is_acknowledged(self):
        summary, request = self.overrun()
        transport = self.fine()
        with self.assertRaises(preflight.PreflightRefused) as caught:
            self.run_stage(transport=transport, resume=summary["run_id"])
        self.assertIn("openai: request %s was charged above its reservation" % request,
                      str(caught.exception))
        self.assertIn("acknowledged_overruns", str(caught.exception))
        self.assertEqual(transport.requests, [])
        # Naming another request does not help.
        other = support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                    acknowledged_overruns=[request + "9"])
        with self.assertRaises(preflight.PreflightRefused):
            self.run_stage(transport=transport, resume=summary["run_id"], cfg=other)
        self.assertEqual(transport.requests, [])
        # Named in the config, the run carries on: the 4 slots not yet started.
        named = support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")],
                                    acknowledged_overruns=[request])
        printed = []
        done = self.run_stage(transport=transport, resume=summary["run_id"], cfg=named,
                              out=printed.append)
        self.assertEqual(done["status"], "finalised")
        self.assertEqual(len(transport.requests), 4)
        self.assertIn("  overrun on file, openai: %s (acknowledged in the run config)" % request,
                      printed)
        # The overrun stays in the ledger and in what is left of the cap:
        # 0.15015 + 5 x 0.00018 = 0.15105 spent.
        self.assertEqual(done["remaining_caps"]["openai"], Decimal("50") - Decimal("0.15105"))

    def test_runner_lists_the_overruns_in_the_ledgers(self):
        summary, request = self.overrun()
        books = runner._ledgers(self.cfg, self.store, False, summary["run_id"])
        self.assertEqual(runner.overruns_on_file(books), {"openai": [request]})
        clean = runner._ledgers(self.cfg, self.store, False, "another-run")
        self.assertEqual(runner.overruns_on_file(clean), {})


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
        self.assertIn("Result: the plan may start. The whole-plan gate holds and qualify + "
                      "canary + pass 1 fit the remaining caps.", text)
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
            # the whole-plan gate fails: the figures are printed, then the refusal
            (("preflight", *tight_args), "REFUSED: openai: whole-plan gate"),
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

    def plan(self, *sample_args):
        """The pre-flight figures for this fixture, from the module."""
        cfg = cli.config_module.load_config(self.cfg_path)
        tasks, _ = cli.load_task_set(self.tasks_path, self.held_path)
        return preflight.preflight(cfg, tasks, dict(cfg.caps_usd), out=None, together=True)

    def test_preflight_prints_every_gate_and_refuses_only_on_them(self):
        code, text = self.main("preflight", *self.common())
        self.assertEqual(code, 0)
        for words in ("planning bound by stage and by pass", "pass 1", "pass 2", "pass 3",
                      "full, all passes", "whole-plan gate: 2 x the expected cost of stage qualify",
                      "planning-bound gate for qualify, the next to start",
                      "qualify + canary + pass 1 at their planning bounds together",
                      "Result: the plan may start"):
            self.assertIn(words, text)
        plan = self.plan()
        together = plan["together_gate"]["openai"]["planning_bound"]
        self.assertLess(together, plan["whole_plan"]["openai"]["planning_bound"])
        # A cap that holds qualify + canary + pass 1 exactly, and so is below the
        # whole plan's planning bound: printed, and not a refusal.
        exact = self.write("exact.json", support.config_dict(
            caps_usd={"openai": str(together), "anthropic": "50"}))
        code, text = self.main("preflight", "--config", exact, "--public-tasks",
                               self.tasks_path, "--held-out-tasks", self.held_path)
        self.assertEqual(code, 0, text)
        self.assertIn("openai: the planning bound of the plan still to run", text)
        self.assertIn("That alone is not a refusal: the full run is gated one pass at a time",
                      text)
        self.assertNotIn("REFUSED", text)
        # One step lower and the three no longer fit together: refused, exit 2.
        short = self.write("short.json", support.config_dict(
            caps_usd={"openai": str(together - Decimal("0.000001")), "anthropic": "50"}))
        code, text = self.main("preflight", "--config", short, "--public-tasks",
                               self.tasks_path, "--held-out-tasks", self.held_path)
        self.assertEqual(code, 2)
        self.assertIn("REFUSED: openai: qualify + canary + pass 1 at their planning bounds "
                      "come to", text)

    def test_an_overrun_on_file_refuses_the_preflight_command(self):
        store = os.path.join(self.folder, "store")
        request = "2026-11-14T183000Z-1a2b3c4d/m-oa/t1/1/1"
        os.makedirs(os.path.join(store, "ledgers"))
        with open(os.path.join(store, "ledgers", "openai.jsonl"), "w", encoding="utf-8") as stream:
            stream.write(json.dumps({"event": "reserve", "request_id": request,
                                     "usd": "0.1"}) + "\n")
            stream.write(json.dumps({"event": "settle", "request_id": request, "usd": "0.2",
                                     "reserved_usd": "0.1", "reconciled": True,
                                     "flags": ["charge_above_reservation"]}) + "\n")
        for stage in ("qualify", "canary", "full"):
            code, text = self.main("preflight", *self.common(), "--private-store", store,
                                   "--stage", stage)
            self.assertEqual(code, 2, stage)
            self.assertIn("REFUSED: openai: request %s was charged above its reservation"
                          % request, text)
        named = self.write("named.json", support.config_dict(acknowledged_overruns=[request]))
        code, text = self.main("preflight", "--config", named, "--public-tasks",
                               self.tasks_path, "--private-store", store)
        self.assertEqual(code, 0, text)
        self.assertIn("overrun on file, openai: %s (acknowledged in the run config)" % request,
                      text)
        # The charge is out of the remaining cap all the same: 50 - 0.2.
        self.assertIn("49.8000", text)

    def test_an_incomplete_run_exits_with_5_and_can_be_resumed(self):
        self.assertEqual(cli.EXIT_INCOMPLETE, 5)
        self.assertNotIn(cli.EXIT_INCOMPLETE, (cli.EXIT_OK, cli.EXIT_REFUSED,
                                               cli.EXIT_NOT_FINISHED, cli.EXIT_NOT_QUALIFIED, 1))
        store = os.path.join(self.folder, "store")
        # A cap of exactly one pass's planning bound on openai: pass 1 starts, and
        # whatever it costs, pass 2 no longer fits.
        one_pass = self.plan()["by_pass"][1]["openai"]["planning_bound"]
        tight = self.write("tight.json", support.config_dict(
            caps_usd={"openai": str(one_pass), "anthropic": "50"}))
        run = ["--public-tasks", self.tasks_path, "--held-out-tasks", self.held_path,
               "--private-store", store, "--stub-grade"]
        code, text = self.main("dry-run", "--config", tight, *run, "--seed", "4")
        self.assertEqual(code, 5, text)
        self.assertIn("status incomplete, publishable False", text)
        self.assertIn("INCOMPLETE: pass 2 of 3 not started: the openai planning bound of this "
                      "pass", text)
        self.assertIn("passes complete: 1 of 3", text)
        self.assertIn("m-oa: planned 9, attempted 3, unstarted 6, pending 0", text)
        run_id = text.split("Dry run ", 1)[1].split(":", 1)[0]
        self.assertIn("--resume " + run_id, text)
        # Resumed under the same cap it is still incomplete.
        code, text = self.main("dry-run", "--config", tight, *run, "--resume", run_id)
        self.assertEqual(code, 5, text)
        self.assertIn("m-oa: planned 9, attempted 3, unstarted 6, pending 0", text)
        self.assertIn("A resume can lower a cap and can never raise one.", text)
        # A config with a higher cap does not carry it on: refused, exit 2.
        code, text = self.main("dry-run", "--config", self.cfg_path, *run, "--resume", run_id)
        self.assertEqual(code, 2, text)
        self.assertIn("REFUSED: run %s cannot be resumed with a higher cap: the openai cap is "
                      "50 USD, above the %s USD the run started with" % (run_id, one_pass), text)
        # A lower cap is accepted; the run is still incomplete.
        lower = self.write("lower.json", support.config_dict(
            caps_usd={"openai": str(one_pass - Decimal("0.5")), "anthropic": "50"}))
        code, text = self.main("dry-run", "--config", lower, *run, "--resume", run_id,
                               "--max-usd", "40")
        self.assertEqual(code, 5, text)
        self.assertIn("m-oa: planned 9, attempted 3, unstarted 6, pending 0", text)
        with open(os.path.join(store, "runs", "_staging", run_id, "run.json"),
                  encoding="utf-8") as stream:
            document = json.load(stream)
        self.assertEqual(document["caps_usd"]["openai"], str(one_pass))
        self.assertEqual(document["resumed"][-1]["caps_in_force"],
                         {"caps_usd": {"anthropic": "50",
                                       "openai": str(one_pass - Decimal("0.5"))},
                          "max_usd": "40"})

    def test_a_store_in_use_refuses_every_run_command_and_the_preflight_says_so(self):
        store = os.path.join(self.folder, "store")
        run = [*self.common(), "--private-store", store, "--stub-grade"]
        code, text = self.main("dry-run", *run, "--seed", "4")
        self.assertEqual(code, 0, text)
        before = sorted(glob.glob(os.path.join(store, "runs", "**"), recursive=True))
        lock = ledger.StoreLock(store).acquire("run-held")
        self.addCleanup(lock.release)
        for command in (("dry-run", *run), ("canary", *run), ("full", *run),
                        ("qualify", *run, *self.sample_files()),
                        ("dry-run", *run, "--resume", "2026-01-01T000000Z-00000000")):
            code, text = self.main(*command)
            self.assertEqual(code, 2, text)
            self.assertIn("REFUSED: the private store is in use by another run (pid %d, run "
                          "run-held, started 20" % os.getpid(), text)
        self.assertEqual(sorted(glob.glob(os.path.join(store, "runs", "**"), recursive=True)),
                         before)
        # The pre-flight only reads: it runs, and says its figures can be stale.
        code, text = self.main("preflight", *self.common(), "--private-store", store)
        self.assertEqual(code, 0, text)
        self.assertIn("NOTE: a run is using this private store now (pid %d, run run-held"
                      % os.getpid(), text)
        self.assertIn("may be out of date", text)
        lock.release()
        code, text = self.main("preflight", *self.common(), "--private-store", store)
        self.assertNotIn("NOTE: a run is using this private store", text)
        code, text = self.main("dry-run", *run)
        self.assertEqual(code, 0, text)
        # An unknown run id is a refusal.
        code, text = self.main("dry-run", "--config", self.cfg_path, *run, "--resume",
                               "2026-01-01T000000Z-00000000")
        self.assertEqual(code, 2)
        self.assertIn("REFUSED: no run in staging to resume", text)

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
        # Below the planning bound of pass 1 it lowers the cap, and the run is refused.
        code, text = self.main("dry-run", *self.common(), "--private-store", store,
                               "--stub-grade", "--max-usd", "0.5")
        self.assertEqual(code, 2)
        self.assertIn("--max-usd 0.5000 is below the planning bound of pass 1", text)
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
