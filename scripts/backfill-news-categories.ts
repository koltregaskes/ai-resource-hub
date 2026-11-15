/**
 * Backfill canonical reader categories onto existing news rows.
 *
 * Maps every legacy vocabulary (ai_research/ai_tools/ai_models feed labels,
 * models/industry/research database labels, the curation labels) onto the
 * seven categories in shared/news-categories.json, using the same classifier
 * as the site build.
 *
 * DRY RUN BY DEFAULT. Nothing is written unless --apply is passed, and a
 * Postgres write also needs --confirm-host=<host> matching DATABASE_URL.
 * Do not run --apply against live databases until Kol's Neon sync decision
 * (hub #920, #1418) is made.
 *
 * Usage:
 *   npx tsx scripts/backfill-news-categories.ts --json data/pg-cache/news.json
 *   npx tsx scripts/backfill-news-categories.ts --json src/data/news-feed-latest.json --vocabulary newsFeed
 *   npx tsx scripts/backfill-news-categories.ts --sqlite data/ai-resource-hub.db [--apply]
 *   npx tsx scripts/backfill-news-categories.ts --postgres --table news [--apply --confirm-host=<host>]
 *   Add --report out.csv to write every row's mapping.
 *
 * Writes go to two new columns, reader_category and reader_tags (JSON array);
 * the original category column is left untouched so the change is reversible.
 */
import fs from 'node:fs';
import path from 'node:path';
import { classifyNewsItem, type Classification, type LegacyVocabulary } from '../src/data/news-categories';

interface Row {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
}

interface Mapped extends Row {
  result: Classification;
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string): string | undefined => {
  const eq = args.find((arg) => arg.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const index = args.indexOf(`--${name}`);
  const next = index >= 0 ? args[index + 1] : undefined;
  return next && !next.startsWith('--') ? next : undefined;
};

const apply = flag('apply');
const vocabulary = option('vocabulary') as LegacyVocabulary | undefined;
const table = option('table') ?? 'news';
if (!/^[a-z_][a-z0-9_.]*$/i.test(table)) throw new Error(`Unsafe table name: ${table}`);

function classify(rows: Row[], defaultVocabulary: LegacyVocabulary): Mapped[] {
  return rows.map((row) => ({
    ...row,
    result: classifyNewsItem({
      title: row.title,
      summary: row.summary,
      sourceCategory: row.category,
      vocabulary: vocabulary ?? defaultVocabulary,
    }),
  }));
}

function report(mapped: Mapped[]): void {
  const byCategory = new Map<string, number>();
  const byReason = new Map<string, number>();
  const crosswalk = new Map<string, number>();
  for (const row of mapped) {
    const category = row.result.category ?? '(excluded)';
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    byReason.set(row.result.reason, (byReason.get(row.result.reason) ?? 0) + 1);
    const key = `${row.category ?? '(none)'} -> ${category}`;
    crosswalk.set(key, (crosswalk.get(key) ?? 0) + 1);
  }
  const sorted = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`Rows: ${mapped.length}`);
  console.log('By canonical category:', Object.fromEntries(sorted(byCategory)));
  console.log('By reason:', Object.fromEntries(sorted(byReason)));
  console.log('Old label -> new category:');
  for (const [key, count] of sorted(crosswalk)) console.log(`  ${key}: ${count}`);

  const reportPath = option('report');
  if (reportPath) {
    const csv = ['id,old_category,reader_category,reader_tags,reason,title'];
    for (const row of mapped) {
      const cells = [row.id, row.category ?? '', row.result.category ?? '', row.result.tags.join('|'), row.result.reason, row.title];
      csv.push(cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    }
    fs.writeFileSync(reportPath, `${csv.join('\n')}\n`, 'utf8');
    console.log(`Report written: ${reportPath}`);
  }
}

function loadJson(file: string): Row[] {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list: any[] = Array.isArray(raw) ? raw : raw.articles ?? raw.rows ?? [];
  return list.map((item, index) => ({
    id: String(item.id ?? item.url ?? index),
    title: String(item.title ?? ''),
    summary: item.summary ?? null,
    category: item.category ?? null,
  }));
}

async function runSqlite(file: string): Promise<void> {
  const { default: Database } = await import('better-sqlite3');
  const db = new Database(file, { readonly: !apply });
  const rows = db.prepare(`SELECT id, title, summary, category FROM ${table}`).all() as Row[];
  const mapped = classify(rows, 'database');
  report(mapped);
  if (!apply) return console.log('Dry run: nothing written. Pass --apply to write reader_category.');

  const columns = (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);
  if (!columns.includes('reader_category')) db.exec(`ALTER TABLE ${table} ADD COLUMN reader_category TEXT`);
  if (!columns.includes('reader_tags')) db.exec(`ALTER TABLE ${table} ADD COLUMN reader_tags TEXT`);
  const update = db.prepare(`UPDATE ${table} SET reader_category = ?, reader_tags = ? WHERE id = ?`);
  db.transaction(() => {
    for (const row of mapped) update.run(row.result.category, JSON.stringify(row.result.tags), row.id);
  })();
  console.log(`Updated ${mapped.length} rows in ${file}:${table}`);
}

async function runPostgres(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set in the environment.');
  const host = new URL(url).hostname;
  if (apply && option('confirm-host') !== host) {
    throw new Error(`Refusing to write: pass --confirm-host=${host} to confirm the target database.`);
  }
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query<Row>(`SELECT id::text AS id, title, summary, category FROM ${table}`);
    const mapped = classify(rows, 'database');
    report(mapped);
    if (!apply) return console.log(`Dry run against ${host}: nothing written.`);

    await client.query('BEGIN');
    await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS reader_category TEXT`);
    await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS reader_tags JSONB`);
    for (const row of mapped) {
      await client.query(`UPDATE ${table} SET reader_category = $1, reader_tags = $2::jsonb WHERE id::text = $3`, [
        row.result.category,
        JSON.stringify(row.result.tags),
        row.id,
      ]);
    }
    await client.query('COMMIT');
    console.log(`Updated ${mapped.length} rows in ${host}:${table}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const jsonFile = option('json');
  const sqliteFile = option('sqlite');
  if (jsonFile) {
    if (apply) throw new Error('--apply is not supported for --json input (it is a read-only export).');
    report(classify(loadJson(path.resolve(jsonFile)), 'newsFeed'));
    return;
  }
  if (sqliteFile) return runSqlite(path.resolve(sqliteFile));
  if (flag('postgres')) return runPostgres();
  console.error('Pass one of --json <file>, --sqlite <file> or --postgres. See the header of this script.');
  process.exit(2);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
