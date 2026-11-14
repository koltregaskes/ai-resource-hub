# Day-to-Day Bench: the run path

Status: built and tested offline only. Nothing here has called a model provider. `LIVE_ENABLED` in `runner.py` ships as `False`, so every run is a dry run on a fake transport until that line is changed in a reviewed commit.

The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`. This page says how the code carries it out.

## How the pieces fit

| File | Job |
|---|---|
| `keys.py` | Reads the owner's key file line by line and keeps only the first listed name per provider. Values live in `Secret` objects that never print. Refuses to start while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. |
| `config.py` | Loads and checks `run-config.json`: every setting as an actual value, a dated price receipt per model, two judges from two providers, the judge candidates per provider, caps, key names. Rejects anything that looks like a secret. `TO PIN BEFORE RUN` values pass a dry run and block a live one. |
| `providers.py` | `OpenAIResponses` and `AnthropicMessages` on an injectable transport. Builds the request, reads the answer, the finish reason and the raw usage, and sorts failures into transport error (retried), provider error and timeout (not retried). Holds the real `UrllibTransport`, which only the live gate can build. |
| `ledger.py` | One durable ledger per provider, shared by model and judge calls. Reserve the worst case before each request, settle to the actual charge after it, refuse at the cap. Money is `Decimal`. |
| `preflight.py` | Prints expected, planning bound and absolute bound for the whole plan, whether or not the run is refused, and refuses when the planning bound is above a remaining cap. Counts qualification for every judge candidate and says how the judging was costed. |
| `judges.py` | Judge prompts, JSON verdicts with one retry, the combine rules, qualification scoring and the choice of panel. |
| `records.py` | Run, slot and request ids; the staging folder; finalising with a SHA-256 manifest; the public record through an allowlist; amendments. |
| `runner.py` | Slots, requests and retries; judging; the stages; the qualification record; the live gate; the seam with the loader, the graders and the scorer. |
| `cli.py` | The command line. |

One request goes like this: count the worst case, reserve it in the provider ledger (fsynced), append the "sent" line to the run record (fsynced), send, append the "done" line, settle the ledger. One request is in flight at a time.

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

A live stage runs only if all of these hold, checked in this order:

1. `LIVE_ENABLED = True` in `runner.py`, changed in a reviewed commit;
2. `--live` was given;
3. the config has `live_approved: true` and `approved_by` filled in;
4. the config has no `TO PIN BEFORE RUN` value, no null cached rate and no ended promotion;
5. `--key-file` was given;
6. neither provider key variable is set in the environment;
7. the earlier steps are on record: `qualify` needs nothing before it; `canary` needs a passed judge qualification record that still stands, with a panel equal to the config's `judges`; `full` needs that and a finished canary that ran under the same record;
8. the pre-flight passes;
9. the keys load from the key file. This is the last step, so the file is read only when everything else has passed.

With `LIVE_ENABLED = False`, `--live` is refused before the config, the key file or any transport is touched. Without `--live`, a `--key-file` path is ignored and never opened.

## Verify against the provider references before the first paid step

None of the following has been checked against live documentation or a live call. The request and reply shapes are written out at the top of `providers.py`.

- **OpenAI Responses API:** `POST /v1/responses`; `input` as a plain string; that `max_output_tokens` caps reasoning plus visible output; `store: false`; the `reasoning.effort` values and whether each model accepts `temperature`; the `output[]` message shape; `status` and `incomplete_details.reason`; the usage field names; that cached tokens are a part of `input_tokens` and reasoning tokens a part of `output_tokens`; what `api_version` should record, since no version header is sent.
- **Anthropic Messages API:** `POST /v1/messages`; the `anthropic-version` value; that `max_tokens` includes thinking tokens; the name and values of the effort setting (sent here as `output_config.effort`); whether `temperature` may be sent with it; the `stop_reason` values; the usage field names; that thinking tokens are inside `output_tokens`.
- **Prices:** re-read every price, for the models and for every judge candidate; fill the Anthropic cached rates; confirm how reasoning tokens are billed and that no long-prompt surcharge applies.
- **The judge output limit of 400 tokens:** a verdict is a small JSON object, but on both APIs the limit also covers reasoning or thinking tokens. Confirm, at the effort pinned for each candidate, that a verdict for the task with the most judged checks fits. A cut-off verdict is malformed, is retried once and then leaves the check unresolved, and in qualification it counts as disagreement.
- **Billing assumptions in the ledger:** a request answered with an HTTP error status is settled at zero. A timeout or a connection failure keeps its full reservation until the console figure is entered with `ProviderLedger.reconcile`. Cache-creation tokens on Anthropic are not priced, so any such request keeps its full reservation.
- **Timeout:** calls are not streamed, so time to first token is left empty. Confirm that a full-length answer returns inside 120 seconds without streaming.
- **The real transport:** `UrllibTransport` has never been exercised. It allows only the two provider hosts over https, follows no redirects and uses no proxy.
- **Data retention:** write each provider's setting into the config.
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

Exit codes: 0 finished; 2 refused (the reason is printed after `REFUSED:`); 3 interrupted or pending; 4 the qualification finished but named no panel. A mistake in the command itself exits with 1 or 2 from the argument parser. No refusal exits with 0.

## Not built yet

- Completing the judging of a run left pending in staging. Such a run stays unpublished, as the method requires, but there is no command to finish it.
- Grading a slot that was left pending because the grader could not run. The answer is kept; there is no command to grade it later.
- Streaming, and so time to first token.
- A command for console reconciliation; only the ledger function exists.
- Pacing from a provider's `Retry-After` header. Retries wait a fixed 2 then 8 seconds.
