# Gemini Deep Research Prompts for The AI Resource Hub

Use these prompts with Gemini's **Deep Research** mode (not Deep Think).
Deep Research browses hundreds of sites and produces multi-page reports.
Deep Think is for maths/logic problems — not what we need here.

**Tips:**
- Submit ONE prompt per session for best results.
- After submitting, **edit the research plan** before it starts — add specifics.
- Use follow-up questions to drill deeper into any section.
- Export to Google Docs for reference.

---

## Prompt 1: Content Strategy & Site Architecture

```
ROLE: Act as a senior content strategist who specialises in building high-traffic
niche resource websites that serve both technical and non-technical audiences.

OBJECTIVE: Design the complete content architecture and sitemap for
"The AI Resource Hub" (theairesourcehub.com) — an independent website that
combines AI model comparison data with beginner-friendly educational content.

CONTEXT: The site already has: LLM comparison tables (70+ models with pricing,
benchmarks, speed, quality scores), benchmark explorer, AI labs/providers
directory, and key people in AI profiles. Tech stack is Astro 5 + Tailwind CSS
+ TypeScript + SQLite. The site needs to expand dramatically to serve both
developers comparing API pricing AND non-technical users who want to learn
how to use AI effectively. Our direct competitor is llm-stats.com (500+ models,
50+ benchmarks, arenas, playground, hourly updates) — but they serve only
developers. Our advantage is accessibility.

SCOPE:
- Focus on content types achievable with a small team (1-2 people + automation)
- Include both data-driven pages (automated) and editorial content (manual)
- Consider SEO value of each content type
- Exclude features requiring real-time user accounts or payment processing (for now)

RESEARCH QUESTIONS:
1. What is the optimal sitemap and information architecture for a site that serves
   both technical (API pricing, benchmarks) and non-technical (prompt guides,
   "which AI should I use?") audiences? How do successful dual-audience sites
   handle navigation without alienating either group?
2. What content types generate the most organic search traffic for AI-related
   websites in 2025-2026? Analyse what's ranking on Google for queries like
   "best AI model," "ChatGPT vs Claude," "how to write AI prompts," "AI pricing
   comparison," and "AI tools for beginners."
3. What is the optimal content publishing cadence for each content type?
   Which pages should be auto-updated (pricing, benchmarks) vs. manually
   curated (guides, glossary) vs. evergreen (tutorials)?
4. What educational content formats work best for AI beginners? Analyse the
   approaches of Elements of AI, Google's AI Essentials, and OpenAI Academy.
   What can we adapt for a resource hub format?
5. Design a complete sitemap with all proposed pages grouped by category.
   For each page, note: content type, update frequency, automation potential,
   estimated SEO value (high/medium/low), and audience (beginner/intermediate/
   advanced/all).

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include the full sitemap as a hierarchical table
- Approximately 3,000-4,000 words
- Include source URLs for all claims and examples
```

---

## Prompt 2: Automation & Data Pipeline Strategy

