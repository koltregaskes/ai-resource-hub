# Day-to-Day Bench: scores and intervals

What `scores.py` and `bootstrap.py` put out, and which line of the method each field comes from. The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`; where this page and the method differ, the method wins.

Nothing here calls a model, reads a key or touches the network. `scores.py` is plain Python. `bootstrap.py` needs NumPy.

## Input

A list of slot records (dicts), one per model, task and repeat:

| Field | Value |
|---|---|
| `model`, `task_id` | Non-empty strings |
| `family` | 1 to 7 |
| `split` | `public` or `held-out` |
| `repeat` | 1, 2 or 3 |
| `outcome` | `answered`, `abstained`, `refused`, `malformed` or `execution_error` |
| `pass` | true, false, or None while judging is pending |
| `truncated` | true or false |
| `time_s` | Slot time in seconds, or None |
| `cost_usd` | Model charges for the slot, retries included |
| `checks` | Checklist slots: the check-level results, a list of `{"id", "by", "state"}` (below). Optional; a slot without it has no checks |
| `judged_checks`, `disputed_checks` | Optional and no longer used for any figure. If given, each must equal the count derived from `checks`, or the record is refused |
| `needed_judge_classification` | Optional, true or false (default false) |

The input is refused, with a message naming the slot, when: an outcome is unknown; a repeat is out of range; a task doesn't have exactly slots 1, 2 and 3 for a model; a slot is duplicated; a task changes family or split; `refused`, `malformed` or `execution_error` is marked as passed; models didn't run the same tasks; or any pass is pending. Pending slots are refused by default, because the method doesn't publish a run with pending judging. `allow_pending=True` gives a provisional look only: pending slots count as not passed and the result says `"provisional": true`. The outcome `judge_unresolved` is accepted only with a pending pass.

### Check-level results (`checks`)

One entry per check on the task, script checks and model-judged checks alike (method, "Checklist graders"):

| Key | Value |
|---|---|
| `id` | Non-empty string, unique within the slot, for example `c7` |
| `by` | `script` or `judge` |
| `state` | `pass`, `fail`, `disputed` (the two judges disagreed) or `unresolved` (the method's `judge_unresolved`) |

- Only a `judge` check can be `disputed` or `unresolved`. A script verdict is final.
- Checks are accepted only on a slot whose outcome is `answered`.
- **`pass` must equal the AND of the checks.** Every check `pass`: `pass` must be true. Any `fail` or `disputed`: `pass` must be false, because a disputed check counts as failed in the main score. Any `unresolved`: `pass` must be None (pending). A record that contradicts its own checks is refused with a message naming the slot and the check, for example `pass is True but check 'c7' is disputed`.
- Model-judged checks = entries with `by` `judge`. Disputed checks = entries with `state` `disputed`. `judged_checks`, `disputed_checks` and `dispute_rate` in the output are counted from this list and from nothing else.
- The old aggregate input fields `judged_checks` and `disputed_checks` are kept only as a cross-check. They can't stand in for the list: a count without a matching `checks` list is refused, since a count can't say whether a slot failed only on a disputed check or on an undisputed one as well.

## `scores.score_run(slots)`: one dict per model

All scores and rates are percentages, unrounded. Family keys are the strings "1" to "7".

| Field | Definition | Method section |
|---|---|---|
| `task_scores` | Passes ÷ 3 slots, per task (a fraction, 0 to 1) | Scores |
| `family_scores` | Mean of the family's task scores × 100 | Scores |
| `day_to_day_score` | Plain mean of the seven family scores; families count equally | Scores |
| `day_to_day_score_reason` | Why the score is None: a family has no tasks | (this module) |
| `pooled_pass_rate` | Passed slots ÷ all slots | Scores |
| `day_to_day_score_excluding_disputed` | The sensitivity figure shown beside the main score: the Day-to-Day score recomputed with disputed checks left out. Each slot's pass is recomputed as the AND of its checks that aren't disputed, then task, family and headline scores are recomputed as above. A slot that failed only on disputed checks passes; one with a failed or unresolved check as well stays not passed; slots without a disputed check are unchanged | Checklist graders ("Dispute rate") |
| `family_scores_excluding_disputed`, `task_scores_excluding_disputed`, `pooled_pass_rate_excluding_disputed` | The same recomputation at each level | Checklist graders |
| `dispute_sensitivity` | Counts of what the recomputation touched: `slots_with_disputed_checks`; `slots_passing_when_disputed_excluded` (failed only on disputed checks); `slots_still_failed_when_disputed_excluded`; `tasks_changed` (tasks whose score differs) | (this module) |
| `subsets.public`, `subsets.held-out` | The same figures, the sensitivity ones included, over that split's tasks only. A family with no tasks there makes that headline None, with the reason | Intervals ("Public-only and held-out-only scores") |
| `tasks`, `slots`, `family_task_counts` | Counts, so every rate has its denominator | |
| `provisional` | Always present. false for a final result; true when any slot is pending, which is only possible under `allow_pending=True` | Checklist graders, Run records |
| `pending_slots`, `pending_slot_ids` | The count of this model's pending slots and their ids, as `<task id>/<repeat>`, sorted. 0 and an empty list for a final result | Checklist graders |

`side_figures`, shown beside the score and never folded into it:

| Field | Definition |
|---|---|
| `wrong_answer_rate` | Families 2 and 3: slots with outcome `answered` and pass false ÷ all slots in those families |
| `abstention_rate` | Families 2 and 3: `abstained` slots ÷ all slots in those families |
| `execution_error_rate` | `execution_error` slots ÷ all slots |
| `consistency` | Tasks where all 3 slots have the same pass value ÷ all tasks |
| `total_cost_usd` | Sum of `cost_usd` (judge costs aren't in the input) |
| `cost_per_task_usd` | Total model charges ÷ number of tasks |
| `cost_per_successful_task_usd` | Total model charges ÷ (pooled pass rate × number of tasks). None, with `cost_per_successful_task_label` set to "no successful tasks", when nothing passed |
| `time_per_attempt_s` | Median `time_s` over slots whose outcome isn't `execution_error` |
| `truncation_rate` | Truncated slots ÷ all slots |
| `judged_checks`, `disputed_checks` | Model-judged checks and disputed checks, counted from the `checks` lists |
| `dispute_rate` | Disputed model-judged checks ÷ all model-judged checks; None when there are no model-judged checks. Read it with `day_to_day_score_excluding_disputed` |
| `judge_classification_rate` | Slots that needed judge classification ÷ all slots |

The side figures don't show skill by themselves. A model that abstains on every slot has a wrong-answer rate of 0 and consistency of 100%, and a Day-to-Day score of (20 + 25) ÷ 7 = 6.4%.

**Worked case (PR 132 review).** A perfect 180-slot run, except that one slot in a ten-task family has one disputed check. That slot's `pass` must be false. Task 2 ÷ 3, family (9 + 2/3) ÷ 10 = 96.67%, Day-to-Day score (600 + 96.67) ÷ 7 = 99.5238%, not 100%. If the disputed check was that slot's only failure, `day_to_day_score_excluding_disputed` is 100%. If an undisputed check failed too, it stays 99.5238%.

**Provisional results.** A pending slot counts as not passed, so a provisional score has the same numbers as a run where that slot was finalised as failed. The `provisional`, `pending_slots` and `pending_slot_ids` fields are what tell the two apart, in the scores dict, in the bootstrap report and in the display copy. A provisional result is a look at work in progress and is never published.

`format_for_display(result)` returns a rounded copy for people: one decimal place, half up; money keeps four. Flags, counts and ids pass through unchanged, so the provisional marking survives. `rank_models(results)` sorts by the unrounded Day-to-Day score. Exactly equal scores share a rank and the next rank is skipped (1, 1, 3); the order inside a tie is by model name and means nothing.

## `bootstrap.bootstrap_report(slots, pairs)`

| Field | Definition |
|---|---|
| `models.<model>.<set>.day_to_day_interval` | `lower` and `upper`: the 2.5th and 97.5th percentiles of the resampled equal-family score. `<set>` is `main`, `public` or `held-out` |
| `models.<model>.<set>.family_intervals` | The same for each family's score, from the same draws |
| `flag` | "not enough variation to estimate": every task score in the family is identical (family interval), or every family is like that (headline). Bounds are None. It never means certainty |
| `note`, `degenerate_families` | On a headline that still has width: the families that had no variation |
| `paired_differences` | For each pair asked for: model a minus model b on every resample, with its own percentile interval. Descriptive only |
| `seed`, `resamples`, `generator`, `draw_order`, `family_sizes` | The settings used |
| `provisional` | Always present. false for a final report; true when any slot of any model is pending (`allow_pending=True`). Repeated in each model's block and on each paired difference (true there if either model has a pending slot) |
| `pending_slots`, `pending_slot_ids` | Keyed by model: the count of pending slots and their ids, as `<task id>/<repeat>`. Each model's block repeats its count |

The bootstrap resamples the main task scores. It doesn't put an interval on `day_to_day_score_excluding_disputed`.

`intervals_overlap(a, b)` is true when max(lower bounds) ≤ min(upper bounds), on unrounded values; intervals that only touch count. It's a display label, not a test of difference and not evidence that two models are equal. It doesn't chain: A overlapping B and B overlapping C says nothing about A and C.

## How to reproduce an interval

1. `rng = numpy.random.default_rng(20261114)`, created once for the whole report.
2. Take the full task set first. Repeat 20,000 times: for families 1 to 7 in order, sort the family's task ids as plain strings, call `rng.integers(0, n, size=n)` with n the number of tasks in the family, and keep the indices.
3. Then do the same 20,000 times for the public tasks, then 20,000 times for the held-out tasks, on the same generator, with their own family sizes. A family with no tasks in a subset is skipped.
4. For each model, use those same indices. Each index picks a task score (passes ÷ 3), so a task's three slots stay together. Family score = mean of the picked task scores × 100; headline = mean of the seven family scores.
5. `numpy.percentile(values, [2.5, 97.5])`, default linear interpolation.

The same input gives byte-identical output. `tests/test_bootstrap.py` pins exact intervals for a fixed fixture to 10 decimal places (frozen with NumPy 2.5.4), and checks the draws against a literal loop of the steps above.

## Tests

From the repo root:

```
python -I -m unittest discover -s bench/daily-use/core/tests -p "test_s*.py" -v
python -I -m unittest discover -s bench/daily-use/core/tests -p "test_b*.py" -v
```

If NumPy isn't installed for that Python, set the environment variable `DTD_NUMPY_PATH` to a folder that holds it.
