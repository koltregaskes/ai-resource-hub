# Benchmark method panel: candidate implementation

Hub issue: https://github.com/koltregaskes/rooms-os-hub/issues/1845

Inventory at main `b610994144a6b199867d1d9d89389bef4a90d436`:

- `data/pg-cache/benchmark_scores.json`: public cached row scores, sources and measured dates.
- `src/db/pg-cache.ts`: existing provenance/freshness selection; leave collector policy intact.
- `src/db/queries.ts:getScoresForBenchmark`: projects model/benchmark/source/measured fields; no method bundle or retrieval/release/revision evidence.
- `src/pages/benchmarks/[id].astro`: per-result table, source label and measured month; no row-level method disclosure.
- `src/data/benchmark-provenance.ts`: existing 365-day measurement policy; cache updates do not reset it.
- `bench/daily-use/`: private evaluation ownership stays separate; no files read or imported here.

Smallest additive candidate: native disclosure in each existing public score row, with model-specific accessible summary and visible keyboard focus. Source and measurement come only from the existing public query projection. Everything else is unknown; no method is inferred from a benchmark description or source label. Ranking and collectors are unchanged. Unknown controls mean comparison unavailable even where the legacy score ordering remains visible. Existing rankable-only filtering is unchanged, so stale rows are not newly exposed by this feature.

`benchmark-method.mjs` supplies a separate, strict aggregate admission contract and renderer. This unit does **not** wire internal exports to the website: real aggregate admission awaits privacy/rights review. Callers must reject raw objects with `admitMethod` before rendering an admitted bundle. Review references are required, but this validator cannot verify a human review happened or detect private text hidden inside an allowed string. Never feed it live private data. No holdouts, raw responses, private hashes/IDs or item-level evidence are retained. Original synthetic test examples are not actual evaluations.

Accuracy, Brier, coverage, abstention, total measured cost and cost per accepted correct result are separate fields. The latter needs positive accepted count and total cost inclusive of failures, tools and judge; no token-price fallback. Brier interpretation requires population and method context. Uncertainty text must identify status (reported/computed/not reported/not estimable), interval/level, estimand, population and assumptions before admitting a real result; missing stays unknown. No confidence interval is invented.

Comparison helper returns explicit missing/unequal controls; it computes no delta or significance. Dataset/split/version, metric/scoring definition, prompt revision, sampling protocol, effort, harness, tools, attempts/aggregation and token/context budgets must align. Equal blank or unknown placeholders do not establish alignment; numeric controls must be positive safe integers. New controls are optional metadata, so older bundles remain valid for disclosure but cannot unlock comparisons until those controls are supplied. Model identity may differ only for the intended cross-model comparison; this helper checks protocol alignment, not model attribution or result admission. Robustness must specify invariant versus task change and equivalence validation; no contamination assertion follows from a drop. This candidate does not yet implement a paired robustness or comparison UI.

Dates remain separate: measured, retrieved, model release, result revision. Fresh retrieval cannot clear stale measurement. No invented measurement or freshness values.

Validation: `node --test scripts/benchmark-method.test.mjs` tests an existing public result projection, original synthetic internal aggregate, incomparable/unknown protocol pairs, stale versus retrieval dates, unknown versus zero, rejected raw/private keys, malformed numbers, HTML escaping, safe links and semantic disclosure structure. These are semantic accessibility checks, **not** browser, screen-reader or axe evidence.

Remaining acceptance gates: independent contract/PR review; Astro build/type check; rendered responsive/keyboard/axe review; actual reviewed aggregate export and operational no-retention evidence; paired comparison UI. No new dataset or external score is copied. Latest #1845 licence notice remains link-only; no rights inferred from public readability. Publication remains with AIRH owner; this branch must not be merged or deployed as acceptance-complete.

Environment: Gaming Laptop local clone in supplied C: scratch. Required `W:/Websites/AGENTS.md` was unavailable (path absent); no npm install/build was attempted without its C:/Workspaces rules. Native Node tests need no dependency installation, port or server.