```
ROLE: Act as a senior data engineer who specialises in automated content pipelines
for data-driven websites, particularly in the AI/ML industry.

OBJECTIVE: Design a comprehensive automation strategy for keeping
The AI Resource Hub's data current with minimal manual intervention —
covering new model detection, pricing updates, benchmark tracking, and
news aggregation.

CONTEXT: The site is built with Astro 5 (static site generation) and uses
SQLite as a build-time database. We already have a basic scraper infrastructure
(TypeScript/tsx scripts) that runs via GitHub Actions on a daily cron. The
database tracks 70+ LLM models with pricing, 50+ benchmark scores, 15
providers, and 20+ key people. Current scraper reads official API pricing pages.
The site is statically generated — every data update requires a rebuild and
deploy. We want to detect and add new models within 24-48 hours of launch
with minimal human involvement.

SCOPE:
- Focus on approaches achievable with GitHub Actions (free tier: 2,000 min/month)
- Consider both scraping and API-based data sources
- Include monitoring for new model announcements
- Target daily pricing updates, weekly benchmark updates
- Budget: minimal — prefer free/open-source tools

RESEARCH QUESTIONS:
1. What are the most reliable data sources for AI model pricing, and how should
   they be scraped or accessed? For each major provider (OpenAI, Anthropic, Google,
   Meta, Mistral, xAI, DeepSeek, Cohere, Amazon), document: pricing page URL,
   data format (HTML table, JSON API, PDF), update frequency, and recommended
   scraping approach.
2. How can new AI model launches be detected automatically? Analyse approaches:
   RSS feeds from provider blogs, Twitter/X API monitoring, Hugging Face model
   hub API, GitHub release monitoring, Google Alerts, and any dedicated APIs
   or webhooks that providers offer.
3. What are the best sources for benchmark data that can be programmatically
   accessed? Consider: LMSYS Chatbot Arena API, Open LLM Leaderboard API,
   SWE-bench results, LiveBench, papers with code, and individual provider
   model cards.
4. How should an automated AI news aggregation pipeline work for a small site?
   What sources should be monitored, how should articles be filtered for
   relevance, and how can summaries be generated automatically without
   violating copyright?
5. What is the optimal GitHub Actions workflow architecture for all of the above?
   Consider: job scheduling, error handling, data validation, automatic deploys
   triggered by data changes, and staying within free tier limits.

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include a table of data sources for Question 1
- Include a proposed GitHub Actions workflow diagram/description for Question 5
- Approximately 2,500-3,500 words
- Include source URLs for all APIs and data sources mentioned
```

---

## Prompt 3: SEO Strategy & Keyword Research

```
ROLE: Act as a senior SEO strategist specialising in technical niche websites
and programmatic SEO for data-driven comparison sites.

OBJECTIVE: Develop a comprehensive SEO strategy for The AI Resource Hub
(theairesourcehub.com) — covering keyword targeting, on-page optimisation,
structured data, and content strategy for organic growth.

CONTEXT: The site is an independent AI model comparison platform built with
Astro 5 (static HTML — excellent for SEO). It currently has pages for: LLM
comparison table, benchmarks, AI labs/providers, and key people in AI. We are
expanding to include: prompt guides, AI glossary, tool directory, beginner
guides, and news. The site is brand new with no domain authority yet. Target
audience: both developers comparing AI models AND non-technical users learning
about AI. UK-based but targeting global English-speaking audience.

SCOPE:
- Focus on achievable strategies for a new domain (0 DA) in 2026
- Include both quick wins and long-term plays
- Consider programmatic SEO for model/provider/benchmark pages
- Exclude paid advertising strategies

RESEARCH QUESTIONS:
1. What are the highest-value keyword clusters for an AI comparison/resource
   site in 2026? Group by intent: informational ("what is GPT-5"), comparison
   ("Claude vs ChatGPT"), transactional ("best AI for writing"), and
   navigational ("OpenAI pricing"). Include estimated search volumes where
   available.
2. What structured data (Schema.org) should be implemented for AI comparison
   tables, benchmark scores, pricing data, glossary entries, and how-to guides?
   Provide specific JSON-LD examples for each content type.
3. What programmatic SEO opportunities exist? Consider auto-generating pages
   for: each model (e.g., /models/gpt-5), each provider (e.g., /labs/openai),
   each benchmark (e.g., /benchmarks/mmlu), comparison pairs (e.g.,
   /compare/claude-vs-gpt), and category pages. What template and internal
   linking strategy works best?
4. What is the optimal meta title and description format for each page type?
   Provide templates with examples.
5. What link-building strategies work for niche technical resource sites?
   Consider: getting listed in AI tool directories, Reddit/HN community
   engagement, guest posting, data journalism (original research that gets cited),
   and resource page link building.

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include keyword cluster tables for Question 1
- Include JSON-LD code examples for Question 2
- Include meta title/description templates for Question 4
- Approximately 3,000-4,000 words
- Include source URLs
```

---

## Prompt 4: Newsletter & Audience Growth Strategy

