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
        self.assertEqual(failed[0]["cost_usd"], "0")

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
            self.assertEqual(Decimal(row["cost_usd"]), Decimal("0.018"))
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

    def test_default_grade_says_clearly_when_the_graders_are_absent(self):
        with mock.patch.dict(sys.modules, {"outcome": None}):
            with self.assertRaises(runner.GraderUnavailable) as caught:
                runner.default_grade({"id": "t1"}, "reply")
        self.assertIn("core/outcome.py", str(caught.exception))

    def test_default_grade_uses_outcome_decide_when_present(self):
        fake = mock.Mock()
        fake.decide = lambda task, reply: {"outcome": "answered", "pass": True,
                                           "pending": False, "needs_judge": []}
        with mock.patch.dict(sys.modules, {"outcome": fake}):
            self.assertEqual(runner.default_grade({"id": "t1"}, "reply")["pass"], True)


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
        checklist = [{"sample_id": "s%d" % n, "task_id": "p2", "answer": "Answer %d" % n,
                      "reference": {"c1": True, "c2": False}} for n in range(4)]
        outcome = [{"sample_id": "o%d" % n, "task_id": "p1", "reply": "Reply %d" % n,
                    "reference_outcome": ("answered", "abstained", "refused")[n % 3]}
                   for n in range(20)]
        return checklist, outcome

    def test_qualify_stage_fails_an_always_true_judge(self):
        checklist, outcome = self.qualification_samples()
        # The stub judge says true to every check and "answered" to every reply.
        summary = self.run_stage(stage="qualify", cfg=self.cfg, checklist_samples=checklist,
                                 outcome_samples=outcome)
        result = summary["qualification"]
        self.assertFalse(result["qualified"])
        self.assertEqual(result["sample_set_problems"], [])
        for judge in ("j-oa", "j-an"):
            self.assertEqual(result["judges"][judge]["checklist"]["agreement_on_false"], 0.0)
            self.assertFalse(result["judges"][judge]["qualified"])
            self.assertEqual(result["judges"][judge]["requests"], 24)
        self.assertEqual(summary["status"], "finalised")
        self.assertFalse(summary["publishable"])
        self.assertTrue(os.path.isfile(os.path.join(summary["dir"], "qualification.json")))
        records.verify_manifest(summary["dir"])

    def test_qualify_stage_passes_judges_that_match_the_reference(self):
        checklist, outcome = self.qualification_samples()
        by_reply = {s["reply"]: s["reference_outcome"] for s in outcome}

        def responder(provider, model_id, prompt):
            if prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
                return json.dumps({"checks": {"c1": {"pass": True, "reason": "r"},
                                              "c2": {"pass": False, "reason": "r"}}})
            reply = [r for r in by_reply if "\n%s\n>>>" % r in prompt][0]
            return json.dumps({"outcome": by_reply[reply], "reason": "r"})
        summary = self.run_stage(stage="qualify", cfg=self.cfg, checklist_samples=checklist,
                                 outcome_samples=outcome,
                                 transport=runner.StubTransport(responder))
        self.assertTrue(summary["qualification"]["qualified"])

    def test_qualify_needs_both_sample_files(self):
        with self.assertRaises(ValueError):
            self.run_stage(stage="qualify", cfg=self.cfg)


