"""Single-prompt requests through the bench's gate, adapters and ledgers.

No task loader, judge, grader, stage prerequisite or planning gate is used.
Every transport attempt has its own durable reservation and audit trail.
"""

import dataclasses
import json
import os
import re
import time
from decimal import Decimal
from pathlib import Path

try:
    from . import config as config_module, keys, ledger, preflight, providers, records, runner
except ImportError:
    import config as config_module
    import keys
    import ledger
    import preflight
    import providers
    import records
    import runner

OUTPUT_LIMITS = (4096, 8192, 16384, 32768)
TIMEOUTS = {4096: 120, 8192: 120, 16384: 600, 32768: 900}
_COMPONENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,199}\Z")
_DEVICES = {"con", "prn", "aux", "nul"} | {
    prefix + str(n) for prefix in ("com", "lpt") for n in range(1, 10)}


def _component(value):
    # IDs become literal file/directory names, also on Windows.
    if not isinstance(value, str) or not _COMPONENT.fullmatch(value) \
            or value.endswith(".") or value.split(".")[0].casefold() in _DEVICES:
        raise ValueError("prompt and model ids must be safe single filename components")
    return value


def validate_prompts(value):
    if not isinstance(value, list) or not value:
        raise ValueError("prompts must be a non-empty JSON list of id/prompt objects")
    seen = set()
    prompts = []
    for item in value:
        if not isinstance(item, dict) or set(item) != {"id", "prompt"}:
            raise ValueError("each prompt must have exactly id and prompt fields")
        name = _component(item["id"])
        if name.casefold() in seen:
            raise ValueError("prompt ids must be unique, ignoring case")
        if not isinstance(item["prompt"], str) or not item["prompt"].strip():
            raise ValueError("prompt text must be non-empty text")
        seen.add(name.casefold())
        prompts.append(dict(item))
    return prompts


def select_models(config, model_ids):
    if not model_ids or len({name.casefold() for name in model_ids}) != len(model_ids):
        raise ValueError("models must be a non-empty list of unique config model ids")
    available = {spec.model_id: spec for spec in config.models}
    selected = []
    for name in model_ids:
        _component(name)
        if name not in available:
            raise ValueError("every selected model must be in config.models")
        selected.append(available[name])
    return selected


def extract_html(text):
    """First HTML document, excluding Markdown fences and surrounding prose.

    An explicitly labelled HTML fence may contain a fragment; an unfenced
    document must start with a doctype or an html element. Truncated HTML is
    kept to the end of its fence/reply and the receipt carries truncation.
    """
    fence = re.search(r"(?im)^[^\S\r\n]*(`{3,}|~{3,})html[^\S\r\n]*\r?\n", text)
    source = text
    if fence:
        source = text[fence.end():]
        closing = re.search(r"(?m)^[^\S\r\n]*" + re.escape(fence.group(1))
                            + r"[^\S\r\n]*(?:\r?\n|$)", source)
        source = (source[:closing.start()] if closing else source).strip()
    start = re.search(r"<!doctype\s+html\b|<html\b", source, re.I)
    if not start:
        return source if fence else None
    document = source[start.start():]
    end = re.search(r"</html\s*>", document, re.I)
    return document[:end.end()] if end else document.strip()


def _encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, default=str) + "\n"


class _Journal:
    def __init__(self, stream, guard):
        self.stream, self.guard = stream, guard

    def check(self, text):
        if self.guard is not None and self.guard(text):
            raise records.RecordError("a key value was about to be written; refused")

    def append(self, event, **payload):
        text = json.dumps(dict(payload, event=event, at_utc=records.stamp()),
                          ensure_ascii=False, sort_keys=True, default=str) + "\n"
        self.check(text)
        self.stream.write(text.encode("utf-8"))
        self.stream.flush()
        os.fsync(self.stream.fileno())

    def write(self, path, text):
        self.check(text)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        records.atomic_write(os.fspath(path), text.encode("utf-8"))