```
ROLE: Act as a digital marketing strategist specialising in newsletter growth,
audience building, and retention for niche content websites.

OBJECTIVE: Design a newsletter and audience growth strategy for The AI Resource
Hub (theairesourcehub.com) — including format, content, technology stack,
category-based personalisation, and growth tactics.

CONTEXT: The AI Resource Hub is a new AI comparison and education website.
We want to launch a newsletter that lets subscribers choose categories they
care about (e.g., "AI News for Beginners," "Model Pricing Updates," "Prompt
Tips," "Industry Analysis") and only receive content matching their interests.
The owner also runs koltregaskes.com which has an existing news system. The
site is built with Astro 5 (static generation). Budget is minimal — prefer
free or very low-cost tools. The audience will range from complete AI beginners
to developers and power users.

SCOPE:
- Focus on tools/platforms available in 2026 with free or cheap tiers
- Include both email newsletter and on-site engagement strategies
- Consider automation for content curation
- Exclude social media advertising

RESEARCH QUESTIONS:
1. What is the best newsletter platform for a category-based subscription model
   where users choose their topics? Compare: Buttondown, Beehiiv, Substack,
   ConvertKit, Mailchimp, and Resend. Evaluate on: free tier limits, category/tag
   support, API access, custom domain support, and pricing at 1K/5K/10K subscribers.
2. What newsletter format and cadence works best for AI content? Analyse the
   formats used by The Rundown AI (2M subs), Superhuman AI (1M subs), TLDR AI
   (500K subs), and Ben's Bites (120K subs). What length, sections, and tone
   drive the highest open and click rates?
3. What are the most effective free/low-cost growth tactics for newsletters in
   the AI niche? Consider: cross-promotion networks, referral programs (like
   Beehiiv's), Reddit/community engagement, lead magnets (free guides, checklists),
   and website-to-newsletter conversion optimisation.
4. How should the category system work? What categories should be offered, how
   granular should they be, and how does personalisation affect open rates and
   churn? Include examples from newsletters that successfully offer topic filtering.
5. What automated content curation approaches work for newsletter content?
   How can AI model pricing changes, new model launches, and trending AI news
   be automatically compiled into newsletter drafts?

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include a comparison table for newsletter platforms (Question 1)
- Include recommended category structure (Question 4)
- Approximately 2,500-3,500 words
- Include source URLs
```

---

## Prompt 5: Monetisation & Revenue Strategy

```
ROLE: Act as a digital business strategist with experience in affiliate marketing
and content monetisation for niche technical websites.

OBJECTIVE: Design a monetisation strategy for The AI Resource Hub
(theairesourcehub.com) that generates revenue without compromising editorial
independence or user experience.

CONTEXT: The site is a free, public AI comparison and education resource.
Current plan includes affiliate links to AI platforms. The site tracks 70+
LLM models with pricing across 15 providers. Traffic will initially be low
(launching 2026) but the niche is high-intent — people comparing AI pricing
are often about to make purchasing decisions. The site is UK-based but serves
a global audience. We want multiple revenue streams beyond just affiliate links.

SCOPE:
- Focus on strategies achievable from day one (low traffic) through to scale
- Include both affiliate and non-affiliate revenue streams
- Consider ethical implications — maintaining trust is paramount
- Exclude strategies requiring significant upfront investment

RESEARCH QUESTIONS:
1. Which AI platforms and tools offer affiliate or referral programmes as of
   2026? For each, document: company, programme name, commission structure,
   cookie duration, minimum payout, and sign-up URL. Cover: OpenAI, Anthropic,
   Google, AWS/Amazon, Mistral, Cohere, Together AI, Fireworks AI, Replicate,
   and major AI tool companies (Jasper, Copy.ai, Midjourney, etc.).
2. What non-affiliate revenue models work for niche comparison sites at various
   traffic levels? Analyse: sponsored/featured listings, premium data access,
   API licensing, display advertising (Mediavine, Raptive thresholds), newsletter
   sponsorship, consulting/reports, and community memberships.
3. What are realistic revenue benchmarks for an AI comparison site? What RPM
   (revenue per 1,000 pageviews) can be expected from affiliate links vs.
   display ads vs. sponsored content in the AI niche?
4. How do successful comparison sites (NerdWallet, PCMag, G2, Capterra)
   balance monetisation with editorial trust? What disclosure practices,
   review methodologies, and separation of commercial/editorial content
   do they use?
5. Design a phased monetisation roadmap: Phase 1 (0-1K monthly visitors),
   Phase 2 (1K-10K), Phase 3 (10K-50K), Phase 4 (50K+). What revenue
   streams should be activated at each phase?

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include an affiliate programme comparison table for Question 1
- Include the phased roadmap as a structured table for Question 5
- Approximately 2,500-3,500 words
- Include source URLs for all programme details and benchmarks
```

