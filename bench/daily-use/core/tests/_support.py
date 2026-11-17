"""Shared helpers for the core tests. Not a test module."""
import os
import sys
from pathlib import Path

CORE_DIR = Path(__file__).resolve().parents[1]
DAILY_USE_DIR = CORE_DIR.parent
TASK_SET_DIR = DAILY_USE_DIR / "task-set-v1"
PUBLIC_DIR = TASK_SET_DIR / "public"

# "bench/daily-use" isn't an importable package path (it has a hyphen), so put
# the folder that holds "core" on the path.
if str(DAILY_USE_DIR) not in sys.path:
    sys.path.insert(0, str(DAILY_USE_DIR))

# The formula engine may live outside the interpreter's own packages. Its
# folder is given in DTD_FORMULAS_PATH; nothing is hard-coded here.
_extra = os.environ.get("DTD_FORMULAS_PATH")
if _extra and _extra not in sys.path:
    sys.path.insert(0, _extra)

import ast  # noqa: E402
import json  # noqa: E402

from core import _sandbox_runner, graders, outcome, sandbox, tasks  # noqa: E402


def formula_engine_available() -> bool:
    try:
        graders._FormulaEngine._package_folders()
    except graders.FormulaEngineUnavailable:
        return False
    return True


def sandbox_ready() -> bool:
    """True when DTD_SANDBOX names a backend whose self-test passes here."""
    try:
        sandbox.ready_backend()
    except sandbox.SandboxUnavailable:
        return False
    return True


def contained_facts(config):
    """What the self-test probe reports from a sandbox that contains everything."""
    return {
        "started": True, "uid": 65534, "env_names": ["PATH"], "env_seen": False,
        "list": {path: ({"listed": ["bin", "tmp", "usr"]} if path == "/" else
                        {"listed": None, "error": "FileNotFoundError"}) for path in config["list_paths"]},
        "read": {path: {"readable": False, "error": "FileNotFoundError"} for path in config["read_paths"]},
        "write": {path: {"written": False, "error": "OSError"} for path in config["write_paths"]},
        "tcp": {f"{host}:{port}": {"connected": False, "error": "OSError"} for host, port in config["tcp_targets"]},
        "spawn": {"spawned": 61, "error": "BlockingIOError"},
        "file": {"written_mb": 16, "error": "OSError"},
        "alloc": {"died": 9},
    }


class FakeBackend(sandbox.SandboxBackend):
    """A stand-in sandbox for protocol tests. IT RUNS NOTHING.

    It records each job it is sent and answers with a canned report, so the
    host side (what is sent, how results are compared, the caps, the time
    limit) can be tested without any sandbox. ``returns`` lists, per test,
    what the submission is pretending to have returned: a Python value, or
    ``Raised("ValueError", ...)``, or a ready-made result dictionary.
    """

    name = "fake"
    expected_uid = 65534

    def __init__(self, returns=None, output=None, leak=None, verify=True):
        super().__init__()
        self.returns = returns
        self.output = output
        self.leak = leak
        self.jobs = []
        self.programs = []
        if verify:
            self.self_test(host_paths=["C:\\made-up\\canary.txt"])

    def available(self):
        return True, ""

    def _execute(self, program, timeout, env_extra=None):
        # Only the self-test probe comes this way; the config is its last line.
        self.programs.append(program)
        line = program.decode("utf-8").rstrip().splitlines()[-1]
        config = json.loads(ast.literal_eval(line[len("_main("):-1]))
        facts = contained_facts(config)
        if self.leak:
            self.leak(facts, config)
        return sandbox.RunOutput("done", b'{"started": true}\n' + json.dumps(facts).encode() + b"\n")

    def run_job(self, job, timeout):
        self.jobs.append(job)
        if self.output is not None:
            return self.output
        results = []
        for value in self.returns:
            if isinstance(value, Raised):
                results.append({"raised": list(value.names)})
            elif isinstance(value, RawResult):
                results.append(value.result)
            else:
                try:
                    results.append({"value": _sandbox_runner.encode(value)})
                except _sandbox_runner._TooLarge:
                    results.append({"error": "output_too_large"})
        return report_output({"results": results})


class Raised:
    def __init__(self, *names):
        self.names = names


class RawResult:
    def __init__(self, result):
        self.result = result


def report_output(report) -> "sandbox.RunOutput":
    return sandbox.RunOutput("done", b'{"started": true}\n' + json.dumps(report).encode("utf-8") + b"\n")


