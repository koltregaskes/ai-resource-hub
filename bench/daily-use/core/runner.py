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
- The full run goes one pass at a time. Pass n is repeat n of every task
  for every model, and each slot is judged before the next slot starts, so
  the whole of pass n, judging included, is done before pass n + 1 starts.
  Before each pass, and when a run is resumed, `preflight.pass_gate` tests
  the planning bound of the pass against what is left of each cap. A pass
  that does not fit is not started: the run ends `incomplete`, the finished
  passes are kept, and a run with fewer than all its passes is never
  finalised or scored. A pass that is admitted is likely to finish, not
  certain to: timeouts and connection failures keep their full reservation
  and can use up the room, and the run then ends `interrupted` or
  `incomplete` inside the cap, unscored.
- A stopped run is resumed with `resume=<run id>`. It carries on in the
  planned order; a slot that has a final row is left alone and a request id
  that is in the log is never issued again. In each pass the resume first
  finishes the slots that already hold a paid answer (an answer with no
  row, or a row left pending on the grader or the judges): the answer is
  graded and judged from the record and the model is never asked again.
  Only then are the unsent slots of the pass sent. The caps a run starts
  with are written in its record; a resume may lower a cap and is refused
  if it would raise one.
- No billed call is made twice by the harness. A response is written to
  the run log (`received`) before the ledger is settled, and a resume
  finishes such a request from the log. A request that was sent and has no
  response on record may have been billed: it blocks its slot or its judge
  call until a person reconciles it (`cli.py reconcile`).
- A judge call (one slot, one judge, one kind of judging) has
  `judges.ATTEMPTS_PER_JUDGE_CALL` requests for the whole life of the run,
  resumes included.
- One run at a time owns a private store (`ledger.StoreLock`). A second
  start or resume, dry or live, is refused while the first is running.

Grading is injected: `grade(task, reply)` returns
`{"outcome", "pass", "pending", "needs_judge": [...]}`, and may add
`"checks"`, a list of `{"id", "by", "state"}`. `needs_judge` lists
`"outcome"` and/or judged checks (ids, or `{"id", "text"}`). When it is not
empty the runner asks the judge panel, then calls
`grade(task, reply, judged=...)` for the final result if the grader accepts
`judged`; otherwise a conservative fallback is used. This module never
imports the other bench modules at the top: `default_grade` and
`default_scores` import `core/outcome.py`, `core/graders.py` and
`core/scores.py` lazily, and say so plainly when they are absent.

Stages, in order: `qualify` (every judge candidate against the frozen
sample files; names the panel), `canary` (2 public tasks per model, 1
repeat, judged by the qualified panel; never published) and `full`.

