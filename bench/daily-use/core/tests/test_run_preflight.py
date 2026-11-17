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
Full run: 6 slots, so three times the canary. It runs as 3 passes of 2
slots each (pass n is repeat n of both tasks), so one pass has the canary's
figures:
  pass, openai:    planning bound 0.5199702, expected 0.02538
  pass, anthropic: planning bound 0.3559158, expected 0.01098
One slot (one model request and one classification per judge):
  openai planning bound    = (0.12291 + 0.103164) x 1.15         = 0.2599851
  anthropic planning bound = 0.154746 x 1.15                     = 0.1779579

The gates (EXPECTED_MARGIN = 2). There are no qualification samples in this
fixture, so the qualification costs nothing.
  Whole-plan gate, 2 x the expected cost of everything still to run:
    before qualify or canary: canary + 3 passes = 4 x the pass figure
      openai    2 x (4 x 0.02538) = 2 x 0.10152 = 0.20304
      anthropic 2 x (4 x 0.01098) = 2 x 0.04392 = 0.08784
    before pass 1: 3 passes
      openai    2 x (3 x 0.02538) = 2 x 0.07614 = 0.15228
      anthropic 2 x (3 x 0.01098) = 2 x 0.03294 = 0.06588
  The planning-bound gate of what starts next: qualify 0, canary and pass 1
  as above.
  qualify + canary + pass 1 together (the `preflight` command):
      openai    0 + 0.5199702 + 0.5199702 = 1.0399404
      anthropic 0 + 0.3559158 + 0.3559158 = 0.7118316
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

    def test_the_expected_figure_feeds_the_whole_plan_gate_and_no_bound(self):
        plain = run(tasks=self.TASKS, real_sizes=True)
        self.assertTrue(plain["ok"])
        # Make the softer estimate absurd: only the expected figure moves.
        with mock.patch.object(preflight, "expected_input_tokens", lambda text: 10 ** 9):
            huge = run(tasks=self.TASKS, real_sizes=True)
        # The planning-bound gate is untouched; the whole-plan gate, the one
        # place the expected figure is used, now refuses.
        self.assertFalse(huge["ok"])
        self.assertEqual(len(huge["refusals"]), 2)
        for provider in ("openai", "anthropic"):
            self.assertEqual(huge["start_gate"][provider], plain["start_gate"][provider])
            self.assertTrue(huge["start_gate"][provider]["ok"])
            self.assertFalse(huge["whole_plan_gate"][provider]["ok"])
            self.assertEqual(huge["by_pass"][1][provider]["planning_bound"],
                             plain["by_pass"][1][provider]["planning_bound"])
        self.assertTrue(all("whole-plan gate" in reason for reason in huge["refusals"]))
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
        self.assertIn("never used for a reservation or a planning-bound gate", text)
        self.assertIn("It feeds the whole-plan gate only", text)


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
    def test_whole_plan_gate_refuses_when_twice_the_expected_cost_is_above_a_cap(self):
        self.assertEqual(preflight.EXPECTED_MARGIN, 2)
        # Before the qualification, which costs nothing in this fixture, so the
        # gate is the only test: 2 x 0.10152 = 0.20304 and 2 x 0.04392 = 0.08784.
        ok = run(stage="qualify", caps={"openai": D("0.20304"), "anthropic": D("0.08784")})
        self.assertTrue(ok["ok"])
        preflight.enforce(ok)
        self.assertEqual(ok["whole_plan_gate"]["openai"], {
            "expected_still_to_run": D("0.10152"), "gate_figure": D("0.20304"),
            "remaining_cap": D("0.20304"), "ok": True})
        self.assertEqual(ok["whole_plan_gate"]["anthropic"], {
            "expected_still_to_run": D("0.04392"), "gate_figure": D("0.08784"),
            "remaining_cap": D("0.08784"), "ok": True})
        refused = run(stage="qualify", caps={"openai": D("0.20303"), "anthropic": D("50")})
        self.assertFalse(refused["ok"])
        self.assertEqual(len(refused["refusals"]), 1)
        self.assertFalse(refused["whole_plan_gate"]["openai"]["ok"])
        with self.assertRaises(preflight.PreflightRefused):
            preflight.enforce(refused)
        refused = run(stage="qualify", caps={"openai": D("0.2"), "anthropic": D("50")})
        self.assertEqual(refused["refusals"], [
            "openai: whole-plan gate: 2 x the expected cost of everything still to run "
            "(0.1015 USD) is 0.2030 USD, above the remaining cap 0.2000 USD. Shorten the "
            "model list in the run config; do not lower a limit."])
        refused = run(stage="qualify", caps={"openai": D("50"), "anthropic": D("0.08783")})
        self.assertEqual(len(refused["refusals"]), 1)
        self.assertIn("anthropic: whole-plan gate", refused["refusals"][0])

    def test_the_whole_plan_gate_counts_only_what_is_still_to_run(self):
        # Before the canary: the canary and 3 passes, as before the (free) qualification.
        canary = run(stage="canary")["whole_plan_gate"]
        self.assertEqual(canary["openai"]["gate_figure"], D("0.20304"))
        self.assertEqual(canary["anthropic"]["gate_figure"], D("0.08784"))
        # Before pass 1: the 3 passes only. 2 x 0.07614 and 2 x 0.03294.
        full = run(stage="full")["whole_plan_gate"]
        self.assertEqual(full["openai"]["expected_still_to_run"], D("0.07614"))
        self.assertEqual(full["openai"]["gate_figure"], D("0.15228"))
        self.assertEqual(full["anthropic"]["gate_figure"], D("0.06588"))

    def test_what_is_about_to_start_must_fit_at_its_planning_bound(self):
        exact = {"openai": D("0.5199702"), "anthropic": D("0.3559158")}
        for stage, label in (("canary", "canary"), ("full", "pass 1")):
            ok = run(stage=stage, caps=exact)
            self.assertTrue(ok["ok"], stage)
            self.assertEqual(ok["start_gate"]["label"], label)
            self.assertEqual(ok["start_gate"]["openai"], {
                "planning_bound": D("0.5199702"), "remaining_cap": D("0.5199702"), "ok": True})
            refused = run(stage=stage, caps=dict(exact, openai=D("0.5199701")))
            self.assertFalse(refused["ok"], stage)
            self.assertEqual(len(refused["refusals"]), 1)
            refused = run(stage=stage, caps=dict(exact, openai=D("0.5")))
            self.assertEqual(refused["refusals"], [
                "openai: the planning bound of %s, 0.5200 USD, is above the remaining cap "
                "0.5000 USD, so %s does not start." % (label, label)])
            refused = run(stage=stage, caps=dict(exact, anthropic=D("0.3559157")))
            self.assertEqual(len(refused["refusals"]), 1)
            self.assertIn("anthropic: the planning bound of " + label, refused["refusals"][0])
        # The qualification is free here, so nothing about it can refuse.
        self.assertEqual(run(stage="qualify")["start_gate"]["openai"]["planning_bound"], D(0))

    def test_a_whole_plan_planning_bound_above_a_cap_is_not_a_refusal(self):
        # The full run's planning bound is 1.5599106 on openai; the cap fits one
        # pass (0.5199702) and no more. Pass 1 may start.
        lines = []
        result = run(stage="full", caps={"openai": D("0.5199702"), "anthropic": D("50")},
                     out=lines.append)
        self.assertTrue(result["ok"])
        self.assertEqual(result["planning_bound_above_cap"], ["openai"])
        text = "\n".join(lines)
        self.assertIn(
            "openai: the planning bound of the plan still to run, 1.5599 USD, is above the "
            "remaining cap 0.5200 USD. That alone is not a refusal: the full run is gated "
            "one pass at a time", text)
        self.assertIn("Result: pass 1 may start", text)
        self.assertNotIn("REFUSED", text)
        # The old rule refused the whole plan (2.0798808) one step above the cap.
        old = run(stage="qualify", caps={"openai": D("2.0798807"), "anthropic": D("50")})
        self.assertTrue(old["ok"])
        self.assertEqual(old["planning_bound_above_cap"], ["openai"])
        self.assertEqual(run(stage="qualify")["planning_bound_above_cap"], [])

    def test_the_command_needs_qualify_canary_and_pass_one_to_fit_together(self):
        # 0 + 0.5199702 + 0.5199702 = 1.0399404 and 0 + 0.3559158 x 2 = 0.7118316.
        caps = {"openai": D("1.0399404"), "anthropic": D("0.7118316")}
        ok = run(stage="qualify", caps=caps, together=True)
        self.assertTrue(ok["ok"])
        self.assertEqual(ok["together_gate"]["label"], "qualify + canary + pass 1")
        self.assertEqual(ok["together_gate"]["openai"]["planning_bound"], D("1.0399404"))
        self.assertEqual(ok["together_gate"]["anthropic"]["planning_bound"], D("0.7118316"))
        short = {"openai": D("1.0399403"), "anthropic": D("50")}
        refused = run(stage="qualify", caps=short, together=True)
        self.assertFalse(refused["ok"])
        self.assertEqual(refused["refusals"], [
            "openai: qualify + canary + pass 1 at their planning bounds come to 1.0399 USD "
            "together, above the remaining cap 1.0399 USD."])
        # The start of the qualification itself is tested on its own bound only.
        self.assertTrue(run(stage="qualify", caps=short)["ok"])
        # Before the canary the same test covers the canary and pass 1.
        later = run(stage="canary", caps=short, together=True)
        self.assertEqual(later["together_gate"]["label"], "canary + pass 1")
        self.assertEqual(len(later["refusals"]), 1)
        self.assertTrue(run(stage="canary", caps=caps, together=True)["ok"])

    def test_absolute_bound_is_information_only(self):
        result = run(caps={"openai": D("2.10"), "anthropic": D("1.45")})
        self.assertTrue(result["ok"])
        self.assertGreater(result["whole_plan"]["openai"]["absolute_bound"], D("2.10"))

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
                     "planning bound by stage and by pass", "pass 1", "pass 3",
                     "full, all passes", "expected cost by stage and by pass",
                     "whole-plan gate: 2 x the expected cost of stage qualify",
                     "openai     2 x 0.1015 = 0.2030 against 50.0000: ok",
                     "planning-bound gate for qualify, the next to start",
                     "qualify + canary + pass 1 at their planning bounds together",
                     "openai     1.0399 against 50.0000: ok",
                     "Result: qualify may start"):
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
        # The whole-plan gate before the canary no longer counts the
        # qualification: it is 2 x the expected cost of the canary and the
        # full run. With a remaining cap of exactly that, the gate holds
        # before the canary and fails before the qualification.
        after = 2 * (whole["by_stage"]["canary"]["openai"]["expected"]
                     + whole["by_stage"]["full"]["openai"]["expected"])
        self.assertGreater(whole["by_stage"]["qualify"]["openai"]["expected"], 0)
        caps = {"openai": after, "anthropic": D("50")}
        canary = run(stage="canary", caps=caps, **kwargs)["whole_plan_gate"]["openai"]
        self.assertEqual((canary["gate_figure"], canary["ok"]), (after, True))
        qualify = run(stage="qualify", caps=caps, **kwargs)["whole_plan_gate"]["openai"]
        self.assertEqual(qualify["gate_figure"], after + 2 * whole["by_stage"]["qualify"][
            "openai"]["expected"])
        self.assertFalse(qualify["ok"])

    def test_a_recorded_panel_must_be_two_providers(self):
        one = support.make_config().judges[0]
        with self.assertRaises(judges.PanelError):
            run(cfg=self.cfg(), qualification={"run_id": "r", "panel": [one, one]})


