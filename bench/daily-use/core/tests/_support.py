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

from core import graders, outcome, tasks  # noqa: E402

# How many abstain accept examples may fall to the judges rather than be
# classified by pattern. All four public ones are decided by pattern today.
MAX_ABSTAIN_ACCEPTS_NEEDING_JUDGE = 0


def formula_engine_available() -> bool:
    try:
        graders._FormulaEngine._package_folders()
    except graders.FormulaEngineUnavailable:
        return False
    return True


def truth_report(task_list, skip_formula=False):
    """Run every accept and reject example through ``outcome.decide``.

    Returns counts and a list of problems. A problem names the task id, the
    example and what went wrong; it never includes task text.
    """
    report = {
        "tasks": 0, "accepts": 0, "accepts_pass": 0, "accepts_judge_needed": 0,
        "rejects": 0, "rejects_fail_by_script": 0, "rejects_judge_only": 0,
        "abstain_accepts": 0, "abstain_accepts_by_pattern": 0, "abstain_accepts_needing_judge": [],
        "abstain_rejects": 0, "abstain_rejects_answered": 0,
        "skipped_formula_tasks": [], "problems": [],
    }
    for task in task_list:
        kind = task.grader["type"]
        if kind == "formula" and skip_formula:
            report["skipped_formula_tasks"].append(task.id)
            continue
        report["tasks"] += 1
        has_judge_checks = kind == "checklist" and any(c["by"] == "judge" for c in task.grader["checks"])

        for n, example in enumerate(task.accept_examples, 1):
            decision = outcome.decide(task, example)
            label = f"{task.id} accept {n}"
            if kind == "abstain":
                report["abstain_accepts"] += 1
                if decision["outcome"] == outcome.ABSTAINED and decision["pass"] is True:
                    report["abstain_accepts_by_pattern"] += 1
                elif decision["outcome"] == outcome.NEEDS_JUDGE:
                    report["abstain_accepts_needing_judge"].append(label)
                else:
                    report["problems"].append(f"{label}: classified {decision['outcome']}, expected abstained")
                continue
            report["accepts"] += 1
            if decision["outcome"] != outcome.ANSWERED:
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
                else:
                    report["problems"].append(f"{label}: classified {decision['outcome']}, expected answered")
                continue
            report["rejects"] += 1
            if decision["pass"] is False:
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
