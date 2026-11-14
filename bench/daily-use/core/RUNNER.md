# Day-to-Day Bench: the run path

Status: built and tested offline only. Nothing here has called a model provider. The request and reply shapes were read against the providers' API references on 14 November 2026 (see below). `LIVE_ENABLED` in `runner.py` ships as `False`, so every run is a dry run on a fake transport until that line is changed in a reviewed commit.

The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`. This page says how the code carries it out.

## How the pieces fit

| File | Job |
|---|---|
| `keys.py` | Reads the owner's key file line by line and keeps only the first listed name per provider. Values live in `Secret` objects that never print. Holds the check that refuses every start while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. |
| `config.py` | Loads and checks `run-config.json`: every setting as an actual value, a dated price receipt per model, two judges from two providers, the judge candidates per provider, caps, key names. Every judge and every judge candidate must have an output limit of at most `JUDGE_MAX_OUTPUT_TOKENS` (400), in dry and live validation alike. Rejects anything that looks like a secret. `TO PIN BEFORE RUN` values pass a dry run and block a live one. Settings a provider would reject (temperature where it is not accepted, an unknown Anthropic API version, an effort value the API does not have) are refused outright. |
| `providers.py` | `OpenAIResponses` and `AnthropicMessages` on an injectable transport. Builds the request, reads the answer, the finish reason and the raw usage, and sorts failures into transport error (retried, waiting for a `Retry-After` of up to 60 seconds), provider error and timeout (not retried). A 429 that says the account is out of credit or over a spend limit is a provider error. Holds the real `UrllibTransport`, which only the live gate can build. |
| `ledger.py` | One durable ledger per provider, shared by model and judge calls. Reserve the worst case before each request, settle to the actual charge after it, refuse at the cap. The worst case uses `input_token_bound`, an upper bound on input tokens, and the full output limit. Money is `Decimal`. |
| `preflight.py` | Prints expected, planning bound and absolute bound for the whole plan, whether or not the run is refused, and refuses when the planning bound is above a remaining cap. Both bounds count input with the ledger's `input_token_bound`. Counts qualification for every judge candidate and says how the judging was costed. |
| `judges.py` | Judge prompts, JSON verdicts with one retry, the combine rules, qualification scoring and the choice of panel. |
| `records.py` | Run, slot and request ids; the staging folder; finalising with a SHA-256 manifest; the public record through an allowlist; amendments. |
| `runner.py` | Slots, requests and retries; judging; the stages; the qualification record; the live gate; the seam with the loader, the graders and the scorer. |
| `cli.py` | The command line. |

One request goes like this: work out the worst case, reserve it in the provider ledger (fsynced), append the "sent" line to the run record (fsynced), send, append the "done" line, settle the ledger. One request is in flight at a time.

## What a reservation covers

A reservation has to be at least what the request can cost, or the cap is not a cap. It is worked out by `ledger.worst_case_usd` from two figures.

**Input: an upper bound, not an estimate.** `ledger.input_token_bound` is the UTF-8 byte length of every text field sent (the system text, if there were any, and the prompt or messages) plus a fixed framing allowance of 256 tokens per request (`FRAMING_ALLOWANCE_TOKENS`). The reason: a byte-level BPE tokeniser starts from the bytes of the text and only merges them, so it never emits more tokens than the text has bytes. The framing allowance covers the role and message wrappers the provider adds. Code, punctuation and non-English text, which a characters-per-token estimate undercounts, are covered because the count is in bytes. The adapters send one text field, the prompt, and no system text.

This one function is behind every input figure in a reservation, in the pre-flight planning bound and in the absolute bound. There is no second estimate. The input side is priced at the dearer of the input rate and the cached-input rate.

**Output: the full limit.** The output side is the output limit sent with the request (4,096 or 8,192 for a task, at most 400 for a judge) at the output price. Reasoning and thinking tokens are inside the output limit on both APIs and are billed as output, so the limit covers them. If a price receipt says reasoning is billed separately, the limit is priced at the output rate plus the reasoning rate.

**The pre-flight's one planning assumption.** A judge request holds the model's answer, and at pre-flight time the answer does not exist. The two bounds plan it at 4 bytes per token of the task's output limit (`ANSWER_BYTES_PER_TOKEN` in `preflight.py`), each byte counted as one token. This is an assumption about the size of an answer, not a bound: a token can be longer than 4 bytes. It cannot break the cap, because at run time the judge request is reserved from the bytes of the real answer; an answer longer than planned can only stop the run early at the cap.

**The expected figure** in the pre-flight keeps a softer size for input (3 characters per token). It is labelled as expected, it is for reading only, and it never feeds a reservation, a bound or a cap check.

**The backstop.** If a settled charge is ever above its reservation, the ledger writes the settle line with the charge, the reservation and the flag `charge_above_reservation`. The runner then sends nothing more: the next request, a retry or a judge call, is refused before dispatch, the paid answer is kept on its slot, and the run ends `interrupted` in staging. The command exits with 3. An overrun on the very last request of a stage also ends the stage interrupted, so it is never finalised.

**A possible later tightening.** Both providers have a token-count endpoint that would give the exact input count before a request. It needs a key and a network call, which nothing before the first paid step may make, so it is not used. It could replace the byte bound for the paid stages later; the byte bound would stay as the pre-flight figure.

A judge verdict is one JSON object. It may come bare or inside a single Markdown code fence; the fence is stripped before parsing, so that habit does not cost a retry. Anything else (text before or after, two fences, JSON in the wrong shape) is malformed and is retried once.

Where things are written, all inside the private store (a folder outside the repo, given with `--private-store`):

- `runs/_staging/<run id>/` while a run is in progress, interrupted or pending;
- `runs/<run id>/` once finalised, never written to again;
- `public/<run id>/public-record.json`, built by the allowlist (full runs only);
- `amendments/<run id>/<n>/`;
- `ledgers/<provider>.jsonl` for live runs, `ledgers-dry/<run id>/` for dry runs;
- `qualification/<run id>.json`, the signed-off record of a live judge qualification, written once;
- `stages.jsonl`, the list of finished live stages.

## The stages: qualify, then canary, then full

**1. `qualify`** is the first paid step. It needs both sample files.

- The config lists the candidates per provider in `judge_candidates: {"openai": [...], "anthropic": [...]}`, each a full judge entry with its own price receipt. Without that field the two `judges` are the only candidates.
- Every candidate is qualified by itself against the frozen samples, cheapest first on each side: one call per sample (84 each with the v1 files: 64 checklist samples and 20 outcome samples).
- Reported per candidate: overall item agreement, agreement on the reference-true items, agreement on the reference-false items, agreement on the outcome samples, and pass or fail. The thresholds are the method's: at least 0.90 overall, 0.85 on true items, 0.85 on false items, and 0.90 on the outcome samples. A judge that always says true fails on the false items.
- The recommended panel is, on each provider side, the cheapest candidate that passed. "Cheapest" is the simple sum of the input and output price per million tokens in the candidate's price receipt. The two judges always come from two different providers.
- If no candidate passed on a side, the stage fails, says which side, and names no panel. There is never half a panel. The exit code is 4.
- A sample set that does not meet the method's rules for size and balance stops the stage before any call.

**The qualification record.** A finished live qualification writes `qualification/<run id>.json`. It holds, for every candidate, the judge model id, a fingerprint of its settings, its price sum and each agreement figure with pass or fail; the SHA-256 of both sample files; the thresholds; the task set version; the panel; the date; who signed off the run config (`approved_by`); and the manifest hash of the qualification run. `record_sha256` covers the rest of the record, so an edited record is not accepted. A dry qualification writes no record and opens nothing.

**2. `canary`** needs a record that still stands, and its answers are judged by the qualified panel. **3. `full`** needs the same record and a finished canary that ran under it. The latest live qualification is the one that counts. It stops standing, and both stages are refused, when:

- it did not pass;
- the record file is missing or has been edited;
- either sample file has a different SHA-256 (the sample files are given to every stage so this can be checked);
- the task set version has changed;
- the config's `judges` differ from the recorded panel, by model id or by any setting that shapes a reply (API version, effort, temperature, output limit). A re-read price does not undo a qualification.

So after `qualify`, set `judges` in the run config to the panel it printed. The canary and the full run read the panel from the record and refuse a config that names anyone else.

## The seam with the other bench modules

The loader, the graders and the scorer come from other pull requests. Nothing here imports them at the top of a module: they are imported lazily, as the `core` package, and the run path says plainly when one is missing.

| Module | Interface used | Used by |
|---|---|---|
| `core/tasks.py` | `load_tasks(public_dir, held_out_dir=None, *, manifest_path=None)`, returning task objects | `cli.py`, when the public path is a folder. It validates the set and checks every held-out file against the manifest. Without it a built-in reader is used, which checks no hashes, and the output says which was used. |
| `core/outcome.py` | `decide(task, reply, judge_verdicts=None)` returning `{outcome, pass, pending, detail}`. `detail["pending_on"]` lists `"outcome"` and/or `"checklist"`; `detail["needs_judge"]` lists the judged checks still needed as `{check_id, text}` | `runner.default_grade` |
| `core/graders.py` | `grade(task, reply)` returning a result with `.checks` (each with `.id`, `.by`, `.status`); `apply_judge_verdicts(result, verdicts_by_judge)` with `verdicts_by_judge = {judge model id: {check id: true or false}}`; `formula_engine_versions()` | `runner.default_grade`, `runner.check_default_grader` |
| `core/scores.py` | `score_run(slot_records)` | `runner.default_scores`, the default for a full run |

How a slot is graded with the default grader:

1. `decide(task, reply)`. If nothing is pending, that is the result.
2. If it is pending on the checklist, both judges are asked about the judged checks only, and their verdicts go back through `decide(task, reply, judge_verdicts=...)`. The check-level results come from `apply_judge_verdicts`.
3. If it is pending on the outcome, both judges classify the reply. Agreement gives that outcome and disagreement gives `answered`. The pass then follows the method's table: on a task with no knowable answer only `abstained` passes; on an answerable task the grader has already rejected the reply, so the pass stays false.
4. A judge left unresolved after its one retry leaves the slot pending, with outcome `judge_unresolved` when it was the outcome that could not be settled.

A different grader can be injected: `grade(task, reply)` returns `{"outcome", "pass", "pending", "needs_judge"}`, where `needs_judge` lists `"outcome"` and/or judged checks, and the runner calls `grade(task, reply, judged=...)` with the panel's results. A grader that does not take `judged` gets a conservative fallback that leaves anything it cannot decide pending.

Before the first request of a canary or a full run, the default grader is checked: `core/outcome.py` must load, and if the task set has a formula task the formula engine must start. A live full run is also refused without `core/scores.py`. If a grader still fails in the middle of a run, the paid answer is kept on its slot as pending and the run stops.

**The slot record.** Every slot row the runner writes can be handed straight to `score_run`. It carries `model`, `task_id`, `family`, `split`, `repeat`, `outcome`, `pass`, `truncated`, `time_s`, `cost_usd`, `needed_judge_classification` and `checks`:

- `checks` is a list of `{"id", "by": "script" | "judge", "state": "pass" | "fail" | "disputed" | "unresolved"}`. It is filled only on an `answered` slot, and the slot's pass is the AND of the list. A judged check that was never run, because a script check had already failed, is left out.
- `cost_usd` is the model's own requests as a plain number, with the exact figure beside it in `cost_usd_exact`. Judge cost is separate, in `judge_cost_usd`.
- `time_s` is the time of the request that produced the answer, or null when there was none.

## The live gate

**Every start, dry or live.** Before anything else is read, every command (`preflight` and `dry-run` included) and both programmatic entry points (`runner.run_stage`, `runner.open_live_gate`), as well as `preflight.preflight`, refuse while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in the environment. The command prints `REFUSED:` with the name of the variable, never its value, and exits with 2. No config, task file, sample file, key file or store is opened first.

A live stage runs only if all of these hold, checked in this order:

1. `LIVE_ENABLED = True` in `runner.py`, changed in a reviewed commit;
2. `--live` was given;
3. the config has `live_approved: true` and `approved_by` filled in;
4. the config has no `TO PIN BEFORE RUN` value, no null cached rate and no ended promotion;
5. `--key-file` was given;
6. neither provider key variable is set in the environment (this is checked first of all, as above);
7. the earlier steps are on record: `qualify` needs nothing before it; `canary` needs a passed judge qualification record that still stands, with a panel equal to the config's `judges`; `full` needs that and a finished canary that ran under the same record;
8. the pre-flight passes;
9. the keys load from the key file. This is the last step, so the file is read only when everything else has passed.

With `LIVE_ENABLED = False`, `--live` is refused before the config, the key file or any transport is touched. Without `--live`, a `--key-file` path is ignored and never opened.

## Checked against the provider references on 14 November 2026

The request and reply shapes at the top of `providers.py` were read against the pages below. This was reading only: no request has been sent, so the canary is still the first real exchange.

**OpenAI Responses API.** Sources: [create a response](https://developers.openai.com/api/reference/resources/responses/methods/create), [reasoning](https://developers.openai.com/api/docs/guides/reasoning), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [error codes](https://developers.openai.com/api/docs/guides/error-codes), [rate limits](https://developers.openai.com/api/docs/guides/rate-limits), [using GPT-6](https://developers.openai.com/api/docs/guides/latest-model), [your data](https://developers.openai.com/api/docs/guides/your-data).

- Confirmed: `POST https://api.openai.com/v1/responses` with `Authorization: Bearer`; `input` as a plain string; `store: false` (the default is true); `max_output_tokens` covers reasoning plus visible output, minimum 16; `reasoning.effort`; the `output[]` message shape with `output_text` and `refusal` parts; `status` and `incomplete_details.reason` (`max_output_tokens`, `content_filter`, `max_messages`, `steered`); usage field names; cached tokens are a part of `input_tokens` and reasoning tokens a part of `output_tokens`, billed as output.
- Changed: **temperature is no longer sent.** The GPT-6 guide says to remove `temperature` and `top_p` when the effort is not `none`. The config refuses `send_temperature: true` unless effort `none` is sent.
- Changed: **prompt caching is turned off** with `prompt_cache_options: {"mode": "explicit"}` and no breakpoint. On GPT-5.6 and later the default mode writes any prompt of 1,024 tokens or more to the cache and bills those tokens at 1.25 times the input rate. The price receipt has no cache-write rate and the worst-case reservation assumes the plain input rate. If a reply still reports `cache_write_tokens`, that request keeps its full reservation.
- Changed: a 200 whose `status` is `failed`, `cancelled`, `queued` or `in_progress` is a provider error, not an empty answer.
- Changed: a 429 with `insufficient_quota`, `credit_balance_exhausted`, `organization_spend_limit_exceeded`, `project_spend_limit_exceeded` or `organization_usage_limit_exceeded` is not retried. The docs say retrying cannot help.
- Effort values differ by model: `gpt-6-astra` and `gpt-6.1-sol` take `low` to `max` and reject `none`; `gpt-6.1-terra` and `gpt-6-luna` also take `none`. The default is `medium` on Sol, Terra and Luna. The Astra page does not name its default; the API reference gives `medium` as the general default.
- `api_version`: there is no version header. The example records `v1`.

