"""Tests for scores.py. Every expected number is worked out by hand.

Run from the repo root:
    python -I -m unittest discover -s bench/daily-use/core/tests -p "test_s*.py" -v
"""

import copy
import json
import os
import sys
import unittest

CORE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if CORE not in sys.path:
    sys.path.insert(0, CORE)

import scores  # noqa: E402

# The method's task table: (active, public) per family; the rest are held-out.
METHOD_LAYOUT = {1: (10, 7), 2: (10, 7), 3: (8, 5), 4: (8, 5), 5: (8, 5), 6: (8, 6), 7: (8, 5)}


def method_tasks():
    """The 60 tasks as (task_id, family, split), ids f1-t01 and so on."""
    tasks = []
    for family, (active, public) in METHOD_LAYOUT.items():
        for number in range(1, active + 1):
            split = "public" if number <= public else "held-out"
            tasks.append(("f%d-t%02d" % (family, number), family, split))
    return tasks


def make_slot(model, task_id, family, split, repeat, outcome="answered", passed=True, **extra):
    slot = {
        "model": model,
        "task_id": task_id,
        "family": family,
        "split": split,
        "repeat": repeat,
        "outcome": outcome,
        "pass": passed,
        "truncated": False,
        "time_s": 1.0,
        "cost_usd": 0.0,
    }
    slot.update(extra)
    return slot


def checks(judge=(), script=()):
    """A check list: judge checks j1, j2, ... then script checks s1, s2, ...
    with the given states."""
    made = [{"id": "j%d" % n, "by": "judge", "state": state} for n, state in enumerate(judge, start=1)]
    made += [{"id": "s%d" % n, "by": "script", "state": state} for n, state in enumerate(script, start=1)]
    return made


def run_from(model, tasks, decide):
    """Three slots per task. decide(task_id, family, split, repeat) returns
    (outcome, passed) or (outcome, passed, extra dict)."""
    slots = []
    for task_id, family, split in tasks:
        for repeat in (1, 2, 3):
            decided = decide(task_id, family, split, repeat)
            extra = decided[2] if len(decided) == 3 else {}
            slots.append(make_slot(model, task_id, family, split, repeat, decided[0], decided[1], **extra))
    return slots


def uniform_model(model, headline_passes):
    """A model whose every task has the same number of passes (0 to 3)."""
    return run_from(
        model,
        method_tasks(),
        lambda task_id, family, split, repeat: ("answered", repeat <= headline_passes),
    )


class AlwaysAbstainExample(unittest.TestCase):
    """The method's worked example: a model that abstains on every slot."""

    @classmethod
    def setUpClass(cls):
        # Families 2 and 3 each have 2 unanswerable tasks, one public and one
        # held-out. Abstaining passes only on those.
        cls.unanswerable = {"f2-t01", "f2-t10", "f3-t01", "f3-t08"}

        def decide(task_id, family, split, repeat):
            return ("abstained", task_id in cls.unanswerable)

        cls.result = scores.score_model(run_from("abstainer", method_tasks(), decide))

    def test_family_scores(self):
        families = self.result["family_scores"]
        self.assertAlmostEqual(families["2"], 20.0, places=12)  # 2 of 10 tasks
        self.assertAlmostEqual(families["3"], 25.0, places=12)  # 2 of 8 tasks
        for family in ("1", "4", "5", "6", "7"):
            self.assertEqual(families[family], 0.0)

    def test_day_to_day_score_is_six_point_four(self):
        self.assertAlmostEqual(self.result["day_to_day_score"], (20 + 25) / 7, places=12)
        self.assertAlmostEqual(self.result["day_to_day_score"], 6.428571428571429, places=12)

    def test_pooled_pass_rate_differs_from_headline(self):
        # 4 tasks x 3 slots pass, out of 180 slots.
        self.assertAlmostEqual(self.result["pooled_pass_rate"], 12 / 180 * 100, places=12)

    def test_side_figures(self):
        side = self.result["side_figures"]
        self.assertEqual(side["wrong_answer_rate"], 0.0)
        self.assertEqual(side["abstention_rate"], 100.0)
        self.assertEqual(side["consistency"], 100.0)
        self.assertEqual(side["execution_error_rate"], 0.0)

    def test_public_and_held_out_subsets(self):
        public = self.result["subsets"]["public"]
        held_out = self.result["subsets"]["held-out"]
        self.assertEqual(public["tasks"], 40)
        self.assertEqual(held_out["tasks"], 20)
        # Public: family 2 has 1 of 7, family 3 has 1 of 5.
        self.assertAlmostEqual(public["family_scores"]["2"], 100 / 7, places=12)
        self.assertAlmostEqual(public["family_scores"]["3"], 20.0, places=12)
        self.assertAlmostEqual(public["day_to_day_score"], (100 / 7 + 20) / 7, places=12)
        self.assertAlmostEqual(public["pooled_pass_rate"], 6 / 120 * 100, places=12)
        # Held-out: family 2 has 1 of 3, family 3 has 1 of 3.
        self.assertAlmostEqual(held_out["family_scores"]["2"], 100 / 3, places=12)
        self.assertAlmostEqual(held_out["day_to_day_score"], (200 / 3) / 7, places=12)
        self.assertAlmostEqual(held_out["pooled_pass_rate"], 6 / 60 * 100, places=12)


