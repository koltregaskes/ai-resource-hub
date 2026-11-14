"""Command line for the Day-to-Day Bench run path.

    python -I bench/daily-use/core/cli.py preflight --config ... --public-tasks ...
    python -I bench/daily-use/core/cli.py dry-run   --config ... --public-tasks ... --private-store ...
    python -I bench/daily-use/core/cli.py qualify   ... --key-file ... --live
    python -I bench/daily-use/core/cli.py canary    ... --key-file ... --live
    python -I bench/daily-use/core/cli.py full      ... --key-file ... --live

The stages run in that order: qualify, then canary, then full. Without
`--live`, the stage commands are dry runs on a fake transport and the key
file is never read. A key is never accepted on the command line.

Exit codes: 0 finished; 2 refused; 3 interrupted or pending; 4 the judge
qualification finished but named no panel. See RUNNER.md.
"""

import argparse
import dataclasses
import hashlib
import json
import os
import sys
from decimal import Decimal, InvalidOperation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as config_module  # noqa: E402
import judges  # noqa: E402
import ledger  # noqa: E402
import preflight  # noqa: E402
import records  # noqa: E402
import runner  # noqa: E402

STAGE_COMMANDS = ("qualify", "canary", "full")
EXIT_OK, EXIT_REFUSED, EXIT_NOT_FINISHED, EXIT_NOT_QUALIFIED = 0, 2, 3, 4


def load_tasks(path, split):
    """The built-in reader: tasks from one JSON file or from every .json
    file in a folder. Each file holds a list of task objects, or
    {"tasks": [...]}. It checks no held-out hashes."""
    files = [path]
    if os.path.isdir(path):
        files = sorted(os.path.join(path, name) for name in os.listdir(path)
                       if name.endswith(".json"))
    tasks = []
    for name in files:
        with open(name, encoding="utf-8-sig") as stream:
            data = json.load(stream)
        if isinstance(data, dict):
            data = data.get("tasks")
        if not isinstance(data, list):
            raise preflight.TaskError("not a list of tasks: " + os.path.basename(name))
        tasks.extend(preflight.normalise_task(item, split=split) for item in data)
    return tasks


def _plain(task):
    """A task from `core/tasks.py` (a dataclass) as the plain dict the run
    path uses."""
    if isinstance(task, dict):
        return dict(task)
    plain = dataclasses.asdict(task)
    plain.pop("raw", None)
    return plain


def load_task_set(public, held_out=None, manifest=None):
    """Load the task set. Returns (tasks, a line saying how).

    `core/tasks.py` is used when it is present and the public path is a
    folder: `load_tasks(public_dir, held_out_dir=None)` validates every
    task and checks each held-out file against the manifest. Otherwise the
    built-in reader is used, which checks no hashes.
    """
    module = runner.optional_module("tasks")
    if module is not None and hasattr(module, "load_tasks") and os.path.isdir(public):
        options = {"manifest_path": manifest} if manifest else {}
        loaded = module.load_tasks(public, held_out or None, **options)
        tasks = [preflight.normalise_task(_plain(task)) for task in loaded]
        how = "tasks loaded by core/tasks.py" + (
            " (held-out files checked against the manifest)" if held_out else "")
    else:
        tasks = load_tasks(public, "public")
        if held_out:
            tasks += load_tasks(held_out, "held-out")
        how = "tasks loaded by the built-in reader (core/tasks.py not used: no hash check)"
    return preflight.normalise_tasks(tasks), how


def _load_samples(path):
    """A sample file as (parsed list or None, SHA-256 of its bytes or None)."""
    if not path:
        return None, None
    with open(path, "rb") as stream:
        data = stream.read()
    value = json.loads(data.decode("utf-8-sig"))
    if not isinstance(value, list):
        raise preflight.TaskError("not a list of samples: " + os.path.basename(path))
    return value, hashlib.sha256(data).hexdigest()


