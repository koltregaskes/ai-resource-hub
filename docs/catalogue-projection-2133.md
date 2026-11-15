# Catalogue projection candidate (15 November 2026)

A stale positive `cached_input_price` survived `applyModelFieldEvidence` even
when the catalogue published a different cache-hit price, or none at all.
The candidate projects that field from existing canonical evidence and marks
missing cache-hit pricing unknown. It adds no vendor facts or generated data.

## Reproduce offline

Node 22.15+ (verified here with Node 26.13.1):

```
node --import ./scripts/lib/register-native-typescript.mjs --test scripts/cached-price-projection.test.ts scripts/official-week.test.ts scripts/registry-guards.test.ts scripts/source-policy.test.ts
```

27 passed. Before the fix the new regression failed: GPT-5.4 retained the
injected 9876 cache-hit price instead of null. Native type stripping is an
offline test aid, not a substitute for TypeScript checking or an Astro build.

## Assigned sequence and remaining gates

- PR130 head bc24a1180631cea8e40ad6635fd6a65b355ae598 has an existing substantive
  independent changes-required review. Its original owner's unpushed
  575248b8 Qwen repair and 15 tests are absent here and have not been recreated.
- Read-only three-way comparison against main
  cf0029baf3273ae0d10862e763e20653b2cc158d still identifies seven conflicts:
  raw models cache, comparison CSV/JSON, availability JSON, release desk
  JSON/TypeScript, and models-latest JSON. Six model rows differ from the common
  ancestor; main also changed Fable, DeepSeek, Carbon and Hydrogen. The new
  Mythos and Qwen rows must be preserved alongside those current-main changes.
  No side's generated snapshots can safely replace the other wholesale.
  Original owner integration precedes regeneration. The combined thinking plus
  output budget must remain distinct from an unknown standalone output limit.
- PR142 head 9b3976a71fcb88aa99ce7653b2b6eaa6ce36a834: 25 existing registry and
  source-policy tests passed using in-memory exact-head git source loading.
  Source-policy tests read the bound workspace's public cache fixtures. The
  existing independent review is retained; no new factual approval is issued.
- PR129 head 7253c5af1e90147d6e9de8d1c3f594b252ad763c: five existing non-rendered
  field/lifecycle tests passed through the same exact-head source loader.
  Runtime selectors used the bound workspace's checked-in cache fixtures.
  Snapshot, licence, provenance and access qualifications remain separate.
- Public source retrieval remains on the prior 429 hold. No vendor claims were
  newly verified. No DB, environment or credential files were read. No output
  generators ran. Dependencies and dist are absent, so full TypeScript-backed
  model-field suites, Astro build, rendered pages and export reproducibility
  remain unfulfilled. No installation was attempted.

This candidate targets PR130's branch to keep its diff confined to the repair.
It does not clear PR130's findings or the source/build gates on any assigned PR.
An independent successor must review the candidate before owner integration.
