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

## Aggregate validation continuation, 16 November 2026

Counts must be safe integers; attempts and context/token limits must be positive when known. Zero sample size and zero accepted results remain valid observations, with cost per accepted result unknown when the denominator is zero. Missing metadata can remain null.

Evidence dates require a real ISO calendar day (`YYYY-MM-DD`) or an ISO timestamp with seconds and an explicit timezone. Invalid calendar days, locale dates, timezone-free timestamps and rolling `24:00` timestamps are rejected at admission. Invalid legacy measurement dates render unknown age. The existing 365-day age and one-day future tolerance remain unchanged; collection and rankability policy are outside this change.

Cost rendering independently checks finite nonnegative numeric totals, exact positive accepted counts and any supplied sample denominator. Invalid ratios and arithmetic underflow render unknown. Tiny positive costs use scientific notation rather than rounding to `0.0000`; a measured zero remains zero. This arithmetic check does not verify cost completeness, human review, rights or real aggregate admission.

Continuation validation: 21 method/weight Node tests pass, including malformed and boundary fixtures. Build, rendered accessibility, CI and independent review have not been verified for these continuation changes. Existing real-export and full-contract acceptance gates remain open.

Validation: `node --test scripts/benchmark-method.test.mjs` tests an existing public result projection, original synthetic internal aggregate, incomparable/unknown protocol pairs, stale versus retrieval dates, unknown versus zero, rejected raw/private keys, malformed numbers, HTML escaping, safe links and semantic disclosure structure. These are semantic accessibility checks, **not** browser, screen-reader or axe evidence.

Remaining acceptance gates: independent contract/PR review; Astro build/type check; rendered responsive/keyboard/axe review; actual reviewed aggregate export and operational no-retention evidence; paired comparison UI. No new dataset or external score is copied. Latest #1845 licence notice remains link-only; no rights inferred from public readability. Publication remains with AIRH owner; this branch must not be merged or deployed as acceptance-complete.

Environment: Gaming Laptop local clone in supplied C: scratch. Required `W:/Websites/AGENTS.md` was unavailable (path absent); no npm install/build was attempted without its C:/Workspaces rules. Native Node tests need no dependency installation, port or server.

## Editable preference weights and sensitivity

The benchmark explorer adds an original, Priors-inspired local preference checker. Reference: Adam Holter's public [Priors tools documentation](https://www.mypriors.com/cli), retrieved 16 November 2026. It motivates editable mixes, measured-coverage disclosure and efficiency context; no Priors implementation, dataset, estimates or scores are imported.

Input remains `getBenchmarkMatrix()` from the existing public verified/freshness selector. The checker does not admit exports, change scores or freshness, or assert aligned protocols. The real matrix is sparse; no default complete ranking is promised. Category weights are whole numbers from 0 to 100, start equal and can be set to zero. Users can explicitly narrow benchmark scope, which changes the construct. Models absent from the admitted matrix remain unassessed.

Calculation: each fixed declared scale maps linearly to 0–100, reversing lower-is-better. Benchmarks share their category weight equally; positive category weights normalise to one. Invalid/out-of-scale/unknown values stay missing. Only complete selected coverage gets a preference score or rank; partial coverage is shown as measured/required plus weighted coverage and named missing benchmarks. No unknown measurement is zero-filled, reweighted away or ranked. A genuine measured zero is retained. This numerical scale mapping is an exploratory utility assumption, not psychometric equivalence or methodological comparability. Benchmark source pages retain their individual evidence and unknown controls.

Sensitivity: baseline plus one-at-a-time relative ±25% changes to each active category by default, adjustable from 0–50%. Renormalise each scenario; excluded categories stay excluded. Show minimum/maximum competition rank only over this finite set and unchanged eligible cohort. It is not simultaneous optimisation, a confidence interval or a claim of global extremes. Equal scores share ranks. No rank is emitted if scope/weights are empty or coverage is incomplete.

Efficiency: the matrix contains no measured time-per-accepted-task or full cost-per-accepted-correct-result bundle, so these remain explicitly unknown. Never infer them from token price or token throughput. Caveats require matched tasks/configuration and reasoning, retries, tools, failures, judge costs and review time. Source licence and private-output gates remain unchanged.

Implementation: `src/data/benchmark-weights.mjs`, `src/components/BenchmarkWeights.tsx` and its CSS; existing benchmark explorer route. Dependency-free numerical regressions are part of existing Validate CI. Page edits are ephemeral: no persistence, tracking, new endpoint or refresh job. Reset restores equal weights, all benchmarks and 25% perturbation.

## Invariant robustness pairs

`robustnessComparison` admits a descriptive accuracy delta only for known aligned protocols, the same served model and route, equal positive sample counts, valid accuracies, explicit `invariant` classification and a non-placeholder equivalence-validation reference. Task changes and unknown validation block the delta with reasons. Review text is a reference, not proof of a review; matched counts do not prove item pairing. Callers remain responsible for reviewed aggregate admission and documented pairing. Delta is perturbed minus original accuracy, not significance or contamination evidence. No real bundle or private items are imported.

A separate non-placeholder `pairing` validation reference is also required; equal sample counts alone never unlock the delta. It must document one-to-one pairing and exclusions without exposing item IDs.
