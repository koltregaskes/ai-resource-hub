#!/usr/bin/env node
/**
 * Build the public JSON cache used by Astro.
 *
 * Source-of-truth rules:
 * - Core hub data comes from the local SQLite database that scrapers update.
 * - Shared/postgres data is used only for genuinely shared datasets such as
 *   routed news, AGI tracker tables, creative benchmarks, reports, and events.
 * - If shared Postgres is unavailable, existing shared cache files are preserved.
 */
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

let Client = null;
try {
  ({ Client } = require('pg'));
} catch {
  Client = null;
}

const repoRoot = process.cwd();
const estateRoot = path.resolve(repoRoot, '..', '..');
const legacyDbPath = path.join(repoRoot, 'data', 'the-ai-resource-hub.db');
const localDbDir = path.join(repoRoot, '.local', 'data');
const localDbPath = path.join(localDbDir, 'the-ai-resource-hub.db');
const cacheDir = path.join(repoRoot, 'data', 'pg-cache');
const siteFiltersPath = path.join(
  estateRoot,
  'shared',
  'website-tools',
  'pipelines',
  'news',
  'site-filters.json',
);

const PG_URL = process.env.DATABASE_URL || 'postgresql://atos_admin:atos_password@127.0.0.1:5432/atos_db';

if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

function resolveLocalSqlitePath() {
  mkdirSync(localDbDir, { recursive: true });

  if (existsSync(legacyDbPath) && !existsSync(localDbPath)) {
    moveSidecarFile(legacyDbPath, localDbPath);
    moveSidecarFile(`${legacyDbPath}-wal`, `${localDbPath}-wal`);
    moveSidecarFile(`${legacyDbPath}-shm`, `${localDbPath}-shm`);
  }

  return localDbPath;
}

function moveSidecarFile(sourcePath, destinationPath) {
  if (!existsSync(sourcePath)) return;
  require('fs').renameSync(sourcePath, destinationPath);
}

const dbPath = resolveLocalSqlitePath();

const sqlite = new Database(dbPath, { readonly: true });
sqlite.pragma('foreign_keys = ON');
const providerColumns = new Set(sqlite.prepare('PRAGMA table_info(providers)').all().map((row) => row.name));

const blockedNewsSources = new Set([
  'CoinDesk',
  'CoinTelegraph',
  'Canon Rumors',
  'Digital Camera World',
  'DPReview',
  'PetaPixel',
  'Fstoppers',
  'Fuji Rumors',
  'Nikon Rumors',
  'Sony Alpha Rumors',
  'The Block',
  'The Phoblographer',
  'Decrypt',
]);

const blockedNewsUrlPatterns = [
  /coindesk\.com/i,
  /cointelegraph\.com/i,
  /decrypt\.co/i,
  /theblock\.co/i,
  /canonrumors\.com/i,
  /dpreview\.com/i,
  /petapixel\.com/i,
  /fstoppers\.com/i,
  /fujirumors\.com/i,
  /nikonrumors\.com/i,
  /sonyalpharumors\.com/i,
  /digitalcameraworld\.com/i,
  /thephoblographer\.com/i,
  /bhphotovideo\.com/i,
];

const blockedNewsKeywords = /\b(bitcoin|crypto|cryptocurrency|ethereum|solana|nft|camera|cameras|photography|photographer|photographers|lens|lenses|mirrorless|wildlife photography|album cover)\b/i;

function writeRows(name, rows) {
  const outPath = path.join(cacheDir, `${name}.json`);
  writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`  ${name}: ${rows.length} rows`);
  return rows;
}

function preserveOrWriteEmpty(name) {
  const outPath = path.join(cacheDir, `${name}.json`);
  if (existsSync(outPath)) {
    const rows = JSON.parse(readFileSync(outPath, 'utf8'));
    console.log(`  ${name}: preserved ${Array.isArray(rows) ? rows.length : 0} existing rows`);
    return Array.isArray(rows) ? rows : [];
  }
  writeRows(name, []);
  return [];
}

