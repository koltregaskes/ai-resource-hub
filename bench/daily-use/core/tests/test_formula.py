"""Tests for the formula grader.

The engine tests need the ``formulas`` package (see core/requirements.txt). If
it lives outside the interpreter's own packages, give its folder in the
DTD_FORMULAS_PATH environment variable. Without the engine those tests are
skipped, and the "engine unavailable" tests still run.
"""
import unittest
from unittest import mock

import _support
from _support import graders

ENGINE = _support.formula_engine_available()
NEEDS_ENGINE = unittest.skipUnless(ENGINE, "formula engine not installed (set DTD_FORMULAS_PATH)")

STATUS_CELLS = {"A2": "Ready", "B2": 10, "A3": "Hold", "B3": 20, "A4": "Ready", "B4": 25, "A5": "Done", "B5": 40}
SUM_READY = {"type": "formula", "dialect": "excel", "cases": [
    {"cells": STATUS_CELLS, "expect": 35},
    {"cells": dict(STATUS_CELLS, A2="Hold", A4="Hold"), "expect": 0},
]}


def passed(result):
    return result.passed is True


def failed(result):
    return result.passed is False


class EngineUnavailableTest(unittest.TestCase):
    def test_grading_raises_and_never_falls_back_to_text(self):
        with mock.patch.object(graders.importlib.util, "find_spec", return_value=None):
            with self.assertRaises(graders.FormulaEngineUnavailable):
                graders.grade_formula('=SUMIF(A2:A5,"Ready",B2:B5)', SUM_READY)
            task = {"grader": SUM_READY, "prompt": "p", "answerable": True}
            with self.assertRaises(graders.FormulaEngineUnavailable):
                graders.grade(task, '=SUMIF(A2:A5,"Ready",B2:B5)')
            with self.assertRaises(graders.FormulaEngineUnavailable):
                _support.outcome.decide(task, '=SUMIF(A2:A5,"Ready",B2:B5)')

    def test_importing_the_package_does_not_import_the_engine(self):
        import subprocess
        import sys
        code = ("import sys; sys.path.insert(0, sys.argv[1]); import core; "
                "print('formulas' in sys.modules, 'openpyxl' in sys.modules)")
        done = subprocess.run([sys.executable, "-I", "-c", code, str(_support.DAILY_USE_DIR)],
                              capture_output=True, text=True, timeout=60)
        self.assertEqual(done.stdout.split(), ["False", "False"], done.stderr)


class HomeCellTest(unittest.TestCase):
    def test_c2_by_default(self):
        self.assertEqual(graders.formula_home_cell(SUM_READY), "C2")

    def test_the_grader_can_name_it(self):
        self.assertEqual(graders.formula_home_cell(dict(SUM_READY, home_cell="D7")), "D7")

    def test_the_prompt_names_it_when_c2_holds_data(self):
        occupied = {"type": "formula", "cases": [{"cells": {"C2": "Paid", "H1": "North"}, "expect": 1}]}
        prompt = "I type a region into cell H1. Reply with the formula for I1."
        self.assertEqual(graders.formula_home_cell(occupied, prompt), "I1")
        with self.assertRaises(graders.GraderConfigError):
            graders.formula_home_cell(occupied, "Reply with only the formula.")
        with self.assertRaises(graders.GraderConfigError):
            graders.formula_home_cell(occupied, "Put a formula in cell J1 or in cell K1.")


