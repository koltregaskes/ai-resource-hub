"""Pre-flight: the cost of the whole plan before any call.

Three figures, per provider and in total, for the canary, the judge
qualification and the full run with its checklist judging and outcome
classification (assumed for every slot in every family):

- expected: from the planning figure for output size in the run config;
- planning bound: every request once at its output limit, plus a 15%
  allowance for retries. The harness refuses to start when this is above
  the remaining cap of any provider;
- absolute bound: every permitted request at the output limit (3 per model
  slot; 2 per judge call, the first plus its one retry). For information.

Tasks come in as plain dicts: id, family, split, prompt, max_output_tokens,
the grader type, and the judged checks (a count, a list, or a `grader`
object whose judged checks are marked `"by": "judge"`).

Costs are counted the way the ledger reserves them, so the bound and the
reservations agree: input tokens are ceil(len(text) / 3) unless a tokeniser
is supplied.
"""

from decimal import Decimal

try:
    from . import judges, ledger
except ImportError:
    import judges
    import ledger

RETRY_ALLOWANCE = Decimal("0.15")
REPEATS = 3
MODEL_REQUESTS_PER_SLOT = 3
JUDGE_REQUESTS_PER_CALL = 2
CANARY_TASKS_PER_MODEL = 2
CANARY_REPEATS = 1
DEFAULT_OUTPUT_LIMIT = 4096
OUTPUT_LIMITS = (4096, 8192)
# An answer of N output tokens is planned as at most 4 N characters when it
# becomes judge input. The ledger then counts those characters at 3 per token.
ANSWER_CHARACTERS_PER_TOKEN = 4
# Used only when a task gives a count of judged checks without their texts.
CHECK_TEXT_CHARACTERS = 300
# Used only when the qualification sample files are not supplied.
ASSUMED_CHECKLIST_SAMPLES_PER_TASK = 4
ASSUMED_OUTCOME_SAMPLES = 20
STAGES = ("canary", "qualify", "full")
FIGURES = ("expected", "planning_bound", "absolute_bound")
ZERO = Decimal(0)


class PreflightRefused(Exception):
    """The planning bound is above a remaining cap."""


class TaskError(ValueError):
    """A task dict is missing something the run path needs."""


def normalise_task(raw, split=None):
    """Check one task dict and fill the defaults the run path relies on."""
    if not isinstance(raw, dict):
        raise TaskError("a task must be an object")
    task = dict(raw)
    if split is not None:
        task["split"] = split
    for name in ("id", "prompt"):
        if not isinstance(task.get(name), str) or not task[name]:
            raise TaskError("task is missing its " + name)
    if "family" not in task:
        raise TaskError("task %s is missing its family" % task["id"])
    if task.get("split") not in ("public", "held-out"):
        raise TaskError("task %s must be public or held-out" % task["id"])
    limit = task.setdefault("max_output_tokens", DEFAULT_OUTPUT_LIMIT)
    if isinstance(limit, bool) or limit not in OUTPUT_LIMITS:
        raise TaskError("task %s has an output limit other than 4096 or 8192" % task["id"])
    task.setdefault("answerable", True)
    return task


def normalise_tasks(tasks):
    checked = [normalise_task(task) for task in tasks]
    ids = [task["id"] for task in checked]
    if len(set(ids)) != len(ids):
        raise TaskError("a task id appears twice")
    return checked


def canary_tasks(config, tasks):
    """The 2 public tasks used by the canary: the ids named in the config,
    or else the first 2 public tasks by id."""
    public = sorted((t for t in tasks if t["split"] == "public"), key=lambda t: t["id"])
    if config.canary_task_ids:
        by_id = {t["id"]: t for t in public}
        missing = [i for i in config.canary_task_ids if i not in by_id]
        if missing:
            raise TaskError("canary task is not a public task: " + ", ".join(missing))
        return [by_id[i] for i in config.canary_task_ids]
    if len(public) < CANARY_TASKS_PER_MODEL:
        raise TaskError("the canary needs 2 public tasks")
    return public[:CANARY_TASKS_PER_MODEL]


def _checks_for_planning(task):
    checks = judges.judged_checks(task)
    if checks:
        return checks
    count = judges.judged_check_count(task)
    return [{"id": "c%d" % n, "text": "x" * CHECK_TEXT_CHARACTERS} for n in range(1, count + 1)]


class _Tally:
    def __init__(self):
        self.cells = {}
        self.requests = {}

    def add(self, stage, kind, spec, input_once, input_expected, output_limit,
            output_expected, permitted):
        once = ledger.worst_case_usd(input_once, output_limit, spec.price)
        expected = ledger.worst_case_usd(input_expected, min(output_expected, output_limit),
                                         spec.price)
        cell = self.cells.setdefault((stage, spec.provider), dict.fromkeys(FIGURES, ZERO))
        cell["expected"] += expected
        cell["planning_bound"] += once * (1 + RETRY_ALLOWANCE)
        cell["absolute_bound"] += once * permitted
        key = (stage, kind)
        self.requests[key] = self.requests.get(key, 0) + 1