class ReviewerExamples(unittest.TestCase):
    def test_two_passes_on_one_task_in_an_eight_task_family(self):
        def decide(task_id, family, split, repeat):
            if task_id == "f3-t04":
                return ("answered", repeat <= 2)
            return ("answered", True)

        result = scores.score_model(run_from("m", method_tasks(), decide))
        # (7 x 1 + 2/3) / 8 x 100
        self.assertAlmostEqual(result["family_scores"]["3"], 95.83333333333333, places=12)
        self.assertAlmostEqual(result["task_scores"]["f3-t04"], 2 / 3, places=15)
        self.assertEqual(result["family_scores"]["1"], 100.0)
        # 59 of 60 tasks are consistent.
        self.assertAlmostEqual(result["side_figures"]["consistency"], 59 / 60 * 100, places=12)

    def test_perfect_ten_task_family_and_all_others_zero(self):
        result = scores.score_model(
            run_from("m", method_tasks(), lambda t, family, s, r: ("answered", family == 1))
        )
        self.assertAlmostEqual(result["day_to_day_score"], 100 / 7, places=12)
        self.assertAlmostEqual(result["day_to_day_score"], 14.285714285714286, places=12)
        self.assertAlmostEqual(result["pooled_pass_rate"], 30 / 180 * 100, places=12)
        self.assertAlmostEqual(result["pooled_pass_rate"], 16.666666666666668, places=12)

    def test_all_error_run(self):
        def decide(task_id, family, split, repeat):
            return ("execution_error", False, {"time_s": None, "cost_usd": 0.01})

        result = scores.score_model(run_from("m", method_tasks(), decide))
        side = result["side_figures"]
        self.assertEqual(result["day_to_day_score"], 0.0)
        self.assertEqual(result["pooled_pass_rate"], 0.0)
        self.assertEqual(set(result["family_scores"].values()), {0.0})
        self.assertEqual(side["consistency"], 100.0)
        self.assertEqual(side["execution_error_rate"], 100.0)
        self.assertIsNone(side["cost_per_successful_task_usd"])
        self.assertEqual(side["cost_per_successful_task_label"], "no successful tasks")
        # An execution error is never a wrong answer.
        self.assertEqual(side["wrong_answer_rate"], 0.0)
        self.assertIsNone(side["time_per_attempt_s"])
        self.assertAlmostEqual(side["cost_per_task_usd"], 0.03, places=12)