**Anthropic Messages API.** Sources: [create a message](https://platform.claude.com/docs/en/api/messages/create), [API versions](https://platform.claude.com/docs/en/api/versioning), [migrating to 2026-10-21](https://platform.claude.com/docs/en/api/migration-2026-10-21), [effort](https://platform.claude.com/docs/en/build-with-claude/effort), [thinking](https://platform.claude.com/docs/en/build-with-claude/thinking), [errors](https://platform.claude.com/docs/en/api/errors), [rate limits](https://platform.claude.com/docs/en/api/rate-limits), [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), [refusals](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback), [API overview](https://platform.claude.com/docs/en/api/overview).

- Confirmed: `POST https://api.anthropic.com/v1/messages`; `x-api-key` (now described as a legacy form, still supported; `Authorization: Bearer` is listed first); `anthropic-version` is required; `max_tokens` covers thinking tokens; `output_config.effort` with `low`, `medium`, `high`, `xhigh`, `max`, no beta header; text in `content[]` blocks of type `text`; `stop_reason`; `usage.input_tokens` excludes cache reads and writes; thinking tokens are inside `output_tokens`.
- Changed: **the `anthropic-version` value is `2026-10-21`** (current) or `2023-06-01`. The config refuses anything else.
- Changed: **temperature is no longer sent.** Version `2026-10-21` returns a 400 for `temperature`, `top_p` or `top_k` on every model. The config allows `send_temperature: true` only with `2023-06-01`, where Claude 4.7 and later accept only the default anyway.
- Changed: `stop_reason` `model_context_window_exceeded` counts as truncated, as the docs say to treat it. `refusal` is an HTTP 200 with empty content and is flagged `refusal`.
- Changed: `usage.output_tokens_details.thinking_tokens` is read as the reasoning count. It is a part of `output_tokens`.
- Changed: a 429 whose `error.details.error_code` is `enforced_spend_limit_reached` (the monthly tier cap) is not retried. It has no `Retry-After` and keeps failing until the next month.
- No `thinking` field is sent, so each model's default applies: adaptive thinking, on. Opus 5.5 cannot turn thinking off; Sonnet 5.5 rejects `disabled`; Haiku 5.5 accepts `disabled` at effort `high` or below. Default effort: `medium` on Opus 5.5 and Haiku 5.5, `high` on Sonnet 5.5.

**Retries.** 429 and 5xx are retried on both APIs, which matches the docs (Anthropic: 429 `rate_limit_error`, 500 `api_error`, 504 `timeout_error`, 529 `overloaded_error`; OpenAI: 429 rate limit or `slow_down`, 500, 503 `server_is_overloaded`). Both send `Retry-After` in seconds on some 429 and 503 replies. The wait before a retry is now the longer of the fixed wait (2 s, then 8 s) and `Retry-After`; a `Retry-After` above 60 seconds ends the attempt.

**Model ids and prices.** All seven ids in the example exist on the model pages with those exact strings ([OpenAI models](https://developers.openai.com/api/docs/models), [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Claude models](https://platform.claude.com/docs/en/about-claude/models/overview), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)). Every price in the example matched the page. The Anthropic cache-read rates are now filled in: 0.20 (Opus 5.5), 0.10 (Sonnet 5.5), 0.01 (Haiku 5.5). Two long-prompt rates exist and are not modelled: OpenAI charges 2 times input and 1.5 times output above 272,000 input tokens, and Haiku 5.5 charges five times as much above 100,000 prompt tokens. The task prompts are far below both.

## Still to verify before the first paid step

- **The judge output limit of 400 tokens.** The limit itself is enforced: a judge or a judge candidate above 400 is refused by the config check, and again by the pre-flight. What is still to verify is that 400 is enough. On both APIs the limit also covers reasoning or thinking tokens, and thinking is on by default on all three Claude models. OpenAI's own advice is to leave at least 25,000 tokens for reasoning and output when starting out. Confirm, at the effort pinned for each candidate, that a verdict for the task with the most judged checks fits. A cut-off verdict is malformed, is retried once and then leaves the check unresolved, and in qualification it counts as disagreement.
- **The task limits of 4,096 and 8,192 tokens** cover reasoning as well, for the same reason. An answer can be cut off, or come back empty, with the whole limit spent on reasoning. The canary should show the truncation rate at the pinned effort.
- **Effort and data retention** are still `TO PIN BEFORE RUN` in the example. They are the owner's choices.
- **Prices:** re-read on the day of the run. OpenAI lists a 10% uplift for regional processing; the receipts assume the global endpoint.
- **Billing assumptions in the ledger:** a request answered with an HTTP error status is settled at zero. A timeout or a connection failure keeps its full reservation until the console figure is entered with `ProviderLedger.reconcile`. Cache-creation tokens (Anthropic) and cache-write tokens (OpenAI) are not priced, so any such request keeps its full reservation. An Anthropic refusal before any output is not billed in most categories, though usage is reported; the ledger charges it, which errs on the safe side.
- **Timeout:** calls are not streamed, so time to first token is left empty. Confirm that a full-length answer returns inside 120 seconds without streaming. Anthropic advises streaming for long requests.
- **The real transport:** `UrllibTransport` has never been exercised, including its reading of `Retry-After`. It allows only the two provider hosts over https, follows no redirects and uses no proxy.
- **Remaining credit:** confirm it in each provider console; the caps are planned figures.

## Command sequence

Run from the repo root in PowerShell. `python -I` keeps the interpreter isolated. Every stage is given both sample files, because the canary and the full run check them against the qualification record.

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

# 3. Judge qualification: the first paid step. Every candidate against the frozen samples.
python -I $core qualify @common --key-file "<path to key file>" --live
#    It prints the figures per candidate and the recommended panel.
#    Set judges in the run config to that panel, and have the change reviewed.

# 4. Canary: 2 public tasks per model, 1 repeat, judged by the qualified panel. Never published.
python -I $core canary @common --key-file "<path to key file>" --live
#    Stop here. Review the adapters, usage fields, finish reasons and charges.

# 5. The full run.
python -I $core full @common --key-file "<path to key file>" --live
```

The pre-flight says how the judging of the canary and the full run was costed. Before a qualification is on record it uses the worst case: on each provider side, the candidate whose judging would cost the most, since any candidate could still be the one that passes. Once a qualification stands it uses the recorded panel. With `--private-store` the `preflight` command reads the ledgers and the record; give `--stage canary` or `--stage full` to see the plan still to run after the earlier stages.

`--max-usd <amount>` sets a lower cap for one run. It can only lower: the provider caps always apply as well. `--seed <n>` fixes the task order; the seed is recorded either way. `--held-out-manifest <path>` names the manifest when it is not beside the public folder.

Exit codes: 0 finished; 2 refused (the reason is printed after `REFUSED:`); 3 interrupted or pending, which includes a run stopped because a charge was above its reservation (the reason is printed after `stopped:`); 4 the qualification finished but named no panel. A mistake in the command itself exits with 1 or 2 from the argument parser. No refusal exits with 0.

## Not built yet

- Completing the judging of a run left pending in staging. Such a run stays unpublished, as the method requires, but there is no command to finish it.
- Grading a slot that was left pending because the grader could not run. The answer is kept; there is no command to grade it later.
- Streaming, and so time to first token.
- A command for console reconciliation; only the ledger function exists.
