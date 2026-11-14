# Day-to-Day Bench: core loader and graders

The task loader, the graders and the outcome rules for task set v1. Pure Python, standard library only, apart from the formula engine. Nothing here calls a model or the network.

The binding rules are in `../task-set-v1/README.md` ("Task fields" and "Grader rules") and in `docs/DAY-TO-DAY-BENCH-METHOD.md` ("Attempts, outcomes and passes", "Grading" and "Outcome classification by the judges"). Where this code and those documents differ, the documents win and this code has a bug.

## Modules

| File | What it does |
|---|---|
| `tasks.py` | `load_tasks(public_dir, held_out_dir=None)` reads and validates the task files. Integers stay exact. An unknown grader type, an unknown grader option or a missing field stops the load with a clear error. Held-out files are checked against the SHA-256 hashes in `held-out-manifest.json`. Prompt text is never logged or put in an error. |
| `graders.py` | One function per grader type: `exact`, `one_of`, `regex`, `numeric`, `json`, `constraints`, `python_tests`, `formula`, `abstain`, `checklist`. `grade(task, reply)` picks the right one. `apply_judge_verdicts(result, verdicts_by_judge)` finishes a checklist once the judges have answered. |
| `outcome.py` | `classify_outcome(reply, task)` labels a reply `answered`, `abstained`, `refused` or `malformed` from a published pattern list, or returns `needs_judge`. `decide(task, reply)` returns `{outcome, pass, pending, detail}` using the method's mapping table. |
| `_formula_worker.py` | The child process that holds the formula engine. Started by `graders.py`; not imported. |
| `requirements.txt` | The formula engine and its pinned version. |

## What a grader returns

Every grader returns a `GradeResult` with a `status`:

- `passed`: the answer is accepted.
- `failed`: the answer is rejected. `failed_by` is `script` or `judge`.
- `needs_judge`: every script check passed and judged checks are still open (`result.needs_judge` lists each check's id and text), or the outcome patterns couldn't classify a reply to an abstain task.
- `pending`: verdicts were supplied but at least one check is `judge_unresolved`.

A script verdict is final and never goes to a judge. For a judged check: it passes only if every judge says true; a disagreement is `disputed` and counts as failed; a missing or malformed verdict is `judge_unresolved` and the pass stays pending.

## Outcome and pass

`decide(task, reply)` runs the task's grader first on any task that has an answer. If the grader accepts the reply, the outcome is `answered` and pass is true, whatever the wording. So a task whose correct answer is the word "Unknown", or a sentence containing "I cannot help", is graded by its grader and not mistaken for a decline. The outcome patterns are used only for a reply the grader didn't accept, and for tasks with no knowable answer.

The pattern lists are constants at the top of `outcome.py`, with a comment on each group. `execution_error` is set by the runner, never here.

## Running the tests

From the repository root:

```
python -I -m unittest discover -s bench/daily-use/core/tests -v
```

The main test (`test_public_truth.py`) loads all 40 public tasks and runs every accept and reject example through the graders. The held-out loading test uses a made-up folder in a temporary directory. No test reads the real held-out tasks.

### The formula engine

Formula tasks are evaluated by the Python `formulas` package, version 1.3.4, with `openpyxl` (see `requirements.txt`). It is found lazily and only when a formula task is graded.

- If it is installed for the interpreter, nothing more is needed.
- If it lives in another folder, give that folder in the `DTD_FORMULAS_PATH` environment variable before running the tests. The tests add it to the import path. No path is hard-coded.
- If it is not available, `grade()` raises `FormulaEngineUnavailable` for a formula task. The task is not graded. It is never graded by matching the formula's text. The engine tests are then skipped and the truth test reports the two formula tasks as skipped.

The engine takes a few seconds to import, so it runs in one long-lived child process. Each answer's cases are evaluated under the 10 second limit.

**Home cell.** The task README says a formula is written for C2 "unless the task's prompt names another". The grader uses, in order: a `home_cell` key on the grader; C2, if no case puts data in C2; otherwise the one cell the prompt names with "formula for X", "formula in X" or "in cell X". If that doesn't give exactly one cell, the task can't be graded as written. Adding `home_cell` to a formula task's grader removes the guesswork.

## The sandbox caveat

`python_tests` runs the submitted code in a separate Python process started with `-I -S`, with an empty environment (on Windows only `SYSTEMROOT`, which the interpreter needs to start), a fresh temporary working folder, and a 10 second wall-clock limit. Before it runs, a static check refuses source that imports or names networking modules, `subprocess`, `ctypes` or `socket`, that touches `os.environ`, or that opens a file outside the temporary folder.

**This is a guard for honest model output. It is not a security boundary.** A program written to get round the static check can do so, and the child process can still read what the user account can read. Don't run code from an untrusted or hostile source through it. Real runs should happen on a machine and account where that risk is acceptable, with no API keys in the environment (the method already forbids that).

The 10 second clock starts when the child process reports that its interpreter is up, so a slow process start on a busy machine isn't counted against the answer.

## Known limits

- The outcome patterns are English only and deliberately cautious. A reply they can't classify is returned as `needs_judge` for the judge panel.
- A long reply (over 120 words) that contains a decline phrase is sent to the judges, not classified by script.
- The static check may refuse an honest answer that uses a blocked module such as `pathlib`. That answer fails, with the reason in `detail`.
