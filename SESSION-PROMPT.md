# ai-resource-hub — Session Handoff Prompt

Use the prompt below to start a new Claude Code session pointed at this repo.

---

This is a brand new, empty repo. The only file is README.md with a one-line description: "AI Resource Hub - Curated collection of AI tools, resources, and references."

The AI Resource Hub is planned to be a public-facing website tracking AI models, pricing, benchmarks, and value rankings — the go-to independent resource for AI model comparison. Think of it as an independent alternative to sites like Artificial Analysis but with a focus on practical value for money.

There is a detailed Gemini Deep Think prompt at W:\Agent Workspace 2\prompts\14-ai-resource-hub.md that covers the complete architecture, design system, data pipeline, page designs, and revenue model. READ THIS FIRST — it is the bible for this project. No response has been generated for it yet.

Planned tech stack (from Prompt 14):
- Framework: Astro 5 (static generation + React islands for interactive components)
- Styling: Tailwind CSS v4 with @theme directive
- Charts: Chart.js or Recharts for trend visualisation
- Data format: CSV source compiled to JSON at build time
- Data pipeline: Python scraper (weekly cron via GitHub Actions)
- Deployment: Vercel (free tier) or GitHub Pages
- Design: Dark data-focused theme (#0a0a0f background, #3b82f6 electric blue accent)
- Typography: Inter for headings, Inter for body

Key pages planned:
- Homepage with model leaderboard overview
- LLM comparison table (sortable by price, speed, quality, value)
- Image model comparison
- Video model comparison
- Audio/music model comparison
- Individual model detail pages
- Pricing calculator
- Benchmark explorer
- News/changelog feed

Revenue model: Tasteful affiliate links to AI platforms (referral tracking without compromising UX).

Your tasks for this session, in priority order:

1. READ PROMPT 14 — Read W:\Agent Workspace 2\prompts\14-ai-resource-hub.md thoroughly. This is your specification.

2. PROJECT SCAFFOLDING — Initialise the Astro 5 project with Tailwind CSS v4. Set up the basic project structure, theme configuration, and layout components. Get the dev server running.

3. HOMEPAGE — Build a basic homepage with the design tokens from Prompt 14. Should include a hero section explaining what the site is, and placeholder sections for where the model tables will go.

4. DATA STRUCTURE — Design the CSV/JSON schema for AI model data. Create sample data files with a few models (GPT-4o, Claude Sonnet 4, Gemini 2.5 Pro, Llama 4, etc.) to test the table rendering.

5. LLM COMPARISON TABLE — Build the first interactive comparison table for LLMs. Sortable columns: model name, provider, input price, output price, context window, speed, quality score, value score.

Rules:
- UK English always
- Dark mode only — data-focused, clean aesthetic
- Electric blue accent (#3b82f6)
- Performance first — tables may have 100+ rows
- Mobile-responsive — tables need horizontal scroll or card view on mobile
- Accessible — proper table markup, keyboard navigation
- SEO — structured data for comparison content
- No fake data — use real, current model pricing and specs
- Astro 5 + Tailwind CSS v4 + TypeScript
- Test locally before committing
- Commit and push when done
