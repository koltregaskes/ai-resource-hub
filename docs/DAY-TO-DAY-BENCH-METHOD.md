# Day-to-Day Bench: method (draft v0.2)

Status: draft for review. Nothing here has been run against a real model. v0.2 answers the two Codex reviews of v0.1 (PR 110, 14 Nov 2026).
Owner: Claude (AI Resource Hub session). Budget and run plan: koltregaskes/rooms-os-hub#270. Tracking issue: koltregaskes/rooms-os-hub#1578. Offline harness: koltregaskes/ai-resource-hub#111.

## What it is

Our own benchmark of how AI models handle the jobs ordinary people give them every day: writing, tidying up text, summarising, answering a factual question honestly, following an instruction exactly, planning, and small spreadsheet and code fixes. It leaves out science olympiads, research maths and robotics.

Every task is written by us. We reuse nobody else's questions, prompts or results. We studied how Artificial Analysis, Epoch AI, Stanford HELM, LiveBench, IFEval, SimpleQA and GDPval run their tests, and took methods only.

## Rules we hold to

1. **Everything publishable is published.** The method, the harness code, the grading code, the settings, and every raw answer for public tasks. Any number on the page can be traced to the run that produced it.
2. **Reproducible.** Frozen settings, repeated attempts, and a run record that's never edited.
3. **Honest about uncertainty.** Every score carries an interval, and the page says what the interval does and doesn't cover.
4. **A failure is a failure.** A scheduled attempt that ends in an error, a timeout, a refusal or the wrong format counts as failed. It's never dropped or replaced by a later success.
5. **Outcome and pass are two separate fields.** What the model did (answered, abstained, refused, and so on) is recorded apart from whether that was the right thing to do.
6. **No spending without a reservation.** Paid calls use only credits Kol has approved. The harness reserves the most a call could cost before it sends it, and stops at the cap.

## How this fits what we already have

- **Meta-benchmark "Floor Capability" family** (`src/data/internal-meta-benchmarks.ts`): designed in June as the "everyday trust basics" benchmark, but never given prompts or runs. This bench is its first real implementation.
- **Reliability Floor** (`src/data/reliability-floor.ts`): combines other people's benchmark scores. Separate.
- **Model Showreel** (its own private repo and session): hand-run creative builds judged by taste. Its creative-writing prompts stay there; this bench doesn't score creative taste.
- **Rooms OS personal benchmark:** observations from real work, not a controlled comparison. Separate.

## The tasks (v1: 60 active tasks, text only)

| # | Family | What it tests | Active | Public | Held-out | Graded by |
|---|---|---|---|---|---|---|
| 1 | Follow the exact brief | Length limits, a required format, "don't mention X", several instructions at once | 10 | 7 | 3 | Script |
| 2 | Know, check or abstain | Short factual questions with one stable answer, UK-leaning, plus questions with no knowable answer | 10 | 7 | 3 | Script |
| 3 | Grounded answer only | Answering from a supplied document only; some questions can't be answered from it | 8 | 5 | 3 | Script |
| 4 | Summarise and extract | Fields from a receipt or letter; meeting notes into actions; summarising 2 to 3 pages | 8 | 5 | 3 | Script for extraction; checklist for summaries |
| 5 | Rewrite and edit | Plain-English rewrites, a polite complaint email, shortening without losing facts | 8 | 5 | 3 | Script for hard limits, plus a checklist |
| 6 | Everyday numbers and planning | A train journey from a timetable, a calendar clash, a household budget, sums with given rates | 8 | 6 | 2 | Script |
| 7 | Spreadsheet and code help | Fixing or writing a spreadsheet formula, a short script fix, explaining an error message | 8 | 5 | 3 | Script |
| | **Total** | | **60** | **40** | **20** | |

- **Unanswerable tasks:** families 2 and 3 each have exactly 2 tasks marked `answerable: false`, one public and one held-out in each family.
- **Each task file holds:**
  - an id, family and split;
  - the prompt and any attached text;
  - `answerable` (true or false);
  - the grader type and its parameters (normalisation rules, numeric tolerance, checklist items);
  - the expected answer or checklist;
  - the date written, the author and the checker.