class PassFigureTests(unittest.TestCase):
    def test_each_pass_has_the_figures_of_one_repeat_of_every_task(self):
        result = run()
        self.assertEqual(result["passes"], 3)
        self.assertEqual(sorted(result["by_pass"]), [1, 2, 3])
        for number in (1, 2, 3):
            self.assertEqual(result["by_pass"][number]["openai"], {
                "expected": D("0.02538"), "planning_bound": D("0.5199702"),
                "absolute_bound": D("1.150116")})
            self.assertEqual(result["by_pass"][number]["anthropic"], {
                "expected": D("0.01098"), "planning_bound": D("0.3559158"),
                "absolute_bound": D("0.618984")})

    def test_the_number_of_passes_is_the_configured_repeats(self):
        self.assertEqual(preflight.REPEATS, 3)
        with mock.patch.object(preflight, "REPEATS", 2):
            result = run()
        self.assertEqual(sorted(result["by_pass"]), [1, 2])
        # 2 passes: 2 x 0.5199702.
        self.assertEqual(result["by_stage"]["full"]["openai"]["planning_bound"], D("1.0399404"))
        self.assertEqual(result["requests"]["full"], {"model": 4, "outcome_classification": 8})

    def test_the_planning_bound_of_one_slot(self):
        slots = run()["slot_planning_bound"]
        self.assertEqual(slots, {"m-oa": {
            "t1": {"openai": D("0.2599851"), "anthropic": D("0.1779579")},
            "t2": {"openai": D("0.2599851"), "anthropic": D("0.1779579")}}})

    def test_the_slots_of_a_pass_add_up_to_the_pass(self):
        tasks = [support.task("t1", family=4, checks=3), support.task("t2", limit=8192),
                 support.task("h1", family=4, split="held-out", checks=2)]
        result = run(tasks=tasks, cfg=support.make_config(), real_sizes=True)
        for provider in ("openai", "anthropic"):
            total = sum((cell[provider] for by_task in result["slot_planning_bound"].values()
                         for cell in by_task.values()), D(0))
            self.assertEqual(total, result["by_pass"][1][provider]["planning_bound"])
            self.assertEqual(result["by_pass"][1][provider], result["by_pass"][3][provider])
            self.assertEqual(result["by_stage"]["full"][provider]["planning_bound"],
                             3 * result["by_pass"][1][provider]["planning_bound"])


