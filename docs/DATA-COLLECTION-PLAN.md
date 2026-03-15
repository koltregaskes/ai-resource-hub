# GitHub And Data Collection Plan

This file is the plain-English operations guide for The AI Resource Hub.

## What GitHub Is Doing

The repository already has two GitHub Actions workflows:

- `deploy.yml` publishes the site to GitHub Pages whenever `main` changes.
- `scrape.yml` can refresh tracked data manually from the Actions tab if needed.

## Starting Schedule

To keep the setup simple, the main update pipeline should run once per day to begin with.

Recommended starting time:

- `07:00` local machine time every day on the Windows mini PC

Once the pipeline is stable, it can be moved to twice daily without changing the overall approach.

## Data We Need

These are the main data groups the site is already designed to handle:

1. Pricing and model metadata
   - Model names
   - Providers
   - Input and output prices
   - Context windows
   - Release dates
   - Availability and modality

2. Benchmark and quality data
   - Public benchmark scores
   - Human preference or arena-style ratings
   - Coding, reasoning, multimodal, and domain benchmarks

3. Speed and latency data
   - Tokens per second
   - Time to first token
   - Endpoint-by-endpoint performance where available

4. News and editorial updates
   - Curated news digests
   - Major model launches
   - Benchmark changes
   - Price cuts or new plans

## Recommended Sources

Use the safest source available in this order:

1. Official APIs
2. Official pricing or model documentation pages
3. Well-known public datasets or public benchmark pages
4. Manual research for anything that is blocked, paywalled, or login-only

Current repo setup already points at sources such as:

- OpenRouter for broad model and pricing coverage
- Official provider pages for pricing cross-checks
- Artificial Analysis for speed and some benchmark coverage
- Public arena or benchmark pages for leaderboard-style results
- Manually prepared markdown digests for news

## How To Gather Data Without TOS Problems

Follow these rules:

- Prefer official APIs over scraping HTML whenever an API exists.
- Keep request volume low. Daily collection is safer than aggressive polling.
- Respect robots.txt, site terms, and rate limits.
- Do not automate sites that require login unless their terms clearly allow it.
- Do not scrape X, private dashboards, or paywalled sources automatically.
- Store source URLs and update timestamps so every public claim can be traced.
- Treat manual review as the fallback when a source is legally or technically sensitive.

## Recommended Cron Jobs

Start with this small set:

1. Daily scrape and refresh
   - Runs the pricing, benchmark, and speed refresh pipeline
   - Updates the SQLite data used for the site

2. Daily staleness check
   - Confirms the latest scrape produced believable data
   - Flags empty scores, stale pricing, and missing source attribution

3. Weekly digest generation
   - Optional for now
   - Generates a newsletter or summary page from the latest data

In the current setup, the Windows machine is the primary scheduler and GitHub Actions is the manual fallback.

## GitHub Setup Checklist

If you want the repo to run cleanly on GitHub Pages, these are the steps:

1. Push the repository to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. In `Settings` -> `Secrets and variables` -> `Actions`, add these secrets if you want fuller data coverage:
   - `AA_API_KEY`
   - `TOGETHER_API_KEY`
   - `GOOGLE_API_KEY`
   - `GROQ_API_KEY`
5. Open the `Actions` tab and run the scrape workflow manually only if the local scheduler fails or you want an on-demand refresh.
6. Confirm that Pages deploys successfully after local or manual updates are pushed.

## Important Note About News Digests

The current `/news/` page reads the markdown files in `news-digests/` directly during the site build.

That means `news-digests/` should stay in the repository for now. If you later switch the news page to read from the SQLite database instead, those source files can become private operational inputs instead of public repo content.
