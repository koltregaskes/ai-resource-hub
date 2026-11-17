"""Tests for bootstrap.py.

Run from the repo root:
    python -I -m unittest discover -s bench/daily-use/core/tests -p "test_b*.py" -v

NumPy is required. If it is not installed for this Python, point the
environment variable DTD_NUMPY_PATH at a folder that holds it.
"""

import json
import os
import sys
import unittest

CORE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if CORE not in sys.path:
    sys.path.insert(0, CORE)
_NUMPY_PATH = os.environ.get("DTD_NUMPY_PATH")
if _NUMPY_PATH and _NUMPY_PATH not in sys.path:
    sys.path.append(_NUMPY_PATH)

import numpy as np  # noqa: E402

import bootstrap  # noqa: E402
import scores  # noqa: E402

# The method's task table: (active, public) per family; the rest are held-out.
METHOD_LAYOUT = {1: (10, 7), 2: (10, 7), 3: (8, 5), 4: (8, 5), 5: (8, 5), 6: (8, 6), 7: (8, 5)}


def method_tasks():
    tasks = []
    for family, (active, public) in METHOD_LAYOUT.items():
        for number in range(1, active + 1):
            split = "public" if number <= public else "held-out"
            tasks.append(("f%d-t%02d" % (family, number), family, split))
    return tasks


def slots_for(model, tasks, passes_for):
    """Three slots per task; the first passes_for(task_id, family) of them pass."""
    slots = []
    for task_id, family, split in tasks:
        passes = passes_for(task_id, family)
        for repeat in (1, 2, 3):
            slots.append(
                {
                    "model": model,
                    "task_id": task_id,
                    "family": family,
                    "split": split,
                    "repeat": repeat,
                    "outcome": "answered",
                    "pass": repeat <= passes,
                    "truncated": False,
                    "time_s": 1.0,
                    "cost_usd": 0.0,
                }
            )
    return slots


def half_pass(task_id, family):
    """Odd-numbered tasks always pass, even-numbered tasks always fail."""
    return 3 if int(task_id[-2:]) % 2 == 1 else 0


# A small fixed fixture for the pinned test: (task id, family, split, passes
# out of 3 for model "a", passes for model "b"). Ids are deliberately listed
# out of order, because the module must sort them.
PINNED_FIXTURE = [
    ("t-103", 1, "held-out", 0, 3),
    ("t-101", 1, "public", 3, 3),
    ("t-102", 1, "public", 2, 1),
    ("t-104", 1, "public", 1, 0),
    ("t-201", 2, "public", 3, 2),
    ("t-202", 2, "held-out", 0, 2),
    ("t-203", 2, "public", 1, 3),
    ("t-301", 3, "public", 2, 2),
    ("t-302", 3, "held-out", 3, 0),
    ("t-401", 4, "public", 0, 1),
    ("t-402", 4, "public", 3, 3),
    ("t-403", 4, "held-out", 2, 0),
    ("t-501", 5, "held-out", 1, 3),
    ("t-502", 5, "public", 3, 1),
    ("t-503", 5, "public", 0, 0),
    ("t-601", 6, "public", 2, 3),
    ("t-602", 6, "held-out", 1, 1),
    ("t-701", 7, "public", 3, 2),
    ("t-702", 7, "public", 0, 3),
    ("t-703", 7, "held-out", 2, 1),
]


def pinned_slots():
    tasks = [(task_id, family, split) for task_id, family, split, _, _ in PINNED_FIXTURE]
    passes_a = {row[0]: row[3] for row in PINNED_FIXTURE}
    passes_b = {row[0]: row[4] for row in PINNED_FIXTURE}
    return slots_for("a", tasks, lambda t, f: passes_a[t]) + slots_for("b", tasks, lambda t, f: passes_b[t])


