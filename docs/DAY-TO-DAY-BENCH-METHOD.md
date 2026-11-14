# Day-to-Day Bench: method (draft v0.1)

Status: draft for review. Nothing here is built or run yet.
Owner: Claude (AI Resource Hub session). Budget and run plan: koltregaskes/rooms-os-hub#270 (the API credits plan). This doc builds on that plan.

## What it is

Our own benchmark of how AI models handle the jobs ordinary people give them every day: writing, tidying up text, summarising, answering a factual question honestly, following an instruction exactly, planning, and small spreadsheet and code fixes. It leaves out science olympiads, research maths and robotics.

Every task is written by us. We reuse nobody else's questions, prompts or results. We studied how Artificial Analysis, Epoch AI, Stanford HELM, LiveBench, IFEval, SimpleQA and GDPval run their tests, and took methods only.

## Rules we hold to

1. **Everything is visible.** The method, the harness code, the grading code, the settings, and every raw answer for public tasks are published. Any number on the page can be traced to the run that produced it.
2. **Reproducible.** Fixed settings, repeated runs, and a frozen record of each run tied to a code commit and a task-set version.
3. **Honest about uncertainty.** Every score has a margin of error. Models whose margins overlap are shown as "not separable", not ranked one above the other.
4. **A failure is a failure.** An error, a timeout, a refusal or the wrong format counts as a failed attempt. It's never dropped as missing data.
5. **"I don't know" isn't the same as wrong.** Each attempt is scored correct, wrong or abstained, and the three are stored separately.
6. **No spending without a cap.** Paid runs use only credits Kol has approved, with a hard cap per provider enforced in the harness.

## How this fits what we already have

- **Meta-benchmark "Floor Capability" family** (`src/data/internal-meta-benchmarks.ts`): designed in June as the "everyday trust basics" benchmark, but never given prompts or runs. This bench is its first real implementation. Three of its planned test families become task families here: "Follow the exact brief", "Know, check or abstain" and "Grounded answer only".
- **Reliability Floor** (`src/data/reliability-floor.ts`): combines other people's benchmark scores. It stays separate, and it's affected by the source-licence work in koltregaskes/ai-resource-hub#107.
- **Model Showreel** (its own private repo and session): hand-run creative and visual builds, judged by taste. That's a different question. Its five creative-writing prompts stay there; this bench doesn't score creative taste.
- **Rooms OS personal benchmark** (`docs/repo-reference/rooms-os-benchmark.md`): observations from real work, not a controlled comparison. Separate.

## The tasks (v1: 60 tasks, text only)

| # | Family | What it tests | Tasks | Graded by |
|---|---|---|---|---|
| 1 | Follow the exact brief | Doing precisely what was asked: length limits, a required format, "don't mention X", several instructions at once | 10 | Script |
| 2 | Know, check or abstain | Short factual questions with one stable, checkable answer, UK-leaning. Includes questions with no knowable answer, where the right move is to say so | 10 | Script, three-way |
| 3 | Grounded answer only | Answering from a supplied document only. Some questions can't be answered from the document | 8 | Script, three-way |
| 4 | Summarise and extract | Pulling fields from a receipt or letter; turning meeting notes into actions; summarising 2 to 3 pages | 8 | Script for extraction; checklist for summaries |
| 5 | Rewrite and edit | Plain-English rewrites, a polite complaint email, shortening without losing facts, fixing tone | 8 | Script for hard limits, plus a checklist |
| 6 | Everyday numbers and planning | A train journey from a timetable, a calendar clash, a household budget, unit and currency sums with given rates | 8 | Script |
| 7 | Spreadsheet and code help | Fixing a spreadsheet formula, writing a small formula, a short script fix, explaining an error message | 8 | Script (formulas evaluated, code run against tests in a sandbox) |

- **Each task file holds:**
  - the prompt and any attached text;
  - the grader type, and the expected answer or checklist;
  - a difficulty note;
  - the date it was written and who checked it.