class SideFigures(unittest.TestCase):
    """One task per family, slots written out by hand."""

    @classmethod
    def setUpClass(cls):
        def s(task, family, repeat, outcome, passed, **extra):
            return make_slot("m", task, family, "public", repeat, outcome, passed, **extra)

        all_pass = checks(["pass"] * 4, ["pass"])
        cls.slots = [
            # family 1: pass, pass, fail (inconsistent)
            s("a1", 1, 1, "answered", True, time_s=2.0, cost_usd=0.10),
            s("a1", 1, 2, "answered", True, time_s=4.0, cost_usd=0.10, truncated=True),
            s("a1", 1, 3, "malformed", False, time_s=6.0, cost_usd=0.10),
            # family 2: wrong answer, abstained, correct (inconsistent)
            s("b1", 2, 1, "answered", False, time_s=8.0, cost_usd=0.20),
            s("b1", 2, 2, "abstained", False, time_s=10.0, cost_usd=0.20),
            s("b1", 2, 3, "answered", True, time_s=12.0, cost_usd=0.20, needed_judge_classification=True),
            # family 3: unanswerable; abstain passes twice, an answer fails once
            s("c1", 3, 1, "abstained", True, time_s=14.0, cost_usd=0.05),
            s("c1", 3, 2, "abstained", True, time_s=16.0, cost_usd=0.05),
            s("c1", 3, 3, "answered", False, time_s=18.0, cost_usd=0.05, needed_judge_classification=True),
            # family 4: checklist task, all pass (consistent)
            # (4 judged checks and 1 script check per answered slot; the old
            # aggregate counts are given too and agree with the check lists)
            s("d1", 4, 1, "answered", True, time_s=20.0, cost_usd=0.30, checks=all_pass, judged_checks=4, disputed_checks=0),
            s("d1", 4, 2, "answered", True, time_s=22.0, cost_usd=0.30, checks=all_pass, judged_checks=4, disputed_checks=0),
            s("d1", 4, 3, "answered", True, time_s=24.0, cost_usd=0.30, checks=all_pass),
            # family 5: checklist task, all fail, 3 disputed checks (consistent).
            # Slot 1 fails only on its disputed check; slot 2 has 2 disputed
            # checks and a failed script check as well.
            s("e1", 5, 1, "answered", False, time_s=26.0, cost_usd=0.30,
              checks=checks(["pass", "disputed", "pass", "pass"], ["pass"]), judged_checks=4, disputed_checks=1),
            s("e1", 5, 2, "answered", False, time_s=28.0, cost_usd=0.30,
              checks=checks(["disputed", "pass", "disputed", "pass"], ["fail"]), judged_checks=4, disputed_checks=2),
            s("e1", 5, 3, "refused", False, time_s=30.0, cost_usd=0.30, judged_checks=0, disputed_checks=0),
            # family 6: all execution errors (consistent); a retry cost is kept
            s("f1", 6, 1, "execution_error", False, time_s=None, cost_usd=0.00),
            s("f1", 6, 2, "execution_error", False, time_s=120.0, cost_usd=0.40),
            s("f1", 6, 3, "execution_error", False, time_s=None, cost_usd=0.00),
            # family 7: all pass (consistent), one truncated
            s("g1", 7, 1, "answered", True, time_s=32.0, cost_usd=0.10, truncated=True),
            s("g1", 7, 2, "answered", True, time_s=34.0, cost_usd=0.10),
            s("g1", 7, 3, "answered", True, time_s=36.0, cost_usd=0.10),
        ]
        cls.result = scores.score_model(cls.slots)
        cls.side = cls.result["side_figures"]

    def test_scores(self):
        families = self.result["family_scores"]
        self.assertAlmostEqual(families["1"], 200 / 3, places=12)
        self.assertAlmostEqual(families["2"], 100 / 3, places=12)
        self.assertAlmostEqual(families["3"], 200 / 3, places=12)
        self.assertEqual(families["4"], 100.0)
        self.assertEqual(families["5"], 0.0)
        self.assertEqual(families["6"], 0.0)
        self.assertEqual(families["7"], 100.0)
        # (66.67 + 33.33 + 66.67 + 100 + 0 + 0 + 100) / 7
        self.assertAlmostEqual(self.result["day_to_day_score"], (1100 / 3) / 7, places=12)
        self.assertAlmostEqual(self.result["pooled_pass_rate"], 11 / 21 * 100, places=12)

    def test_wrong_answer_rate(self):
        # Families 2 and 3 have 6 slots; 2 are answered and failed.
        self.assertAlmostEqual(self.side["wrong_answer_rate"], 2 / 6 * 100, places=12)

    def test_abstention_rate(self):
        # 3 of those 6 slots abstained (one failed, two passed).
        self.assertAlmostEqual(self.side["abstention_rate"], 3 / 6 * 100, places=12)

    def test_execution_error_rate(self):
        self.assertAlmostEqual(self.side["execution_error_rate"], 3 / 21 * 100, places=12)

    def test_consistency(self):
        # Tasks d1, e1, f1 and g1 are consistent; a1, b1 and c1 are not.
        self.assertAlmostEqual(self.side["consistency"], 4 / 7 * 100, places=12)

    def test_costs(self):
        # 0.30 + 0.60 + 0.15 + 0.90 + 0.90 + 0.40 + 0.30 = 3.55
        self.assertAlmostEqual(self.side["total_cost_usd"], 3.55, places=12)
        self.assertAlmostEqual(self.side["cost_per_task_usd"], 3.55 / 7, places=12)
        # pooled pass rate x tasks = 11/21 x 7 = 11/3 successful tasks
        self.assertAlmostEqual(self.side["cost_per_successful_task_usd"], 3.55 / (11 / 3), places=12)
        self.assertIsNone(self.side["cost_per_successful_task_label"])

    def test_time_per_attempt_is_the_median_over_slots_that_returned_an_answer(self):
        # The 18 non-error slots have times 2, 4, ... 36: the median is 19.
        # The 120 second execution error is left out.
        self.assertEqual(self.side["time_per_attempt_s"], 19.0)

    def test_truncation_rate(self):
        self.assertAlmostEqual(self.side["truncation_rate"], 2 / 21 * 100, places=12)

    def test_dispute_rate(self):
        # 20 judged checks, 3 disputed.
        self.assertEqual(self.side["judged_checks"], 20)
        self.assertEqual(self.side["disputed_checks"], 3)
        self.assertAlmostEqual(self.side["dispute_rate"], 15.0, places=12)

    def test_dispute_sensitivity_score(self):
        # Excluding disputed checks, e1 slot 1 passes and slot 2 still fails
        # (its script check failed): task e1 is 1/3, family 5 is 33.3.
        self.assertAlmostEqual(self.result["task_scores_excluding_disputed"]["e1"], 1 / 3, places=15)
        self.assertEqual(self.result["task_scores"]["e1"], 0.0)
        self.assertAlmostEqual(self.result["family_scores_excluding_disputed"]["5"], 100 / 3, places=12)
        self.assertEqual(self.result["family_scores_excluding_disputed"]["4"], 100.0)
        # (1100/3 + 100/3) / 7 = 400/7, against the main (1100/3) / 7.
        self.assertAlmostEqual(self.result["day_to_day_score_excluding_disputed"], 400 / 7, places=12)
        self.assertAlmostEqual(self.result["day_to_day_score"], (1100 / 3) / 7, places=12)
        self.assertAlmostEqual(self.result["pooled_pass_rate_excluding_disputed"], 12 / 21 * 100, places=12)
        self.assertEqual(
            self.result["dispute_sensitivity"],
            {
                "slots_with_disputed_checks": 2,
                "slots_passing_when_disputed_excluded": 1,
                "slots_still_failed_when_disputed_excluded": 1,
                "tasks_changed": 1,
            },
        )
        public = self.result["subsets"]["public"]
        self.assertAlmostEqual(public["day_to_day_score_excluding_disputed"], 400 / 7, places=12)
        self.assertIsNone(self.result["subsets"]["held-out"]["day_to_day_score_excluding_disputed"])

    def test_judge_classification_rate(self):
        self.assertAlmostEqual(self.side["judge_classification_rate"], 2 / 21 * 100, places=12)

    def test_dispute_rate_is_none_without_judged_checks(self):
        result = scores.score_model(uniform_model("m", 3))
        self.assertIsNone(result["side_figures"]["dispute_rate"])

    def test_held_out_subset_is_undefined_with_a_reason(self):
        held_out = self.result["subsets"]["held-out"]
        self.assertIsNone(held_out["day_to_day_score"])
        self.assertEqual(held_out["day_to_day_score_reason"], "no tasks in family 1, 2, 3, 4, 5, 6, 7")
        self.assertIsNone(held_out["pooled_pass_rate"])
        public = self.result["subsets"]["public"]
        self.assertEqual(public["day_to_day_score"], self.result["day_to_day_score"])
        self.assertIsNone(public["day_to_day_score_reason"])

    def test_one_missing_family_names_only_that_family(self):
        slots = [dict(slot) for slot in self.slots]
        for slot in slots:
            if slot["family"] != 6:
                slot["split"] = "held-out"
        result = scores.score_model(slots)
        self.assertEqual(result["subsets"]["held-out"]["day_to_day_score_reason"], "no tasks in family 6")
        self.assertIsNone(result["subsets"]["held-out"]["day_to_day_score"])
        self.assertEqual(result["subsets"]["held-out"]["family_scores"]["7"], 100.0)
        self.assertIsNone(result["subsets"]["held-out"]["family_scores"]["6"])

    def test_result_is_json_serialisable_and_unrounded(self):
        text = json.dumps(self.result, sort_keys=True)
        self.assertEqual(json.loads(text), self.result)
        self.assertEqual(self.result["family_scores"]["1"], 2 / 3 * 100)

    def test_input_is_not_changed(self):
        before = copy.deepcopy(self.slots)
        scores.score_model(self.slots)
        self.assertEqual(self.slots, before)


