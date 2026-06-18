# AI Resource Hub — candidate queue from KOL-4013 link backlog

Curation of the 171 fetched links from the Todoist PROJECTS2 research backlog
(KOL-4013). Goal: separate benchmarks / model releases / tools from creative
examples, archive stale links, and promote useful primary sources.

Source data: `W:\hub\Runtime\LOCAL-ONLY\todoist-intake\projects2-remaining-triage-current.json`
Classifier + full machine-readable queue:
`W:\hub\Runtime\LOCAL-ONLY\todoist-intake\classify-airh.mjs` ->
`airh-candidate-queue.json`.

## Breakdown (171 links)

| Category | Count | Disposition |
| --- | --- | --- |
| social (X / YouTube reshares) | 80 | Review individually; not primary AIRH sources |
| model-release | 35 | Mostly X reshares; only 2 primary, both low-value |
| stale / dead (fetch failed or 4xx) | 15 | Archive |
| creative examples | 14 | Separate — not benchmark/model/tool content |
| other | 11 | Review |
| benchmark | 9 | 4 are real primary sources (promoted below) |
| tool | 6 | All X/Grok shares; 0 primary sources |
| research-paper | 1 | OpenAI GPT-5 coding cheatsheet (guide, not benchmark) |

The signal is small: the backlog is overwhelmingly social reshares, creative
examples, and dead links. Only four links are genuinely useful new primary
sources for the hub.

## PROMOTED (added to `src/data/benchmark-resources.ts`)

1. **Vectara Hallucination Leaderboard (HHEM)** — document-grounded hallucination
   rate. Category: Factuality and hallucination.
2. **ML.ENERGY Leaderboard** — energy/efficiency of serving open LLMs.
   Category: Energy and efficiency (new).
3. **MisguidedAttention** — adversarial reasoning under misleading prompts.
   Category: Reasoning under misleading prompts (new).
4. **Epoch AI** — compute/data/cost trend data; cited primary source.
   Category: Trends and forecasting (new).

None were already present in `benchmark-resources.ts` (origin/main checked).

## SEPARATED — creative examples (14)

Image/design/aesthetic links (Midjourney, Leonardo, design posts). These are
creative-example material, not model/benchmark/tool sources. Listed under
`creative` in `airh-candidate-queue.json`. Route to the creative/demos surfaces,
not the model/benchmark data.

## ARCHIVE — stale/dead (15)

Links whose fetch failed or returned 4xx. Listed under `stale-dead` in
`airh-candidate-queue.json`. Drop from active research; keep the JSON as the
archived record.

## NOT PROMOTED — social (80) + low-value model-release (33)

Mostly X posts and YouTube videos commenting on models rather than primary
release/benchmark pages. Auth-gated X/Grok-share items remain blocked (the
KOL-4013 blocker note). These stay in the queue JSON for optional manual review
but are not hub source material.
