# AI Milestones Research Handoff

## Current state

AI Milestones is now wired into the live site in the authoritative repo at `W:\Websites\sites\ai-resource-hub`.

The milestone system currently includes:

- a structured seed at [src/data/ai-milestones-seed.ts](W:\Websites\sites\ai-resource-hub\src\data\ai-milestones-seed.ts)
- a source registry at [src/data/ai-milestone-source-registry.ts](W:\Websites\sites\ai-resource-hub\src\data\ai-milestone-source-registry.ts)
- a canonical site data layer at [src/data/ai-milestones.ts](W:\Websites\sites\ai-resource-hub\src\data\ai-milestones.ts)
- a validator at [scripts/validate-ai-milestones.ts](W:\Websites\sites\ai-resource-hub\scripts\validate-ai-milestones.ts)
- a SQLite sync script at [scripts/sync-ai-milestones.ts](W:\Websites\sites\ai-resource-hub\scripts\sync-ai-milestones.ts)
- a public JSON export at [public/data/ai-milestones.json](W:\Websites\sites\ai-resource-hub\public\data\ai-milestones.json)
- a public page at [src/pages/milestones/index.astro](W:\Websites\sites\ai-resource-hub\src\pages\milestones\index.astro)
- a repo-readable mirror at [docs/repo-reference/ai-milestones.md](W:\Websites\sites\ai-resource-hub\docs\repo-reference\ai-milestones.md)

The old `This Day in AI` route is now a legacy redirect to `/milestones/`.

## Database state

After running the validator and sync on `2026-04-10`, the staging layer contains:

- `37` milestones
- `39` milestone source rows
- `15` source-registry entries
- `35` `verified`
- `2` `tracking`
- `0` `needs_review`
- `27` exact-day anniversary-capable entries

Current `tracking` items:

- `deepseek-founded`
- `moonshot-founded`

## Precision rules

- Keep canonical precision honest.
- Only use day precision when the source supports it.
- Keep estimated anchors in `trackingDate`, never as canonical public dates.
- If only month or year is defensible, keep the public date broad.
- Prefer official launch, company, model-card, research, registry, and changelog sources.
- Do not use X/Twitter as a canonical source.

## Current scope

The seed is intentionally biased toward:

- flagship model launches
- major lab founding dates
- major open-weight launches
- a compact backfill of pre-ChatGPT breakthroughs
- high-signal institutional milestones

## Remaining gaps

The strongest remaining chronology gaps are:

- `deepseek-founded`
- `moonshot-founded`

Both remain public `tracking` entries with honest precision and explicit estimate notes until stronger official chronology evidence is found.

## Suggested next tasks

1. Strengthen DeepSeek founding chronology with an official company or registry source if one becomes accessible.
2. Strengthen Moonshot AI founding chronology with an official company or registry source if one becomes accessible.
3. Expand milestone coverage into deeper historical backfill once the first curated layer feels stable.
4. Feed milestones into the broader calendar/events system when that product pass is ready.

## Useful commands

```powershell
npx.cmd tsx scripts/validate-ai-milestones.ts
npx.cmd tsx scripts/sync-ai-milestones.ts
npm.cmd run generate:milestones
npm.cmd run generate:repo-reference
```

## Working assumption

For now, the milestone seed is the canonical source for the live feature, with SQLite kept as a synced staging layer for later database-driven work.
