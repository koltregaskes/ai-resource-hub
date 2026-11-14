"""Scores for the Day-to-Day Bench.

Pure Python, no third-party imports. Every definition here follows
docs/DAY-TO-DAY-BENCH-METHOD.md, sections "Attempts, outcomes and passes",
"Scores" and "Comparing models". SCORES.md beside this file maps each output
field to its definition.

Input is a list of slot records (plain dicts). A slot is one model, one task
and one repeat (1 to 3). Nothing here reads files, keys or the network.

Conventions:
- Scores and rates are percentages (0 to 100), unrounded.
- Money is in US dollars, time in seconds.
- Family keys in the output are the strings "1" to "7", so the result goes
  through JSON unchanged.
"""

import math
import statistics

FAMILIES = (1, 2, 3, 4, 5, 6, 7)
SPLITS = ("public", "held-out")
REPEATS = (1, 2, 3)
SLOTS_PER_TASK = 3
OUTCOMES = ("answered", "abstained", "refused", "malformed", "execution_error")
# The method gives a slot whose outcome classification is unresolved the
# outcome "judge_unresolved" and a pending pass. It is accepted only together
# with pass None, so it can never be scored by accident.
PENDING_OUTCOME = "judge_unresolved"
ABSTAIN_FAMILIES = (2, 3)
NO_SUCCESSFUL_TASKS = "no successful tasks"

REQUIRED_FIELDS = (
    "model",
    "task_id",
    "family",
    "split",
    "repeat",
    "outcome",
    "pass",
    "truncated",
    "time_s",
    "cost_usd",
)


class SlotValidationError(ValueError):
    """A slot record, or the set of records, breaks the input contract."""


class PendingSlotsError(SlotValidationError):
    """The run has slots whose pass is still pending."""


def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _is_number(value):
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
    )


def _where(index, slot):
    return "slot %d (model %r, task %r, repeat %r)" % (
        index,
        slot.get("model"),
        slot.get("task_id"),
        slot.get("repeat"),
    )


def _check_slot(index, slot):
    if not isinstance(slot, dict):
        raise SlotValidationError("slot %d is not a dict" % index)
    missing = [name for name in REQUIRED_FIELDS if name not in slot]
    if missing:
        raise SlotValidationError(
            "%s: missing field(s) %s" % (_where(index, slot), ", ".join(missing))
        )
    where = _where(index, slot)
    for name in ("model", "task_id"):
        if not isinstance(slot[name], str) or not slot[name]:
            raise SlotValidationError("%s: %s must be a non-empty string" % (where, name))
    if not _is_int(slot["family"]) or slot["family"] not in FAMILIES:
        raise SlotValidationError(
            "%s: family must be an integer 1 to 7, got %r" % (where, slot["family"])
        )
    if slot["split"] not in SPLITS:
        raise SlotValidationError(
            "%s: split must be 'public' or 'held-out', got %r" % (where, slot["split"])
        )
    if not _is_int(slot["repeat"]) or slot["repeat"] not in REPEATS:
        raise SlotValidationError(
            "%s: repeat out of range, must be 1, 2 or 3, got %r" % (where, slot["repeat"])
        )
    outcome = slot["outcome"]
    passed = slot["pass"]
    if outcome not in OUTCOMES and outcome != PENDING_OUTCOME:
        raise SlotValidationError("%s: unknown outcome %r" % (where, outcome))
    if passed is not None and not isinstance(passed, bool):
        raise SlotValidationError(
            "%s: pass must be true, false or None (pending), got %r" % (where, passed)
        )
    if outcome == PENDING_OUTCOME and passed is not None:
        raise SlotValidationError(
            "%s: outcome %r is only valid while pass is pending (None)"
            % (where, PENDING_OUTCOME)
        )
    if passed is True and outcome not in ("answered", "abstained"):
        raise SlotValidationError(
            "%s: outcome %r can never pass (method: refused, malformed and "
            "execution_error are always pass false)" % (where, outcome)
        )
    if not isinstance(slot["truncated"], bool):
        raise SlotValidationError("%s: truncated must be true or false" % where)
    if slot["time_s"] is not None and (not _is_number(slot["time_s"]) or slot["time_s"] < 0):
        raise SlotValidationError(
            "%s: time_s must be None or a number of seconds, zero or more" % where
        )
    if not _is_number(slot["cost_usd"]) or slot["cost_usd"] < 0:
        raise SlotValidationError("%s: cost_usd must be a number, zero or more" % where)
    judged = slot.get("judged_checks", 0)
    disputed = slot.get("disputed_checks", 0)
    for name, value in (("judged_checks", judged), ("disputed_checks", disputed)):
        if not _is_int(value) or value < 0:
            raise SlotValidationError("%s: %s must be an integer, zero or more" % (where, name))
    if disputed > judged:
        raise SlotValidationError(
            "%s: disputed_checks (%d) is more than judged_checks (%d)" % (where, disputed, judged)
        )
    if not isinstance(slot.get("needed_judge_classification", False), bool):
        raise SlotValidationError("%s: needed_judge_classification must be true or false" % where)


