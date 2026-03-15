# Codex Handoff — The AI Resource Hub

> **For:** OpenAI Codex agent continuing development of theairesourcehub.com
> **Created:** 2026-03-15
> **Branch:** `claude/init-ai-resource-hub-7KhbS`

---

## Project Summary

The AI Resource Hub is a static website that compares, ranks, and tracks AI models across pricing, speed, benchmarks, and quality. It's built with Astro 5 + SQLite + TypeScript and generates 355 static pages from a seeded database.

**Live site:** theairesourcehub.com
**Key value prop:** Single source of truth for AI model data — pricing, speed, benchmarks, Elo ratings, subscription plans, CLI tools — all cross-referenced and kept fresh by automated scrapers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (static site generator) |
| Styling | TailwindCSS 4 |
| Database | SQLite via better-sqlite3 (build-time only) |
| Interactive components | React (for `LLMComparisonTable.tsx`) |
| Language | TypeScript throughout |
| Deployment | Static HTML output (`dist/`) |
| CI/CD | GitHub Actions (`.github/workflows/scrape.yml`) — scrapes every 12h |

## Quick Start

```bash
npm ci                        # install dependencies
npx tsx scripts/seed-db.ts    # seed database (DESTRUCTIVE — drops and recreates all tables)
npm run scrape                # run all 5 scrapers to update DB with live data
npm run build                 # build static site → dist/ (355 pages, ~15s)
npm run dev                   # dev server at localhost:4321
```

**Important:** The seed script is destructive. It drops all tables and recreates them. Scrapers only update/insert — they don't destroy data.

---

## Architecture

```
ai-resource-hub/
├── src/
│   ├── pages/              # 82 .astro files → 355 pages (dynamic routes via [id].astro)
│   ├── layouts/            # BaseLayout.astro (all pages use this)
│   ├── components/         # Astro + React components
│   ├── db/
│   │   ├── schema.ts       # Runtime schema init + getDB() singleton
│   │   └── queries.ts      # All SQL queries (~1052 lines)
│   ├── data/               # Data layer (llm-models.ts etc.)
│   └── types/              # TypeScript interfaces (models.ts)
├── scripts/
│   ├── seed-db.ts          # Master seed data (~1961 lines) — THE key data file
│   ├── scrape-all.ts       # Scraper orchestration
│   └── scrapers/
│       ├── base.ts         # Base scraper class
│       ├── openrouter.ts   # PRIMARY: pricing from OpenRouter API
│       ├── official-pricing.ts  # Cross-validation against official provider pages
│       ├── pricing.ts      # Together AI, Gemini, Groq validation
│       ├── benchmarks.ts   # Artificial Analysis + LMSYS Arena scores
│       └── speed.ts        # Artificial Analysis speed/TTFT data
├── data/
│   └── the-ai-resource-hub.db  # SQLite database (generated, not committed)
├── .github/workflows/
│   └── scrape.yml          # 12-hour scrape schedule
├── HANDOFF.md              # General session handoff (context for any agent)
├── CODEX-HANDOFF.md        # This file
└── todo.md                 # Pending manual tasks
```

### Data Flow

```
seed-db.ts (initial data) → SQLite DB → scrapers update DB → Astro reads DB at build time → static HTML
```

The DB is a build-time artifact. Astro pages query it via `src/db/queries.ts` during `npm run build`. The output is plain static HTML/CSS/JS.

---

## Database Schema (16 tables)

### Core Tables

**`providers`** — 39 AI companies (OpenAI, Anthropic, Google, Meta, etc.)
- id (TEXT PK), name, colour, website, status_url, api_docs_url, description, founded, headquarters, ceo, funding

**`models`** — 158 models across 6 categories
- id (TEXT PK), name, provider_id (FK), input_price, output_price (per 1M tokens), context_window, max_output, speed (tokens/sec), quality_score, released, open_source, modality, api_available, category (llm|image|video|voice|speech|sound), status, pricing_source, pricing_updated

**`benchmarks`** — 34 benchmark definitions
- id (TEXT PK), name, category (knowledge|reasoning|coding|instruction|conversational|multimodal|safety|agent|domain|multilingual), description, url, scale_min, scale_max, higher_is_better, weight

**`benchmark_scores`** — 365 model×benchmark scores
- model_id + benchmark_id (composite PK), score, source, source_url, measured_at