class PinnedFixture(unittest.TestCase):
    """Exact numbers, computed once and frozen. Any change to the generator,
    the seed, the sampling order, the sort of task ids or the percentile
    interpolation breaks these."""

    @classmethod
    def setUpClass(cls):
        cls.report = bootstrap.BootstrapReport(pinned_slots())
        cls.summary = cls.report.to_dict(pairs=[("a", "b")])

    def assertInterval(self, interval, lower, upper):
        self.assertAlmostEqual(interval["lower"], lower, places=10)
        self.assertAlmostEqual(interval["upper"], upper, places=10)

    def test_settings(self):
        self.assertEqual(self.summary["seed"], 20261114)
        self.assertEqual(self.summary["resamples"], 20000)
        self.assertEqual(self.summary["percentiles"], [2.5, 97.5])
        self.assertEqual(self.summary["draw_order"], ["main", "public", "held-out"])
        self.assertEqual(
            self.summary["family_sizes"]["main"],
            {"1": 4, "2": 3, "3": 2, "4": 3, "5": 3, "6": 2, "7": 3},
        )

    def test_headline_interval_model_a(self):
        self.assertInterval(self.summary["models"]["a"]["main"]["day_to_day_interval"], PIN_A_MAIN[0], PIN_A_MAIN[1])

    def test_headline_interval_model_b(self):
        self.assertInterval(self.summary["models"]["b"]["main"]["day_to_day_interval"], PIN_B_MAIN[0], PIN_B_MAIN[1])

    def test_family_interval(self):
        self.assertInterval(self.summary["models"]["a"]["main"]["family_intervals"]["1"], PIN_A_FAMILY_1[0], PIN_A_FAMILY_1[1])

    def test_public_interval_and_one_task_held_out_families(self):
        self.assertInterval(self.summary["models"]["a"]["public"]["day_to_day_interval"], PIN_A_PUBLIC[0], PIN_A_PUBLIC[1])
        # Each family has a single held-out task here, so nothing can vary.
        held_out = self.summary["models"]["a"]["held-out"]["day_to_day_interval"]
        self.assertIsNone(held_out["lower"])
        self.assertEqual(held_out["flag"], "not enough variation to estimate")

    def test_paired_difference(self):
        pair = self.summary["paired_differences"][0]
        self.assertEqual((pair["model_a"], pair["model_b"], pair["set"]), ("a", "b", "main"))
        self.assertAlmostEqual(pair["difference"], PIN_DIFFERENCE[0], places=10)
        self.assertInterval(pair, PIN_DIFFERENCE[1], PIN_DIFFERENCE[2])

    def test_point_difference_matches_scores_module(self):
        results = scores.score_run(pinned_slots())
        expected = results["a"]["day_to_day_score"] - results["b"]["day_to_day_score"]
        self.assertAlmostEqual(self.summary["paired_differences"][0]["difference"], expected, places=12)

    def test_first_draws(self):
        # The very first calls on the generator: family 1 (4 tasks), then
        # family 2 (3 tasks), of resample 0.
        self.assertEqual(self.report.draws["main"][1][0].tolist(), PIN_FIRST_DRAW_FAMILY_1)
        self.assertEqual(self.report.draws["main"][2][0].tolist(), PIN_FIRST_DRAW_FAMILY_2)

    def test_summary_is_json_serialisable(self):
        self.assertEqual(json.loads(json.dumps(self.summary)), self.summary)


# Frozen on 14 Nov 2026 with NumPy 2.5.4, to 10 decimal places.
PIN_A_MAIN = (39.6825396825, 69.8412698413)
PIN_B_MAIN = (40.8730158730, 71.4285714286)
PIN_A_FAMILY_1 = (16.6666666667, 83.3333333333)
PIN_A_PUBLIC = (40.4761904762, 78.5714285714)
PIN_DIFFERENCE = (-1.1904761905, -22.2222222222, 19.4444444444)  # point, lower, upper
PIN_FIRST_DRAW_FAMILY_1 = [3, 3, 2, 0]
PIN_FIRST_DRAW_FAMILY_2 = [0, 1, 0]
# The half-pass case on the method's 60-task layout: main, public, held-out.
PIN_HALF_MAIN = (37.5000000000, 62.8571428571)
PIN_HALF_PUBLIC = (41.9727891156, 72.7891156463)
PIN_HALF_HELD_OUT = (14.2857142857, 57.1428571429)