- **Two people-equivalents per task:** one agent writes the task and its answer key; a different agent checks both before the task is admitted.
- **Facts must be stable and sourced.** Each factual task's answer key links to an official source, and avoids anything likely to change within a year.
- **No personal data** in any task.
- **v1.1 (later):** reading images and PDFs. That needs a separate check of each model's file support.

### Public and held-out tasks

- **40 public tasks:** prompts, answer keys and every model's raw answers are published.
- **20 held-out tasks:** spread across all seven families. Only their ids, family and scores are published, so they can't leak into training data.
- **Published scores:** the headline uses all 60. The page also shows the public-only and held-out-only scores side by side, so a model that does much better on public tasks stands out.
- **Rotation:** every quarter, 10 held-out tasks are retired to public (with all their past answers) and 10 new held-out tasks are written. The task-set version goes up, and scores are compared only within a version.
- **Raw-answer pages** carry `noindex` and a robots rule, to slow scraping into training data.

## How a run works

- **Settings, written into every result row:**
  - the exact model id and the date;
  - the reasoning or effort setting;
  - temperature;
  - the maximum output length;
  - an empty system prompt, with no worked examples in the prompt.
- **One configuration per model in v1:** the provider's default reasoning setting and default temperature, with a fixed maximum output of 8,192 tokens. That's "the model as most people meet it". A model that can't run at defaults is run at its lowest working setting, and the page says so.
- **Access route:** each lab's own API. Results describe the API model, not the chat app, which can behave differently. The page says this.
- **Repeats:** each task is run 3 times per model, each a fresh conversation.
- **Retries:** up to 2, for transport errors only (connection failures, rate limits). A model error or a timeout (120 seconds per attempt) isn't retried and counts as failed.
- **Recorded per attempt:**
  - the raw prompt and raw answer;
  - input, output and reasoning tokens, as the provider reports them;
  - cost at the provider's list price on the run date;
  - time to first token and total time.
- **Run record:** each run writes a folder that's never edited afterwards. It holds the harness commit, the task-set version, the settings, all raw data and a manifest of file hashes.

## Grading

### Script graders (most tasks)

- Exact or normalised match, a regular expression, a JSON-schema check, a word or character count, a formula evaluation, or a test suite.
- Each grader is unit-tested with correct, wrong and abstaining sample answers before any model run.

### Three-way scoring (families 2 and 3)

- **Correct:** matches the answer key.
- **Abstained:** the answer clearly declines ("I don't know", "the document doesn't say"), detected by a script with a published pattern list, with a checklist judge as a fallback for unclear cases.
- **Wrong:** anything else, including a confident answer to a question that has no answer.
- For questions designed to have no answer, abstaining is the correct outcome.

### Checklist graders (summaries and rewrites)

- Each task has 4 to 8 pass/fail checks, for example "includes the refund amount", "under 120 words", "doesn't invent a date". There are no 1-to-10 scores.
- Checks that a script can do are done by script. The rest go to a judge model.
- **Judge panel:** two judge models from two different labs. A model's answer is never judged only by a model from its own lab.
- **A check passes** only if both judges pass it. Where the judges disagree, the check is marked "disputed" and counts as failed, and the dispute rate is published per model.
- **Judge quality check:** before the first run, both judges grade a fixed set of 40 hand-written sample answers with known verdicts. A judge that agrees with the known verdicts less than 90% of the time isn't used.
- Judge prompts are published. Judge cost is recorded separately and isn't part of a model's cost per task.

## Scores

- **Task score** = the share of its 3 attempts that pass (a checklist task passes when every check passes).
- **Family score** = the mean of its task scores, as a percentage.
- **Day-to-Day score** = the plain mean of the seven family scores. Families are weighted equally in v1, and there's no ranking by win rate against other models.
- **Shown next to the score, never folded into it:**
  - **Confident-error rate:** in families 2 and 3, the share of attempts scored wrong (as opposed to abstained).
  - **Consistency:** the share of tasks where all 3 attempts gave the same pass or fail result.
  - **Cost per task** and **cost per successful task** (cost per task ÷ pass rate), at list prices.
  - **Median time per task.**
