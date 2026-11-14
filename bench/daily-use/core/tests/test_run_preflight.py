"""Pre-flight figures, worked by hand on a small fixture.

The fixture: one model and two judges, two public tasks with no judged
checks, no qualification samples, and a tokeniser that counts every text as
10 tokens so that every figure below can be checked with a calculator.

Prices per million tokens: model m-oa 3 in / 30 out (openai);
judge j-oa 6 in / 12 out (openai), judge j-an 9 in / 18 out (anthropic).
Task output limit 4096; judge output limit 1000.
Planning sizes: model output 300 tokens, judge output 100 tokens.

One request at its limit:
  model:  (10 x 3 + 4096 x 30) / 1e6 = 122910 / 1e6            = 0.12291
  j-oa:   ((10 + 4096) x 6 + 1000 x 12) / 1e6 = 36636 / 1e6    = 0.036636
  j-an:   ((10 + 4096) x 9 + 1000 x 18) / 1e6 = 54954 / 1e6    = 0.054954
One request at the planning size:
  model:  (10 x 3 + 300 x 30) / 1e6                            = 0.00903
  j-oa:   ((10 + 300) x 6 + 100 x 12) / 1e6                    = 0.00306
  j-an:   ((10 + 300) x 9 + 100 x 18) / 1e6                    = 0.00459

Canary: 1 model x 2 tasks x 1 repeat = 2 slots; each slot is 1 model request
and 1 outcome classification per judge.
  openai once  = 2 x 0.12291 + 2 x 0.036636 = 0.319092
  openai planning bound = 0.319092 x 1.15                      = 0.3669558
  openai absolute bound = 2 x 0.12291 x 3 + 2 x 0.036636 x 2   = 0.884004
  openai expected       = 2 x 0.00903 + 2 x 0.00306            = 0.02418
  anthropic once = 2 x 0.054954 = 0.109908
  anthropic planning bound = 0.109908 x 1.15                   = 0.1263942
  anthropic absolute bound = 0.109908 x 2                      = 0.219816
  anthropic expected       = 2 x 0.00459                       = 0.00918
Full run: 6 slots, so three times the canary.
"""

import os
import sys
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import judges  # noqa: E402
import ledger  # noqa: E402
import preflight  # noqa: E402
import test_run_support as support  # noqa: E402

D = Decimal
TEN = lambda text: 10  # noqa: E731


def small_config(**over):
    return support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")], **over)


TASKS = [support.task("t1"), support.task("t2")]
CAPS = {"openai": D("50"), "anthropic": D("50")}


def run(stage="canary", caps=None, tasks=None, cfg=None, **kwargs):
    kwargs.setdefault("checklist_samples", [])
    kwargs.setdefault("outcome_samples", [])
    kwargs.setdefault("tokeniser", TEN)
    return preflight.preflight(cfg or small_config(), tasks or TASKS, caps or CAPS,
                               stage=stage, out=None, **kwargs)