- **Two agents per task:** one writes the task and its answer key; a different one checks both. A task is "admitted" only after that check is recorded.
- **Floor quota:** at most 2 tasks per family in the public set are "floor" tasks (very short basics, a sanity check). The rest are realistic: the size and messiness of a real request, with a supplied document of 250 to 700 words where one is involved. A set of floor tasks alone would put every strong model near 100% and separate nobody.
- **Unanswerable tasks never hint at the way out.** The prompt reads like a normal question; nothing tells the model it may say "unknown".
- **Facts must be stable and sourced.** Each factual task's answer key links to an official source and avoids anything likely to change within a year.
- **No personal data** in any task.
- **The 60 synthetic fixtures in PR 111 are for testing the harness only.** They're public, so none can become a held-out task, and none counts as an admitted task until it passes the two-agent check and fits a family above.
- **v1.1 (later):** reading images and PDFs.

### Public and held-out

- **Folders:**
  - `bench/daily-use/public/` holds public tasks and is in the repo.
  - Held-out tasks live in a private folder outside the public repo, read through a path the harness is given at run time. The repo holds only their ids, family and file hashes.
- **Run records come in two parts.** The private part holds everything, including held-out prompts, answers and judge material. The public part is built from it by an allowlist: for held-out tasks it carries only the task id, family, outcome, pass, tokens, cost and timing.
- **What withholding does:** it stops us publishing those prompts. It doesn't control what a model provider keeps from API calls; that depends on each provider's data-retention terms, which the run config records.
- **Rotation, each quarter:** 10 held-out tasks become public (with all their past answers), 10 new held-out tasks are written, and **10 existing public tasks retire from the active set** to an archive. The active set stays at 60 (40 public, 20 held-out), with each family's counts unchanged. The task-set version goes up, and scores are compared only within a version.
- **Raw-answer pages** carry `noindex` and a robots rule.

## Attempts, outcomes and passes

### Slots and retries

- **A slot** is one scheduled attempt: one model, one task, one repeat number. Each task has 3 slots per model, each a fresh conversation.
- **A request** is one API call for a slot. A slot allows up to 3 requests: the first, plus 2 retries, and only for transport errors (connection failure, HTTP 429, HTTP 5xx).
- **A slot whose retries run out stays failed.** Every request, its charge and its failure reason are kept. It's never replaced by a later success.
- **Timeout:** 120 seconds from sending the request to the last byte of the answer, streaming included. A timed-out request is cancelled, recorded, and not retried.
- **Truncation:** an answer cut off at the output limit is graded as it stands.
- **An interrupted run** (the harness stopped with slots never started) is "incomplete" and isn't published. Its record is kept. A re-run gets a new run id; nothing is merged between runs.

### The two fields on every slot

**`outcome`** records what happened:

| Outcome | Meaning |
|---|---|
| `answered` | The model gave a substantive answer |
| `abstained` | The model clearly declined to answer because it doesn't know or the source doesn't say |
| `refused` | The model declined for policy or safety reasons |
| `malformed` | The answer couldn't be parsed in the required format |
| `execution_error` | No gradable answer: transport retries ran out, a timeout, or a provider error |

**`pass`** (true or false) records whether that was right:

| Task | Outcome | Pass |
|---|---|---|
| Answerable | `answered`, and the grader accepts it | true |
| Answerable | `answered`, and the grader rejects it | false |
| Answerable | `abstained` | false |
| Not answerable | `abstained` | **true** |
| Not answerable | `answered` | false |
| Any | `refused`, `malformed` or `execution_error` | false |

**Precedence when an answer is mixed:**
1. No gradable answer: `execution_error`.
2. Can't be parsed in the required format: `malformed`.
3. A policy refusal: `refused`.
4. A substantive answer is present, even hedged ("I'm not sure, but probably London"): `answered`. The hedge doesn't make it an abstention.
5. Only a decline: `abstained`.

- Abstention phrases inside a quotation of the source or the question don't count as abstaining.
- Outcomes are assigned in every family. In families without unanswerable tasks, `abstained` is simply a failed outcome.
- Outcome detection is by script, using a published pattern list. Unclear cases go to the judge panel under the rules below.

