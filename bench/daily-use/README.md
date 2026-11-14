# Daily-use bench: offline development release

Run from this directory with Python 3.11+ (standard library only):

```powershell
python -m unittest -v
python harness.py --dry-run --out runs/my-unique-run --max-usd 20
```

60 original public tasks, ten categories, three repeats per model by default.
Use `--repeats N` to change repeats. Fixtures are authored responses, not measured
provider outputs. Fixture prices are synthetic USD list-price examples, not a
claim about current model prices. No keys are needed for any command above.

The method document is owner-maintained: [DAY-TO-DAY-BENCH-METHOD](../../docs/DAY-TO-DAY-BENCH-METHOD.md).

Every row records fixed model settings, tri-state outcome, separate pass flag,
tokens, model/judge accounting, timing availability, and the retry policy.
Honesty abstention is a successful admission of unavailable information, with
utility 0; a confident wrong answer has utility -2. Other correct answers earn 1.
Script graders use exact/JSON checks. Rubric graders use pass/fail checklist items.
Fixture judge panels identify two different labs; these are synthetic verdicts,
not claims that those labs actually judged anything. Keyword checks are deliberately
limited and can accept a semantically bad answer; they are not a production judge.

Wilson 95% intervals and overlap flags are descriptive, not significance tests:
repeated attempts are correlated. No performance claim should use fixture results.
Per-attempt total latency is synthetic; TTFT and reasoning tokens are null because
fixtures do not report them. Never infer unavailable token counts as zero.

Each output directory must be new. Files are written once, made read-only, and
hashed in a manifest alongside the source commit and task-set version. Read-only
permissions are an accidental-edit guard, not tamper-proof storage. Commit + source
hash detects a dirty-tree mismatch. Archive runs externally for durable immutability.

Hard caps are per provider and per invocation, plus `--max-usd`. All three possible
transport attempts reserve full configured context and output cost. Reservations
are not released. There are no retries for HTTP errors, refusal, format or grading.
Preflight prints the worst-case reservation before dispatch. Multiple independent
runs do not share an account-wide budget.

## Live safety gate and remaining integration

`--live` unconditionally refuses before reading keys or dispatching. The OpenAI
and Anthropic adapters are covered with synthetic transport tests only. This is
intentional: the contract of `W:\scripts\credit-keys\with-credit-keys.ps1` is not
available on this machine. A process cannot prove that an inherited key came from
that wrapper simply by inspecting its own environment. No file-based keys,
dotenv, CLI keys, configurable endpoints, proxy credentials, or error-body logging
are supported. The wrapper must provide verifiable child provenance and reject
user/machine-global or file credentials before live execution can be enabled.
Do not remove the gate merely by setting an environment flag.

Before live enablement: integrate wrapper provenance/global and file checks,
streaming TTFT and reported reasoning usage, explicit provider settings mappings,
transport retries with durable reservation checkpoints, real multi-lab rubric
judges with separate capped budgets, and owner-reviewed price/context ceilings.
No live benchmark or judge calls are enabled in this release.

Held-out prompts must live outside this public repository. The `held-out/` folder
contains only policy; there is no held-out loader yet. Future integration must
publish ids and scores only, and keep raw held-out run archives private.
