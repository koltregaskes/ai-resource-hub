"""The runner: slots, requests, retries, judging and the live gate.

Slots and requests follow the method exactly:

- 3 slots per model per task, each a fresh conversation (one request holds
  the whole conversation: the prompt and nothing else).
- Up to 3 requests per slot: the first, plus 2 retries, for transport errors
  only (connection failure, HTTP 429, HTTP 5xx). A timeout is not retried.
- A slot whose requests run out stays failed, with outcome `execution_error`.
  Every request, its charge and its failure reason are kept.
- A truncated answer is kept, flagged and graded as it stands.
- One request is in flight at a time.
- Task order is shuffled per model with a recorded seed.

Grading is injected: `grade(task, reply)` returns
`{"outcome", "pass", "pending", "needs_judge": [...]}`. `needs_judge` lists
`"outcome"` and/or judged check ids. When it is not empty the runner asks
the judge panel, then calls `grade(task, reply, judged=...)` for the final
result if the grader accepts `judged`; otherwise a conservative fallback is
used. This module never imports the graders, except lazily in
`default_grade`.

Stages: `canary` (2 public tasks per model, 1 repeat; never published),
`qualify` (the judges against the frozen sample files) and `full`.

THE LIVE GATE. A live stage runs only if ALL of these hold:
  1. `LIVE_ENABLED` below is True (it ships False and changes only in a
     reviewed commit);
  2. `--live` was given;
  3. the config has `live_approved` true and `approved_by` filled in;
  4. the config has no `TO PIN BEFORE RUN` value and no other live blocker;
  5. `--key-file` was given;
  6. the environment holds no OPENAI_API_KEY or ANTHROPIC_API_KEY;
  7. the stage's earlier steps are on record in the private store;
  8. the pre-flight passes;
  9. the keys load from the key file.
With `LIVE_ENABLED = False`, a live request is refused before the key file
is read and before any transport exists.
"""

import hashlib
import inspect
import json
import math
import os
import random
import re
import time
from decimal import Decimal

try:
    from . import judges, keys as keys_module, ledger, preflight, providers, records
except ImportError:
    import judges
    import keys as keys_module
    import ledger
    import preflight
    import providers
    import records

LIVE_ENABLED = False

STAGES = ("canary", "qualify", "full")
STAGE_INDEX = "stages.jsonl"
_PASSES = []


class LiveRefused(Exception):
    """A live run was asked for and the gate is not fully open."""


class GraderUnavailable(Exception):
    """No grading function was supplied and the graders are not present."""


class _Stop(Exception):
    def __init__(self, reason, provider=None):
        super().__init__(reason)
        self.reason = reason
        self.provider = provider


# ---- the live gate -----------------------------------------------------

class LiveGatePass:
    """Proof that the live gate opened. Only `open_live_gate` makes one."""

    __slots__ = ("keys",)

    def __init__(self, loaded_keys):
        self.keys = loaded_keys

    def __repr__(self):
        return "<LiveGatePass>"


def _refuse_if_disabled():
    if LIVE_ENABLED is not True:
        raise LiveRefused(
            "live runs are switched off in this build: LIVE_ENABLED is False in runner.py "
            "and changes only in a reviewed commit")


def require_live_pass(gate_pass):
    """Used by the real transport: raise unless this pass came from the gate."""
    _refuse_if_disabled()
    if not any(gate_pass is issued for issued in _PASSES):
        raise LiveRefused("the real transport needs a pass from the live gate")


def _stage_history(private_store):
    path = os.path.join(os.fspath(private_store), STAGE_INDEX)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as stream:
        return [json.loads(line) for line in stream if line.strip()]


def _record_stage(private_store, entry):
    path = os.path.join(os.fspath(private_store), STAGE_INDEX)
    with open(path, "a", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(entry, sort_keys=True) + "\n")
        stream.flush()
        os.fsync(stream.fileno())


