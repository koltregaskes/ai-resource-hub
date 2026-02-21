# Prompt 14: AI Resource Hub — Public AI Model & Benchmark Tracker

**Target:** Google Gemini 3 Deep Think (free tier)
**Purpose:** Build a public-facing website tracking AI models, pricing, benchmarks, and value rankings — the go-to independent resource for AI model comparison
**Created:** 2026-02-19
**Part of:** Workspace 2.0 — Website Management Hub + Revenue Automation (affiliate links)

---

## 1. `<role>` - Define Identity and Expertise

You are a senior full-stack web developer and data visualisation specialist with deep expertise in:
- **Data-driven static websites** — build-time data compilation from CSVs/APIs into fast static pages
- **Sortable comparison tables** — high-performance interactive tables with sorting, filtering, and search
- **Data visualisation** — Chart.js/Recharts for trends, sparklines, and benchmark comparisons
- **Astro framework** — static site generation with React islands for interactivity where needed
- **Tailwind CSS v4** — utility-first styling with dark mode, responsive design, and custom theme
- **API data pipelines** — Python scrapers that pull from Artificial Analysis, HuggingFace, and official lab APIs
- **SEO for data content** — structured data (JSON-LD), meta tags, sitemaps for comparison/leaderboard pages
- **Revenue integration** — tasteful affiliate links and referral tracking without compromising user experience
- **Responsive design** — complex data tables that work on mobile (horizontal scroll, card view toggle)
- **AI industry knowledge** — deep understanding of LLMs, image/video/audio models, benchmarks, and pricing structures

You build fast, data-rich websites that present complex information clearly. Every table sorts correctly. Every chart loads instantly.

---

## 2. `<constraints>` - Hard Requirements

### Technical Stack (New Build)
- **Framework:** Astro 5 (static generation + React islands for interactive components)
- **Styling:** Tailwind CSS v4 with `@theme` directive
- **Charts:** Chart.js or Recharts (for trend visualisation)
- **Data format:** CSV source → JSON at build time
- **Data pipeline:** Python scraper (weekly cron on Raspberry Pi or GitHub Actions)
- **Deployment:** Vercel (free tier) or GitHub Pages
- **Domain:** airesourcehub.com or similar (TBD)
- **Social:** @airesourcehub on X (automated posts for model updates)

### Design Tokens
```css
@theme {
  /* Backgrounds — clean dark, data-first */
  --color-bg-base:       #0a0a0f;
  --color-bg-surface:    #111118;
  --color-bg-elevated:   #1a1a24;
  --color-bg-row-hover:  #1e1e2a;
  --color-bg-row-alt:    #0e0e15;

  /* Text */
  --color-text-primary:  #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted:    #64748b;

  /* Accent — electric blue (data/tech feel) */
  --color-accent:        #3b82f6;
  --color-accent-hover:  #60a5fa;
  --color-accent-muted:  rgba(59, 130, 246, 0.15);

  /* Semantic */
  --color-success:       #22c55e;
  --color-warning:       #f59e0b;
  --color-danger:        #ef4444;
  --color-info:          #06b6d4;

  /* Value ranking colours */
  --color-value-gold:    #fbbf24;
  --color-value-silver:  #94a3b8;
  --color-value-bronze:  #d97706;

  /* Borders */
  --color-border:        #1e293b;
  --color-border-hover:  #334155;
}
```

### Typography
```css
@theme {
  --font-heading: 'Inter', -apple-system, sans-serif;
  --font-body:    'Inter', -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
  --font-data:    'JetBrains Mono', monospace;  /* numbers in tables */
}
```

### Absolute Rules
1. **Dark mode only** — data sites look best dark. No light mode.
2. **Data accuracy above all** — every number must cite its source. No guessing.
3. **Independent** — no sponsorship bias. Value rankings are algorithmic, not editorial.
4. **Fast** — static pages, no client-side data fetching for main content. Interactive tables use pre-loaded JSON.
5. **UK English** throughout all copy and comments.
6. **Mobile usable** — tables must work on phones (horizontal scroll + card view toggle).
7. **Accessible** — WCAG 2.1 AA. Tables use proper `<th>` and `scope` attributes.
8. **Weekly updates minimum** — data pipeline must refresh at least weekly.
9. **Source attribution** — every data point links to its original source.

---

## 3. `<architecture>` - System Design

### Site Structure
```
airesourcehub.com/
├── /                    ← Homepage: overview dashboard
├── /models              ← All models table (sortable, filterable)
├── /models/[slug]       ← Individual model detail page
├── /pricing             ← Pricing comparison table
├── /benchmarks          ← Benchmark leaderboards
├── /value               ← Value-for-money rankings (UNIQUE DIFFERENTIATOR)
├── /trends              ← Price/performance trends over time
├── /news                ← AI model news and updates
├── /about               ← About the project, methodology, data sources
├── /api                 ← Public JSON API (optional, later phase)
└── /changelog           ← Data update history
```

