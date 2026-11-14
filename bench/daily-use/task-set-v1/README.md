# Day-to-Day Bench: task set v1 (candidate, not yet admitted)

These are the 40 public tasks for the Day-to-Day Bench. The method is `docs/DAY-TO-DAY-BENCH-METHOD.md`. The 20 held-out tasks aren't in this repo; only their ids and file hashes are listed in `held-out-manifest.json`.

**Status:** every task here is a candidate. A task is admitted only when a second agent, who didn't write it, has checked its prompt, answer key and grader, and that check is recorded in `admission.json`.

## Files

| File | Tasks |
|---|---|
| `public/floor.json` | 12 floor tasks (very short basics), 2 in each of families 1, 3, 4, 5, 6 and 7 |
| `public/families-1-2.json` | Family 1: 5 tasks. Family 2: 7 tasks |
| `public/families-3-4-5.json` | 3 tasks in each of families 3, 4 and 5 |
| `public/families-6-7.json` | Family 6: 4 tasks. Family 7: 3 tasks |
| `held-out-manifest.json` | Ids, families and SHA-256 hashes for the 20 held-out tasks |
| `validate_set.py` | Checks counts, ids and required fields |

## Task fields

- `id`: `f<family>-<pub|ho>-<nn>`.
- `family`: 1 to 7, as in the method.
- `split`: `public` or `held-out`.
- `answerable`: false only for the four unanswerable tasks (one public and one held-out in each of families 2 and 3). Their prompts never hint that "unknown" is allowed.
- `floor`: true for the 12 floor tasks.
- `prompt`: the full text the model sees.
- `max_output_tokens`: 4,096 for every task in v1.
- `grader`: the grader type and its parameters (below).
- `expected`: the correct answer, for people to read. The grader decides, not this field.
- `accept_examples` and `reject_examples`: answers that must pass and must fail. The harness's unit tests run every one of them through the grader before any model run.
- `sources`: family 2 only. The official page each fact was checked against, with a short quote and the date.
- `why_hard`, `verification`, `author`, `written_on`.
- On tasks changed after review: `version` 2 and `changed_in_v2` (one sentence on what changed). `engine_validated` (formula tasks: engine, version and date of a passed engine check). `reject_notes` (checklist tasks: for a reject example that passes every script check, which judge check rejects it). It takes one of two forms: an object keyed `R1`, `R2`... by the example's position, or an array in step with `reject_examples`, with `null` where no note is needed.
- A family 2 `sources` entry may also carry `version_note`, `supports` (what the source establishes) and `scope_of_unknown` (for an unanswerable task: exactly what the source says isn't recorded).

## Grader rules

These are binding on the harness. Where a task's author assumed something, it's written here so the harness and the checker use the same rule.

**All graders**
- The answer is the model's full reply with leading and trailing whitespace removed.
- A reply wrapped in a single Markdown code fence is unwrapped first for `json`, `formula` and `python_tests` only. For every other grader a fence is part of the answer.
- Words are counted by splitting on whitespace.

**`exact`:** equal to `value` after trimming; case-insensitive unless `case_sensitive` is true.

**`one_of`:** `exact` against any of `values`.

**`regex`:** the pattern must match the whole answer, unless `"search": true`. `flags` is a string of Python flag letters (`i`, `m`, `s`); an empty string or no `flags` key means case-sensitive.

**`numeric`:**
- `only_number`: the whole answer, after trimming, must be one number and nothing else: an optional minus sign, digits (thousands commas allowed) and an optional decimal part. Words, units, a second number, a trailing full stop or Markdown all fail.
- `allow_affixes` (with `only_number` only): a list of strings the prompt allowed, such as `["£"]`. At most one listed string may stand straight before the number and at most one straight after it, with optional spaces between; matching is case-sensitive. With no `allow_affixes`, any currency sign or unit fails.
- `last_number`: the last number in the answer.
- Thousands commas are removed before parsing ("1,830" is 1830). A pass is within `tolerance` of `value`, compared as decimals; `"tolerance": 0` means exactly equal ("14.0" equals 14).

**`json`:**
- The answer must parse as one JSON value with no prose around it.
- Objects compare by key, in any order. Arrays compare in order.
- Extra keys fail unless `allow_extra_keys` is true.
- Numbers compare within `numeric_tolerance`. A number given as a string fails, and so does a string given as a number.
- Strings compare after trimming and case-folding when `string_compare` is `casefold_trim`.
- `null` matches only `null`.
- `integer_keys`: a list of key names. For a listed key, the answer's value must be a JSON number with no fractional part (`10` or `10.0`) and exactly equal to the expected value; `numeric_tolerance` doesn't apply to it.

**`constraints`:** every check in `all` must pass.
- `max_words`, `min_words`: whitespace word count, inclusive.
- `max_chars`: character count, inclusive.
- `must_include`: every value appears, as a case-insensitive substring.
- `must_not_include`: no value appears, as a case-insensitive substring.
- `regex`: a search (not a whole-answer match), with optional `flags` as above.
- `match_count`: the number of non-overlapping matches of `pattern` in the answer (Python `re.finditer`, optional `flags` as above) must equal `value`. A `value` of 0 means the pattern must not occur at all; 1 means exactly once.
- `line_count`: the number of non-empty lines equals `value` (a line of only spaces counts as empty).
- `starts_with`, `ends_with`: case-sensitive, after trimming.
- A check may carry a `note` saying what it's for. It's for readers only; the harness ignores it.

**`python_tests`:**
- The reply is treated as Python source and run in the sandbox (no network, no environment, 10 seconds).
- `entry` is called once per test with `args`. The result must equal `expect`, with Python `==` and the same type for `bool` versus `int`.
- A test with `"raises": "ValueError"` passes only if that exception is raised.
- Any exception, timeout or syntax error fails the task.

**`formula`:**
- The reply is one Excel formula, with or without the leading `=`.
- For each case, the cells in `cells` are set, every other cell is empty, and the formula is evaluated by a real formula engine.
- The formula is written for one cell. That cell is `C2` unless the task's prompt names another.
- A case may set `target_cell`. The submitted formula is then copied from its home cell to `target_cell` the way a spreadsheet fill does (relative references shift, `$` references stay), and evaluated there. This checks that a formula still works when filled down.
- A numeric result must be within 0.005 of `expect`; a text result must equal it exactly.
- If the harness has no formula engine, formula tasks can't be graded and must not be run. They're never graded by pattern-matching the formula text.

**`abstain`:**
- Passes when the outcome is `abstained` under the method's precedence rules: the reply declines to give the fact, and doesn't offer a substantive answer.
- A reply that names several candidates from the document without choosing one, and says the document doesn't settle it, is an abstention.
- A reply that gives one answer, even hedged, is `answered` and fails.
- Detection is by the published pattern list first. A reply the patterns can't classify goes to the judge panel.

**`checklist`:** every check must pass.
- `by: "script"` checks use the `constraints` check types above and are final.
- `by: "judge"` checks go to the judge panel, under the method's rules.

## Known limits of this candidate set
- **Formula tasks (2 public: `f7-pub-01`, `f7-pub-03`):** on 14 Nov 2026 both were validated in a real formula engine, the Python `formulas` package version 1.3.4 (each case written as a workbook with openpyxl, then calculated). Every accept formula gave the expected value in every case and every reject formula differed in at least one; each task records this in `engine_validated`. They haven't been run in Excel itself, and this check covered the public tasks only.
- **Family 2 is mostly easy for strong models.** The unanswerable tasks do most of the separating there.
- **One task is flagged for the checker:** `f2-pub-07`, where a careful reply could reasonably add a hedged traditional answer and would then fail.