def _earlier_steps_missing(stage, config, private_store):
    """The canary is the first paid step. Qualification needs a finished
    live canary; the full run also needs both judges qualified."""
    if stage == "canary":
        return None
    history = [entry for entry in _stage_history(private_store) if entry.get("live")]
    if not any(entry.get("stage") == "canary" for entry in history):
        return "no finished live canary is on record; the canary is the first paid step"
    if stage == "full":
        panel = sorted(judge.model_id for judge in config.judges)
        if not any(entry.get("stage") == "qualify" and entry.get("qualified") is True
                   and sorted(entry.get("judges", [])) == panel for entry in history):
            return "the judges named in the config have not passed qualification"
    return None


def open_live_gate(*, live, config, key_file, tasks, stage, private_store, remaining_caps,
                   max_usd=None, checklist_samples=None, outcome_samples=None,
                   environ=None, tokeniser=None, out=print):
    """Check every live condition in order and return a `LiveGatePass`.

    The key file is read last, and only after everything else has passed.
    """
    _refuse_if_disabled()
    if live is not True:
        raise LiveRefused("--live was not given")
    if config.live_approved is not True or not config.approved_by.strip():
        raise LiveRefused("the run config is not approved: live_approved must be true and "
                          "approved_by must name who approved it")
    if config.live_blockers:
        raise LiveRefused("the run config is not ready for a live run: "
                          + "; ".join(config.live_blockers))
    if not key_file:
        raise LiveRefused("--key-file was not given")
    try:
        keys_module.assert_clean_environment(environ)
    except keys_module.EnvironmentNotClean as problem:
        raise LiveRefused(str(problem)) from None
    missing = _earlier_steps_missing(stage, config, private_store)
    if missing:
        raise LiveRefused(missing)
    result = preflight.preflight(config, tasks, remaining_caps, stage=stage, max_usd=max_usd,
                                 checklist_samples=checklist_samples,
                                 outcome_samples=outcome_samples, tokeniser=tokeniser, out=out)
    if not result["ok"]:
        raise LiveRefused("pre-flight refused: " + " | ".join(result["refusals"]))
    try:
        loaded = keys_module.load_keys(key_file, config.key_names)
    except (keys_module.KeyNotFound, keys_module.KeyFileError) as problem:
        raise LiveRefused(str(problem)) from None
    gate_pass = LiveGatePass(loaded)
    _PASSES.append(gate_pass)
    return gate_pass, result


# ---- dry-run transports ------------------------------------------------

def stub_reply(provider, model_id, prompt):
    """The deterministic reply used by dry runs."""
    if prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
        ids = re.findall(r"^- \[([^\]]+)\] ", prompt.rsplit("\nCHECKS\n", 1)[-1], re.MULTILINE)
        return json.dumps({"checks": {i: {"pass": True, "reason": "stub"} for i in ids}})
    if prompt.startswith(judges.OUTCOME_PROMPT[:60]):
        return json.dumps({"outcome": "answered", "reason": "stub"})
    return "stub answer " + hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:12]


def _prompt_of(request):
    if request.provider == "openai":
        return request.body["input"]
    return request.body["messages"][0]["content"]