### Data Pipeline
```
Data Sources:
  ├── Official lab blogs (OpenAI, Anthropic, Google, Meta, etc.)
  ├── Artificial Analysis API (benchmarks, speed, pricing)
  ├── HuggingFace Open LLM Leaderboard
  ├── LMSys Chatbot Arena
  ├── LiveBench
  └── Manual additions (new models, corrections)
       ↓
  Python Scraper (weekly cron)
    ├── fetch_artificial_analysis.py
    ├── fetch_huggingface.py
    ├── fetch_pricing.py
    └── validate_data.py
       ↓
  data/
    ├── models.csv          (master model list)
    ├── pricing.csv         (pricing snapshots)
    ├── benchmarks.csv      (benchmark scores)
    └── history/            (versioned snapshots for trends)
       ↓
  Build (Astro)
    ├── Reads CSVs → generates JSON props
    ├── Builds static HTML pages
    ├── Generates sitemap, RSS, structured data
    └── Outputs to dist/
       ↓
  Deploy (Vercel / GitHub Pages)
       ↓
  Post-deploy: @airesourcehub X bot tweets about changes
```

### Competitive Landscape
| Competitor | Strength | Weakness | Our Edge |
|-----------|----------|----------|----------|
| llm-stats.com | Clean tables | JS-heavy, poor SEO, no value rankings | Better SEO, value rankings, trends |
| artificialanalysis.ai | Comprehensive benchmarks | Overwhelming, proprietary index | Simpler, independent, open data |
| HuggingFace Leaderboard | Open models focus | No pricing, no closed models | All models, pricing included |
| OpenRouter | Real-time pricing | Provider-specific, not independent | Independent comparison |

**Our unique differentiator: VALUE RANKINGS** — performance per pound. No other site combines benchmarks + pricing into a value score.

---

## 4. `<schema>` - Data Structures

### models.csv (Master)
```csv
slug,name,provider,category,release_date,context_window,input_price_1m,output_price_1m,is_open_source,api_available,status
gpt-5.2,GPT-5.2,OpenAI,llm,2026-01-15,128000,15.00,60.00,false,true,active
claude-opus-4.5,Claude Opus 4.5,Anthropic,llm,2026-02-01,200000,15.00,75.00,false,true,active
gemini-3-pro,Gemini 3 Pro,Google,llm,2025-12-20,2000000,1.25,5.00,false,true,active
llama-4-405b,Llama 4 405B,Meta,llm,2026-01-28,128000,0.00,0.00,true,true,active
midjourney-v7,Midjourney V7,Midjourney,image,2026-02-10,0,0.00,0.00,false,false,active
suno-v4.5,Suno V4.5,Suno,audio,2026-01-20,0,0.00,0.00,false,true,active
```

### benchmarks.csv
```csv
model_slug,benchmark,score,max_score,date_tested,source,source_url
claude-opus-4.5,gpqa-diamond,72.5,100,2026-02-01,Artificial Analysis,https://artificialanalysis.ai/...
gpt-5.2,swe-bench-verified,62.3,100,2026-01-15,SWE-bench,https://swe-bench.com/...
gemini-3-pro,arc-agi-2,48.7,100,2025-12-20,ARC Prize,https://arcprize.org/...
```

### pricing.csv (Historical Snapshots)
```csv
model_slug,date,input_price_1m,output_price_1m,source
claude-opus-4.5,2026-02-01,15.00,75.00,Anthropic API
claude-opus-4.5,2026-02-15,12.00,60.00,Anthropic API
gpt-5.2,2026-01-15,15.00,60.00,OpenAI API
```

### Value Score Calculation
```
Value Score = (Intelligence × 0.4 + Speed × 0.3) / Normalised_Cost × 100

Where:
  Intelligence = Average of available benchmark scores (normalised 0-100)
  Speed = Tokens/second normalised to fastest model (0-100)
  Normalised_Cost = (input_price + output_price) / 2, normalised to most expensive (0-100)

Higher score = better value for money
```

### Model Categories
```
llm          — Large Language Models (text generation, coding, reasoning)
image        — Image Generation (Midjourney, DALL-E, Flux, etc.)
video        — Video Generation (Runway, Kling, Sora, etc.)
audio        — Audio/Music Generation (Suno, Udio, etc.)
tts          — Text-to-Speech
stt          — Speech-to-Text
embedding    — Embedding Models
multimodal   — Multi-modal (vision + text)
```

---

## 5. `<existing-code>` - Prior Work (Ideas Only — Not Migrating)

### Existing Data Assets in V1 Workspace
The following exist as planning/research only. Use as inspiration, not direct migration:

