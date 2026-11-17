"""Pre-flight: the cost of the whole plan before any call.

Three figures, per provider and in total, for the judge qualification, the
canary and the full run with its checklist judging and outcome
classification (assumed for every slot in every family):

- expected: from the planning figure for output size in the run config,
  with input sized by a softer estimate (see `expected_input_tokens`). It
  never feeds a reservation or a planning bound. Its one use in a gate is
  the whole-plan gate below;
- planning bound: every request once at its output limit, plus a 15%
  allowance for retries. It is worked out for the whole plan, for each
  stage and for each pass of the full run;
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
stop the run early at the cap. It is one more reason why a pass that was
admitted is likely to finish and is not sure to.

How the cap is enforced (three layers; see RUNNER.md):

1. every request is reserved at its worst case before it is sent, and the
   run stops if a charge is ever above its reservation (`ledger.py`);
2. the full run goes one pass at a time (pass n is repeat n of every task
   for every model, with its judging). A pass starts only if its own
   planning bound is at or below the remaining cap of every provider
   (`pass_gate`). The qualification and the canary are gated the same way.
   The gate admits a pass that fits at one request per slot at its output
   limit plus 15% for retries. That makes finishing likely, not certain:
   a slot may use up to 3 model requests and each judge call 2, and a
   timeout or a connection failure keeps its full reservation until it is
   reconciled, so a bad run of them can use up the room. The run then ends
   `interrupted` or `incomplete` inside the cap and is not scored. Layer 1
   is what holds the cap; this layer only decides whether to start;
3. before the qualification, before the canary and before pass 1,
   `EXPECTED_MARGIN` times the expected cost of everything still to run
   must be at or below the remaining cap of every provider.

A whole-plan planning bound above a cap is printed and is not, by itself,
a refusal: the passes are gated one at a time. A ledger that holds a
settled charge above its reservation refuses every start until the run
config names that request in `acknowledged_overruns`.

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
# The whole-plan gate: this many times the expected cost of everything still
# to run must fit the remaining cap of each provider.
EXPECTED_MARGIN = 2
# The full run has one pass per repeat.
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
# reservation or a bound: 3 characters per input token, and an answer of N
# output tokens read as 4 N characters. The expected figure feeds one gate,
# the whole-plan gate, and there it is multiplied by EXPECTED_MARGIN.
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
    """A gate said no: the whole-plan gate, the planning bound of the stage
    or pass about to start, `--max-usd`, or an overrun on file."""


def pass_unit(number):
    """The name of pass `number` of the full run inside the tally."""
    return "full/%d" % number


def unit_label(unit):
    """How a gated unit is named in the output: qualify, canary, pass 1."""
    return "pass " + unit.split("/", 1)[1] if unit.startswith("full/") else unit


def first_unit(stage):
    """The unit that starts when `stage` starts: the stage itself, or pass 1
    of the full run."""
    return pass_unit(1) if stage == "full" else stage


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
        return once * (1 + RETRY_ALLOWANCE)

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
    reservation, the planning bound or the absolute bound."""
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
        """Cost one judge's work on one slot; returns its planning bound."""
        limit = task["max_output_tokens"]
        outcome_prefix, checklist_prefix = prefix_tokens(task)
        bound, expected = judge_input(outcome_prefix, limit, min(expected_out, limit))
        planned = into.add(stage, "outcome_classification", judge, bound, expected,
                           judge.max_output_tokens, config.judge_expected_output_tokens,
                           JUDGE_REQUESTS_PER_CALL)
        if checklist_prefix is not None:
            bound, expected = judge_input(checklist_prefix, limit, min(expected_out, limit))
            planned += into.add(stage, "checklist_judging", judge, bound, expected,
                                judge.max_output_tokens, config.judge_expected_output_tokens,
                                JUDGE_REQUESTS_PER_CALL)
        return planned

    passes = tuple(range(1, REPEATS + 1))
    slots = []
    # The planning bound of one slot (its model request and its judging), by
    # provider. Every pass holds the same slots, so pass 1 gives the figure.
    slot_bounds = {}
    # The judging part of that figure alone, for a slot that already has its
    # paid answer and only has to be graded and judged on a resume.
    judging_bounds = {}

    def slot_cell(model, task):
        return slot_bounds.setdefault(model.model_id, {}).setdefault(task["id"], {})

    def model_slot(unit, model, task):
        bound, expected = sizes(task["prompt"])
        planned = tally.add(unit, "model", model, bound, expected, task["max_output_tokens"],
                            expected_out, MODEL_REQUESTS_PER_SLOT)
        if unit == pass_unit(1):
            cell = slot_cell(model, task)
            cell[model.provider] = cell.get(model.provider, ZERO) + planned
        slots.append((unit, model, task))

    canary = canary_tasks(config, tasks)
    for model in config.models:
        for task in canary:
            for _ in range(CANARY_REPEATS):
                model_slot("canary", model, task)
        for task in tasks:
            for number in passes:
                model_slot(pass_unit(number), model, task)

    def judging(judge):
        """What one judge would cost over every slot of the canary and the
        full run: (the tally, the planning bound slot by slot)."""
        own = _Tally()
        return own, [judge_slot(own, unit, judge, task) for unit, _, task in slots]

    def take(judge, own, per_slot):
        costed[judge.provider] = judge.model_id
        tally.merge(own)
        for (unit, model, task), planned in zip(slots, per_slot):
            if unit == pass_unit(1):
                cell = slot_cell(model, task)
                cell[judge.provider] = cell.get(judge.provider, ZERO) + planned
                cell = judging_bounds.setdefault(model.model_id, {}).setdefault(task["id"], {})
                cell[judge.provider] = cell.get(judge.provider, ZERO) + planned

    costed = {}
    if panel is not None:
        case = RECORDED_PANEL
        for judge in panel:
            take(judge, *judging(judge))
    else:
        case = WORST_CASE
        for provider, specs in candidates.items():
            dearest = None
            for judge in specs:
                own, per_slot = judging(judge)
                bound = own.planning_bound()
                if dearest is None or bound > dearest[0]:
                    dearest = (bound, judge, own, per_slot)
            take(*dearest[1:])

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

    def cells(unit):
        return {provider: dict(tally.cells.get((unit, provider), dict.fromkeys(FIGURES, ZERO)))
                for provider in providers}

    by_pass = {number: cells(pass_unit(number)) for number in passes}
    by_stage = {stage: cells(stage) for stage in STAGES}
    # The full run is the sum of its passes.
    for number in passes:
        for provider in providers:
            for figure in FIGURES:
                by_stage["full"][provider][figure] += by_pass[number][provider][figure]
    requests = {stage: {} for stage in STAGES}
    for (unit, kind), number in sorted(tally.requests.items()):
        stage = "full" if unit.startswith("full/") else unit
        requests[stage][kind] = requests[stage].get(kind, 0) + number
    return {
        "by_stage": by_stage,
        "by_pass": by_pass,
        "passes": len(passes),
        "slot_planning_bound": slot_bounds,
        "slot_judging_bound": judging_bounds,
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


def _unit_cells(plan, unit):
    """The figures of one gated unit: a stage, or one pass of the full run."""
    if unit.startswith("full/"):
        return plan["by_pass"][int(unit.split("/", 1)[1])]
    return plan["by_stage"][unit]


def units_up_to_pass_one(stage):
    """The gated units from `stage` up to and including pass 1 of the full
    run: what the `preflight` command tests together."""
    return [first_unit(name) for name in STAGES[STAGES.index(stage):]]


def unacknowledged_overruns(config, overruns):
    """`overruns` is {provider: [request id]} from `ProviderLedger.overruns`.
    Returns the same shape, holding only the request ids that the run config
    does not name in `acknowledged_overruns`."""
    acknowledged = set(config.acknowledged_overruns)
    left = {}
    for provider, ids in sorted((overruns or {}).items()):
        open_ids = [request for request in sorted(ids) if request not in acknowledged]
        if open_ids:
            left[provider] = open_ids
    return left


def overrun_refusals(config, overruns):
    """One refusal line per overrun on file that the config does not name."""
    return ["%s: request %s was charged above its reservation. No stage or pass starts "
            "until the run config names that request id in acknowledged_overruns."
            % (provider, request)
            for provider, ids in unacknowledged_overruns(config, overruns).items()
            for request in ids]


def preflight(config, tasks, remaining_caps, stage="qualify", max_usd=None,
              checklist_samples=None, outcome_samples=None, out=print,
              qualification=None, qualification_note=None, environ=None,
              overruns=None, together=False, resuming=False):
    """Print and return the figures, and say whether the stage may start.

    `remaining_caps` is the remaining cap per provider from the ledgers:
    the cap less the real settled spend and less the open reservations.
    `stage` is the stage about to run. The whole plan is always printed.

    The start is refused when, for any provider:
    - the ledger holds a settled charge above its reservation that the run
      config does not name in `acknowledged_overruns` (`overruns` is
      {provider: [request id]} from the ledgers);
    - the whole-plan gate fails: `EXPECTED_MARGIN` times the expected cost of
      this stage and everything after it is above the remaining cap;
    - the planning bound of what is about to start (the qualification, the
      canary, or pass 1 of the full run) is above the remaining cap.
    It is also refused when that planning bound, over both providers, is
    above `max_usd`, the lower cap for this one run.

    With `together` (the `preflight` command) it is also refused when the
    qualification, the canary and pass 1, at their planning bounds, do not
    fit the remaining cap together. A whole-plan planning bound above a cap
    is printed and is not a refusal: passes 2 onwards are gated by
    `pass_gate` when they are reached.

    With `resuming` only the overrun test applies here: the runner gates
    the pass it resumes with `pass_gate`.

    A start that is allowed is not a promise that the stage finishes:
    see `pass_gate`. The gates decide whether to start; the reservation
    before every request is what holds the cap.

    `qualification` is `{"run_id", "panel"}` from a passed qualification
    record, or None. `qualification_note` says why a record on file was not
    used. The figures are printed whether or not the run is refused.

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
    remaining = {provider: Decimal(str(remaining_caps[provider])) for provider in providers}
    unit = first_unit(stage)
    label = unit_label(unit)
    first_units = units_up_to_pass_one(stage)
    first_label = " + ".join(unit_label(name) for name in first_units)

    refusals = overrun_refusals(config, overruns)
    whole_gate = {}
    for provider in providers:
        expected = ahead[provider]["expected"]
        figure = EXPECTED_MARGIN * expected
        whole_gate[provider] = {"expected_still_to_run": expected, "gate_figure": figure,
                                "remaining_cap": remaining[provider],
                                "ok": figure <= remaining[provider]}
        if not resuming and figure > remaining[provider]:
            refusals.append(
                "%s: whole-plan gate: %d x the expected cost of everything still to run "
                "(%s USD) is %s USD, above the remaining cap %s USD. Shorten the model list "
                "in the run config; do not lower a limit."
                % (provider, EXPECTED_MARGIN, _usd(expected), _usd(figure),
                   _usd(remaining[provider])))
    start_gate = {"unit": unit, "label": label}
    for provider in providers:
        bound = _unit_cells(plan, unit)[provider]["planning_bound"]
        start_gate[provider] = {"planning_bound": bound, "remaining_cap": remaining[provider],
                                "ok": bound <= remaining[provider]}
        if not resuming and bound > remaining[provider]:
            refusals.append(
                "%s: the planning bound of %s, %s USD, is above the remaining cap %s USD, "
                "so %s does not start."
                % (provider, label, _usd(bound), _usd(remaining[provider]), label))
    together_gate = {"units": first_units, "label": first_label}
    for provider in providers:
        bound = sum((_unit_cells(plan, name)[provider]["planning_bound"]
                     for name in first_units), ZERO)
        together_gate[provider] = {"planning_bound": bound,
                                   "remaining_cap": remaining[provider],
                                   "ok": bound <= remaining[provider]}
        if together and not resuming and len(first_units) > 1 and bound > remaining[provider]:
            refusals.append(
                "%s: %s at their planning bounds come to %s USD together, above the "
                "remaining cap %s USD."
                % (provider, first_label, _usd(bound), _usd(remaining[provider])))
    unit_total = sum((start_gate[provider]["planning_bound"] for provider in providers), ZERO)
    if not resuming and max_usd is not None and unit_total > Decimal(str(max_usd)):
        refusals.append(
            "--max-usd %s is below the planning bound of %s, %s USD"
            % (_usd(Decimal(str(max_usd))), label, _usd(unit_total)))
    result = dict(plan, stage=stage, whole_plan=whole, plan_still_to_run=ahead,
                  this_stage=this_stage, remaining_caps=remaining,
                  max_usd=None if max_usd is None else Decimal(str(max_usd)),
                  whole_plan_gate=whole_gate, start_gate=start_gate,
                  together_gate=together_gate, together=bool(together),
                  resuming=bool(resuming),
                  overruns={"on_file": {provider: sorted(ids) for provider, ids
                                        in sorted((overruns or {}).items()) if ids},
                            "unacknowledged": unacknowledged_overruns(config, overruns)},
                  planning_bound_above_cap=[
                      provider for provider in providers
                      if ahead[provider]["planning_bound"] > remaining[provider]],
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


def pass_gate(plan, slots, remaining_caps, number, passes, max_usd_left=None):
    """The gate before one pass starts, and before a pass is resumed.

    `plan` is from `build_plan` or `preflight`; `slots` are the slots of the
    pass still to run, each with `model_id` and `task_id`. The planning
    bound of the pass is every request of those slots once at its limit,
    input by the proven byte bound, plus the retry allowance. A slot marked
    `"judging_only": True` is one a resume only has to finish: its paid
    answer is on record and is never asked for again, so it is counted at
    the planning bound of its judging alone (every judge call of the slot,
    whether or not some verdicts are already on record). The pass
    starts only if that bound is at or below `remaining_caps[provider]` (the
    cap less the real settled spend and the open reservations) for every
    provider. `max_usd_left` is what is left of `--max-usd` for this run.

    What the gate says and does not say. It admits a pass that fits at one
    request per slot at its output limit plus 15% for retries. That makes
    finishing likely, not certain. A slot may use up to 3 model requests
    and each judge call 2; a timeout or a connection failure keeps its full
    reservation until it is reconciled; and judge input is planned on an
    assumed answer size. A pass that was admitted can therefore still run
    out of room. The run then ends `interrupted` or `incomplete` inside the
    cap and is not scored. The cap itself is never exceeded, because every
    request is reserved at its worst case before it is sent (`ledger.py`).

    Returns {"pass", "passes", "planning_bound", "remaining_caps", "ok",
    "provider", "reason", "lines"}; `provider` and `reason` name the first
    provider that is short. Nothing is sent or reserved here.
    """
    providers = sorted(remaining_caps)
    bound = dict.fromkeys(providers, ZERO)
    finishing = 0
    for slot in slots:
        if slot.get("judging_only"):
            finishing += 1
            cell = plan["slot_judging_bound"].get(slot["model_id"], {}).get(slot["task_id"], {})
        else:
            cell = plan["slot_planning_bound"][slot["model_id"]][slot["task_id"]]
        for provider, amount in cell.items():
            bound[provider] = bound.get(provider, ZERO) + amount
    remaining = {provider: Decimal(str(remaining_caps[provider])) for provider in providers}
    name = "pass %d of %d" % (number, passes)
    count = "%d slots to run" % len(slots)
    if finishing:
        count += (" (%d of them only to grade and judge: the paid answer is on record and "
                  "is not asked for again)" % finishing)
    lines = ["  %s, %s: planning bound %s" % (name, count, "; ".join(
        "%s %s USD against a remaining cap of %s USD"
        % (provider, _usd(bound[provider]), _usd(remaining[provider]))
        for provider in providers))]
    short = [provider for provider in providers if bound[provider] > remaining[provider]]
    reason, provider = None, None
    if short:
        provider = short[0]
        reason = "; ".join(
            "%s not started: the %s planning bound of this pass, %s USD, is above the "
            "remaining cap %s USD" % (name, item, _usd(bound[item]), _usd(remaining[item]))
            for item in short)
    elif max_usd_left is not None and sum(bound.values(), ZERO) > Decimal(str(max_usd_left)):
        reason = ("%s not started: the planning bound of this pass, %s USD, is above what is "
                  "left of --max-usd, %s USD"
                  % (name, _usd(sum(bound.values(), ZERO)), _usd(Decimal(str(max_usd_left)))))
    if reason:
        lines.append("  INCOMPLETE: %s. Finished passes are kept; the run is not scored."
                     % reason)
    else:
        lines.append("  " + PASS_GATE_NOTE % name)
    return {"pass": number, "passes": passes, "slots": len(slots), "finishing": finishing,
            "planning_bound": bound,
            "remaining_caps": remaining, "ok": reason is None, "provider": provider,
            "reason": reason, "lines": lines}


# Printed with every pass that is admitted, so that the gate is never read
# as a promise.
PASS_GATE_NOTE = (
    "%s is admitted: it fits at one request per slot at its output limit plus 15%% for "
    "retries. It is likely to finish, not certain to: a timeout or a connection failure "
    "keeps its full reservation until reconciled and can use up the room. The run would "
    "then end interrupted or incomplete, unscored, inside the cap. The cap is never "
    "exceeded: every request is reserved in full before it is sent.")


def _usd(amount):
    return str(amount.quantize(Decimal("0.0001")))


def _verdict(passed):
    return "ok" if passed else "ABOVE THE CAP"


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
    lines.append("  The planning bound is every request once at its output limit plus 15% "
                 "for retries. The absolute bound is for information only.")
    lines.append("  A stage or pass that fits its planning bound is likely to finish, not "
                 "certain to: timeouts and connection failures keep their full reservation "
                 "until reconciled and can use up the room. The run then ends interrupted "
                 "or incomplete, unscored, inside the cap. The cap is never exceeded.")
    lines.append("  Input in both bounds is the byte length of the text sent plus %d tokens "
                 "of framing per request: an upper bound on the tokens. An answer not yet "
                 "written is planned at %d bytes per token of its limit as judge input."
                 % (ledger.FRAMING_ALLOWANCE_TOKENS, ANSWER_BYTES_PER_TOKEN))
    lines.append("  The expected figure sizes input by a softer estimate and is never used "
                 "for a reservation or a planning-bound gate. It feeds the whole-plan gate "
                 "only.")

    passes = sorted(result["by_pass"])
    lines.append("  planning bound by stage and by pass (the full run is %d passes; pass n is "
                 "repeat n of every task for every model, with its judging):" % len(passes))
    lines.append("  %-16s" % "stage or pass" + "".join(" %16s" % p for p in providers))
    rows = [(stage, result["by_stage"][stage]) for stage in ("qualify", "canary")]
    rows += [("pass %d" % number, result["by_pass"][number]) for number in passes]
    rows.append(("full, all passes", result["by_stage"]["full"]))
    for name, cells in rows:
        lines.append("  %-16s" % name + "".join(
            " %16s" % _usd(cells[provider]["planning_bound"]) for provider in providers))
    lines.append("  expected cost by stage and by pass:")
    for name, cells in rows:
        lines.append("  %-16s" % name + "".join(
            " %16s" % _usd(cells[provider]["expected"]) for provider in providers))

    lines.append("  whole-plan gate: %d x the expected cost of stage %s and everything after "
                 "it, against the remaining cap:" % (EXPECTED_MARGIN, result["stage"]))
    for provider in providers:
        gate = result["whole_plan_gate"][provider]
        lines.append("  %-10s %d x %s = %s against %s: %s" % (
            provider, EXPECTED_MARGIN, _usd(gate["expected_still_to_run"]),
            _usd(gate["gate_figure"]), _usd(gate["remaining_cap"]), _verdict(gate["ok"])))
    start = result["start_gate"]
    lines.append("  planning-bound gate for %s, the next to start:" % start["label"])
    for provider in providers:
        gate = start[provider]
        lines.append("  %-10s %s against %s: %s" % (
            provider, _usd(gate["planning_bound"]), _usd(gate["remaining_cap"]),
            _verdict(gate["ok"])))
    both = result["together_gate"]
    if len(both["units"]) > 1:
        lines.append("  %s at their planning bounds together:" % both["label"])
        for provider in providers:
            gate = both[provider]
            lines.append("  %-10s %s against %s: %s" % (
                provider, _usd(gate["planning_bound"]), _usd(gate["remaining_cap"]),
                _verdict(gate["ok"])))
    for provider in result["planning_bound_above_cap"]:
        lines.append(
            "  %s: the planning bound of the plan still to run, %s USD, is above the "
            "remaining cap %s USD. That alone is not a refusal: the full run is gated one "
            "pass at a time, and a pass starts only if its own planning bound fits what is "
            "left of the cap." % (
                provider, _usd(result["plan_still_to_run"][provider]["planning_bound"]),
                _usd(result["remaining_caps"][provider])))
    open_ids = result["overruns"]["unacknowledged"]
    for provider, ids in sorted(result["overruns"]["on_file"].items()):
        for request in ids:
            lines.append("  overrun on file, %s: %s (%s)" % (
                provider, request,
                "not acknowledged" if request in open_ids.get(provider, ())
                else "acknowledged in the run config"))
    if not result["ok"]:
        lines.extend("  REFUSED: " + reason for reason in result["refusals"])
    elif result["resuming"]:
        lines.append("  Result: no overrun stands in the way of resuming. The pass gate "
                     "decides whether the pass starts.")
    elif result["together"]:
        lines.append(
            "  Result: the plan may start. The whole-plan gate holds and %s fit the "
            "remaining caps. Every later pass is gated when it is reached." % both["label"])
    else:
        lines.append("  Result: %s may start. Every later pass is gated when it is reached."
                     % start["label"])
    return lines