class SamplingOrder(unittest.TestCase):
    """The draws must match a literal reading of the method."""

    def test_draws_follow_the_method_literally(self):
        resamples = 40
        report = bootstrap.BootstrapReport(slots_for("m", method_tasks(), half_pass), resamples=resamples)
        rng = np.random.default_rng(20261114)
        sizes_by_set = {
            "main": [10, 10, 8, 8, 8, 8, 8],
            "public": [7, 7, 5, 5, 5, 6, 5],
            "held-out": [3, 3, 3, 3, 3, 2, 3],
        }
        for set_name in ("main", "public", "held-out"):  # the documented order
            for resample in range(resamples):
                for family, n in enumerate(sizes_by_set[set_name], start=1):
                    expected = rng.integers(0, n, size=n)
                    actual = report.draws[set_name][family][resample]
                    self.assertEqual(actual.tolist(), expected.tolist(), (set_name, resample, family))

    def test_tasks_are_sorted_by_id_within_a_family(self):
        report = bootstrap.BootstrapReport(pinned_slots(), resamples=5)
        self.assertEqual(report.task_ids["main"][1], ["t-101", "t-102", "t-103", "t-104"])
        self.assertEqual(report.task_ids["public"][1], ["t-101", "t-102", "t-104"])
        self.assertEqual(report.task_ids["held-out"][1], ["t-103"])
        # Model a's family 1 task scores, in id order: 3, 2, 0, 1 passes.
        np.testing.assert_allclose(report.task_scores["main"]["a"][1], [1.0, 2 / 3, 0.0, 1 / 3])

    def test_the_task_score_is_the_unit_resampled(self):
        report = bootstrap.BootstrapReport(pinned_slots(), resamples=25)
        task_scores = report.task_scores["main"]["a"]
        for resample in range(25):
            family_means = []
            for family in scores.FAMILIES:
                picked = task_scores[family][report.draws["main"][family][resample]]
                family_means.append(picked.mean() * 100.0)
                self.assertAlmostEqual(
                    report.family_resamples["main"]["a"][family][resample], family_means[-1], places=12
                )
            self.assertAlmostEqual(
                report.headline_resamples["main"]["a"][resample], sum(family_means) / 7, places=12
            )

    def test_input_order_does_not_matter(self):
        slots = pinned_slots()
        first = bootstrap.bootstrap_report(slots, resamples=500)
        second = bootstrap.bootstrap_report(list(reversed(slots)), resamples=500)
        self.assertEqual(json.dumps(first, sort_keys=True), json.dumps(second, sort_keys=True))


class HalfPassHalfFail(unittest.TestCase):
    """The method's worked case: half of every family's tasks always pass and
    half always fail. Headline 50, interval roughly 37 to 63."""

    @classmethod
    def setUpClass(cls):
        cls.slots = slots_for("half", method_tasks(), half_pass)
        cls.summary = bootstrap.bootstrap_report(cls.slots)

    def test_headline_is_fifty(self):
        self.assertEqual(scores.score_model(self.slots)["day_to_day_score"], 50.0)

    def test_interval_is_about_37_to_63(self):
        interval = self.summary["models"]["half"]["main"]["day_to_day_interval"]
        self.assertIsNone(interval["flag"])
        self.assertIsNone(interval["note"])
        self.assertTrue(36.0 <= interval["lower"] <= 39.0, interval)
        self.assertTrue(61.0 <= interval["upper"] <= 64.0, interval)

    def test_pinned_main_public_and_held_out_intervals(self):
        model = self.summary["models"]["half"]
        for set_name, pinned in (("main", PIN_HALF_MAIN), ("public", PIN_HALF_PUBLIC), ("held-out", PIN_HALF_HELD_OUT)):
            interval = model[set_name]["day_to_day_interval"]
            self.assertAlmostEqual(interval["lower"], pinned[0], places=10, msg=set_name)
            self.assertAlmostEqual(interval["upper"], pinned[1], places=10, msg=set_name)

    def test_subsets_use_their_own_family_sizes(self):
        sizes = self.summary["family_sizes"]
        self.assertEqual(sizes["main"], {"1": 10, "2": 10, "3": 8, "4": 8, "5": 8, "6": 8, "7": 8})
        self.assertEqual(sizes["public"], {"1": 7, "2": 7, "3": 5, "4": 5, "5": 5, "6": 6, "7": 5})
        self.assertEqual(sizes["held-out"], {"1": 3, "2": 3, "3": 3, "4": 3, "5": 3, "6": 2, "7": 3})
        main = self.summary["models"]["half"]["main"]["day_to_day_interval"]
        public = self.summary["models"]["half"]["public"]["day_to_day_interval"]
        held_out = self.summary["models"]["half"]["held-out"]["day_to_day_interval"]
        # Fewer tasks, wider interval.
        self.assertGreater(public["upper"] - public["lower"], main["upper"] - main["lower"])
        self.assertGreater(held_out["upper"] - held_out["lower"], public["upper"] - public["lower"])

    def test_same_input_gives_byte_identical_output(self):
        again = bootstrap.bootstrap_report(slots_for("half", method_tasks(), half_pass))
        self.assertEqual(
            json.dumps(self.summary, sort_keys=True).encode("utf-8"),
            json.dumps(again, sort_keys=True).encode("utf-8"),
        )