**models.csv (29 models tracked):**
- LLMs: GPT-5.2, Claude Opus 4.5, Gemini 3 Pro/Flash, Grok 3, Llama 4, Mistral Large 3, DeepSeek V3.2
- Image: Nano Banana Pro
- Video: Veo 3.1
- Audio: SAM Audio

**benchmark-updates-jan-2026.csv (7 benchmarks):**
- GPQA Diamond, SWE-bench Verified, ARC-AGI-2, AIME 2025, ARC Prize 2025, Last Human Exam, Minecraft Bench

**create_model_db.py (SQLite schema):**
```sql
CREATE TABLE models (
    id INTEGER PRIMARY KEY,
    name TEXT, version TEXT, provider TEXT,
    cost_input_1m REAL, cost_output_1m REAL,
    context_window INTEGER, released_date TEXT,
    type TEXT, size_params TEXT,
    api_available BOOLEAN, is_open_source BOOLEAN,
    rating TEXT, report_link TEXT,
    created_at TIMESTAMP, updated_at TIMESTAMP
);
```

**Artificial Analysis Integration (designed):**
- API endpoint: `artificialanalysis.ai/api/v2/data/llms/models`
- Fields: omniscience_index, output_speed, input_price, output_price, context_window, provider
- Caching: 1-hour TTL
- Task-type scoring profiles (coding, reasoning, general, creative)

### GitHub Repos (Referenced, Not Cloned)
These repos were mentioned in planning but need to be checked on GitHub:
- `koltregaskes/model-prices`
- `koltregaskes/model-table`
- `koltregaskes/model-value-leaderboard`

Use these as reference for field structure and data patterns.

---

## 6. `<design-system>` - Visual Language

### Overall Aesthetic
**"Bloomberg Terminal meets Vercel Dashboard"** — data-dense but clean. Dark, sharp, professional. The site should feel like a tool you trust for decisions, not a blog.

### Page Components

**Model Comparison Table:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Search: "claude..."]  [Category ▼]  [Provider ▼]  [Sort ▼]│
├──────────────────────────────────────────────────────────────┤
│  Model         │ Provider │ Price (in) │ Price (out) │ Value │
│  ─────────────────────────────────────────────────────────── │
│  Gemini 3 Pro  │ Google   │ $1.25      │ $5.00       │ 🥇 94 │
│  Llama 4 405B  │ Meta     │ Free       │ Free        │ 🥇 92 │
│  Claude Opus   │ Anthropic│ $15.00     │ $75.00      │ 🥈 78 │
│  GPT-5.2       │ OpenAI   │ $15.00     │ $60.00      │ 🥈 75 │
└──────────────────────────────────────────────────────────────┘
```

**Value Leaderboard:**
```
┌────────────────────────────────────────────┐
│  #1  Gemini 3 Flash  │ Value: 97  │ $0.08  │
│      ████████████████████████████████ 97%   │
│  #2  Llama 4 70B     │ Value: 94  │ Free   │
│      ██████████████████████████████ 94%     │
│  #3  DeepSeek V3.2   │ Value: 91  │ $0.27  │
│      ████████████████████████████ 91%       │
└────────────────────────────────────────────┘
```

**Benchmark Chart (Radar/Spider):**
- One spider chart per model showing scores across all benchmarks
- Overlay comparison mode: select 2-3 models to overlay
- Colour-coded by provider (OpenAI=green, Anthropic=orange, Google=blue, Meta=purple)

**Pricing Trend Chart (Line):**
- X-axis: time (monthly)
- Y-axis: price per 1M tokens
- Multiple lines for different models
- Interactive hover for exact values

### Responsive Strategy
- **Desktop:** Full tables with all columns visible
- **Tablet:** Hide less important columns, show on expand
- **Mobile:** Switch to card view (one model per card) with key stats

### Colour by Provider
```css
--provider-openai:     #10A37F;  /* green */
--provider-anthropic:  #D97706;  /* amber */
--provider-google:     #4285F4;  /* blue */
--provider-meta:       #7C3AED;  /* purple */
--provider-mistral:    #F97316;  /* orange */
--provider-xai:        #E5E7EB;  /* light gray */
--provider-deepseek:   #06B6D4;  /* cyan */
--provider-midjourney: #818CF8;  /* indigo */
--provider-suno:       #EC4899;  /* pink */
```

---

## 7. `<task>` - Deliverables

### Deliverable 1: Astro Project Scaffold
Complete Astro 5 project with:
1. **Project structure** — pages, components, layouts, data, scripts directories
2. **Tailwind CSS v4** configuration with all design tokens
3. **Data loading** — CSV reader that converts to typed JSON at build time
4. **Layout component** — shared header, nav, footer across all pages
5. **package.json** with all dependencies
6. **astro.config.mjs** with proper SSG configuration

### Deliverable 2: Homepage Dashboard
```
/  →  Overview with:
  - Total models tracked (live count)
  - Latest model added
  - Price change alerts (models that dropped/raised prices)
  - Top 5 value rankings (quick glance)
  - Category breakdown (pie/donut chart)
  - "Last updated: 19 Feb 2026" timestamp