def truth_report(task_list, skip_formula=False):
    """Run every accept and reject example through ``outcome.decide``.

    Returns counts and a list of problems. A problem names the task id, the
    example and what went wrong; it never includes task text.

    Abstain tasks: an accept example must come out ``abstained`` (pass true)
    or ``needs_judge``; a reject example must come out ``answered`` or
    ``needs_judge`` and must NEVER be ``abstained``.

    ``python_tests`` tasks with no proven sandbox are not graded: each example
    that would have to run is listed under ``not_graded_no_sandbox``.
    """
    report = {
        "tasks": 0, "accepts": 0, "accepts_pass": 0, "accepts_judge_needed": 0,
        "rejects": 0, "rejects_fail_by_script": 0, "rejects_judge_only": 0,
        "abstain_accepts": 0, "abstain_accepts_by_pattern": 0, "abstain_accepts_needing_judge": [],
        "abstain_rejects": 0, "abstain_rejects_answered": 0, "abstain_rejects_needing_judge": [],
        "not_graded_no_sandbox": [], "python_tests_tasks": [],
        "skipped_formula_tasks": [], "problems": [],
    }
    for task in task_list:
        kind = task.grader["type"]
        if kind == "formula" and skip_formula:
            report["skipped_formula_tasks"].append(task.id)
            continue
        report["tasks"] += 1
        if kind == "python_tests":
            report["python_tests_tasks"].append(task.id)
        has_judge_checks = kind == "checklist" and any(c["by"] == "judge" for c in task.grader["checks"])

        for n, example in enumerate(task.accept_examples, 1):
            decision = outcome.decide(task, example)
            label = f"{task.id} accept {n}"
            if kind == "abstain":
                report["abstain_accepts"] += 1
                if decision["outcome"] == outcome.ABSTAINED and decision["pass"] is True:
                    report["abstain_accepts_by_pattern"] += 1
                elif decision["outcome"] == outcome.NEEDS_JUDGE and decision["pass"] is None:
                    report["abstain_accepts_needing_judge"].append(label)
                else:
                    report["problems"].append(f"{label}: classified {decision['outcome']}, expected abstained or needs_judge")
                continue
            report["accepts"] += 1
            if decision["outcome"] == outcome.SANDBOX_UNAVAILABLE:
                if kind == "python_tests" and decision["pass"] is None:
                    report["not_graded_no_sandbox"].append(label)
                else:
                    report["problems"].append(f"{label}: sandbox_unavailable on a {kind} task")
            elif decision["outcome"] != outcome.ANSWERED:
                report["problems"].append(f"{label}: outcome {decision['outcome']}, expected answered")
            elif has_judge_checks:
                if decision["pass"] is None and decision["detail"]["pending_on"] == ["checklist"]:
                    report["accepts_judge_needed"] += 1
                else:
                    report["problems"].append(f"{label}: {decision['detail']['grader_detail']}")
            elif decision["pass"] is True:
                report["accepts_pass"] += 1
            else:
                report["problems"].append(f"{label}: {decision['detail']['grader_detail']}")

        for n, example in enumerate(task.reject_examples, 1):
            decision = outcome.decide(task, example)
            label = f"{task.id} reject {n}"
            if kind == "abstain":
                report["abstain_rejects"] += 1
                if decision["outcome"] == outcome.ANSWERED and decision["pass"] is False:
                    report["abstain_rejects_answered"] += 1
                elif decision["outcome"] == outcome.NEEDS_JUDGE and decision["pass"] is None:
                    report["abstain_rejects_needing_judge"].append(label)
                else:
                    report["problems"].append(
                        f"{label}: classified {decision['outcome']}, expected answered or needs_judge")
                continue
            report["rejects"] += 1
            if decision["outcome"] == outcome.SANDBOX_UNAVAILABLE:
                if kind == "python_tests" and decision["pass"] is None:
                    report["not_graded_no_sandbox"].append(label)
                else:
                    report["problems"].append(f"{label}: sandbox_unavailable on a {kind} task")
            elif decision["pass"] is False:
                report["rejects_fail_by_script"] += 1
            elif decision["pass"] is None and decision["detail"]["pending_on"] == ["checklist"]:
                if task.reject_notes[n - 1]:
                    report["rejects_judge_only"] += 1
                else:
                    report["problems"].append(
                        f"{label}: passes every script check but reject_notes does not list it as judge-only")
            else:
                report["problems"].append(f"{label}: was accepted")
    return report
