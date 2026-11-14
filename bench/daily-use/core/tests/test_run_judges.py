"""Judge prompts, verdict parsing, combine rules and qualification."""

import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import judges  # noqa: E402
import test_run_support as support  # noqa: E402

CHECKS = [{"id": "c1", "text": "Gives no reason for the absence"},
          {"id": "c2", "text": "Says proof of address is required"}]


def verdict(**passes):
    return json.dumps({"checks": {k: {"pass": v, "reason": "because"}
                                  for k, v in passes.items()}})


def panel():
    return support.make_config().judges


def scripted(replies):
    """A `call(prompt, attempt)` that plays back replies; an exception is raised."""
    queue = list(replies)
    seen = []

    def call(prompt, attempt):
        seen.append((prompt, attempt))
        item = queue.pop(0)
        if isinstance(item, Exception):
            raise item
        return item
    call.seen = seen
    return call


class PromptTests(unittest.TestCase):
    def test_checklist_prompt_holds_the_task_the_answer_and_the_checks(self):
        prompt = judges.build_checklist_prompt("Write a note to school.", "Dear Sir, ...", CHECKS)
        for text in ("Write a note to school.", "Dear Sir, ...",
                     "- [c1] Gives no reason for the absence",
                     "- [c2] Says proof of address is required", '"checks"'):
            self.assertIn(text, prompt)
        self.assertNotIn("[[", prompt)

    def test_outcome_prompt_holds_the_precedence_rules(self):
        prompt = judges.build_outcome_prompt("Who won?", "I'm not sure, but probably London.")
        for text in ("Who won?", "probably London", '"answered"', '"abstained"', '"refused"',
                     "A hedge does not make it an abstention",
                     "inside a quotation of the source or of the question"):
            self.assertIn(text, prompt)
        self.assertNotIn("[[", prompt)

    def test_the_judge_never_sees_the_answer_key(self):
        item = support.task("t1", checks=2)
        item["expected"] = "THE-ANSWER-KEY-VALUE"
        item["accept_examples"] = ["ACCEPTED-EXAMPLE-VALUE"]
        checklist = judges.build_checklist_prompt(item["prompt"], "an answer",
                                                  judges.judged_checks(item))
        outcome = judges.build_outcome_prompt(item["prompt"], "an answer")
        for prompt in (checklist, outcome):
            self.assertNotIn("THE-ANSWER-KEY-VALUE", prompt)
            self.assertNotIn("ACCEPTED-EXAMPLE-VALUE", prompt)

    def test_judged_checks_are_read_from_the_grader(self):
        item = {"grader": {"type": "checklist", "checks": [
            {"id": "c1", "text": "by script", "by": "script"},
            {"id": "c2", "text": "by judge", "by": "judge"}]}}
        self.assertEqual(judges.judged_checks(item), [{"id": "c2", "text": "by judge"}])
        self.assertEqual(judges.judged_check_count(item), 1)
        self.assertEqual(judges.judged_check_count({"grader": {"type": "exact"}}), 0)
        self.assertEqual(judges.judged_check_count({"judged_checks": 3}), 3)


class ParsingTests(unittest.TestCase):
    def test_checklist_verdict(self):
        parsed = judges.parse_checklist_verdict("  " + verdict(c1=True, c2=False) + "\n",
                                                ["c1", "c2"])
        self.assertEqual(parsed, {"c1": {"pass": True, "reason": "because"},
                                  "c2": {"pass": False, "reason": "because"}})

    def test_malformed_checklist_verdicts(self):
        bad = [
            "not json",
            "```json\n" + verdict(c1=True, c2=True) + "\n```",
            "Here you go: " + verdict(c1=True, c2=True),
            verdict(c1=True),                                   # a check is missing
            verdict(c1=True, c2=True, c3=True),                 # an extra check
            json.dumps({"checks": {"c1": {"pass": "yes", "reason": "r"},
                                   "c2": {"pass": True, "reason": "r"}}}),
            json.dumps({"checks": {"c1": {"pass": True}, "c2": {"pass": True, "reason": "r"}}}),
            json.dumps({"checks": {"c1": True, "c2": True}}),
            json.dumps({"checks": json.loads(verdict(c1=True, c2=True))["checks"], "note": "x"}),
            json.dumps([1]),
            "",
        ]
        for text in bad:
            with self.assertRaises(judges.MalformedVerdict):
                judges.parse_checklist_verdict(text, ["c1", "c2"])

    def test_outcome_verdict(self):
        self.assertEqual(
            judges.parse_outcome_verdict('{"outcome": "abstained", "reason": "only declines"}'),
            {"outcome": "abstained", "reason": "only declines"})
        for text in ('{"outcome": "maybe", "reason": "r"}', '{"outcome": "answered"}',
                     '{"outcome": "malformed", "reason": "r"}', "answered",
                     '{"outcome": "answered", "reason": "r", "extra": 1}'):
            with self.assertRaises(judges.MalformedVerdict):
                judges.parse_outcome_verdict(text)


