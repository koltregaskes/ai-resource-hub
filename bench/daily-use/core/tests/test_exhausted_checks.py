"""Conservative checklist finality, without network or private-store access."""
import copy
import os
import sys
import types
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import runner


class ExhaustedChecksTests(unittest.TestCase):
    def row(self):
        return {"outcome": "answered", "pass": None, "pending": True,
                "flags": [runner.EXHAUSTED_FLAG],
                "checks": [{"id": "s1", "by": "script", "state": "pass"},
                           {"id": "c8", "by": "judge", "state": "unresolved"}],
                "judged": {"detail": {"checklist": [
                    {"judge": "one", "verdict": None},
                    {"judge": "two", "verdict": {"c8": {"pass": True}}}]}}}

    def resolve(self, row, count=2, waiting=False):
        engine = types.SimpleNamespace(
            record=types.SimpleNamespace(logged_requests=lambda base: list(range(count))),
            awaits_reconciliation=lambda item: waiting)
        runner._Engine._finalise_exhausted_checks(engine, row, "slot")

    def test_an_inherited_flag_without_exhausted_history_is_not_enough(self):
        row = self.row()
        before = copy.deepcopy(row)
        self.resolve(row, count=1)
        self.assertEqual(row, before)

    def test_awaiting_reconciliation_stays_pending_even_with_exhausted_count(self):
        row = self.row()
        before = copy.deepcopy(row)
        self.resolve(row, waiting=True)
        self.assertEqual(row, before)

    def test_either_judges_missing_verdict_fails_without_changing_script_or_evidence(self):
        for verdict in (None, {"c8": {"pass": True}}, {"c8": {"pass": False}}):
            row = self.row()
            row["judged"]["detail"]["checklist"][1]["verdict"] = verdict
            evidence = copy.deepcopy(row["judged"])
            self.resolve(row)
            self.assertEqual((row["pass"], row["pending"]), (False, False))
            self.assertEqual([c["state"] for c in row["checks"]], ["pass", "unresolved-final"])
            self.assertEqual(row["judged"], evidence)
            self.assertEqual(row["flags"], [runner.EXHAUSTED_FLAG])

    def test_outcome_classification_is_not_finalised(self):
        row = self.row()
        row["outcome"] = "judge_unresolved"
        before = copy.deepcopy(row)
        self.resolve(row)
        self.assertEqual(row, before)
