"""Pre-flight figures, worked by hand on a small fixture.

The fixture: one model and two judges, two public tasks with no judged
checks and no qualification samples. In most tests every text sent is
counted as 10 input tokens (`fixed_sizes` swaps the byte bound and the
expected-figure estimate for that), so that every figure below can be
checked with a calculator. `RealSizeTests` use the real byte bound.

Prices per million tokens: model m-oa 3 in / 30 out (openai);
judge j-oa 6 in / 12 out (openai), judge j-an 9 in / 18 out (anthropic).
Task output limit 4096; judge output limit 400.
Planning sizes: model output 300 tokens, judge output 100 tokens.

An answer as judge input. In the bounds it is planned at 4 bytes per token
of the task limit, each byte one token: 4096 x 4 = 16384. In the expected
figure it is ceil(300 x 4 / 3) = 400.

One request at its limit:
  model:  (10 x 3 + 4096 x 30) / 1e6 = 122910 / 1e6              = 0.12291
  j-oa:   ((10 + 16384) x 6 + 400 x 12) / 1e6 = 103164 / 1e6     = 0.103164
  j-an:   ((10 + 16384) x 9 + 400 x 18) / 1e6 = 154746 / 1e6     = 0.154746
One request at the planning size (the expected figure):
  model:  (10 x 3 + 300 x 30) / 1e6                              = 0.00903
  j-oa:   ((10 + 400) x 6 + 100 x 12) / 1e6                      = 0.00366
  j-an:   ((10 + 400) x 9 + 100 x 18) / 1e6                      = 0.00549

Canary: 1 model x 2 tasks x 1 repeat = 2 slots; each slot is 1 model request
and 1 outcome classification per judge.
  openai once  = 2 x 0.12291 + 2 x 0.103164 = 0.452148
  openai planning bound = 0.452148 x 1.15                        = 0.5199702
  openai absolute bound = 2 x 0.12291 x 3 + 2 x 0.103164 x 2     = 1.150116
  openai expected       = 2 x 0.00903 + 2 x 0.00366              = 0.02538
  anthropic once = 2 x 0.154746 = 0.309492
  anthropic planning bound = 0.309492 x 1.15                     = 0.3559158
  anthropic absolute bound = 0.309492 x 2                        = 0.618984
  anthropic expected       = 2 x 0.00549                         = 0.01098
Full run: 6 slots, so three times the canary.
"""

import contextlib
import dataclasses
import os
import sys
import unittest
from decimal import Decimal
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
import judges  # noqa: E402
import keys  # noqa: E402
import ledger  # noqa: E402
import preflight  # noqa: E402
import test_run_support as support  # noqa: E402

D = Decimal
TEN = lambda *texts: 10  # noqa: E731


def fixed_sizes():
    """Count every text sent as 10 input tokens, in the two bounds and in the
    expected figure alike, so the figures can be worked by hand."""
    stack = contextlib.ExitStack()
    stack.enter_context(mock.patch.object(ledger, "input_token_bound", TEN))
    stack.enter_context(mock.patch.object(preflight, "expected_input_tokens", TEN))
    return stack


def small_config(**over):
    return support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")], **over)


TASKS = [support.task("t1"), support.task("t2")]
CAPS = {"openai": D("50"), "anthropic": D("50")}


def run(stage="canary", caps=None, tasks=None, cfg=None, real_sizes=False, **kwargs):
    kwargs.setdefault("checklist_samples", [])
    kwargs.setdefault("outcome_samples", [])
    kwargs.setdefault("out", None)
    with contextlib.ExitStack() if real_sizes else fixed_sizes():
        return preflight.preflight(cfg or small_config(), tasks or TASKS, caps or CAPS,
                                   stage=stage, **kwargs)