---

## Prompt 6: Beginner-Friendly AI Education Content Plan

```
ROLE: Act as an educational content designer specialising in making complex
technology topics accessible to non-technical audiences, with experience in
AI literacy programmes.

OBJECTIVE: Design the complete educational content plan for The AI Resource Hub —
covering prompt guides, glossary, beginner tutorials, and interactive tools
that help everyday people understand and use AI effectively.

CONTEXT: The AI Resource Hub (theairesourcehub.com) is expanding beyond model
comparison tables to become a comprehensive resource for everyone. Research
shows major gaps in the market: no one does a good job serving true beginners.
Most AI resource sites are built for developers. Our opportunity is to be the
"llm-stats.com for everyone" — same depth of data, but with an accessibility
layer that serves beginners through to power users. The site uses a dark
theme with electric blue accent, built with Astro 5. We want content that
is practical, jargon-free, and immediately useful.

SCOPE:
- Focus on content that can be created once and updated periodically
- Prioritise content that ranks well in search (SEO value)
- Include interactive elements where they add genuine value
- Target audience: people aged 25-65 who use technology daily but have no
  programming background

RESEARCH QUESTIONS:
1. What are the most-searched AI questions by non-technical users in 2025-2026?
   Analyse Google autocomplete, People Also Ask, and forum posts (Reddit
   r/ChatGPT, r/artificial, Quora) to identify the top 30 questions that
   beginners ask about AI. Group them by theme.
2. Design a "Prompt Guide" curriculum: what topics should be covered, in what
   order, and at what depth? Include: basic prompting, role-based prompting,
   chain-of-thought, using AI for specific tasks (writing, research, analysis,
   creative work), and common mistakes. For each topic, suggest the format
   (article, interactive demo, video, before/after examples).
3. What AI terms need glossary entries, and how should they be explained?
   Provide a list of 40-50 essential terms with suggested plain-English
   definitions and real-world analogies. Prioritise terms that appear in
   consumer-facing AI products.
4. Design a "Which AI Should I Use?" recommendation framework. What questions
   should the quiz ask? What decision tree or scoring system maps user needs
   to specific AI products (ChatGPT, Claude, Gemini, Copilot, Perplexity, etc.)?
   Consider: use case, budget, privacy needs, device/ecosystem, and skill level.
5. What interactive tools would provide the most value? Evaluate: token counter/
   context window visualiser, prompt improver, AI cost calculator, side-by-side
   output comparison, and "Can AI Do This?" search. For each, assess: user value,
   build complexity, and SEO potential.

OUTPUT FORMAT:
- Structured report with sections matching each question
- Include the top 30 beginner questions as a table (Question 1)
- Include the prompt guide curriculum as a structured outline (Question 2)
- Include glossary terms with definitions (Question 3)
- Include quiz question framework (Question 4)
- Approximately 4,000-5,000 words
- Include source URLs
```

---

## Usage Notes

### Recommended Order
1. **Prompt 1** (Content Strategy) — establishes the overall architecture
2. **Prompt 6** (Education Content) — fills out the beginner side
3. **Prompt 3** (SEO) — optimises everything for discovery
4. **Prompt 2** (Automation) — keeps it all running without manual work
5. **Prompt 4** (Newsletter) — builds the audience
6. **Prompt 5** (Monetisation) — turns traffic into revenue

### After Each Report
- Export to Google Docs
- Use follow-ups to drill into specific sections
- Start a fresh session for each new prompt (don't chain them)

### Using Deep Think (Not Deep Research)
Save Deep Think mode for specific technical problems like:
- "Design an algorithm that calculates a 'value score' from quality, price, speed, and context window, normalised across different scales"
- "Optimise this SQLite schema for querying 500+ models across 50 benchmarks with price history"
- "Design a weighted scoring system for the 'Which AI Should I Use?' quiz"