class DisputedChecks(unittest.TestCase):
    """The Codex review's case (PR 132, finding 1): an otherwise perfect
    180-slot run with one disputed check on one slot."""

    TARGET = ("f1-t01", 1)  # a ten-task family

    def run_with(self, passed, target_checks):
        def decide(task_id, family, split, repeat):
            if (task_id, repeat) == self.TARGET:
                return ("answered", passed, {"checks": target_checks})
            return ("answered", True)

        return run_from("m", method_tasks(), decide)

    def test_pass_true_with_a_disputed_check_is_refused(self):
        slots = self.run_with(True, checks(["pass", "disputed", "pass"]))
        self.assertEqual(len(slots), 180)
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(slots)
        message = str(caught.exception)
        self.assertIn("pass is True but check 'j2' is disputed", message)
        self.assertIn("f1-t01", message)

    def test_the_disputed_slot_fails_and_the_run_scores_99_5238(self):
        result = scores.score_model(self.run_with(False, checks(["pass", "disputed", "pass"])))
        # Task 2/3, family 1 (9 + 2/3) / 10, headline (600 + 96.67) / 7.
        self.assertAlmostEqual(result["task_scores"]["f1-t01"], 2 / 3, places=15)
        self.assertAlmostEqual(result["family_scores"]["1"], 290 / 3, places=12)
        self.assertAlmostEqual(result["day_to_day_score"], (600 + 290 / 3) / 7, places=12)
        self.assertAlmostEqual(result["day_to_day_score"], 99.5238095238, places=10)
        self.assertNotEqual(result["day_to_day_score"], 100.0)
        self.assertAlmostEqual(result["pooled_pass_rate"], 179 / 180 * 100, places=12)

    def test_failed_only_on_a_disputed_check_gives_100_excluding_disputed(self):
        result = scores.score_model(self.run_with(False, checks(["pass", "disputed", "pass"])))
        self.assertEqual(result["day_to_day_score_excluding_disputed"], 100.0)
        self.assertEqual(result["family_scores_excluding_disputed"]["1"], 100.0)
        self.assertEqual(result["task_scores_excluding_disputed"]["f1-t01"], 1.0)
        self.assertEqual(result["pooled_pass_rate_excluding_disputed"], 100.0)
        self.assertEqual(
            result["dispute_sensitivity"],
            {
                "slots_with_disputed_checks": 1,
                "slots_passing_when_disputed_excluded": 1,
                "slots_still_failed_when_disputed_excluded": 0,
                "tasks_changed": 1,
            },
        )
        side = result["side_figures"]
        self.assertEqual((side["judged_checks"], side["disputed_checks"]), (3, 1))
        self.assertAlmostEqual(side["dispute_rate"], 100 / 3, places=12)

    def test_an_undisputed_failure_as_well_keeps_the_slot_failed(self):
        # The same main score, a different sensitivity score: the aggregate
        # counts alone could not tell these two runs apart.
        for other in (checks(["fail", "disputed", "pass"]), checks(["pass", "disputed"], ["fail"])):
            result = scores.score_model(self.run_with(False, other))
            self.assertAlmostEqual(result["day_to_day_score"], 99.5238095238, places=10)
            self.assertAlmostEqual(result["day_to_day_score_excluding_disputed"], 99.5238095238, places=10)
            self.assertEqual(result["day_to_day_score_excluding_disputed"], result["day_to_day_score"])
            self.assertEqual(result["dispute_sensitivity"]["slots_passing_when_disputed_excluded"], 0)
            self.assertEqual(result["dispute_sensitivity"]["slots_still_failed_when_disputed_excluded"], 1)
            self.assertEqual(result["dispute_sensitivity"]["tasks_changed"], 0)

    def test_without_disputed_checks_the_two_scores_are_equal(self):
        result = scores.score_model(uniform_model("m", 2))
        self.assertEqual(result["day_to_day_score_excluding_disputed"], result["day_to_day_score"])
        self.assertEqual(result["task_scores_excluding_disputed"], result["task_scores"])
        self.assertEqual(result["dispute_sensitivity"]["slots_with_disputed_checks"], 0)

    def test_pass_must_be_the_and_of_the_checks(self):
        refused = [
            (True, checks(["pass"], ["fail"]), "check 's1' is failed"),
            (True, checks(["fail", "pass"]), "check 'j1' is failed"),
            (None, checks(["pass", "disputed"]), "check 'j2' is disputed"),
            (False, checks(["pass", "pass"], ["pass"]), "every check passed"),
            (None, checks(["pass"]), "every check passed"),
            (True, checks(["pass", "unresolved"]), "check 'j2' is unresolved"),
            (False, checks(["disputed", "unresolved"]), "check 'j2' is unresolved"),
        ]
        for passed, target_checks, expected in refused:
            with self.assertRaises(scores.SlotValidationError, msg=expected) as caught:
                scores.score_run(self.run_with(passed, target_checks), allow_pending=True)
            self.assertIn(expected, str(caught.exception))
        accepted = [
            (True, checks(["pass", "pass"], ["pass"])),
            (False, checks(["pass"], ["fail"])),
            (False, checks(["disputed"])),
        ]
        for passed, target_checks in accepted:
            scores.score_run(self.run_with(passed, target_checks))

    def test_an_unresolved_check_makes_the_slot_pending(self):
        slots = self.run_with(None, checks(["pass", "unresolved", "disputed"]))
        with self.assertRaises(scores.PendingSlotsError):
            scores.score_run(slots)
        result = scores.score_model(slots, allow_pending=True)
        self.assertTrue(result["provisional"])
        self.assertEqual(result["pending_slot_ids"], ["f1-t01/1"])
        # Not passed in the main score, and still not passed with the
        # disputed check left out, because another check is unresolved.
        self.assertAlmostEqual(result["day_to_day_score"], 99.5238095238, places=10)
        self.assertAlmostEqual(result["day_to_day_score_excluding_disputed"], 99.5238095238, places=10)

    def test_bad_check_records(self):
        bad = [
            "c1",
            [["id", "c1"]],
            [{"by": "judge", "state": "pass"}],
            [{"id": "", "by": "judge", "state": "pass"}],
            [{"id": "c1", "by": "human", "state": "pass"}],
            [{"id": "c1", "by": "judge", "state": "maybe"}],
            [{"id": "c1", "by": "judge", "state": "pass"}, {"id": "c1", "by": "script", "state": "pass"}],
            [{"id": "c1", "by": "script", "state": "disputed"}],
            [{"id": "c1", "by": "script", "state": "unresolved"}],
        ]
        for target_checks in bad:
            for passed in (True, False, None):
                with self.assertRaises(scores.SlotValidationError, msg=repr(target_checks)):
                    scores.score_run(self.run_with(passed, target_checks), allow_pending=True)

    def test_checks_are_only_valid_on_an_answered_slot(self):
        slots = self.run_with(False, checks(["fail"]))
        slots[0]["outcome"] = "refused"
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(slots)
        self.assertIn("only valid on an 'answered' slot", str(caught.exception))

    def test_aggregate_counts_must_agree_with_the_check_list(self):
        target = checks(["pass", "disputed", "pass"], ["pass"])
        for field, value in (("judged_checks", 4), ("judged_checks", 2), ("disputed_checks", 0), ("disputed_checks", 2)):
            slots = self.run_with(False, target)
            slots[0][field] = value
            with self.assertRaises(scores.SlotValidationError, msg="%s=%r" % (field, value)) as caught:
                scores.score_run(slots)
            self.assertIn("the checks list gives", str(caught.exception))
        slots = self.run_with(False, target)
        slots[0].update(judged_checks=3, disputed_checks=1)
        self.assertEqual(scores.score_model(slots)["side_figures"]["disputed_checks"], 1)

    def test_aggregate_counts_without_a_check_list_are_refused(self):
        # The reviewer's exact record: pass true with disputed_checks 1.
        slots = uniform_model("m", 3)
        slots[0].update(judged_checks=4, disputed_checks=1)
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run(slots)
        slots = uniform_model("m", 3)
        slots[0]["pass"] = False
        slots[0].update(judged_checks=4, disputed_checks=1)
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run(slots)


