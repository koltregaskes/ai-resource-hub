"""Command line for the Day-to-Day Bench run path.

    python -I bench/daily-use/core/cli.py preflight --config ... --public-tasks ...
    python -I bench/daily-use/core/cli.py dry-run   --config ... --public-tasks ... --private-store ...
    python -I bench/daily-use/core/cli.py qualify   ... --key-file ... --live
    python -I bench/daily-use/core/cli.py canary    ... --key-file ... --live
    python -I bench/daily-use/core/cli.py full      ... --key-file ... --live
    python -I bench/daily-use/core/cli.py reconcile --private-store ... --provider openai
        --request-id ... (--usd AMOUNT | --at-reserved-maximum) --note ...

The stages run in that order: qualify, then canary, then full. Without
`--live`, the stage commands are dry runs on a fake transport and the key
file is never read. A key is never accepted on the command line.

Every command, `preflight` and dry runs included, is refused before
anything else is read while OPENAI_API_KEY or ANTHROPIC_API_KEY is set in
the environment. The line names the variable and never shows its value.

The full run goes one pass at a time (pass n is repeat n of every task for
every model). A pass whose planning bound is above what is left of a cap is
not started: the run ends `incomplete` and the command exits with 5.
`--resume <run id>` carries a stopped canary or full run on. It first grades
and judges, from the run record, the slots that already hold a paid answer.
A request that was sent and has no result on record may have been billed:
the resume sends nothing for its slot or judge call and prints the
`reconcile` command for it. `reconcile` enters the provider console figure
for one request in a ledger. It needs no run config and no key file.

Exit codes: 0 finished; 2 refused; 3 interrupted or pending; 4 the judge
qualification finished but named no panel; 5 incomplete, a pass was not
started because its planning bound did not fit the remaining cap. See
RUNNER.md.
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
import keys  # noqa: E402
import ledger  # noqa: E402
import preflight  # noqa: E402
import records  # noqa: E402
import runner  # noqa: E402

STAGE_COMMANDS = ("qualify", "canary", "full")
EXIT_OK, EXIT_REFUSED, EXIT_NOT_FINISHED, EXIT_NOT_QUALIFIED = 0, 2, 3, 4
# A pass of the full run was not started: its planning bound was above the
# remaining cap. Finished passes are kept; the run is not scored. It can be
# resumed only inside the caps it started with.
EXIT_INCOMPLETE = 5


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
            sub.add_argument("--resume", metavar="RUN_ID",
                             help="carry on a stopped canary or full run in staging; no "
                                  "request already in its log is sent again")
    sub = commands.add_parser(
        "reconcile", help="enter the provider console figure for one request in a ledger")
    sub.add_argument("--private-store", required=True,
                     help="folder outside the repo that holds the ledgers")
    sub.add_argument("--provider", required=True, choices=RECONCILE_PROVIDERS)
    sub.add_argument("--request-id", required=True, help="the request id, as printed")
    amount = sub.add_mutually_exclusive_group(required=True)
    amount.add_argument("--usd", type=_usd,
                        help="what the provider console shows for the request, in USD")
    amount.add_argument("--at-reserved-maximum", action="store_true",
                        help="charge the request at its own reservation, the most it can "
                             "have cost")
    sub.add_argument("--note", required=True, help="why, for the ledger")
    sub.add_argument("--dry-ledger", metavar="RUN_ID",
                     help="reconcile in the ledger of this dry run, not the live ledger")
    return parser


PATH_OPTIONS = ("--config", "--public-tasks", "--held-out-tasks", "--held-out-manifest",
                "--key-file", "--private-store", "--checklist-samples", "--outcome-samples")
RECONCILE_PROVIDERS = ("openai", "anthropic")


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


def reconcile(args, out=print):
    """The `reconcile` command: write the charge of one request into a
    provider ledger by hand.

    It is for a request that was sent and has no result on record (a
    resume lists these and sends nothing for them until they are
    reconciled), and for a request held at its reserved maximum. It takes
    the store's execution lock, so it never runs beside a run; opens the
    one ledger file by its path; refuses a request id the ledger does not
    hold; and appends one `reconcile` line. It reads no run config and no
    key file, and it checks no cap: the ledger is opened for reconciliation
    only and can reserve nothing.
    """
    store = args.private_store
    if not os.path.isdir(store):
        out("REFUSED: there is no private store at this place")
        return EXIT_REFUSED
    run_id = args.dry_ledger
    if run_id is not None and (os.path.basename(run_id) != run_id or run_id in ("", ".", "..")):
        out("REFUSED: --dry-ledger takes a run id, not a path")
        return EXIT_REFUSED
    folder = os.path.join(store, "ledgers") if run_id is None \
        else os.path.join(store, "ledgers-dry", run_id)
    path = os.path.join(folder, args.provider + ".jsonl")
    lock = ledger.StoreLock(store)
    try:
        lock.acquire("reconcile")
    except ledger.StoreLocked as busy:
        out("REFUSED: " + str(busy))
        return EXIT_REFUSED
    try:
        book = ledger.ProviderLedger.for_reconciliation(args.provider, path)
        entry = book.entries.get(args.request_id)
        if entry is None:
            out("REFUSED: the %s ledger holds no reservation for request %s; nothing was "
                "written" % (args.provider, args.request_id))
            return EXIT_REFUSED
        before = "an open reservation" if entry["charge"] is None \
            else "a charge of %s USD" % entry["charge"]
        amount = entry["reserved"] if args.at_reserved_maximum else args.usd
        book.reconcile(args.request_id, amount, args.note)
    except ledger.LedgerError as problem:
        out("REFUSED: " + str(problem))
        return EXIT_REFUSED
    finally:
        lock.release()
    out("Reconciled request %s in the %s ledger%s." % (
        args.request_id, args.provider, "" if run_id is None else " of dry run " + run_id))
    out("  charge written: %s USD%s" % (
        amount, " (its reserved maximum)" if args.at_reserved_maximum else ""))
    out("  reserved: %s USD; before this it was %s" % (entry["reserved"], before))
    out("  note: " + args.note)
    out("  The request now counts as used, with no result. A resume goes on with what its "
        "slot or judge call has left.")
    return EXIT_OK


def main(argv=None, out=print):
    argv = list(sys.argv[1:] if argv is None else argv)
    try:
        # First of all, for every command: nothing has been read or parsed yet.
        keys.assert_clean_environment()
    except keys.EnvironmentNotClean as problem:
        out("REFUSED: " + str(problem))
        return EXIT_REFUSED
    _refuse_secrets_on_command_line(argv)
    args = build_parser().parse_args(argv)
    if args.command == "reconcile":
        return reconcile(args, out)
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
            overruns = None
            if args.private_store:
                # The pre-flight only reads, so it does not take the store's
                # execution lock. It says so when a run holds it.
                owner = ledger.store_owner(args.private_store)
                if owner:
                    out("  NOTE: a run is using this private store now (%s). The remaining "
                        "caps below are as read at this moment and may be out of date by "
                        "the time you act on them." % owner)
                books = runner._ledgers(config, args.private_store, True, "preflight")
                remaining = {provider: book.remaining for provider, book in books.items()}
                overruns = runner.overruns_on_file(books)
                if stage != "qualify":
                    qualified, note = runner.check_qualification(
                        config, args.private_store, file_hashes, need_samples=False)
            else:
                remaining = dict(config.caps_usd)
            out("  " + how)
            result = preflight.preflight(
                config, tasks, remaining, stage=stage, max_usd=args.max_usd,
                checklist_samples=checklist_samples, outcome_samples=outcome_samples, out=out,
                overruns=overruns, together=True,
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
            sample_file_hashes=file_hashes, resume=args.resume)
    except (runner.LiveRefused, runner.GraderUnavailable, runner.ScorerUnavailable,
            preflight.PreflightRefused, ledger.LedgerError, records.RecordError,
            keys.EnvironmentNotClean) as problem:
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
    passes = summary.get("passes") or {}
    if passes.get("required"):
        out("  passes complete: %d of %d" % (passes["complete"], passes["required"]))
    if summary["report"].get("interrupt_reason"):
        out("  stopped: " + str(summary["report"]["interrupt_reason"]))
    if summary["run_committed_usd"] is not None:
        out("  committed by this run: %s USD" % summary["run_committed_usd"])
    out("  record: " + summary["dir"])
    if summary.get("awaiting_reconciliation"):
        out("  %d request(s) were sent and have no result on record. Nothing is sent for "
            "their slots or judge calls until each is reconciled with the reconcile command "
            "printed above: %s" % (len(summary["awaiting_reconciliation"]),
                                   ", ".join(summary["awaiting_reconciliation"])))
    if summary["status"] == "incomplete":
        out("  The run is incomplete and is not scored. It can be resumed with --resume %s "
            "once the pass fits what is left of the caps it started with, for example "
            "after held reservations are reconciled. A resume can lower a cap and can "
            "never raise one." % summary["run_id"])
        return EXIT_INCOMPLETE
    if summary["status"] == "pending_judging":
        out("  Slots are still pending on the grader or the judges, so the run is not "
            "scored. --resume %s grades and judges them from the record; the model is "
            "not asked again." % summary["run_id"])
    if summary["status"] not in ("finalised", "complete"):
        return EXIT_NOT_FINISHED
    if qualification is not None and not qualification["qualified"]:
        return EXIT_NOT_QUALIFIED
    return EXIT_OK


if __name__ == "__main__":
    sys.exit(main())
