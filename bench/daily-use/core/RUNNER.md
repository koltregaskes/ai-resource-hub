# Day-to-Day Bench: the run path

Status: built and tested offline only. Nothing here has called a model provider. The request and reply shapes were read against the providers' API references on 14 November 2026 (see below). `LIVE_ENABLED` in `runner.py` was set to `True` in the run-config change of 15 November 2026, after the owner typed his go for the paid runs. A run is still a dry run on a fake transport unless `--live` is given and every condition under "The live gate" holds. The pinned config is `bench/daily-use/run-config.json`.

The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`. This page says how the code carries it out.

## How the pieces fit

| File | Job |
|---|---|
| `keys.py` | Reads the owner's key file line by line and keeps only the first listed name per provider. Values live in `Secret` objects that never print. Holds the check that refuses every start while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. |
| `config.py` | Loads and checks `run-config.json`: every setting as an actual value, a dated price receipt per model, two judges from two providers, the judge candidates per provider, caps, key names. Every judge and every judge candidate must have an output limit of at most `JUDGE_MAX_OUTPUT_TOKENS` (400), in dry and live validation alike. Rejects anything that looks like a secret. `TO PIN BEFORE RUN` values pass a dry run and block a live one. Settings a provider would reject (temperature where it is not accepted, an unknown Anthropic API version, an effort value the API does not have) are refused outright. |
| `providers.py` | `OpenAIResponses` and `AnthropicMessages` on an injectable transport. Builds the request, reads the answer, the finish reason and the raw usage, and sorts failures into transport error (retried, waiting for a `Retry-After` of up to 60 seconds), provider error and timeout (not retried). A 429 that says the account is out of credit or over a spend limit is a provider error. Holds the real `UrllibTransport`, which only the live gate can build. |
| `ledger.py` | One durable ledger per provider, shared by model and judge calls. Reserve the worst case before each request, settle to the actual charge after it, refuse at the cap. Each reserve, settle and reconcile is one locked step that reads the file again first, so two writers cannot both use the same room; `StoreLock` is the one-run-at-a-time lock of the private store. The worst case uses `input_token_bound`, an upper bound on input tokens, and the full output limit. Lists any settled charge that is above its reservation (`overruns`). Moves a part-written last record to a sidecar file when the ledger is read. Money is `Decimal`. |
| `preflight.py` | Prints expected, planning bound and absolute bound for the whole plan, the planning bound of each stage and each pass, and the gates, whether or not the run is refused. Holds the whole-plan gate (`EXPECTED_MARGIN`), the planning-bound gate for what starts next, and `pass_gate`, which the runner calls before each pass. Both bounds count input with the ledger's `input_token_bound`. Counts qualification for every judge candidate and says how the judging was costed. |
| `judges.py` | Judge prompts, JSON verdicts with one retry, the combine rules, qualification scoring and the choice of panel. |
| `records.py` | Run, slot and request ids; the staging folder; the run log with its `sent`, `received` and `done` lines; whole files written atomically; reopening a stopped run; the `incomplete` status and the rule that a run with fewer than all its passes is never finalised; finalising with a SHA-256 manifest, in steps that can be done again; the public record through an allowlist; amendments. |
| `runner.py` | Slots, requests and retries; judging; the stages; the passes of the full run and the gate before each; resuming, with the recovery of requests that had come back and the blocking of requests whose outcome is unknown; the qualification record; the live gate; the seam with the loader, the graders and the scorer. |
| `cli.py` | The command line, the `reconcile` command included. |

One request goes like this, each write fsynced before the next step:

1. work out the worst case and reserve it in the provider ledger;
2. append the `sent` line to the run log;
3. send;
4. append the `received` line to the run log: the result as it came back, with the billable usage;
5. settle the ledger;
6. append the `done` line: the result again, with the charge.

One request is in flight at a time. The response is on disk (step 4) before the money is settled, so a run that dies at any point after the reply came back never has to ask for it again.

## How the cap is enforced

The cap of each provider is held by three layers. Each one is tested on its own, and none of them relies on the one above it.

**1. Every request is reserved before it is sent, and the run stops on an overrun.** The ledger reserves the worst case of a request (see the next section) before the request leaves, and refuses a reservation that would take spent plus reserved above the cap. If a settled charge is ever above its reservation, nothing more is sent and the run ends `interrupted`. That charge stays on file: while a ledger holds one, every later start of any stage or any pass is refused until the run config names the request id in `acknowledged_overruns: ["<request id>"]`. The refusal prints the request id. Naming it says the owner has seen it; it changes no cap and the charge still counts as spent.

**2. A pass starts only if its own planning bound fits what is left of the cap.** The full run goes one pass at a time (see "the pass order" below). Before each pass, and when a run is resumed, the runner works out the planning bound of that pass: every request of the pass once at its output limit, input counted by the proven byte bound, plus 15% for retries. For each provider it must be at or below the remaining cap, which is the cap less the real settled spend and less any open reservation in the ledger. If it is not, the pass does not start and nothing of it is sent. The qualification and the canary are tested in the same way when they start.

**What the pass gate does and does not say.** The gate admits a pass that fits at one request per slot at its output limit, plus 15% for retries. That makes finishing likely, not certain. A slot may use up to 3 model requests and a judge call up to 2, and the judge input is planned on an assumed answer size (see "The pre-flight's one planning assumption"). A timeout or a connection failure keeps its full reservation until it is reconciled against the provider console, so a bad run of them can use up the room that was left. When that happens the run ends `interrupted` (a request could not be reserved) or `incomplete` (the next pass did not fit), inside the cap, and it is not scored. The bound is not raised to the true worst case on purpose: that would be about three times the figure and no plan would fit. What never happens is spending above the cap: layer 1 reserves every request in full before it is sent, whatever the gate said.

**3. The whole plan must fit at twice its expected cost.** Before the qualification, before the canary and before pass 1, and for each provider, `EXPECTED_MARGIN` (2) times the expected cost of everything still to run must be at or below the remaining cap. This is the only use of the expected figure in a gate. It replaces the old rule that the planning bound of the whole plan had to be at or below the cap: that bound is still printed, and when it is above a cap the pre-flight says so and says that the passes are gated one at a time. That alone is no longer a refusal.

**The pass order.** The full run is as many passes as there are repeats, which is 3. Pass 1 is repeat 1 of every task for every model: models in config order, tasks in the seeded order of each model, the same in every pass. Each slot is judged (outcome classification and checklist judging) straight after its answer, so the whole of pass 1, judging included, is done before pass 2 starts; then pass 2; then pass 3. Slot records keep their `repeat` field: the pass number is the repeat. The canary is one pass.

**`incomplete`.** A run whose next pass was refused by the gate ends with status `incomplete`, which is not `interrupted`. A line is printed that names the provider, the pass, its planning bound and the remaining cap, and the command exits with 5. The passes already finished are kept as they are, in staging. An incomplete run stays incomplete until the pass fits what is left of the caps the run started with. Room can come back only inside those caps, for example when a reservation held in full by a timeout is reconciled to the real charge. Raising a cap does not rescue it: see "Resuming". If the room does not come back, the run is left unscored and a new run is started.

**Fewer than three passes is never scored.** A run with fewer complete passes than the configured number cannot be finalised, so it has no scores and no public record. A pass is complete when every one of its slots has a final result. Finalising such a run is refused with a message that gives the count, and there is no option that overrides it.

**Resuming.** `--resume <run id>` on `dry-run`, `canary` or `full` carries a stopped run on under the same run id and the same ledger, in the planned order. A slot that has a final row is left alone. No request id that is in the run's log is ever issued again: a slot that was stopped part-way goes on with its next request number, and the requests it had already used count towards its limit of 3. The run is resumed only as the same run: the same stage, the same task set and the same config, except that `acknowledged_overruns` may have changed and a cap may have been lowered. A run whose slots all have a row, some still pending (status `pending_judging`), is resumed in the same way. So is a run whose slots are all final and whose scoring or finalising failed (status `complete`): the resume sends nothing, scores the run and finalises it. A run that was stopped while it was being finalised is finished by `--resume` as well: see "Finalising can be restarted". A qualification is not resumed; run it again.

**No billed call is made twice.** Before anything is sent, a resume brings the run log and the ledgers level. What it finds falls into three cases.

- *The response is in the log (a `received` line) and the `done` line is not.* The run died between the reply and the end of its bookkeeping. If the ledger entry is still open it is settled now, from the usage on the `received` line, at the price of that model and by the same rule as a live result (an HTTP error status is not billed). If the ledger already shows it settled, the ledger is left alone. The `done` line is then written from the logged result and the ledger figures, with a `received_request_finished_on_resume` line, and one line is printed. From then on it is an ordinary finished request: its answer or verdict is reused and nothing is sent for it. If settling it shows a charge above its reservation, the resume stops there, as any overrun does.
- *The request was sent and nothing came back on record (a `sent` line, no `received` line) and its ledger entry is still open.* It may have been billed. The harness cannot tell, and neither provider adapter sends an idempotency key, because server support for one could not be verified offline; that is why such a request waits for a person. Until it is reconciled, nothing is sent for its logical call. For a model request the slot is skipped: no request, and no row, since a pending row without a reply would freeze the slot for good; the other slots carry on, and the run ends `interrupted` with the count and the request ids in the reason. For a judge request that judge call sends nothing, the slot's row stays pending and carries the flag `judge_request_awaiting_reconciliation`. The summary lists every such request id (`awaiting_reconciliation`) and the resume prints the `reconcile` command for each.
- *The request is in the ledger only.* See "A request that only the ledger knows" below: it was never sent and blocks nothing.

**Reconciling a request.** Look the request up in the provider console and enter what it cost:

```powershell
python -I bench/daily-use/core/cli.py reconcile --private-store "<private folder>\store" `
    --provider openai --request-id "<request id, as printed>" `
    --usd 0.0123 --note "console, 15 November, request not listed as failed"