class Display(unittest.TestCase):
    def test_rounds_to_one_decimal_and_leaves_the_original_alone(self):
        result = scores.score_model(
            run_from("m", method_tasks(), lambda t, family, s, r: ("answered", family == 1, {"cost_usd": 0.0123}))
        )
        shown = scores.format_for_display(result)
        self.assertEqual(shown["day_to_day_score"], 14.3)
        self.assertEqual(shown["pooled_pass_rate"], 16.7)
        self.assertEqual(shown["family_scores"]["1"], 100.0)
        self.assertEqual(shown["tasks"], 60)
        self.assertEqual(shown["model"], "m")
        self.assertAlmostEqual(result["day_to_day_score"], 100 / 7, places=12)

    def test_half_rounds_up(self):
        self.assertEqual(scores.format_for_display({"x": 0.25}), {"x": 0.3})
        self.assertEqual(scores.format_for_display({"x": 6.428571428571429}), {"x": 6.4})
        self.assertEqual(scores.format_for_display({"x": None, "n": 3}), {"x": None, "n": 3})

    def test_money_keeps_four_decimals(self):
        self.assertEqual(scores.format_for_display({"cost_per_task_usd": 0.036912}), {"cost_per_task_usd": 0.0369})


class Ranking(unittest.TestCase):
    def test_exact_ties_share_a_rank_and_the_next_rank_is_skipped(self):
        slots = uniform_model("zeta", 2) + uniform_model("alpha", 2) + uniform_model("mid", 1)
        ranked = scores.rank_models(scores.score_run(slots))
        self.assertEqual([row["rank"] for row in ranked], [1, 1, 3])
        # Neutral secondary sort by model name inside the tie.
        self.assertEqual([row["model"] for row in ranked], ["alpha", "zeta", "mid"])

    def test_ranks_on_unrounded_scores(self):
        rows = [
            {"model": "a", "day_to_day_score": 50.04},
            {"model": "b", "day_to_day_score": 50.01},
            {"model": "c", "day_to_day_score": 50.04},
            {"model": "d", "day_to_day_score": None},
        ]
        ranked = scores.rank_models(rows)
        self.assertEqual([(row["model"], row["rank"]) for row in ranked], [("a", 1), ("c", 1), ("b", 3), ("d", None)])

    def test_three_way_tie_then_fourth(self):
        rows = [{"model": name, "day_to_day_score": score} for name, score in (("d", 1.0), ("c", 9.0), ("b", 9.0), ("a", 9.0))]
        self.assertEqual([row["rank"] for row in scores.rank_models(rows)], [1, 1, 1, 4])


