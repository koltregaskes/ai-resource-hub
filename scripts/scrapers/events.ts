#!/usr/bin/env npx tsx
/**
 * Refresh the public AI events cache from a curated set of official sources.
 *
 * Dates are promoted into this catalogue only after primary-source review.
 * Each unattended run checks that the official source is still reachable,
 * records the result, updates the local publish cache, and upserts shared
 * Postgres when DATABASE_URL is available.
 */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { getOptionalDatabaseUrl } from '../../src/db/database-url';

interface CuratedEvent {
  id: string;
  name: string;
  url: string;
  date_start: string;
  date_end: string;
  location: string;
  category: string;
  description: string;
}

interface CachedEvent extends CuratedEvent {
  recurring: boolean;
  updated_at: string;
}

interface SourceCheck {
  id: string;
  name: string;
  url: string;
  checkedAt: string;
  state: 'live' | 'error';
  status: number | null;
  error: string | null;
}

const CACHE_PATH = path.join(process.cwd(), 'data', 'pg-cache', 'events.json');
const STATUS_PATH = path.join(process.cwd(), 'data', 'events-source-status.json');
const USER_AGENT = 'AI-Resource-Hub-Events/1.0 (+https://github.com/koltregaskes/ai-resource-hub)';

const CURATED_EVENTS: CuratedEvent[] = [
  {
    id: 'ai4-2026',
    name: 'Ai4 2026',
    url: 'https://ai4.io/',
    date_start: '2026-08-04',
    date_end: '2026-08-06',
    location: 'Las Vegas, United States',
    category: 'industry',
    description: 'Enterprise AI conference at The Venetian, with official dates confirmed by the organiser.',
  },
  {
    id: 'kdd-2026',
    name: 'KDD 2026',
    url: 'https://kdd2026.kdd.org/',
    date_start: '2026-08-09',
    date_end: '2026-08-13',
    location: 'Jeju, South Korea',
    category: 'research',
    description: 'ACM SIGKDD conference on knowledge discovery and data mining.',
  },
  {
    id: 'world-summit-ai',
    name: 'World Summit AI 2026',
    url: 'https://worldsummit.ai/',
    date_start: '2026-10-07',
    date_end: '2026-10-08',
    location: 'Amsterdam, Netherlands',
    category: 'industry',
    description: 'World Summit AI anniversary edition at Taets Art and Event Park.',
  },
  {
    id: 'nvidia-gtc-berlin-2026',
    name: 'NVIDIA GTC Berlin 2026',
    url: 'https://www.nvidia.com/en-eu/gtc/',
    date_start: '2026-10-20',
    date_end: '2026-10-22',
    location: 'Berlin, Germany',
    category: 'industry',
    description: 'NVIDIA developer and research conference covering AI infrastructure, models, and physical AI.',
  },
  {
    id: 'microsoft-ignite-2026',
    name: 'Microsoft Ignite 2026',
    url: 'https://ignite.microsoft.com/',
    date_start: '2026-11-17',
    date_end: '2026-11-20',
    location: 'San Francisco, United States',
    category: 'tech_conference',
    description: 'Microsoft event for developers, IT professionals, and business leaders, including frontier AI and cloud updates.',
  },
  {
    id: 'aws-reinvent-2026',
    name: 'AWS re:Invent 2026',
    url: 'https://reinvent.awsevents.com/agenda/',
    date_start: '2026-11-30',
    date_end: '2026-12-04',
    location: 'Las Vegas, United States',
    category: 'tech_conference',
    description: 'AWS cloud and AI conference with official 2026 dates published by AWS.',
  },
  {
    id: 'neurips-2026',
    name: 'NeurIPS 2026',
    url: 'https://neurips.cc/Conferences/2026',
    date_start: '2026-12-06',
    date_end: '2026-12-12',
    location: 'Sydney, Australia',
    category: 'research',
    description: 'Annual Conference on Neural Information Processing Systems, with satellite events in Atlanta and Paris.',
  },
];

function readExistingEvents(): CachedEvent[] {
  if (!fs.existsSync(CACHE_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function checkSource(event: CuratedEvent): Promise<SourceCheck> {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(event.url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': USER_AGENT,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    const live = response.status >= 200 && response.status < 400;
    return {
      id: event.id,
      name: event.name,
      url: event.url,
      checkedAt,
      state: live ? 'live' : 'error',
      status: response.status,
      error: live ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      id: event.id,
      name: event.name,
      url: event.url,
      checkedAt,
      state: 'error',
      status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function writeToPostgres(events: CachedEvent[]): Promise<number> {
  const databaseUrl = getOptionalDatabaseUrl();
  if (!databaseUrl) {
    console.log('  Shared Postgres skipped: DATABASE_URL is not set');
    return 0;
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    for (const event of events) {
      await client.query(`
        INSERT INTO hub_events
          (id, name, url, date_start, date_end, location, category, recurring, description, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          url = EXCLUDED.url,
          date_start = EXCLUDED.date_start,
          date_end = EXCLUDED.date_end,
          location = EXCLUDED.location,
          category = EXCLUDED.category,
          recurring = EXCLUDED.recurring,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at
      `, [
        event.id,
        event.name,
        event.url,
        event.date_start,
        event.date_end,
        event.location,
        event.category,
        event.recurring,
        event.description,
        event.updated_at,
      ]);
    }
    return events.length;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('AI events refresh starting...');

  const checks = await Promise.all(CURATED_EVENTS.map(checkSource));
  const now = new Date().toISOString();
  const replacedIds = new Set(['world-summit-ai-2026', 'nvidia-gtc']);
  const existing = readExistingEvents().filter((event) => !replacedIds.has(event.id));
  const merged = new Map(existing.map((event) => [event.id, event]));

  for (const event of CURATED_EVENTS) {
    merged.set(event.id, {
      ...event,
      recurring: false,
      updated_at: now,
    });
  }

  const rows = Array.from(merged.values()).sort((a, b) => (
    String(a.date_start ?? '').localeCompare(String(b.date_start ?? ''))
  ));
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  fs.writeFileSync(STATUS_PATH, `${JSON.stringify({
    generatedAt: now,
    sourceType: 'curated primary sources',
    live: checks.filter((check) => check.state === 'live').length,
    errors: checks.filter((check) => check.state === 'error').length,
    checks,
  }, null, 2)}\n`, 'utf8');

  const pgCount = await writeToPostgres(
    CURATED_EVENTS.map((event) => ({ ...event, recurring: false, updated_at: now })),
  );

  console.log(`  Curated events: ${CURATED_EVENTS.length}`);
  console.log(`  Official sources live: ${checks.filter((check) => check.state === 'live').length}/${checks.length}`);
  console.log(`  Local cache rows: ${rows.length}`);
  console.log(`  Shared Postgres upserts: ${pgCount}`);

  if (checks.every((check) => check.state === 'error')) {
    throw new Error('Every official event source check failed; refusing to report a healthy refresh.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