class PassGateTests(unittest.TestCase):
    """`pass_gate`: the planning bound of the slots still to run in a pass
    against what is left of each cap. Both slots of a pass: 0.5199702 on
    openai and 0.3559158 on anthropic; one slot: 0.2599851 and 0.1779579."""

    SLOTS = [{"model_id": "m-oa", "task_id": "t1"}, {"model_id": "m-oa", "task_id": "t2"}]

    def gate(self, remaining, slots=None, number=2, **kwargs):
        return preflight.pass_gate(run(), self.SLOTS if slots is None else slots, remaining,
                                   number, 3, **kwargs)

    def test_a_pass_starts_when_its_bound_is_at_or_below_every_remaining_cap(self):
        gate = self.gate({"openai": D("0.5199702"), "anthropic": D("0.3559158")})
        self.assertTrue(gate["ok"])
        self.assertIsNone(gate["reason"])
        self.assertEqual(gate["planning_bound"],
                         {"openai": D("0.5199702"), "anthropic": D("0.3559158")})
        self.assertEqual((gate["pass"], gate["passes"], gate["slots"]), (2, 3, 2))
        self.assertEqual(gate["lines"][0],
                         "  pass 2 of 3, 2 slots to run: planning bound anthropic 0.3559 USD "
                         "against a remaining cap of 0.3559 USD; openai 0.5200 USD against a "
                         "remaining cap of 0.5200 USD")
        # An admitted pass is told plainly what the gate does not promise.
        self.assertEqual(len(gate["lines"]), 2)
        note = gate["lines"][1]
        self.assertTrue(note.startswith("  pass 2 of 3 is admitted: it fits at one request "
                                        "per slot at its output limit plus 15% for retries."))
        self.assertIn("likely to finish, not certain to", note)
        self.assertIn("keeps its full reservation until reconciled", note)
        self.assertIn("interrupted or incomplete, unscored, inside the cap", note)
        self.assertIn("The cap is never exceeded", note)

    def test_nothing_printed_or_documented_promises_that_an_admitted_pass_finishes(self):
        texts = {}
        for name in ("RUNNER.md", "preflight.py", "runner.py", "cli.py", "records.py",
                     "ledger.py"):
            with open(os.path.join(support.CORE, name), encoding="utf-8") as stream:
                texts[name] = stream.read()
        for name, text in texts.items():
            lowered = text.lower()
            for phrase in ("guarantee", "will finish", "can finish", "sure to finish",
                           "always finishes", "is certain to finish"):
                self.assertNotIn(phrase, lowered, "%s says %r" % (name, phrase))
        for name in ("RUNNER.md", "preflight.py"):
            self.assertIn("likely, not certain", texts[name])
        self.assertIn("keeps its full reservation until it is reconciled", texts["RUNNER.md"])

    def test_a_pass_is_refused_when_one_provider_is_short(self):
        gate = self.gate({"openai": D("0.5199701"), "anthropic": D("50")})
        self.assertFalse(gate["ok"])
        self.assertEqual(gate["provider"], "openai")
        gate = self.gate({"openai": D("0.4"), "anthropic": D("50")}, number=3)
        self.assertEqual(gate["reason"],
                         "pass 3 of 3 not started: the openai planning bound of this pass, "
                         "0.5200 USD, is above the remaining cap 0.4000 USD")
        self.assertEqual(gate["lines"][-1],
                         "  INCOMPLETE: " + gate["reason"]
                         + ". Finished passes are kept; the run is not scored.")
        gate = self.gate({"openai": D("50"), "anthropic": D("0.3559157")})
        self.assertEqual((gate["ok"], gate["provider"]), (False, "anthropic"))
        self.assertIn("pass 2 of 3 not started: the anthropic planning bound", gate["reason"])

    def test_a_resumed_pass_is_tested_on_the_slots_still_to_run(self):
        # One slot left: 0.2599851 on openai, 0.1779579 on anthropic.
        left = self.SLOTS[1:]
        gate = self.gate({"openai": D("0.2599851"), "anthropic": D("0.1779579")}, slots=left)
        self.assertTrue(gate["ok"])
        self.assertEqual(gate["planning_bound"],
                         {"openai": D("0.2599851"), "anthropic": D("0.1779579")})
        self.assertFalse(self.gate({"openai": D("0.2599850"), "anthropic": D("50")},
                                   slots=left)["ok"])

    def test_a_slot_to_finish_on_resume_is_counted_at_its_judging_alone(self):
        # Of the 0.2599851 of one slot on openai, 0.1413465 is the model
        # request and 0.1186386 is the openai judge. On anthropic there is
        # only a judge, so the whole 0.1779579 is judging.
        judging = run()["slot_judging_bound"]["m-oa"]["t1"]
        self.assertEqual(judging, {"openai": D("0.1186386"), "anthropic": D("0.1779579")})
        finish = [dict(self.SLOTS[0], judging_only=True), self.SLOTS[1]]
        exact = {"openai": D("0.1186386") + D("0.2599851"), "anthropic": D("0.3559158")}
        gate = self.gate(exact, slots=finish)
        self.assertTrue(gate["ok"])
        self.assertEqual(gate["planning_bound"], exact)
        self.assertEqual((gate["slots"], gate["finishing"]), (2, 1))
        self.assertTrue(gate["lines"][0].startswith(
            "  pass 2 of 3, 2 slots to run (1 of them only to grade and judge: the paid "
            "answer is on record and is not asked for again): planning bound "))
        # The pending work is counted: a hair short on either side refuses.
        for provider in exact:
            short = dict(exact, **{provider: exact[provider] - D("0.0000001")})
            refused = self.gate(short, slots=finish)
            self.assertEqual((refused["ok"], refused["provider"]), (False, provider))
        self.assertEqual(self.gate(exact)["finishing"], 0)

    def test_what_is_left_of_max_usd_is_tested_too(self):
        caps = {"openai": D("50"), "anthropic": D("50")}
        # Both providers together: 0.5199702 + 0.3559158 = 0.875886.
        self.assertTrue(self.gate(caps, max_usd_left=D("0.875886"))["ok"])
        gate = self.gate(caps, max_usd_left=D("0.87"))
        self.assertFalse(gate["ok"])
        self.assertIsNone(gate["provider"])
        self.assertIn("0.8759 USD, is above what is left of --max-usd, 0.8700 USD",
                      gate["reason"])