```

### Deliverable 3: Models Table Page
```
/models  →  Interactive table with:
  - All models listed with key fields
  - Sort by any column (click header)
  - Filter by category, provider, open-source
  - Search by model name
  - Click row → goes to /models/[slug] detail page
  - Responsive: table on desktop, cards on mobile
```

### Deliverable 4: Individual Model Page
```
/models/[slug]  →  Detail page with:
  - Model name, provider, logo
  - Key stats (price, context, benchmarks)
  - Benchmark radar chart
  - Price history line chart
  - Value score with explanation
  - Links to official docs, API, playground
  - "Compare with..." dropdown
  - Affiliate link to try the model (where applicable)
```

### Deliverable 5: Pricing Comparison Page
```
/pricing  →  Price-focused table with:
  - Input price, output price columns
  - Calculated cost per 1K words, per 1M tokens
  - Provider grouping
  - Free tier indicators
  - Historical price change indicators (▲ ▼)
  - Sort by cheapest input, cheapest output, best value
```

### Deliverable 6: Value Leaderboard
```
/value  →  THE differentiating page:
  - Models ranked by value score
  - Visual progress bars for each model
  - Methodology explanation sidebar
  - Filter by category (LLM, Image, etc.)
  - "Best value for [coding/reasoning/general/creative]" task-specific views
  - Exportable as CSV/JSON
```

### Deliverable 7: Benchmark Leaderboard
```
/benchmarks  →  Benchmark-focused views:
  - Table per benchmark (GPQA, SWE-bench, ARC-AGI, etc.)
  - Cross-benchmark comparison chart
  - Historical scores (how models improve over time)
  - Benchmark methodology links
```

### Deliverable 8: Data Pipeline
Python scripts for automated data collection:
1. **fetch_artificial_analysis.py** — pulls from AA API, caches locally
2. **fetch_pricing.py** — checks official API pricing pages
3. **validate_data.py** — ensures no missing fields, flags stale data
4. **generate_snapshots.py** — creates historical snapshots in `data/history/`
5. **requirements.txt** — Python dependencies
6. **GitHub Actions workflow** — weekly cron to run pipeline + rebuild site

### Deliverable 9: Seed Data
Populate initial data files with at least:
- 30 models across all categories
- Pricing data for all API-accessible models
- Benchmark scores from at least 3 benchmark suites
- 2 months of historical pricing snapshots

---

## Self-Verification Checklist

Before submitting, verify every item:

### Core Pages
- [ ] Homepage dashboard shows live stats, value rankings, latest updates
- [ ] Models table sorts by every column correctly
- [ ] Individual model pages have charts, stats, and comparison links
- [ ] Pricing page shows accurate, sourced pricing
- [ ] Value leaderboard ranks models by value score with visual bars
- [ ] Benchmark page shows scores per benchmark with proper attribution

### Data Integrity
- [ ] Every price cites its source
- [ ] Every benchmark score links to the original leaderboard
- [ ] Value score formula is documented and transparent
- [ ] Historical data preserved for trend charts
- [ ] Data validation script catches missing/invalid fields

### Design Quality
- [ ] Dark mode only, consistent with design tokens
- [ ] Tables are readable and usable on mobile (card view toggle)
- [ ] Charts use provider colours consistently
- [ ] Value rankings use gold/silver/bronze visual treatment
- [ ] Typography is clean (Inter + JetBrains Mono)
- [ ] No visual clutter — every element earns its place

### Technical Quality
- [ ] Astro 5 project builds without errors
- [ ] All pages are static HTML (no client-side data fetching for main content)
- [ ] Interactive tables use pre-loaded JSON (fast)
- [ ] SEO: meta tags, Open Graph, structured data on every page
- [ ] Sitemap generated automatically
- [ ] RSS feed for model updates
- [ ] Lighthouse score > 90 on all metrics

### Pipeline
- [ ] Python scraper runs without errors
- [ ] GitHub Actions workflow triggers weekly
- [ ] Data snapshots versioned in `data/history/`
- [ ] Stale data flagged (models not updated in 30+ days)
- [ ] @airesourcehub X integration documented (not implemented, just documented)

### Revenue
- [ ] Affiliate link placement documented (model detail pages, "Try it" buttons)
- [ ] Links are tasteful, not aggressive
- [ ] Affiliate disclosure on /about page
- [ ] No bias in rankings from affiliate relationships
