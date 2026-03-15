# Session Handoff — The AI Resource Hub

## Project Overview
**Repo:** `koltregaskes/ai-resource-hub`
**Branch:** `claude/init-ai-resource-hub-7KhbS`
**Stack:** Astro 5 + TailwindCSS 4 + SQLite (better-sqlite3) + TypeScript
**Build:** `npm run build` (355 pages, ~15s)
**DB:** `data/the-ai-resource-hub.db` (SQLite, seeded by `npx tsx scripts/seed-db.ts`)

## What Exists Now

### Pages (82 .astro files, 355 built pages)
- `/compare/llm/` — main LLM comparison table (React interactive)
- `/compare/image/`, `/video/`, `/voice/`, `/sound/` — category comparisons
- `/compare/head-to-head/` — side-by-side model comparison
- `/compare/providers/` — provider comparison
- `/models/[id]/` — 158 model detail pages
- `/labs/[id]/` — provider detail pages (39 providers)
- `/benchmarks/[id]/` — 34 benchmark detail pages
- `/cli/` + `/cli/[id]/` — **NEW** CLI tools comparison (13 tools)
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

### Database Schema (16 tables)
1. `providers` — 39 AI labs/companies
2. `models` — 158 models (99 LLM, 18 image, 17 video, 11 voice, 7 speech, 6 sound)
3. `benchmarks` — 34 benchmark definitions
4. `benchmark_scores` — 365 model×benchmark scores
5. `people` — 59 notable AI people
6. `price_history` — historical pricing records
7. `speed_history` — historical speed/TTFT records
8. `provider_endpoints` — same model via different providers
9. `subscription_plans` — **NEW** 16 plans across OpenAI/Anthropic/Google/xAI
10. `plan_model_limits` — **NEW** 21 message limit entries per plan
11. `cli_tools` — **NEW** 13 CLI coding tools
12. `scrape_log`, `tags`, `taggables`, `news`, `glossary`, `youtube_creators`, `rumoured_models`

### Data Pipeline (5 scrapers, runs every 12h via GitHub Actions)
Pipeline order in `scripts/scrape-all.ts`:
1. **OpenRouter** (`scrapers/openrouter.ts`) — PRIMARY pricing source, ~400 models, no key needed
2. **Official Pricing** (`scrapers/official-pricing.ts`) — **NEW** cross-validates against official provider pages (OpenAI, Anthropic, Google, DeepSeek, Mistral)
3. **Multi-Source Validator** (`scrapers/pricing.ts`) — Together AI, Google Gemini, Groq APIs
4. **Benchmarks** (`scrapers/benchmarks.ts`) — Artificial Analysis + LMSYS Chatbot Arena
5. **Speed & TTFT** (`scrapers/speed.ts`) — **NEW** Artificial Analysis REST API (live with AA_API_KEY)

### API Keys (all free tier)
- `AA_API_KEY` — Artificial Analysis (RECOMMENDED, gives live speed + benchmarks)
- `TOGETHER_API_KEY` — Together AI pricing validation
- `GOOGLE_API_KEY` — Google Gemini context window validation
- `GROQ_API_KEY` — Groq context window validation

---

## INCOMPLETE WORK — What Needs Doing

### 1. LM Arena Categories & Benchmarks (IN PROGRESS when session ended)

LM Arena (now at arena.ai) has expanded massively. We need to create benchmark categories that mirror their taxonomy and track Elo scores per category.

**LM Arena now has these main arenas:**
- **Text** — 324 models, 5.5M votes
- **Vision** — 90 models, 625K votes
- **Text-to-Image** — image generation
- **Image Edit** — single-image + multi-image edit
- **Text-to-Video** — video generation
- **Image-to-Video** — video from images
- **Code** — dedicated code arena
- **WebDev** — split into HTML and React subcategories
- **Search** — models with search/grounding

**Text Arena subcategories (each has its own Elo leaderboard):**
- Overall, Expert, Math, Instruction Following, Multi-Turn, Creative Writing, Coding, Hard Prompts, Hard Prompts (English)

**8 Occupational leaderboard categories (NEW, from Nov 2025):**
1. Software & IT Services
2. Writing, Literature, & Language
3. Life, Physical, & Social Science
4. Entertainment, Sports, & Media
5. Business, Management, & Financial Ops
6. Mathematical
7. Legal & Government
8. Medicine & Healthcare