class OverrunOnFileTests(unittest.TestCase):
    REQUEST = "2026-11-14T183000Z-1a2b3c4d/m-oa/t1/1/1"

    def test_an_overrun_on_file_refuses_every_stage_until_it_is_acknowledged(self):
        on_file = {"openai": [self.REQUEST]}
        for stage in preflight.STAGES:
            refused = run(stage=stage, overruns=on_file)
            self.assertFalse(refused["ok"], stage)
            self.assertEqual(refused["refusals"], [
                "openai: request %s was charged above its reservation. No stage or pass "
                "starts until the run config names that request id in acknowledged_overruns."
                % self.REQUEST])
            self.assertEqual(refused["overruns"]["unacknowledged"], on_file)
            with self.assertRaises(preflight.PreflightRefused) as caught:
                preflight.enforce(refused)
            self.assertIn(self.REQUEST, str(caught.exception))
            # A resumed run is refused the same way.
            self.assertFalse(run(stage=stage, overruns=on_file, resuming=True)["ok"])
            acknowledged = small_config(acknowledged_overruns=[self.REQUEST])
            passed = run(stage=stage, overruns=on_file, cfg=acknowledged)
            self.assertTrue(passed["ok"], stage)
            self.assertEqual(passed["overruns"],
                             {"on_file": on_file, "unacknowledged": {}})

    def test_every_overrun_must_be_named(self):
        other = self.REQUEST[:-1] + "2"
        on_file = {"openai": [self.REQUEST], "anthropic": [other]}
        cfg = small_config(acknowledged_overruns=[self.REQUEST])
        refused = run(overruns=on_file, cfg=cfg)
        self.assertEqual(len(refused["refusals"]), 1)
        self.assertIn("anthropic: request " + other, refused["refusals"][0])
        self.assertTrue(run(overruns=on_file, cfg=small_config(
            acknowledged_overruns=[other, self.REQUEST]))["ok"])
        # Naming a request that is not on file changes nothing.
        self.assertTrue(run(cfg=cfg)["ok"])

    def test_the_output_names_the_overrun(self):
        lines = []
        run(overruns={"openai": [self.REQUEST]}, out=lines.append)
        text = "\n".join(lines)
        self.assertIn("overrun on file, openai: %s (not acknowledged)" % self.REQUEST, text)
        self.assertIn("REFUSED: openai: request " + self.REQUEST, text)
        lines = []
        run(overruns={"openai": [self.REQUEST]}, out=lines.append,
            cfg=small_config(acknowledged_overruns=[self.REQUEST]))
        self.assertIn("overrun on file, openai: %s (acknowledged in the run config)"
                      % self.REQUEST, "\n".join(lines))

    def test_resuming_leaves_the_pass_to_the_pass_gate(self):
        # With no cap left at all, a resumed run is not refused here: the pass
        # gate in the runner decides, on the slots still to run.
        lines = []
        result = run(stage="full", caps={"openai": D(0), "anthropic": D(0)}, resuming=True,
                     out=lines.append)
        self.assertTrue(result["ok"])
        self.assertIn("The pass gate decides whether the pass starts", "\n".join(lines))
        self.assertFalse(run(stage="full", caps={"openai": D(0), "anthropic": D(0)})["ok"])


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
