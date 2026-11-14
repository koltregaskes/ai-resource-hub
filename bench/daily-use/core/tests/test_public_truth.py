"""The truth test: every example in the 40 public tasks behaves as labelled.

For each task, every accept example must pass and every reject example must
fail. Checklist tasks with judged checks can't pass by script alone, so there:

* an accept example must reach "all script checks passed, judge needed";
* a reject example must fail a script check, or be named in the task's
  ``reject_notes`` as a judge-only reject and reach "judge needed".

Abstain tasks: the script decides only the clear cases, so an accept example
must come out ``abstained`` or ``needs_judge`` (the test reports how many of
each), and a reject example must come out ``answered`` or ``needs_judge`` and
NEVER ``abstained``.

The two formula tasks need the formula engine. Without it they are skipped
here and reported as skipped; they are never graded another way.

The three ``python_tests`` tasks need a proven sandbox (``DTD_SANDBOX``, see
``sandbox.py``). Without one their examples are NOT graded: each comes back
``sandbox_unavailable`` and is reported as not graded. They are never run on
the host and never graded another way. A reject example that isn't Python at
all, or that the static pre-filter refuses, still fails without being run.
"""
import sys
import unittest

import _support
from _support import graders, tasks

ENGINE = _support.formula_engine_available()
SANDBOX = _support.sandbox_ready()


class PublicTruthTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tasks = tasks.load_tasks(_support.PUBLIC_DIR)
        cls.report = _support.truth_report(cls.tasks, skip_formula=not ENGINE)
        r = cls.report
        sys.stderr.write(
            "\npublic truth test: "
            f"{r['tasks']} tasks graded; "
            f"accepts {r['accepts_pass']} pass + {r['accepts_judge_needed']} judge-needed of {r['accepts']}; "
            f"rejects {r['rejects_fail_by_script']} fail by script + {r['rejects_judge_only']} judge-only of {r['rejects']}; "
            f"abstain accepts {r['abstain_accepts_by_pattern']} abstained by script + "
            f"{len(r['abstain_accepts_needing_judge'])} needing a judge of {r['abstain_accepts']}; "
            f"abstain rejects {r['abstain_rejects_answered']} answered + "
            f"{len(r['abstain_rejects_needing_judge'])} needing a judge of {r['abstain_rejects']}, 0 abstained; "
            f"python_tests examples not graded (no proven sandbox): {len(r['not_graded_no_sandbox'])}; "
            f"formula tasks skipped: {r['skipped_formula_tasks'] or 'none'}\n")

    @classmethod
    def tearDownClass(cls):
        graders.close_formula_engine()

    def test_all_forty_public_tasks_are_loaded(self):
        self.assertEqual(len(self.tasks), 40)
        self.assertEqual(self.report["tasks"] + len(self.report["skipped_formula_tasks"]), 40)

    def test_every_example_behaves_as_labelled(self):
        self.assertEqual(self.report["problems"], [])

    def test_every_accept_example_is_accounted_for(self):
        r = self.report
        self.assertGreater(r["accepts"], 0)
        not_graded = sum(1 for label in r["not_graded_no_sandbox"] if " accept " in label)
        self.assertEqual(r["accepts_pass"] + r["accepts_judge_needed"] + not_graded, r["accepts"])

    def test_every_reject_example_is_accounted_for(self):
        r = self.report
        self.assertGreater(r["rejects"], 0)
        not_graded = sum(1 for label in r["not_graded_no_sandbox"] if " reject " in label)
        self.assertEqual(r["rejects_fail_by_script"] + r["rejects_judge_only"] + not_graded, r["rejects"])

    def test_judge_only_rejects_exist_and_are_all_noted(self):
        # The set has known judge-only rejects; if none shows up the test is not looking.
        self.assertGreater(self.report["rejects_judge_only"], 0)

    def test_abstain_accepts_are_abstained_or_go_to_the_judges(self):
        r = self.report
        self.assertEqual(r["abstain_accepts"], 4)
        needing_judge = r["abstain_accepts_needing_judge"]
        self.assertEqual(r["abstain_accepts_by_pattern"] + len(needing_judge), r["abstain_accepts"])

    def test_abstain_rejects_are_never_abstained(self):
        r = self.report
        self.assertGreater(r["abstain_rejects"], 0)
        self.assertEqual(r["abstain_rejects_answered"] + len(r["abstain_rejects_needing_judge"]), r["abstain_rejects"])
        for task in self.tasks:
            if task.grader_type != "abstain":
                continue
            for example in task.reject_examples:
                decision = _support.outcome.decide(task, example)
                self.assertNotEqual(decision["outcome"], _support.outcome.ABSTAINED, task.id)
                self.assertIsNot(decision["pass"], True, task.id)

    def test_python_tasks_are_graded_in_the_sandbox_or_not_at_all(self):
        r = self.report
        self.assertEqual(sorted(r["python_tests_tasks"]), ["f7-pub-02", "f7-pub-04", "f7-pub-05"])
        if SANDBOX:
            self.assertEqual(r["not_graded_no_sandbox"], [])
            return
        self.assertTrue(r["not_graded_no_sandbox"])
        for task in self.tasks:
            if task.grader_type != "python_tests":
                continue
            for example in task.accept_examples:
                decision = _support.outcome.decide(task, example)
                self.assertEqual(decision["outcome"], "sandbox_unavailable", task.id)
                self.assertIsNone(decision["pass"], task.id)
                self.assertEqual(decision["detail"]["pending_on"], ["sandbox"], task.id)

    @unittest.skipUnless(ENGINE, "formula engine not installed (set DTD_FORMULAS_PATH)")
    def test_formula_tasks_were_graded_by_the_engine(self):
        self.assertEqual(self.report["skipped_formula_tasks"], [])
        self.assertEqual(sorted(t.id for t in self.tasks if t.grader_type == "formula"), ["f7-pub-01", "f7-pub-03"])

    def test_a_judge_only_reject_is_never_passed_by_script(self):
        # Spot check on one known case: floor task f5-pub-02, reject 2.
        task = next(t for t in self.tasks if t.id == "f5-pub-02")
        self.assertTrue(task.reject_notes[1])
        result = graders.grade(task, task.reject_examples[1])
        self.assertEqual(result.status, graders.NEEDS_JUDGE)
        self.assertIsNone(result.passed)
        no = {check.check_id: False for check in result.needs_judge}
        yes = {check.check_id: True for check in result.needs_judge}
        self.assertIs(graders.apply_judge_verdicts(result, {"a": yes, "b": no}).passed, False)


if __name__ == "__main__":
    unittest.main()
