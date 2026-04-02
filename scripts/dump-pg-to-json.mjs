#!/usr/bin/env node
/**
 * Pre-build step: dumps all hub data from Postgres to JSON files.
 * Astro reads these JSON files at build time instead of SQLite.
 *
 * Run: node scripts/dump-pg-to-json.mjs
 * Called by: run-daily-update.ps1 before `npm run build`
 *
 * Output: data/pg-cache/*.json
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const require = createRequire('file:///W:/Agent Workspace 2/src/backend/package.json');
const { Client } = require('pg');

const PG_URL = process.env.DATABASE_URL
  || 'postgresql://atos_admin:atos_password@127.0.0.1:5432/atos_db';
const CACHE_DIR = path.join(process.cwd(), 'data', 'pg-cache');

if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

const client = new Client({ connectionString: PG_URL });
await client.connect();

const startTime = Date.now();
console.log('Dumping Postgres hub data to JSON cache...\n');

async function dump(name, query) {
  const res = await client.query(query);
  const outPath = path.join(CACHE_DIR, `${name}.json`);
  writeFileSync(outPath, JSON.stringify(res.rows, null, 2), 'utf8');
  console.log(`  ${name}: ${res.rows.length} rows`);
  return res.rows;
}

// Core data
await dump('providers', `
  SELECT * FROM hub_providers ORDER BY name
`);

await dump('models', `
  SELECT m.*, p.name AS provider_name, p.colour AS provider_colour, p.website AS provider_website
  FROM hub_models m
  JOIN hub_providers p ON m.provider_id = p.id
  ORDER BY m.quality_score DESC NULLS LAST, m.name
`);

await dump('benchmarks', `
  SELECT * FROM hub_benchmarks ORDER BY category, name
`);

await dump('benchmark_scores', `
  SELECT bs.*, m.name AS model_name, p.name AS provider_name, p.colour AS provider_colour, m.category AS model_category
  FROM hub_benchmark_scores bs
  JOIN hub_models m ON bs.model_id = m.id
  JOIN hub_providers p ON m.provider_id = p.id
  ORDER BY bs.score DESC
`);

await dump('people', `
  SELECT p.*, pr.name AS organisation_name
  FROM hub_people p
  LEFT JOIN hub_providers pr ON p.provider_id = pr.id
  ORDER BY p.name
`);

await dump('price_history', `
  SELECT ph.*, m.name AS model_name, p.name AS provider_name, p.colour AS provider_colour
  FROM hub_price_history ph
  JOIN hub_models m ON ph.model_id = m.id
  JOIN hub_providers p ON m.provider_id = p.id
  ORDER BY ph.model_id, ph.recorded_at ASC
`);

await dump('speed_history', `
  SELECT sh.*, m.name AS model_name
  FROM hub_speed_history sh
  JOIN hub_models m ON sh.model_id = m.id
  ORDER BY sh.model_id, sh.recorded_at DESC
`);

await dump('scrape_log', `
  SELECT * FROM hub_scrape_log
  ORDER BY started_at DESC
  LIMIT 100
`);

// Also dump news from the shared pipeline (not the Hub's old RSS)
await dump('news', `
  SELECT a.id, a.title, a.url, s.name AS source, a.summary,
         a.category::text, a.tags, a.importance_score,
         a.published_at, a.discovered_at
  FROM news_articles a
  JOIN news_sources s ON a.source_id = s.id
  WHERE a.deleted_at IS NULL
  ORDER BY COALESCE(a.published_at, a.discovered_at) DESC
  LIMIT 200
`);

// Creative benchmarks for cross-site data
await dump('creative_benchmarks', `
  SELECT * FROM creative_benchmarks
  ORDER BY category, meta_rank ASC NULLS LAST
`);

// Write metadata
const meta = {
  generated_at: new Date().toISOString(),
  source: 'atos_db (Postgres)',
  tables_dumped: 10,
};
writeFileSync(path.join(CACHE_DIR, '_meta.json'), JSON.stringify(meta, null, 2), 'utf8');

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s. Cache at: ${CACHE_DIR}`);

await client.end();
