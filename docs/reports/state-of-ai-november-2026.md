# State of AI, November 2026: delivery record

Home: https://github.com/koltregaskes/rooms-os-hub/issues/46
Cut-off: 14 November 2026. PR only, no merge or deployment.

Draft discovery: GitHub code search for "state of ai" across ai-resource-hub, archived rooms-os-core and content-social returned no results. Recursive default-branch tree searches in core and content-social found no matching draft filenames. Local AIRH content search found research references, not a report draft. Hub issue search and #46 comments identify the failed old thread but contain no draft. This does not establish that no private or non-default-branch draft exists.

Build boundary: W:\Websites\AGENTS.md is unavailable because W: is not mounted on this laptop. Repository README, AGENTS.md and DATA-COLLECTION-PLAN.md were read.

Implementation: dedicated data and source ledger; reusable accessible chart component; draft page excluded from default build, navigation, search and sitemaps. No provider leaderboard data is used.

## Review and reproduction

- Read the report in `src/reports/StateOfAI2026.astro`.
- Chart data: `src/data/reports/november-2026-charts.json` (two charts, values and caveats).
- Source ledger: `src/data/reports/november-2026-sources.json` (21 distinct URLs, checked 14 November). AP's filing story was checked through its indexed article text; direct fetch failed. No claim is made that its underlying filing was audited here.
- `node scripts/validate-state-of-ai-report.mjs` regenerates the source ledger and checks chart transcription, finite values, excluded source URLs and em dashes.
- Normal builds produce no report route. For local editorial review only, set `AIRH_REPORT_DRAFT=1` and run `npm run build`, then inspect `/drafts/state-of-ai-november-2026/`. This opt-in is not added to any workflow.
- The route has noindex/nofollow/noarchive, is excluded from sitemap generation, and is not added to navigation, search, report indexes or RSS. Noindex is not access control; the default-build exclusion is the publication boundary.
- Focused Astro check of the three added Astro files: zero errors, warnings or hints. Full-repository `npm run check` failed on existing unrelated files as well as an import naming conflict in the initial draft, which was fixed and rechecked. Existing script/worker errors include nullable release dates and a missing newsletter database dependency.
- Rendered with headless Edge at 1280x900 and 390x844. Both show the title, two chart tables, no horizontal overflow and the expected robots metadata. Mobile full-page result inspected. A low-contrast default chart link was corrected.
- Humaniser pass: UK English, no em dashes, no invented rankings, clear attribution and date caveats, no promised productivity or speculative release dates. Editorial analysis is labelled. AI assistance is disclosed; independent human review is not claimed.
- Locked dependencies installed with scripts disabled. This host uses Node 26; npm warned that better-sqlite3's supported engine list ends at Node 25. No database migration or native-addon rebuild was performed.

Launch requires separate approval and a fresh source check after this report's 14 November cut-off. PR-only instruction remains in force.

Final build evidence: normal build completed with 658 pages and no draft output; isolated opt-in build completed with 659 pages, including the report. Neither sitemap contains `/drafts/`. Final opt-in HTML was rendered again at both viewport sizes after the chart-link correction, with two tables, expected robots metadata and no overflow. Both builds completed; the initial overlapping-output build was discarded and is not counted as a pass.