class HandComputedTests(unittest.TestCase):
    def test_canary_figures(self):
        stage = run()["by_stage"]["canary"]
        self.assertEqual(stage["openai"], {"expected": D("0.02418"),
                                           "planning_bound": D("0.3669558"),
                                           "absolute_bound": D("0.884004")})
        self.assertEqual(stage["anthropic"], {"expected": D("0.00918"),
                                              "planning_bound": D("0.1263942"),
                                              "absolute_bound": D("0.219816")})

    def test_full_run_figures_are_three_times_the_canary(self):
        stage = run()["by_stage"]["full"]
        self.assertEqual(stage["openai"], {"expected": D("0.07254"),
                                           "planning_bound": D("1.1008674"),
                                           "absolute_bound": D("2.652012")})
        self.assertEqual(stage["anthropic"], {"expected": D("0.02754"),
                                              "planning_bound": D("0.3791826"),
                                              "absolute_bound": D("0.659448")})

    def test_whole_plan_totals(self):
        result = run()
        whole = result["whole_plan"]
        self.assertEqual(whole["openai"]["planning_bound"], D("1.4678232"))
        self.assertEqual(whole["anthropic"]["planning_bound"], D("0.5055768"))
        self.assertEqual(whole["total"]["planning_bound"], D("1.9734"))
        self.assertEqual(whole["total"]["expected"], D("0.13344"))
        self.assertEqual(whole["total"]["absolute_bound"], D("4.41528"))
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

    def test_without_a_tokeniser_input_is_a_third_of_the_characters(self):
        tasks = [support.task("t1", prompt="x" * 300), support.task("t2", prompt="y" * 600)]
        result = run(tasks=tasks, tokeniser=None)
        # Model requests only, canary: (100 x 3 + 4096 x 30) + (200 x 3 + 4096 x 30)
        # = 123180 + 123480 = 246660 per million = 0.24666, before the judge calls.
        judge_once = D(0)
        for item in tasks:
            prefix = ledger.count_input_tokens(judges.build_outcome_prompt(item["prompt"], ""))
            answer = 5462          # ceil(4096 x 4 / 3): the answer as judge input
            judge_once += (D(prefix + answer) * 6 + D(1000) * 12) / D(1000000)
        expected = (D("0.24666") + judge_once) * D("1.15")
        self.assertEqual(result["by_stage"]["canary"]["openai"]["planning_bound"], expected)


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
        # 24 calls per judge; j-oa at its limit: (10 x 6 + 1000 x 12) / 1e6 = 0.01206 each.
        self.assertEqual(result["by_stage"]["qualify"]["openai"]["planning_bound"],
                         D("0.01206") * 24 * D("1.15"))
        self.assertEqual(result["by_stage"]["qualify"]["openai"]["absolute_bound"],
                         D("0.01206") * 24 * 2)

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
        ok = run(caps={"openai": D("1.4678232"), "anthropic": D("50")})
        self.assertTrue(ok["ok"])
        preflight.enforce(ok)
        refused = run(caps={"openai": D("1.4678231"), "anthropic": D("50")})
        self.assertFalse(refused["ok"])
        self.assertIn("openai", refused["refusals"][0])
        self.assertIn("Shorten the model list", refused["refusals"][0])
        with self.assertRaises(preflight.PreflightRefused):
            preflight.enforce(refused)
        refused = run(caps={"openai": D("50"), "anthropic": D("0.50")})
        self.assertIn("anthropic", refused["refusals"][0])

    def test_absolute_bound_is_information_only(self):
        result = run(caps={"openai": D("1.50"), "anthropic": D("0.51")})
        self.assertTrue(result["ok"])
        self.assertGreater(result["whole_plan"]["openai"]["absolute_bound"], D("1.50"))

    def test_a_later_stage_is_tested_against_what_is_still_to_run(self):
        caps = {"openai": D("1.1008674"), "anthropic": D("50")}
        self.assertTrue(run(stage="full", caps=caps)["ok"])
        self.assertFalse(run(stage="qualify", caps={"openai": D("1.10"), "anthropic": D("50")})["ok"])
        self.assertFalse(run(stage="canary", caps=caps)["ok"])

    def test_max_usd_is_tested_against_this_stage(self):
        # Canary planning bound over both providers: 0.3669558 + 0.1263942 = 0.49335
        self.assertTrue(run(max_usd="0.49335")["ok"])
        refused = run(max_usd="0.49")
        self.assertFalse(refused["ok"])
        self.assertIn("--max-usd", refused["refusals"][0])

    def test_output_is_printed_with_all_three_figures(self):
        lines = []
        preflight.preflight(small_config(), TASKS, CAPS, checklist_samples=[],
                            outcome_samples=[], tokeniser=TEN, out=lines.append)
        text = "\n".join(lines)
        for word in ("expected", "planning bound", "absolute bound", "remaining cap",
                     "tasks with a judged check: 0", "1.4678", "0.5056", "4.4153",
                     "planning bound by stage", "Result: within the remaining caps"):
            self.assertIn(word, text)

    def test_the_three_figures_are_printed_even_when_the_run_is_refused(self):
        lines = []
        result = preflight.preflight(small_config(), TASKS, {"openai": D("0.01"),
                                                             "anthropic": D("50")},
                                     checklist_samples=[], outcome_samples=[], tokeniser=TEN,
                                     out=lines.append)
        self.assertFalse(result["ok"])
        text = "\n".join(lines)
        for word in ("expected", "planning bound", "absolute bound", "0.1334", "1.4678",
                     "4.4153", "REFUSED: openai"):
            self.assertIn(word, text)

    def test_stages_run_qualify_then_canary_then_full(self):
        self.assertEqual(preflight.STAGES, ("qualify", "canary", "full"))
        lines = []
        preflight.preflight(small_config(), TASKS, CAPS, checklist_samples=[],
                            outcome_samples=[], tokeniser=TEN, out=lines.append)
        order = [line.split()[2].rstrip(":") for line in lines
                 if line.startswith("  requests in ")]
        self.assertEqual(order, ["qualify", "canary", "full"])

    def test_larger_task_limit_costs_more(self):
        big = [support.task("t1", limit=8192), support.task("t2")]
        self.assertGreater(run(tasks=big)["whole_plan"]["openai"]["planning_bound"],
                           run()["whole_plan"]["openai"]["planning_bound"])



class JudgeCandidateTests(unittest.TestCase):
    """Five judge candidates (see `support.candidates_dict`), all with a
    1000-token output limit. One judge request at its limit, on the fixture
    above (10 input tokens, a 4096-token answer):

      qualification call:  (10 x in + 1000 x out) / 1e6
        j-oa-cheap 1/2   = 0.00201      j-an-cheap 2/4 = 0.00402
        j-oa       6/12  = 0.01206      j-an       9/18 = 0.01809
        j-oa-dear  20/40 = 0.0402
      outcome classification of one slot:  ((10 + 4096) x in + 1000 x out) / 1e6
        j-oa-cheap = 0.006106   j-oa = 0.036636   j-oa-dear = 0.12212
        j-an-cheap = 0.012212   j-an = 0.054954
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
        openai_once = (D("0.00201") + D("0.01206") + D("0.0402")) * 24
        anthropic_once = (D("0.00402") + D("0.01809")) * 24
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
                         (2 * D("0.12291") + 2 * D("0.12212")) * D("1.15"))
        self.assertEqual(canary["anthropic"]["planning_bound"], 2 * D("0.054954") * D("1.15"))
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
                         (2 * D("0.12291") + 2 * D("0.006106")) * D("1.15"))
        self.assertEqual(canary["anthropic"]["planning_bound"], 2 * D("0.012212") * D("1.15"))
        worst = run(cfg=self.cfg())
        for provider in ("openai", "anthropic"):
            self.assertLess(result["whole_plan"][provider]["planning_bound"],
                            worst["whole_plan"][provider]["planning_bound"])

    def test_the_output_says_which_case_applied(self):
        def text(**kwargs):
            lines = []
            preflight.preflight(self.cfg(), TASKS, CAPS, checklist_samples=[],
                                outcome_samples=[], tokeniser=TEN, out=lines.append, **kwargs)
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
        # A cheap price with a far larger output limit can still cost the most.
        sides = support.candidates_dict()
        sides["anthropic"][0]["max_output_tokens"] = 8192
        sides["anthropic"][0]["price"]["output_per_mtok"] = "17"
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
