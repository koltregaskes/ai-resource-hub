"""Pre-flight: the cost of the whole plan before any call.

Three figures, per provider and in total, for the judge qualification, the
canary and the full run with its checklist judging and outcome
classification (assumed for every slot in every family):

- expected: from the planning figure for output size in the run config,
  with input sized by a softer estimate (see `expected_input_tokens`). It
  is for reading only: it never feeds a reservation or a cap check;
- planning bound: every request once at its output limit, plus a 15%
  allowance for retries. The harness refuses to start when this is above
  the remaining cap of any provider;
- absolute bound: every permitted request at the output limit (3 per model
  slot; 2 per judge call, the first plus its one retry). For information.

Tasks come in as plain dicts: id, family, split, prompt, max_output_tokens,
the grader type, and the judged checks (a count, a list, or a `grader`
object whose judged checks are marked `"by": "judge"`).

The two bounds count input the way the ledger reserves it, with the one
function `ledger.input_token_bound`: the UTF-8 byte length of the text sent
plus the framing allowance. That is an upper bound on the input tokens, not
an estimate.

One planning assumption remains, and it is named: an answer that does not
exist yet is planned at `ANSWER_BYTES_PER_TOKEN` bytes per token of the
task's output limit when it becomes judge input. At run time the judge
request is reserved from the bytes of the real answer, so the cap holds
whatever the answer turns out to be; a longer answer than planned can only
stop the run early at the cap.

Judges. Qualification is counted for every judge candidate in the config:
one call per sample per candidate. The judging of the canary and the full
run is costed in one of two ways, and the output says which:

- recorded panel: a passed qualification is on record, so the two judges it
  named are used;
- worst case: no qualification is on record yet, so on each provider side
  the candidate whose judging would cost the most is used. Any candidate
  could still be the one that passes.
"""

from decimal import Decimal

try:
    from . import config as config_module, judges, keys as keys_module, ledger
except ImportError:
    import config as config_module
    import judges
    import keys as keys_module
    import ledger

RETRY_ALLOWANCE = Decimal("0.15")
REPEATS = 3
MODEL_REQUESTS_PER_SLOT = 3
JUDGE_REQUESTS_PER_CALL = 2
CANARY_TASKS_PER_MODEL = 2
CANARY_REPEATS = 1
DEFAULT_OUTPUT_LIMIT = 4096
OUTPUT_LIMITS = (4096, 8192)
# PLANNING ASSUMPTION, bounds only. An answer of N output tokens is planned
# as 4 N bytes when it becomes judge input, and the byte bound counts every
# byte as one token. The real judge request is reserved from the real answer.
ANSWER_BYTES_PER_TOKEN = 4
# EXPECTED FIGURE ONLY. A softer size for input, never used for a
# reservation, a bound or a cap check: 3 characters per input token, and an
# answer of N output tokens read as 4 N characters.
EXPECTED_CHARACTERS_PER_INPUT_TOKEN = 3
EXPECTED_ANSWER_CHARACTERS_PER_TOKEN = 4
# Used only when a task gives a count of judged checks without their texts.
CHECK_TEXT_CHARACTERS = 300
# Used only when the qualification sample files are not supplied.
ASSUMED_CHECKLIST_SAMPLES_PER_TASK = 4
ASSUMED_OUTCOME_SAMPLES = 20
STAGES = ("qualify", "canary", "full")
RECORDED_PANEL = "recorded_panel"
WORST_CASE = "worst_case"
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

    def merge(self, other):
        for key, cell in other.cells.items():
            mine = self.cells.setdefault(key, dict.fromkeys(FIGURES, ZERO))
            for figure in FIGURES:
                mine[figure] += cell[figure]
        for key, number in other.requests.items():
            self.requests[key] = self.requests.get(key, 0) + number

    def planning_bound(self):
        return sum((cell["planning_bound"] for cell in self.cells.values()), ZERO)