class HandComputedTests(unittest.TestCase):
    def test_canary_figures(self):
        stage = run()["by_stage"]["canary"]
        self.assertEqual(stage["openai"], {"expected": D("0.02538"),
                                           "planning_bound": D("0.5199702"),
                                           "absolute_bound": D("1.150116")})
        self.assertEqual(stage["anthropic"], {"expected": D("0.01098"),
                                              "planning_bound": D("0.3559158"),
                                              "absolute_bound": D("0.618984")})

    def test_full_run_figures_are_three_times_the_canary(self):
        stage = run()["by_stage"]["full"]
        self.assertEqual(stage["openai"], {"expected": D("0.07614"),
                                           "planning_bound": D("1.5599106"),
                                           "absolute_bound": D("3.450348")})
        self.assertEqual(stage["anthropic"], {"expected": D("0.03294"),
                                              "planning_bound": D("1.0677474"),
                                              "absolute_bound": D("1.856952")})

    def test_whole_plan_totals(self):
        result = run()
        whole = result["whole_plan"]
        self.assertEqual(whole["openai"]["planning_bound"], D("2.0798808"))
        self.assertEqual(whole["anthropic"]["planning_bound"], D("1.4236632"))
        self.assertEqual(whole["total"]["planning_bound"], D("3.503544"))
        self.assertEqual(whole["total"]["expected"], D("0.14544"))
        self.assertEqual(whole["total"]["absolute_bound"], D("7.0764"))
        self.assertEqual(result["by_stage"]["qualify"]["openai"]["planning_bound"], D(0))

    def test_request_and_task_counts(self):
        result = run()
        self.assertEqual(result["requests"], {
            "canary": {"model": 2, "outcome_classification": 4},
            "qualify": {},
            "full": {"model": 6, "outcome_classification": 12}})
        self.assertEqual(result["counts"], {
            "models": 1, "tasks": 2, "tasks_with_judged_checks": 0, "judged_checks": 0,
            "full_run_slots": 6, "canary_slots": 2})


class RealSizeTests(unittest.TestCase):
    """The real byte bound, with nothing swapped out."""

    # 300 bytes, and 300 characters that are 600 bytes.
    TASKS = [support.task("t1", prompt="x" * 300), support.task("t2", prompt="\u00e9" * 300)]

    def test_input_in_the_bounds_is_bytes_plus_the_framing_allowance(self):
        result = run(tasks=self.TASKS, real_sizes=True)
        # Model requests only, canary. Input bound: 300 + 256 = 556 and 600 + 256 = 856.
        # (556 x 3 + 4096 x 30) + (856 x 3 + 4096 x 30) = 124548 + 125448 = 249996
        # per million = 0.249996, before the judge calls.
        judge_once = D(0)
        for item in self.TASKS:
            prefix = len(judges.build_outcome_prompt(item["prompt"], "").encode("utf-8")) + 256
            answer = 16384          # 4096 x 4: the answer as judge input, a token per byte
            judge_once += (D(prefix + answer) * 6 + D(400) * 12) / D(1000000)
        canary = result["by_stage"]["canary"]["openai"]
        self.assertEqual(canary["planning_bound"], (D("0.249996") + judge_once) * D("1.15"))
        self.assertEqual(canary["absolute_bound"], D("0.249996") * 3 + judge_once * 2)

    def test_the_bound_and_the_reservation_are_the_same_figure(self):
        # What the runner reserves for each model request of the canary, summed,
        # is the model share of the planning bound before the retry allowance.
        cfg = small_config()
        reserved = sum((ledger.worst_case_usd(ledger.input_token_bound(item["prompt"]),
                                              item["max_output_tokens"], cfg.models[0].price)
                        for item in self.TASKS), D(0))
        self.assertEqual(reserved, D("0.249996"))

    def test_the_expected_figure_never_feeds_a_bound_or_a_refusal(self):
        plain = run(tasks=self.TASKS, real_sizes=True)
        # Make the softer estimate absurd: only the expected figure moves.
        with mock.patch.object(preflight, "expected_input_tokens", lambda text: 10 ** 9):
            # The caps are exactly the planning bounds: any leak of the
            # expected figure into the cap check would refuse this.
            huge = run(tasks=self.TASKS, real_sizes=True, caps={
                provider: plain["whole_plan"][provider]["planning_bound"]
                for provider in ("openai", "anthropic")})
        self.assertTrue(huge["ok"])
        for provider in ("openai", "anthropic"):
            for figure in ("planning_bound", "absolute_bound"):
                self.assertEqual(huge["whole_plan"][provider][figure],
                                 plain["whole_plan"][provider][figure])
            self.assertGreater(huge["whole_plan"][provider]["expected"],
                               plain["whole_plan"][provider]["planning_bound"])
        # The softer estimate stays below the bound on ordinary text.
        self.assertLess(plain["whole_plan"]["openai"]["expected"],
                        plain["whole_plan"]["openai"]["planning_bound"])
        self.assertEqual(preflight.expected_input_tokens("x" * 301), 101)

    def test_the_output_says_how_input_is_counted(self):
        lines = []
        run(tasks=self.TASKS, real_sizes=True, out=lines.append)
        text = "\n".join(lines)
        self.assertIn("byte length of the text sent plus 256 tokens of framing", text)
        self.assertIn("never used for a reservation or a cap check", text)


