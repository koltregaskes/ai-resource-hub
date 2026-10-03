export function benchmarkCollectionReceipt(isLive: boolean, attemptedAt = new Date().toISOString()) {
  return {
    collectionStatus: isLive ? 'live' : 'cached',
    attemptedAt,
    sourceRetrievedAt: isLive ? attemptedAt : null,
    // Transport success alone supplies neither an exact measurement nor review evidence.
    sourceVerifiedAt: null,
  };
}

interface BenchmarkAttempt {
  scraper: string;
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
  return {
    measuredAt: latest(rankableRows.map((row) => row.measured_at)),
    attemptedAt: latest(attempts.filter((row) => row.scraper.startsWith('benchmarks:'))
      .map((row) => row.finished_at ?? row.started_at)),
    sourceVerifiedAt: null,
  };
}