THE LIVE GATE. A live stage runs only if ALL of these hold:
  1. `LIVE_ENABLED` below is True (it ships False and changes only in a
     reviewed commit);
  2. `--live` was given;
  3. the config has `live_approved` true and `approved_by` filled in;
  4. the config has no `TO PIN BEFORE RUN` value and no other live blocker;
  5. `--key-file` was given;
  6. the environment holds no OPENAI_API_KEY or ANTHROPIC_API_KEY (checked
     first of all, and for dry runs too: see below);
  7. the stage's earlier steps are on record in the private store: the
     canary and the full run need a passed judge qualification record that
     still stands (same sample files, same task set version, and a panel
     equal to the config's judges); the full run also needs a finished
     canary judged by that panel;
  8. the pre-flight passes;
  9. the keys load from the key file.
With `LIVE_ENABLED = False`, a live request is refused before the key file
is read and before any transport exists.

Two rules hold for every start, dry or live, and come before all of the
above:
- `run_stage` and `open_live_gate` refuse, before anything else is read,
  while OPENAI_API_KEY or ANTHROPIC_API_KEY is set in the environment.
- If a settled charge is ever above its reservation, the ledger records it,
  nothing more is sent, and the run ends interrupted (a non-zero exit).
  While such a charge is on file, every later start of any stage or pass is
  refused until the run config names the request in `acknowledged_overruns`.
"""

import hashlib
import importlib
import inspect
import json
import os
import random
import re
import sys
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

# The live switch. True since the run-config PR of 15 November 2026: the owner
# typed his go for the paid runs that day (caps 90 USD OpenAI, 60 USD
# Anthropic), and this line was changed in a reviewed commit. Every other gate
# still applies to every live start: --live, live_approved and approved_by in
# the config, a key file, no provider key in the environment, the earlier
# stages on record, and the pre-flight.
LIVE_ENABLED = True

STAGES = ("qualify", "canary", "full")
STAGE_INDEX = "stages.jsonl"
QUALIFICATION_DIR = "qualification"
# The audit line for a request that a resume finished from its received line.
RECOVERED_EVENT = "received_request_finished_on_resume"
# Row flags: a judge call that sends nothing on a resume.
AWAITING_FLAG = "judge_request_awaiting_reconciliation"
EXHAUSTED_FLAG = "judge_attempts_exhausted"
QUALIFICATION_RECORD = "judge-qualification"
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
_PASSES = []


class LiveRefused(Exception):
    """A live run was asked for and the gate is not fully open. Also raised
    for any run, dry or live, while another run holds the private store's
    execution lock."""


class GraderUnavailable(Exception):
    """No grading function was supplied and the graders are not present."""


class ScorerUnavailable(Exception):
    """No scoring function was supplied and `core/scores.py` is not present."""


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


def _stage_entry(stage, run_id, config, qualification_run_id):
    """The stage index entry of a finished live canary or full run."""
    return {"stage": stage, "run_id": run_id, "live": True,
            "judges": [judge.model_id for judge in config.judges],
            "config_sha256": config.sha256,
            "qualification_run_id": qualification_run_id}


def _stage_history(private_store):
    path = os.path.join(os.fspath(private_store), STAGE_INDEX)
    if not os.path.exists(path):
        return []
    with ledger._file_lock(path + ".lock"):
        return _read_stage_history(path)


def _read_stage_history(path):
    # The stage lock also covers prerequisite reads outside a running store.
    ledger.recover_torn_tail(path)
    with open(path, encoding="utf-8") as stream:
        return [json.loads(line) for line in stream if line.strip()]


def _record_stage(private_store, entry):
    """Add a finished live stage to the index. A run id that is already
    listed is not listed again, so this can be repeated after a crash."""
    path = os.path.join(os.fspath(private_store), STAGE_INDEX)
    with ledger._file_lock(path + ".lock"):
        history = _read_stage_history(path) if os.path.exists(path) else []
        if any(listed.get("run_id") == entry["run_id"] for listed in history):
            return
        with open(path, "a", encoding="utf-8", newline="\n") as stream:
            stream.write(json.dumps(entry, sort_keys=True) + "\n")
            stream.flush()
            os.fsync(stream.fileno())


# ---- the judge qualification record -------------------------------------

def content_sha256(value):
    """SHA-256 of a JSON value in one fixed spelling."""
    text = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sample_hashes(checklist_samples, outcome_samples, given=None):
    """The SHA-256 of each sample set, or None for one that was not supplied.

    The command line passes the hash of each file's bytes in `given`. A
    caller that passes parsed samples without `given` gets the hash of
    their content instead.
    """
    given = dict(given or {})
    hashes = {}
    for kind, samples in (("checklist", checklist_samples), ("outcome", outcome_samples)):
        hashes[kind] = None if samples is None else (given.get(kind) or content_sha256(samples))
    return hashes


def _panel_entry(spec):
    return {"provider": spec.provider, "model_id": spec.model_id,
            "settings_sha256": spec.settings_sha256()}


def build_qualification_record(config, qualification, hashes, checklist_samples,
                               outcome_samples, run_id, live, run_manifest_sha256):
    """The signed-off record of one qualification run.

    It holds, per candidate: the judge model id, the fingerprint of its
    settings, its price sum and every agreement figure with pass or fail;
    the SHA-256 of both sample files; the thresholds; the panel; the date;
    and who signed off the run config. `record_sha256` covers the rest of
    the record, so an edited record is not accepted.
    """
    candidates = []
    for spec in config.all_judge_candidates():
        result = qualification["candidates"].get(spec.model_id)
        if result is None:
            continue
        candidates.append(dict(
            _panel_entry(spec), price_sum_per_mtok=str(judges.price_sum(spec)),
            checklist=result["checklist"], outcome=result["outcome"],
            passed=result["qualified"], requests=result["requests"],
            cost_usd=result["cost_usd"]))
    record = {
        "record": QUALIFICATION_RECORD, "version": 1, "run_id": run_id, "live": bool(live),
        "date_utc": records.stamp(), "signed_off_by": config.approved_by,
        "task_set_version": config.task_set_version, "thresholds": dict(judges.THRESHOLDS),
        "samples": {
            "checklist": {"sha256": hashes["checklist"], "samples": len(checklist_samples)},
            "outcome": {"sha256": hashes["outcome"], "samples": len(outcome_samples)}},
        "sample_set_problems": list(qualification["sample_set_problems"]),
        "candidates": candidates, "panel": qualification["panel"],
        "passed": bool(qualification["qualified"]),
        "failures": list(qualification["failures"]),
        "run_manifest_sha256": run_manifest_sha256,
    }
    record["record_sha256"] = content_sha256(record)
    return record


def write_qualification_record(private_store, record, guard=None):
    """Write the record once, in its own tree beside `runs/`."""
    folder = os.path.join(os.fspath(private_store), QUALIFICATION_DIR)
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, record["run_id"] + ".json")
    text = json.dumps(record, sort_keys=True, indent=2, ensure_ascii=False) + "\n"
    if guard is not None and guard(text):
        raise records.RecordError("a key value was about to be written to the qualification "
                                  "record; refused")
    if os.path.exists(path):
        raise FileExistsError("the qualification record is written once: "
                              + os.path.basename(path))
    records.atomic_write(path, text.encode("utf-8"))
    return path


def read_qualification_record(private_store, run_id):
    """Return (record, None), or (None, why it cannot be used)."""
    path = os.path.join(os.fspath(private_store), QUALIFICATION_DIR, str(run_id) + ".json")
    try:
        with open(path, encoding="utf-8") as stream:
            record = json.load(stream)
    except OSError:
        return None, "the qualification record for run %s is missing" % run_id
    except ValueError:
        return None, "the qualification record for run %s is not readable" % run_id
    if not isinstance(record, dict) or record.get("record") != QUALIFICATION_RECORD:
        return None, "the qualification record for run %s is not readable" % run_id
    body = {name: value for name, value in record.items() if name != "record_sha256"}
    if record.get("record_sha256") != content_sha256(body) or record.get("run_id") != run_id:
        return None, ("the qualification record for run %s has been changed since it was "
                      "written" % run_id)
    return record, None


def check_qualification(config, private_store, hashes, need_samples=True):
    """Find the latest live judge qualification and test that it still stands.

    Returns (record, None) when it does, or (None, why not). It stands when:
    the record is intact; it passed and names a panel; the task set version
    is the same; both sample files have the SHA-256 the judges were
    qualified against; and the config's `judges` are that panel, model id
    and settings alike. `hashes` comes from `sample_hashes`. With
    `need_samples` false a sample file that was not supplied is not
    compared (used for planning figures only, never by the live gate).
    """
    entries = [entry for entry in _stage_history(private_store)
               if entry.get("live") and entry.get("stage") == "qualify"]
    if not entries:
        return None, ("no judge qualification is on record; qualification is the first "
                      "paid step")
    run_id = entries[-1].get("run_id")
    record, problem = read_qualification_record(private_store, run_id)
    if record is None:
        return None, problem
    if record.get("live") is not True:
        return None, "the qualification record for run %s is not from a live run" % run_id
    if record.get("passed") is not True or not record.get("panel"):
        return None, ("the latest judge qualification (run %s) did not pass, so there is no "
                      "panel: %s" % (run_id, "; ".join(record.get("failures") or [])
                                     or "see the record"))
    if record.get("task_set_version") != config.task_set_version:
        return None, ("the task set version has changed since judge qualification (run %s); "
                      "the record no longer stands, so qualify again" % run_id)
    for kind, option in (("checklist", "--checklist-samples"), ("outcome", "--outcome-samples")):
        current = (hashes or {}).get(kind)
        if current is None:
            if need_samples:
                return None, ("give %s so that the qualification record can be checked "
                              "against the sample file" % option)
            continue
        if current != record["samples"][kind]["sha256"]:
            return None, ("the %s samples file has changed since judge qualification (run "
                          "%s); the record no longer stands, so qualify again" % (kind, run_id))
    panel = {entry["provider"]: entry for entry in record["panel"]}
    named = {judge.provider: judge for judge in config.judges}
    if set(panel) != set(named) or any(
            panel[provider]["model_id"] != judge.model_id for provider, judge in named.items()):
        return None, (
            "the config's judges (%s) differ from the panel named by judge qualification "
            "run %s (%s); set judges to that panel, or qualify again" % (
                ", ".join(sorted(judge.model_id for judge in config.judges)), run_id,
                ", ".join(sorted(entry["model_id"] for entry in record["panel"]))))
    for provider, judge in sorted(named.items()):
        if panel[provider]["settings_sha256"] != judge.settings_sha256():
            return None, ("the settings of judge %s have changed since it was qualified "
                          "(run %s); the record no longer stands, so qualify again"
                          % (judge.model_id, run_id))
    return record, None


def _earlier_steps_missing(stage, config, private_store, hashes):
    """Qualification is the first paid step. The canary needs a passed
    qualification that still stands; the full run needs that and a finished
    live canary judged by the same panel. Returns (problem, record)."""
    if stage == "qualify":
        return None, None
    record, problem = check_qualification(config, private_store, hashes)
    if record is None:
        return problem, None
    if stage == "full" and not any(
            entry.get("live") and entry.get("stage") == "canary"
            and entry.get("qualification_run_id") == record["run_id"]
            for entry in _stage_history(private_store)):
        return ("no finished live canary is on record for judge qualification run %s; "
                "run the canary after qualifying" % record["run_id"]), None
    return None, record


def open_live_gate(*, live, config, key_file, tasks, stage, private_store, remaining_caps,
                   max_usd=None, checklist_samples=None, outcome_samples=None,
                   environ=None, out=print, hashes=None, overruns=None, resuming=False):
    """Check every live condition in order and return
    (`LiveGatePass`, pre-flight result, qualification record or None).

    The environment is checked first, before anything else is looked at.
    The key file is read last, and only after everything else has passed.
    """
    try:
        keys_module.assert_clean_environment(environ)
    except keys_module.EnvironmentNotClean as problem:
        raise LiveRefused(str(problem)) from None
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
    if hashes is None:
        hashes = sample_hashes(checklist_samples, outcome_samples)
    missing, qualified = _earlier_steps_missing(stage, config, private_store, hashes)
    if missing:
        raise LiveRefused(missing)
    result = preflight.preflight(
        config, tasks, remaining_caps, stage=stage, max_usd=max_usd,
        checklist_samples=checklist_samples, outcome_samples=outcome_samples,
        out=out, environ=environ, overruns=overruns, resuming=resuming,
        qualification=None if qualified is None else {
            "run_id": qualified["run_id"], "panel": config.judges},
        qualification_note="this is the qualification stage" if stage == "qualify" else None)
    if not result["ok"]:
        raise LiveRefused("pre-flight refused: " + " | ".join(result["refusals"]))
    try:
        loaded = keys_module.load_keys(key_file, config.key_names)
    except (keys_module.KeyNotFound, keys_module.KeyFileError) as problem:
        raise LiveRefused(str(problem)) from None
    gate_pass = LiveGatePass(loaded)
    _PASSES.append(gate_pass)
    return gate_pass, result, qualified


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


STUB_BYTES_PER_USAGE_TOKEN = 4


def _stub_usage(text):
    """The usage figure the fake provider reports for a text: made up, one
    token per 4 bytes. It is what a dry run is "charged"; no reservation or
    bound is ever worked out from it."""
    return max(1, len(text.encode("utf-8", "surrogatepass")) // STUB_BYTES_PER_USAGE_TOKEN)


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
        payload = _shaped(request.provider, text, _stub_usage(prompt), _stub_usage(text))
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


# ---- the seam with the other bench modules -------------------------------
#
# Nothing below is imported at the top of this module. The other modules
# may not be present, and the run path must load without them.
#
#   core.tasks.load_tasks(public_dir, held_out_dir=None)   used by cli.py
#   core.outcome.decide(task, reply, judge_verdicts=None)
#       -> {"outcome", "pass", "pending", "detail"}; detail["pending_on"]
#          lists "outcome" and/or "checklist", and detail["needs_judge"]
#          lists the judged checks still needed as {"check_id", "text"}
#   core.graders.grade(task, reply) -> a result with `.checks`, each with
#       `.id`, `.by` ("script" or "judge") and `.status`
#   core.graders.apply_judge_verdicts(result, verdicts_by_judge)
#       verdicts_by_judge = {judge model id: {check id: true or false}}
#   core.scores.score_run(slot_records)

CHECK_STATES = ("pass", "fail", "disputed", "unresolved", "unresolved-final")
# From a grader's check status, or a judged status, to the state that
# scores.py reads. A check that was never run is left out of the list.
_CHECK_STATE = {
    "passed": "pass", "failed": "fail", "disputed": "disputed",
    "judge_unresolved": "unresolved", "needs_judge": "unresolved",
    judges.PASS: "pass", judges.FAIL: "fail",
}
_decision_memo = {}


def _bench_module(name, missing):
    """Import `core/<name>.py` lazily, as part of the `core` package."""
    package = __package__
    if not package:
        package = os.path.basename(CORE_DIR)
        parent = os.path.dirname(CORE_DIR)
        if parent not in sys.path:
            sys.path.insert(0, parent)
    try:
        return importlib.import_module("%s.%s" % (package, name))
    except ImportError as problem:
        raise missing("core/%s.py is not present or does not load (%s)"
                      % (name, type(problem).__name__)) from None


def optional_module(name):
    """`core/<name>.py` when it is present, else None."""
    try:
        return _bench_module(name, ImportError)
    except ImportError:
        return None


def _outcome_module():
    try:
        module = _bench_module("outcome", GraderUnavailable)
        module.decide
    except (GraderUnavailable, AttributeError):
        raise GraderUnavailable(
            "no grader available: core/outcome.py with decide(task, reply) is not present. "
            "Pass a grade function, or merge the graders first.") from None
    return module


def _check_list(graded):
    """A grader result's checks as [{"id", "by", "state"}]."""
    listed = []
    for check in getattr(graded, "checks", None) or []:
        state = _CHECK_STATE.get(check.status)
        if state is not None:
            listed.append({"id": str(check.id), "by": check.by, "state": state})
    return listed


def verdicts_by_judge(judged):
    """The panel's checklist verdicts as {judge model id: {check id: bool}},
    the shape `core.graders.apply_judge_verdicts` takes. A judge that was
    unresolved has no verdicts, which leaves its checks unresolved."""
    verdicts = {}
    for item in ((judged or {}).get("detail") or {}).get("checklist") or []:
        verdict = item.get("verdict")
        verdicts[item["judge"]] = {} if verdict is None else {
            check_id: entry["pass"] for check_id, entry in verdict.items()}
    return verdicts


def resolve_outcome(task, first, judged_outcome):
    """Final result for a reply whose outcome went to the judges.

    The method's mapping: on a task with no knowable answer only
    `abstained` passes. On an answerable task the grader has already
    rejected the reply, so the pass stays as the grader left it and only
    the outcome label comes from the judges.
    """
    if judged_outcome not in judges.JUDGE_OUTCOMES:
        return {"outcome": judges.UNRESOLVED, "pass": None, "pending": True}
    if not task.get("answerable", True):
        return {"outcome": judged_outcome, "pass": judged_outcome == "abstained",
                "pending": False}
    passed = first.get("pass")
    if not isinstance(passed, bool):
        return {"outcome": judged_outcome, "pass": None, "pending": True,
                "flags": ["grader_left_pass_open"]}
    return {"outcome": judged_outcome, "pass": passed, "pending": False}


def _from_decision(decision):
    detail = decision.get("detail") or {}
    pending_on = list(detail.get("pending_on") or [])
    needs = ["outcome"] if "outcome" in pending_on else []
    if "checklist" in pending_on:
        needs.extend({"id": str(item["check_id"]), "text": str(item.get("text", ""))}
                     for item in detail.get("needs_judge") or [])
    return {"outcome": decision.get("outcome"), "pass": decision.get("pass"),
            "pending": bool(decision.get("pending")), "needs_judge": needs, "detail": detail}


def default_grade(task, reply, judged=None):
    """Grade with `core/outcome.py` and `core/graders.py` when present.

    First call: `decide(task, reply)`. If it is pending on the outcome or
    on judged checks, the runner asks the panel and calls again with
    `judged`. The checklist verdicts then go back through
    `decide(task, reply, judge_verdicts=...)`, and the check-level results
    come from `graders.apply_judge_verdicts`. An outcome from the judges is
    resolved here by the method's mapping table.
    """
    module = _outcome_module()
    is_checklist = (task.get("grader") or {}).get("type") == "checklist"
    key = (task.get("id"), reply)
    if judged is None:
        decision = module.decide(task, reply)
        _decision_memo.clear()
        _decision_memo[key] = decision
        result = _from_decision(decision)
        if is_checklist and result["outcome"] == "answered":
            result["checks"] = _check_list(_bench_module("graders", GraderUnavailable)
                                           .grade(task, reply))
        return result
    first = _decision_memo.get(key) or module.decide(task, reply)
    pending_on = (first.get("detail") or {}).get("pending_on") or []
    if "outcome" in pending_on:
        result = resolve_outcome(task, first, judged.get("outcome"))
        result["detail"] = first.get("detail") or {}
        return result
    if "checklist" in pending_on:
        graders = _bench_module("graders", GraderUnavailable)
        verdicts = verdicts_by_judge(judged)
        result = _from_decision(module.decide(task, reply, judge_verdicts=verdicts))
        result["needs_judge"] = []
        if result["outcome"] == "answered":
            result["checks"] = _check_list(
                graders.apply_judge_verdicts(graders.grade(task, reply), verdicts))
        return result
    return _from_decision(first)


def check_default_grader(tasks):
    """Find out before the first request whether the default grader can
    grade this task set. Returns what it learnt, for the run record.

    A formula task needs the formula engine, which is a separate install.
    Without this check a missing engine would only show after a paid
    answer had come back.
    """
    _outcome_module()
    learnt = {}
    if any((task.get("grader") or {}).get("type") == "formula" for task in tasks):
        graders = _bench_module("graders", GraderUnavailable)
        probe = getattr(graders, "formula_engine_versions", None)
        if probe is not None:
            try:
                learnt["formula_engine"] = probe()
            except Exception as problem:
                raise GraderUnavailable(
                    "no grader available for the formula tasks: the formula engine does not "
                    "start (%s: %s)" % (type(problem).__name__, problem)) from None
    return learnt


def default_scores(rows, tasks):
    """Score the finished slot records with `core/scores.py`."""
    return _bench_module("scores", ScorerUnavailable).score_run(rows)


def record_checks(outcome, passed, final, judged):
    """The `checks` list written on a slot record, in the shape scores.py
    reads: [{"id", "by": "script" | "judge", "state": "pass" | "fail" |
    "disputed" | "unresolved" | "unresolved-final"}].

    Checks belong only to an `answered` slot. A grader that returns
    `"checks"` has the last word. Otherwise the list is built from the
    panel's results, and when the grader failed the slot on its own script
    checks one `script_checks` entry says so, so that the pass is always
    the AND of the list.
    """
    if outcome != "answered":
        return []
    listed = final.get("checks")
    if isinstance(listed, (list, tuple)):
        checks = [{"id": str(c["id"]), "by": c["by"], "state": c["state"]} for c in listed]
    else:
        checks = []
        for check_id, status in ((judged or {}).get("checks") or {}).items():
            state = _CHECK_STATE.get(status)
            if state is not None:
                checks.append({"id": str(check_id), "by": "judge", "state": state})
        if checks and passed is False and all(c["state"] == "pass" for c in checks):
            checks.append({"id": "script_checks", "by": "script", "state": "fail"})
    for check in checks:
        if check["by"] not in ("script", "judge") or check["state"] not in CHECK_STATES:
            raise ValueError("the grader returned a check in an unknown shape")
    return checks


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
    """Every slot of the stage, in run order: pass by pass. Pass n is
    repeat n of every task for every model: models in config order, tasks
    shuffled per model from the recorded seed (the same order in every
    pass). The number of passes is the configured number of repeats."""
    if stage == "canary":
        chosen, repeats = preflight.canary_tasks(config, tasks), preflight.CANARY_REPEATS
    else:
        chosen, repeats = list(tasks), preflight.REPEATS
    orders = {}
    for model in config.models:
        order = sorted(chosen, key=lambda task: task["id"])
        random.Random("%s/%s" % (seed, model.model_id)).shuffle(order)
        orders[model.model_id] = order
    slots = []
    for repeat in range(1, repeats + 1):
        for model in config.models:
            for task in orders[model.model_id]:
                slots.append({"slot_id": records.slot_id(run_id, model.model_id, task["id"], repeat),
                              "model_id": model.model_id, "task_id": task["id"],
                              "repeat": repeat})
    return slots


class _Engine:
    def __init__(self, *, config, tasks, stage, record, budget, transport, loaded_keys,
                 grade, clock, sleep, out=None):
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
        self.out = out or (lambda line: None)
        self.adapters = {}
        # Set when a settled charge was above its reservation. Once set,
        # `before_send` refuses every further request.
        self.overrun = None
        # The panel that judges answers. In a live canary or full run the
        # gate has already checked it against the qualification record.
        self.panel = tuple(config.judges)

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
        reserve, write the sent line, then (after the reply) write the
        received line, settle and write the done line. The response is on
        disk before the ledger is settled, so a run that dies after the
        reply came back never has to ask for it again."""
        adapter = self._adapter(spec)

        def before_send(number):
            if self.overrun is not None:
                raise self.overrun
            request = id_for(number)
            # The prompt is the only text field sent: the adapters send no
            # system text (see providers.py). The output side is the full
            # limit that is sent with the request.
            worst = ledger.worst_case_usd(ledger.input_token_bound(prompt), limit, spec.price)
            self.budget.reserve(spec.provider, request, worst)
            for item in self.record.logged_requests(request.rpartition("/")[0] + "/"):
                entry = self.budget.ledgers[spec.provider].entries.get(item["request_id"], {})
                if (item.get("done") is None and item.get("received") is None
                        and not item["sent"].get("ledger_only")
                        and entry.get("retry_lost_paid")):
                    self.out("SECOND PAID CALL for request %s: sending replacement %s."
                             % (item["request_id"], request))
            self.record.request_sent(request, {
                "kind": kind, "model_id": spec.model_id, "provider": spec.provider,
                "reserved_usd": str(worst),
                "request": adapter.build_request(prompt, limit, self._secret(
                    spec.provider)).to_record()})

        def after_result(number, result):
            request = id_for(number)
            # First of all, and fsynced: the response as it came back, with
            # what the settlement needs, so that it can be done again from
            # the log.
            self.record.request_received(request, {
                "result": result.to_record(), "billable": result.billable})
            settled = self.budget.settle(
                spec.provider, request, result.billable, spec.price,
                zero_reason=not_billed_reason(result.status, result.http_status))
            self.record.request_done(request, {
                "result": result.to_record(), "charge_usd": str(settled["charge"]),
                "ledger_flags": settled["flags"], "reconciled": settled["reconciled"]})
            trail.append({
                "request_id": request, "status": result.status,
                "http_status": result.http_status, "error": result.error,
                "finish_reason": result.finish_reason, "charge_usd": str(settled["charge"]),
                "request_time_seconds": result.request_time_seconds, "usage": result.usage,
                "ledger_flags": settled["flags"]})
            if ledger.OVERRUN_FLAG in settled["flags"] and self.overrun is None:
                # The backstop. The ledger has recorded the overrun; nothing
                # more is sent, and the run ends interrupted.
                self.overrun = ledger.ReservationExceeded(
                    "a charge was above its reservation on %s: request %s was charged %s "
                    "USD against a reservation of %s USD"
                    % (spec.provider, request, settled["charge"], settled["reserved"]),
                    provider=spec.provider, request_id=request)

        return adapter, before_send, after_result

    def stop_if_overrun(self):
        if self.overrun is not None:
            raise _Stop("interrupted: " + str(self.overrun), self.overrun.provider)

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

    def _earlier_verdict(self, slot, kind, flags):
        """`earlier_for(spec, prompt, parse)` for one kind of judging on a
        resumed slot (see `judges._ask_judge`).

        A verdict that is already in the run log, for this very prompt, is
        used as it stands and that judge is not asked again. Otherwise the
        judge call goes on with the attempts it has left of its
        `judges.ATTEMPTS_PER_JUDGE_CALL`, numbered on from those in the log,
        so no request id is issued twice.

        The limit is for the whole life of the run. Every request id under
        `<slot>/judge/<judge>/<kind>/` counts: one with a result, one that
        was in flight, one that only the ledger knew, one reconciled by
        hand. When they are used up and no verdict is on record, nothing is
        sent: the attempt range is empty and its row
        gets the flag `judge_attempts_exhausted`.

        A request of this judge call that was sent, has no response on
        record and is still open in the ledger may have been billed. Until
        it is reconciled nothing is sent for this judge call either, and the
        row gets the flag `judge_request_awaiting_reconciliation`.
        """
        def earlier_for(spec, prompt, parse):
            base = "%s/judge/%s/%s" % (slot, spec.model_id, kind)
            logged = self.record.logged_requests(base + "/")
            for item in reversed(logged):
                result = (item["done"] or {}).get("result") or {}
                if result.get("status") != providers.OK or _logged_prompt(item) != prompt:
                    continue
                try:
                    verdict = parse(result.get("text"))
                except judges.MalformedVerdict:
                    continue
                return verdict, (), [{
                    "attempt": int(item["request_id"].rpartition("/")[2]), "result": "ok",
                    "detail": "verdict taken from the run log; the judge was not asked again"}]
            waiting = [item["request_id"] for item in logged
                       if self.awaits_reconciliation(item)]
            if waiting:
                if AWAITING_FLAG not in flags:
                    flags.append(AWAITING_FLAG)
                self.out("  resume: judge %s is not asked for %s on slot %s: request %s may "
                         "have been billed and has no result on record. Nothing is sent for "
                         "this judge call until it is reconciled with explicit --retry-lost-paid consent."
                         % (spec.model_id, kind, slot, ", ".join(waiting)))
                return None, range(0), [{
                    "attempt": None, "result": "awaiting_reconciliation",
                    "detail": "request %s may have been billed and has no result on record; "
                              "nothing is sent for this judge call until it is reconciled"
                              % ", ".join(waiting)}]
            numbers = [int(item["request_id"].rpartition("/")[2]) for item in logged]
            following = max(numbers, default=0) + 1
            left = judges.ATTEMPTS_PER_JUDGE_CALL - len(numbers)
            found = []
            if numbers:
                found.append({"attempt": None, "result": "earlier_attempts_unresolved",
                              "detail": "%d earlier request(s) in the run log gave no verdict"
                                        % len(numbers)})
            if left <= 0:
                # The limit holds for the life of the run: nothing is sent.
                if EXHAUSTED_FLAG not in flags:
                    flags.append(EXHAUSTED_FLAG)
                self.out("  resume: judge %s has used all %d of its requests for %s on slot "
                         "%s and gave no verdict; nothing more is sent"
                         % (spec.model_id, judges.ATTEMPTS_PER_JUDGE_CALL, kind, slot))
                found.append({"attempt": None, "result": "attempts_exhausted",
                              "detail": "the judge call has used its %d requests; nothing "
                                        "more is sent" % judges.ATTEMPTS_PER_JUDGE_CALL})
                return None, range(0), found
            return None, range(following, following + left), found
        return earlier_for

    def awaits_reconciliation(self, item):
        """Block a dispatched request with no durable response, even when its
        cost has been reconciled. Only explicit, journalled retry consent
        releases it. Ledger-only reservations precede dispatch and are safe.
        """
        if item.get("done") is not None or item.get("received") is not None:
            return False
        if item["sent"].get("ledger_only"):
            return False
        book = self.budget.ledgers.get(item["sent"].get("provider"))
        entry = None if book is None else book.entries.get(item["request_id"])
        return entry is None or not entry.get("retry_lost_paid", False)

    def unknown_requests(self):
        """Every request of this run that awaits reconciliation, sorted."""
        return sorted(item["request_id"]
                      for item in self.record.logged_requests(self.record.run_id + "/")
                      if self.awaits_reconciliation(item))

    def blocked_slots(self):
        """{slot id: [request id]} for the planned slots that have a model
        request awaiting reconciliation. No model request is sent for such
        a slot and no row is written for it."""
        planned = {slot["slot_id"] for slot in self.record.planned}
        blocked = {}
        for request in self.unknown_requests():
            slot, _, number = request.rpartition("/")
            if slot in planned and number.isdigit():
                blocked.setdefault(slot, []).append(request)
        return blocked

    def _judge(self, slot, task, reply, needs, trail, resumed_flags=None):
        """Ask the panel what the grader needs. `resumed_flags` is the flag
        list of the slot's row when the slot is being finished on a resume;
        verdicts already in the run log are then reused."""
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

        def earlier(kind):
            if resumed_flags is None:
                return None
            return self._earlier_verdict(slot, kind, resumed_flags)

        if wants_outcome:
            result = judges.classify_outcome(self.panel, task["prompt"], reply,
                                             call_for("outcome_classification"),
                                             earlier("outcome_classification"))
            judged["outcome"] = result["outcome"]
            judged["detail"]["outcome"] = result["judges"]
        if checks:
            if judged["outcome"] in ("abstained", "refused"):
                judged["checks"] = {check["id"]: judges.NOT_NEEDED for check in checks}
            elif judged["outcome"] == judges.UNRESOLVED:
                judged["checks"] = {check["id"]: judges.UNRESOLVED for check in checks}
            else:
                result = judges.judge_checklist(self.panel, task["prompt"], reply,
                                                checks, call_for("checklist_judging"),
                                                earlier("checklist_judging"))
                judged["checks"] = result["checks"]
                judged["detail"]["checklist"] = result["judges"]
        return judged

    def _final_grade(self, task, reply, first, judged):
        if _accepts_judged(self.grade):
            return self.grade(task, reply, judged=judged)
        return fallback_resolve(task, first, judged)

    def _earlier_requests(self, model, slot):
        """The model requests a resumed slot already has in the log, as
        trail entries, with the answer text of any that came back."""
        return self._logged_trail(self.record.logged_model_requests(slot), model.provider)

    def _logged_trail(self, logged, provider=None):
        """Requests read back from the run log as (trail entry, result or
        None) pairs. `provider` is the ledger to look in; a judge request
        names its own on its sent line."""
        earlier = []
        for item in logged:
            book = self.budget.ledgers[provider or item["sent"].get("provider")].entries
            done, entry = item["done"], book.get(item["request_id"]) or {}
            if done is not None:
                result = done.get("result") or {}
                earlier.append(({
                    "request_id": item["request_id"], "status": result.get("status"),
                    "http_status": result.get("http_status"), "error": result.get("error"),
                    "finish_reason": result.get("finish_reason"),
                    "charge_usd": str(done.get("charge_usd")),
                    "request_time_seconds": result.get("request_time_seconds"),
                    "usage": result.get("usage"),
                    "ledger_flags": list(done.get("ledger_flags") or [])}, result))
                continue
            # In flight when the run stopped: there is no result on record.
            # It still counts as one of the slot's requests, and it is not
            # sent again. Its reservation stays open in the ledger unless
            # the ledger shows it settled or reconciled; while it is open
            # the slot or judge call sends nothing (`awaits_reconciliation`).
            # A request that is only in the ledger, reserved and never
            # written to the log, counts as used in the same way and was
            # never sent, so it blocks nothing.
            settled = entry.get("charge") is not None
            charge = entry["charge"] if settled else item["sent"].get("reserved_usd")
            only_ledger = bool(item["sent"].get("ledger_only"))
            earlier.append(({
                "request_id": item["request_id"],
                "status": "reserved_never_logged" if only_ledger else "in_flight_when_stopped",
                "http_status": None,
                "error": "reserved in the ledger and never written to the run log: the run "
                         "stopped between the two" if only_ledger else
                         "no result on record: the run stopped while this request was in flight",
                "finish_reason": None, "charge_usd": str(charge),
                "request_time_seconds": None, "usage": None,
                "ledger_flags": list(entry.get("flags") or []) if settled
                else ["reservation_left_open"]}, None))
        return earlier

    def model_slot(self, model, task, repeat, resumed=False):
        slot = records.slot_id(self.record.run_id, model.model_id, task["id"], repeat)
        prompt = task["prompt"]
        limit = task["max_output_tokens"]
        if resumed and any(self.awaits_reconciliation(item)
                           for item in self.record.logged_model_requests(slot)):
            # A model request of this slot may have been billed and has no
            # result on record. Nothing is sent and no row is written: a
            # pending row without a reply would freeze the slot for ever.
            return None
        earlier = self._earlier_requests(model, slot) if resumed else []
        trail = [entry for entry, _ in earlier]
        used = len(trail)
        # On a resume the slot's judge requests are read back from the log
        # as well, so that the row carries all of them and their whole cost.
        judge_trail = [entry for entry, _ in self._logged_trail(
            self.record.logged_requests(slot + "/judge/"))] if resumed else []
        # `model`, `task_id`, `family`, `split`, `repeat`, `outcome`, `pass`,
        # `truncated`, `time_s`, `cost_usd`, `checks` and
        # `needed_judge_classification` are the fields scores.py reads.
        row = {
            "slot_id": slot, "model": model.model_id, "model_id": model.model_id,
            "provider": model.provider,
            "task_id": task["id"], "family": task["family"], "split": task["split"],
            "repeat": repeat, "prompt": prompt, "reply": None, "outcome": None, "pass": None,
            "pending": False, "truncated": False, "finish_reason": None, "flags": [],
            "tokens": None, "timing": {"slot_time_seconds": None, "first_token_seconds": None},
            "time_s": None, "checks": [],
            "judged": None, "needed_judge_classification": False,
        }
        kept = next((result for _, result in reversed(earlier)
                     if result is not None and result.get("status") == providers.OK), None)
        before = self.record.rows.get(slot) if resumed else None
        if kept is None and before is not None:
            # A pending row whose answer is not in the log as a finished
            # request. The row itself holds the reply; without one there is
            # nothing to grade, and the row is left as it is. Either way the
            # model is not asked again for a slot that has a row.
            if not isinstance(before.get("reply"), str):
                return before
            kept = {"text": before["reply"], "truncated": before.get("truncated"),
                    "finish_reason": before.get("finish_reason"),
                    "usage": before.get("tokens"),
                    "request_time_seconds": before.get("time_s")}
        if kept is not None:
            # A paid answer is on record: the run stopped after the answer
            # came back and before it was graded (no row), or its row was
            # left pending because the grader could not run or the judging
            # was not finished. The answer is never asked for again. It is
            # graded here from the record, and only the judging that is
            # still missing is sent. The new row is appended; an earlier
            # pending row stays in the log.
            row.update(reply=kept.get("text"), truncated=bool(kept.get("truncated")),
                       finish_reason=kept.get("finish_reason"), tokens=kept.get("usage"),
                       time_s=kept.get("request_time_seconds"))
            row["timing"] = {"slot_time_seconds": kept.get("request_time_seconds"),
                             "first_token_seconds": kept.get("first_token_seconds")}
            row["flags"].extend(kept.get("flags") or [])
            row["flags"].append("finished_on_resume")
            stop = self._grade_answer(row, slot, task, kept.get("text"), judge_trail,
                                      resumed=True)
            return self._close_slot(row, trail, judge_trail, stop)
        if used >= providers.MAX_REQUESTS_PER_SLOT:
            row.update(outcome="execution_error", pending=False)
            row["pass"] = False
            row["failure_reason"] = "the slot had used its requests before the run was resumed"
            row["failure_class"] = trail[-1]["status"]
            return self._close_slot(row, trail, judge_trail, None)
        # A resumed slot numbers its requests on from those already issued,
        # and they count towards the slot's limit.
        adapter, before_send, after_result = self._hooks(
            model, prompt, limit, "model",
            lambda number: records.request_id(slot, number + used), trail)
        stop = None
        results = []
        try:
            results = providers.call_with_retries(
                adapter, self.transport, prompt, limit, self._secret(model.provider),
                max_requests=providers.MAX_REQUESTS_PER_SLOT - used,
                before_send=before_send, after_result=after_result, sleep=self.sleep,
                clock=self.clock)
        except ledger.CapExceeded as cap:
            if len(trail) == used:
                raise _Stop("interrupted by cap: " + str(cap), cap.provider) from None
            stop = _Stop("interrupted by cap: " + str(cap), cap.provider)
            row["flags"].append("retry_refused_by_cap")
        except ledger.ReservationExceeded as overrun:
            # A retry was about to be sent after an overrun: it was not.
            stop = _Stop("interrupted: " + str(overrun), overrun.provider)
            row["flags"].append("retry_refused_after_overrun")
        last = results[-1] if results else None
        if last is not None and last.status == providers.OK:
            row.update(reply=last.text, truncated=last.truncated,
                       finish_reason=last.finish_reason, tokens=last.usage)
            row["timing"] = {"slot_time_seconds": last.request_time_seconds,
                             "first_token_seconds": last.first_token_seconds}
            row["flags"].extend(last.flags)
            row["time_s"] = last.request_time_seconds
            stop = self._grade_answer(row, slot, task, last.text, judge_trail) or stop
        else:
            # No gradable answer: retries ran out, a timeout or a provider error.
            row.update(outcome="execution_error", pending=False)
            row["pass"] = False
            row["failure_reason"] = trail[-1]["error"] if trail else None
            row["failure_class"] = trail[-1]["status"] if trail else None
        return self._close_slot(row, trail, judge_trail, stop)

    def _grade_answer(self, row, slot, task, text, judge_trail, resumed=False):
        """Grade one answer, ask the judges what the grader needs, and fill
        the row. Returns a `_Stop` when the run must stop after this slot,
        else None. No model request is ever sent from here.

        With `resumed` true the answer came from the run record: verdicts
        that are already in the log are reused and only the missing judge
        requests are sent (see `_earlier_verdict`).
        """
        stop = None
        judged = None
        try:
            first = self.grade(task, text)
        except Exception as problem:
            # The answer is paid for and kept. It is left ungraded and
            # pending, and the run stops: a grader that cannot run would
            # fail every later slot the same way. A resume grades it again.
            first = {"outcome": judges.UNRESOLVED, "pass": None, "pending": True,
                     "flags": ["grader_error:" + type(problem).__name__]}
            stop = _Stop("interrupted: the grader could not run on %s (%s)"
                         % (task["id"], type(problem).__name__))
        final = first
        needs = list(first.get("needs_judge") or [])
        if needs:
            row["needed_judge_classification"] = "outcome" in needs
            try:
                judged = self._judge(slot, task, text, needs, judge_trail,
                                     resumed_flags=row["flags"] if resumed else None)
                row["judged"] = judged
                final = self._final_grade(task, text, first, judged)
            except ledger.CapExceeded as cap:
                stop = _Stop("interrupted by cap: " + str(cap), cap.provider)
                final = {"outcome": first.get("outcome"), "pass": None, "pending": True}
                judged = {"outcome": None, "checks": {
                    (item["id"] if isinstance(item, dict) else item): judges.UNRESOLVED
                    for item in needs if item != "outcome"}}
                row["flags"].append("judging_refused_by_cap")
            except ledger.ReservationExceeded as overrun:
                # The answer is paid for and kept; no judge request was
                # sent after the overrun, so the slot stays pending.
                stop = _Stop("interrupted: " + str(overrun), overrun.provider)
                final = {"outcome": first.get("outcome"), "pass": None, "pending": True}
                judged = {"outcome": None, "checks": {
                    (item["id"] if isinstance(item, dict) else item): judges.UNRESOLVED
                    for item in needs if item != "outcome"}}
                row["flags"].append("judging_refused_after_overrun")
        outcome, passed = final.get("outcome"), final.get("pass")
        pending = bool(final.get("pending"))
        if outcome not in records.FINAL_OUTCOMES:
            # The outcome is still with the judges: never a scored value.
            outcome, passed, pending = judges.UNRESOLVED, None, True
        row.update(outcome=outcome, pending=pending)
        row["pass"] = passed
        row["flags"].extend(final.get("flags", []))
        row["checks"] = record_checks(outcome, passed, final, judged)
        if stop is None:
            self._finalise_exhausted_checks(row, slot)
        if isinstance(final.get("detail"), dict):
            row["grader_detail"] = final["detail"]
        return stop

    def _finalise_exhausted_checks(self, row, slot):
        """Resolve checklist exhaustion conservatively, including old resumed rows.

        Use the durable request history, never an inherited flag alone. An
        unreturned request awaiting reconciliation must still block finality.
        Outcome classification and other causes of pending are unchanged.
        """
        if row["outcome"] != "answered":
            return
        detail = (row.get("judged") or {}).get("detail") or {}
        exhausted = False
        for item in detail.get("checklist") or []:
            if item.get("verdict") is not None:
                continue
            base = "%s/judge/%s/checklist_judging/" % (slot, item["judge"])
            logged = self.record.logged_requests(base)
            if any(self.awaits_reconciliation(q) for q in logged):
                return
            if len(logged) >= judges.ATTEMPTS_PER_JUDGE_CALL:
                exhausted = True
        checks = row["checks"]
        if not exhausted or not any(c["state"] == "unresolved" for c in checks):
            return
        # An unresolved verdict on either side prevents a pass, regardless
        # of the other judge's verdict. Keep the panel's raw detail intact.
        for check in checks:
            if check["by"] == "judge" and check["state"] == "unresolved":
                check["state"] = "unresolved-final"
        if EXHAUSTED_FLAG not in row["flags"]:
            row["flags"].append(EXHAUSTED_FLAG)
        row["pass"] = False
        row["pending"] = any(c["state"] == "unresolved" for c in checks)

    def has_paid_answer(self, slot):
        """True when the slot holds an answer that only has to be graded and
        judged: it has a row that is not final, or it has no row and a model
        request of it came back with an answer before the run stopped. Such
        a slot is finished on a resume without a model request."""
        row = self.record.rows.get(slot)
        if row is not None:
            return not records.is_final(row)
        return any(((item["done"] or {}).get("result") or {}).get("status") == providers.OK
                   for item in self.record.logged_model_requests(slot))

    def _close_slot(self, row, trail, judge_trail, stop):
        """Total the slot's charges, store its row, then stop if need be."""
        row["requests"] = trail
        row["judge_requests"] = judge_trail
        # The model's own requests only; judge cost is reported separately.
        # `cost_usd` is a plain number for scores.py; the exact figure is kept too.
        cost = sum((Decimal(item["charge_usd"]) for item in trail), Decimal(0))
        row["cost_usd"] = float(cost)
        row["cost_usd_exact"] = str(cost)
        row["judge_cost_usd"] = str(sum((Decimal(item["charge_usd"]) for item in judge_trail),
                                        Decimal(0)))
        self.record.slot_done(row)
        if stop:
            raise stop
        self.stop_if_overrun()
        return row

    def _qualify_one(self, judge, checklist_samples, outcome_samples):
        """One candidate against every sample: one call per sample."""
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
        return {
            "provider": judge.provider,
            "price_sum_per_mtok": str(judges.price_sum(judge)),
            "checklist": checklist_score, "outcome": outcome_score,
            "qualified": checklist_score["passed"] and outcome_score["passed"],
            "checklist_verdicts": checklist_verdicts, "outcome_verdicts": outcome_verdicts,
            "cost_usd": str(sum((Decimal(i["charge_usd"]) for i in trail), Decimal(0))),
            "requests": len(trail),
        }

    def qualify(self, checklist_samples, outcome_samples):
        """Qualify every judge candidate by itself, cheapest first on each
        side, then name the panel: the cheapest candidate that passed on
        each side. A sample set that does not meet the method stops the
        stage before any call is made."""
        problems = (judges.check_checklist_samples(checklist_samples, self.tasks)
                    + judges.check_outcome_samples(outcome_samples))
        sides = {provider: tuple(specs)
                 for provider, specs in self.config.judge_candidates.items()}
        results = {}
        if problems:
            failures = ["the sample set does not meet the method, so no candidate was "
                        "tried: " + problem for problem in problems]
            return {"sample_set_problems": problems, "candidates": results, "panel": None,
                    "qualified": False, "failures": failures}
        for specs in sides.values():
            for judge in judges.cheapest_first(specs):
                results[judge.model_id] = self._qualify_one(
                    judge, checklist_samples, outcome_samples)
        passed = {model_id for model_id, result in results.items() if result["qualified"]}
        panel, failures = judges.choose_panel(sides, passed)
        return {"sample_set_problems": problems, "candidates": results,
                "panel": None if panel is None else [_panel_entry(spec) for spec in panel],
                "qualified": panel is not None, "failures": failures}


def _logged_prompt(item):
    """The prompt of a request as it is written on its sent line."""
    request = (item.get("sent") or {}).get("request") or {}
    body = request.get("body") or {}
    try:
        if request.get("provider") == "openai":
            return body["input"]
        return body["messages"][0]["content"]
    except (KeyError, IndexError, TypeError):
        return None


def adopt_ledger_only_requests(record, books, out=print):
    """Bring the run log level with the ledgers when a run is reopened.

    A request is reserved in its provider ledger (fsynced) before its sent
    line is written to the run log. A run that dies between the two leaves
    an id that only the ledger knows. Every such id of this run, model or
    judge, is taken into the record here, before anything is sent: an audit
    line (`ledger_only_request_found`, with the id, the provider and the
    reserved amount) is appended and printed, the id is never issued again,
    and it counts as one of its slot's or judge call's requests. The
    reservation is left exactly as it is in the ledger, so it keeps counting
    against the cap until it is reconciled. Returns the audit lines.
    """
    found = []
    prefix = record.run_id + "/"
    for provider, book in sorted(books.items()):
        for request, entry in list(book.entries.items()):
            if not request.startswith(prefix) or record.is_issued(request):
                continue
            line = record.ledger_only(request, provider, entry["reserved"], entry["charge"])
            found.append(line)
            out("  resume: request %s is in the %s ledger (reserved %s USD) and not in the run "
                "log: the run stopped before it was written. The id is not used again, it "
                "counts as a request already made, and its reservation stays in the ledger."
                % (request, provider, entry["reserved"]))
    return found


def not_billed_reason(status, http_status):
    """Why a result settles to zero, or None when it is charged. The one
    rule, used when a result is settled as it arrives and when a resume
    settles it from the run log: a request that the provider answered with
    an HTTP error status was not billed."""
    if status in (providers.TRANSPORT_ERROR, providers.PROVIDER_ERROR) \
            and http_status not in (None, 200):
        return "http_error_not_billed"
    return None


def _spec_for(config, sent):
    """The model or judge spec, and so the price, of a logged request."""
    pools = [config.models] if sent.get("kind") == "model" \
        else [config.judges, config.all_judge_candidates()]
    for pool in pools:
        for spec in pool:
            if spec.model_id == sent.get("model_id") and spec.provider == sent.get("provider"):
                return spec
    raise records.RecordError(
        "request %s was made by %s, which is not in the run config; it cannot be settled "
        "from the run log" % (sent.get("request_id"), sent.get("model_id")))


def recover_received_requests(record, books, config, out=print):
    """Finish, from the run log, every request whose response came back
    and whose `done` line was never written. Runs when a run is reopened,
    before anything is sent.

    The `received` line holds the result and the billable usage, written
    and fsynced before the ledger was settled. For each request of this run
    with a `received` line and no `done` line:

    - if its ledger entry is still open, it is settled now from the logged
      usage at the price of its model, by the same rule as a live result
      (`not_billed_reason`);
    - if the ledger already shows it settled, the ledger is left alone;
    - its `done` line is appended, built from the logged result and the
      ledger figures, with an audit line, and one line is printed.

    After that it is an ordinary finished request: its answer or verdict
    is reused by the resume and no request is sent for it. Each step can be
    repeated after a crash. Returns one entry per request recovered.
    """
    recovered = []
    for item in record.logged_requests(record.run_id + "/"):
        received = item.get("received")
        if received is None or item["done"] is not None:
            continue
        request, sent = item["request_id"], item["sent"]
        provider = sent.get("provider")
        book = books.get(provider)
        entry = None if book is None else book.entries.get(request)
        if entry is None:
            raise records.RecordError(
                "request %s has a response in the run log and no reservation in the %s "
                "ledger; repair it by hand before resuming" % (request, provider))
        result = received.get("result") or {}
        settled_now = entry["charge"] is None
        if settled_now:
            settled = book.settle(
                request, received.get("billable"), _spec_for(config, sent).price,
                zero_reason=not_billed_reason(result.get("status"), result.get("http_status")))
        else:
            settled = {"charge": entry["charge"], "reserved": entry["reserved"],
                       "flags": list(entry["flags"]), "reconciled": entry["reconciled"]}
        record.request_done(request, {
            "result": result, "charge_usd": str(settled["charge"]),
            "ledger_flags": settled["flags"], "reconciled": settled["reconciled"],
            "finished_on_resume": True})
        record.note(RECOVERED_EVENT, {
            "request_id": request, "provider": provider, "charge_usd": str(settled["charge"]),
            "reserved_usd": str(settled["reserved"]), "settled_on_resume": settled_now})
        out("  resume: request %s had come back and was not finished: its response is in the "
            "run log. %s at %s USD; its done line is written. It is not sent again."
            % (request, "Settled now from the logged usage" if settled_now
               else "The ledger already shows it settled", settled["charge"]))
        recovered.append({"request_id": request, "provider": provider,
                          "charge_usd": str(settled["charge"]),
                          "reserved_usd": str(settled["reserved"]),
                          "ledger_flags": list(settled["flags"]),
                          "settled_on_resume": settled_now})
    return recovered


def reconcile_command(private_store, provider, request, live, run_id):
    """The command that reconciles one request, as text for the operator."""
    return ('python -I bench/daily-use/core/cli.py reconcile --private-store "%s" '
            '--provider %s --request-id "%s" --usd <amount from the provider console> '
            '--note "<what the console shows>"%s'
            % (os.fspath(private_store), provider, request,
               "" if live else " --dry-ledger " + run_id))


def _ledgers(config, private_store, live, run_id):
    """Live ledgers are shared across runs. A dry run gets its own, so a
    rehearsal can never eat into the real caps. A run builds these with the
    store's execution lock held."""
    if live:
        folder = os.path.join(os.fspath(private_store), "ledgers")
    else:
        folder = os.path.join(os.fspath(private_store), "ledgers-dry", run_id)
    return {provider: ledger.ProviderLedger(provider, cap,
                                            os.path.join(folder, provider + ".jsonl"))
            for provider, cap in config.caps_usd.items()}


def _scorer(live):
    """`default_scores` when `core/scores.py` is present. A live full run
    is refused without it, before any request; a dry run goes on unscored."""
    try:
        _bench_module("scores", ScorerUnavailable).score_run
    except (ScorerUnavailable, AttributeError):
        if live:
            raise LiveRefused(
                "no scorer available: core/scores.py with score_run(slots) is not present, "
                "and a full run cannot be finalised without its scores") from None
        return None
    return default_scores


def overruns_on_file(books):
    """{provider: [request id]} for every settled charge above its
    reservation in these ledgers."""
    found = {provider: book.overruns() for provider, book in books.items()}
    return {provider: ids for provider, ids in found.items() if ids}


def tasks_sha256(tasks):
    """Freeze the full normalised definitions, including all marking criteria."""
    return content_sha256(sorted(tasks, key=lambda task: task["id"]))


def caps_in_force(config, max_usd):
    """The caps a run starts under, as text, for its frozen metadata."""
    return {"caps_usd": {provider: str(cap) for provider, cap in sorted(config.caps_usd.items())},
            "max_usd": None if max_usd is None else str(max_usd)}


def _caps_raised(document, config, max_usd):
    """Why these caps are above the ones the run started with, as a list of
    reasons; empty when every cap is the same or lower.

    A run never spends above the caps it started with: a resume may lower a
    provider cap or `--max-usd`, and may add a `--max-usd` where there was
    none, and nothing else. The caps on record are the ones written when
    the run started; a lowered cap on an earlier resume does not replace
    them.
    """
    recorded = document.get("caps_usd")
    if not isinstance(recorded, dict) or set(recorded) != set(config.caps_usd):
        return ["its record does not hold the caps it started with"]
    raised = []
    try:
        for provider in sorted(recorded):
            if config.caps_usd[provider] > Decimal(recorded[provider]):
                raised.append(
                    "the %s cap is %s USD, above the %s USD the run started with"
                    % (provider, config.caps_usd[provider], recorded[provider]))
        first = document.get("max_usd")
        if first is not None:
            if max_usd is None:
                raised.append("the run started with --max-usd %s and none was given" % first)
            elif Decimal(str(max_usd)) > Decimal(first):
                raised.append("--max-usd is %s, above the %s the run started with"
                              % (max_usd, first))
    except (ArithmeticError, TypeError, ValueError):
        return ["its record does not hold the caps it started with"]
    return raised


def _resume_note(document, config, max_usd):
    """What a resume writes to the run's record and log: the caps the run
    started with, the caps in force for this resume, and the config hash."""
    return {"caps_at_start": {"caps_usd": document.get("caps_usd"),
                              "max_usd": document.get("max_usd")},
            "caps_in_force": caps_in_force(config, max_usd),
            "config_sha256": config.sha256}


def _resumable(private_store, run_id, stage, config, tasks, live, qualification_run_id=None,
               check_qualification_id=False, max_usd=None):
    """The run.json of the staged run `run_id`, after checking that it is
    the same run: same stage, same kind (dry or live), same config apart
    from `caps_usd` and `acknowledged_overruns`, same task set, same judge
    qualification; and that no cap is above the one the run started with."""
    if stage == "qualify":
        raise records.RecordError("a judge qualification is not resumed: run qualify again")
    document = records.read_staged(private_store, run_id)
    if document.get("status") not in records.RESUMABLE:
        raise records.RecordError("run %s has status %s and cannot be resumed"
                                  % (run_id, document.get("status")))
    _same_run(document, run_id, stage, config, tasks, live, qualification_run_id,
              check_qualification_id)
    raised = _caps_raised(document, config, max_usd)
    if raised:
        raise records.RecordError(
            "run %s cannot be resumed with a higher cap: %s. A run never spends above the "
            "caps it started with; a cap may only be lowered on resume."
            % (run_id, "; ".join(raised)))
    return document


def _same_run(document, run_id, stage, config, tasks, live, qualification_run_id=None,
              check_qualification_id=False):
    """Refuse unless `document` is the run.json of this very run: same
    stage, same kind (dry or live), same config apart from `caps_usd` and
    `acknowledged_overruns`, same task set and, when asked, same judge
    qualification."""
    different = []
    if document.get("stage") != stage:
        different.append("it is a %s run" % document.get("stage"))
    if bool(document.get("live")) != bool(live):
        different.append("it is a %s run" % ("live" if document.get("live") else "dry"))
    if document.get("config_run_sha256") != config.run_sha256:
        different.append("the run config has changed (only acknowledged_overruns may change, "
                         "and a cap may be lowered)")
    if document.get("task_set_version") != config.task_set_version \
            or document.get("tasks_sha256") != tasks_sha256(tasks):
        different.append("the task set has changed")
    if check_qualification_id and document.get("qualification_run_id") != qualification_run_id:
        different.append("the judge qualification on record has changed")
    if different:
        raise records.RecordError("run %s cannot be resumed: %s" % (run_id, "; ".join(different)))


def _finish_sealed(stage, config, tasks, *, private_store, run_id, live, out):
    """Finish a canary or full run that was stopped while it was being
    finalised: its staged folder is sealed (run.json says `finalised`) or
    its final folder is already there.

    Every slot of such a run is final and paid for. After checking that it
    is the same run, this does what is left of finalising and nothing else:
    `records.complete_finalisation` (the manifest, the move to
    `runs/<run id>/`, the public record of a full run), then the stage index
    entry of a live run. Each step is skipped when it is already done. No
    request is sent, no key is loaded and no ledger is touched. A run with
    nothing left to do is reported as already finalised.

    No key guard is needed for the public record here: it is built only
    from files that were written through the guard.
    """
    store = os.fspath(private_store)
    document = records.sealed_document(store, run_id)
    _same_run(document, run_id, stage, config, tasks, live)
    listed = any(entry.get("run_id") == run_id for entry in _stage_history(store))
    already = (os.path.isdir(os.path.join(store, "runs", run_id))
               and (stage != "full" or os.path.isfile(
                   os.path.join(store, "public", run_id, "public-record.json")))
               and (listed or not live))
    finalised = records.complete_finalisation(store, run_id)
    if live:
        _record_stage(store, _stage_entry(stage, run_id, config,
                                          document.get("qualification_run_id")))
    if already:
        out("  resume: run %s is already finalised; nothing was left to do and nothing was "
            "sent" % run_id)
    else:
        out("  resume: run %s was stopped while it was being finalised. Its finalising has "
            "been completed from the record; nothing was sent." % run_id)
    with open(os.path.join(finalised["dir"], "slots.json"), encoding="utf-8") as stream:
        rows = json.load(stream)
    by_pass = {}
    for row in rows:
        by_pass.setdefault(row.get("repeat"), []).append(records.is_final(row))
    return {"run_id": run_id, "stage": stage, "live": bool(live), "seed": document.get("seed"),
            "preflight": None, "qualification": None, "qualification_record": None,
            "qualification_record_path": None,
            "qualification_run_id": document.get("qualification_run_id"),
            "finalised": finalised, "resumed": True, "pass_gates": [],
            "ledger_only_requests": [], "recovered_requests": [],
            "awaiting_reconciliation": [], "already_finalised": already,
            "passes": {"required": document.get("required_passes"),
                       "complete": sum(1 for finals in by_pass.values() if all(finals))},
            "status": "finalised", "publishable": bool(document.get("publishable")),
            "report": document.get("report"), "dir": finalised["dir"],
            "remaining_caps": None, "run_committed_usd": None}


def run_stage(stage, config, tasks, *, private_store, grade=None, live=False, key_file=None,
              max_usd=None, seed=None, checklist_samples=None, outcome_samples=None,
              transport=None, scores=None, clock=time.monotonic, sleep=None, out=print,
              environ=None, live_transport_factory=None, sample_file_hashes=None,
              resume=None):
    """Run one stage and return a summary.

    The canary is one pass; the full run is one pass per repeat. Before
    each pass `preflight.pass_gate` tests the planning bound of the pass
    against what is left of each cap. A pass that does not fit is not
    started and the run ends with status `incomplete`. A pass that is
    started is likely to finish, not certain to: if failed requests hold
    their reservations and the room runs out, the run ends `interrupted`
    inside the cap.

    `resume` is the run id of a stopped canary or full run in staging. The
    run carries on in its planned order under the same run id and the same
    ledger; a slot that has a final row is left alone, and no request id
    that is in the log is issued again. In each pass the slots that already
    hold a paid answer are finished first, without a model request: an
    answer with no row is graded, a row left pending by the grader is
    graded again, and a row pending on the judges gets only the judging
    that is missing. The pass gate counts that work. A resume is refused
    when a provider cap or `max_usd` is above the one the run started with.

    Before anything is sent, a resume finishes from the run log every
    request whose response had come back (`recover_received_requests`). A
    request that was sent and has no response on record may have been
    billed: its slot is skipped, or its judge call sends nothing, until it
    is reconciled, and `awaiting_reconciliation` in the summary lists every
    such request id. A run whose slots are all final (status `complete`) is
    scored and finalised with nothing sent, and a run that was stopped
    while it was being finalised is finished by `_finish_sealed`.

    One owner at a time: the execution lock of the private store
    (`ledger.StoreLock`) is taken before any ledger is read or any run
    record is opened, and kept until this call returns. While another run
    holds it, every stage start and every resume, dry or live, is refused
    with `LiveRefused`.

    Without `live=True` this is a dry run: the transport is a fake (the
    deterministic stub unless one is passed in), the key file is never
    read even if a path was given, and nothing is publishable.

    `scores(rows, tasks)` is injected and called only when the run can be
    finalised; a full run defaults to `default_scores`. `grade` defaults to
    `default_grade`. `sample_file_hashes` is `{"checklist", "outcome"}`,
    the SHA-256 of each sample file as read from disk.

    Raises `keys.EnvironmentNotClean`, before anything else, while a
    provider key variable is set in the environment: dry runs included.
    """
    keys_module.assert_clean_environment(environ)
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
    grader_facts = {}
    if grade is None:
        if stage != "qualify":
            # Say so now, not after the first paid request.
            grader_facts = check_default_grader(tasks)
        grade = default_grade
    if scores is None and stage == "full":
        scores = _scorer(live)
    hashes = sample_hashes(checklist_samples, outcome_samples, sample_file_hashes)
    # One owner of the private store at a time. Taken here: nothing in the
    # store has been read yet, no key has been loaded, nothing has been sent.
    lock = ledger.StoreLock(private_store)
    try:
        lock.acquire(resume)
    except ledger.StoreLocked as busy:
        raise LiveRefused(str(busy)) from None
    try:
        return _run_stage_locked(
            lock, stage, config, tasks, private_store=private_store, grade=grade, live=live,
            key_file=key_file, max_usd=max_usd, seed=seed,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples,
            transport=transport, scores=scores, clock=clock, sleep=sleep, out=out,
            environ=environ, live_transport_factory=live_transport_factory, resume=resume,
            hashes=hashes, grader_facts=grader_facts)
    finally:
        lock.release()


def _run_stage_locked(lock, stage, config, tasks, *, private_store, grade, live, key_file,
                      max_usd, seed, checklist_samples, outcome_samples, transport, scores,
                      clock, sleep, out, environ, live_transport_factory, resume, hashes,
                      grader_facts):
    """The rest of `run_stage`, with the store's execution lock held."""
    resuming = resume is not None
    resume_note = None
    if resuming and stage != "qualify" and records.is_sealed(private_store, resume):
        # Stopped while it was being finalised. Nothing is left to send.
        return _finish_sealed(stage, config, tasks, private_store=private_store,
                              run_id=resume, live=live, out=out)
    if resuming:
        # Before any ledger is built and long before the key file is read:
        # a resume with a cap above the one the run started with stops here.
        staged = _resumable(private_store, resume, stage, config, tasks, live,
                            max_usd=max_usd)
        resume_note = _resume_note(staged, config, max_usd)
        run_id, seed = resume, staged.get("seed")
    else:
        run_id = records.new_run_id()
        seed = seed if seed is not None else random.SystemRandom().randrange(2 ** 32)
        lock.describe(run_id)
    books = _ledgers(config, private_store, live, run_id)
    torn_tails = []
    for provider, book in sorted(books.items()):
        for moved in book.torn_recovered:
            torn_tails.append(dict(moved, provider=provider))
            out("  the %s ledger ended in a part-written record (%d bytes at offset %d), "
                "left by a run that died while writing it. It was moved to %s and cut from "
                "the ledger; every earlier entry is kept."
                % (provider, moved["length"], moved["offset"],
                   moved["journal"] + ledger.TORN_SUFFIX))
    remaining = {provider: book.remaining for provider, book in books.items()}
    # A settled charge above its reservation, from this run or an earlier
    # one, refuses the start unless the config acknowledges it.
    overruns = overruns_on_file(books)
    loaded = None
    qualified = None
    if live:
        gate_pass, plan, qualified = open_live_gate(
            live=live, config=config, key_file=key_file, tasks=tasks, stage=stage,
            private_store=private_store, remaining_caps=remaining, max_usd=max_usd,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples,
            environ=environ, out=out, hashes=hashes, overruns=overruns, resuming=resuming)
        if resuming:
            _resumable(private_store, resume, stage, config, tasks, live,
                       qualification_run_id=None if qualified is None else qualified["run_id"],
                       check_qualification_id=True, max_usd=max_usd)
        loaded = gate_pass.keys
        transport = (live_transport_factory or providers.UrllibTransport)(gate_pass)
        sleep = sleep or time.sleep
    else:
        note = "this is the qualification stage"
        if stage != "qualify":
            # A rehearsal is costed with the recorded panel when one stands.
            qualified, note = check_qualification(config, private_store, hashes,
                                                  need_samples=False)
        plan = preflight.enforce(preflight.preflight(
            config, tasks, remaining, stage=stage, max_usd=max_usd,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples,
            out=out, environ=environ, overruns=overruns, resuming=resuming,
            qualification=None if qualified is None else {
                "run_id": qualified["run_id"], "panel": config.judges},
            qualification_note=note))
        transport = transport or StubTransport()
    qualification_run_id = None if qualified is None else qualified["run_id"]
    guard = loaded.leaks_into if loaded is not None else None
    record = records.RunRecord.reopen(private_store, run_id, guard=guard,
                                      note=resume_note) if resuming \
        else records.RunRecord(private_store, run_id, stage, {
        "live": bool(live), "task_set_version": config.task_set_version, "seed": seed,
        "config_sha256": config.sha256, "config_run_sha256": config.run_sha256,
        "tasks_sha256": tasks_sha256(tasks),
        "settings": [model.public() for model in config.models],
        "judge_settings": [judge.public() for judge in config.judges],
        "judge_candidate_settings": [judge.public() for judge in config.all_judge_candidates()]
        if stage == "qualify" else [],
        "qualification_run_id": qualification_run_id,
        "sample_file_sha256": hashes,
        "grader": grader_facts,
        # The caps the run starts under. They are frozen here: a resume
        # may lower them and may never raise them.
        **caps_in_force(config, max_usd),
        "preflight": {"whole_plan": plan["whole_plan"], "requests": plan["requests"],
                      "counts": plan["counts"], "judging": plan["judging"],
                      "by_stage": plan["by_stage"], "by_pass": plan["by_pass"],
                      "whole_plan_gate": plan["whole_plan_gate"]},
    }, guard=guard, required_passes=preflight.REPEATS if stage == "full" else None)
    budget = ledger.Budget(books, run_id, max_usd=max_usd)
    for moved in record.torn_recovered:
        torn_tails.append(dict(moved, provider=None))
        out("  the run log ended in a part-written line (%d bytes at offset %d), left by a "
            "run that died while writing it. It was moved to %s and cut from the log."
            % (moved["length"], moved["offset"], moved["journal"] + ledger.TORN_SUFFIX))
    engine = _Engine(config=config, tasks=tasks, stage=stage, record=record, budget=budget,
                     transport=transport, loaded_keys=loaded, grade=grade, clock=clock,
                     sleep=sleep, out=out)
    ledger_only, recovered, awaiting, blocked = [], [], [], {}
    if resuming:
        # Bring the log and the ledgers level before anything is sent.
        try:
            ledger_only = adopt_ledger_only_requests(record, books, out)
            recovered = recover_received_requests(record, books, config, out)
        except BaseException:
            record.close()
            raise
        awaiting = engine.unknown_requests()
        blocked = engine.blocked_slots()
        sent_by = {item["request_id"]: item["sent"].get("provider")
                   for item in record.logged_requests(run_id + "/")}
        for request in awaiting:
            provider = sent_by[request]
            out("  resume: request %s was sent and has no result on record. It may have "
                "been billed. Its %s stays pending. Reconcile the cost from the %s console "
                "(or use --at-reserved-maximum). Accounting alone does not permit retry. "
                "Only add --retry-lost-paid to authorise a SECOND PAID CALL:"
                % (request, "slot" if request.rpartition("/")[0] in blocked else "judge call",
                   provider))
            out("    " + reconcile_command(private_store, provider, request, live, run_id))
        for item in recovered:
            if item["settled_on_resume"] and ledger.OVERRUN_FLAG in item["ledger_flags"] \
                    and engine.overrun is None:
                engine.overrun = ledger.ReservationExceeded(
                    "a charge was above its reservation on %s: request %s was charged %s "
                    "USD against a reservation of %s USD"
                    % (item["provider"], item["request_id"], item["charge_usd"],
                       item["reserved_usd"]),
                    provider=item["provider"], request_id=item["request_id"])
    summary = {"run_id": run_id, "stage": stage, "live": bool(live), "seed": seed,
               "preflight": plan, "qualification": None, "qualification_record": None,
               "qualification_record_path": None,
               "qualification_run_id": qualification_run_id, "finalised": None,
               "resumed": resuming, "pass_gates": [],
               "ledger_only_requests": [line["request_id"] for line in ledger_only],
               "recovered_requests": [item["request_id"] for item in recovered],
               "awaiting_reconciliation": list(awaiting), "torn_tails": torn_tails,
               "already_finalised": False}
    try:
        # A charge above its reservation that came to light while the log
        # was brought level: nothing is sent.
        engine.stop_if_overrun()
        if stage == "qualify":
            record.plan([])
            qualification = engine.qualify(checklist_samples, outcome_samples)
            record.write_json("qualification.json", qualification)
            summary["qualification"] = qualification
            # An overrun on the very last call leaves nothing to refuse, so
            # the stage is stopped here: it is never finalised.
            engine.stop_if_overrun()
        else:
            if resuming:
                slots = record.planned
            else:
                slots = plan_slots(config, tasks, stage, seed, run_id)
                record.plan(slots)
            by_model = {model.model_id: model for model in config.models}
            by_task = {task["id"]: task for task in tasks}
            numbers = sorted({slot["repeat"] for slot in slots})
            for number in numbers:
                # Pass `number`: repeat `number` of every task for every
                # model, each slot judged before the next one starts. On a
                # resumed run a slot with a final row is left alone. The
                # slots of the pass that already hold a paid answer come
                # first, in planned order: they are graded and judged from
                # the record and no model request is sent for them. Then the
                # unsent slots, in planned order. The gate counts both: a
                # slot to finish at the planning bound of its judging, an
                # unsent slot at its whole planning bound. A slot with a
                # model request that awaits reconciliation is left out of
                # all of it: nothing is sent for it and no row is written.
                of_pass = [slot for slot in slots
                           if slot["repeat"] == number and slot["slot_id"] not in blocked]
                finish = [dict(slot, judging_only=True) for slot in of_pass
                          if resuming and engine.has_paid_answer(slot["slot_id"])]
                finishing = {slot["slot_id"] for slot in finish}
                todo = finish + [slot for slot in of_pass
                                 if slot["slot_id"] not in record.rows
                                 and slot["slot_id"] not in finishing]
                if not todo:
                    continue
                gate = preflight.pass_gate(
                    plan, todo, budget.remaining(), number, len(numbers),
                    max_usd_left=None if max_usd is None
                    else Decimal(str(max_usd)) - budget.run_committed())
                summary["pass_gates"].append(gate)
                for line in gate["lines"]:
                    out(line)
                if not gate["ok"]:
                    # The pass does not start. Nothing of it is sent; the
                    # finished passes stay as they are.
                    record.mark_incomplete(gate["reason"], gate["provider"])
                    break
                for slot in todo:
                    engine.model_slot(by_model[slot["model_id"]], by_task[slot["task_id"]],
                                      slot["repeat"], resumed=resuming)
            if blocked and record.status == "running":
                waiting = sorted(request for group in blocked.values() for request in group)
                record.mark_interrupted(
                    "%d model request(s) were sent and have no result on record, so %d "
                    "slot(s) were not carried on. Reconcile them, then resume: %s"
                    % (len(waiting), len(blocked), ", ".join(waiting)))
    except _Stop as stop:
        record.mark_interrupted(stop.reason, stop.provider)
    except ledger.CapExceeded as cap:
        record.mark_interrupted("interrupted by cap: " + str(cap), cap.provider)
    except ledger.ReservationExceeded as overrun:
        record.mark_interrupted("interrupted: " + str(overrun), overrun.provider)
    except BaseException:
        record.mark_interrupted("stopped by an error in the harness")
        record.close()
        raise
    if record.status == "running" and not record.pending_slots() \
            and not record.unstarted_slots():
        rows = [record.rows[slot["slot_id"]] for slot in record.planned]
        try:
            # Never scored with fewer than the configured number of passes.
            record.require_complete_passes()
            computed = scores(rows, tasks) if scores is not None else None
        except BaseException:
            record.close()                  # the run stays in staging, unscored
            raise
        summary["finalised"] = record.finalise(computed)
        if stage == "qualify":
            # The signed-off record. Written for every finished qualification,
            # but only a live one is listed in the stage index, so only a live
            # one can ever open the gate for the canary and the full run.
            signed = build_qualification_record(
                config, summary["qualification"], hashes, checklist_samples, outcome_samples,
                run_id, live, summary["finalised"]["manifest_sha256"])
            summary["qualification_record"] = signed
            if live:
                summary["qualification_record_path"] = write_qualification_record(
                    private_store, signed,
                    guard=loaded.leaks_into if loaded is not None else None)
        if live:
            entry = _stage_entry(stage, run_id, config, qualification_run_id)
            if stage == "qualify":
                entry["qualification_run_id"] = run_id
                entry["qualified"] = summary["qualification"]["qualified"]
                entry["panel"] = [item["model_id"]
                                  for item in summary["qualification"]["panel"] or []]
            _record_stage(private_store, entry)
    else:
        record.close()
    summary["passes"] = {"required": record.required_passes,
                         "complete": record.complete_passes()}
    summary.update(status=record.status, publishable=record.publishable,
                   report=record.report(), dir=record.dir,
                   remaining_caps=budget.remaining(),
                   run_committed_usd=budget.run_committed())
    return summary
