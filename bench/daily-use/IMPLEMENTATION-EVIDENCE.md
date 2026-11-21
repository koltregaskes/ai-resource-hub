# PR111 stable-contract implementation receipt

Implementation base: 595f672d7a28c217a010e86f6a4ae0c4c5995594.
Method source: 5127575a52d02217cdd3dce48a52a54112c98b4e.
Key-contract authority: hub #1578 comment 6880736238 and Kol's implementation
instruction. Method director review 6880795768 remains blocking, not accepted.

This patch retains the original PR111 branch and author/B10 custody. No method
document change, merge, paid call, key-source read or real held-out read occurred.
Gaming-Laptop is development only. Mini PC is the proposed run/checker host.

## Implemented

Coverage and provider-stop reporting; outcome/pass/answerability precedence;
case-sensitive matching; hard-check/rubric conjunction; UUID runs without merging;
4096 default with justified per-task 8192; conservative whole-run fixture refusal
and per-dispatch shared provider/global caps; private runtime path loader and
allowlisted public records; named runtime key-file loader with direct local key
arguments and ambient-key refusal; deterministic LF output and repaired baseline.

Historical baseline records and source snapshots preserve their original
semantics. The old manifest fields are archived; repaired hashes refer to LF
bytes actually committed, with historical source snapshots named separately.
No new fixture performance result is represented as a real-model measurement.

## Validation scope

25 Python unittest regressions are authored in test_harness.py. **They have not
been executed in this session.** They cover fake key files, absent/duplicate keys,
explicit alternatives, no environment export, secret echo rejection, full/partial/
zero/all-error coverage, preflight and dispatch caps, transport-only retries,
outcome precedence, rubric failure, private allowlists, unique runs, exclusive
writes, deadlines, output limits and LF baseline hashes.

Executed in the connector orchestration V8 isolate:
- Fixture schema/oracle audit: 60 synthetic fixture answers satisfy the mirrored
  development checks; all fixture tasks remain public and admitted:false.
- Conservative fixture arithmetic: 27.394048 USD per provider, 54.788096 total.
  This is config arithmetic with synthetic prices, not dispatch or live spend.
- SHA-256 known-answer check for "abc"; six baseline LF entries recomputed and
  matched to the staged content. This is byte-integrity evidence, not a Python run.
- Source invariants and JSON parsing checked before the single branch update.

The local Core launcher was unavailable. Node REPL also failed before execution
with "registered Core launch requires an installed app". No unchanged retry or
alternate execution host was used. No Python, Node, build or browser pass claimed.
The repo's external Websites instructions could not be read on that route;
repo AGENTS.md, README and DATA-COLLECTION-PLAN.md were read through GitHub.
No local checkout was mutated; local dirty-work state was not inspectable.

## Remaining owner action

Execute python -m unittest -v on this exact candidate using a supported offline
host. Independently review the code through the original custody lane. Resolve
method-owner blockers: checklist conjunction/outcome fallback acceptance,
calibration class balance, full canary/retry budget bound, PRNG/quantiles and
immutable finalization. Intervals/ranks and live execution remain disabled.
Then retain all existing merge/task-admission/judge/config/price/cap/key/run gates.

The dry-run command and refusal/acceptance matrix are in README.md. No #1541
post is attempted here; the root owns that evidence packet.

Pre-push readback: PR111 still at its implementation base; no competing PR111
author claim found. PR110 advanced to e2008381600abe713e557ad40551bf0b9adec926,
whose full text was reread. Stable implementation remains scoped to the frozen
5127575 source plus Kol's continuation instruction; new task-set/judge counts
are not silently applied to the synthetic fixtures. Latest owner receipt
hub #1578/6880948754 reports 60 drafted, 0 admitted. No method acceptance inferred.

## Narrow fixture filename compliance correction

The three synthetic key-file fixtures now use synthetic-key-fixture.txt, complying
with the ban on any .env file, including fake files. Fixture bytes, parser and
assertions are unchanged. The 25 Python regressions remain **UNEXECUTED**, not
passed. No real keys or .env files were read; no variables were exported. No local
Core, Node or Python execution was attempted for this correction.

Mini PC is the intended paid-run/private-checker host, not an admitted offline
test runner. Explicit runner acceptance and a supported execution route remain
OPEN; its reported 1.5 GB snapshot is below the 3 GB new-builder floor. Existing
method/B10/live-refusal/no-merge holds remain; PR122 stays open.