(Based on 23 occupational fields derived from US Bureau of Labor Statistics SOC)

**What needs to be done:**
- Add new benchmark entries to `seed-db.ts` for each LM Arena category (e.g., `arena-elo-overall`, `arena-elo-coding`, `arena-elo-math`, `arena-elo-creative-writing`, `arena-elo-expert`, etc.)
- Add the arena subcategory Elo scores for each model
- Consider creating a dedicated `/arena/` page showing all categories
- The HuggingFace Space at `huggingface.co/spaces/lmarena-ai/arena-leaderboard` has the data — try fetching it
- LM Arena datasets on HuggingFace: `lmarena-ai/arena-expert-5k`, `lmarena-ai/arena-human-preference-140k`, `lmarena-ai/search-arena-24k`, `lmarena-ai/webdev-arena-preference-10k`
- Official blog posts: `news.lmarena.ai/arena-expert/`, `news.lmarena.ai/arena-category/`, `news.lmarena.ai/leaderboard-changelog/`
- The site at arena.ai blocks automated fetching (403), but the HuggingFace data should be accessible

### 2. X/Twitter Posts to Review (BLOCKED — needs manual browser access)

From `todo.md`:

**Post 1:** https://x.com/i/status/2031135590113321234
- Comments contain lists of benchmarks to add to the website
- Need to read replies and extract benchmark names/details

**Post 2:** https://x.com/i/status/2032113487510716717
- New AI coding CLI tool announced
- Need to identify the tool and add to `cli_tools` table

**Action:** Open these in a browser, copy the content, paste into the new session.

### 3. Official Pricing Scraper Enhancement

The `official-pricing.ts` scraper currently uses hardcoded known data from official pages. Ideally it should:
- Try to fetch live from official pricing pages (most return 403 to bots)
- Fall back to known data when pages block us
- The OpenAI pricing page at `developers.openai.com/api/docs/pricing/` has comprehensive data
- Anthropic at `anthropic.com/pricing`, Google at `ai.google.dev/pricing`

### 4. Firecrawl CLI Tool
User specifically mentioned Firecrawl — it's already in the CLI tools table but may need more detail from the official site at firecrawl.dev.

---

## Key File Paths

| Purpose | Path |
|---------|------|
| DB Schema (runtime) | `src/db/schema.ts` |
| DB Schema (seed) | `scripts/seed-db.ts` |
| DB Queries | `src/db/queries.ts` |
| Scraper base | `scripts/scrapers/base.ts` |
| Scrape pipeline | `scripts/scrape-all.ts` |
| GitHub Actions | `.github/workflows/scrape.yml` |
| Model detail page | `src/pages/models/[id].astro` |
| Provider detail page | `src/pages/labs/[id].astro` |
| CLI tools page | `src/pages/cli/index.astro` |
| CLI detail page | `src/pages/cli/[id].astro` |
| LLM compare table | `src/pages/compare/llm.astro` + `src/components/LLMComparisonTable.tsx` |
| Layout/Nav | `src/layouts/BaseLayout.astro` |
| Types | `src/types/models.ts` |
| Data layer | `src/data/llm-models.ts` |
| Scheduling docs | `src/pages/scheduling/index.astro` |
| Todo list | `todo.md` |

## How to Build & Test
```bash
npm ci                              # install deps
npx tsx scripts/seed-db.ts          # seed the database (destructive — recreates from scratch)
npm run scrape                      # run all scrapers (updates DB in place)
npm run build                       # build static site (355 pages)
npm run dev                         # dev server at localhost:4321
```

## Git State
- Branch: `claude/init-ai-resource-hub-7KhbS`
- Latest commit: `c6861e0` — "Add CLI tools comparison page with 13 tools"
- All changes pushed to remote
- No uncommitted changes

## Session Context
- User is **@koltregaskes** building The AI Resource Hub (theairesourcehub.com)
- User prefers official/primary data sources over third-party aggregators
- User wants message counts tracked per subscription plan tier
- User cares deeply about data freshness and source attribution
- The site uses a dark theme with CSS custom properties (`--color-*`)
- All pages use `BaseLayout.astro` wrapper
- Pricing is per 1M tokens, speeds in tokens/sec, TTFT in milliseconds