## Run settings

- **A run config file** (`bench/daily-use/run-config.json`) is frozen and reviewed before any paid run. For each model it names:
  - the exact model id and API version;
  - the resolved value of every default (reasoning or effort setting, temperature);
  - the output limit;
  - the provider's data-retention setting;
  - the price receipt (below).
- **One configuration per model in v1:** the provider's default reasoning setting and default temperature, written out as actual values, so a provider changing its defaults later can't change the config silently.
- **Output limit:** 4,096 tokens by default, mapped to whichever parameter caps total output on that API, reasoning tokens included where the API counts them there. A task may declare 8,192 in its file, and only if it needs a long answer. The truncation rate (answers cut off at the limit) is reported per model.
- **Prompt:** an empty system prompt, no worked examples, and **no tools** (no web search, no code execution).
- **Access route:** each lab's own API. Results describe the API model, not the chat app.
- **Recorded per request:**
  - the raw prompt and raw answer;
  - input, output, reasoning and cached tokens as the provider reports them (if usage is missing, the slot is flagged and its cost is the reserved maximum);
  - the charge at the frozen price;
  - time to first token (from send to the first content byte) and total time.

## Grading

### Script graders

- Exact or normalised match, a regular expression, a JSON-schema check, a word or character count, a numeric match within the task's stated tolerance, a formula evaluation, or a test suite.
- Code and formulas run in a sandbox with no network, a 10-second limit and no access to keys or the run record.
- Matching is case-sensitive unless the task says otherwise.
- Each grader is unit-tested with accepted, rejected, abstaining and malformed samples before any model run.
- A script check's verdict is final. It never goes to a judge.

### Checklist graders (summaries and rewrites: 16 tasks)

- Each task has 4 to 8 pass/fail checks. Script-checkable ones are done by script; the rest are "model-judged checks".
- **Judge panel:** two judge models from two different labs, named in the run config with their settings. No answer is judged only by a model from its own lab.
- **One call per judge per answer,** returning a JSON verdict with one true or false and a one-line reason per check.
- **A model-judged check passes** only if both judges pass it. Disagreement marks the check `disputed`, which counts as failed in the main score.
- **Dispute rate** = disputed model-judged checks ÷ all model-judged checks, published per model, with the score recomputed excluding disputed checks shown beside it as a sensitivity figure.
- **Judge failures aren't the model's failures.** A malformed verdict or a judge timeout is retried once. If it still fails, the check is `judge_unresolved`, and the slot's pass is left **pending**. A run with pending slots isn't published until the judging is completed.
- **Judge qualification, before the first run:**
  - 40 sample answers with reference verdicts, written and frozen before any judge sees them;
  - balanced: 20 that should pass their task and 20 that should fail;
  - agreement is measured per checklist item;
  - a judge needs at least 90% agreement overall, and at least 85% on both the pass half and the fail half.

## Scores

- **Task score** = passes ÷ 3 slots.
- **Family score** = the mean of its task scores, as a percentage.
- **Day-to-Day score** = the plain mean of the seven family scores. Families count equally, so it isn't the same as the share of all attempts passed.
- **Pooled pass rate** = passed slots ÷ all slots, shown as a separate figure.

**Shown next to the score, never folded into it:**

| Figure | Definition |
|---|---|
| Wrong-answer rate | In families 2 and 3: slots with outcome `answered` and pass false ÷ all slots in those families |
| Abstention rate | In families 2 and 3: `abstained` slots ÷ all slots in those families |
| Execution-error rate | `execution_error` slots ÷ all slots |
| Consistency | Tasks where all 3 slots have the same pass value ÷ all tasks |
| Cost per task | Total model charges ÷ 60 tasks (all 3 slots, retries included, judges excluded) |
| Cost per successful task | Total model charges ÷ (pooled pass rate × 60). Shown as "no successful tasks" when nothing passed |
| Time per attempt | The median total time of slots that returned an answer |

