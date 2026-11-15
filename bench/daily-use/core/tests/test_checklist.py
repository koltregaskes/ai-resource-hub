"""Tests for the checklist grader and the judge verdict rules."""
import unittest

import _support  # noqa: F401
from _support import graders

CHECKLIST = {"type": "checklist", "checks": [
    {"id": "c1", "text": "20 words or fewer", "by": "script", "script": {"check": "max_words", "value": 20}},
    {"id": "c2", "text": "Keeps the day, Tuesday", "by": "script", "script": {"check": "must_include", "values": ["Tuesday"]}},
    {"id": "c3", "text": "Says that Jo chairs the meeting", "by": "judge"},
    {"id": "c4", "text": "Adds no fact that is not in the original", "by": "judge"},
]}
SCRIPT_ONLY = {"type": "checklist", "checks": CHECKLIST["checks"][:2]}
GOOD = "Jo chairs the meeting on Tuesday."


def statuses(result):
    return {check.id: check.status for check in result.checks}


class ChecklistTest(unittest.TestCase):
    def test_failed_by_script(self):
        result = graders.grade_checklist("Jo chairs the meeting on Wednesday.", CHECKLIST)
        self.assertEqual(result.status, graders.FAILED)
        self.assertIs(result.passed, False)
        self.assertEqual(result.failed_by, "script")
        self.assertEqual(result.needs_judge, [])
        self.assertEqual(statuses(result), {"c1": "passed", "c2": "failed", "c3": "not_run", "c4": "not_run"})

    def test_script_checks_passed_and_judges_needed(self):
        result = graders.grade_checklist(GOOD, CHECKLIST)
        self.assertEqual(result.status, graders.NEEDS_JUDGE)
        self.assertIsNone(result.passed)
        self.assertIsNone(result.failed_by)
        self.assertEqual(result.needs_judge, [
            graders.NeedsJudge("c3", "Says that Jo chairs the meeting"),
            graders.NeedsJudge("c4", "Adds no fact that is not in the original"),
        ])
        self.assertEqual(statuses(result), {"c1": "passed", "c2": "passed", "c3": "needs_judge", "c4": "needs_judge"})

    def test_a_checklist_with_no_judged_checks_can_pass_outright(self):
        self.assertEqual(graders.grade_checklist(GOOD, SCRIPT_ONLY).status, graders.PASSED)
        self.assertEqual(graders.grade_checklist("Jo chairs.", SCRIPT_ONLY).status, graders.FAILED)

    def test_grade_dispatches_to_the_checklist(self):
        task = {"grader": CHECKLIST, "prompt": "p", "answerable": True}
        self.assertEqual(graders.grade(task, GOOD).status, graders.NEEDS_JUDGE)


class JudgeVerdictTest(unittest.TestCase):
    def setUp(self):
        self.pending = graders.grade_checklist(GOOD, CHECKLIST)

    def test_passes_only_when_every_judge_says_true(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": True, "c4": True}})
        self.assertEqual(result.status, graders.PASSED)
        self.assertIs(result.passed, True)
        self.assertEqual(result.needs_judge, [])
        self.assertEqual(self.pending.status, graders.NEEDS_JUDGE)  # the input is not changed

    def test_verdict_objects_with_a_reason_are_read(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": {"pass": True, "reason": "says so"}, "c4": {"verdict": True, "reason": "nothing added"}},
            "judge-b": {"c3": True, "c4": True}})
        self.assertEqual(result.status, graders.PASSED)

    def test_disagreement_is_disputed_and_counts_as_failed(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": True, "c4": False}})
        self.assertEqual(result.status, graders.FAILED)
        self.assertEqual(result.failed_by, "judge")
        self.assertEqual(statuses(result)["c3"], "passed")
        self.assertEqual(statuses(result)["c4"], "disputed")

    def test_both_judges_saying_false_is_failed(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": False, "c4": True}, "judge-b": {"c3": False, "c4": True}})
        self.assertEqual(result.status, graders.FAILED)
        self.assertEqual(statuses(result)["c3"], "failed")

    def test_a_missing_verdict_leaves_the_pass_pending(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": True}})
        self.assertEqual(result.status, graders.PENDING)
        self.assertIsNone(result.passed)
        self.assertEqual(statuses(result)["c4"], "judge_unresolved")
        self.assertEqual(result.needs_judge, [graders.NeedsJudge("c4", "Adds no fact that is not in the original")])

    def test_a_malformed_verdict_leaves_the_pass_pending(self):
        for bad in ("yes", "true", 1, 0, None, {"reason": "no verdict given"}, {"pass": "true"}, [True]):
            result = graders.apply_judge_verdicts(self.pending, {
                "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": True, "c4": bad}})
            self.assertEqual(result.status, graders.PENDING, repr(bad))
            self.assertEqual(statuses(result)["c4"], "judge_unresolved", repr(bad))

    def test_a_judge_that_failed_altogether_leaves_everything_unresolved(self):
        for broken in (None, "timeout", []):
            result = graders.apply_judge_verdicts(self.pending, {"judge-a": {"c3": True, "c4": True}, "judge-b": broken})
            self.assertEqual(result.status, graders.PENDING)
            self.assertEqual(len(result.needs_judge), 2)

    def test_unresolved_keeps_the_pass_pending_even_beside_a_dispute(self):
        result = graders.apply_judge_verdicts(self.pending, {
            "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": False}})
        self.assertEqual(result.status, graders.PENDING)
        self.assertEqual(statuses(result), {"c1": "passed", "c2": "passed", "c3": "disputed", "c4": "judge_unresolved"})

    def test_one_judge_is_not_a_panel(self):
        result = graders.apply_judge_verdicts(self.pending, {"judge-a": {"c3": True, "c4": True}})
        self.assertEqual(result.status, graders.PENDING)
        self.assertEqual(graders.apply_judge_verdicts(self.pending, {}).status, graders.PENDING)

    def test_a_script_failure_is_final_whatever_the_judges_say(self):
        script_failed = graders.grade_checklist("Jo chairs the meeting on Wednesday.", CHECKLIST)
        result = graders.apply_judge_verdicts(script_failed, {
            "judge-a": {"c3": True, "c4": True}, "judge-b": {"c3": True, "c4": True}})
        self.assertEqual(result.status, graders.FAILED)
        self.assertEqual(result.failed_by, "script")


if __name__ == "__main__":
    unittest.main()
