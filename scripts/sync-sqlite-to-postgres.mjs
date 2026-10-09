import path from 'node:path';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { Client } = require('pg');

const envPath = process.env.AIRH_ENV_FILE || path.resolve(process.cwd(), '.env');
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (!match) continue;
  const key = match[1].trim();
  if (!(key in process.env)) process.env[key] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const sqlitePath = path.resolve(process.cwd(), '.local', 'data', 'the-ai-resource-hub.db');
const mappings = [
  ['providers', 'hub_providers'],
  ['models', 'hub_models'],
  ['benchmarks', 'hub_benchmarks'],
  ['benchmark_scores', 'hub_benchmark_scores'],
  ['price_history', 'hub_price_history'],
  ['speed_history', 'hub_speed_history'],
  ['scrape_log', 'hub_scrape_log'],
  ['events', 'hub_events'],
  ['reports', 'hub_reports'],
  ['youtube_creators', 'hub_youtube_creators'],
  ['people', 'hub_people'],
  ['job_companies', 'hub_job_companies'],
  ['milestones', 'hub_milestones'],
];

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function convertValue(value, dataType) {
  if (value === null || value === undefined) return null;
  if (dataType === 'boolean') return Boolean(value);
  if (dataType === 'json' || dataType === 'jsonb') {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

const sqlite = new Database(sqlitePath, { readonly: true });
const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();

const summary = {};
for (const [sourceTable, targetTable] of mappings) {
  const sourceExists = sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(sourceTable);
  if (!sourceExists) {
    summary[targetTable] = { status: 'source_missing', rows: 0 };
    continue;
  }

  const targetColumnsResult = await pg.query(
    `SELECT column_name, data_type, is_generated
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [targetTable],
  );
  if (targetColumnsResult.rows.length === 0) {
    summary[targetTable] = { status: 'target_missing', rows: 0 };
    continue;
  }

  const sourceColumns = new Set(sqlite.prepare(`PRAGMA table_info(${quoteIdentifier(sourceTable)})`).all().map((row) => row.name));
  const targetColumns = targetColumnsResult.rows.filter((row) => row.is_generated === 'NEVER' && sourceColumns.has(row.column_name));
  const primaryKeyResult = await pg.query(
    `SELECT a.attname AS column_name
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass AND i.indisprimary
     ORDER BY array_position(i.indkey, a.attnum)`,
    [targetTable],
  );
  const primaryKeys = primaryKeyResult.rows.map((row) => row.column_name).filter((column) => targetColumns.some((item) => item.column_name === column));
  if (targetColumns.length === 0 || primaryKeys.length === 0) {
    summary[targetTable] = { status: 'no_shared_primary_key', rows: 0 };
    continue;
  }

  const sourceRows = sqlite.prepare(`SELECT ${targetColumns.map((column) => quoteIdentifier(column.column_name)).join(', ')} FROM ${quoteIdentifier(sourceTable)}`).all();
  const updateColumns = targetColumns.map((column) => column.column_name).filter((column) => !primaryKeys.includes(column));
  const batchSize = Math.max(25, Math.min(500, Math.floor(50_000 / targetColumns.length)));

  for (let offset = 0; offset < sourceRows.length; offset += batchSize) {
    const batch = sourceRows.slice(offset, offset + batchSize);
    const values = [];
    const rowSql = batch.map((row) => {
      const placeholders = targetColumns.map((column) => {
        values.push(convertValue(row[column.column_name], column.data_type));
        return `$${values.length}`;
      });
      return `(${placeholders.join(', ')})`;
    });
    const conflictSql = updateColumns.length > 0
      ? `DO UPDATE SET ${updateColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(', ')}`
      : 'DO NOTHING';
    await pg.query(
      `INSERT INTO ${quoteIdentifier(targetTable)} (${targetColumns.map((column) => quoteIdentifier(column.column_name)).join(', ')})
       VALUES ${rowSql.join(', ')}
       ON CONFLICT (${primaryKeys.map(quoteIdentifier).join(', ')}) ${conflictSql}`,
      values,
    );
  }

  summary[targetTable] = { status: 'synced', rows: sourceRows.length };
}

await pg.end();
sqlite.close();
console.log(JSON.stringify({ job: 'ai-resource-hub-sqlite-postgres-sync', completedAt: new Date().toISOString(), tables: summary }));