def expected_input_tokens(text):
    """EXPECTED FIGURE ONLY: a softer size for input text. Never used for a
    reservation, the planning bound, the absolute bound or a cap check."""
    return -(-len(text) // EXPECTED_CHARACTERS_PER_INPUT_TOKEN)


def _judge_input_bound(prefix_bound, answer_tokens):
    """Bound on judge input: the judge prompt without the answer (bytes plus
    the framing allowance), plus the planned bytes of the answer."""
    return prefix_bound + answer_tokens * ANSWER_BYTES_PER_TOKEN


def _judge_input_expected(prefix_expected, answer_tokens):
    """EXPECTED FIGURE ONLY: judge input for an answer of this many tokens."""
    return prefix_expected + -(
        -answer_tokens * EXPECTED_ANSWER_CHARACTERS_PER_TOKEN
        // EXPECTED_CHARACTERS_PER_INPUT_TOKEN)


def build_plan(config, tasks, checklist_samples=None, outcome_samples=None, panel=None):
    """Cost every request in the whole plan. Returns the figures by stage
    and provider, the request counts and the task counts.

    `panel` is the two judge specs named by a recorded qualification, or
    None when there is no such record; the judging is then costed at the
    dearest candidate on each side.
    """
    tasks = normalise_tasks(tasks)
    by_id = {task["id"]: task for task in tasks}
    judges.assert_panel(config.judges)
    config_module.assert_judge_limits(
        tuple(config.judges) + tuple(config.all_judge_candidates()))
    if panel is not None:
        judges.assert_panel(panel)
        config_module.assert_judge_limits(panel)
    tally = _Tally()

    def sizes(text):
        """(bound, expected) input tokens for one text sent as a request."""
        return ledger.input_token_bound(text), expected_input_tokens(text)
    expected_out = config.expected_output_tokens
    judged_tasks = [task for task in tasks if judges.judged_check_count(task)]
    candidates = {provider: tuple(specs)
                  for provider, specs in sorted(config.judge_candidates.items())}
    every_candidate = [spec for specs in candidates.values() for spec in specs]
    prefixes = {}

    def prefix_tokens(task):
        """Judge prompt sizes for a task, without the answer: (outcome
        classification, checklist judging or None), each a (bound,
        expected) pair."""
        if task["id"] not in prefixes:
            checklist = None
            if judges.judged_check_count(task):
                checklist = sizes(judges.build_checklist_prompt(
                    task["prompt"], "", _checks_for_planning(task)))
            prefixes[task["id"]] = (
                sizes(judges.build_outcome_prompt(task["prompt"], "")), checklist)
        return prefixes[task["id"]]

    def judge_input(prefix, answer_tokens, expected_answer_tokens):
        """(bound, expected) judge input for a judge prompt and an answer."""
        return (_judge_input_bound(prefix[0], answer_tokens),
                _judge_input_expected(prefix[1], expected_answer_tokens))

    def judge_slot(into, stage, judge, task):
        limit = task["max_output_tokens"]
        outcome_prefix, checklist_prefix = prefix_tokens(task)
        bound, expected = judge_input(outcome_prefix, limit, min(expected_out, limit))
        into.add(stage, "outcome_classification", judge, bound, expected,
                 judge.max_output_tokens, config.judge_expected_output_tokens,
                 JUDGE_REQUESTS_PER_CALL)
        if checklist_prefix is not None:
            bound, expected = judge_input(checklist_prefix, limit, min(expected_out, limit))
            into.add(stage, "checklist_judging", judge, bound, expected,
                     judge.max_output_tokens, config.judge_expected_output_tokens,
                     JUDGE_REQUESTS_PER_CALL)

    slots = []

    def model_slot(stage, model, task):
        bound, expected = sizes(task["prompt"])
        tally.add(stage, "model", model, bound, expected, task["max_output_tokens"],
                  expected_out, MODEL_REQUESTS_PER_SLOT)
        slots.append((stage, task))

    canary = canary_tasks(config, tasks)
    for model in config.models:
        for task in canary:
            for _ in range(CANARY_REPEATS):
                model_slot("canary", model, task)
        for task in tasks:
            for _ in range(REPEATS):
                model_slot("full", model, task)

    def judging(judge):
        """What one judge would cost over every slot of the canary and the
        full run."""
        own = _Tally()
        for stage, task in slots:
            judge_slot(own, stage, judge, task)
        return own

    costed = {}
    if panel is not None:
        case = RECORDED_PANEL
        for judge in panel:
            costed[judge.provider] = judge.model_id
            tally.merge(judging(judge))
    else:
        case = WORST_CASE
        for provider, specs in candidates.items():
            dearest = None
            for judge in specs:
                own = judging(judge)
                bound = own.planning_bound()
                if dearest is None or bound > dearest[0]:
                    dearest = (bound, judge, own)
            costed[provider] = dearest[1].model_id
            tally.merge(dearest[2])

    assumed = checklist_samples is None or outcome_samples is None
    for judge in every_candidate:
        if checklist_samples is None:
            for task in judged_tasks:
                bound, expected = judge_input(prefix_tokens(task)[1],
                                              task["max_output_tokens"],
                                              task["max_output_tokens"])
                for _ in range(ASSUMED_CHECKLIST_SAMPLES_PER_TASK):
                    tally.add("qualify", "judge_qualification", judge, bound, expected,
                              judge.max_output_tokens, config.judge_expected_output_tokens,
                              JUDGE_REQUESTS_PER_CALL)
        else:
            for sample in checklist_samples:
                task = by_id.get(sample.get("task_id"))
                if task is None:
                    raise TaskError("checklist sample names an unknown task")
                bound, expected = sizes(judges.build_checklist_prompt(
                    task["prompt"], sample["answer"], judges.judged_checks(task)))
                tally.add("qualify", "judge_qualification", judge, bound, expected,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)
        if outcome_samples is None:
            largest = max(tasks, key=lambda t: (len(t["prompt"]), t["id"]))
            bound, expected = judge_input(prefix_tokens(largest)[0],
                                          largest["max_output_tokens"],
                                          largest["max_output_tokens"])
            for _ in range(ASSUMED_OUTCOME_SAMPLES):
                tally.add("qualify", "judge_qualification", judge, bound, expected,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)
        else:
            for sample in outcome_samples:
                task = by_id.get(sample.get("task_id"))
                if task is None:
                    raise TaskError("outcome sample names an unknown task")
                bound, expected = sizes(
                    judges.build_outcome_prompt(task["prompt"], sample["reply"]))
                tally.add("qualify", "judge_qualification", judge, bound, expected,
                          judge.max_output_tokens, config.judge_expected_output_tokens,
                          JUDGE_REQUESTS_PER_CALL)
    checklist_calls = (len(judged_tasks) * ASSUMED_CHECKLIST_SAMPLES_PER_TASK
                       if checklist_samples is None else len(checklist_samples))
    outcome_calls = ASSUMED_OUTCOME_SAMPLES if outcome_samples is None else len(outcome_samples)

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
        "qualification": {
            "candidates": {provider: [spec.model_id for spec in specs]
                           for provider, specs in candidates.items()},
            "checklist_samples": checklist_calls,
            "outcome_samples": outcome_calls,
            "calls_per_candidate": checklist_calls + outcome_calls,
            "calls": (checklist_calls + outcome_calls) * len(every_candidate),
        },
        "judging": {"case": case, "judges": costed, "qualification_run_id": None,
                    "note": None},
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


def preflight(config, tasks, remaining_caps, stage="qualify", max_usd=None,
              checklist_samples=None, outcome_samples=None, out=print,
              qualification=None, qualification_note=None, environ=None):
    """Print and return the three figures, and say whether the run may start.

    `remaining_caps` is the remaining cap per provider from the ledgers.
    `stage` is the stage about to run. The whole plan is always printed; the
    refusal test uses this stage and the stages still to come after it
    (qualify, then canary, then full), because earlier stages are already in
    the ledger and so already out of the remaining cap.
    `max_usd` is the lower cap for this one run; the run is refused when this
    stage's planning bound is above it.
    `qualification` is `{"run_id", "panel"}` from a passed qualification
    record, or None. `qualification_note` says why a record on file was not
    used. The three figures are printed whether or not the run is refused.

    Raises `keys.EnvironmentNotClean`, before anything else, while a
    provider key variable is set in the environment.
    """
    keys_module.assert_clean_environment(environ)
    if stage not in STAGES:
        raise ValueError("unknown stage: " + str(stage))
    panel = None if qualification is None else tuple(qualification["panel"])
    plan = build_plan(config, tasks, checklist_samples, outcome_samples, panel)
    if qualification is not None:
        plan["judging"]["qualification_run_id"] = qualification.get("run_id")
    plan["judging"]["note"] = qualification_note
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
    providers = sorted(result["remaining_caps"])
    qualification = result["qualification"]
    judging = result["judging"]
    lines = [
        "Pre-flight for the whole plan (USD)",
        "  models %d, tasks %d, full-run slots %d, canary slots %d" % (
            counts["models"], counts["tasks"], counts["full_run_slots"], counts["canary_slots"]),
        "  tasks with a judged check: %d (judged checks: %d)" % (
            counts["tasks_with_judged_checks"], counts["judged_checks"]),
        "  judge candidates: " + "; ".join(
            "%s %s" % (provider, ", ".join(ids) or "none")
            for provider, ids in sorted(qualification["candidates"].items())),
        "  qualification: %d calls per candidate (%d checklist samples + %d outcome samples), "
        "%d calls in all" % (qualification["calls_per_candidate"],
                             qualification["checklist_samples"],
                             qualification["outcome_samples"], qualification["calls"]),
    ]
    if result["qualification_samples_assumed"]:
        lines.append("  qualification sample files not supplied: counted as 4 samples per "
                     "judged task and 20 outcome samples at the output limit")
    named = ", ".join("%s %s" % item for item in sorted(judging["judges"].items()))
    if judging["case"] == RECORDED_PANEL:
        lines.append("  judging costed with the RECORDED PANEL of qualification %s: %s" % (
            judging["qualification_run_id"] or "(run id not given)", named))
    else:
        lines.append("  judging costed at the WORST CASE, the dearest candidate on each "
                     "side: %s" % named)
        lines.append("  why: " + (judging["note"] or "no passed qualification is on record yet"))
    for stage in STAGES:
        kinds = ", ".join("%s %d" % item for item in sorted(result["requests"][stage].items()))
        lines.append("  requests in %s: %s" % (stage, kinds or "none"))
    lines.append("  %-10s %14s %16s %16s %16s" % (
        "provider", "expected", "planning bound", "absolute bound", "remaining cap"))
    for provider in providers:
        row = result["whole_plan"][provider]
        lines.append("  %-10s %14s %16s %16s %16s" % (
            provider, _usd(row["expected"]), _usd(row["planning_bound"]),
            _usd(row["absolute_bound"]), _usd(result["remaining_caps"][provider])))
    row = result["whole_plan"]["total"]
    lines.append("  %-10s %14s %16s %16s" % (
        "total", _usd(row["expected"]), _usd(row["planning_bound"]), _usd(row["absolute_bound"])))
    lines.append("  planning bound by stage:")
    lines.append("  %-10s" % "stage" + "".join(" %16s" % provider for provider in providers))
    for stage in STAGES:
        lines.append("  %-10s" % stage + "".join(
            " %16s" % _usd(result["by_stage"][stage][provider]["planning_bound"])
            for provider in providers))
    lines.append("  The planning bound is every request once at its output limit plus 15% "
                 "for retries. The absolute bound is for information only.")
    lines.append("  Input in both bounds is the byte length of the text sent plus %d tokens "
                 "of framing per request: an upper bound on the tokens. An answer not yet "
                 "written is planned at %d bytes per token of its limit as judge input."
                 % (ledger.FRAMING_ALLOWANCE_TOKENS, ANSWER_BYTES_PER_TOKEN))
    lines.append("  The expected figure sizes input by a softer estimate and is never used "
                 "for a reservation or a cap check.")
    if result["ok"]:
        lines.append("  Result: within the remaining caps for stage %s and what follows it."
                     % result["stage"])
    else:
        lines.extend("  REFUSED: " + reason for reason in result["refusals"])
    return lines