def build_parser():
    parser = argparse.ArgumentParser(
        prog="cli.py", description="Day-to-Day Bench run path. Dry by default.")
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("preflight", "dry-run") + STAGE_COMMANDS:
        sub = commands.add_parser(name)
        sub.add_argument("--config", required=True, help="path to run-config.json")
        sub.add_argument("--public-tasks", required=True, help="public task file or folder")
        sub.add_argument("--held-out-tasks", help="held-out task file or folder (private)")
        sub.add_argument("--held-out-manifest",
                         help="held-out manifest, when it is not beside the public folder")
        sub.add_argument("--key-file", help="path to the owner's key file; read only by a live run")
        sub.add_argument("--private-store", help="folder outside the repo for run records")
        sub.add_argument("--max-usd", type=_usd,
                         help="a lower cap for this one run, in USD; it never raises a cap")
        sub.add_argument("--checklist-samples", help="judge qualification checklist samples")
        sub.add_argument("--outcome-samples", help="judge qualification outcome samples")
        sub.add_argument("--seed", type=int, help="task order seed (recorded either way)")
        if name in STAGE_COMMANDS:
            sub.add_argument("--live", action="store_true", help="ask for a live run")
        if name in ("preflight", "dry-run"):
            sub.add_argument("--stage", choices=STAGE_COMMANDS,
                             default="qualify" if name == "preflight" else "full")
        if name == "dry-run" or name in STAGE_COMMANDS:
            sub.add_argument("--stub-grade", action="store_true",
                             help="dry runs only: plumbing check without the graders")
    return parser


PATH_OPTIONS = ("--config", "--public-tasks", "--held-out-tasks", "--held-out-manifest",
                "--key-file", "--private-store", "--checklist-samples", "--outcome-samples")


def _usd(text):
    try:
        amount = Decimal(text)
    except InvalidOperation:
        raise argparse.ArgumentTypeError("not an amount in USD") from None
    if not amount.is_finite() or amount < 0:
        raise argparse.ArgumentTypeError("not an amount in USD")
    return amount


def _refuse_secrets_on_command_line(argv):
    """Runs before argparse, so a key typed by mistake is never echoed in a
    usage error. Values of the path options are skipped: folder names can
    hold long random-looking parts."""
    previous = None
    for value in argv:
        is_path = previous in PATH_OPTIONS or value.split("=", 1)[0] in PATH_OPTIONS
        previous = value
        if not is_path and config_module.looks_like_secret(value):
            raise SystemExit("refused: a command-line value looks like a key. Keys are read "
                             "only from the key file named by --key-file.")


def _figure(value):
    return "  n/a " if value is None else "%.4f" % value


def qualification_lines(qualification, config):
    """The per-candidate table and the recommended panel."""
    lines = ["  judge qualification, per candidate (needs overall >= 0.90, on true items "
             ">= 0.85, on false items >= 0.85, outcome samples >= 0.90):",
             "  %-22s %-10s %10s %8s %8s %9s %8s  %s" % (
                 "candidate", "provider", "price sum", "overall", "on true", "on false",
                 "outcome", "result")]
    for spec in config.all_judge_candidates():
        result = qualification["candidates"].get(spec.model_id)
        if result is None:
            lines.append("  %-22s %-10s %10s  not tried" % (
                spec.model_id, spec.provider, judges.price_sum(spec)))
            continue
        checklist, outcome = result["checklist"], result["outcome"]
        lines.append("  %-22s %-10s %10s %8s %8s %9s %8s  %s" % (
            spec.model_id, spec.provider, result["price_sum_per_mtok"],
            _figure(checklist["agreement"]), _figure(checklist["agreement_on_true"]),
            _figure(checklist["agreement_on_false"]), _figure(outcome["agreement"]),
            "PASS" if result["qualified"] else "FAIL"))
    for problem in qualification["sample_set_problems"]:
        lines.append("  sample set problem: " + problem)
    if qualification["panel"]:
        lines.append("  recommended panel, the cheapest candidate that passed on each side: "
                     + ", ".join("%s %s" % (item["provider"], item["model_id"])
                                 for item in qualification["panel"]))
        lines.append("  Set judges in the run config to this panel before the canary.")
    else:
        lines.append("  QUALIFICATION FAILED, no panel: " + "; ".join(qualification["failures"]))
    return lines


