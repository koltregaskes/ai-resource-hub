# PASTE THIS ENTIRE FILE INTO A NEW CLAUDE CODE SESSION

---

## SESSION HANDOFF — The AI Resource Hub

You are continuing development of **The AI Resource Hub** (theairesourcehub.com).
Read this document fully before doing anything. Then pick up where the last session left off.

**Repo:** `koltregaskes/ai-resource-hub`
**Branch:** `claude/init-ai-resource-hub-7KhbS` (push all work here)
**Stack:** Astro 5 + TailwindCSS 4 + SQLite (better-sqlite3) + TypeScript
**Build:** `npm run build` (355 pages, ~15s)
**DB:** `data/the-ai-resource-hub.db` — seeded by `npx tsx scripts/seed-db.ts` (destructive, recreates from scratch)
**Dev server:** `npm run dev` → localhost:4321

---

## WHAT EXISTS NOW

### Pages (82 .astro files → 355 built pages)
- `/compare/llm/` — main interactive LLM comparison table (React component `src/components/LLMComparisonTable.tsx`)
- `/compare/image/`, `/video/`, `/voice/`, `/sound/` — category comparisons
- `/compare/head-to-head/` — side-by-side model comparison
- `/compare/providers/` — provider comparison
- `/models/[id]/` — 158 model detail pages
- `/labs/[id]/` — 39 provider detail pages
- `/benchmarks/[id]/` — 34 benchmark detail pages
- `/cli/` + `/cli/[id]/` — CLI tools comparison (13 tools)
- `/coding/`, `/fastest/`, `/cheapest/`, `/best-value/`, `/reasoning/`, `/multimodal/` — specialized leaderboards
- `/speed/`, `/context-window/` — speed and context comparisons
- `/leaderboard/` — overall quality leaderboard
- `/pricing-trends/` — price history charts
- `/scheduling/` — data pipeline documentation
- `/methodology/`, `/references/` — transparency pages
- `/news/`, `/blog/` (9 articles), `/glossary/`, `/people/`, `/youtube/`, `/twitter/`
- `/academy/` (4 lessons), `/guides/` (6 guides), `/prompts/`
- `/calculator/`, `/token-counter/`, `/quiz/`
- `/rumours/` — rumoured/stealth model tracker
- `/agents/`, `/open-source/`, `/healthcare/`, `/legal/`, `/finance/`, `/creative-writing/`
- `/stats/`, `/timeline/`, `/tags/`, `/use-cases/`, `/tools/`, `/api-guides/`

### Database (16 tables in SQLite)
1. `providers` — 39 AI labs/companies
2. `models` — 158 models (99 LLM, 18 image, 17 video, 11 voice, 7 speech, 6 sound)
3. `benchmarks` — 34 benchmark definitions (columns: id, name, category, description, url, scale_min, scale_max, higher_is_better, weight)
4. `benchmark_scores` — 365 model×benchmark scores (columns: model_id, benchmark_id, score, source, source_url, measured_at)
5. `people` — 59 notable AI people
6. `price_history` — historical pricing records
7. `speed_history` — historical speed/TTFT records
8. `provider_endpoints` — same model via different providers
9. `subscription_plans` — 16 plans across OpenAI/Anthropic/Google/xAI
10. `plan_model_limits` — 21 message limit entries per plan
11. `cli_tools` — 13 CLI coding tools
12. `scrape_log`, `tags`, `taggables`, `news`, `glossary`, `youtube_creators`, `rumoured_models`

### Data Pipeline (5 scrapers, runs every 12h via GitHub Actions)
Order in `scripts/scrape-all.ts`:
1. **OpenRouter** (`scrapers/openrouter.ts`) — PRIMARY pricing source, ~400 models, no key needed
2. **Official Pricing** (`scrapers/official-pricing.ts`) — cross-validates against official provider pages
3. **Multi-Source Validator** (`scrapers/pricing.ts`) — Together AI, Google Gemini, Groq APIs
4. **Benchmarks** (`scrapers/benchmarks.ts`) — Artificial Analysis + LMSYS Chatbot Arena
5. **Speed & TTFT** (`scrapers/speed.ts`) — Artificial Analysis REST API (live with AA_API_KEY)

### Existing Benchmark Categories in seed-db.ts
Currently uses these category values: `knowledge`, `reasoning`, `coding`, `instruction`, `conversational`, `multimodal`, `safety`, `agent`, `domain`, `multilingual`

Currently has ONE arena benchmark: `chatbot-arena-elo` (id: `chatbot-arena-elo`, category: `conversational`, scale: 800-1400).

---

## TASK 1 — LM Arena Categories & Benchmarks (PRIMARY TASK)

LM Arena (formerly LMSYS Chatbot Arena, now at **arena.ai**) has massively expanded. We need to add their category-specific Elo scores as new benchmarks and track them per model.

### Research Done (from previous session — DO NOT re-research, use this data)

