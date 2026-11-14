# Day-to-Day Bench: core loader and graders

The task loader, the graders and the outcome rules for task set v1. Pure Python, standard library only, apart from the formula engine. Nothing here calls a model or the network.

The binding rules are in `../task-set-v1/README.md` ("Task fields" and "Grader rules") and in `docs/DAY-TO-DAY-BENCH-METHOD.md` ("Attempts, outcomes and passes", "Grading" and "Outcome classification by the judges"). Where this code and those documents differ, the documents win and this code has a bug.

## Modules

| File | What it does |
|---|---|
| `tasks.py` | `load_tasks(public_dir, held_out_dir=None)` reads and validates the task files. Integers stay exact. An unknown grader type, an unknown grader option or a missing field stops the load with a clear error. Held-out files are checked against the SHA-256 hashes in `held-out-manifest.json`. Prompt text is never logged or put in an error. |
| `graders.py` | One function per grader type: `exact`, `one_of`, `regex`, `numeric`, `json`, `constraints`, `python_tests`, `formula`, `abstain`, `checklist`. `grade(task, reply)` picks the right one. `apply_judge_verdicts(result, verdicts_by_judge)` finishes a checklist once the judges have answered. |
| `outcome.py` | `classify_outcome(reply, task)` labels a reply `answered`, `abstained`, `refused` or `malformed` when that is clear, and otherwise returns `needs_judge`. `decide(task, reply)` returns `{outcome, pass, pending, detail}` using the method's mapping table. |
| `sandbox.py` | The sandbox for `python_tests`: the two backends (Docker, and bubblewrap under WSL), the self-test, and the host side of a test run. |
| `_sandbox_runner.py` | The program that runs inside the sandbox. Sent to it on standard input; never run on the host by the graders. |
| `_sandbox_probe.py` | The self-test probe. Also runs only inside the sandbox. |
| `_formula_worker.py` | The child process that holds the formula engine. Started by `graders.py`; not imported. |
| `requirements.txt` | The formula engine and its pinned version. |

## What a grader returns

Every grader returns a `GradeResult` with a `status`:

