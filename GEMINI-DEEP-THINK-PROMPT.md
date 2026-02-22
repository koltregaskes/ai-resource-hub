# Gemini Deep Think Prompt: The AI Resource Hub

Copy and paste the entire prompt below into Gemini 2.5 Pro with Deep Think enabled.

---

## PROMPT START

You are a senior product strategist and web architect. I need your deep analysis and strategic recommendations for building **The AI Resource Hub** — an independent, comprehensive website that aims to be the definitive resource for everything AI.

### What we've built so far

The AI Resource Hub is an Astro-based static site with a SQLite build-time database, deployed on GitHub Pages. It uses Tailwind CSS v4, React components for interactive features, and automated daily data scrapers via GitHub Actions.

**Current inventory (254 pages):**
- **34 AI providers** with detail pages (OpenAI, Anthropic, Google, Meta, Mistral, xAI, Cohere, etc.)
- **129 AI models** across 6 categories: LLMs (70), image generation (18), video (17), voice/TTS (11), speech-to-text (7), music/sound (6)
- **30 AI benchmarks** with 171 model scores — covering general, coding, math, reasoning, safety, agent, domain, multilingual, and multimodal
- **6 comparison tables** (LLM, image, video, voice, speech, sound) — sortable by price, quality, speed, value
- **AI Model Leaderboard** — ranked by quality, best value, and cheapest, with tabs
- **API Pricing Calculator** — interactive cost estimator with usage presets (light/medium/heavy/enterprise)
- **AI Tools Directory** — 55 tools across 9 categories (chatbots, coding assistants, image generators, video tools, voice/audio, writing, research, developer tools, productivity)
- **AI Timeline** — 37 key events from 2012 (AlexNet) to 2026 (Opus 4.6)
- **AI News** — 814 articles imported from daily digest system (runs daily via GitHub Actions, reads markdown digest files)
- **Provider Status Dashboard** — all major AI provider status pages aggregated in one place
- **31 people profiles** with bios, roles, Twitter handles, and "notable for" descriptions
- **27 YouTube channels** across 6 categories (news, tutorials, research, coding, creative, business)
- **68 curated X/Twitter accounts** across 7 categories (leaders, researchers, news, developers, creative, safety, business)
- **28 tags** with 95 tag assignments (topic, technology, use-case, capability)
- **AI Glossary** with plain-English definitions
- **6 educational guides** (prompting basics, advanced prompting, choosing a model, understanding pricing, AI for writing, AI for research)
- **4 blog articles** (how benchmarks work, pricing race to zero, open vs closed AI, what is an LLM)
- **Interactive quiz** — "Which AI Should I Use?"
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

**Key gaps we've identified:**
1. No interactive data visualizations/charts (price trends, scatter plots)
2. No side-by-side model comparison tool
3. No methodology/transparency page explaining our scoring
4. No specialized domain leaderboards (coding-specific, open-source-only)
5. No speed/latency data beyond a single integer
6. No per-provider endpoint comparison
7. Limited compared to 12,000-tool directories
8. No community features (voting, reviews)
9. No public API for programmatic data access
10. No AI trends/market analysis page

### What I need from you

Please provide a comprehensive strategic analysis covering:

1. **Feature prioritisation**: Given what we've built and what competitors offer, what should we build next? Rank by impact and feasibility. Consider our constraint that this is a static site (no backend server), but we can use client-side JavaScript and build-time data processing.

2. **Content strategy**: What content would drive the most organic traffic and establish us as the go-to resource? Think SEO, sharing, and backlinks. What pages would rank well? What content gaps exist in the AI resource space that nobody is filling well?

3. **Data strategy**: How should we approach data accuracy, freshness, and comprehensiveness? We currently scrape OpenRouter and have manual benchmark data. What other data sources should we integrate? How can we automate more?

4. **Differentiation**: How do we stand out from LLM-Stats, Artificial Analysis, and Arena.ai? What unique angle or niche could we own? What would make someone choose us over them?

5. **Monetisation potential**: Without compromising independence or trust, what are realistic monetisation options? (We're not affiliated with any AI provider.)

6. **Technical architecture recommendations**: Given our static site constraint, what architectural decisions would scale best? Should we consider moving to Vercel/Netlify for edge functions? Should we add a real-time component?

7. **SEO and growth strategy**: What are the highest-value keywords and pages we should target? How should we structure our internal linking? What pages would get the most organic traffic?

8. **Community building**: How could we build an engaged audience around this resource? Newsletter, Discord, social media strategy?

9. **Missing features only we could do well**: Based on our unique position (comprehensive multi-category coverage, not a tool vendor, not a cloud provider), what features would we uniquely excel at?

10. **90-day roadmap**: Give us a concrete 90-day plan with weekly milestones. What should we ship first, second, third?

Please be specific, actionable, and opinionated. I want a strategic vision, not a generic list. Think about what would make this THE definitive AI resource hub that everyone in the AI industry bookmarks.

## PROMPT END
