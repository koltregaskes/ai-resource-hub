# Gemini Deep Think Prompt: The AI Resource Hub

Copy and paste the entire prompt below into Gemini 2.5 Pro with Deep Think enabled.

---

## PROMPT START

You are a senior product strategist and web architect. I need your deep analysis and strategic recommendations for building **The AI Resource Hub** — an independent, comprehensive website that aims to be the definitive resource for everything AI.

### What we've built so far

The AI Resource Hub is an Astro-based static site with a SQLite build-time database, deployed on GitHub Pages. It uses Tailwind CSS v4, React components for interactive features, and automated daily data scrapers via GitHub Actions.

**Current inventory (330+ pages):**
- **39 AI providers** with detail pages (OpenAI, Anthropic, Google, Meta, Mistral, xAI, Cohere, DeepSeek, 01.AI, NVIDIA, etc.)
- **158+ AI models** across 6 categories: LLMs (99+), image generation (18), video (17), voice/TTS (11), speech-to-text (7), music/sound (6)
- **30 AI benchmarks** with 303 model scores — covering general, coding, math, reasoning, safety, agent, domain, multilingual, and multimodal
- **6 comparison tables** (LLM, image, video, voice, speech, sound) — sortable by price, quality, speed, value
- **Head-to-Head model comparison tool** — select 2–4 models for side-by-side comparison with presets (frontier, value, budget, coding, open source)
- **Compare AI Providers page** — side-by-side provider comparison across 6 dimensions (scale, quality, pricing, open source, specialisation, trust)
- **Model Leaderboard** — ranked by quality, best value, and cheapest, with tabs
- **Coding Models Leaderboard** — specialised ranking by coding benchmark performance
- **Fastest AI Models** — speed rankings with tokens-per-second estimates
- **Cheapest AI Models** — ranked by price with free-tier and paid sections
- **Best Value AI Models** — quality-per-dollar value score rankings
- **Multimodal Models** — models supporting vision, audio, and video inputs
- **Context Window Comparison** — from 4K to 4M+ token context sizes
- **Reasoning Models** — ranked by math, logic, and reasoning benchmark performance
- **New Releases** — timeline of model releases grouped by month
- **Open Source Models directory** — all open-weight models ranked by quality
- **API Pricing Calculator** — interactive cost estimator with usage presets (light/medium/heavy/enterprise)
- **AI Pricing Trends** — price distribution, milestones, provider averages, price-vs-quality scatter chart
- **AI Industry Statistics** — comprehensive dashboard of model counts, pricing stats, provider rankings
- **AI Tools Directory** — 55 tools across 9 categories (chatbots, coding assistants, image generators, video tools, voice/audio, writing, research, developer tools, productivity)
- **AI Timeline** — 37 key events from 2012 (AlexNet) to 2026 (Opus 4.6)
- **AI News** — 814 articles imported from daily digest system (runs daily via GitHub Actions, reads markdown digest files)
- **Provider Status Dashboard** — all major AI provider status pages aggregated in one place
- **59 people profiles** with bios, roles, Twitter handles, and "notable for" descriptions
- **27 YouTube channels** across 6 categories (news, tutorials, research, coding, creative, business)
- **68 curated X/Twitter accounts** across 7 categories (leaders, researchers, news, developers, creative, safety, business)
- **35 tags** with topic, technology, use-case, capability, and architecture categories
- **AI Glossary** with plain-English definitions
- **6 educational guides** (prompting basics, advanced prompting, choosing a model, understanding pricing, AI for writing, AI for research)
- **4 blog articles** (how benchmarks work, pricing race to zero, open vs closed AI, what is an LLM)
- **Interactive "Which AI Should I Use?" quiz** — 8-question personalised model recommender
- **About page**, **Changelog**, and **Methodology page** (full transparency on scoring, data sources, and limitations)
- **Global search** across all content types
- **RSS feed, sitemap, SEO structured data**
- **Dark/light theme toggle**
- **Automated scrapers**: OpenRouter API (500+ models, 8 pricing dimensions), benchmark data, provider pricing
- **News digest system**: Reads YYYY-MM-DD-digest.md files from a News Scout tool, imports to SQLite

**Tech stack:**
- Astro v5.17.3 (static site generator)
- SQLite via better-sqlite3 (build-time database, no runtime server)
- Tailwind CSS v4 via Vite plugin
- React for interactive components (search, quiz)
- GitHub Pages deployment
- GitHub Actions for daily scraping and news import
- TypeScript throughout

### Competitive landscape (from our research)

We analysed these competitors:
1. **LLM-Stats.com** — 235+ models, animated trend charts, US vs China race, domain leaderboards (healthcare, legal, finance)
2. **Artificial Analysis** — Real-time speed data (TTFT, output speed), Intelligence Index v4.0, per-provider endpoint comparison, public API
3. **Arena.ai (LMSYS)** — 5.3M+ crowdsourced votes, human preference Elo ratings, battle mode
4. **Scale AI SEAL** — Expert-driven evaluation, SWE-Bench Pro, PropensityBench safety benchmarks, Humanity's Last Exam
5. **There's An AI For That** — 12,000+ tools directory, AI Job Impact Index, smart AI search
6. **OpenRouter** — 500+ models via single API, usage-based rankings, real adoption data

**Gaps we've already addressed:**
- ✅ Built interactive price-vs-quality scatter chart and pricing trends page
- ✅ Built Head-to-Head model comparison tool with presets
- ✅ Built methodology/transparency page with full scoring breakdown
- ✅ Built coding-specific and open-source leaderboards
- ✅ Built AI industry statistics dashboard with pricing analysis
- ✅ Built specialised leaderboards: fastest, cheapest, best value, multimodal, context window, reasoning, new releases
- ✅ Built interactive "Which AI Should I Use?" quiz
- ✅ Built Compare AI Providers page

**Remaining gaps to discuss:**
1. No real-time speed/latency data (TTFT, actual measured output speed)
2. No per-provider endpoint comparison (e.g., OpenAI via Azure vs direct)
3. Limited tool directory compared to 12,000-tool directories like TAAFT
4. No community features (voting, reviews, comments)
5. No public API for programmatic data access
6. No animated trend charts over time (only current-state visualisations)
7. No domain-specific leaderboards beyond coding (healthcare, legal, finance)
8. No newsletter/email digest system
9. No user accounts or personalisation beyond the quiz

### What I need from you

Please provide a comprehensive strategic analysis covering:

1. **Feature prioritisation**: Given what we've built and what competitors offer, what should we build next? Rank by impact and feasibility. Consider our constraint that this is a static site (no backend server), but we can use client-side JavaScript and build-time data processing.

2. **Content strategy**: What content would drive the most organic traffic and establish us as the go-to resource? Think SEO, sharing, and backlinks. What pages would rank well? What content gaps exist in the AI resource space that nobody is filling well?

3. **Data strategy**: How should we approach data accuracy, freshness, and comprehensiveness? We currently scrape OpenRouter and have manual benchmark data. What other data sources should we integrate? How can we automate more?

4. **Differentiation**: How do we stand out from LLM-Stats, Artificial Analysis, and Arena.ai? What unique angle or niche could we own? What would make someone choose us over them?

5. **Monetisation potential**: Without compromising independence or trust, what are realistic monetisation options? (We're not affiliated with any AI provider.)

6. **Technical architecture recommendations**: Given our static site constraint, what architectural decisions would scale best? Should we consider moving to Vercel/Netlify for edge functions? Should we add a real-time component?

7. **SEO and growth strategy**: What are the highest-value keywords and pages we should target? How should we structure our internal linking? What pages would get the most organic traffic?