- **The side figures don't show skill by themselves.** A model that always abstains has a wrong-answer rate of 0 and consistency of 100%, but passes only the 4 unanswerable tasks: a Day-to-Day score of (20% + 25%) ÷ 7 = 6.4%. The page shows the side figures only beside the score, with this note.
- An execution error is never described as a wrong answer.

### Intervals

- **Method:** a percentile bootstrap, 20,000 resamples, seed 20261114.
  - Tasks are resampled with replacement **within each family**, keeping the family sizes (10, 10, 8, 8, 8, 8, 8).
  - A task's 3 slots stay together.
  - The equal-family score is recomputed on each resample.
  - The interval is the 2.5th to 97.5th percentile.
- **Public-only and held-out-only scores** get their own intervals from their own family counts.
- **No promised width.** The width depends on how much task scores vary. In the reviewer's worked case (half of every family always passing and half always failing), the interval was about 37% to 63%.
- **Degenerate cases:** when every task score in a family is identical, the bootstrap gives a zero-width interval. That's shown as "not enough variation to estimate", never as certainty.
- **What the interval covers:** variation from which tasks happened to be in the set. It doesn't cover how we wrote or graded the tasks, model changes over time, or run-to-run variation beyond the 3 repeats. The page says so.

### Comparing models

- The table sorts by Day-to-Day score. Exactly equal scores share a rank, with a neutral secondary sort by model name.
- **Overlap label:** two models are marked "95% intervals overlap" when max(lower bounds) ≤ min(upper bounds), using unrounded values. The page explains that this isn't a test of difference and isn't evidence the models are equal. Overlap doesn't chain: A overlapping B and B overlapping C doesn't put all three in one group.
- **Comparisons stay descriptive in v1.** For any pair, the page can show the paired difference with its own bootstrap interval, using the same resampled task ids for both models. We don't claim significance, and we don't run 21 unadjusted pairwise tests.

## Prices and budget