class EntryGuardTests(unittest.TestCase):
    def test_a_provider_key_variable_refuses_the_pre_flight_before_anything_else(self):
        for name in keys.FORBIDDEN_ENVIRONMENT_NAMES:
            with self.assertRaises(keys.EnvironmentNotClean) as caught:
                # Nothing else is looked at: the config and the tasks are not even valid.
                preflight.preflight(None, None, None, environ={name: "FAKE-ENV-VALUE"})
            self.assertIn(name, str(caught.exception))
            self.assertNotIn("FAKE-ENV-VALUE", str(caught.exception))
            with mock.patch.dict(os.environ, {name: "FAKE-ENV-VALUE"}):
                with self.assertRaises(keys.EnvironmentNotClean):
                    run()

    def test_a_judge_above_the_400_token_limit_refuses_the_pre_flight(self):
        cfg = small_config(judge_candidates=support.candidates_dict())
        lifted = dataclasses.replace(cfg.judges[0], max_output_tokens=1000)
        with self.assertRaises(config.ConfigError) as caught:
            run(cfg=dataclasses.replace(cfg, judges=(lifted, cfg.judges[1])))
        self.assertIn("judge j-oa has an output limit outside 1 to 400", str(caught.exception))
        # A candidate that is not on the panel.
        sides = dict(cfg.judge_candidates)
        sides["anthropic"] = (dataclasses.replace(sides["anthropic"][0], max_output_tokens=401),
                              ) + tuple(sides["anthropic"][1:])
        with self.assertRaises(config.ConfigError) as caught:
            run(cfg=dataclasses.replace(cfg, judge_candidates=sides))
        self.assertIn("judge j-an-cheap", str(caught.exception))
        # A recorded panel handed in from outside.
        with self.assertRaises(config.ConfigError):
            run(cfg=cfg, qualification={"run_id": "r", "panel": (lifted, cfg.judges[1])})