class SameDrawsAcrossModels(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        tasks = method_tasks()

        def mixed(task_id, family):
            return (int(task_id[-2:]) + family) % 4

        cls.slots = (
            slots_for("twin-1", tasks, mixed)
            + slots_for("twin-2", tasks, mixed)
            + slots_for("other", tasks, half_pass)
        )
        cls.report = bootstrap.BootstrapReport(cls.slots)

    def test_identical_models_differ_by_exactly_zero_in_every_resample(self):
        for set_name in bootstrap.SETS:
            differences = self.report.difference_resamples("twin-1", "twin-2", set_name)
            self.assertEqual(differences.shape, (20000,))
            self.assertTrue(np.all(differences == 0.0), set_name)
        pair = self.report.paired_difference("twin-1", "twin-2")
        self.assertEqual((pair["difference"], pair["lower"], pair["upper"]), (0.0, 0.0, 0.0))

    def test_identical_models_get_identical_intervals(self):
        summary = self.report.to_dict()
        self.assertEqual(summary["models"]["twin-1"], summary["models"]["twin-2"])

    def test_paired_difference_is_antisymmetric_and_narrower_than_unpaired(self):
        forward = self.report.paired_difference("twin-1", "other")
        backward = self.report.paired_difference("other", "twin-1")
        self.assertAlmostEqual(forward["difference"], -backward["difference"], places=12)
        self.assertAlmostEqual(forward["lower"], -backward["upper"], places=9)
        self.assertAlmostEqual(forward["upper"], -backward["lower"], places=9)
        self.assertLessEqual(forward["lower"], forward["difference"])
        self.assertLessEqual(forward["difference"], forward["upper"])

    def test_one_set_of_draws_serves_every_model(self):
        # The draws are stored once per set and family, not per model.
        self.assertEqual(sorted(self.report.draws["main"]), [1, 2, 3, 4, 5, 6, 7])
        self.assertEqual(self.report.draws["main"][1].shape, (20000, 10))
        self.assertEqual(self.report.draws["public"][6].shape, (20000, 6))
        self.assertEqual(self.report.draws["held-out"][6].shape, (20000, 2))


class DegenerateCases(unittest.TestCase):
    RESAMPLES = 2000

    def test_one_flat_family_is_flagged_and_the_headline_carries_a_note(self):
        def passes(task_id, family):
            if family == 2:
                return 3  # every task in family 2 scores the same
            if family == 5:
                return 1  # every task in family 5 scores 1/3
            return half_pass(task_id, family)

        summary = bootstrap.bootstrap_report(slots_for("m", method_tasks(), passes), resamples=self.RESAMPLES)
        main = summary["models"]["m"]["main"]
        for family in ("2", "5"):
            self.assertIsNone(main["family_intervals"][family]["lower"])
            self.assertIsNone(main["family_intervals"][family]["upper"])
            self.assertEqual(main["family_intervals"][family]["flag"], "not enough variation to estimate")
        self.assertIsNone(main["family_intervals"]["1"]["flag"])
        self.assertLess(main["family_intervals"]["1"]["lower"], main["family_intervals"]["1"]["upper"])

        headline = main["day_to_day_interval"]
        self.assertIsNone(headline["flag"])
        self.assertEqual(headline["note"], "no variation in family 2, 5")
        self.assertEqual(headline["degenerate_families"], [2, 5])
        self.assertLess(headline["lower"], headline["upper"])

    def test_every_family_flat_flags_the_headline(self):
        summary = bootstrap.bootstrap_report(
            slots_for("m", method_tasks(), lambda task_id, family: family % 4), resamples=self.RESAMPLES
        )
        for set_name in bootstrap.SETS:
            headline = summary["models"]["m"][set_name]["day_to_day_interval"]
            self.assertIsNone(headline["lower"])
            self.assertIsNone(headline["upper"])
            self.assertEqual(headline["flag"], "not enough variation to estimate")
            self.assertEqual(headline["degenerate_families"], [1, 2, 3, 4, 5, 6, 7])

    def test_degeneracy_is_judged_per_model_and_per_set(self):
        def held_out_flat(task_id, family):
            # Family 6 has held-out tasks 07 and 08; give them the same score.
            if family == 6 and int(task_id[-2:]) >= 7:
                return 2
            return half_pass(task_id, family)

        slots = slots_for("flat", method_tasks(), lambda t, f: 3) + slots_for("varied", method_tasks(), held_out_flat)
        summary = bootstrap.bootstrap_report(slots, resamples=self.RESAMPLES)
        self.assertEqual(summary["models"]["flat"]["main"]["day_to_day_interval"]["flag"], "not enough variation to estimate")
        self.assertIsNone(summary["models"]["varied"]["main"]["day_to_day_interval"]["flag"])
        self.assertIsNone(summary["models"]["varied"]["main"]["day_to_day_interval"]["note"])
        held_out = summary["models"]["varied"]["held-out"]
        self.assertEqual(held_out["family_intervals"]["6"]["flag"], "not enough variation to estimate")
        self.assertEqual(held_out["day_to_day_interval"]["note"], "no variation in family 6")

    def test_a_subset_with_an_empty_family_has_no_headline_interval(self):
        tasks = [(task_id, family, "public") for task_id, family, _ in method_tasks()]
        report = bootstrap.BootstrapReport(slots_for("m", tasks, half_pass), resamples=self.RESAMPLES)
        held_out = report.headline_interval("m", "held-out")
        self.assertIsNone(held_out["lower"])
        self.assertEqual(held_out["flag"], "no tasks in family 1, 2, 3, 4, 5, 6, 7")
        self.assertEqual(report.family_interval("m", 3, "held-out")["flag"], "no tasks in this family")
        self.assertIsNone(report.paired_difference("m", "m", "held-out")["difference"])
        self.assertIsNotNone(report.headline_interval("m", "public")["lower"])


class OverlapLabel(unittest.TestCase):
    def test_touching_intervals_overlap(self):
        self.assertTrue(bootstrap.intervals_overlap((40.0, 50.0), (50.0, 60.0)))
        self.assertTrue(bootstrap.intervals_overlap((50.0, 60.0), (40.0, 50.0)))

    def test_a_gap_however_small_does_not_overlap(self):
        self.assertFalse(bootstrap.intervals_overlap((40.0, 50.0), (50.000000001, 60.0)))

    def test_uses_unrounded_values(self):
        # Both bounds would show as 50.0 at one decimal, but they do not meet.
        self.assertFalse(bootstrap.intervals_overlap((40.0, 49.96), (50.04, 60.0)))

    def test_nested_and_partial(self):
        self.assertTrue(bootstrap.intervals_overlap((10.0, 90.0), (40.0, 50.0)))
        self.assertTrue(bootstrap.intervals_overlap((40.0, 55.0), (50.0, 60.0)))

    def test_accepts_interval_dicts_and_refuses_missing_bounds(self):
        a = {"lower": 40.0, "upper": 50.0, "flag": None}
        b = {"lower": 50.0, "upper": 60.0, "flag": None}
        self.assertTrue(bootstrap.intervals_overlap(a, b))
        with self.assertRaises(ValueError):
            bootstrap.intervals_overlap(a, {"lower": None, "upper": None, "flag": "not enough variation to estimate"})

    def test_overlap_does_not_chain(self):
        a, b, c = (40.0, 50.0), (48.0, 58.0), (56.0, 66.0)
        self.assertTrue(bootstrap.intervals_overlap(a, b))
        self.assertTrue(bootstrap.intervals_overlap(b, c))
        self.assertFalse(bootstrap.intervals_overlap(a, c))


class Validation(unittest.TestCase):
    def test_pending_slots_are_refused(self):
        slots = slots_for("m", method_tasks(), half_pass)
        slots[0]["pass"] = None
        with self.assertRaises(scores.PendingSlotsError):
            bootstrap.bootstrap_report(slots, resamples=10)

    def test_a_final_report_says_it_is_not_provisional(self):
        summary = bootstrap.bootstrap_report(pinned_slots(), pairs=[("a", "b")], resamples=50)
        self.assertIs(summary["provisional"], False)
        self.assertEqual(summary["pending_slots"], {"a": 0, "b": 0})
        self.assertEqual(summary["pending_slot_ids"], {"a": [], "b": []})
        self.assertIs(summary["models"]["a"]["provisional"], False)
        self.assertEqual(summary["models"]["a"]["pending_slots"], 0)
        self.assertIs(summary["paired_differences"][0]["provisional"], False)

    def test_a_pending_report_is_marked_provisional_with_counts_and_ids(self):
        slots = pinned_slots()
        for slot in slots:
            if slot["model"] == "a" and (slot["task_id"], slot["repeat"]) in (("t-101", 2), ("t-702", 1)):
                slot["pass"] = None
        report = bootstrap.BootstrapReport(slots, resamples=50, allow_pending=True)
        summary = report.to_dict(pairs=[("a", "b")])
        self.assertTrue(report.provisional)
        self.assertIs(summary["provisional"], True)
        self.assertEqual(summary["pending_slots"], {"a": 2, "b": 0})
        self.assertEqual(summary["pending_slot_ids"], {"a": ["t-101/2", "t-702/1"], "b": []})
        self.assertIs(summary["models"]["a"]["provisional"], True)
        self.assertEqual(summary["models"]["a"]["pending_slots"], 2)
        self.assertIs(summary["models"]["b"]["provisional"], False)
        self.assertIs(summary["paired_differences"][0]["provisional"], True)
        self.assertEqual(json.loads(json.dumps(summary)), summary)

    def test_a_pending_slot_does_not_serialise_like_a_final_failed_one(self):
        # The Codex review's case (PR 132, finding 3): a perfect run with one
        # slot pending, against the same slot finalised as failed. The
        # intervals are the same; the report must not be.
        def with_first_slot(value):
            slots = slots_for("m", method_tasks(), lambda task_id, family: 3)
            slots[0]["pass"] = value  # f1-t01, repeat 1
            return slots

        pending = bootstrap.bootstrap_report(with_first_slot(None), allow_pending=True)
        final = bootstrap.bootstrap_report(with_first_slot(False))
        interval = pending["models"]["m"]["main"]["day_to_day_interval"]
        self.assertAlmostEqual(interval["lower"], 98.5714285714, places=10)
        self.assertEqual(interval["upper"], 100.0)
        self.assertEqual(
            pending["models"]["m"]["main"]["day_to_day_interval"],
            final["models"]["m"]["main"]["day_to_day_interval"],
        )
        self.assertNotEqual(json.dumps(pending, sort_keys=True), json.dumps(final, sort_keys=True))
        self.assertIs(pending["provisional"], True)
        self.assertIs(final["provisional"], False)
        self.assertEqual(pending["pending_slots"], {"m": 1})
        self.assertEqual(pending["pending_slot_ids"], {"m": ["f1-t01/1"]})
        self.assertEqual(final["pending_slots"], {"m": 0})
        # The rounded copy for display keeps the marking.
        shown = scores.format_for_display(pending)
        self.assertIs(shown["provisional"], True)
        self.assertEqual(shown["pending_slot_ids"], {"m": ["f1-t01/1"]})
        self.assertNotEqual(
            json.dumps(shown, sort_keys=True),
            json.dumps(scores.format_for_display(final), sort_keys=True),
        )

    def test_a_disputed_check_lowers_the_task_score_that_is_resampled(self):
        slots = pinned_slots()
        target = next(s for s in slots if s["model"] == "a" and s["task_id"] == "t-101" and s["repeat"] == 1)
        target["checks"] = [{"id": "c1", "by": "judge", "state": "disputed"}]
        with self.assertRaises(scores.SlotValidationError):
            bootstrap.bootstrap_report(slots, resamples=10)  # pass is still true
        target["pass"] = False
        report = bootstrap.BootstrapReport(slots, resamples=10)
        # Model a's family 1 task scores, in id order: now 2, 2, 0, 1 passes.
        np.testing.assert_allclose(report.task_scores["main"]["a"][1], [2 / 3, 2 / 3, 0.0, 1 / 3])

    def test_a_wrong_slot_count_is_refused(self):
        slots = slots_for("m", method_tasks(), half_pass)[1:]
        with self.assertRaises(scores.SlotValidationError):
            bootstrap.bootstrap_report(slots, resamples=10)

    def test_percentile_uses_linear_interpolation(self):
        # 0..100 in steps of 1: the 2.5th percentile sits between 2 and 3.
        lower, upper = bootstrap.percentile_interval(np.arange(101.0))
        self.assertAlmostEqual(lower, 2.5, places=12)
        self.assertAlmostEqual(upper, 97.5, places=12)
        lower, upper = bootstrap.percentile_interval([0.0, 10.0])
        self.assertAlmostEqual(lower, 0.25, places=12)
        self.assertAlmostEqual(upper, 9.75, places=12)


if __name__ == "__main__":
    unittest.main()