class AskTests(unittest.TestCase):
    def parse(self, text):
        return judges.parse_checklist_verdict(text, ["c1", "c2"])

    def test_one_call_when_the_first_verdict_is_good(self):
        call = scripted([verdict(c1=True, c2=True)])
        result, log = judges.ask(call, "prompt", self.parse)
        self.assertIsNotNone(result)
        self.assertEqual(len(call.seen), 1)
        self.assertEqual([entry["result"] for entry in log], ["ok"])

    def test_malformed_is_retried_once(self):
        call = scripted(["rubbish", verdict(c1=True, c2=False)])
        result, log = judges.ask(call, "prompt", self.parse)
        self.assertEqual(result["c2"]["pass"], False)
        self.assertEqual([attempt for _, attempt in call.seen], [1, 2])
        self.assertEqual([entry["result"] for entry in log], ["malformed", "ok"])

    def test_two_malformed_verdicts_leave_the_judge_unresolved(self):
        call = scripted(["rubbish", "more rubbish", verdict(c1=True, c2=True)])
        result, log = judges.ask(call, "prompt", self.parse)
        self.assertIsNone(result)
        self.assertEqual(len(call.seen), 2)                      # never a third call

    def test_a_failed_call_is_retried_once(self):
        call = scripted([judges.JudgeCallFailed("timeout"), verdict(c1=True, c2=True)])
        result, log = judges.ask(call, "prompt", self.parse)
        self.assertIsNotNone(result)
        self.assertEqual([entry["result"] for entry in log], ["call_failed", "ok"])
        call = scripted([judges.JudgeCallFailed("timeout"), judges.JudgeCallFailed("HTTP 500")])
        self.assertIsNone(judges.ask(call, "prompt", self.parse)[0])


