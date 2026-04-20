# AI Resource Hub Degradation Tracking Framework

Reviewed: 20 Apr 2026

## Why This Needs To Exist

Model degradation is not just a weights problem.

User-visible quality can get worse because of:

- silent model refreshes or alias swaps
- routing changes between inference pools
- runtime and compiler bugs
- latency or timeout drift
- context-window failure at long ranges
- tool-use or harness regressions
- retrieval or prompt-state decay
- regional, endpoint, or account-tier differences
- safety-policy changes that alter output behaviour

That means the hub should track degradation across the whole delivery stack, not just benchmark tables.

## What The Hub Already Covers

The current site already has useful pieces of the picture:

- `/status/` tracks official provider incidents and current platform health
- `/speed/` tracks TTFT, output speed, and endpoint differences
- `/availability/` tracks region and surface restrictions
- `/context-window/` tracks advertised context capacity
- `/leaderboard/` already penalises stale evidence, old provider generations, and weak benchmark support
- `/updates/` and `/changelog/` surface freshness and pipeline activity
- `/models/[id]/` already exposes benchmarks, speed, pricing, availability, and endpoints together

This means the hub is not starting from zero. The missing layer is a first-class regression view tying those signals together over time.

## The Degradation Layers To Track

### 1. Snapshot Drift

Track when a provider changes what a named model actually points to.

Examples:

- a model alias quietly moves to a new snapshot
- a provider deploys a refreshed checkpoint without a new public SKU
- chat and API behaviour split even though the public label stays the same

Why it matters:

- benchmark history can suddenly stop matching live user experience
- user complaints may be real even if the model name did not change

### 2. Routing And Inference Drift

Track where requests are actually served and whether that changes output quality.

Examples:

- short-context traffic routed onto long-context servers
- different hardware backends producing different behaviour
- sticky routing making one user feel the issue more than another

Why it matters:

- Anthropic's Sep 17, 2025 postmortem shows response quality can degrade because of routing and runtime bugs rather than deliberate model downgrades

## 3. Runtime Quality Regressions

Track bugs in sampling, decoding, token selection, compiler layers, and infrastructure.

Examples:

- token corruption
- syntax instability in code output
- weird language switches
- decoding bugs that only appear on one platform

Why it matters:

- this is model quality degradation from the user's point of view even when the weights are unchanged

## 4. Benchmark Regression Over Time

Track whether a model or agent stack scores worse on the same evaluation set over time.

Examples:

- lower SWE-bench pass rate versus baseline
- lower long-context retrieval score
- worse tool-use task completion

Why it matters:

- MarginLab's trackers are a strong model for this: fixed or controlled suites, repeated runs, and statistical thresholds rather than vibes

## 5. Speed And Latency Degradation

Track operational slowdown separately from raw output quality.

Examples:

- TTFT gets worse
- output tokens per second falls
- tool calls take longer
- timeout rate rises

Why it matters:

- a model that is equally smart but materially slower is worse for real use
- long-context and agent workflows are especially sensitive to this

## 6. Context-Use Degradation

Track whether models can still use long inputs well, not just accept them.

Examples:

- needle-in-a-haystack recall gets worse
- middle-context recall drops
- large prompts cause instruction drift
- long chat sessions accumulate stale assumptions and context rot

Why it matters:

- advertised context size is not the same thing as reliable context use

## 7. Tool, Harness, And Scaffold Degradation

Track whether the surrounding product layer gets worse even when the underlying model is unchanged.

Examples:

- agent harness changes swing benchmark results
- tool output formatting wastes context
- orchestration changes increase cost or failure rate
- fallback model selection becomes more aggressive

Why it matters:

- this is very often what users mean when they say "the model got worse"
- Theo-style complaints and MarginLab-style measurements both point at this layer as a real source of regression

## 8. Retrieval And Memory Degradation

Track whether system architecture around the model is feeding it worse context.

Examples:

- worse retrieval relevance
- bad reranking
- stale caches
- over-compressed summaries
- memory systems surfacing old or wrong facts

Why it matters:

- user-visible quality can collapse even if the model itself did not regress

## 9. Availability And Tier Degradation

Track where a model becomes worse depending on region, plan, or endpoint.

Examples:

- web app better than API
- Bedrock better than first-party
- enterprise tier better than consumer tier
- one region has worse latency or more incidents

Why it matters:

- users do not all experience the same model in practice

## 10. Safety And Policy Drift

Track when changes in refusals, filtering, or policy enforcement materially alter usefulness.

Examples:

- more refusals on previously allowed tasks
- higher false-positive safety triggers
- stronger formatting restrictions

Why it matters:

- a model can become less useful without becoming less capable in the abstract

## What We Should Add To The Hub

## Minimum Public Surface

The cleanest public structure is:

- keep `/status/` for provider incidents and live health
- keep `/speed/` for latency and throughput
- keep `/availability/` for region and endpoint reach
- keep `/context-window/` for advertised capacity
- add degradation callouts to `/models/[id]/`
- add a future `/degradation/` route as the top-level synthesis page

`/degradation/` should answer one question:

"What has actually gotten worse lately, where, and with what level of confidence?"

## Minimum Data Fields

Every degradation event or observation should try to capture:

- observed_at
- provider
- model_name
- public_model_label
- snapshot_or_version if known
- endpoint or platform
- region
- account_tier
- context_band
- metric_type
- baseline_value
- current_value
- delta_percent
- evidence_level
- source_type
- source_url
- notes

## Minimum Metric Families

The first tracked families should be:

- provider/runtime incidents
- TTFT and throughput drift
- benchmark deltas over time
- context-use regression
- tool-use and harness regression
- availability or endpoint drift

## Evidence Rules

The hub should be strict here.

We should not label something a regression just because one person on X says so.

Use these labels:

- `anecdotal` for community reports without corroboration
- `observed` for a repeated measurable delta in our own tracking
- `provider-confirmed` for official postmortems, status incidents, or release notes
- `mixed` when user reports and measured signals disagree

## What Else To Include

These are the extra fields most people miss:

- harness version
- tool stack version
- endpoint path
- account tier
- region
- context length band
- temperature / major decoding settings when relevant
- fallback behaviour
- whether the result came from API, chat app, Bedrock, Vertex, or another reseller

Without those, "the model got worse" becomes too fuzzy to trust.

## Recommended Build Order

### V1

- write the methodology and collection rules clearly
- add degradation callouts to model pages
- show simple speed deltas on `/speed/`
- treat official incidents and verified regressions as separate badges

### V2

- persist benchmark history instead of only current scores
- persist provider status history instead of only current snapshot
- add per-model regression summaries
- add a public `/degradation/` index page

### V3

- add statistically tested regression alerts
- split by endpoint, tier, region, and context band
- add "confirmed by provider" versus "community-only" filtering

## External References Worth Following

- Anthropic, "A postmortem of three recent issues" (published 17 Sep 2025) for infrastructure-caused response degradation
- MarginLab degradation trackers for statistical regression detection, baseline framing, and resource-metric tracking

## Bottom Line

If the hub wants to track degradation honestly, it should treat degradation as a stack problem:

- model
- snapshot
- routing
- runtime
- endpoint
- harness
- retrieval
- context
- policy

That is the level where user experience actually breaks.