@NEEDS_ENGINE
class EngineTest(unittest.TestCase):
    @classmethod
    def tearDownClass(cls):
        graders.close_formula_engine()

    def test_the_pinned_engine_version(self):
        self.assertEqual(graders.formula_engine_versions()["formulas"], "1.3.4")

    def test_correct_formulas_pass_with_or_without_the_equals_sign(self):
        for formula in ('=SUMIF(A2:A5,"Ready",B2:B5)', 'SUMIF(A2:A5,"Ready",B2:B5)',
                        '  =SUMIFS(B2:B5,A2:A5,"Ready")\n', '```\n=SUMIF(A2:A5,"Ready",B2:B5)\n```',
                        '```excel\n=SUMPRODUCT((A2:A5="Ready")*B2:B5)\n```'):
            result = graders.grade_formula(formula, SUM_READY)
            self.assertTrue(passed(result), f"{formula!r}: {result.detail}")

    def test_wrong_formulas_fail_on_the_values_not_the_text(self):
        for formula in ("=SUM(B2:B5)", '=COUNTIF(A2:A5,"Ready")', "=35", '=SUMIF(B2:B5,"Ready",A2:A5)'):
            result = graders.grade_formula(formula, SUM_READY)
            self.assertTrue(failed(result), formula)
            self.assertFalse(result.malformed, formula)

    def test_a_formula_that_only_fits_the_first_case_fails(self):
        result = graders.grade_formula("=B2+B4", SUM_READY)
        self.assertTrue(failed(result))
        self.assertEqual(result.detail, "wrong result in case(s): 2")

    def test_errors_and_unreadable_formulas_fail(self):
        self.assertTrue(failed(graders.grade_formula("=1/0", SUM_READY)))
        self.assertTrue(failed(graders.grade_formula("=NOSUCHFUNCTION(B2)", SUM_READY)))
        self.assertTrue(failed(graders.grade_formula("=C2+35", SUM_READY)))  # refers to itself
        broken = graders.grade_formula("=SUM(B2:B5", SUM_READY)
        self.assertTrue(failed(broken) and broken.malformed)
        empty = graders.grade_formula("   ", SUM_READY)
        self.assertTrue(failed(empty) and empty.malformed)

    def test_numbers_within_0_005_and_text_exactly(self):
        near = {"type": "formula", "cases": [{"cells": {"A1": 100}, "expect": 33.33}]}
        self.assertTrue(passed(graders.grade_formula("=ROUND(A1/3,2)", near)))
        self.assertTrue(passed(graders.grade_formula("=A1/3", near)))
        self.assertTrue(failed(graders.grade_formula("=ROUND(A1/3,1)", near)))
        text = {"type": "formula", "cases": [{"cells": {"A1": "Ann", "B1": "Lee"}, "expect": "Ann Lee"}]}
        self.assertTrue(passed(graders.grade_formula('=A1&" "&B1', text)))
        self.assertTrue(failed(graders.grade_formula('=A1&"  "&B1', text)))
        self.assertTrue(failed(graders.grade_formula('=LOWER(A1&" "&B1)', text)))

    def test_text_is_not_a_number_and_true_is_not_one(self):
        number = {"type": "formula", "cases": [{"cells": {"A1": 35}, "expect": 35}]}
        self.assertTrue(passed(graders.grade_formula("=A1", number)))
        self.assertTrue(failed(graders.grade_formula('="35"', number)))
        one = {"type": "formula", "cases": [{"cells": {"A1": 35}, "expect": 1}]}
        self.assertTrue(failed(graders.grade_formula("=A1>5", one)))
        flag = {"type": "formula", "cases": [{"cells": {"A1": 35}, "expect": True}]}
        self.assertTrue(passed(graders.grade_formula("=A1>5", flag)))
        self.assertTrue(failed(graders.grade_formula("=1", flag)))

    def test_target_cell_fills_like_a_spreadsheet(self):
        cells = {"A2": 1, "B2": 2, "A3": 10, "B3": 20, "F1": 100}
        fill = {"type": "formula", "cases": [
            {"cells": cells, "expect": 103},
            {"cells": cells, "expect": 130, "target_cell": "C3"},
        ]}
        # Relative references move down a row; the $ reference stays on F1.
        self.assertTrue(passed(graders.grade_formula("=A2+B2+$F$1", fill)))
        # Without the $ the filled copy reads the empty F2, giving 30.
        result = graders.grade_formula("=A2+B2+F1", fill)
        self.assertTrue(failed(result))
        self.assertEqual(result.detail, "wrong result in case(s): 2")
        # Fully anchored references do not move at all, so row 3 repeats row 2.
        self.assertTrue(failed(graders.grade_formula("=$A$2+$B$2+$F$1", fill)))

    def test_the_home_cell_from_the_prompt_is_used(self):
        cells = {"B2": "North", "C2": "Paid", "D2": 120.0, "B3": "North", "C3": "Pending", "D3": 300.0, "H1": "North"}
        params = {"type": "formula", "cases": [{"cells": cells, "expect": 120}]}
        prompt = "The region is typed into cell H1. Reply with only the formula for I1."
        formula = '=SUMIFS(D2:D3,B2:B3,H1,C2:C3,"Paid")'
        self.assertTrue(passed(graders.grade_formula(formula, params, prompt=prompt)))
        task = {"grader": params, "prompt": prompt, "answerable": True}
        self.assertTrue(passed(graders.grade(task, formula)))

    def test_a_slow_evaluation_times_out_and_the_engine_recovers(self):
        graders.formula_engine_versions()  # make sure the engine is running first
        with mock.patch.object(graders._ENGINE, "_read", return_value="timeout"):
            result = graders.grade_formula("=SUM(B2:B5)", SUM_READY)
        self.assertTrue(failed(result))
        self.assertIn("timed out after 10 seconds", result.detail)
        self.assertTrue(passed(graders.grade_formula('=SUMIF(A2:A5,"Ready",B2:B5)', SUM_READY)))


if __name__ == "__main__":
    unittest.main()
