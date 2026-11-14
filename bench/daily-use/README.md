# Daily-use benchmark: offline development

This is a harness implementation, not an admitted benchmark or permission to
spend. The 60 public synthetic fixtures remain non-admitted tests. The method
owner maintains PR110; the original PR111 author and B10 retain custody.

From this directory, Python 3.11+ with the standard library only:

```powershell
python -m unittest -v
python harness.py --dry-run --out runs/new-unique-id --max-usd 60
```

Use a new destination for every invocation. Each invocation also generates its
own UUID. Nothing resumes, appends or merges across runs. A complete fixture run
has 360 slots. Reports show planned, attempted, unstarted, passed, failed and
pending slots for every model, including zero-attempt models and stopped providers.
A preflight refusal starts zero slots across all models.

## Confirmed contracts

- A slot has separate outcome, pass and answerable fields. Error/empty precedes
  malformed format, policy refusal, substantive answer, then a bare abstention.
  Published decline/refusal patterns are in contracts.py. Hedges and quoted
  declines do not become successful abstentions. Unclear cases are flagged for
  adjudication; the final method fallback remains blocked.
- Script matching is case-sensitive unless a task opts out. Fixture keyword
  rubrics are development checks, not semantic judges. A rubric can never turn
  a failed hard check into a pass. Missing/malformed fixture verdicts are pending.
- Default output limit is 4096. A task may explicitly request 8192 with a
  long_answer_reason. No code/formula execution sandbox is enabled here.
- Each dispatched fixture request reserves its ceiling against a single shared
  provider/global ledger. Only connection, 429 and 5xx errors retry (at most
  three requests per slot). Timeout, format, refusal and grading do not retry.
  Exhausted retries remain a failed slot. Reservations are conservatively
  retained; no unknown usage is treated as free.
- Offline preflight reserves three maker requests per slot, two judge requests
  per rubric answer, and 80 qualification requests per judge. This conservative
  bound is USD 54.788096 for the synthetic config, within its synthetic USD 30
  per-provider / USD 60 global caps. These prices are not current price receipts.
  This is NOT approval of the final paid retry/canary bound.
- Seven method family counts are recorded in contracts.FAMILIES. The fixture
  distribution does not claim those admission counts or a headline family score.
- Public results use an allowlist. Held-out rows expose only id, family, outcome,
  pass, tokens, cost and timing. Raw prompts/answers/judge material and task keys
  stay in the separate private record. No arbitrary config or file path is
  published. Real held-out prompts must never enter this repository.
- A runtime --private-tasks path must resolve outside the repository; using it
  requires an external --private-out directory. Public/private destinations must
  be disjoint. This implementation was developed with synthetic data only.
- Outputs are exclusive UTF-8 LF writes with hashes. Read-only bits protect
  against accidental edits only. Crash-safe immutable finalization acceptance
  remains pending; incomplete records must never be published.

## Key setup and refusal matrix

The earlier credit-key wrapper contract is superseded by a runtime named-file
loader. config.fixture.json explicitly names OPENAI_API_KEY and CLAUDE_API.
Names match case-insensitively. Alternatives must be listed explicitly in order;
the loader never guesses. It retains only selected values in local variables and
passes a key directly to the HTTP client. It never exports environment variables.
Tests use fake temporary files only. No agent opens the real source file.

| Input | Contract |
| --- | --- |
| Both explicitly named fake entries | Loader accepts; returns local provider-key mapping |
| Explicit alternative name | Accepted in configured order; no inferred aliases |
| Missing selected name | key not found: NAME only |
| Duplicate selected entry, empty value, malformed quote | Refused without values |
| Overlapping/invalid configured names | Refused |
| Unrelated file entries | Not parsed as values, retained, logged or serialized |
| OPENAI_API_KEY / ANTHROPIC_API_KEY in process environment, even empty | Refused before file read |
| --key-file with --dry-run | Refused before file read |
| --live, with any file/config | Refused before key/private-file read or network |
| Provider echoes either supplied key | Adapter refuses; no raw error body logging |
| Public/private output reuse or overlap | Refused |

Reading a line necessarily buffers its bytes; the loader does not promise
protection from memory dumps. Do not log returned mappings or exception locals.
The CLI suppresses arbitrary exceptions and prints only validated missing names.
The run path never invokes the loader while live execution is disabled.

## Runtime-owner setup checklist

Development host: Gaming-Laptop. Proposed paid-run and private-checker host:
Mini PC. No new worker, service, port or schedule is required.

1. Retain original PR111 author/B10 custody and method-owner review.
2. Resolve the method blockers, review and merge both PRs through existing gates.
3. Admit/cross-check actual public and private tasks; freeze exact task hashes.
   These 60 development fixtures cannot supply the admitted or private set.
4. Qualify the two-lab judge panel with the frozen balanced reference set.
5. Freeze/review exact model/API settings, retention, dated prices, provider
   balances, full retry/canary/judge reservations and the global cap.
6. On Mini PC, set the key-file path only at runtime. Configure exact entry
   names, clear generic process key variables, and never export loaded values.
7. Run the fake-file unittest suite and the dry-run command above on the exact
   candidate. Review coverage, source/artifact hashes and public/private isolation.
8. Only the approved run owner may later execute real-secret loading and the
   separately approved canary. Live refusal remains in this implementation.

Frozen source method: PR110 at 5127575a52d02217cdd3dce48a52a54112c98b4e.
Implementation base: PR111 at 595f672d7a28c217a010e86f6a4ae0c4c5995594.
Director review 6880795768 is not acceptance: checklist conjunction, outcome
fallback, calibration class balance, full retry/canary bound, PRNG/quantiles and
immutable finalization remain blocking with the method owner. Intervals and
rank comparisons are withheld pending the final statistical contract.

Historical baseline: its archived records are normalized to LF; source snapshots
from its recorded fa31ff51 commit live under fixture-baseline/source/. The original
manifest fields are retained separately. The repaired manifest hashes those
committed LF bytes; it does not claim the new harness produced the historical run.

Validation for this change is described in IMPLEMENTATION-EVIDENCE.md. No paid
provider/judge calls or real-secret/private-set reads were made.

Latest method reread before push: e2008381600abe713e557ad40551bf0b9adec926.
Its 10 judge-graded tasks belong to the new real task set, not this fixture set.
Owner receipt hub #1578/6880948754 reports 60 drafted, 0 admitted; this patch
neither imports those drafts nor grants admission or judge qualification.