class Validation(unittest.TestCase):
    def setUp(self):
        self.slots = uniform_model("m", 3)

    def test_pending_slots_are_refused_by_default(self):
        self.slots[0]["pass"] = None
        with self.assertRaises(scores.PendingSlotsError) as caught:
            scores.score_run(self.slots)
        self.assertIn("1 slot(s) have a pending pass", str(caught.exception))

    def test_judge_unresolved_outcome_is_pending_and_refused(self):
        self.slots[0]["outcome"] = "judge_unresolved"
        self.slots[0]["pass"] = None
        with self.assertRaises(scores.PendingSlotsError):
            scores.score_run(self.slots)
        self.slots[0]["pass"] = False
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run(self.slots)

    def test_allow_pending_counts_pending_as_not_passed_and_marks_provisional(self):
        self.slots[0]["pass"] = None  # f1-t01, repeat 1
        result = scores.score_model(self.slots, allow_pending=True)
        self.assertTrue(result["provisional"])
        self.assertEqual(result["pending_slots"], 1)
        self.assertAlmostEqual(result["task_scores"]["f1-t01"], 2 / 3, places=15)
        self.assertAlmostEqual(result["pooled_pass_rate"], 179 / 180 * 100, places=12)
        self.assertEqual(result["pending_slot_ids"], ["f1-t01/1"])
        clean = scores.score_model(uniform_model("m", 3))
        self.assertFalse(clean["provisional"])
        self.assertEqual(clean["pending_slots"], 0)
        self.assertEqual(clean["pending_slot_ids"], [])

    def test_pending_slot_ids_are_listed_per_model(self):
        other = uniform_model("n", 3)
        self.slots[0]["pass"] = None  # f1-t01, repeat 1
        self.slots[179]["pass"] = None  # f7-t08, repeat 3
        self.slots[4]["outcome"] = "judge_unresolved"  # f1-t02, repeat 2
        self.slots[4]["pass"] = None
        results = scores.score_run(self.slots + other, allow_pending=True)
        self.assertEqual(results["m"]["pending_slots"], 3)
        self.assertEqual(results["m"]["pending_slot_ids"], ["f1-t01/1", "f1-t02/2", "f7-t08/3"])
        self.assertTrue(results["m"]["provisional"])
        self.assertFalse(results["n"]["provisional"])
        self.assertEqual(results["n"]["pending_slot_ids"], [])

    def test_a_provisional_result_serialises_differently_from_a_final_one(self):
        # The same slot, once pending and once finalised as failed: every
        # score is identical, so only the provisional fields tell them apart.
        self.slots[0]["pass"] = None
        pending = scores.score_model(self.slots, allow_pending=True)
        self.slots[0]["pass"] = False
        final = scores.score_model(self.slots)
        self.assertEqual(pending["day_to_day_score"], final["day_to_day_score"])
        self.assertNotEqual(json.dumps(pending, sort_keys=True), json.dumps(final, sort_keys=True))
        differing = sorted(key for key in final if final[key] != pending[key])
        self.assertEqual(differing, ["pending_slot_ids", "pending_slots", "provisional"])
        # The rounded copy for display keeps the marking too.
        shown_pending = scores.format_for_display(pending)
        shown_final = scores.format_for_display(final)
        self.assertIs(shown_pending["provisional"], True)
        self.assertEqual(shown_pending["pending_slots"], 1)
        self.assertEqual(shown_pending["pending_slot_ids"], ["f1-t01/1"])
        self.assertIs(shown_final["provisional"], False)
        self.assertNotEqual(json.dumps(shown_pending, sort_keys=True), json.dumps(shown_final, sort_keys=True))

    def test_a_task_with_two_slots_is_refused(self):
        del self.slots[0]
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots)
        self.assertIn("needs exactly 3 slots", str(caught.exception))
        self.assertIn("f1-t01", str(caught.exception))

    def test_a_duplicate_slot_is_refused(self):
        self.slots.append(dict(self.slots[0]))
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots)
        self.assertIn("duplicate slot", str(caught.exception))

    def test_unknown_outcome(self):
        self.slots[5]["outcome"] = "timeout"
        self.slots[5]["pass"] = False
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots)
        self.assertIn("unknown outcome 'timeout'", str(caught.exception))

    def test_repeat_out_of_range(self):
        for bad in (0, 4, "1", True, 1.0):
            slots = uniform_model("m", 3)
            slots[2]["repeat"] = bad
            with self.assertRaises(scores.SlotValidationError) as caught:
                scores.score_run(slots)
            self.assertIn("repeat out of range", str(caught.exception))

    def test_an_outcome_that_can_never_pass(self):
        for outcome in ("refused", "malformed", "execution_error"):
            slots = uniform_model("m", 3)
            slots[0]["outcome"] = outcome
            with self.assertRaises(scores.SlotValidationError) as caught:
                scores.score_run(slots)
            self.assertIn("can never pass", str(caught.exception))

    def test_bad_field_values(self):
        cases = [
            ("family", 8),
            ("family", "1"),
            ("split", "private"),
            ("pass", "true"),
            ("pass", 1),
            ("truncated", None),
            ("time_s", -1.0),
            ("time_s", "fast"),
            ("cost_usd", None),
            ("cost_usd", -0.01),
            ("cost_usd", float("nan")),
            ("model", ""),
            ("task_id", 7),
            ("judged_checks", -1),
            ("judged_checks", 4),  # no check list to back it
            ("disputed_checks", 1),  # no check list to back it
            ("checks", None),
            ("needed_judge_classification", "no"),
        ]
        for field, value in cases:
            slots = uniform_model("m", 3)
            slots[0][field] = value
            with self.assertRaises(scores.SlotValidationError, msg="%s=%r" % (field, value)):
                scores.score_run(slots)

    def test_missing_field(self):
        del self.slots[0]["cost_usd"]
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots)
        self.assertIn("missing field(s) cost_usd", str(caught.exception))

    def test_a_task_that_changes_family_or_split(self):
        self.slots[1]["split"] = "held-out"
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots)
        self.assertIn("family/split", str(caught.exception))

    def test_models_must_run_the_same_tasks(self):
        other = [slot for slot in uniform_model("n", 3) if slot["task_id"] != "f7-t08"]
        with self.assertRaises(scores.SlotValidationError) as caught:
            scores.score_run(self.slots + other)
        self.assertIn("did not run the same tasks", str(caught.exception))
        self.assertIn("f7-t08", str(caught.exception))

    def test_empty_and_wrong_types(self):
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run([])
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run("slots")
        with self.assertRaises(scores.SlotValidationError):
            scores.score_run([["not", "a", "dict"]])

    def test_score_model_needs_one_model(self):
        with self.assertRaises(scores.SlotValidationError):
            scores.score_model(self.slots + uniform_model("n", 3))


if __name__ == "__main__":
    unittest.main()