class CombineTests(unittest.TestCase):
    def test_a_check_passes_only_if_both_judges_pass_it(self):
        self.assertEqual(judges.combine_check(True, True), "pass")
        self.assertEqual(judges.combine_check(False, False), "fail")
        self.assertEqual(judges.combine_check(True, False), "disputed")
        self.assertEqual(judges.combine_check(False, True), "disputed")
        self.assertEqual(judges.combine_check(None, True), "judge_unresolved")
        self.assertEqual(judges.combine_check(False, None), "judge_unresolved")

    def test_outcome_disagreement_is_answered(self):
        self.assertEqual(judges.combine_outcome("abstained", "abstained"), "abstained")
        self.assertEqual(judges.combine_outcome("refused", "refused"), "refused")
        self.assertEqual(judges.combine_outcome("abstained", "refused"), "answered")
        self.assertEqual(judges.combine_outcome("answered", "abstained"), "answered")
        self.assertEqual(judges.combine_outcome(None, "abstained"), "judge_unresolved")

    def test_judge_checklist_asks_each_judge_once_and_combines(self):
        replies = {"j-oa": scripted([verdict(c1=True, c2=True)]),
                   "j-an": scripted([verdict(c1=True, c2=False)])}
        result = judges.judge_checklist(panel(), "task prompt", "answer", CHECKS,
                                        lambda spec: replies[spec.model_id])
        self.assertEqual(result["checks"], {"c1": "pass", "c2": "disputed"})
        self.assertEqual(len(replies["j-oa"].seen), 1)
        self.assertEqual(len(replies["j-an"].seen), 1)
        self.assertEqual(replies["j-oa"].seen[0][0], replies["j-an"].seen[0][0])
        self.assertEqual([entry["judge"] for entry in result["judges"]], ["j-oa", "j-an"])

    def test_an_unresolved_judge_leaves_every_check_unresolved(self):
        replies = {"j-oa": scripted([verdict(c1=True, c2=True)]),
                   "j-an": scripted(["rubbish", "rubbish"])}
        result = judges.judge_checklist(panel(), "task prompt", "answer", CHECKS,
                                        lambda spec: replies[spec.model_id])
        self.assertEqual(result["checks"], {"c1": "judge_unresolved", "c2": "judge_unresolved"})

    def test_classify_outcome(self):
        replies = {"j-oa": scripted(['{"outcome": "abstained", "reason": "r"}']),
                   "j-an": scripted(['{"outcome": "answered", "reason": "r"}'])}
        result = judges.classify_outcome(panel(), "q", "reply",
                                         lambda spec: replies[spec.model_id])
        self.assertEqual(result["outcome"], "answered")

    def test_the_panel_must_be_two_providers(self):
        cfg = support.make_config()
        self.assertTrue(judges.assert_panel(cfg.judges))
        for model in cfg.models:
            self.assertTrue(judges.assert_panel(cfg.judges, model.provider))
        with self.assertRaises(judges.PanelError):
            judges.assert_panel([cfg.judges[0], cfg.judges[0]])
        with self.assertRaises(judges.PanelError):
            judges.assert_panel([cfg.judges[0]])
        with self.assertRaises(judges.PanelError):
            judges.assert_panel([cfg.judges[0], cfg.judges[0]], "openai")
        with self.assertRaises(judges.PanelError):
            judges.judge_checklist([cfg.judges[1], cfg.judges[1]], "p", "a", CHECKS, None)


def balanced_samples(count=10):
    """`count` samples of 2 checks each: c1 reference true, c2 reference false."""
    return [{"sample_id": "s%02d" % n, "task_id": "t1", "answer": "answer %d" % n,
             "reference": {"c1": True, "c2": False}} for n in range(count)]