**LM Arena has these main arena types:**
| Arena | Models | Votes | URL |
|-------|--------|-------|-----|
| Text | 324 | 5,489,714 | arena.ai/leaderboard/text |
| Vision | 90 | 624,976 | arena.ai/leaderboard/vision |
| Text-to-Image | ? | ? | arena.ai/leaderboard |
| Image Edit | ? | ? | (incl. Multi-Image Edit, added Jan 2026) |
| Text-to-Video | ? | ? | arena.ai/leaderboard |
| Image-to-Video | ? | ? | arena.ai/leaderboard |
| Code | ? | ? | arena.ai/leaderboard |
| WebDev | ? | ? | (split into HTML and React subcategories) |
| Search | ? | ? | arena.ai/leaderboard |

**Text Arena has these subcategory tabs (each with its own Elo leaderboard):**
1. Overall
2. Expert (only 5.5% of all prompts — the hardest ones)
3. Math
4. Instruction Following
5. Multi-Turn
6. Creative Writing
7. Coding
8. Hard Prompts
9. Hard Prompts (English)

**8 Occupational leaderboard categories (added Nov 2025):**
These are based on 23 fields derived from US Bureau of Labor Statistics SOC taxonomy.
1. Software & IT Services (~28% of prompts)
2. Writing, Literature, & Language (~25%)
3. Life, Physical, & Social Science (~17%)
4. Entertainment, Sports, & Media
5. Business, Management, & Financial Ops
6. Mathematical
7. Legal & Government
8. Medicine & Healthcare

**Additional confirmed occupational fields (from the 23 total):**
9. Engineering & Architecture
10. Education
11. Technology Hardware & Equipment
12. Philosophy, Religion, & Theology
(Remaining ~11 likely: Arts/Design, Food/Hospitality, Sales, Transportation, Construction, Personal Care, Community/Social Services, etc.)

**Key model performance insights by category:**
- Claude family dominant in: Software & IT Services, Mathematical
- Gemini 2.5 Pro excels in: Writing/Literature/Language, Life/Physical/Social Science
- OpenAI models (GPT-4o, o3) strong in: Medicine & Healthcare
- Top generalist ranking: Gemini 2.5 Pro > Claude Opus 4.1 > o3 > GPT 5

**Data sources to fetch Elo scores:**
- HuggingFace Space: `huggingface.co/spaces/lmarena-ai/arena-leaderboard` (has the live data)
- HuggingFace datasets: `lmarena-ai/arena-expert-5k`, `lmarena-ai/arena-human-preference-140k`, `lmarena-ai/search-arena-24k`, `lmarena-ai/webdev-arena-preference-10k`
- Blog posts: `news.lmarena.ai/arena-expert/`, `news.lmarena.ai/arena-category/`, `news.lmarena.ai/leaderboard-changelog/`
- NOTE: arena.ai returns 403 to bots. Try HuggingFace or the Kaggle dataset at `kaggle.com/datasets/nuhmanpk/lm-arena-leaderboards`

### What To Implement

**Step 1: Add new benchmark definitions to `scripts/seed-db.ts`**

In the `benchmarks` array (line ~651), add entries for each LM Arena category. Follow existing pattern:
```ts
['arena-elo-overall', 'Arena Elo (Overall)', 'arena', 'LM Arena crowdsourced Elo — overall text ranking', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.5],
['arena-elo-coding', 'Arena Elo (Coding)', 'arena', 'LM Arena crowdsourced Elo — coding prompts', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.3],
['arena-elo-math', 'Arena Elo (Math)', 'arena', 'LM Arena crowdsourced Elo — math prompts', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.3],
['arena-elo-creative-writing', 'Arena Elo (Creative Writing)', 'arena', 'LM Arena crowdsourced Elo — creative writing prompts', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.0],
['arena-elo-instruction-following', 'Arena Elo (Instruction Following)', 'arena', 'LM Arena crowdsourced Elo — instruction following', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.0],
['arena-elo-multi-turn', 'Arena Elo (Multi-Turn)', 'arena', 'LM Arena crowdsourced Elo — multi-turn conversations', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.0],
['arena-elo-hard-prompts', 'Arena Elo (Hard Prompts)', 'arena', 'LM Arena crowdsourced Elo — hard prompts', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.2],
['arena-elo-expert', 'Arena Elo (Expert)', 'arena', 'LM Arena crowdsourced Elo — expert-level prompts (top 5.5%)', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.5],
// Occupational
['arena-elo-software', 'Arena Elo (Software & IT)', 'arena-occupational', 'LM Arena Elo — Software & IT Services', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.0],
['arena-elo-writing', 'Arena Elo (Writing & Literature)', 'arena-occupational', 'LM Arena Elo — Writing, Literature, & Language', 'https://arena.ai/leaderboard/text', 800, 1400, 1, 1.0],
// ... etc for all 8 occupational categories
// Vision Arena
['arena-elo-vision', 'Arena Elo (Vision)', 'arena', 'LM Arena crowdsourced Elo — vision/multimodal', 'https://arena.ai/leaderboard/vision', 800, 1400, 1, 1.0],
```

Consider renaming the existing `chatbot-arena-elo` to `arena-elo-overall` OR keeping it as a legacy alias.

**Step 2: Fetch actual Elo scores per category**