### Supporting Tables
- `people` (59) — notable AI figures
- `price_history` — price change tracking over time
- `speed_history` — latency tracking over time
- `provider_endpoints` — same model via different providers (e.g., Llama on Together vs Groq)
- `subscription_plans` (16) — consumer plans (ChatGPT Plus, Claude Pro, etc.)
- `plan_model_limits` (21) — message limits per plan per model tier
- `cli_tools` (13) — AI coding CLI tools (Claude Code, Cursor, Aider, etc.)
- `scrape_log` — scraper run history
- `tags` + `taggables` — polymorphic tagging system
- `news` — aggregated AI news articles
- `glossary` — AI terminology definitions
- `youtube_creators` — AI YouTube channels
- `rumoured_models` — stealth/leaked model tracker

---

## Pages Overview

### Comparison & Rankings
| Route | Description |
|-------|-------------|
| `/compare/llm/` | Interactive LLM comparison table (React) |
| `/compare/image/` | Image model comparison |
| `/compare/video/` | Video model comparison |
| `/compare/voice/` | Voice model comparison |
| `/compare/sound/` | Sound/music model comparison |
| `/compare/head-to-head/` | Side-by-side model comparison |
| `/compare/providers/` | Provider comparison |
| `/leaderboard/` | Overall quality leaderboard |
| `/coding/` | Coding model rankings |
| `/fastest/` | Speed rankings |
| `/cheapest/` | Price rankings |
| `/best-value/` | Value-for-money rankings |
| `/reasoning/` | Reasoning model rankings |
| `/multimodal/` | Multimodal model rankings |
| `/speed/` | Speed & latency comparison |
| `/context-window/` | Context window comparison |
| `/cli/` | CLI coding tools comparison |

### Detail Pages (dynamic routes)
| Route | Count | Description |
|-------|-------|-------------|
| `/models/[id]/` | 158 | Individual model profiles |
| `/labs/[id]/` | 39 | Provider profiles |
| `/benchmarks/[id]/` | 34 | Benchmark explainers |
| `/cli/[id]/` | 13 | CLI tool profiles |

### Content & Education
| Route | Description |
|-------|-------------|
| `/blog/` | 9 articles |
| `/news/` | Aggregated AI news |
| `/academy/` | 4 learning modules |
| `/guides/` | 6 how-to guides |
| `/glossary/` | AI terminology |
| `/prompts/` | Prompt library |
| `/people/` | Notable AI figures |
| `/youtube/` | AI YouTube channels |
| `/twitter/` | AI X/Twitter accounts |

### Tools & Utilities
| Route | Description |
|-------|-------------|
| `/calculator/` | Pricing calculator |
| `/token-counter/` | Token counting tool |
| `/quiz/` | AI knowledge quiz |
| `/rumours/` | Rumoured model tracker |
| `/timeline/` | AI model timeline |
| `/stats/` | Site statistics |

### Domain-Specific
`/agents/`, `/open-source/`, `/healthcare/`, `/legal/`, `/finance/`, `/creative-writing/`, `/use-cases/`, `/tools/`, `/api-guides/`

### Meta
`/methodology/`, `/references/`, `/scheduling/`, `/pricing-trends/`, `/changelog/`, `/tags/`

---

## IMMEDIATE TASK: LM Arena Category Benchmarks

### Context

LM Arena (arena.ai, formerly LMSYS Chatbot Arena) has expanded from a single overall Elo to 17+ category-specific Elo leaderboards. We currently only track `chatbot-arena-elo` (overall). We need to add per-category Elo tracking.

### LM Arena Categories to Add

**Text Arena subcategories** (each has its own Elo scores):
1. Overall (we have this as `chatbot-arena-elo`)
2. Expert — top 5.5% hardest prompts
3. Math
4. Instruction Following
5. Multi-Turn
6. Creative Writing
7. Coding
8. Hard Prompts
9. Hard Prompts (English)

**8 Occupational categories** (added Nov 2025):
1. Software & IT Services (~28% of prompts)
2. Writing, Literature, & Language (~25%)
3. Life, Physical, & Social Science (~17%)
4. Entertainment, Sports, & Media
5. Business, Management, & Financial Ops
6. Mathematical
7. Legal & Government
8. Medicine & Healthcare

**Other arena types:**
- Vision Arena (90 models, 625K votes)
- Code Arena
- WebDev Arena (HTML + React subcategories)
- Search Arena
- Text-to-Image, Image Edit, Text-to-Video, Image-to-Video