def _judge_input(prefix_tokens, answer_tokens, tokeniser):
    """Judge input tokens: the prompt without the answer, plus the answer."""
    if tokeniser is not None:
        return prefix_tokens + answer_tokens
    return prefix_tokens + -(-answer_tokens * ANSWER_CHARACTERS_PER_TOKEN // 3)


def build_plan(config, tasks, checklist_samples=None, outcome_samples=None, tokeniser=None):
    """Cost every request in the whole plan. Returns the figures by stage
    and provider, the request counts and the task counts."""
    tasks = normalise_tasks(tasks)
    by_id = {task["id"]: task for task in tasks}
    judges.assert_panel(config.judges)
    tally = _Tally()
    count = lambda text: ledger.count_input_tokens(text, tokeniser)  # noqa: E731
    expected_out = config.expected_output_tokens
    judged_tasks = [task for task in tasks if judges.judged_check_count(task)]

    def judge_slot(stage, task):
        limit = task["max_output_tokens"]
        for judge in config.judges:
            prefix = count(judges.build_outcome_prompt(task["prompt"], ""))
            tally.add(stage, "outcome_classification", judge,
                      _judge_input(prefix, limit, tokeniser),
                      _judge_input(prefix, min(expected_out, limit), tokeniser),
                      judge.max_output_tokens, config.judge_expected_output_tokens,
                      JUDGE_REQUESTS_PER_CALL)
            if judges.judged_check_count(task):
                prefix = count(judges.build_checklist_prompt(
                    task["prompt"], "", _checks_for_planning(task)))
                tally.add(stage, "checklist_judging", judge,
                          _judge_input(prefix, limit, tokeniser),
                          _judge_input(prefix, min(expected_out, limit), tokeniser),
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)

    def model_slot(stage, model, task):
        tokens = count(task["prompt"])
        tally.add(stage, "model", model, tokens, tokens, task["max_output_tokens"],
                  expected_out, MODEL_REQUESTS_PER_SLOT)
        judge_slot(stage, task)

    canary = canary_tasks(config, tasks)
    for model in config.models:
        for task in canary:
            for _ in range(CANARY_REPEATS):
                model_slot("canary", model, task)
        for task in tasks:
            for _ in range(REPEATS):
                model_slot("full", model, task)

    assumed = checklist_samples is None or outcome_samples is None
    for judge in config.judges:
        if checklist_samples is None:
            for task in judged_tasks:
                prefix = count(judges.build_checklist_prompt(
                    task["prompt"], "", _checks_for_planning(task)))
                tokens = _judge_input(prefix, task["max_output_tokens"], tokeniser)
                for _ in range(ASSUMED_CHECKLIST_SAMPLES_PER_TASK):
                    tally.add("qualify", "judge_qualification", judge, tokens, tokens,
                              judge.max_output_tokens, config.judge_expected_output_tokens,
                              JUDGE_REQUESTS_PER_CALL)
        else:
            for sample in checklist_samples:
                task = by_id.get(sample.get("task_id"))
                if task is None:
                    raise TaskError("checklist sample names an unknown task")
                tokens = count(judges.build_checklist_prompt(
                    task["prompt"], sample["answer"], judges.judged_checks(task)))
                tally.add("qualify", "judge_qualification", judge, tokens, tokens,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)
        if outcome_samples is None:
            largest = max(tasks, key=lambda t: (len(t["prompt"]), t["id"]))
            prefix = count(judges.build_outcome_prompt(largest["prompt"], ""))
            tokens = _judge_input(prefix, largest["max_output_tokens"], tokeniser)
            for _ in range(ASSUMED_OUTCOME_SAMPLES):
                tally.add("qualify", "judge_qualification", judge, tokens, tokens,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)
        else:
            for sample in outcome_samples:
                task = by_id.get(sample.get("task_id"))
                if task is None:
                    raise TaskError("outcome sample names an unknown task")
                tokens = count(judges.build_outcome_prompt(task["prompt"], sample["reply"]))
                tally.add("qualify", "judge_qualification", judge, tokens, tokens,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)

    providers = sorted(config.caps_usd)
    by_stage = {stage: {provider: dict(tally.cells.get((stage, provider),
                                                       dict.fromkeys(FIGURES, ZERO)))
                        for provider in providers} for stage in STAGES}
    requests = {stage: {} for stage in STAGES}
    for (stage, kind), number in sorted(tally.requests.items()):
        requests[stage][kind] = number
    return {
        "by_stage": by_stage,
        "requests": requests,
        "counts": {
            "models": len(config.models),
            "tasks": len(tasks),
            "tasks_with_judged_checks": len(judged_tasks),
            "judged_checks": sum(judges.judged_check_count(t) for t in judged_tasks),
            "full_run_slots": len(config.models) * len(tasks) * REPEATS,
            "canary_slots": len(config.models) * len(canary) * CANARY_REPEATS,
        },
        "qualification_samples_assumed": assumed,
    }


def _sum(by_stage, stages, providers):
    totals = {provider: dict.fromkeys(FIGURES, ZERO) for provider in providers}
    for stage in stages:
        for provider in providers:
            for figure in FIGURES:
                totals[provider][figure] += by_stage[stage][provider][figure]
    totals["total"] = {figure: sum((totals[p][figure] for p in providers), ZERO)
                       for figure in FIGURES}
    return totals


def preflight(config, tasks, remaining_caps, stage="canary", max_usd=None,
              checklist_samples=None, outcome_samples=None, tokeniser=None, out=print):
    """Print and return the three figures, and say whether the run may start.

    `remaining_caps` is the remaining cap per provider from the ledgers.
    `stage` is the stage about to run. The whole plan is always printed; the
    refusal test uses this stage and the stages still to come after it
    (canary, then qualify, then full), because earlier stages are already in
    the ledger and so already out of the remaining cap.
    `max_usd` is the lower cap for this one run; the run is refused when this
    stage's planning bound is above it.
    """
    if stage not in STAGES:
        raise ValueError("unknown stage: " + str(stage))
    plan = build_plan(config, tasks, checklist_samples, outcome_samples, tokeniser)
    providers = sorted(config.caps_usd)
    whole = _sum(plan["by_stage"], STAGES, providers)
    ahead = _sum(plan["by_stage"], STAGES[STAGES.index(stage):], providers)
    this_stage = _sum(plan["by_stage"], [stage], providers)
    refusals = []
    for provider in providers:
        remaining = Decimal(str(remaining_caps[provider]))
        if ahead[provider]["planning_bound"] > remaining:
            refusals.append(
                "%s: planning bound %s USD for the plan still to run is above the remaining "
                "cap %s USD. Shorten the model list in the run config; do not lower a limit."
                % (provider, _usd(ahead[provider]["planning_bound"]), _usd(remaining)))
    if max_usd is not None and this_stage["total"]["planning_bound"] > Decimal(str(max_usd)):
        refusals.append(
            "--max-usd %s is below this stage's planning bound %s USD"
            % (_usd(Decimal(str(max_usd))), _usd(this_stage["total"]["planning_bound"])))
    result = dict(plan, stage=stage, whole_plan=whole, plan_still_to_run=ahead,
                  this_stage=this_stage,
                  remaining_caps={p: Decimal(str(remaining_caps[p])) for p in providers},
                  max_usd=None if max_usd is None else Decimal(str(max_usd)),
                  ok=not refusals, refusals=refusals)
    if out:
        for line in render(result):
            out(line)
    return result


def enforce(result):
    """Raise `PreflightRefused` when the pre-flight said no."""
    if not result["ok"]:
        raise PreflightRefused("pre-flight refused: " + " | ".join(result["refusals"]))
    return result


def _usd(amount):
    return str(amount.quantize(Decimal("0.0001")))


def render(result):
    counts = result["counts"]
    lines = [
        "Pre-flight for the whole plan (USD)",
        "  models %d, tasks %d, full-run slots %d, canary slots %d" % (
            counts["models"], counts["tasks"], counts["full_run_slots"], counts["canary_slots"]),
        "  tasks with a judged check: %d (judged checks: %d)" % (
            counts["tasks_with_judged_checks"], counts["judged_checks"]),
    ]
    if result["qualification_samples_assumed"]:
        lines.append("  qualification sample files not supplied: counted as 4 samples per "
                     "judged task and 20 outcome samples at the output limit")
    for stage in STAGES:
        kinds = ", ".join("%s %d" % item for item in sorted(result["requests"][stage].items()))
        lines.append("  requests in %s: %s" % (stage, kinds or "none"))
    lines.append("  %-10s %14s %16s %16s %16s" % (
        "provider", "expected", "planning bound", "absolute bound", "remaining cap"))
    for provider in sorted(result["remaining_caps"]):
        row = result["whole_plan"][provider]
        lines.append("  %-10s %14s %16s %16s %16s" % (
            provider, _usd(row["expected"]), _usd(row["planning_bound"]),
            _usd(row["absolute_bound"]), _usd(result["remaining_caps"][provider])))
    row = result["whole_plan"]["total"]
    lines.append("  %-10s %14s %16s %16s" % (
        "total", _usd(row["expected"]), _usd(row["planning_bound"]), _usd(row["absolute_bound"])))
    lines.append("  The planning bound is every request once at its output limit plus 15% "
                 "for retries. The absolute bound is for information only.")
    if result["ok"]:
        lines.append("  Result: within the remaining caps for stage %s and what follows it."
                     % result["stage"])
    else:
        lines.extend("  REFUSED: " + reason for reason in result["refusals"])
    return lines
