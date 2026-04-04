# Postgres Migration Status

## Short answer

There is **no strategic reason** to keep AI Resource Hub on SQLite long term.

The reason it still exists is practical:

- the existing frontend query layer was originally built around SQLite
- the Postgres migration has already started, but it is not yet wired through
- the safest end state for this site is:

Postgres -> pre-build JSON cache -> Astro static build

not:

SQLite forever

and not:

Astro pages making live Postgres calls at request time

## Current State

### Already present

- `src/db/pg-pool.ts`
  - Postgres connection pool
- `scripts/dump-pg-to-json.mjs`
  - dumps hub data from Postgres into `data/pg-cache/*.json`
- `src/db/pg-cache.ts`
  - synchronous cache reader designed to replace SQLite reads during builds

### Not yet wired through

- `src/db/queries.ts` still reads SQLite
- `src/db/schema.ts` still initializes SQLite
- pages and search/indexing still depend on the SQLite-backed query path
- scrapers are still mixed between SQLite-first and Postgres-in-progress paths

## Recommendation

### Canonical source

Use Postgres as the source of truth for:

- providers
- models
- benchmarks
- benchmark scores
- people
- jobs
- events
- reports
- scrape logs

### Build-time source

Use the JSON cache generated from Postgres as the source for Astro builds.

This keeps the site:

- static-friendly
- fast to build
- independent of live DB availability during page generation

### What to remove

Once the Postgres cache path is fully working, SQLite should be removed from:

- frontend reads
- build-time query logic
- any duplicated data-writing paths that only exist for the local file DB

## Why not live Postgres inside Astro?

Because this site behaves like a static reference desk.
Build-time cache files are a better fit than live database reads for every page generation step.

That also makes local automation simpler:

1. refresh Postgres
2. dump JSON cache
3. build static site

## Immediate next steps

1. Finish the Postgres dump coverage for all hub data needed by the frontend.
2. Switch query consumers from `queries.ts` / SQLite to `pg-cache.ts` equivalents.
3. Verify the static build still works with cache-backed reads.
4. Remove SQLite-only frontend dependencies after parity is confirmed.