def validate_slots(slots, allow_pending=False):
    """Check the whole input and return it grouped: {model: {task_id: task}}.

    Each task is {"task_id", "family", "split", "slots": [3 records, by repeat]}.

    Raises SlotValidationError for a bad record, a duplicate slot, a task
    whose family or split changes between records, a task without exactly
    slots 1, 2 and 3 for a model, or models that did not run the same tasks.
    Raises PendingSlotsError when any pass is pending, unless allow_pending
    is set to True on purpose.
    """
    if not isinstance(slots, (list, tuple)):
        raise SlotValidationError("slots must be a list of dicts")
    if not slots:
        raise SlotValidationError("no slot records given")

    task_meta = {}
    by_model = {}
    pending = 0
    for index, slot in enumerate(slots):
        _check_slot(index, slot)
        where = _where(index, slot)
        meta = (slot["family"], slot["split"])
        known = task_meta.setdefault(slot["task_id"], meta)
        if known != meta:
            raise SlotValidationError(
                "%s: task has family/split %r here and %r elsewhere" % (where, meta, known)
            )
        repeats = by_model.setdefault(slot["model"], {}).setdefault(slot["task_id"], {})
        if slot["repeat"] in repeats:
            raise SlotValidationError("%s: duplicate slot" % where)
        repeats[slot["repeat"]] = slot
        if slot["pass"] is None:
            pending += 1

    for model in sorted(by_model):
        for task_id in sorted(by_model[model]):
            found = sorted(by_model[model][task_id])
            if found != list(REPEATS):
                raise SlotValidationError(
                    "model %r, task %r: needs exactly 3 slots (repeats 1, 2, 3), "
                    "found %d (repeats %s)" % (model, task_id, len(found), found)
                )

    models = sorted(by_model)
    reference = set(by_model[models[0]])
    for model in models[1:]:
        other = set(by_model[model])
        if other != reference:
            difference = sorted(other ^ reference)
            raise SlotValidationError(
                "models %r and %r did not run the same tasks; differing task ids: %s"
                % (models[0], model, ", ".join(difference[:10]))
            )

    if pending and not allow_pending:
        raise PendingSlotsError(
            "%d slot(s) have a pending pass; a run with pending judging cannot be "
            "scored (pass allow_pending=True only for a provisional look)" % pending
        )

    grouped = {}
    for model in models:
        grouped[model] = {}
        for task_id in sorted(by_model[model]):
            family, split = task_meta[task_id]
            grouped[model][task_id] = {
                "task_id": task_id,
                "family": family,
                "split": split,
                "slots": [by_model[model][task_id][repeat] for repeat in REPEATS],
            }
    return grouped


def _mean(values):
    return math.fsum(values) / len(values)


def _percent(numerator, denominator):
    if denominator == 0:
        return None
    return numerator / denominator * 100.0


def task_score(task):
    """Passes divided by 3 slots. A pending pass counts as not passed."""
    passes = sum(1 for slot in task["slots"] if slot["pass"] is True)
    return passes / SLOTS_PER_TASK


def _headline_block(tasks):
    """Family scores, the equal-family headline and the pooled pass rate."""
    family_scores = {}
    family_task_counts = {}
    empty = []
    for family in FAMILIES:
        scores = [task_score(task) for task in tasks if task["family"] == family]
        family_task_counts[str(family)] = len(scores)
        if scores:
            family_scores[str(family)] = _mean(scores) * 100.0
        else:
            family_scores[str(family)] = None
            empty.append(family)
    if empty:
        headline = None
        reason = "no tasks in family %s" % ", ".join(str(family) for family in empty)
    else:
        headline = _mean([family_scores[str(family)] for family in FAMILIES])
        reason = None
    slots = [slot for task in tasks for slot in task["slots"]]
    passed = sum(1 for slot in slots if slot["pass"] is True)
    return {
        "tasks": len(tasks),
        "slots": len(slots),
        "day_to_day_score": headline,
        "day_to_day_score_reason": reason,
        "family_scores": family_scores,
        "family_task_counts": family_task_counts,
        "pooled_pass_rate": _percent(passed, len(slots)),
    }