def _pair(spec, prompt, limit, run_id, budget, transport, loaded, journal, sleep, out):
    adapter = providers.adapter_for(spec)
    secret = loaded.secret(spec.provider) if loaded else keys.Secret.placeholder()
    base = "%s/%s/%s" % (run_id, prompt["id"], spec.model_id)
    attempts, results = [], []
    status, reason, stopped = None, None, False
    worst = ledger.worst_case_usd(ledger.input_token_bound(prompt["prompt"]), limit, spec.price)

    def before_send(number):
        request_id = "%s/%d" % (base, number)
        budget.reserve(spec.provider, request_id, worst)
        journal.append("sent", request_id=request_id, kind="oneshot", model_id=spec.model_id,
                       provider=spec.provider, reserved_usd=str(worst),
                       timeout_seconds=TIMEOUTS[limit],
                       request=adapter.build_request(prompt["prompt"], limit, secret).to_record())

    def after_result(number, result):
        request_id = "%s/%d" % (base, number)
        journal.append("received", request_id=request_id, result=result.to_record(),
                       billable=result.billable)
        settled = budget.settle(spec.provider, request_id, result.billable, spec.price,
                                zero_reason=runner.not_billed_reason(result.status,
                                                                     result.http_status))
        journal.append("done", request_id=request_id, result=result.to_record(),
                       charge_usd=str(settled["charge"]), ledger_flags=settled["flags"],
                       reconciled=settled["reconciled"])
        results.append(result)
        attempts.append(dict(request_id=request_id, charge_usd=str(settled["charge"]),
                             reserved_usd=str(worst), ledger_flags=settled["flags"],
                             result=result.to_record()))
        if ledger.OVERRUN_FLAG in settled["flags"]:
            raise ledger.ReservationExceeded("charge above reservation; stopping all requests")

    try:
        providers.call_with_retries(adapter, transport, prompt["prompt"], limit, secret,
                                    before_send=before_send, after_result=after_result,
                                    sleep=sleep, timeout_seconds=TIMEOUTS[limit])
    except ledger.CapExceeded as problem:
        status, reason = "refused", str(problem)
        journal.append("refused", prompt_id=prompt["id"], model_id=spec.model_id, reason=reason)
        out("SKIPPED %s / %s: %s" % (prompt["id"], spec.model_id, reason))
    except ledger.ReservationExceeded as problem:
        status, reason, stopped = "interrupted", str(problem), True
        out("STOPPED: " + reason)
    result = results[-1] if results else None
    billable = result.billable if result and result.billable else {}
    receipt = {
        "prompt_id": prompt["id"], "model": spec.model_id, "provider": spec.provider,
        "effort": spec.reasoning_effort, "output_limit": limit,
        "input_tokens": (billable.get("input_uncached", 0) + billable.get("cached_input", 0))
                        if billable else None,
        "output_tokens": billable.get("output"), "reasoning_tokens": billable.get("reasoning"),
        "charge_usd": str(sum((Decimal(a["charge_usd"]) for a in attempts), ledger.ZERO)),
        "finish_reason": result.finish_reason if result else None,
        "truncated": result.truncated if result else False,
        "seconds": sum((r.request_time_seconds or 0 for r in results)),
        "utc_time": records.stamp(), "request_id": attempts[-1]["request_id"] if attempts else None,
        "status": status or result.status, "error": reason or (result.error if result else None),
        "attempts": attempts,
    }
    return receipt, result.text if result else "", stopped


