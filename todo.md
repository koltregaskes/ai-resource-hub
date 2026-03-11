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

---

## Notes

- X/Twitter blocks automated fetching (403), so posts must be reviewed manually
- When adding new benchmarks, update both `scripts/seed-db.ts` (benchmark definitions) and `scripts/scrapers/benchmarks.ts` (if scores can be scraped)