```

`--at-reserved-maximum` in place of `--usd` charges the request its own reservation, the most it can have cost, when the console does not show it. `--dry-ledger <run id>` reconciles in the ledger of a dry run. The command takes the store's execution lock, so it is refused while a run is going; it opens that one ledger file, refuses a request id the ledger does not hold, appends one `reconcile` line and prints what it wrote. It needs no run config and no key file and reads neither. It checks no cap, and the ledger it opens can reserve nothing. Entering a charge changes accounting only. A dispatched request with no recorded response stays pending and blocked, even at zero cost or the reserved maximum. To authorise another paid request, explicitly add `--retry-lost-paid` to `reconcile`. That consent is journalled with the charge. Before dispatch, resume prints `SECOND PAID CALL for request <id>`. The original attempt still counts towards the slot's 3 requests or the judge call's 2, and all spending caps still apply.

**What a resume finishes.** In each pass, before any unsent slot of that pass is sent, the resume finishes the slots that already hold a paid answer, in the planned order. The model is never asked again for such a slot: the answer is read from the run record.

- *A paid answer with no row* (the run stopped between the answer and its grading or judging). The answer is graded, and judged if the grader says so.
- *A row left pending because the grader could not run.* The answer is graded again. If the grader still cannot run, the slot stays pending and the run stops, as before.
- *A row pending on the judges* (judging refused by a cap or after an overrun, or a judge call that was stopped before it had used both its requests). Only the judging that is missing is sent, and only while the judge call has a request left. A verdict that is in the run log for the same judge prompt is used as it stands and that judge is not asked again.

**The judge call limit is for the life of the run.** A judge call is one judge, one kind of judging, one slot. It has 2 requests (`judges.ATTEMPTS_PER_JUDGE_CALL`) in total, however often the run is resumed. The count is taken from the run log: every request id under `<slot>/judge/<judge>/<kind>/` counts, whether it has a result, was in flight, was known only to the ledger or was reconciled by hand. The numbering goes on from them, so a judge request id is never used twice. When both are used and no verdict is on record, a resume sends nothing for that judge call: a line is printed and its row carries the flag `judge_attempts_exhausted`. For checklist judging, every check still unresolved because of that missing verdict becomes `unresolved-final`: it counts as not passed, never as a pass from the other judge alone. The answered slot is final with `pass: false` and `pending: false`, so an otherwise complete run can be scored and finalised. This also applies on `--resume` to old pending rows, including rows already carrying the flag: the logged attempts and verdicts are reused without any new request for those judge calls. The report gives `unresolved_final_checks` per model; scores include the same count in each model's `side_figures`. Outcome classification that is unresolved still stays pending, as does a request awaiting reconciliation. No resume adds a request beyond the lifetime limit. The checklist prompt, parser, panel and qualification fingerprint are unchanged; existing qualification `2026-11-15T023300Z-391854ad` is not invalidated by this finalisation rule.

The slot row is replaced by appending: the new row is a further `slot` line in `requests.jsonl`, the earlier pending row stays in the log, and the last row of a slot is the one that counts for the passes, for finalising and for the manifest. A row that is final is never replaced. A finished slot carries the flag `finished_on_resume`, every model and judge request of the slot (those from before the stop included) and their whole cost.

**A request that only the ledger knows.** A request is reserved in its provider ledger, fsynced, before its "sent" line is written to the run log. A run that dies between those two writes leaves a request id in the ledger that the log has never seen. When a run is reopened, every request id of that run is read from the provider ledgers as well as from the log, before anything is sent. An id that is in a ledger and not in the log, for a model request or a judge request alike, is taken in as used: a `ledger_only_request_found` line with the request id, the provider and the reserved amount is appended to the run log and printed; the id is never issued again; and it counts towards the slot's 3 requests or the judge call's 2 (it appears in the slot's trail with status `reserved_never_logged`). The `sent` line is written before the request leaves, so a request without one was never sent: it does not wait for reconciliation and blocks nothing. Its reservation is not touched: it stays in the ledger and keeps counting against the cap until it is reconciled. Reconciling it to zero changes the money only; the id stays used. The resume then goes on with the next number, with no editing of the log by hand.

**Whole files are written atomically.** run.json, plan.json, slots.json, scores.json, the manifest, the public record, an amendment and the qualification record are each written to `<name>.tmp` in the same folder, fsynced, and then moved onto the destination with `os.replace` (tried again a few times when Windows refuses the move because a scanner has the file open). A crash therefore leaves the old complete file or the new complete file. A status write can no longer cut run.json short. A leftover `<name>.tmp` is never read as a record; the next write of that name overwrites it, and finalising removes any that are left in the run's folder, so none reaches the final folder or the manifest.

**A journal that ends in a part-written record.** The ledgers, the run log (including slot rows) and `stages.jsonl` are appended to, one record and its newline at a time. A crash in the middle of an append leaves bytes after the last newline. Those bytes are the torn tail, whether or not they happen to read as JSON. On the next read the tail is moved, not lost: one line is appended to the sidecar `<journal>.torn` (the time, the file name, the byte offset, the length, the SHA-256 and the bytes as base64) and fsynced, and only then is the journal cut at that offset. A crash between the two repeats the step and leaves the entry in the sidecar twice, which is harmless. Stage history reads and idempotent stage appends share a file lock and use the same torn-tail recovery, including prerequisite reads and sealed-run resume. For a ledger this happens under the ledger's lock, where no living writer can be part-way through a line; every earlier entry is kept exactly, and the runner prints what was moved. For the run log it happens when the run is reopened, before the log is read; a `torn_tail_moved_to_sidecar` line is appended, and the sidecar stays in the run folder and is hashed into the manifest like any other file. Cutting the tail is safe because every append is fsynced before the step that depends on it: a torn `reserve` means the request was never sent; a torn `settle` leaves the reservation open, and the `received` line lets the resume settle it again; a torn `sent` line leaves a request that only the ledger knows, which was never sent; a torn `received` line leaves an unknown request, which stays blocked until retry is explicitly authorised; a torn `done` line or slot row is built again from the `received` line and the requests. Damage anywhere else in a journal is not repaired: the start or the resume is refused until the file is put right by hand.

**Finalising can be restarted.** Finalising writes slots.json and scores.json, checks every file against what was written, and then writes run.json with status `finalised`. That write seals the staged folder. What follows is one function that can be run again from the disk alone (`records.complete_finalisation`): build the manifest from the files in the folder, with the `finalised_utc` of run.json as its date so that it is the same every time, and write it unless an identical one is there; rename the folder to `runs/<run id>/`; and, for a full run, build the public record from run.json, slots.json, scores.json and the manifest hash and write it unless an identical one is there. If the process dies anywhere in that, `--resume <run id>` finishes it: it checks that it is the same run (stage, dry or live, config, task set), does the steps that are missing, adds the stage index entry of a live run if it is not there, and reports status `finalised`. It sends nothing, loads no key and touches no ledger. A run with nothing left to do is reported as already finalised; that is not an error.

Every request of a resume goes through the same steps as any other: the store lock, the frozen-caps check, the pre-flight, the pass gate and the ledger reservation. The gate before a pass counts the work to finish in that pass: a slot that only has to be graded and judged is counted at the planning bound of its judging (every judge call of the slot, plus the 15%), and an unsent slot at its whole planning bound. If that does not fit, nothing of the pass is sent, the slots stay pending and the run is `incomplete`.

**A resume never raises a cap.** The caps in force when a run starts (`caps_usd` for each provider, and `--max-usd` or none) are written into its record and are not changed afterwards. `--resume` is refused, with exit 2 and before the key file is read, if a provider cap is higher than the one on record, if `--max-usd` is higher than the one on record, or if the run started with a `--max-usd` and none is given. The same or a lower figure is accepted, and a `--max-usd` may be added where there was none. Every resume writes a line to the run's record and log with the caps the run started with, the caps in force for that resume and the config hash, so a lowered cap is on file. The comparison is always with the caps the run started with. Nothing lets one run id spend above them.

**The authorised ceiling.** `AUTHORISED_CAPS_USD` in `config.py` is the most that may be spent with each provider: 115 USD for OpenAI and 60 USD for Anthropic. The owner typed 90 and 60 on 15 November 2026; OpenAI was raised to 115 on 17 November 2026, when the owner asked for the whole prepaid OpenAI grant (116 USD, expiring 20 November) to be used on benchmarking. It is a lifetime ceiling on each provider ledger, spent plus reserved across every run in the store. A config with `caps_usd` above either figure is not ready for a live run and is refused. Raising a figure needs a reviewed commit.

**One run at a time.** A run takes the execution lock of the private store (`<store>/execution.lock`) before it reads a ledger or opens a run record, and keeps it until it ends. It is an operating-system lock, so it ends with the process, however the process ends: a crashed run does not leave the store stuck, and the file being there locks nothing by itself. While it is held, every other stage start and every `--resume`, dry or live, is refused with `REFUSED:` and exit 2; the message gives the pid, the run id and the start time of the owner. The `preflight` command only reads, so it does not take the lock; when a run holds it, the pre-flight says that its remaining caps may be out of date. Under the store lock, each ledger write is its own locked step (`<ledger>.lock`): the ledger file is read again, spent plus reserved is added up, the cap is checked and the line is appended and fsynced before the lock is let go. Two writers therefore cannot both reserve the same room.

What the pre-flight refuses (exit 2): the whole-plan gate fails; or the qualification, the canary and pass 1, at their planning bounds, do not fit the remaining cap together; or an overrun is on file that the config does not acknowledge. A stage that is starting is refused on the same whole-plan gate, on its own planning bound (the qualification, the canary or pass 1) and on an overrun on file.

## What a reservation covers

A reservation has to be at least what the request can cost, or the cap is not a cap. It is worked out by `ledger.worst_case_usd` from two figures.

**Input: an upper bound, not an estimate.** `ledger.input_token_bound` is the UTF-8 byte length of every text field sent (the system text, if there were any, and the prompt or messages) plus a fixed framing allowance of 256 tokens per request (`FRAMING_ALLOWANCE_TOKENS`). The reason: a byte-level BPE tokeniser starts from the bytes of the text and only merges them, so it never emits more tokens than the text has bytes. The framing allowance covers the role and message wrappers the provider adds. Code, punctuation and non-English text, which a characters-per-token estimate undercounts, are covered because the count is in bytes. The adapters send one text field, the prompt, and no system text.

This one function is behind every input figure in a reservation, in the pre-flight planning bound and in the absolute bound. There is no second estimate. The input side is priced at the dearer of the input rate and the cached-input rate.

**Output: the full limit.** The output side is the output limit sent with the request (4,096 or 8,192 for a task, at most 400 for a judge) at the output price. Reasoning and thinking tokens are inside the output limit on both APIs and are billed as output, so the limit covers them. If a price receipt says reasoning is billed separately, the limit is priced at the output rate plus the reasoning rate.

**The pre-flight's one planning assumption.** A judge request holds the model's answer, and at pre-flight time the answer does not exist. The two bounds plan it at 4 bytes per token of the task's output limit (`ANSWER_BYTES_PER_TOKEN` in `preflight.py`), each byte counted as one token. This is an assumption about the size of an answer, not a bound: a token can be longer than 4 bytes. It cannot break the cap, because at run time the judge request is reserved from the bytes of the real answer; an answer longer than planned can only stop the run early at the cap.

**The expected figure** in the pre-flight keeps a softer size for input (3 characters per token). It is labelled as expected, and it never feeds a reservation or a planning bound. Its one use in a gate is the whole-plan gate, where it is doubled.

**The backstop.** If a settled charge is ever above its reservation, the ledger writes the settle line with the charge, the reservation and the flag `charge_above_reservation`. The runner then sends nothing more: the next request, a retry or a judge call, is refused before dispatch, the paid answer is kept on its slot, and the run ends `interrupted` in staging. The command exits with 3. An overrun on the very last request of a stage also ends the stage interrupted, so it is never finalised. After that, no stage or pass starts, and the run is not resumed, until the run config names the request in `acknowledged_overruns`.

**A possible later tightening.** Both providers have a token-count endpoint that would give the exact input count before a request. It needs a key and a network call, which nothing before the first paid step may make, so it is not used. It could replace the byte bound for the paid stages later; the byte bound would stay as the pre-flight figure.

A judge verdict is one JSON object. It may come bare or inside a single Markdown code fence; the fence is stripped before parsing, so that habit does not cost a retry. Anything else (text before or after, two fences, JSON in the wrong shape) is malformed and is retried once.

Where things are written, all inside the private store (a folder outside the repo, given with `--private-store`):

- `runs/_staging/<run id>/` while a run is in progress, interrupted or pending;
- `runs/<run id>/` once finalised, never written to again;
- `public/<run id>/public-record.json`, built by the allowlist (full runs only);
- `amendments/<run id>/<n>/`;
- `ledgers/<provider>.jsonl` for live runs, `ledgers-dry/<run id>/` for dry runs;
- `<journal>.torn` beside a ledger or a run log, when a part-written last record was moved out of it;
- `qualification/<run id>.json`, the signed-off record of a live judge qualification, written once;
- `stages.jsonl`, the list of finished live stages;
- `execution.lock`, the one-run-at-a-time lock, and a `.lock` file beside each ledger.

## The stages: qualify, then canary, then full

**1. `qualify`** is the first paid step. It needs both sample files.

- The config lists the candidates per provider in `judge_candidates: {"openai": [...], "anthropic": [...]}`, each a full judge entry with its own price receipt. Without that field the two `judges` are the only candidates.
- Every candidate is qualified by itself against the frozen samples, cheapest first on each side: one call per sample (84 each with the v1 files: 64 checklist samples and 20 outcome samples).
- Reported per candidate: overall item agreement, agreement on the reference-true items, agreement on the reference-false items, agreement on the outcome samples, and pass or fail. The thresholds are the method's: at least 0.90 overall, 0.85 on true items, 0.85 on false items, and 0.90 on the outcome samples. A judge that always says true fails on the false items.
- The recommended panel is, on each provider side, the cheapest candidate that passed. "Cheapest" is the simple sum of the input and output price per million tokens in the candidate's price receipt. The two judges always come from two different providers.
- If no candidate passed on a side, the stage fails, says which side, and names no panel. There is never half a panel. The exit code is 4.
- A sample set that does not meet the method's rules for size and balance stops the stage before any call.

**The qualification record.** A finished live qualification writes `qualification/<run id>.json`. It holds, for every candidate, the judge model id, a fingerprint of its settings, its price sum and each agreement figure with pass or fail; the SHA-256 of both sample files; the thresholds; the task set version; the panel; the date; who signed off the run config (`approved_by`); and the manifest hash of the qualification run. `record_sha256` covers the rest of the record, so an edited record is not accepted. A dry qualification writes no record and opens nothing.

**2. `canary`** needs a record that still stands, and its answers are judged by the qualified panel. **3. `full`** needs the same record and a finished canary that ran under it. It runs as three passes, each gated before it starts (see "How the cap is enforced"). The latest live qualification is the one that counts. It stops standing, and both stages are refused, when:

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
4. A checklist judge left unresolved after its one retry makes its unresolved checks `unresolved-final` and the answered slot final and not passed, with flag `judge_attempts_exhausted`. An unresolved outcome classification still leaves the slot pending with outcome `judge_unresolved`. In either case it has used both requests and `--resume` does not ask it again: see "The judge call limit is for the life of the run".

A different grader can be injected: `grade(task, reply)` returns `{"outcome", "pass", "pending", "needs_judge"}`, where `needs_judge` lists `"outcome"` and/or judged checks, and the runner calls `grade(task, reply, judged=...)` with the panel's results. A grader that does not take `judged` gets a conservative fallback that leaves anything it cannot decide pending.

Before the first request of a canary or a full run, the default grader is checked: `core/outcome.py` must load, and if the task set has a formula task the formula engine must start. A live full run is also refused without `core/scores.py`. If a grader still fails in the middle of a run, the paid answer is kept on its slot as pending and the run stops. Once the grader works, `--resume` grades that answer from the record.

**The slot record.** Every slot row the runner writes can be handed straight to `score_run`. It carries `model`, `task_id`, `family`, `split`, `repeat`, `outcome`, `pass`, `truncated`, `time_s`, `cost_usd`, `needed_judge_classification` and `checks`:

- `checks` is a list of `{"id", "by": "script" | "judge", "state": "pass" | "fail" | "disputed" | "unresolved" | "unresolved-final"}`. It is filled only on an `answered` slot, and the slot's pass is the AND of the list. A judged check that was never run, because a script check had already failed, is left out.
- `cost_usd` is the model's own requests as a plain number, with the exact figure beside it in `cost_usd_exact`. Judge cost is separate, in `judge_cost_usd`.
- `time_s` is the time of the request that produced the answer, or null when there was none.

## The live gate

**Every start, dry or live.** Before anything else is read, every command (`preflight` and `dry-run` included) and both programmatic entry points (`runner.run_stage`, `runner.open_live_gate`), as well as `preflight.preflight`, refuse while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in the environment. The command prints `REFUSED:` with the name of the variable, never its value, and exits with 2. No config, task file, sample file, key file or store is opened first.

A live stage runs only if all of these hold, checked in this order:

1. `LIVE_ENABLED = True` in `runner.py`, changed in a reviewed commit;
2. `--live` was given;
3. the config has `live_approved: true` and `approved_by` filled in;
4. the config has no `TO PIN BEFORE RUN` value, no null cached rate and no ended promotion, and no `caps_usd` figure above `AUTHORISED_CAPS_USD`;
5. `--key-file` was given;
6. neither provider key variable is set in the environment (this is checked first of all, as above);
7. the earlier steps are on record: `qualify` needs nothing before it; `canary` needs a passed judge qualification record that still stands, with a panel equal to the config's `judges`; `full` needs that and a finished canary that ran under the same record;
8. the pre-flight passes: no unacknowledged overrun is on file, the whole-plan gate holds, and the planning bound of what is starting (the qualification, the canary or pass 1) fits the remaining cap. Passing it allows the start; it does not promise that the stage finishes (see "What the pass gate does and does not say");
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

- **The judge output limit of 400 tokens.** The limit itself is enforced: a judge or a judge candidate above 400 is refused by the config check, and again by the pre-flight. What is still to verify is that 400 is enough. On both APIs the limit also covers reasoning or thinking tokens, and thinking is on by default on all three Claude models. OpenAI's own advice is to leave at least 25,000 tokens for reasoning and output when starting out. Confirm, at the effort pinned for each candidate, that a verdict for the task with the most judged checks fits. A cut-off verdict is malformed and is retried once. Exhausted checklist judging then leaves the check `unresolved-final` (not passed); outcome classification remains pending. In qualification it counts as disagreement.
- **The task limits of 4,096 and 8,192 tokens** cover reasoning as well, for the same reason. An answer can be cut off, or come back empty, with the whole limit spent on reasoning. The canary should show the truncation rate at the pinned effort.
- **Effort and data retention** are `TO PIN BEFORE RUN` in the example and pinned in `run-config.json`: effort `low` for all seven benchmarked models, and for each judge candidate the lowest value it accepts (`none` on `gpt-6.1-terra` and `gpt-6-luna`, `low` on the rest). Scores therefore describe the models at low effort, not at their defaults, and the published record says so. Canary stop rule: if more than 1 of the 14 canary answers is cut off at its limit, or any judge verdict is, stop before the full run and decide again.
- **Prices:** re-read on 15 November 2026; all seven matched. Re-read again if the run moves to a later day. OpenAI lists a 10% uplift for regional processing; the receipts assume the global endpoint.
- **Billing assumptions in the ledger:** a request answered with an HTTP error status is settled at zero. A timeout or a connection failure keeps its full reservation until the console figure is entered with the `reconcile` command. Cache-creation tokens (Anthropic) and cache-write tokens (OpenAI) are not priced, so any such request keeps its full reservation. An Anthropic refusal before any output is not billed in most categories, though usage is reported; the ledger charges it, which errs on the safe side.
- **Timeout:** calls are not streamed, so time to first token is left empty. Confirm that a full-length answer returns inside 120 seconds without streaming. Anthropic advises streaming for long requests.
- **The real transport:** `UrllibTransport` has never been exercised, including its reading of `Retry-After`. It allows only the two provider hosts over https, follows no redirects and uses no proxy.
- **Remaining credit:** confirm it in each provider console; the caps are planned figures.
- **Crash recovery is tested on Windows on a local disk only.** Behaviour on POSIX and on network drives is not verified. The atomicity of `os.replace` is as the operating system provides it; the folder fsync that follows it on POSIX has never run. Whether an fsync that returned is really on the disk depends on the drive and its cache, which no test here can show.
- **No idempotency key is sent.** A request whose response was lost cannot be asked for again safely, so it waits for the `reconcile` command. Whether either API would honour such a key is not verified.

## Command sequence

Run from the repo root in PowerShell. `python -I` keeps the interpreter isolated. One exception: the canary and the full run grade formula tasks, so `formulas` and `openpyxl` (see `requirements.txt`) must be importable. Where they live in a folder of their own, not in the interpreter's site-packages, run those stages without `-I` and with `PYTHONPATH` set to that folder for that one process, and set `DTD_SANDBOX=docker` so the code tasks use the proven sandbox. Every stage is given both sample files, because the canary and the full run check them against the qualification record.

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

# 5. The full run: three passes, each gated before it starts.
python -I $core full @common --key-file "<path to key file>" --live
#    If it ends incomplete (exit 5), or interrupted or pending (exit 3), carry it on,
#    under the same caps or lower ones, with:
python -I $core full @common --key-file "<path to key file>" --live --resume "<run id>"
#    If the resume lists requests that were sent and have no result on record, look each
#    one up in the provider console, enter its cost, then resume again:
python -I $core reconcile --private-store "<private folder>\store" --provider openai `
    --request-id "<request id>" --usd 0.0123 --note "<what the console shows>"
