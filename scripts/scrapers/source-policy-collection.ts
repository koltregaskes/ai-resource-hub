import type Database from 'better-sqlite3';
import { blockedSourceById, blockedSourceFor } from '../../src/data/source-policy';
import { benchmarkCollectionReceipt } from '../../src/data/benchmark-freshness';
import { logScrapeRun } from './scrape-log';

/** A policy check is neither a retrieval nor a successful refresh. */
export function skipBlockedSource(db: Database.Database, scraper: string, sourceId: string): boolean {
  const source = blockedSourceById(sourceId);
  if (!source) return false;
  const reason = `${source.name}: collection blocked by source policy. ${source.reason} Terms: ${source.termsUrl}`;
  logScrapeRun(db, scraper, 'blocked', 0, JSON.stringify({
    ...benchmarkCollectionReceipt('blocked'), reason,
  }));
  console.log(`  ${reason}`);
  return true;
}

export function permittedFallback<T extends { sourceName: string; sourceUrl: string }>(rows: T[]) {
  const blocked = new Map<string, string>();
  const scores = rows.filter((row) => {
    const source = blockedSourceFor(row.sourceName, row.sourceUrl);
    if (!source) return true;
    blocked.set(source.id, `${source.name} (${source.termsUrl})`);
    return false;
  });
  const removed = rows.length - scores.length;
  const reason = rows.length === 0
    ? 'No live scores were retrieved and no fallback rows are available.'
    : `No live scores were retrieved. Source policy removed ${removed} of ${rows.length} fallback rows; ${scores.length} permitted rows remain.`
      + (blocked.size ? ` Blocked sources: ${[...blocked.values()].join('; ')}.` : '');
  return { scores, removed, reason };
}

export function recordCreativeCollection(
  db: Database.Database,
  count: number,
  isLive: boolean,
  fallback?: ReturnType<typeof permittedFallback>,
): void {
  const status = isLive ? 'live' : count === 0 && (fallback?.removed ?? 0) > 0 ? 'blocked' : 'fallback';
  logScrapeRun(db, 'creative-benchmarks', status, count, JSON.stringify({
    ...benchmarkCollectionReceipt(status === 'blocked' ? 'blocked' : isLive),
    ...(isLive ? {} : { reason: fallback?.reason ?? 'No live scores were retrieved; using cached fallback scores.' }),
  }));
}
