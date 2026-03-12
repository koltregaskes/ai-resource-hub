# The AI Resource Hub — TODO

Tasks that require manual action or follow-up outside of automated tooling.

---

## Pending Research

### Benchmark lists from X/Twitter post
- **URL:** https://x.com/i/status/2031135590113321234
- **What:** Comments on this post contain lists of benchmarks we should add to the website
- **Action:** Log into X, read the post and all replies/comments, extract benchmark names and details, then add them to the benchmarks table in seed-db.ts
- **Added:** 2026-03-11
- **Status:** Pending

### New CLI tool announcement from X/Twitter
- **URL:** https://x.com/i/status/2032113487510716717
- **What:** New AI coding CLI tool announced. Need to identify it and add to our cli_tools table.
- **Action:** Log into X, read the post, identify the tool name/maker/features, then add to seed-db.ts cli_tools section
- **Added:** 2026-03-12
- **Status:** Pending

---

## Notes

- X/Twitter blocks automated fetching (403), so posts must be reviewed manually
- When adding new benchmarks, update both `scripts/seed-db.ts` (benchmark definitions) and `scripts/scrapers/benchmarks.ts` (if scores can be scraped)