function readJsonRows(raw, sourceLabel) {
  try {
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn(`  Failed to parse existing ${sourceLabel}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

function loadTrackedCacheRows(name) {
  const relativePath = `data/pg-cache/${name}.json`;

  try {
    const raw = execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return readJsonRows(raw, `${name} cache from git HEAD`);
  } catch {
    return [];
  }
}

function loadExistingCacheRows(name) {
  const outPath = path.join(cacheDir, `${name}.json`);
  const rows = [];

  if (existsSync(outPath)) {
    rows.push(...readJsonRows(readFileSync(outPath, 'utf8'), `${name} cache file`));
  }

  rows.push(...loadTrackedCacheRows(name));
  return rows;
}

function mergeHistoricalRows(name, newRows, keyForRow, sortRows) {
  const merged = new Map();

  for (const row of loadExistingCacheRows(name)) {
    merged.set(keyForRow(row), row);
  }

  for (const row of newRows) {
    merged.set(keyForRow(row), row);
  }

  return writeRows(name, Array.from(merged.values()).sort(sortRows));
}

function dumpSqlite(name, query, params = []) {
  try {
    const rows = sqlite.prepare(query).all(...params);
    return writeRows(name, rows);
  } catch (error) {
    console.warn(`  Failed to dump ${name} from SQLite: ${error instanceof Error ? error.message : String(error)}`);
    return preserveOrWriteEmpty(name);
  }
}

function loadSiteFilter() {
  if (!existsSync(siteFiltersPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(siteFiltersPath, 'utf8'));
    return raw?.sites?.['ai-resource-hub'] ?? null;
  } catch {
    return null;
  }
}

function toTagArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1).split(',').map((item) => item.replace(/^"+|"+$/g, '').trim()).filter(Boolean);
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed).map((item) => String(item).trim()).filter(Boolean);
      } catch {
        return [];
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function looksLikeBlockedNews(article) {
  if (blockedNewsSources.has(article.source)) return true;
  if (blockedNewsUrlPatterns.some((pattern) => pattern.test(article.url || ''))) return true;
  const haystack = `${article.title || ''} ${article.summary || ''} ${article.source || ''} ${article.url || ''}`;
  return blockedNewsKeywords.test(haystack);
}

function filterSharedNews(rows) {
  const siteFilter = loadSiteFilter();
  if (!siteFilter) return rows.filter((row) => !looksLikeBlockedNews(row));

  const includeTags = new Set(siteFilter.include_tags ?? []);
  const excludeTags = new Set(siteFilter.exclude_tags ?? []);
  const minImportance = Number(siteFilter.min_importance_score ?? 0);

  return rows.filter((row) => {
    const tags = toTagArray(row.tags);
    const importance = Number(row.importance_score ?? 0);
    if (importance < minImportance) return false;
    if (looksLikeBlockedNews(row)) return false;
    if (tags.some((tag) => excludeTags.has(tag))) return false;
    if (includeTags.size > 0 && !tags.some((tag) => includeTags.has(tag))) return false;
    return true;
  });
}

async function connectPostgres() {
  if (!Client) return null;
  try {
    const client = new Client({ connectionString: PG_URL });
    await client.connect();
    return client;
  } catch (error) {
    console.warn(`  Shared Postgres unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function dumpPostgres(client, name, query, transform = (rows) => rows) {
  if (!client) return preserveOrWriteEmpty(name);

  try {
    const res = await client.query(query);
    const rows = transform(res.rows);
    return writeRows(name, rows);
  } catch (error) {
    console.warn(`  Failed to dump ${name} from shared Postgres: ${error instanceof Error ? error.message : String(error)}`);
    return preserveOrWriteEmpty(name);
  }
}

const startTime = Date.now();
console.log('Building JSON cache from local hub data and shared datasets...\n');

// Core hub tables from local SQLite
dumpSqlite('providers', `
  SELECT
    id,
    name,
    colour,
    website,
    ${providerColumns.has('status_url') ? 'status_url' : 'NULL AS status_url'},
    ${providerColumns.has('api_docs_url') ? 'api_docs_url' : 'NULL AS api_docs_url'},
    description,
    founded,
    headquarters,
    ceo,
    funding,
    updated_at
  FROM providers
  ORDER BY name
`);
dumpSqlite('models', `
  SELECT
    m.*,
    p.name AS provider_name,
    p.colour AS provider_colour,
    p.website AS provider_website,
    ${providerColumns.has('status_url') ? 'p.status_url' : 'NULL'} AS provider_status_url,
    ${providerColumns.has('api_docs_url') ? 'p.api_docs_url' : 'NULL'} AS provider_api_docs_url
  FROM models m
  JOIN providers p ON m.provider_id = p.id
  ORDER BY (m.quality_score IS NULL), m.quality_score DESC, m.name
`);
dumpSqlite('benchmarks', 'SELECT * FROM benchmarks ORDER BY category, name');
dumpSqlite('benchmark_scores', `
  SELECT
    bs.*,
    m.name AS model_name,
    p.name AS provider_name,
    p.colour AS provider_colour,
    m.category AS model_category
  FROM benchmark_scores bs
  JOIN models m ON bs.model_id = m.id
  JOIN providers p ON m.provider_id = p.id
  ORDER BY bs.score DESC
`);
dumpSqlite('people', `
  SELECT p.*, pr.name AS organisation_name
  FROM people p
  LEFT JOIN providers pr ON p.provider_id = pr.id
  ORDER BY p.name
`);
const currentPriceHistoryRows = sqlite.prepare(`
  SELECT ph.*, m.name AS model_name, p.name AS provider_name, p.colour AS provider_colour
  FROM price_history ph
  JOIN models m ON ph.model_id = m.id
  JOIN providers p ON m.provider_id = p.id
  ORDER BY ph.model_id, ph.recorded_at ASC
`).all();
mergeHistoricalRows(
  'price_history',
  currentPriceHistoryRows,
  (row) => [
    row.model_id,
    row.input_price,
    row.output_price,
    row.recorded_at,
    row.source,
  ].join('|'),
  (a, b) => {
    const modelOrder = String(a.model_id).localeCompare(String(b.model_id));
    if (modelOrder !== 0) return modelOrder;
    const dateOrder = String(a.recorded_at).localeCompare(String(b.recorded_at));
    if (dateOrder !== 0) return dateOrder;
    return Number(a.id ?? 0) - Number(b.id ?? 0);
  },
);

const currentSpeedHistoryRows = sqlite.prepare(`
  SELECT sh.*, m.name AS model_name
  FROM speed_history sh
  JOIN models m ON sh.model_id = m.id
  ORDER BY sh.model_id, sh.recorded_at DESC
`).all();
mergeHistoricalRows(
  'speed_history',
  currentSpeedHistoryRows,
  (row) => [
    row.model_id,
    row.speed,
    row.ttft,
    row.provider_endpoint ?? '',
    row.recorded_at,
    row.source,
  ].join('|'),
  (a, b) => {
    const modelOrder = String(a.model_id).localeCompare(String(b.model_id));
    if (modelOrder !== 0) return modelOrder;
    const dateOrder = String(b.recorded_at).localeCompare(String(a.recorded_at));
    if (dateOrder !== 0) return dateOrder;
    return Number(b.id ?? 0) - Number(a.id ?? 0);
  },
);
dumpSqlite('scrape_log', 'SELECT * FROM scrape_log ORDER BY finished_at DESC LIMIT 100');
dumpSqlite('glossary', 'SELECT * FROM glossary ORDER BY term');
dumpSqlite('youtube_creators', `
  SELECT
    yc.*,
    NULL AS youtube_url,
    NULL AS vertical
  FROM youtube_creators yc
  ORDER BY yc.category, yc.name
`);
dumpSqlite('tags', 'SELECT * FROM tags ORDER BY category, name');
dumpSqlite('taggables', 'SELECT * FROM taggables ORDER BY taggable_type, taggable_id, tag_id');
dumpSqlite('provider_endpoints', `
  SELECT
    pe.*,
    p.name AS provider_name,
    p.colour AS provider_colour,
    m.name AS model_name
  FROM provider_endpoints pe
  JOIN providers p ON pe.provider_id = p.id
  JOIN models m ON pe.model_id = m.id
  ORDER BY pe.model_id, pe.speed DESC
`);
dumpSqlite('rumoured_models', `
  SELECT rm.*, p.name AS provider_name, p.colour AS provider_colour
  FROM rumoured_models rm
  LEFT JOIN providers p ON rm.provider_id = p.id
  ORDER BY rm.first_seen DESC
`);
dumpSqlite('subscription_plans', `
  SELECT
    sp.*,
    p.name AS provider_name,
    p.colour AS provider_colour
  FROM subscription_plans sp
  JOIN providers p ON sp.provider_id = p.id
  ORDER BY p.name, sp.tier_level, sp.plan_name
`);
dumpSqlite('plan_model_limits', `
  SELECT
    pml.*,
    sp.plan_name,
    sp.price_monthly,
    m.name AS model_name
  FROM plan_model_limits pml
  JOIN subscription_plans sp ON pml.plan_id = sp.id
  LEFT JOIN models m ON pml.model_id = m.id
  ORDER BY sp.plan_name, m.name
`);
dumpSqlite('cli_tools', `
  SELECT
    ct.*,
    p.name AS provider_name,
    p.colour AS provider_colour
  FROM cli_tools ct
  LEFT JOIN providers p ON ct.provider_id = p.id
  ORDER BY ct.name
`);
dumpSqlite('job_companies', `
  SELECT
    jc.*,
    p.name AS provider_name,
    p.colour AS provider_colour
  FROM job_companies jc
  LEFT JOIN providers p ON jc.provider_id = p.id
  WHERE jc.status = 'active'
  ORDER BY jc.name
`);
dumpSqlite('ai_jobs', `
  SELECT
    j.*,
    c.name AS company_name,
    c.careers_url,
    p.name AS provider_name,
    p.colour AS provider_colour
  FROM ai_jobs j
  JOIN job_companies c ON j.company_id = c.id
  LEFT JOIN providers p ON j.provider_id = p.id
  WHERE j.active = 1
  ORDER BY j.posted_at DESC, j.updated_at DESC
`);
dumpSqlite('ai_job_snapshots', `
  SELECT
    s.*,
    c.name AS company_name,
    p.name AS provider_name,
    p.colour AS provider_colour
  FROM ai_job_snapshots s
  JOIN job_companies c ON s.company_id = c.id
  LEFT JOIN providers p ON s.provider_id = p.id
  ORDER BY s.snapshot_date DESC, c.name
`);
dumpSqlite('news', `
  SELECT id, title, url, source, summary, category, '[]' AS tags, 0.4 AS importance_score,
         published_at, created_at AS discovered_at
  FROM news
  ORDER BY published_at DESC
  LIMIT 200
`);

const pgClient = await connectPostgres();

// Shared datasets from Postgres, with local data preserved as fallback.
await dumpPostgres(pgClient, 'news', `
  SELECT
    a.id,
    a.title,
    a.url,
    s.name AS source,
    a.summary,
    a.category::text AS category,
    a.tags,
    a.importance_score,
    a.published_at,
    a.discovered_at
  FROM news_articles a
  JOIN news_sources s ON a.source_id = s.id
  WHERE a.deleted_at IS NULL
  ORDER BY COALESCE(a.published_at, a.discovered_at) DESC
  LIMIT 400
`, filterSharedNews);

await dumpPostgres(pgClient, 'creative_benchmarks', `
  SELECT * FROM creative_benchmarks
  ORDER BY category, meta_rank ASC NULLS LAST
`);
await dumpPostgres(pgClient, 'events', 'SELECT * FROM hub_events ORDER BY date_start DESC NULLS LAST');
await dumpPostgres(pgClient, 'reports', 'SELECT * FROM hub_reports ORDER BY last_published DESC NULLS LAST');
await dumpPostgres(pgClient, 'agi_definitions', 'SELECT * FROM agi_definitions ORDER BY source_type, source_name');
await dumpPostgres(pgClient, 'agi_milestones', 'SELECT * FROM agi_milestones ORDER BY date DESC');
await dumpPostgres(pgClient, 'agi_capabilities', 'SELECT * FROM agi_capabilities ORDER BY category, name');

const meta = {
  generated_at: new Date().toISOString(),
  source: 'local sqlite + shared postgres',
  sqlite_storage: 'local-only',
  shared_postgres_available: Boolean(pgClient),
};
writeFileSync(path.join(cacheDir, '_meta.json'), JSON.stringify(meta, null, 2), 'utf8');

if (pgClient) {
  await pgClient.end();
}
sqlite.close();

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s. Cache at: ${cacheDir}`);