- `passed`: the answer is accepted.
- `failed`: the answer is rejected. `failed_by` is `script` or `judge`.
- `needs_judge`: every script check passed and judged checks are still open (`result.needs_judge` lists each check's id and text), or the script couldn't classify a reply to an abstain task.
- `pending`: verdicts were supplied but at least one check is `judge_unresolved`.
- `sandbox_unavailable`: a `python_tests` reply was not run because there is no proven sandbox. The task has not been graded.

A script verdict is final and never goes to a judge. For a judged check: it passes only if every judge says true; a disagreement is `disputed` and counts as failed; a missing or malformed verdict is `judge_unresolved` and the pass stays pending.

A reply never makes a grader raise. A JSON number outside the supported range (larger than 10^400 in size, closer to zero than 10^-400, or an integer of more than 4,000 digits) is still valid JSON, so the reply is not malformed; the number simply never equals an expected one and the answer fails.

## Outcome and pass

**The script decides only the clear cases. Everything else goes to the judges.** A substantive answer must never pass as an abstention, so the script would sooner say "I can't tell" than guess.

How `classify_outcome` works, in order:

1. The reply is normalised: Unicode NFKC, every kind of Unicode space (no-break, narrow no-break, thin and the rest) to one plain space, typographic quotation marks and apostrophes to ASCII ones, zero-width characters removed.
2. Quotations are taken out: Markdown block-quote lines, text inside quotation marks, and sentences copied word for word from the prompt.
3. No decline phrase outside quotations: `answered`. If a decline phrase sits inside a quotation that isn't from the prompt, the script can't tell whose words they are: `needs_judge`. A reply that is one quotation and nothing else is read as the model's own words.
4. Wording that may be a decline or may be a statement of fact ("no price has been agreed", "the date is yet to be set"): always `needs_judge`.
5. An abstention phrase is present. The script says `abstained` only if there is no refusal phrase, no quotation of any kind, and, once the abstention phrases themselves are blanked out, nothing left that could be an answer. That means: no digit, money sign or percent sign; no clause introduced by "probably", "I think", "my guess", "it is", "the answer is", "should be" and the like; no naming of several candidates; and no word at all outside a short published list of function words and words about the source (`SAFE_WORDS`: "the", "from", "document", "sorry" and so on). Any name, day, month, number word or other content word sends the reply to the judges.
6. A refusal phrase is present, with no abstention phrase. The script says `refused` only if nothing else is in the reply, by the same test. Otherwise `needs_judge`.

So "I don't know." and "The minutes don't say." are `abstained` by script. "I don't know, probably London", "I don't know. The meeting starts at ten o'clock.", a decline that goes on to explain itself, and a decline that names two candidates without choosing all go to the judges. The script never returns `abstained` for a reply with anything but a decline in it, and never returns `answered` for a reply that has a decline phrase of its own.

The task README says a reply that names several candidates without choosing, and says the document doesn't settle it, is an abstention, and that a reply the patterns can't classify goes to the judges. Both hold: that reply is one the script can't classify, so the judges give it its label.

`decide(task, reply)` runs the task's grader first on any task that has an answer. If the grader accepts the reply, the outcome is `answered` and pass is true. So a task whose correct answer is the word "Unknown", or a sentence containing "I cannot help", is graded by its grader and not mistaken for a decline.

One exception keeps the method's refusal precedence. Some graders accept an answer inside a longer reply: a checklist, `constraints`, a searching `regex`, and `numeric` with `last_number`. Such a reply could also refuse. So when it holds a refusal phrase outside quotations, the refusal sentences are taken out and the rest is graded again. If the rest is still accepted, the refusal was not part of the answer: the outcome goes to the judges, and pass waits for them. If the rest is no longer accepted, the phrase was the answer itself (a task that asks for a polite refusal, say) and the outcome stays `answered`.

When the outcome needs the judges, `detail["pass_if"]` says what pass becomes for each label they might give, and `decide(..., outcome_verdict=<label>)` finishes the decision once they have agreed.

The pattern lists and the word lists are constants at the top of `outcome.py`, with a comment on each group. `execution_error` is set by the runner, never here.

## Running submitted code: the sandbox

**No model-written code runs on the host.** There is no in-process mode and no plain-subprocess mode, and nothing falls back to one.

- **What goes in.** Only the submitted source, the entry name and each test's arguments, on standard input. The expected values and expected exceptions never leave the host, so a submission has nothing to read them from. Nothing is mounted and no file is written for the job.
- **What comes out.** For each test, what the entry function returned, as JSON with explicit type tags (so `True` and `1` stay different and integers of any size stay exact), or which exception it raised. The host does the comparing: Python `==`, with `bool` never equal to a number, at any depth and in dictionary keys.
- **Limits.** 10 seconds of wall-clock time for loading the code and running every test, enforced from the host and counted from the moment the sandboxed interpreter is up. Output is capped at 64 KB per test and 1 MB in all. Over any limit is a failure.
- **Proof first.** Before any grading, the backend's `self_test()` must pass in the same process. It runs a fixed, benign probe inside the sandbox that tries to list the root, `/mnt`, `/mnt/c` and `/mnt/w`; read a host file; see a host environment variable; write under `/usr`; open a TCP connection to 1.1.1.1:53 and to 127.0.0.1; start more processes than the limit; write a 100 MB file; and allocate 1 GB. It passes only if every attempt failed or was contained, and it reports each one.

Backends, chosen with the `DTD_SANDBOX` environment variable. There is no default:

| `DTD_SANDBOX` | What it is |
|---|---|
| `docker` | `docker run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges --pids-limit 64 --memory 256m --cpus 1 --user 65534:65534 --tmpfs /tmp:rw,size=16m,noexec`, with no volume mounts and `--pull never`. The image is pinned in `sandbox.DOCKER_IMAGE` (`python:3.12.7-slim-bookworm`) and must already be on the machine. On expiry the named container is killed with `docker kill`. |
| `wsl-bwrap` | Through `wsl.exe`: `bwrap --unshare-all --die-with-parent --new-session`, with only `/usr` bound (read-only), a fresh `/proc`, `/dev` and `/tmp`, a cleared environment, no Windows drive and no network, plus `timeout` and `prlimit` limits on CPU time, address space, file size and process count. `DTD_WSL_DISTRO` names the distribution if it isn't the default one. |

Nothing here installs, downloads or pulls anything. If no backend is chosen, the tool or the image is missing, or the self-test fails, a `python_tests` reply comes back `sandbox_unavailable`: it is not graded, `decide` reports the slot as pending on `sandbox`, and it is never run on the host or graded by its text.

Two things are still decided without a sandbox, because neither runs anything: a reply that isn't valid Python is `malformed`, and source the static pre-filter refuses fails with the reason.

**The static pre-filter is not the security boundary.** `static_source_problems` refuses code that is obviously outside a small scripting task (networking imports, `subprocess`, `os.environ`, opening files by a computed path). Its use is the clear failure message. A program written to get round it can do so; the sandbox is what contains it. The pre-filter may also refuse an honest answer that uses a blocked module such as `pathlib`; that answer fails, with the reason in `detail`.

A submission shares a process with the runner inside the sandbox, so it can write to the report channel. That gains it nothing: it doesn't know the expected values, so a forged report can only state values the submission could have returned anyway.

## Running the tests

From the repository root:

```
python -I -m unittest discover -s bench/daily-use/core/tests -v
```

The main test (`test_public_truth.py`) loads all 40 public tasks and runs every accept and reject example through the graders. The held-out loading test uses a made-up folder in a temporary directory. No test reads the real held-out tasks.

No test runs submitted code on the host. The `python_tests` grader is tested through a fake backend that runs nothing and answers with canned reports. The real backends are tested only when one is available and `DTD_SANDBOX_TESTS=1` is set. Without a proven sandbox (`DTD_SANDBOX`), the truth test reports the examples of the three `python_tests` tasks as not graded.

### The formula engine

Formula tasks are evaluated by the Python `formulas` package, version 1.3.4, with `openpyxl` (see `requirements.txt`). It is found lazily and only when a formula task is graded.

- If it is installed for the interpreter, nothing more is needed.
- If it lives in another folder, give that folder in the `DTD_FORMULAS_PATH` environment variable before running the tests. The tests add it to the import path. No path is hard-coded.
- If it is not available, `grade()` raises `FormulaEngineUnavailable` for a formula task. The task is not graded. It is never graded by matching the formula's text. The engine tests are then skipped and the truth test reports the two formula tasks as skipped.

The engine takes a few seconds to import, so it runs in one long-lived worker process with an empty environment and a temporary working folder. Each answer's cases are evaluated under the 10 second limit; a worker that overruns is killed.

**Residual risk.** The engine evaluates spreadsheet expressions; it does not run code. But it does parse model-written text, and it does so in a host process under the current account, not in the sandbox. To keep that small: a formula longer than 2,000 characters fails without reaching the engine; a formula that refers to another sheet or workbook (`!` or square brackets outside a text literal) fails without reaching the engine, so the engine is never asked to open another file; and the worker has the time limit above. What is left is the chance of a fault in the engine's own parser or functions being reached by a crafted formula. Moving the worker into the same sandbox would remove that; it needs the engine's packages inside the sandbox image, which is a decision for the owner.

**Home cell.** The task README says a formula is written for C2 "unless the task's prompt names another". The grader uses, in order: a `home_cell` key on the grader; the one cell the prompt names with "formula for X", "formula in X" or "in cell X" that isn't a cell a case fills with data, whether or not C2 is free; otherwise C2, if no case puts data in C2. If the prompt names more than one such cell, or names none while C2 holds data, the task can't be graded as written. Adding `home_cell` to a formula task's grader removes the guesswork.

## Known limits

- The outcome patterns are English only and deliberately cautious. Most replies that decline and then say anything more go to the judge panel, which costs judge calls. That is the intended trade.
- The `wsl-bwrap` backend has been written to the specification but not yet run on a machine that has bubblewrap. Its self-test must pass before it grades anything, so a fault in it shows up as `sandbox_unavailable`, not as unsafe running.
- The static pre-filter may refuse an honest answer that uses a blocked module.
- The formula worker is a host process (see "Residual risk" above).
