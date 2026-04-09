# Refresh Matrix

Generated: 09 Apr 2026, 21:31 UTC

This mirrors the public updates page in a repo-readable format so contributors can see what is automated, what is mixed, and where manual review still exists.

## Summary

| Category | Cadence | Automation | Last refreshed |
| --- | --- | --- | --- |
| Regional availability | Manual review with official-source refresh | Mixed | 09 Apr 2026, 20:49 UTC |
| Models and releases | Hourly automated refresh | Mixed | 09 Apr 2026, 21:02 UTC |
| Benchmarks and evals | Hourly automated refresh | Automated | 09 Apr 2026, 21:02 UTC |
| Pricing and value | Hourly automated refresh | Automated | 09 Apr 2026, 21:02 UTC |
| News and release watch | Hourly automated refresh plus manual newsroom watch | Mixed | 09 Apr 2026, 21:02 UTC |
| Provider status | Hourly automated refresh | Automated | 09 Apr 2026, 21:02 UTC |
| Guides and learning | Manual editorial review | Manual | 09 Apr 2026, 21:29 UTC |

## Regional availability

- Cadence: Manual review with official-source refresh
- Automation: Mixed
- Last refreshed: 09 Apr 2026, 20:49 UTC
- Category route: `/availability/`
- Note: This lane is intentionally official-first and cautious. Unknown availability should stay unknown until the provider documents it.

### Source Types

- Official support-country and region-availability pages
- Product FAQs and help-center coverage for country restrictions
- Official docs and product availability notices

### Last Visible Updates

- 09 Apr 2026, 20:49 UTC: Sora app and Sora 2 - Model-specific rule for 2 tracked models on Web + App. (`/availability/`)
- 09 Apr 2026, 20:47 UTC: Claude supported locations - Provider baseline rule for 14 tracked models on Web + App. (`/availability/`)
- 09 Apr 2026, 20:41 UTC: Google AI Studio and Gemini API - Provider baseline rule for 19 tracked models on API + Web. (`/availability/`)

## Models and releases

- Cadence: Hourly automated refresh
- Automation: Mixed
- Last refreshed: 09 Apr 2026, 21:02 UTC
- Category route: `/new/`
- Note: Social posts are a trigger, not the source of truth. We should verify launches against official docs before the public data layer changes.

### Source Types

- Official provider docs, changelogs, and model pages
- OpenRouter model discovery and routed catalog deltas
- Manual social watch for launch timing, then official-source verification

### Last Visible Updates

- 07 Apr 2026, 12:00 UTC: Claude Opus 4.6 (Fast) - Anthropic release desk entry is needs research with 0 related stories and 0 benchmark signals attached. (`/new/`)
- 07 Apr 2026, 12:00 UTC: GLM 5.1 - Zhipu AI release desk entry is needs research with 0 related stories and 0 benchmark signals attached. (`/new/`)
- 07 Apr 2026, 12:00 UTC: Claude Mythos Preview - Anthropic release desk entry is ready for editor with 2 related stories and 0 benchmark signals attached. (`/new/`)

## Benchmarks and evals

- Cadence: Hourly automated refresh
- Automation: Automated
- Last refreshed: 09 Apr 2026, 21:02 UTC
- Category route: `/benchmarks/`


### Source Types

- Artificial Analysis and other benchmark owners
- LMSYS / arena-style public benchmark sources
- Research repositories and public eval feeds where intended for reuse

### Last Visible Updates

- 09 Apr 2026, 21:02 UTC: Arena and headline eval track refresh - Updated the frontier conversation benchmark used in the ranking layer. (`/benchmarks/`)
- 09 Apr 2026, 21:02 UTC: Quality score recompute - Rebuilt the weighted scoring layer used across the hub. (`/leaderboard/`)

## Pricing and value

- Cadence: Hourly automated refresh
- Automation: Automated
- Last refreshed: 09 Apr 2026, 21:02 UTC
- Category route: `/compare/llm/`


### Source Types

- Official provider pricing pages
- Provider APIs and model catalogs where pricing is exposed
- OpenRouter price index for discovery and cross-checking

### Last Visible Updates

- 09 Apr 2026, 21:02 UTC: Official provider pricing cross-check - Validated tracked price rows against official pricing pages. (`/compare/llm/`)
- 09 Apr 2026, 21:01 UTC: OpenRouter pricing refresh - Pulled live routed endpoint pricing and model discovery data. (`/compare/llm/`)
- 09 Apr 2026, 21:02 UTC: Pricing validator pass - Ran the secondary sanity-check layer over live pricing snapshots. (`/pricing-trends/`)

## News and release watch

- Cadence: Hourly automated refresh plus manual newsroom watch
- Automation: Mixed
- Last refreshed: 09 Apr 2026, 21:02 UTC
- Category route: `/news/`
- Note: X / Twitter should stay manual-review only or official API only. It can tell us when to look, but it should not be an unauthorised automated source.

### Source Types

- Official blogs, newsroom pages, and public AI-focused feeds
- Shared website news pipeline routing rules
- Manual social monitoring where terms permit or official API access exists

### Last Visible Updates

- 09 Apr 2026, 20:11 UTC: Florida AG announces investigation into OpenAI over shooting that allegedly involved ChatGPT - TechCrunch (industry) ([source](https://techcrunch.com/2026/04/09/florida-ag-investigation-openai-chatgpt-shooting/))
- 09 Apr 2026, 19:33 UTC: After data breach, $10B-valued startup Mercor is having a month - TechCrunch (industry) ([source](https://techcrunch.com/2026/04/09/after-data-breach-10b-valued-startup-mercor-is-having-a-month/))
- 09 Apr 2026, 19:10 UTC: Meta AI app climbs to No. 5 on the App Store after Muse Spark launch - TechCrunch (industry) ([source](https://techcrunch.com/2026/04/09/meta-ai-app-climbs-to-no-5-on-the-app-store-after-muse-spark-launch/))

## Provider status

- Cadence: Hourly automated refresh
- Automation: Automated
- Last refreshed: 09 Apr 2026, 21:02 UTC
- Category route: `/status/`


### Source Types

- Official status page APIs, RSS feeds, and incident pages
- Provider-specific status pages linked from the hub

### Last Visible Updates

- 09 Apr 2026, 21:02 UTC: Anthropic - All Systems Operational ([source](https://status.claude.com))
- 09 Apr 2026, 21:02 UTC: Cohere - All systems operational ([source](https://status.cohere.io))
- 09 Apr 2026, 21:02 UTC: DeepSeek - All Systems Operational ([source](https://status.deepseek.com))

## Guides and learning

- Cadence: Manual editorial review
- Automation: Manual
- Last refreshed: 09 Apr 2026, 21:29 UTC
- Category route: `/guides/`
- Note: This is the least automated part of the site today, so users should expect an editorial review rhythm rather than a live ticker.

### Source Types

- Internal guide pages and academy content
- Official provider docs used during refreshes
- Release-desk drafts queued for editor review

### Last Visible Updates

- 09 Apr 2026, 21:29 UTC: Understanding Ai Pricing - Guide or learning page updated in the repository. (`/guides/understanding-ai-pricing/`)
- 09 Apr 2026, 21:29 UTC: Prompting Basics - Guide or learning page updated in the repository. (`/guides/prompting-basics/`)
- 09 Apr 2026, 21:29 UTC: Guides - Guide or learning page updated in the repository. (`/guides/`)
