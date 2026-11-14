# AI and jobs: first evidence release

Implements the reviewed v0.3 model from PR #106. Only Indeed Hiring Lab's `AI_posting.csv` is admitted. Its pinned README and dataset-specific CC BY 4.0 licence were read first-hand on 14 November 2026. Exact source commit, vintage, retrieval date, raw SHA-256, method version, population and evidence kind are retained. No secrets, company-person records or personal data are collected.

The page shows selected daily snapshots: the latest observation in each country, plus the same date a year earlier when available. Each is already a seven-day trailing average, not a monthly average. Keyword demand on Indeed is not employment impact. No uncertainty is published by this source; that does not remove coverage or classification error.

Eight tables implement the method's entities (the method groups studies/results under one heading). `scripts/schema/ai-and-jobs.sql` supplies SQLite constraints and immutable-observation/version triggers. The static page consumes committed, validated JSON directly, consistent with the site's current JSON-cache build; it does not require a live database. The schema import is tested in memory with Python's SQLite.

## Refresh

Source cadence: monthly (30 days). A read-only GitHub workflow checks weekly, Mondays at 06:30 UTC, compares the source's README and licence to the reviewed revision, and freezes a candidate artefact. Terms or method changes stop collection for review. An agent reviews and submits the candidate through the normal PR pipeline; nothing pushes or deploys automatically. This runs on GitHub Actions, not the Gaming Laptop.

`python scripts/collect-jobs-indeed.py CSV COMMIT SOURCE_RELEASE RETRIEVED NEW_OUTPUT [PREVIOUS_SNAPSHOT]` is the offline importer. New paths use exclusive creation; previous observations and method versions are preserved. `node scripts/validate-ai-and-jobs.mjs` compares successive snapshots, rejects changed history, checks rights and uncertainty, and warns on stale source vintages. Re-fetching old data cannot reset its source release date.

Staleness uses source vintage plus cadence and half that cadence. It is calculated at build time and refreshed in the browser, including for a static page left deployed between builds. Series publication checks fail closed on uncertain rights, unchecked uncertainty, duplicate vintages, ambiguous method versions or unsupported evidence kinds. No lines join observations across method versions; the launch graphic is a labelled country comparison.

ONS, BLS, Anthropic and other listed sources are not yet admitted. They need exact-series rights, definitions and uncertainty extraction before any numbers are shown. Studies, exposure, company claims and projections are explicitly empty; no economy-wide impact claims are made. PR #111's bench fixtures are synthetic and provide no employment evidence; they are not imported here.

The unavailable W:\Websites\AGENTS.md could not be read. Work used an isolated local scratch checkout; no NAS writes were attempted.

## Signed second-agent review

Codex reviewer `review_standings`, T3 Gaming-Laptop: approved for PR review after verifying weekly refresh scheduling, CI evidence checks and immutable refresh history. Eight validator tests and the SQLite/repeated-fetch/new-vintage integration checks passed. The Indeed figures are appropriately sourced and labelled. Final build and rendered checks are required before merge.