class LiveGateTests(RunnerCase):
    def setUp(self):
        super().setUp()
        self.cfg = support.make_config()
        key_folder = tempfile.TemporaryDirectory()
        self.addCleanup(key_folder.cleanup)
        self.key_file = support.write_key_file(key_folder.name)
        self.transport = model_only(lambda r, n: reply_body(r, "live-shaped answer"))
        self.factory_calls = []

    def factory(self, gate_pass):
        self.factory_calls.append(gate_pass)
        return self.transport

    def live(self, stage="canary", cfg=None, **kwargs):
        kwargs.setdefault("key_file", self.key_file)
        kwargs.setdefault("environ", {})
        kwargs.setdefault("live", True)
        kwargs.setdefault("sleep", lambda seconds: None)
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

    def test_ships_with_live_disabled(self):
        self.assertIs(runner.LIVE_ENABLED, False)
        with open(os.path.join(support.CORE, "runner.py"), encoding="utf-8") as stream:
            self.assertIn("\nLIVE_ENABLED = False\n", stream.read())

    def test_live_is_refused_before_the_key_file_is_read_or_a_transport_exists(self):
        missing = os.path.join(self.store, "this-key-file-does-not-exist.txt")
        with mock.patch.object(keys, "load_keys") as load_keys, \
                mock.patch.object(providers, "UrllibTransport") as real_transport, \
                mock.patch("builtins.open", side_effect=AssertionError("nothing may be opened")):
            try:
                self.live(key_file=missing)
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
        lines = []
        with mock.patch.object(keys, "load_keys") as load_keys:
            code = cli.main(["full", "--live", "--config", cfg_path, "--public-tasks", tasks_path,
                             "--private-store", os.path.join(self.store, "store"),
                             "--key-file", os.path.join(self.store, "absent-keys.txt")],
                            out=lines.append)
            load_keys.assert_not_called()
        self.assertEqual(code, 2)
        self.assertEqual(len(lines), 1)
        self.assertTrue(lines[0].startswith("REFUSED: live runs are switched off"))
        self.assertFalse(os.path.exists(os.path.join(self.store, "store")))

    def test_every_condition_is_needed(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            # 2. --live
            with self.assertRaises(runner.LiveRefused) as caught:
                runner.open_live_gate(live=False, config=self.cfg, key_file=self.key_file,
                                      tasks=preflight.normalise_tasks(self.tasks), stage="canary",
                                      private_store=self.store,
                                      remaining_caps=dict(self.cfg.caps_usd), environ={},
                                      out=QUIET)
            self.assertIn("--live was not given", str(caught.exception))
            # 3. approval
            self.refused("not approved", cfg=support.make_config(live_approved=False))
            self.refused("not approved", cfg=support.make_config(approved_by="  "))
            # 4. nothing left to pin
            unpinned = support.spec_dict("openai", "m-oa", "3", "30",
                                         api_version="TO PIN BEFORE RUN")
            self.refused("TO PIN BEFORE RUN", cfg=support.make_config(models=[unpinned]))
            null_cached = support.spec_dict("openai", "m-oa", "3", "30", cached=None)
            self.refused("cached_input_per_mtok is null",
                         cfg=support.make_config(models=[null_cached]))
            # 5. --key-file
            self.refused("--key-file was not given", key_file=None)
            # 6. clean environment
            for name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
                self.refused(name + " is set", environ={name: "FAKE-ENV-VALUE"})
            # 7. earlier steps on record
            self.refused("no finished live canary", stage="full")
            checklist, outcome = [], []
            self.refused("no finished live canary", stage="qualify",
                         checklist_samples=checklist, outcome_samples=outcome)
            # 8. pre-flight
            self.refused("pre-flight refused", cfg=support.make_config(
                caps_usd={"openai": "0.01", "anthropic": "50"}))
            self.refused("--max-usd", max_usd="0.0001")
            # 9. keys load
            folder = tempfile.TemporaryDirectory()
            self.addCleanup(folder.cleanup)
            only_one = support.write_key_file(
                folder.name, ["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY])
            refusal = self.refused("key not found: CLAUDE_API", key_file=only_one)
            self.assertEqual(str(refusal), "key not found: CLAUDE_API")
            self.refused("key file unavailable",
                         key_file=os.path.join(folder.name, "absent.txt"))
        # Nothing was sent and no live ledger entry was written by any refusal.
        self.assertFalse(os.path.exists(os.path.join(self.store, "ledgers")))

    def test_gate_open_runs_on_the_fake_transport_and_never_leaks_a_key(self):
        printed = []
        stdout, stderr = io.StringIO(), io.StringIO()
        before = dict(os.environ)
        with mock.patch.object(runner, "LIVE_ENABLED", True), \
                mock.patch("sys.stdout", stdout), mock.patch("sys.stderr", stderr):
            summary = self.live(out=printed.append)
        self.assertEqual((summary["status"], summary["live"]), ("finalised", True))
        self.assertFalse(summary["publishable"])                    # a canary never is
        self.assertEqual(len(self.factory_calls), 1)
        self.assertIsInstance(self.factory_calls[0], runner.LiveGatePass)
        self.assertEqual(len(self.transport.requests), 4)           # 2 models x 2 tasks x 1
        # The adapter hands the transport the right key, and only inside the Secret.
        by_provider = {r.provider: r for r in self.transport.requests}
        self.assertEqual(by_provider["openai"].secret.reveal(), support.FAKE_OPENAI_KEY)
        self.assertEqual(by_provider["anthropic"].secret.reveal(), support.FAKE_ANTHROPIC_KEY)
        # Scan every output for the fake values: files, printed lines, the summary,
        # the requests as recorded, the environment.
        outputs = [support.read_everything(self.store), "\n".join(printed), stdout.getvalue(),
                   stderr.getvalue(), repr(summary), json.dumps(summary, default=repr),
                   repr(self.factory_calls), repr(self.transport.requests),
                   json.dumps([r.to_record() for r in self.transport.requests]),
                   "\n".join(os.environ.values())]
        for text in outputs:
            for value in support.FAKE_VALUES:
                self.assertNotIn(value, text)
        self.assertEqual(dict(os.environ), before)
        # A live run uses the shared ledgers and records the finished stage.
        self.assertTrue(os.path.isfile(os.path.join(self.store, "ledgers", "openai.jsonl")))
        self.assertFalse(os.path.exists(os.path.join(self.store, "ledgers-dry")))
        with open(os.path.join(self.store, runner.STAGE_INDEX), encoding="utf-8") as stream:
            entry = json.loads(stream.read())
        self.assertEqual((entry["stage"], entry["live"]), ("canary", True))

    def test_stages_unlock_in_order(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        checklist = [{"sample_id": "s%d" % n, "task_id": "t1", "answer": "Answer %d" % n,
                      "reference": {"c1": True, "c2": False}} for n in range(4)]
        outcome = [{"sample_id": "o%d" % n, "task_id": "t2", "reply": "Reply %d" % n,
                    "reference_outcome": ("answered", "abstained", "refused")[n % 3]}
                   for n in range(20)]
        by_reply = {s["reply"]: s["reference_outcome"] for s in outcome}

        def judge_text(request, prompt):
            if prompt.startswith(judges.OUTCOME_PROMPT[:60]):
                reply = [r for r in by_reply if "\n%s\n>>>" % r in prompt]
                return json.dumps({"outcome": by_reply[reply[0]] if reply else "answered",
                                   "reason": "r"})
            return json.dumps({"checks": {"c1": {"pass": True, "reason": "r"},
                                          "c2": {"pass": False, "reason": "r"}}})
        self.transport = model_only(lambda r, n: reply_body(r, "x"), judge_text=judge_text)
        common = dict(tasks=tasks, grade=runner.stub_grade)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            self.refused("no finished live canary", stage="qualify",
                         checklist_samples=checklist, outcome_samples=outcome, **common)
            self.assertEqual(self.live(stage="canary", **common)["status"], "finalised")
            self.refused("have not passed qualification", stage="full", **common)
            qualified = self.live(stage="qualify", checklist_samples=checklist,
                                  outcome_samples=outcome, **common)
            self.assertTrue(qualified["qualification"]["qualified"])
            full = self.live(stage="full", **common)
        self.assertEqual(full["status"], "finalised")
        self.assertTrue(full["publishable"])
        self.assertTrue(os.path.isfile(full["finalised"]["public_path"]))
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, support.read_everything(self.store))

    def test_a_key_echoed_by_the_provider_is_refused_by_the_record(self):
        def echo(request, n):
            return reply_body(request, "you sent " + request.secret.reveal())
        self.transport = model_only(echo)
        with mock.patch.object(runner, "LIVE_ENABLED", True):
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
            self.live()
            gate_pass = self.factory_calls[0]
            runner.require_live_pass(gate_pass)                     # issued by the gate
            with self.assertRaises(runner.LiveRefused):
                runner.require_live_pass(runner.LiveGatePass(gate_pass.keys))
        with self.assertRaises(runner.LiveRefused):
            runner.require_live_pass(gate_pass)                     # live disabled again
        self.assertNotIn(support.FAKE_OPENAI_KEY, repr(gate_pass) + repr(gate_pass.keys))


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
        with mock.patch.dict(sys.modules, {"outcome": None}):
            with self.assertRaises(runner.GraderUnavailable):
                runner.default_grade({}, "")
            code, text = self.main("dry-run", *self.common(), "--private-store", store)
        self.assertEqual(code, 2)
        self.assertIn("no grader available", text)

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