- **Margin of error:** a 95% interval for each score, from a bootstrap that resamples whole tasks (so a task's 3 attempts stay together). With 60 tasks the interval will be wide, roughly ±8 to ±12 points; the page shows it on every score.
- **Not separable:** two models whose 95% intervals overlap are shown as "not separable on this version". The table sorts by score but doesn't number such models as different ranks.
- **Edge cases:**
  - A model with fewer than 3 completed attempts on any task because of transport errors after retries: the run is incomplete and isn't published until re-run.
  - A cost per successful task with a pass rate of 0 is shown as "no successful tasks".

## New models

- When a new model is released and we have API access, it's run on the current task-set version with the same settings rule.
- Its row carries its run date, and the page keeps every earlier run.
- After the current credits expire (OpenAI 20 Nov, Anthropic 27 Nov 2026), any further paid run is new spending and needs Kol's yes first.

## Budget (builds on hub #270)

- **Caps from the #270 plan:** about $90 of OpenAI credit and $60 of Anthropic credit, enforced per provider inside the harness, which stops at the cap.
- **How a run's cost is estimated:** attempts × (input tokens × input price + output tokens × output price), using our verified catalogue prices.
- **Worked example for one model:**
  - 60 tasks × 3 repeats = 180 attempts.
  - Planning figures of 2,000 input tokens and 3,000 output tokens (reasoning included) per attempt.
  - At $5 per million input tokens and $30 per million output tokens (GPT-5.6 Sol's verified list price), that's 180 × ($0.01 + $0.09) = **$18**.
- **Pre-flight:** before any call, the harness prints the estimate for the whole run from the actual task sizes and current prices. It refuses to start if the estimate is above the remaining cap.
- **Judge cost** counts against the same provider caps, and is estimated the same way.
- **Order:** OpenAI models first, because that credit expires first.

## Keys and safety

- Kol creates the two API keys himself and stores them as Windows credentials, as hub #270 describes. No agent reads, types or stores a key.
- The harness gets a key only through the existing credit-key wrapper, for one child process. It refuses to run if it finds a key in an environment variable or a file.
- Until the keys exist, everything runs in dry-run mode against recorded fixtures.

## On the page (`/benchmarks/day-to-day/`)

- **Table:** each model with its Day-to-Day score and margin, the seven family scores, confident-error rate, consistency, cost per task, cost per successful task and median time.
- **Receipts:** every number links to its run record. Every public task shows its prompt, its answer key and each model's three raw answers.
- **Labels:** the model id, settings and run date sit on every row. "API model, default settings" is stated at the top.
- **What this doesn't tell you:** a plain list. Sixty tasks is a small sample. The tasks are in English and lean towards UK examples. It doesn't test long documents, images, voice, agents or the chat apps.
- **Version and changelog:** the task-set version, what changed and when.

## Build order

1. **Harness** (`bench/daily-use/`), dry-run only: task loader, graders with unit tests, run records, cost estimate, caps. This is the Codex job in the #270 plan.
2. **Tasks:** 60 written and cross-checked; judges qualified on the 40-sample set.
3. **Dry run** on fixtures, then a method review of the first real results before anything is published.
4. **Paid runs** once Kol's keys exist, OpenAI first.
5. **Page** and transparency entries (each calculation above goes on the transparency page).

## Open questions for the reviewer

1. Is 3 repeats enough for a 60-task set, or should we cut to 50 tasks and run 4 repeats within the same budget?
2. Is "provider defaults" the right single configuration, or should every model also get one run at its highest reasoning setting?
3. Should disputed checklist items count as failed (as written), or be dropped from both sides of the score?
4. Is the bootstrap over tasks the right margin of error here, or is a simpler per-family standard error clearer for readers?