def run(config, prompts, model_ids, output_limit, *, out_dir, private_store, live=False,
        key_file=None, max_usd=None, transport=None, live_transport_factory=None,
        sleep=None, out=print):
    """Run every pair once, with the stage's bounded transport retries only.

    Test injection never enables networking: dry defaults to StubTransport;
    live always constructs its transport with an issued live gate pass.
    """
    keys.assert_clean_environment()
    if live:
        runner._refuse_if_disabled()
    prompts = validate_prompts(prompts)
    specs = select_models(config, model_ids)
    if isinstance(output_limit, bool) or not isinstance(output_limit, int) \
            or output_limit not in OUTPUT_LIMITS:
        raise ValueError("unsupported oneshot output limit")
    if not private_store or not out_dir:
        raise ValueError("oneshot needs a private store and output directory")
    effective = dataclasses.replace(config, caps_usd={
        provider: min(cap, config_module.AUTHORISED_CAPS_USD[provider])
        for provider, cap in config.caps_usd.items()})
    run_id = records.new_run_id()
    lock = ledger.StoreLock(private_store)
    try:
        lock.acquire("oneshot-" + run_id)
    except ledger.StoreLocked as problem:
        raise runner.LiveRefused(str(problem)) from None
    try:
        destination = Path(out_dir)
        targets = [destination / "summary.json"] + [
            destination / prompt["id"] / (spec.model_id + suffix)
            for prompt in prompts for spec in specs for suffix in (".txt", ".html", ".json")]
        if any(path.exists() for path in targets):
            raise ValueError("oneshot output files already exist; choose a fresh output directory")
        for prompt in prompts:
            (destination / prompt["id"]).mkdir(parents=True, exist_ok=True)
        books = runner._ledgers(effective, private_store, live, run_id)
        budget = ledger.Budget(books, run_id, max_usd)
        overruns = runner.overruns_on_file(books)
        refusals = preflight.overrun_refusals(config, overruns)
        if refusals:
            raise runner.LiveRefused(" | ".join(refusals))
        loaded = None
        if live:
            gate, _, _ = runner.open_live_gate(
                live=True, config=config, key_file=key_file, tasks=[], stage="oneshot",
                private_store=private_store, remaining_caps=budget.remaining(), overruns=overruns,
                out=out)
            loaded = gate.keys
            transport = (live_transport_factory or providers.UrllibTransport)(gate)
        else:
            transport = transport or runner.StubTransport()
        log_path = Path(private_store) / "oneshot" / (run_id + ".jsonl")
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with log_path.open("xb") as stream:
            journal = _Journal(stream, loaded.leaks_into if loaded else None)
            journal.append("started", run_id=run_id, live=bool(live), config_sha256=config.sha256,
                           caps_usd=effective.caps_usd, max_usd=max_usd, output_limit=output_limit,
                           models=[spec.public() for spec in specs])
            summary = {"run_id": run_id, "live": bool(live), "log": str(log_path), "pairs": [],
                       "total_cost_per_provider": {provider: "0" for provider in books}}
            stopped = False
            for prompt in prompts:
                for spec in specs:
                    if stopped:
                        receipt = {"prompt_id": prompt["id"], "model": spec.model_id,
                                   "provider": spec.provider, "status": "skipped_after_overrun",
                                   "charge_usd": "0", "request_id": None,
                                   "effort": spec.reasoning_effort, "output_limit": output_limit,
                                   "input_tokens": None, "output_tokens": None, "reasoning_tokens": None,
                                   "finish_reason": None, "truncated": False, "seconds": 0,
                                   "utc_time": records.stamp(), "attempts": []}
                        text = ""
                        out("SKIPPED %s / %s: earlier charge above reservation" %
                            (prompt["id"], spec.model_id))
                    else:
                        receipt, text, stopped = _pair(
                            spec, prompt, output_limit, run_id, budget, transport, loaded, journal,
                            sleep or (time.sleep if live else None), out)
                    base = destination / prompt["id"] / spec.model_id
                    journal.write(str(base) + ".txt", text)
                    html = extract_html(text)
                    if html is not None:
                        journal.write(str(base) + ".html", html)
                    journal.write(str(base) + ".json", _encoded(receipt))
                    summary["pairs"].append(receipt)
                    summary["total_cost_per_provider"] = {
                        provider: str(book.committed(run_id + "/")) for provider, book in books.items()}
                    summary["status"] = "running"
                    if len(summary["pairs"]) == len(prompts) * len(specs):
                        summary["status"] = "complete" if all(
                            pair["status"] == providers.OK for pair in summary["pairs"]) else "incomplete"
                    journal.write(destination / "summary.json", _encoded(summary))
            journal.append("finished", status=summary["status"],
                           total_cost_per_provider=summary["total_cost_per_provider"])
            return summary
    finally:
        lock.release()


def command(args, out=print):
    """CLI entry; invoked after the environment and command-line key guard."""
    try:
        if args.live:
            runner._refuse_if_disabled()
        config = config_module.load_config(args.config, mode="live" if args.live else "dry")
        with open(args.prompts, encoding="utf-8-sig") as stream:
            prompts = json.load(stream)
        summary = run(config, prompts, [name.strip() for name in args.models.split(",")],
                      args.output_limit, out_dir=args.out_dir, private_store=args.private_store,
                      live=args.live, key_file=args.key_file, max_usd=args.max_usd, out=out)
    except (ValueError, runner.LiveRefused, ledger.LedgerError, records.RecordError,
            keys.EnvironmentNotClean) as problem:
        # Do not echo parser contents, file contents or provider exception text.
        out("REFUSED: " + ("invalid JSON input" if isinstance(problem, json.JSONDecodeError)
                           else str(problem)))
        return 2
    except OSError:
        out("REFUSED: oneshot could not read or write a file")
        return 2
    out("%s oneshot %s: %s; %d pairs" % (
        "Live" if summary["live"] else "Dry", summary["run_id"], summary["status"],
        len(summary["pairs"])))
    for provider, cost in summary["total_cost_per_provider"].items():
        out("  %s: %s USD" % (provider, cost))
    return 0 if summary["status"] == "complete" else 3
