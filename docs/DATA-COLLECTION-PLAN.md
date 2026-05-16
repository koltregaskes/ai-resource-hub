# AI Resource Hub Data Collection Plan

Reviewed: 20 Apr 2026

## Purpose

This document is the working plan for what the hub collects, how often it refreshes, and how we avoid making false freshness or regression claims.

The site is reference-first. That means the collection plan matters as much as the frontend.

## Core Rules

- Official sources first
- Independent third-party benchmarks where useful
- No fake precision
- No silent inference from missing data
- Preserve history where trend claims matter
- Mark anecdotal reports as anecdotal
- Mark provider-confirmed incidents as provider-confirmed

## Collection Lanes

## 1. Model Registry

What we collect:

- model names
- providers
- endpoints
- pricing
- context windows
- max output
- status labels

Primary sources:

- official provider docs
- official API/model catalogues
- OpenRouter where it helps discovery, with cross-checking

## 2. Benchmarks

What we collect:

- current published scores
- benchmark metadata
- benchmark category
- methodology notes
- limitations

Primary sources:

- official model reports
- benchmark maintainers
- reliable third-party benchmark publishers

Important rule:

- if we want to make degradation claims, benchmark scores must be versioned or snapshotted over time rather than overwritten in place

## 3. Speed And Runtime

What we collect:

- TTFT
- output tokens per second
- endpoint-level differences
- scrape timestamps

Primary sources:

- internal tracked speed scrapes
- reliable external benchmark/reference sources where cited

Important rule:

- speed is already a historical lane and should remain historical

## 4. Provider Status

What we collect:

- official incident status
- affected components
- incident titles
- current health state
- last checked time

Primary sources:

- official status pages and official incident feeds

Important rule:

- current status alone is not enough for degradation tracking; we should persist status history if we want long-range incident or uptime analysis

## 5. Availability

What we collect:

- region restrictions
- app versus web versus API availability
- provider-wide rules
- model-specific rules

Primary sources:

- official availability pages
- product FAQs
- official launch notes

## 6. Pricing

What we collect:

- current input pricing
- current output pricing
- relevant cache or request pricing where surfaced
- history where available

Primary sources:

- official pricing pages
- cross-check sources used carefully

## 7. News And Releases

What we collect:

- official launches
- benchmark updates
- provider engineering posts
- ecosystem changes that affect model quality, tooling, or availability

Primary sources:

- official blogs
- official newsrooms
- curated feed pipeline

## 8. Degradation And Regression

What we collect:

- provider-confirmed incidents that changed output quality
- measurable speed regressions
- benchmark deltas over time
- context-use regressions
- tool-use or harness regressions
- regional or endpoint drift
- anecdotal user reports when notable, clearly labelled

Primary sources:

- official postmortems
- official status feeds
- our own preserved history
- independent trackers such as MarginLab
- community reports only when labelled as anecdotal or mixed

## 9. Educational And Creator Sources

What we collect:

- topic-level summaries
- workflow ideas worth testing
- quoted claims only when short and source-linked
- source links, creator, publish date, and topic tags

Primary sources:

- creator videos with reliable transcripts or readable summaries
- creator blogs and newsletters
- official talks and engineering explainers

Current candidate creator lane:

- Theo Browne / Theo - t3.gg

Why he is worth tracking:

- recurring commentary on coding-agent regressions
- useful harness and workflow thinking
- practical MCP and tool-design criticism
- strong coverage of how product scaffolding changes the real user experience

Important rule:

- do not mirror or republish full creator transcripts into the hub
- use creator material as sourced summaries, concept notes, or reading lists
- where possible, prefer linking to the original YouTube page and a transcript helper page instead of copying long passages

## 10. Reliability Floor

What we collect:

- factuality, groundedness, retrieval, instruction-following, and memory or abstention scores
- raw score and normalized score where comparable
- benchmark/source name and source URL
- model, provider, and release status
- prompt style, system prompt, zero-shot or few-shot setup, tool access, temperature or reasoning effort where known
- judge type, repeats, evaluation framework, measured date, published date, and ingested date where known

Primary sources:

- SimpleQA
- FACTS Grounding
- IFEval
- RULER
- HELMET
- CRAG
- LongMemEval
- LiveBench category-level results
- HELM scenario-level results

Important rules:

- do not use general quality scores as fallback reliability evidence
- do not map aggregate benchmark rows into a specific Reliability Floor dimension unless the source exposes the relevant category or scenario
- keep missing dimensions visible as `No comparable evidence yet`
- treat each result as `model + prompt + harness + judge`, not the model alone
- only label a model `Reliable for general use` when all critical dimensions are present and each critical dimension is at least 85

## Evidence Labels

Every degradation-related note should use one of these:

- `provider-confirmed`
- `observed`
- `anecdotal`
- `mixed`

These labels should appear in docs, data, and future public UI.

## Freshness Expectations

These are the intended operating cadences, not marketing promises:

- provider status: hourly where automation works
- news: hourly
- pricing: hourly or daily depending on source
- speed: on the existing speed refresh cadence
- benchmark scores: when new data is published
- availability: when providers publish new support information
- degradation summaries: whenever new evidence materially changes the picture

## Preservation Rules

The hub should preserve history for any lane where "better or worse over time" matters.

That means:

- speed should stay historical
- benchmark scores should become historical
- provider status should become historical
- model alias or snapshot changes should be logged when known

## Do Not Claim

Do not claim:

- that a model regressed if the only evidence is one viral post
- that two endpoints are equivalent when they are not verified equivalent
- that a benchmark delta is meaningful without sample size or context
- that a provider intentionally downgraded quality unless that is explicitly confirmed

## Degradation-Specific Checklist

Before adding a degradation claim, try to capture:

- model label
- provider
- version or snapshot if known
- endpoint
- region
- tier
- context length band
- metric family
- baseline
- new value
- date observed
- evidence label
- source URL

If the claim came from a creator source, also capture:

- creator name
- video or post title
- publish date
- whether the point is opinion, anecdote, or externally corroborated

## Current Gaps

As of 20 Apr 2026, the main gaps are:

- no first-class public degradation route
- no persisted benchmark history
- no persisted provider status history
- no unified regression event model joining model, endpoint, metric, and evidence

## Priority Next Build Steps

1. Preserve benchmark history instead of overwriting only the latest value.
2. Preserve provider status snapshots over time.
3. Add simple deltas to speed views and model pages.
4. Add a future public degradation summary page once the data model is real.
5. Build a small educational-source intake lane for trusted creator material, starting with Theo, using summaries and source cards rather than transcript dumps.