def _side_figures(tasks):
    slots = [slot for task in tasks for slot in task["slots"]]
    n_tasks = len(tasks)
    n_slots = len(slots)
    passed = sum(1 for slot in slots if slot["pass"] is True)

    abstain_slots = [
        slot for task in tasks if task["family"] in ABSTAIN_FAMILIES for slot in task["slots"]
    ]
    wrong = sum(
        1 for slot in abstain_slots if slot["outcome"] == "answered" and slot["pass"] is not True
    )
    abstained = sum(1 for slot in abstain_slots if slot["outcome"] == "abstained")

    consistent = sum(
        1
        for task in tasks
        if len({slot["pass"] is True for slot in task["slots"]}) == 1
    )

    total_cost = math.fsum(slot["cost_usd"] for slot in slots)
    if passed:
        # pooled pass rate (as a fraction) x number of tasks
        cost_per_success = total_cost / (passed / n_slots * n_tasks)
        cost_per_success_label = None
    else:
        cost_per_success = None
        cost_per_success_label = NO_SUCCESSFUL_TASKS

    times = [
        slot["time_s"]
        for slot in slots
        if slot["outcome"] != "execution_error" and slot["time_s"] is not None
    ]

    judged = sum(slot.get("judged_checks", 0) for slot in slots)
    disputed = sum(slot.get("disputed_checks", 0) for slot in slots)

    return {
        "wrong_answer_rate": _percent(wrong, len(abstain_slots)),
        "abstention_rate": _percent(abstained, len(abstain_slots)),
        "execution_error_rate": _percent(
            sum(1 for slot in slots if slot["outcome"] == "execution_error"), n_slots
        ),
        "consistency": _percent(consistent, n_tasks),
        "total_cost_usd": total_cost,
        "cost_per_task_usd": total_cost / n_tasks,
        "cost_per_successful_task_usd": cost_per_success,
        "cost_per_successful_task_label": cost_per_success_label,
        "time_per_attempt_s": float(statistics.median(times)) if times else None,
        "truncation_rate": _percent(sum(1 for slot in slots if slot["truncated"]), n_slots),
        "judged_checks": judged,
        "disputed_checks": disputed,
        "dispute_rate": _percent(disputed, judged),
        "judge_classification_rate": _percent(
            sum(1 for slot in slots if slot.get("needed_judge_classification", False)), n_slots
        ),
    }


def _score_tasks(model, tasks_by_id):
    tasks = [tasks_by_id[task_id] for task_id in sorted(tasks_by_id)]
    pending = sum(1 for task in tasks for slot in task["slots"] if slot["pass"] is None)
    result = {"model": model}
    result.update(_headline_block(tasks))
    result["pending_slots"] = pending
    result["provisional"] = pending > 0
    result["task_scores"] = {task["task_id"]: task_score(task) for task in tasks}
    result["subsets"] = {
        split: _headline_block([task for task in tasks if task["split"] == split])
        for split in SPLITS
    }
    result["side_figures"] = _side_figures(tasks)
    return result


def score_run(slots, allow_pending=False):
    """Score every model in the run. Returns {model: result dict}.

    The result is plain data (dicts, strings, numbers, None), with unrounded
    floats. With allow_pending=True a pending slot counts as not passed in
    every figure and the result is marked "provisional": true.
    """
    grouped = validate_slots(slots, allow_pending=allow_pending)
    return {model: _score_tasks(model, grouped[model]) for model in sorted(grouped)}


def score_model(slots, allow_pending=False):
    """Score a run that holds exactly one model and return its result dict."""
    results = score_run(slots, allow_pending=allow_pending)
    if len(results) != 1:
        raise SlotValidationError(
            "score_model needs slots for exactly one model, found %d: %s"
            % (len(results), ", ".join(sorted(results)))
        )
    return next(iter(results.values()))


def rank_models(results):
    """Order models for the table. Returns a list of rows.

    Sorted by Day-to-Day score, highest first, on the unrounded value. Exactly
    equal scores share a rank and the next rank is skipped (1, 1, 3). Within a
    tie the order is by model name, which carries no meaning. A model with no
    Day-to-Day score goes last with rank None.
    """
    rows = results.values() if isinstance(results, dict) else results
    scored = [row for row in rows if row["day_to_day_score"] is not None]
    unscored = [row for row in rows if row["day_to_day_score"] is None]
    scored.sort(key=lambda row: (-row["day_to_day_score"], row["model"]))
    unscored.sort(key=lambda row: row["model"])

    ranked = []
    previous = None
    rank = 0
    for position, row in enumerate(scored, start=1):
        if previous is None or row["day_to_day_score"] != previous:
            rank = position
            previous = row["day_to_day_score"]
        ranked.append(
            {"rank": rank, "model": row["model"], "day_to_day_score": row["day_to_day_score"]}
        )
    for row in unscored:
        ranked.append({"rank": None, "model": row["model"], "day_to_day_score": None})
    return ranked


def _round_half_up(value, places):
    # Avoids the surprise of banker's rounding on values such as 0.25.
    factor = 10 ** places
    return math.floor(abs(value) * factor + 0.5) / factor * (1 if value >= 0 else -1)


def format_for_display(value, _key=None):
    """Return a rounded copy for showing to people. The input is not changed.

    Every float is rounded to one decimal place, half up, except money
    (keys ending in "_usd"), which keeps four decimal places because a cost
    per task is often well under ten cents. Integers, strings, booleans and
    None pass through. Never rank or compare on the rounded values.
    """
    if isinstance(value, dict):
        return {key: format_for_display(item, key) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [format_for_display(item, _key) for item in value]
    if isinstance(value, float):
        if not math.isfinite(value):
            return value
        places = 4 if isinstance(_key, str) and _key.endswith("_usd") else 1
        return _round_half_up(value, places)
    return value