def _shaped(provider, text, input_tokens, output_tokens):
    if provider == "openai":
        return {"status": "completed",
                "output": [{"type": "message",
                            "content": [{"type": "output_text", "text": text}]}],
                "usage": {"input_tokens": input_tokens, "output_tokens": output_tokens,
                          "input_tokens_details": {"cached_tokens": 0},
                          "output_tokens_details": {"reasoning_tokens": 0}}}
    return {"content": [{"type": "text", "text": text}], "stop_reason": "end_turn",
            "usage": {"input_tokens": input_tokens, "output_tokens": output_tokens,
                      "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0}}


class StubTransport:
    """A fake transport for dry runs. It never touches the network and never
    reads the key."""

    def __init__(self, responder=stub_reply):
        self.responder = responder
        self.calls = 0

    def __call__(self, request):
        self.calls += 1
        prompt = _prompt_of(request)
        text = self.responder(request.provider, request.body["model"], prompt)
        payload = _shaped(request.provider, text, math.ceil(len(prompt) / 3),
                          max(1, math.ceil(len(text) / 3)))
        return providers.Response(status=200, body=json.dumps(payload), elapsed_seconds=0.0)


class ReplayTransport:
    """Replays recorded fixtures: [{"model", "prompt_sha256", "status",
    "body"}]. A request with no fixture raises, so a gap is loud."""

    def __init__(self, fixtures):
        self.fixtures = {}
        for item in fixtures:
            self.fixtures.setdefault((item["model"], item["prompt_sha256"]), []).append(item)

    def __call__(self, request):
        digest = hashlib.sha256(_prompt_of(request).encode("utf-8")).hexdigest()
        queue = self.fixtures.get((request.body["model"], digest))
        if not queue:
            raise LookupError("no recorded fixture for this request")
        item = queue.pop(0) if len(queue) > 1 else queue[0]
        body = item["body"]
        return providers.Response(status=item.get("status", 200),
                                  body=body if isinstance(body, str) else json.dumps(body),
                                  elapsed_seconds=item.get("elapsed_seconds", 0.0))


# ---- grading -----------------------------------------------------------

def _accepts_judged(function):
    try:
        parameters = inspect.signature(function).parameters
    except (TypeError, ValueError):
        return False
    return "judged" in parameters or any(
        p.kind is inspect.Parameter.VAR_KEYWORD for p in parameters.values())


def fallback_resolve(task, first, judged):
    """Final result when the grader does not take the judges' verdicts.

    Conservative: anything it cannot decide stays pending.
    """
    outcome = first.get("outcome")
    passed = first.get("script_pass", first.get("pass"))
    answerable = task.get("answerable", True)
    judged_outcome = judged.get("outcome")
    if judged_outcome is not None:
        if judged_outcome == judges.UNRESOLVED:
            return {"outcome": judges.UNRESOLVED, "pass": None, "pending": True}
        outcome = judged_outcome
        if outcome == "abstained":
            return {"outcome": outcome, "pass": not answerable, "pending": False}
        if outcome == "refused":
            return {"outcome": outcome, "pass": False, "pending": False}
        if not answerable:
            return {"outcome": outcome, "pass": False, "pending": False}
        passed = first.get("pass_if_answered", passed)
    statuses = [s for s in judged.get("checks", {}).values() if s != judges.NOT_NEEDED]
    if any(status == judges.UNRESOLVED for status in statuses):
        return {"outcome": outcome, "pass": None, "pending": True}
    if any(status != judges.PASS for status in statuses):
        return {"outcome": outcome, "pass": False, "pending": False}
    if not isinstance(passed, bool):
        return {"outcome": outcome, "pass": None, "pending": True,
                "flags": ["grader_must_accept_judged"]}
    return {"outcome": outcome, "pass": passed, "pending": False}


def default_grade(task, reply, judged=None):
    """Grade with `core/outcome.py` when it is present. Imported lazily, so
    the run path does not depend on the graders."""
    try:
        try:
            from . import outcome as outcome_module
        except ImportError:
            import outcome as outcome_module
        decide = outcome_module.decide
    except (ImportError, AttributeError):
        raise GraderUnavailable(
            "no grader available: core/outcome.py with decide(task, reply) is not present. "
            "Pass a grade function, or merge the graders first.") from None
    if judged is None:
        return decide(task, reply)
    if _accepts_judged(decide):
        return decide(task, reply, judged=judged)
    return fallback_resolve(task, decide(task, reply), judged)


def stub_grade(task, reply, judged=None):
    """Plumbing-only grading for dry runs: every reply counts as answered,
    and every judged check goes to the (stub) judges."""
    if judged is None:
        ids = [check["id"] for check in judges.judged_checks(task)]
        return {"outcome": "answered", "pass": None if ids else True, "pending": bool(ids),
                "needs_judge": ids, "script_pass": True}
    return fallback_resolve(task, {"outcome": "answered", "script_pass": True}, judged)


# ---- the engine --------------------------------------------------------

def plan_slots(config, tasks, stage, seed, run_id):
    """Every slot of the stage, in run order: models in config order, tasks
    shuffled per model from the recorded seed, repeats in order."""
    if stage == "canary":
        chosen, repeats = preflight.canary_tasks(config, tasks), preflight.CANARY_REPEATS
    else:
        chosen, repeats = list(tasks), preflight.REPEATS
    slots = []
    for model in config.models:
        order = sorted(chosen, key=lambda task: task["id"])
        random.Random("%s/%s" % (seed, model.model_id)).shuffle(order)
        for task in order:
            for repeat in range(1, repeats + 1):
                slots.append({"slot_id": records.slot_id(run_id, model.model_id, task["id"], repeat),
                              "model_id": model.model_id, "task_id": task["id"],
                              "repeat": repeat})
    return slots


class _Engine:
    def __init__(self, *, config, tasks, stage, record, budget, transport, loaded_keys,
                 grade, clock, sleep, tokeniser):
        self.config = config
        self.tasks = {task["id"]: task for task in tasks}
        self.stage = stage
        self.record = record
        self.budget = budget
        self.transport = transport
        self.keys = loaded_keys
        self.grade = grade
        self.clock = clock
        self.sleep = sleep
        self.tokeniser = tokeniser
        self.adapters = {}

    def _secret(self, provider):
        if self.keys is None:
            return keys_module.Secret.placeholder()
        return self.keys.secret(provider)

    def _adapter(self, spec):
        key = (spec.role, spec.model_id)
        if key not in self.adapters:
            self.adapters[key] = providers.adapter_for(spec)
        return self.adapters[key]

    def _hooks(self, spec, prompt, limit, kind, id_for, trail):
        """The before-send and after-result steps shared by every request:
        reserve, write the record, then (after the reply) settle and record."""
        adapter = self._adapter(spec)

        def before_send(number):
            request = id_for(number)
            worst = ledger.worst_case_usd(
                ledger.count_input_tokens(prompt, self.tokeniser), limit, spec.price)
            self.budget.reserve(spec.provider, request, worst)
            self.record.request_sent(request, {
                "kind": kind, "model_id": spec.model_id, "provider": spec.provider,
                "reserved_usd": str(worst),
                "request": adapter.build_request(prompt, limit, self._secret(
                    spec.provider)).to_record()})

        def after_result(number, result):
            request = id_for(number)
            zero_reason = None
            if result.status in (providers.TRANSPORT_ERROR, providers.PROVIDER_ERROR) \
                    and result.http_status not in (None, 200):
                zero_reason = "http_error_not_billed"
            settled = self.budget.settle(spec.provider, request, result.billable, spec.price,
                                         zero_reason=zero_reason)
            self.record.request_done(request, {
                "result": result.to_record(), "charge_usd": str(settled["charge"]),
                "ledger_flags": settled["flags"], "reconciled": settled["reconciled"]})
            trail.append({
                "request_id": request, "status": result.status,
                "http_status": result.http_status, "error": result.error,
                "finish_reason": result.finish_reason, "charge_usd": str(settled["charge"]),
                "request_time_seconds": result.request_time_seconds, "usage": result.usage,
                "ledger_flags": settled["flags"]})

        return adapter, before_send, after_result

    def _judge_call(self, spec, base_id, kind, trail):
        """`call(prompt, attempt)` for one judge: a single request per
        attempt, through the same ledger and record as a model call."""
        def call(prompt, attempt):
            adapter, before_send, after_result = self._hooks(
                spec, prompt, spec.max_output_tokens, kind,
                lambda number: "%s/%d" % (base_id, attempt), trail)
            result = providers.call_with_retries(
                adapter, self.transport, prompt, spec.max_output_tokens,
                self._secret(spec.provider), max_requests=1, before_send=before_send,
                after_result=after_result, clock=self.clock)[-1]
            if result.status != providers.OK:
                raise judges.JudgeCallFailed(result.error or result.status)
            return result.text
        return call

    def _judge(self, slot, task, reply, needs, trail):
        wants_outcome = "outcome" in needs
        known = {check["id"]: check for check in judges.judged_checks(task)}
        checks = []
        for item in needs:
            if item == "outcome":
                continue
            if isinstance(item, dict):
                checks.append({"id": str(item["id"]), "text": str(item.get("text", ""))})
            elif item in known:
                checks.append(known[item])
            else:
                raise ValueError("grader asked for an unknown judged check on " + task["id"])
        judged = {"outcome": None, "checks": {}, "detail": {}}

        def call_for(kind):
            return lambda spec: self._judge_call(
                spec, "%s/judge/%s/%s" % (slot, spec.model_id, kind), kind, trail)

        if wants_outcome:
            result = judges.classify_outcome(self.config.judges, task["prompt"], reply,
                                             call_for("outcome_classification"))
            judged["outcome"] = result["outcome"]
            judged["detail"]["outcome"] = result["judges"]
        if checks:
            if judged["outcome"] in ("abstained", "refused"):
                judged["checks"] = {check["id"]: judges.NOT_NEEDED for check in checks}
            elif judged["outcome"] == judges.UNRESOLVED:
                judged["checks"] = {check["id"]: judges.UNRESOLVED for check in checks}
            else:
                result = judges.judge_checklist(self.config.judges, task["prompt"], reply,
                                                checks, call_for("checklist_judging"))
                judged["checks"] = result["checks"]
                judged["detail"]["checklist"] = result["judges"]
        return judged

    def _final_grade(self, task, reply, first, judged):
        if _accepts_judged(self.grade):
            return self.grade(task, reply, judged=judged)
        return fallback_resolve(task, first, judged)

    def model_slot(self, model, task, repeat):
        slot = records.slot_id(self.record.run_id, model.model_id, task["id"], repeat)
        prompt = task["prompt"]
        limit = task["max_output_tokens"]
        trail = []
        judge_trail = []
        row = {
            "slot_id": slot, "model_id": model.model_id, "provider": model.provider,
            "task_id": task["id"], "family": task["family"], "split": task["split"],
            "repeat": repeat, "prompt": prompt, "reply": None, "outcome": None, "pass": None,
            "pending": False, "truncated": False, "finish_reason": None, "flags": [],
            "tokens": None, "timing": {"slot_time_seconds": None, "first_token_seconds": None},
            "judged": None, "needed_judge_classification": False,
        }
        adapter, before_send, after_result = self._hooks(
            model, prompt, limit, "model", lambda number: records.request_id(slot, number), trail)
        stop = None
        results = []
        try:
            results = providers.call_with_retries(
                adapter, self.transport, prompt, limit, self._secret(model.provider),
                before_send=before_send, after_result=after_result, sleep=self.sleep,
                clock=self.clock)
        except ledger.CapExceeded as cap:
            if not trail:
                raise _Stop("interrupted by cap: " + str(cap), cap.provider) from None
            stop = _Stop("interrupted by cap: " + str(cap), cap.provider)
            row["flags"].append("retry_refused_by_cap")
        last = results[-1] if results else None
        if last is not None and last.status == providers.OK:
            row.update(reply=last.text, truncated=last.truncated,
                       finish_reason=last.finish_reason, tokens=last.usage)
            row["timing"] = {"slot_time_seconds": last.request_time_seconds,
                             "first_token_seconds": last.first_token_seconds}
            row["flags"].extend(last.flags)
            first = self.grade(task, last.text)
            final = first
            needs = list(first.get("needs_judge") or [])
            if needs:
                row["needed_judge_classification"] = "outcome" in needs
                try:
                    judged = self._judge(slot, task, last.text, needs, judge_trail)
                    row["judged"] = judged
                    final = self._final_grade(task, last.text, first, judged)
                except ledger.CapExceeded as cap:
                    stop = _Stop("interrupted by cap: " + str(cap), cap.provider)
                    final = {"outcome": first.get("outcome"), "pass": None, "pending": True}
                    row["flags"].append("judging_refused_by_cap")
            row.update(outcome=final.get("outcome"), pending=bool(final.get("pending")))
            row["pass"] = final.get("pass")
            row["flags"].extend(final.get("flags", []))
        else:
            # No gradable answer: retries ran out, a timeout or a provider error.
            row.update(outcome="execution_error", pending=False)
            row["pass"] = False
            row["failure_reason"] = trail[-1]["error"] if trail else None
            row["failure_class"] = trail[-1]["status"] if trail else None
        row["requests"] = trail
        row["judge_requests"] = judge_trail
        row["cost_usd"] = str(sum((Decimal(item["charge_usd"]) for item in trail), Decimal(0)))
        row["judge_cost_usd"] = str(sum((Decimal(item["charge_usd"]) for item in judge_trail),
                                        Decimal(0)))
        self.record.slot_done(row)
        if stop:
            raise stop
        return row

    def qualify(self, checklist_samples, outcome_samples):
        problems = (judges.check_checklist_samples(checklist_samples, self.tasks)
                    + judges.check_outcome_samples(outcome_samples))
        results = {}
        for judge in self.config.judges:
            trail = []
            base = "%s/qualify/%s" % (self.record.run_id, judge.model_id)
            checklist_verdicts = {}
            for sample in checklist_samples:
                task = self.tasks[sample["task_id"]]
                checks = judges.judged_checks(task)
                ids = [check["id"] for check in checks]
                verdict, _ = judges.ask(
                    self._judge_call(judge, "%s/checklist/%s" % (base, sample["sample_id"]),
                                     "judge_qualification", trail),
                    judges.build_checklist_prompt(task["prompt"], sample["answer"], checks),
                    lambda text, ids=ids: judges.parse_checklist_verdict(text, ids))
                checklist_verdicts[sample["sample_id"]] = None if verdict is None else {
                    check_id: item["pass"] for check_id, item in verdict.items()}
            outcome_verdicts = {}
            for sample in outcome_samples:
                task = self.tasks[sample["task_id"]]
                verdict, _ = judges.ask(
                    self._judge_call(judge, "%s/outcome/%s" % (base, sample["sample_id"]),
                                     "judge_qualification", trail),
                    judges.build_outcome_prompt(task["prompt"], sample["reply"]),
                    judges.parse_outcome_verdict)
                outcome_verdicts[sample["sample_id"]] = None if verdict is None \
                    else verdict["outcome"]
            checklist_score = judges.score_checklist_qualification(
                checklist_samples, checklist_verdicts)
            outcome_score = judges.score_outcome_qualification(outcome_samples, outcome_verdicts)
            results[judge.model_id] = {
                "provider": judge.provider, "checklist": checklist_score,
                "outcome": outcome_score,
                "qualified": checklist_score["passed"] and outcome_score["passed"],
                "checklist_verdicts": checklist_verdicts, "outcome_verdicts": outcome_verdicts,
                "cost_usd": str(sum((Decimal(i["charge_usd"]) for i in trail), Decimal(0))),
                "requests": len(trail),
            }
        return {"sample_set_problems": problems, "judges": results,
                "qualified": not problems and all(r["qualified"] for r in results.values())}


def _ledgers(config, private_store, live, run_id):
    """Live ledgers are shared across runs. A dry run gets its own, so a
    rehearsal can never eat into the real caps."""
    if live:
        folder = os.path.join(os.fspath(private_store), "ledgers")
    else:
        folder = os.path.join(os.fspath(private_store), "ledgers-dry", run_id)
    return {provider: ledger.ProviderLedger(provider, cap,
                                            os.path.join(folder, provider + ".jsonl"))
            for provider, cap in config.caps_usd.items()}


def run_stage(stage, config, tasks, *, private_store, grade=None, live=False, key_file=None,
              max_usd=None, seed=None, checklist_samples=None, outcome_samples=None,
              transport=None, scores=None, clock=time.monotonic, sleep=None, out=print,
              environ=None, tokeniser=None, live_transport_factory=None):
    """Run one stage and return a summary.

    Without `live=True` this is a dry run: the transport is a fake (the
    deterministic stub unless one is passed in), the key file is never
    read even if a path was given, and nothing is publishable.

    `scores(rows, tasks)` is injected and called only when the run can be
    finalised. `grade` defaults to `default_grade`.
    """
    if stage not in STAGES:
        raise ValueError("unknown stage: " + str(stage))
    if live:
        _refuse_if_disabled()
    tasks = preflight.normalise_tasks(tasks)
    judges.assert_panel(config.judges)
    for model in config.models:
        judges.assert_panel(config.judges, model.provider)
    if stage == "qualify" and (checklist_samples is None or outcome_samples is None):
        raise ValueError("the qualify stage needs both sample files")
    if not private_store:
        raise ValueError("a private store path is needed for the run record")
    grade = grade or default_grade
    run_id = records.new_run_id()
    seed = seed if seed is not None else random.SystemRandom().randrange(2 ** 32)
    books = _ledgers(config, private_store, live, run_id)
    remaining = {provider: book.remaining for provider, book in books.items()}
    loaded = None
    if live:
        gate_pass, plan = open_live_gate(
            live=live, config=config, key_file=key_file, tasks=tasks, stage=stage,
            private_store=private_store, remaining_caps=remaining, max_usd=max_usd,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples,
            environ=environ, tokeniser=tokeniser, out=out)
        loaded = gate_pass.keys
        transport = (live_transport_factory or providers.UrllibTransport)(gate_pass)
        sleep = sleep or time.sleep
    else:
        plan = preflight.enforce(preflight.preflight(
            config, tasks, remaining, stage=stage, max_usd=max_usd,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples,
            tokeniser=tokeniser, out=out))
        transport = transport or StubTransport()
    record = records.RunRecord(private_store, run_id, stage, {
        "live": bool(live), "task_set_version": config.task_set_version, "seed": seed,
        "config_sha256": config.sha256,
        "settings": [model.public() for model in config.models],
        "judge_settings": [judge.public() for judge in config.judges],
        "max_usd": None if max_usd is None else str(max_usd),
        "preflight": {"whole_plan": plan["whole_plan"], "requests": plan["requests"],
                      "counts": plan["counts"]},
    }, guard=loaded.leaks_into if loaded is not None else None)
    budget = ledger.Budget(books, run_id, max_usd=max_usd)
    engine = _Engine(config=config, tasks=tasks, stage=stage, record=record, budget=budget,
                     transport=transport, loaded_keys=loaded, grade=grade, clock=clock,
                     sleep=sleep, tokeniser=tokeniser)
    summary = {"run_id": run_id, "stage": stage, "live": bool(live), "seed": seed,
               "preflight": plan, "qualification": None, "finalised": None}
    try:
        if stage == "qualify":
            record.plan([])
            qualification = engine.qualify(checklist_samples, outcome_samples)
            record.write_json("qualification.json", qualification)
            summary["qualification"] = qualification
        else:
            slots = plan_slots(config, tasks, stage, seed, run_id)
            record.plan(slots)
            by_model = {model.model_id: model for model in config.models}
            by_task = {task["id"]: task for task in tasks}
            for slot in slots:
                engine.model_slot(by_model[slot["model_id"]], by_task[slot["task_id"]],
                                  slot["repeat"])
    except _Stop as stop:
        record.mark_interrupted(stop.reason, stop.provider)
    except ledger.CapExceeded as cap:
        record.mark_interrupted("interrupted by cap: " + str(cap), cap.provider)
    except BaseException:
        record.mark_interrupted("stopped by an error in the harness")
        record.close()
        raise
    if record.status != "interrupted" and not record.pending_slots():
        rows = [record.rows[slot["slot_id"]] for slot in record.planned]
        computed = scores(rows, tasks) if scores is not None else None
        summary["finalised"] = record.finalise(computed)
        if live:
            entry = {"stage": stage, "run_id": run_id, "live": True,
                     "judges": [judge.model_id for judge in config.judges],
                     "config_sha256": config.sha256}
            if stage == "qualify":
                entry["qualified"] = summary["qualification"]["qualified"]
            _record_stage(private_store, entry)
    else:
        record.close()
    summary.update(status=record.status, publishable=record.publishable,
                   report=record.report(), dir=record.dir,
                   remaining_caps=budget.remaining(),
                   run_committed_usd=budget.run_committed())
    return summary