def main(argv=None, out=print):
    argv = list(sys.argv[1:] if argv is None else argv)
    _refuse_secrets_on_command_line(argv)
    args = build_parser().parse_args(argv)
    live = bool(getattr(args, "live", False))
    stage = args.command if args.command in STAGE_COMMANDS else args.stage
    try:
        if live:
            # Refuse before anything is read when live runs are switched off.
            runner._refuse_if_disabled()
        config = config_module.load_config(args.config, mode="live" if live else "dry")
        tasks, how = load_task_set(args.public_tasks, args.held_out_tasks,
                                   args.held_out_manifest)
        checklist_samples, checklist_sha = _load_samples(args.checklist_samples)
        outcome_samples, outcome_sha = _load_samples(args.outcome_samples)
        file_hashes = {"checklist": checklist_sha, "outcome": outcome_sha}
        if args.command == "preflight":
            qualified, note = None, None
            if args.private_store:
                books = runner._ledgers(config, args.private_store, True, "preflight")
                remaining = {provider: book.remaining for provider, book in books.items()}
                if stage != "qualify":
                    qualified, note = runner.check_qualification(
                        config, args.private_store, file_hashes, need_samples=False)
            else:
                remaining = dict(config.caps_usd)
            out("  " + how)
            result = preflight.preflight(
                config, tasks, remaining, stage=stage, max_usd=args.max_usd,
                checklist_samples=checklist_samples, outcome_samples=outcome_samples, out=out,
                qualification=None if qualified is None else {
                    "run_id": qualified["run_id"], "panel": config.judges},
                qualification_note=note)
            if checklist_samples is not None and outcome_samples is not None:
                problems = (judges.check_checklist_samples(
                    checklist_samples, {task["id"]: task for task in tasks})
                    + judges.check_outcome_samples(outcome_samples))
                for problem in problems:
                    out("  sample set problem: " + problem)
                if not problems:
                    out("  sample set: meets the method's rules for size and balance")
            return EXIT_OK if result["ok"] else EXIT_REFUSED
        if not args.private_store:
            raise SystemExit("--private-store is needed: run records are never written "
                             "inside the repo")
        if args.stub_grade and live:
            raise SystemExit("--stub-grade is for dry runs only")
        out("  " + how)
        summary = runner.run_stage(
            stage, config, tasks, private_store=args.private_store,
            grade=runner.stub_grade if args.stub_grade else None, live=live,
            key_file=args.key_file if live else None, max_usd=args.max_usd, seed=args.seed,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples, out=out,
            sample_file_hashes=file_hashes)
    except (runner.LiveRefused, runner.GraderUnavailable, runner.ScorerUnavailable,
            preflight.PreflightRefused, ledger.LedgerError, records.RecordError) as problem:
        out("REFUSED: " + str(problem))
        return EXIT_REFUSED
    except ValueError as problem:
        # Config, task, sample and panel errors. Their messages never quote a value.
        out("REFUSED: " + str(problem))
        return EXIT_REFUSED
    except OSError as problem:
        out("REFUSED: cannot read %s (%s)" % (
            os.path.basename(str(problem.filename or "a file")), problem.strerror or "error"))
        return EXIT_REFUSED
    out("%s run %s: stage %s, status %s, publishable %s" % (
        "Live" if summary["live"] else "Dry", summary["run_id"], summary["stage"],
        summary["status"], summary["publishable"]))
    for model_id, counts in sorted(summary["report"]["models"].items()):
        out("  %s: planned %d, attempted %d, unstarted %d, pending %d" % (
            model_id, counts["planned"], counts["attempted"], counts["unstarted"],
            counts["pending"]))
    if summary["report"]["stopped_providers"]:
        out("  stopped provider: " + ", ".join(summary["report"]["stopped_providers"]))
    qualification = summary["qualification"]
    if qualification is not None:
        for line in qualification_lines(qualification, config):
            out(line)
        if summary["qualification_record_path"]:
            out("  qualification record: " + summary["qualification_record_path"])
        elif not summary["live"]:
            out("  This was a dry run: no qualification record was written, and a dry "
                "run never opens the canary or the full run.")
    out("  committed by this run: %s USD" % summary["run_committed_usd"])
    out("  record: " + summary["dir"])
    if summary["status"] not in ("finalised", "complete"):
        return EXIT_NOT_FINISHED
    if qualification is not None and not qualification["qualified"]:
        return EXIT_NOT_QUALIFIED
    return EXIT_OK


if __name__ == "__main__":
    sys.exit(main())