Go to the HuggingFace Space or Kaggle dataset and get the real per-category Elo scores for the top models. Add to the `scores` array in seed-db.ts.

**Step 3: Consider a dedicated `/arena/` page**

A page showing all LM Arena categories in a tabbed or card layout, similar to arena.ai's own leaderboard but integrated with our data. Could link to individual benchmark detail pages.

**Step 4: Update the benchmark scraper**

In `scripts/scrapers/benchmarks.ts`, add logic to scrape per-category Elo from the HuggingFace Space API if possible.

---

## TASK 2 — X/Twitter Posts to Review

These couldn't be accessed (X blocks bots). User needs to paste content manually.

**Post 1:** https://x.com/i/status/2031135590113321234
- Comments contain lists of benchmarks to add to the website
- Need to read replies and extract benchmark names/details

**Post 2:** https://x.com/i/status/2032113487510716717
- New AI coding CLI tool announced
- Need to identify the tool and add to `cli_tools` table

**Action for user:** Open these in your browser, copy the full post + replies, and paste into the session.

---

## TASK 3 — Official Pricing Scraper Enhancement (LOWER PRIORITY)

`scripts/scrapers/official-pricing.ts` currently uses hardcoded known data. Ideally:
- Try to fetch live from official pricing pages (most return 403)
- Fall back to known data when pages block
- Key URLs: `developers.openai.com/api/docs/pricing/`, `anthropic.com/pricing`, `ai.google.dev/pricing`

---

## KEY FILE PATHS

| Purpose | Path |
|---------|------|
| **DB Schema (runtime)** | `src/db/schema.ts` |
| **Seed data (THE key file)** | `scripts/seed-db.ts` (~1961 lines) |
| **DB Queries** | `src/db/queries.ts` (~1052 lines) |
| **Benchmark scraper** | `scripts/scrapers/benchmarks.ts` |
| **Scrape pipeline** | `scripts/scrape-all.ts` |
| **GitHub Actions** | `.github/workflows/scrape.yml` |
| **Model detail page** | `src/pages/models/[id].astro` |
| **Benchmark detail page** | `src/pages/benchmarks/[id].astro` |
| **LLM compare table** | `src/pages/compare/llm.astro` + `src/components/LLMComparisonTable.tsx` |
| **Layout / Nav** | `src/layouts/BaseLayout.astro` |
| **Types** | `src/types/models.ts` |
| **CLI tools page** | `src/pages/cli/index.astro` + `src/pages/cli/[id].astro` |
| **Todo list** | `todo.md` |

---

## BUILD & TEST

```bash
npm ci                        # install deps
npx tsx scripts/seed-db.ts    # seed DB (destructive — recreates from scratch)
npm run scrape                # run all scrapers (updates DB in place)
npm run build                 # build static site (355 pages)
npm run dev                   # dev server at localhost:4321
```

---

## GIT STATE

- **Branch:** `claude/init-ai-resource-hub-7KhbS`
- **Latest commit:** `65b9a1f` — "Add HANDOFF.md for session continuity"
- **All changes pushed.** No uncommitted work.
- **30 commits** on this branch

### Commit history (most recent first):
```
65b9a1f Add HANDOFF.md for session continuity
c6861e0 Add CLI tools comparison page with 13 tools
22b5f9e Add todo.md with pending X/Twitter benchmark research
9449f1a Add subscription plans with message limits and official pricing scraper
d28ad75 Integrate Artificial Analysis REST API for live speed and benchmark data
d5f6dce Rewrite scrapers for real multi-source data pipeline with new model detection
7155e43 Add Phase 3: AI Academy, prompt library, token counter, rumours tracker, and more
858e554 Add data integrity system, references page, and 12-hour scrape schedule
3f664ce Add Phase 2 features: domain leaderboards, newsletter, charts, speed data
bf3ddb6 Rebuild news page to match koltregaskes.com system
e9fce00 Add interactive news page, 4 new blog articles, and tooltip system
0b677f5 Add blog post: bench-maxing and personal AI benchmarks
8264a93 Update SWE-bench entry to reference SWE-bench Pro as current standard
adb1e89 Add Epoch AI, METR, AISI, ARC-AGI, LiveBench, SWE-bench and more to data sources
61a5e3e Expand Data Sources on methodology page with full source attribution
```

---

## USER PREFERENCES

- Prefers official/primary data sources over third-party aggregators
- Cares deeply about data freshness and source attribution
- Wants message counts tracked per subscription plan tier
- Dark theme with CSS custom properties (`--color-*`)
- All pages use `BaseLayout.astro` wrapper
- Pricing per 1M tokens, speeds in tokens/sec, TTFT in milliseconds
- Build must pass cleanly before committing

---

## WHAT TO DO FIRST

1. **Read `scripts/seed-db.ts`** to understand the full benchmark structure
2. **Fetch LM Arena per-category Elo scores** from HuggingFace or Kaggle
3. **Add new arena benchmark definitions and scores** to seed-db.ts
4. **Consider creating a `/arena/` page** for visualizing all categories
5. **Rebuild and verify:** `npx tsx scripts/seed-db.ts && npm run build`