class JudgedTaskTests(unittest.TestCase):
    def test_checklist_judging_is_counted_for_every_slot_of_a_judged_task(self):
        tasks = [support.task("t1", family=4, checks=3), support.task("t2"),
                 support.task("h1", family=4, split="held-out", checks=2)]
        result = run(tasks=tasks)
        # Full: 3 tasks x 3 repeats = 9 slots; 2 judged tasks x 3 repeats x 2 judges = 12.
        self.assertEqual(result["requests"]["full"], {
            "model": 9, "outcome_classification": 18, "checklist_judging": 12})
        # Canary uses the first 2 public tasks by id (t1, t2): t1 is judged.
        self.assertEqual(result["requests"]["canary"], {
            "model": 2, "outcome_classification": 4, "checklist_judging": 2})
        self.assertEqual(result["counts"]["tasks_with_judged_checks"], 2)
        self.assertEqual(result["counts"]["judged_checks"], 5)

    def test_qualification_calls_are_counted_from_the_sample_files(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        checklist = [{"sample_id": "s%d" % n, "task_id": "t1", "answer": "An answer.",
                      "reference": {"c1": True, "c2": False}} for n in range(4)]
        outcome = [{"sample_id": "o%d" % n, "task_id": "t2", "reply": "A reply.",
                    "reference_outcome": "answered"} for n in range(20)]
        result = run(tasks=tasks, checklist_samples=checklist, outcome_samples=outcome)
        self.assertEqual(result["requests"]["qualify"], {"judge_qualification": 48})
        self.assertFalse(result["qualification_samples_assumed"])
        # 24 calls per judge; j-oa at its limit: (10 x 6 + 400 x 12) / 1e6 = 0.00486 each.
        self.assertEqual(result["by_stage"]["qualify"]["openai"]["planning_bound"],
                         D("0.00486") * 24 * D("1.15"))
        self.assertEqual(result["by_stage"]["qualify"]["openai"]["absolute_bound"],
                         D("0.00486") * 24 * 2)

    def test_missing_sample_files_are_assumed_and_said_so(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        result = run(tasks=tasks, checklist_samples=None, outcome_samples=None)
        # 4 per judged task + 20 outcome samples, for each of the 2 judges.
        self.assertEqual(result["requests"]["qualify"], {"judge_qualification": 48})
        self.assertTrue(result["qualification_samples_assumed"])

    def test_a_count_of_judged_checks_is_enough(self):
        item = support.task("t1")
        item["judged_checks"] = 4
        result = run(tasks=[item, support.task("t2")])
        self.assertEqual(result["counts"]["judged_checks"], 4)
        self.assertEqual(result["requests"]["full"]["checklist_judging"], 6)


class RefusalTests(unittest.TestCase):
    def test_refuses_when_the_planning_bound_is_above_a_remaining_cap(self):
        ok = run(caps={"openai": D("2.0798808"), "anthropic": D("50")})
        self.assertTrue(ok["ok"])
        preflight.enforce(ok)
        refused = run(caps={"openai": D("2.0798807"), "anthropic": D("50")})
        self.assertFalse(refused["ok"])
        self.assertIn("openai", refused["refusals"][0])
        self.assertIn("Shorten the model list", refused["refusals"][0])
        with self.assertRaises(preflight.PreflightRefused):
            preflight.enforce(refused)
        refused = run(caps={"openai": D("50"), "anthropic": D("0.50")})
        self.assertIn("anthropic", refused["refusals"][0])

    def test_absolute_bound_is_information_only(self):
        result = run(caps={"openai": D("2.10"), "anthropic": D("1.45")})
        self.assertTrue(result["ok"])
        self.assertGreater(result["whole_plan"]["openai"]["absolute_bound"], D("2.10"))

    def test_a_later_stage_is_tested_against_what_is_still_to_run(self):
        caps = {"openai": D("1.5599106"), "anthropic": D("50")}
        self.assertTrue(run(stage="full", caps=caps)["ok"])
        self.assertFalse(run(stage="qualify", caps={"openai": D("1.55"), "anthropic": D("50")})["ok"])
        self.assertFalse(run(stage="canary", caps=caps)["ok"])

    def test_max_usd_is_tested_against_this_stage(self):
        # Canary planning bound over both providers: 0.5199702 + 0.3559158 = 0.875886
        self.assertTrue(run(max_usd="0.875886")["ok"])
        refused = run(max_usd="0.87")
        self.assertFalse(refused["ok"])
        self.assertIn("--max-usd", refused["refusals"][0])

    def test_output_is_printed_with_all_three_figures(self):
        lines = []
        run(stage="qualify", out=lines.append)
        text = "\n".join(lines)
        for word in ("expected", "planning bound", "absolute bound", "remaining cap",
                     "tasks with a judged check: 0", "2.0799", "1.4237", "7.0764",
                     "planning bound by stage", "Result: within the remaining caps"):
            self.assertIn(word, text)

    def test_the_three_figures_are_printed_even_when_the_run_is_refused(self):
        lines = []
        result = run(stage="qualify", caps={"openai": D("0.01"), "anthropic": D("50")},
                     out=lines.append)
        self.assertFalse(result["ok"])
        text = "\n".join(lines)
        for word in ("expected", "planning bound", "absolute bound", "0.1454", "2.0799",
                     "7.0764", "REFUSED: openai"):
            self.assertIn(word, text)

    def test_stages_run_qualify_then_canary_then_full(self):
        self.assertEqual(preflight.STAGES, ("qualify", "canary", "full"))
        lines = []
        run(stage="qualify", out=lines.append)
        order = [line.split()[2].rstrip(":") for line in lines
                 if line.startswith("  requests in ")]
        self.assertEqual(order, ["qualify", "canary", "full"])

    def test_larger_task_limit_costs_more(self):
        big = [support.task("t1", limit=8192), support.task("t2")]
        self.assertGreater(run(tasks=big)["whole_plan"]["openai"]["planning_bound"],
                           run()["whole_plan"]["openai"]["planning_bound"])



class JudgeCandidateTests(unittest.TestCase):
    """Five judge candidates (see `support.candidates_dict`), all with a
    400-token output limit. One judge request at its limit, on the fixture
    above (10 input tokens, a 4096-token answer planned as 16384):

      qualification call:  (10 x in + 400 x out) / 1e6
        j-oa-cheap 1/2   = 0.00081      j-an-cheap 2/4 = 0.00162
        j-oa       6/12  = 0.00486      j-an       9/18 = 0.00729
        j-oa-dear  20/40 = 0.0162
      outcome classification of one slot:  ((10 + 16384) x in + 400 x out) / 1e6
        j-oa-cheap = 0.017194   j-oa = 0.103164   j-oa-dear = 0.34388
        j-an-cheap = 0.034388   j-an = 0.154746
    """

    def cfg(self, **over):
        over.setdefault("judge_candidates", support.candidates_dict())
        return small_config(**over)

    def samples(self):
        tasks = [support.task("t1", family=4, checks=2), support.task("t2")]
        checklist, outcome = support.qualification_samples()
        return tasks, checklist, outcome

    def test_qualification_is_counted_for_every_candidate(self):
        tasks, checklist, outcome = self.samples()
        result = run(cfg=self.cfg(), tasks=tasks, checklist_samples=checklist,
                     outcome_samples=outcome)
        # 4 checklist samples + 20 outcome samples = 24 calls for each of 5 candidates.
        self.assertEqual(result["requests"]["qualify"], {"judge_qualification": 120})
        self.assertEqual(result["qualification"], {
            "candidates": {"anthropic": ["j-an-cheap", "j-an"],
                           "openai": ["j-oa-cheap", "j-oa", "j-oa-dear"]},
            "checklist_samples": 4, "outcome_samples": 20, "calls_per_candidate": 24,
            "calls": 120})
        stage = result["by_stage"]["qualify"]
        openai_once = (D("0.00081") + D("0.00486") + D("0.0162")) * 24
        anthropic_once = (D("0.00162") + D("0.00729")) * 24
        self.assertEqual(stage["openai"]["planning_bound"], openai_once * D("1.15"))
        self.assertEqual(stage["openai"]["absolute_bound"], openai_once * 2)
        self.assertEqual(stage["anthropic"]["planning_bound"], anthropic_once * D("1.15"))

    def test_the_count_follows_the_sample_files(self):
        tasks, checklist, outcome = self.samples()
        result = run(cfg=self.cfg(), tasks=tasks, checklist_samples=checklist + checklist,
                     outcome_samples=outcome[:7])
        self.assertEqual(result["qualification"]["calls_per_candidate"], 15)
        self.assertEqual(result["requests"]["qualify"], {"judge_qualification": 75})

    def test_without_a_record_judging_is_costed_at_the_dearest_candidate(self):
        result = run(cfg=self.cfg())
        self.assertEqual(result["judging"], {
            "case": "worst_case", "judges": {"openai": "j-oa-dear", "anthropic": "j-an"},
            "qualification_run_id": None, "note": None})
        canary = result["by_stage"]["canary"]
        # 2 slots: 2 model requests and 2 classifications per judge, each once.
        self.assertEqual(canary["openai"]["planning_bound"],
                         (2 * D("0.12291") + 2 * D("0.34388")) * D("1.15"))
        self.assertEqual(canary["anthropic"]["planning_bound"], 2 * D("0.154746") * D("1.15"))
        self.assertEqual(result["requests"]["canary"],
                         {"model": 2, "outcome_classification": 4})

    def test_with_a_recorded_panel_judging_is_costed_at_that_panel(self):
        cheap = support.make_config(judge_candidates=support.candidates_dict(),
                                    judges=support.cheap_panel()).judges
        result = run(cfg=self.cfg(), qualification={"run_id": "RUN-7", "panel": cheap})
        self.assertEqual(result["judging"], {
            "case": "recorded_panel",
            "judges": {"openai": "j-oa-cheap", "anthropic": "j-an-cheap"},
            "qualification_run_id": "RUN-7", "note": None})
        canary = result["by_stage"]["canary"]
        self.assertEqual(canary["openai"]["planning_bound"],
                         (2 * D("0.12291") + 2 * D("0.017194")) * D("1.15"))
        self.assertEqual(canary["anthropic"]["planning_bound"], 2 * D("0.034388") * D("1.15"))
        worst = run(cfg=self.cfg())
        for provider in ("openai", "anthropic"):
            self.assertLess(result["whole_plan"][provider]["planning_bound"],
                            worst["whole_plan"][provider]["planning_bound"])

    def test_the_output_says_which_case_applied(self):
        def text(**kwargs):
            lines = []
            run(stage="qualify", cfg=self.cfg(), out=lines.append, **kwargs)
            return "\n".join(lines)
        worst = text()
        self.assertIn("judging costed at the WORST CASE, the dearest candidate on each side: "
                      "anthropic j-an, openai j-oa-dear", worst)
        self.assertIn("why: no passed qualification is on record yet", worst)
        self.assertIn("judge candidates: anthropic j-an-cheap, j-an; "
                      "openai j-oa-cheap, j-oa, j-oa-dear", worst)
        noted = text(qualification_note="the checklist samples file has changed")
        self.assertIn("why: the checklist samples file has changed", noted)
        cheap = support.make_config(judge_candidates=support.candidates_dict(),
                                    judges=support.cheap_panel()).judges
        recorded = text(qualification={"run_id": "RUN-7", "panel": cheap})
        self.assertIn("judging costed with the RECORDED PANEL of qualification RUN-7: "
                      "anthropic j-an-cheap, openai j-oa-cheap", recorded)
        self.assertNotIn("WORST CASE", recorded)

    def test_the_dearest_candidate_is_the_one_whose_judging_costs_most(self):
        # Listed first, but the dearest: listing order does not decide it.
        sides = support.candidates_dict()
        sides["openai"].reverse()
        self.assertEqual(run(cfg=self.cfg(judge_candidates=sides))["judging"]["judges"],
                         {"openai": "j-oa-dear", "anthropic": "j-an"})
        # The lowest price sum can still cost the most to judge with: input
        # carries most of the cost of judging, so a high input price decides it.
        # j-an-cheap at 10 in / 1 out: ((10 + 16384) x 10 + 400 x 1) / 1e6 = 0.16434,
        # above j-an at 0.154746, though its price sum is 11 against 27.
        sides = support.candidates_dict()
        sides["anthropic"][0]["price"]["input_per_mtok"] = "10"
        sides["anthropic"][0]["price"]["output_per_mtok"] = "1"
        result = run(cfg=self.cfg(judge_candidates=sides))
        self.assertEqual(result["judging"]["judges"]["anthropic"], "j-an-cheap")

    def test_a_later_stage_no_longer_counts_the_qualification(self):
        tasks, checklist, outcome = self.samples()
        kwargs = dict(cfg=self.cfg(), tasks=tasks, checklist_samples=checklist,
                      outcome_samples=outcome)
        whole = run(**kwargs)
        after = (whole["by_stage"]["canary"]["openai"]["planning_bound"]
                 + whole["by_stage"]["full"]["openai"]["planning_bound"])
        caps = {"openai": after, "anthropic": D("50")}
        self.assertTrue(run(stage="canary", caps=caps, **kwargs)["ok"])
        self.assertFalse(run(stage="qualify", caps=caps, **kwargs)["ok"])

    def test_a_recorded_panel_must_be_two_providers(self):
        one = support.make_config().judges[0]
        with self.assertRaises(judges.PanelError):
            run(cfg=self.cfg(), qualification={"run_id": "r", "panel": [one, one]})


class TaskShapeTests(unittest.TestCase):
    def test_tasks_are_checked(self):
        with self.assertRaises(preflight.TaskError):
            preflight.normalise_tasks([support.task("t1"), support.task("t1")])
        with self.assertRaises(preflight.TaskError):
            preflight.normalise_task(support.task("t1", limit=2000))
        with self.assertRaises(preflight.TaskError):
            preflight.normalise_task(support.task("t1", split="secret"))
        item = support.task("t1")
        del item["max_output_tokens"]
        self.assertEqual(preflight.normalise_task(item)["max_output_tokens"], 4096)

    def test_canary_tasks_are_public_only(self):
        cfg = small_config()
        tasks = preflight.normalise_tasks([
            support.task("a-held", split="held-out"), support.task("z"), support.task("b")])
        self.assertEqual([t["id"] for t in preflight.canary_tasks(cfg, tasks)], ["b", "z"])
        named = small_config(canary={"public_tasks_per_model": 2, "repeats": 1,
                                     "task_ids": ["z", "a-held"]})
        with self.assertRaises(preflight.TaskError):
            preflight.canary_tasks(named, tasks)


if __name__ == "__main__":
    unittest.main()
