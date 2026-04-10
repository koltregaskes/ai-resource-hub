# AI Milestones Research Handoff

## What this pass does

This pass focuses on **data gathering** in the authoritative repo at `W:\Websites\sites\ai-resource-hub`.

It does **not** pretend the full `AI Milestones` product has already been wired through the site. Instead, it leaves the repo with:

- a structured milestone seed at [src/data/ai-milestones-seed.ts](W:\Websites\sites\ai-resource-hub\src\data\ai-milestones-seed.ts)
- a scrape-source registry at [src/data/ai-milestone-source-registry.ts](W:\Websites\sites\ai-resource-hub\src\data\ai-milestone-source-registry.ts)
- a validator at [validate-ai-milestones.ts](W:\Websites\sites\ai-resource-hub\scripts\validate-ai-milestones.ts)
- a SQLite sync script at [sync-ai-milestones.ts](W:\Websites\sites\ai-resource-hub\scripts\sync-ai-milestones.ts)

The sync script loads the research into the repo’s local SQLite database:

- [the-ai-resource-hub.db](W:\Websites\sites\ai-resource-hub\data\the-ai-resource-hub.db)

It creates or updates these staging tables:

- `ai_milestones`
- `ai_milestone_sources`
- `ai_milestone_source_registry`

## Current database state

After running the validator and sync on `2026-04-09`, the staging layer contains:

- `37` milestones
- `39` milestone source rows
- `14` source-registry entries
- `34` `verified`
- `3` `tracking`
- `0` `needs_review`
- `27` exact-day anniversary-capable entries

Current `tracking` items:

- `anthropic-founded`
- `deepseek-founded`
- `moonshot-founded`

## Current scope

The seed set is intentionally biased toward:

- the ChatGPT era from late 2022 onward
- flagship model launches
- major open-weight releases
- major lab founding dates
- a compact backfill of pre-ChatGPT breakthroughs

Weak-founding cases are kept conservative:

- public precision stays at `year` or `month` where needed
- estimated operational anchors only live in `trackingDate`
- `tracking` status is used where stronger official confirmation is still needed

## Key rules carried into the next session

- `W:\Websites\sites\ai-resource-hub` is the source of truth for this work
- do not treat `C:\Workspaces` as the master copy
- preserve date precision honestly
- exact-day anniversaries only come from trustworthy day-level evidence
- when only month or year is defensible, keep the canonical fields broad
- if an estimated internal anchor is useful, store it in `trackingDate`
- do not present `trackingDate` as if it were a public canonical date
- official-first sourcing
- no X or Twitter scraping as canonical evidence

## Suggested next tasks

1. Wire this seed into the proper `AI Milestones` feature implementation.
2. Add export generation for repo-reference and public JSON once the canonical data layer is agreed.
3. Improve the remaining weaker founding entries, especially:
   - Anthropic exact founding support
   - DeepSeek founding chronology
   - Moonshot AI founding chronology
4. Decide whether the site should surface `tracking` items publicly or keep them internal until reviewed.

## Useful commands

```powershell
npx.cmd tsx scripts/validate-ai-milestones.ts
npx.cmd tsx scripts/sync-ai-milestones.ts
```

## Copy-paste prompt for the next session

```md
You are working in:
W:\Websites\sites\ai-resource-hub

Continue the AI Milestones data work from the authoritative W: repo.

Important context:
- This repo still has the lightweight `This Day in AI` implementation.
- The current pass added a structured research seed and loaded it into the local SQLite database instead of pretending the full product integration already exists.
- The local database is:
  - W:\Websites\sites\ai-resource-hub\data\the-ai-resource-hub.db
- The staging tables are:
  - ai_milestones
  - ai_milestone_sources
  - ai_milestone_source_registry

Primary files:
- W:\Websites\sites\ai-resource-hub\src\data\ai-milestones-seed.ts
- W:\Websites\sites\ai-resource-hub\src\data\ai-milestone-source-registry.ts
- W:\Websites\sites\ai-resource-hub\scripts\validate-ai-milestones.ts
- W:\Websites\sites\ai-resource-hub\scripts\sync-ai-milestones.ts
- W:\Websites\sites\ai-resource-hub\docs\ai-milestones-research-handoff.md

Rules:
- Keep canonical precision honest.
- Only use day precision when the source supports it.
- Keep estimated anchors in `trackingDate`, never as canonical public dates.
- Prefer official launch, company, model-card, research, registry, and changelog sources.
- Do not use X/Twitter as a canonical source.
- Keep W: as the authoritative working path.

Next priorities:
1. Strengthen weak founding-date evidence for Anthropic, DeepSeek, and Moonshot AI.
2. Decide whether to wire the new seed into a canonical data layer or keep it as staging data until the manager is ready.
3. If implementation starts, reuse this seed instead of re-curating milestones from scratch.

Before finishing:
1. Run `npx.cmd tsx scripts/validate-ai-milestones.ts`
2. Run `npx.cmd tsx scripts/sync-ai-milestones.ts`
3. Report exactly what changed, which entries remain `tracking`, and which dates still rely on estimates.
```
