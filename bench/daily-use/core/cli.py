"""Command line for the Day-to-Day Bench run path.

    python -I bench/daily-use/core/cli.py preflight --config ... --public-tasks ...
    python -I bench/daily-use/core/cli.py dry-run   --config ... --public-tasks ... --private-store ...
    python -I bench/daily-use/core/cli.py canary    ... --key-file ... --live
    python -I bench/daily-use/core/cli.py qualify   ... --key-file ... --live
    python -I bench/daily-use/core/cli.py full      ... --key-file ... --live

Without `--live`, the stage commands are dry runs on a fake transport and
the key file is never read. A key is never accepted on the command line.
See RUNNER.md.
"""

import argparse
import json
import os
import sys
from decimal import Decimal, InvalidOperation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as config_module  # noqa: E402
import ledger  # noqa: E402
import preflight  # noqa: E402
import runner  # noqa: E402

STAGE_COMMANDS = ("qualify", "canary", "full")


def load_tasks(path, split):
    """Load tasks from one JSON file or from every .json file in a folder.
    Each file holds a list of task objects, or {"tasks": [...]}."""
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


def _load_json(path):
    if not path:
        return None
    with open(path, encoding="utf-8-sig") as stream:
        return json.load(stream)


def build_parser():
    parser = argparse.ArgumentParser(
        prog="cli.py", description="Day-to-Day Bench run path. Dry by default.")
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("preflight", "dry-run") + STAGE_COMMANDS:
        sub = commands.add_parser(name)
        sub.add_argument("--config", required=True, help="path to run-config.json")
        sub.add_argument("--public-tasks", required=True, help="public task file or folder")
        sub.add_argument("--held-out-tasks", help="held-out task file or folder (private)")
        sub.add_argument("--key-file", help="path to the owner's key file; read only by a live run")
        sub.add_argument("--private-store", help="folder outside the repo for run records")
        sub.add_argument("--max-usd", type=_usd, help="a lower cap for this one run, in USD")
        sub.add_argument("--checklist-samples", help="judge qualification checklist samples")
        sub.add_argument("--outcome-samples", help="judge qualification outcome samples")
        sub.add_argument("--seed", type=int, help="task order seed (recorded either way)")
        if name in STAGE_COMMANDS:
            sub.add_argument("--live", action="store_true", help="ask for a live run")
        if name in ("preflight", "dry-run"):
            sub.add_argument("--stage", choices=STAGE_COMMANDS,
                             default="canary" if name == "preflight" else "full")
        if name == "dry-run" or name in STAGE_COMMANDS:
            sub.add_argument("--stub-grade", action="store_true",
                             help="dry runs only: plumbing check without the graders")
    return parser


PATH_OPTIONS = ("--config", "--public-tasks", "--held-out-tasks", "--key-file",
                "--private-store", "--checklist-samples", "--outcome-samples")


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
        tasks = load_tasks(args.public_tasks, "public")
        if args.held_out_tasks:
            tasks += load_tasks(args.held_out_tasks, "held-out")
        tasks = preflight.normalise_tasks(tasks)
        checklist_samples = _load_json(args.checklist_samples)
        outcome_samples = _load_json(args.outcome_samples)
        if args.command == "preflight":
            if args.private_store:
                books = runner._ledgers(config, args.private_store, True, "preflight")
                remaining = {provider: book.remaining for provider, book in books.items()}
            else:
                remaining = dict(config.caps_usd)
            result = preflight.preflight(
                config, tasks, remaining, stage=stage, max_usd=args.max_usd,
                checklist_samples=checklist_samples, outcome_samples=outcome_samples, out=out)
            return 0 if result["ok"] else 2
        if not args.private_store:
            raise SystemExit("--private-store is needed: run records are never written "
                             "inside the repo")
        if args.stub_grade and live:
            raise SystemExit("--stub-grade is for dry runs only")
        summary = runner.run_stage(
            stage, config, tasks, private_store=args.private_store,
            grade=runner.stub_grade if args.stub_grade else None, live=live,
            key_file=args.key_file if live else None, max_usd=args.max_usd, seed=args.seed,
            checklist_samples=checklist_samples, outcome_samples=outcome_samples, out=out)
    except (runner.LiveRefused, runner.GraderUnavailable, config_module.ConfigError,
            preflight.PreflightRefused, preflight.TaskError, ledger.LedgerError) as problem:
        out("REFUSED: " + str(problem))
        return 2
    out("%s run %s: stage %s, status %s, publishable %s" % (
        "Live" if summary["live"] else "Dry", summary["run_id"], summary["stage"],
        summary["status"], summary["publishable"]))
    for model_id, counts in sorted(summary["report"]["models"].items()):
        out("  %s: planned %d, attempted %d, unstarted %d, pending %d" % (
            model_id, counts["planned"], counts["attempted"], counts["unstarted"],
            counts["pending"]))
    if summary["report"]["stopped_providers"]:
        out("  stopped provider: " + ", ".join(summary["report"]["stopped_providers"]))
    if summary["qualification"] is not None:
        out("  judges qualified: %s" % summary["qualification"]["qualified"])
        for problem in summary["qualification"]["sample_set_problems"]:
            out("  sample set problem: " + problem)
    out("  committed by this run: %s USD" % summary["run_committed_usd"])
    out("  record: " + summary["dir"])
    return 0 if summary["status"] in ("finalised", "complete") else 3


if __name__ == "__main__":
    sys.exit(main())
