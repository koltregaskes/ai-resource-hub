# Day-to-Day Bench: the run path

Status: built and tested offline only. Nothing here has called a model provider. `LIVE_ENABLED` in `runner.py` ships as `False`, so every run is a dry run on a fake transport until that line is changed in a reviewed commit.

The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`. This page says how the code carries it out.

## How the pieces fit

| File | Job |
|---|---|
| `keys.py` | Reads the owner's key file line by line and keeps only the first listed name per provider. Values live in `Secret` objects that never print. Refuses to start while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. |
| `config.py` | Loads and checks `run-config.json`: every setting as an actual value, a dated price receipt per model, two judges from two providers, caps, key names. Rejects anything that looks like a secret. `TO PIN BEFORE RUN` values pass a dry run and block a live one. |
| `providers.py` | `OpenAIResponses` and `AnthropicMessages` on an injectable transport. Builds the request, reads the answer, the finish reason and the raw usage, and sorts failures into transport error (retried), provider error and timeout (not retried). Holds the real `UrllibTransport`, which only the live gate can build. |
| `ledger.py` | One durable ledger per provider, shared by model and judge calls. Reserve the worst case before each request, settle to the actual charge after it, refuse at the cap. Money is `Decimal`. |
| `preflight.py` | Prints expected, planning bound and absolute bound for the whole plan, and refuses when the planning bound is above a remaining cap. |
| `judges.py` | Judge prompts, strict JSON verdicts with one retry, the combine rules and qualification scoring. |
| `records.py` | Run, slot and request ids; the staging folder; finalising with a SHA-256 manifest; the public record through an allowlist; amendments. |
| `runner.py` | Slots, requests and retries; judging; the stages; the live gate. |
| `cli.py` | The command line. |

One request goes like this: count the worst case, reserve it in the provider ledger (fsynced), append the "sent" line to the run record (fsynced), send, append the "done" line, settle the ledger. One request is in flight at a time.

Grading is injected. `grade(task, reply)` returns `{"outcome", "pass", "pending", "needs_judge"}`. `needs_judge` lists `"outcome"` and/or judged check ids. The runner then asks both judges and calls `grade(task, reply, judged=...)` for the final result, where `judged` is `{"outcome": ..., "checks": {id: "pass" | "fail" | "disputed" | "judge_unresolved" | "not_needed"}}`. A grader that does not take `judged` gets a conservative fallback that leaves anything it cannot decide pending. The default grader imports `core/outcome.py` lazily and says so plainly if it is absent.

Where things are written, all inside the private store (a folder outside the repo, given with `--private-store`):

- `runs/_staging/<run id>/` while a run is in progress, interrupted or pending;
- `runs/<run id>/` once finalised, never written to again;
- `public/<run id>/public-record.json`, built by the allowlist (full runs only);
- `amendments/<run id>/<n>/`;
- `ledgers/<provider>.jsonl` for live runs, `ledgers-dry/<run id>/` for dry runs;
- `stages.jsonl`, the list of finished live stages.

## The live gate

A live stage runs only if all of these hold, checked in this order:

1. `LIVE_ENABLED = True` in `runner.py`, changed in a reviewed commit;
2. `--live` was given;
3. the config has `live_approved: true` and `approved_by` filled in;
4. the config has no `TO PIN BEFORE RUN` value, no null cached rate and no ended promotion;
5. `--key-file` was given;
6. neither provider key variable is set in the environment;
7. the earlier steps are on record: `qualify` needs a finished live canary, `full` needs that and both named judges qualified;
8. the pre-flight passes;
9. the keys load from the key file. This is the last step, so the file is read only when everything else has passed.

With `LIVE_ENABLED = False`, `--live` is refused before the config, the key file or any transport is touched. Without `--live`, a `--key-file` path is ignored and never opened.

## Verify against the provider references before the canary

None of the following has been checked against live documentation or a live call. The request and reply shapes are written out at the top of `providers.py`.

- **OpenAI Responses API:** `POST /v1/responses`; `input` as a plain string; that `max_output_tokens` caps reasoning plus visible output; `store: false`; the `reasoning.effort` values and whether each model accepts `temperature`; the `output[]` message shape; `status` and `incomplete_details.reason`; the usage field names; that cached tokens are a part of `input_tokens` and reasoning tokens a part of `output_tokens`; what `api_version` should record, since no version header is sent.
- **Anthropic Messages API:** `POST /v1/messages`; the `anthropic-version` value; that `max_tokens` includes thinking tokens; the name and values of the effort setting (sent here as `output_config.effort`); whether `temperature` may be sent with it; the `stop_reason` values; the usage field names; that thinking tokens are inside `output_tokens`.
- **Prices:** re-read every price; fill the Anthropic cached rates; confirm how reasoning tokens are billed and that no long-prompt surcharge applies.
- **Billing assumptions in the ledger:** a request answered with an HTTP error status is settled at zero. A timeout or a connection failure keeps its full reservation until the console figure is entered with `ProviderLedger.reconcile`. Cache-creation tokens on Anthropic are not priced, so any such request keeps its full reservation.
- **Timeout:** calls are not streamed, so time to first token is left empty. Confirm that a full-length answer returns inside 120 seconds without streaming.
- **The real transport:** `UrllibTransport` has never been exercised. It allows only the two provider hosts over https, follows no redirects and uses no proxy.
- **Data retention:** write each provider's setting into the config.
- **Remaining credit:** confirm it in each provider console; the caps are planned figures.

## Command sequence

Run from the repo root in PowerShell. `python -I` keeps the interpreter isolated.

```powershell
$core   = "bench/daily-use/core/cli.py"
$common = @("--config", "bench/daily-use/run-config.json",
            "--public-tasks", "bench/daily-use/task-set-v1/public",
            "--held-out-tasks", "<private folder>\held-out",
            "--checklist-samples", "<private folder>\checklist-samples.json",
            "--outcome-samples", "<private folder>\outcome-samples.json",
            "--private-store", "<private folder>\store")

# 1. Figures for the whole plan. No calls.
python -I $core preflight @common

# 2. Rehearsal on the fake transport. No calls, no keys.
python -I $core dry-run @common

# 3. Canary: the first paid step. 2 public tasks per model, 1 repeat. Never published.
python -I $core canary @common --key-file "<path to key file>" --live
#    Stop here. Review the adapters, usage fields, finish reasons and charges.

# 4. Judge qualification against the frozen samples.
python -I $core qualify @common --key-file "<path to key file>" --live

# 5. The full run.
python -I $core full @common --key-file "<path to key file>" --live
```

`--max-usd <amount>` sets a lower cap for one run. `--seed <n>` fixes the task order; the seed is recorded either way. Exit code 0 means finalised, 2 refused, 3 interrupted or pending.

## Not built yet

- Completing the judging of a run left pending in staging. Such a run stays unpublished, as the method requires, but there is no command to finish it.
- Streaming, and so time to first token.
- A command for console reconciliation; only the ledger function exists.
- Pacing from a provider's `Retry-After` header. Retries wait a fixed 2 then 8 seconds.