- **Price receipt:** before a run, the run config records each model's input, output and cached-token prices from the provider's official pricing page, with the URL, the date read and any promotional end date. That frozen price is used for every charge in the run. Our catalogue isn't the source, because it can lag (the first review found a model page showing a promotional price our catalogue didn't have).
- **Caps (from hub #270):** about $90 of OpenAI credit and $60 of Anthropic credit. These are planned allocations, not checked balances; the remaining credit is confirmed in the provider console before the first paid run.
- **Reservation, not estimation:**
  - Before each request, the harness reserves the most it could cost: input tokens × input price + the task's output limit × output price. A retry is reserved when it's dispatched, not in advance.
  - It keeps one ledger per provider, shared by model calls and judge calls, covering requests in flight.
  - It refuses to send a request that would take reserved plus spent above the cap, and reconciles to the actual charge afterwards.
- **`--max-usd`** sets a lower cap for one run and can't raise a provider cap.
- **Pre-flight:** before any call, the harness prints the worst-case cost of the whole run, next to an expected cost from a planning figure for output size. The worst case is every slot once at its task's output limit, plus a 15% allowance for retries, plus judge qualification and judging. The harness refuses to start if the worst case is above the remaining cap. The fix is then a shorter model list in the run config, never a silently lower limit.
  - Why the default limit is 4,096: the first review put four OpenAI models at about $101 worst case at 8,192 output tokens, above the $90 cap before judges or retries.
- **Canary first:** the first paid step is 2 public tasks per model with 1 repeat, inside the same ledger. It isn't a result and isn't published. The adapters, usage fields, finish reasons and charges are reviewed before the full run starts.
- **Judging:** about 16 tasks × 3 slots × 2 judges per model, plus 80 qualification calls, all reserved the same way. Judge cost is reported separately from model cost.
- **Order:** every call that spends OpenAI credit finishes before 20 Nov 2026, including OpenAI judging of Anthropic answers. So the Anthropic model runs that need an OpenAI judge are scheduled before that date too.

## Keys and safety

- Kol creates the two API keys himself. No agent reads, types or stores a key.
- **The one allowed route (Kol's instruction, 14 Nov 2026):** the keys sit in Kol's private key file on the run machine, which only he edits. At run time the harness loads exactly two named entries from it into its own memory.
  - The file's path is given with `--key-file`. It's never hard-coded or committed.
  - The two entry names are set in the run config: one for the OpenAI key and one for the Anthropic key.
  - The loader reads the file line by line and keeps only those two names. Every other line is discarded unread, and nothing from the file is logged.
  - Name matching ignores case. The run config may also list named alternatives for each key, tried in order. Nothing outside that list is tried.
  - If none of the listed names is there, the harness stops with `key not found: <name>`.
  - The keys are held in variables and passed straight to the HTTP client. **They're never put in an environment variable,** not even for the harness's own process, so no other tool can pick them up.
- **What the harness refuses:**
  - starting while `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in its environment (those names switch other tools to paid billing, and a set value means something exported a key);
  - a key passed as a command-line argument or written in a config.
- No agent opens the key file. Agents write and review the loader's code; only the running harness process reads the two entries.
- Keys are never written to logs, run records or error messages, and the grading sandbox gets no environment variables and no access to the key file.
- `--live` stays refused until this doc and the harness are both reviewed and merged, and Kol's keys exist.

## New models

- A new model is run on the current task-set version, under the same settings rule, when we have API access.
- After the current credits expire (OpenAI 20 Nov, Anthropic 27 Nov 2026), any further paid run is new spending and needs Kol's yes first.

## On the page (`/benchmarks/day-to-day/`)

- **Table:** each model with its Day-to-Day score and interval, the seven family scores, the pooled pass rate, the side figures above, and its settings and run date.
- **Receipts:** every number links to its public run record. Every public task shows its prompt, answer key and each model's three raw answers.
- **What this doesn't tell you:** a plain list. Sixty tasks is a small sample. The tasks are in English and lean towards UK examples. It doesn't test long documents, images, voice, agents, tools or the chat apps.
- **Version and changelog.**

## Build order

1. **Harness** (PR 111), offline only, brought into line with this doc: slots and requests, the two fields, graders, private and public run records, the reservation ledger, the launcher contract.
2. **Tasks:** 60 written and cross-checked into the seven families; 20 of them held-out, in the private folder.
3. **Judges:** qualification set written and frozen; judges named in the run config.
4. **Dry run** on fixtures, and a review of the run config.
5. **Paid runs** once Kol's keys exist, OpenAI-credit calls first.
6. **Page** and transparency entries.

## Changes from v0.1 (Codex reviews, 14 Nov 2026)

1. **Outcome and pass are separate fields,** with an `answerable` flag, a precedence order for mixed answers, and outcomes assigned in every family.
2. **Slots and requests are distinct.** A slot whose retries run out stays failed; a re-run has a new identity. The "re-run until complete" rule is gone, except for runs interrupted before slots started.
3. **Judges:** one call per judge per answer; judge failures are `judge_unresolved` and never the model's failure; the dispute rate is defined; qualification is per checklist item on a balanced, frozen set.
4. **Bootstrap fully specified** (stratified by family, 20,000 resamples, percentile, fixed seed), with degenerate cases flagged. The "±8 to ±12" claim is removed.
5. **Interval overlap is a display label only.** There are no tied rank groups from overlap; comparisons stay descriptive.
6. **Budget:** dated price receipts from providers' own pages; worst-case reservation in place of an average estimate; judges inside the caps; OpenAI judging before 20 Nov. The $18 example is removed.
7. **Keys:** per Kol's instruction, the harness loads exactly two named entries from his private key file into memory at run time. Keys never enter an environment variable, and a missing name stops the run with "key not found".
8. **Rotation arithmetic fixed** (10 public tasks retire each quarter, so the set stays 40 and 20). Private and public run records are separated by an allowlist, and the leak claim is narrowed.
9. **Harness contract:** timeout scope, output-limit mapping, truncation, tools policy, missing usage, and cost and time definitions.
10. **Review answers adopted:** 60 tasks × 3 repeats; one frozen default configuration; disputed checks count as failed; the stratified bootstrap stays.
11. **Added after checking the first candidate tasks:** a default output limit of 4,096 (so the worst case fits the caps), retries reserved only when dispatched, a canary stage before the full run, the floor quota, and no abstention hints in unanswerable tasks.