### Implementation Plan

1. **Add benchmark definitions** to `scripts/seed-db.ts` (line ~651, in the `benchmarks` array):
   - Use IDs like `arena-elo-coding`, `arena-elo-math`, `arena-elo-creative-writing`, etc.
   - Use category `'arena'` for text subcategories, `'arena-occupational'` for occupational ones
   - Scale: 800–1400, higher_is_better: 1

2. **Fetch real Elo scores** from:
   - HuggingFace Space: `huggingface.co/spaces/lmarena-ai/arena-leaderboard`
   - Kaggle: `kaggle.com/datasets/nuhmanpk/lm-arena-leaderboards`
   - HF datasets: `lmarena-ai/arena-expert-5k`
   - NOTE: arena.ai itself returns 403 to bots

3. **Add scores** to the `scores` array in `seed-db.ts` (line ~727)

4. **Consider a `/arena/` page** — tabbed view showing all LM Arena categories

5. **Update scraper** — `scripts/scrapers/benchmarks.ts` to pull per-category Elo

### Model performance by category (from research):
- **Claude models** dominate: Software & IT Services, Mathematical
- **Gemini 2.5 Pro** leads: Writing/Literature/Language, Life/Physical/Social Science
- **OpenAI models** (GPT-4o, o3) strong in: Medicine & Healthcare
- **Overall ranking:** Gemini 2.5 Pro > Claude Opus 4.1 > o3 > GPT 5

---

## OTHER PENDING TASKS

### From todo.md

1. **X/Twitter benchmark lists** — https://x.com/i/status/2031135590113321234
   - Comments contain benchmark suggestions. Needs manual browser access to read.

2. **New CLI tool from X** — https://x.com/i/status/2032113487510716717
   - New AI coding CLI tool announced. Needs manual reading.

### Lower Priority
3. **Official pricing scraper** — `scripts/scrapers/official-pricing.ts` uses hardcoded data. Could try live fetching with fallback.
4. **Firecrawl CLI tool** — Already in DB but may need more detail from firecrawl.dev.

---

## API Keys (all free tier, set as env vars)

| Key | Service | Purpose |
|-----|---------|---------|
| `AA_API_KEY` | Artificial Analysis | Live speed + benchmark data (recommended) |
| `TOGETHER_API_KEY` | Together AI | Pricing cross-validation |
| `GOOGLE_API_KEY` | Google Gemini | Context window validation |
| `GROQ_API_KEY` | Groq | Context window validation |

---

## Coding Conventions

- **Dark theme** — CSS custom properties (`--color-*`)
- **All pages** use `BaseLayout.astro`
- **Pricing** displayed per 1M tokens
- **Speed** in tokens/sec, TTFT in milliseconds
- **Prefer official data sources** over aggregators
- **Source attribution** on all data — use `source` and `source_url` fields
- **Build must pass** (`npm run build`) before any commit
- Seed script pattern: arrays of tuples → `db.prepare().run(...tuple)` inside `db.transaction()`

---

## Commit History (30 commits, most recent first)

```
6ae2a57 Update HANDOFF.md with complete paste-ready session prompt
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
5afe1b7 Update changelog v1.1 and Gemini Deep Think prompt with latest inventory
fdf13a7 Add AI Quiz page, Provider Comparison page, and update search index
2739739 Add reasoning models, new releases pages, and expand homepage tools section
8ebedf8 Add specialized leaderboards: cheapest, best-value, multimodal, context-window, and status dashboard
8d52b5f Add Fastest AI Models page with speed rankings and nav integration
74eb4ca Update Gemini Deep Think prompt with latest site inventory
c2a577f Add 8 new models, 10 people, 7 tags, and integrate supplemental seed data
1edae4f Add Head-to-Head comparison, specialized leaderboards, and new pages
4df210d Add Methodology page and Gemini Deep Think strategic prompt
89cbe62 Add AI Tools directory, Timeline, Leaderboard, and Pricing Calculator
f8eef6b Add news digest system, X/Twitter accounts page, 814 news articles
4fc881a Add provider status dashboard and API docs links
1c93615 Add News, YouTube, People cards to homepage
ee7a9cc Add 13 new benchmarks with scores and detailed explainer pages
e544005 Add YouTube channels, tags system, and news page
```
