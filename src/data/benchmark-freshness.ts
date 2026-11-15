export function benchmarkCollectionReceipt(state: boolean | 'blocked', attemptedAt = new Date().toISOString()) {
  const isLive = state === true;
  return {
    collectionStatus: state === 'blocked' ? 'blocked' : isLive ? 'live' : 'cached',
    attemptedAt,
    sourceRetrievedAt: isLive ? attemptedAt : null,
    // Transport success alone supplies neither an exact measurement nor review evidence.
    sourceVerifiedAt: null,
  };
}

interface BenchmarkAttempt {
  id?: number;
  scraper: string;
  status?: string;
  error_message?: string | null;
  finished_at?: string | null;
  started_at?: string | null;
}

function latest(values: Array<string | null | undefined>): string | null {
  const dates = values.map((value) => value ? Date.parse(value) : NaN).filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}

// Callers supply only rows admitted by the existing exact-evidence public selector.
export function benchmarkFreshness(
  rankableRows: Array<{ measured_at?: string | null; updated_at?: string | null }>,
  attempts: BenchmarkAttempt[],
) {
  const collections = attempts.filter((row) => row.scraper.startsWith('benchmarks:'));
  const latestByScraper = new Map<string, BenchmarkAttempt>();
  for (const row of collections) {
    const seen = latestByScraper.get(row.scraper);
    const timestamp = Date.parse(row.finished_at ?? row.started_at ?? '');
    const seenTimestamp = Date.parse(seen?.finished_at ?? seen?.started_at ?? '');
    if (!seen || timestamp > seenTimestamp || (timestamp === seenTimestamp && (row.id ?? 0) > (seen.id ?? 0))) {
      latestByScraper.set(row.scraper, row);
    }
  }
  return {
    measuredAt: latest(rankableRows.map((row) => row.measured_at)),
    attemptedAt: latest(collections
      .map((row) => row.finished_at ?? row.started_at)),
    blockedReasons: [...latestByScraper.values()].filter((row) => row.status === 'blocked')
      .map((row) => scrapeRunExplanation(row.status, row.error_message)),
    sourceVerifiedAt: null,
  };
}

/** The legacy error_message column also holds structured non-error receipts. */
export function scrapeRunExplanation(status: string | undefined, message?: string | null): string {
  if (message) {
    try {
      const receipt = JSON.parse(message);
      if (receipt && typeof receipt.reason === 'string' && receipt.reason.trim()) return receipt.reason;
    } catch { return message; }
    if (status === 'error') return message;
  }
  return status === 'blocked' ? 'Collection blocked by source policy; no source retrieval or refresh.' : 'Collection attempt only.';
}