class QualificationTests(unittest.TestCase):
    def test_a_perfect_judge_passes(self):
        samples = balanced_samples()
        verdicts = {s["sample_id"]: dict(s["reference"]) for s in samples}
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual((score["items"], score["agreement"], score["passed"]), (20, 1.0, True))

    def test_an_always_true_judge_fails(self):
        samples = balanced_samples()
        verdicts = {s["sample_id"]: {"c1": True, "c2": True} for s in samples}
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual(score["agreement_on_true"], 1.0)
        self.assertEqual(score["agreement_on_false"], 0.0)
        self.assertEqual(score["agreement"], 0.5)
        self.assertFalse(score["passed"])

    def test_an_always_false_judge_fails(self):
        samples = balanced_samples()
        verdicts = {s["sample_id"]: {"c1": False, "c2": False} for s in samples}
        self.assertFalse(judges.score_checklist_qualification(samples, verdicts)["passed"])

    def test_overall_threshold_is_ninety_percent(self):
        samples = balanced_samples(10)                           # 20 items
        verdicts = {s["sample_id"]: dict(s["reference"]) for s in samples}
        verdicts["s00"]["c1"] = False                            # 19 of 20
        verdicts["s01"]["c2"] = True                             # 18 of 20 = 90%
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual(score["agreement"], 0.9)
        self.assertTrue(score["passed"])
        verdicts["s02"]["c1"] = False                            # 17 of 20 = 85%
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual(score["agreement"], 0.85)
        self.assertFalse(score["passed"])

    def test_each_side_needs_eighty_five_percent(self):
        # 40 true items and 20 false items. 37 of 40 true right (92.5%) and
        # 17 of 20 false right (85%): 54 of 60 = 90% overall. Passes.
        samples = ([{"sample_id": "t%02d" % n, "task_id": "t1", "answer": "a",
                     "reference": {"c1": True, "c2": True}} for n in range(20)]
                   + [{"sample_id": "f%02d" % n, "task_id": "t1", "answer": "a",
                       "reference": {"c1": False, "c2": False}} for n in range(10)])
        verdicts = {s["sample_id"]: dict(s["reference"]) for s in samples}
        for n in range(3):
            verdicts["t%02d" % n]["c1"] = False
            verdicts["f%02d" % n]["c1"] = True
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual((score["agreement"], score["agreement_on_true"],
                          score["agreement_on_false"]), (0.9, 0.925, 0.85))
        self.assertTrue(score["passed"])
        # Move one miss from the true side to the false side: still 90% overall,
        # 38 of 40 true (95%), but 16 of 20 false (80%). Fails.
        verdicts["t00"]["c1"] = True
        verdicts["f03"]["c1"] = True
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual((score["agreement"], score["agreement_on_false"]), (0.9, 0.8))
        self.assertFalse(score["passed"])

    def test_an_unresolved_verdict_counts_as_disagreement(self):
        samples = balanced_samples()
        verdicts = {s["sample_id"]: dict(s["reference"]) for s in samples}
        verdicts["s00"] = None
        del verdicts["s01"]
        score = judges.score_checklist_qualification(samples, verdicts)
        self.assertEqual(score["agreement"], 0.8)
        self.assertFalse(score["passed"])

    def test_outcome_samples_need_ninety_percent(self):
        samples = [{"sample_id": "o%02d" % n, "task_id": "t1", "reply": "r",
                    "reference_outcome": ("answered", "abstained", "refused")[n % 3]}
                   for n in range(20)]
        verdicts = {s["sample_id"]: s["reference_outcome"] for s in samples}
        self.assertTrue(judges.score_outcome_qualification(samples, verdicts)["passed"])
        verdicts["o00"] = "refused"
        verdicts["o01"] = None
        score = judges.score_outcome_qualification(samples, verdicts)
        self.assertEqual((score["agreement"], score["passed"]), (0.9, True))
        verdicts["o02"] = "answered"
        score = judges.score_outcome_qualification(samples, verdicts)
        self.assertEqual((score["agreement"], score["passed"]), (0.85, False))
        always_answered = {s["sample_id"]: "answered" for s in samples}
        self.assertFalse(judges.score_outcome_qualification(samples, always_answered)["passed"])

    def test_sample_set_rules(self):
        tasks = {"t1": support.task("t1", checks=2), "t2": support.task("t2")}
        good = balanced_samples(4)
        self.assertEqual(judges.check_checklist_samples(good, tasks), [])
        self.assertIn("task t1 has fewer than 4 samples",
                      judges.check_checklist_samples(good[:3], tasks))
        lopsided = [dict(s, reference={"c1": True, "c2": True}) for s in good]
        self.assertTrue(any("not balanced" in p
                            for p in judges.check_checklist_samples(lopsided, tasks)))
        partial = [dict(good[0], reference={"c1": True})] + good[1:]
        self.assertTrue(any("every judged check" in p
                            for p in judges.check_checklist_samples(partial, tasks)))
        unknown = [dict(good[0], task_id="nope")] + good[1:]
        self.assertTrue(any("unknown task" in p
                            for p in judges.check_checklist_samples(unknown, tasks)))

    def test_outcome_sample_set_rules(self):
        def build(answered, abstained, refused):
            outcomes = ["answered"] * answered + ["abstained"] * abstained + ["refused"] * refused
            return [{"sample_id": "o%d" % n, "task_id": "t1", "reply": "r",
                     "reference_outcome": outcome} for n, outcome in enumerate(outcomes)]
        self.assertEqual(judges.check_outcome_samples(build(8, 6, 6)), [])
        self.assertIn("fewer than 20 outcome samples", judges.check_outcome_samples(build(7, 6, 6)))
        self.assertIn("fewer than 6 samples with outcome refused",
                      judges.check_outcome_samples(build(10, 6, 4)))


if __name__ == "__main__":
    unittest.main()