```

The pre-flight says how the judging of the canary and the full run was costed. Before a qualification is on record it uses the worst case: on each provider side, the candidate whose judging would cost the most, since any candidate could still be the one that passes. Once a qualification stands it uses the recorded panel. With `--private-store` the `preflight` command reads the ledgers and the record; give `--stage canary` or `--stage full` to see the plan still to run after the earlier stages.

The pre-flight prints, per provider: the three figures for the whole plan (expected, planning bound, absolute bound); the planning bound and the expected cost of the qualification, the canary, each pass and the full run; the whole-plan gate figure (2 x expected) against the remaining cap; the planning-bound gate for what starts next; the qualification, the canary and pass 1 together against the remaining cap; any overrun on file; and one result line.

`--max-usd <amount>` sets a lower cap for one run. It can only lower: the provider caps always apply as well. On `--resume` it may not be higher than the one the run started with, and it may not be left out if the run started with one. `--seed <n>` fixes the task order; the seed is recorded either way. `--held-out-manifest <path>` names the manifest when it is not beside the public folder.

Exit codes: 0 finished; 2 refused (the reason is printed after `REFUSED:`); 3 interrupted or pending, which includes a run stopped because a charge was above its reservation (the reason is printed after `stopped:`); 4 the qualification finished but named no panel; 5 incomplete, a pass was not started because its planning bound was above the remaining cap (the reason is printed after `INCOMPLETE:`). A mistake in the command itself exits with 1 or 2 from the argument parser. No refusal exits with 0.

## Not built yet

- Resuming a qualification. Run it again.
- Finishing a pending slot by hand, or with a judge other than the panel. A slot whose judge used both its requests without a verdict stays pending however often the run is resumed, and the run is then left unscored.
- Resuming a qualification that was stopped while it was being finalised. Its folder can be sealed like any other, but the qualification record is written only by the run itself.
- Streaming, and so time to first token.

The task fingerprint covers the full normalised definitions in task id order, including grader parameters, reference answers, judged check ids and text, answerability, family and split. A changed definition refuses resume before any call. Runs recorded with the older, prompt-only fingerprint are refused conservatively.
