const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Benchmark results are not expected to refresh daily, but a score older than
 * one year must not silently remain rankable. `updated_at` is deliberately not
 * used here because cache refreshes can rewrite it without re-measuring a row.
 */
export const BENCHMARK_EVIDENCE_MAX_AGE_DAYS = 365;
export const BENCHMARK_EVIDENCE_FUTURE_TOLERANCE_DAYS = 1;

export type BenchmarkTraceability =
  | 'url-backed'
  | 'inherited-traceable'
  | 'label-only'
  | 'missing';

export type BenchmarkEvidenceFreshness =
  | 'current'
  | 'stale'
  | 'undated'
  | 'invalid-date'
  | 'future-dated';

export interface BenchmarkScoreProvenanceInput {
  model_id?: string | null;
  benchmark_id: string;
  source?: string | null;
  source_url?: string | null;
  measured_at?: string | null;
  updated_at?: string | null;
}

export interface BenchmarkDefinitionProvenanceInput {
  id: string;
  url?: string | null;
}

export interface BenchmarkProvenancePolicy {
  now?: Date;
  maxAgeDays?: number;
  futureToleranceDays?: number;
}

export interface BenchmarkProvenanceAssessment {
  modelId: string | null;
  benchmarkId: string;
  sourceLabel: string | null;
  traceability: BenchmarkTraceability;
  freshness: BenchmarkEvidenceFreshness;
  effectiveSourceUrl: string | null;
  measuredAt: string | null;
  ageDays: number | null;
  rankable: boolean;
  reasons: string[];
}

export interface BenchmarkProvenanceSummary {
  total: number;
  urlBacked: number;
  inheritedTraceable: number;
  labelOnly: number;
  missing: number;
  current: number;
  stale: number;
  undated: number;
  invalidDate: number;
  futureDated: number;
  rankable: number;
  unrankable: number;
  maxAgeDays: number;
  assessments: BenchmarkProvenanceAssessment[];
}

function getPublicHttpUrl(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (!parsed.hostname || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * A public URL is not automatically evidence for an exact score. Known generic
 * product or chat entry points are discovery links, not row-level result pages.
 * Keep this list deliberately narrow and add entries only when the destination
 * has been checked.
 */
const NON_ROW_LEVEL_EVIDENCE_URLS = new Set([
  'https://chat.lmsys.org/',
]);

function getRowLevelEvidenceUrl(value: string | null | undefined): string | null {
  const publicUrl = getPublicHttpUrl(value);
  if (!publicUrl || NON_ROW_LEVEL_EVIDENCE_URLS.has(publicUrl)) return null;
  return publicUrl;
}

export function assessBenchmarkProvenance(
  score: BenchmarkScoreProvenanceInput,
  benchmark: BenchmarkDefinitionProvenanceInput | undefined,
  policy: BenchmarkProvenancePolicy = {},
): BenchmarkProvenanceAssessment {
  const now = policy.now ?? new Date();
  const maxAgeDays = policy.maxAgeDays ?? BENCHMARK_EVIDENCE_MAX_AGE_DAYS;
  const futureToleranceDays = policy.futureToleranceDays ?? BENCHMARK_EVIDENCE_FUTURE_TOLERANCE_DAYS;
  const directUrl = getRowLevelEvidenceUrl(score.source_url);
  const inheritedUrl = directUrl ? null : getPublicHttpUrl(benchmark?.url);
  const sourceLabel = score.source?.trim() || null;

  let traceability: BenchmarkTraceability;
  let effectiveSourceUrl: string | null;

  if (directUrl) {
    traceability = 'url-backed';
    effectiveSourceUrl = directUrl;
  } else if (inheritedUrl) {
    traceability = 'inherited-traceable';
    effectiveSourceUrl = inheritedUrl;
  } else if (sourceLabel) {
    traceability = 'label-only';
    effectiveSourceUrl = null;
  } else {
    traceability = 'missing';
    effectiveSourceUrl = null;
  }

  const measuredAt = score.measured_at?.trim() || null;
  let freshness: BenchmarkEvidenceFreshness;
  let ageDays: number | null = null;

  if (!measuredAt) {
    freshness = 'undated';
  } else {
    const measuredTimestamp = Date.parse(measuredAt);
    if (!Number.isFinite(measuredTimestamp)) {
      freshness = 'invalid-date';
    } else {
      const ageMs = now.getTime() - measuredTimestamp;
      ageDays = Math.floor(ageMs / DAY_IN_MS);

      if (ageMs < -futureToleranceDays * DAY_IN_MS) {
        freshness = 'future-dated';
      } else if (ageMs > maxAgeDays * DAY_IN_MS) {
        freshness = 'stale';
      } else {
        freshness = 'current';
        ageDays = Math.max(0, ageDays);
      }
    }
  }

  const reasons: string[] = [];
  if (traceability === 'label-only') {
    reasons.push('Source label has no row-level or benchmark-level public URL.');
  } else if (traceability === 'missing') {
    reasons.push('Source label and public source URL are both missing.');
  } else if (traceability === 'inherited-traceable') {
    reasons.push('Benchmark-level URL provides context, but the score has no row-level public source URL.');
  }

  if (freshness === 'stale') {
    reasons.push(`Measurement is older than ${maxAgeDays} days.`);
  } else if (freshness === 'undated') {
    reasons.push('Measurement date is missing.');
  } else if (freshness === 'invalid-date') {
    reasons.push('Measurement date is invalid.');
  } else if (freshness === 'future-dated') {
    reasons.push('Measurement date is implausibly in the future.');
  }

  const rankable = (
    traceability === 'url-backed'
    && freshness === 'current'
  );

  return {
    modelId: score.model_id ?? null,
    benchmarkId: score.benchmark_id,
    sourceLabel,
    traceability,
    freshness,
    effectiveSourceUrl,
    measuredAt,
    ageDays,
    rankable,
    reasons,
  };
}

export function summariseBenchmarkProvenance(
  scores: BenchmarkScoreProvenanceInput[],
  benchmarks: BenchmarkDefinitionProvenanceInput[],
  policy: BenchmarkProvenancePolicy = {},
): BenchmarkProvenanceSummary {
  const benchmarkById = new Map(benchmarks.map((benchmark) => [benchmark.id, benchmark]));
  const assessments = scores.map((score) => (
    assessBenchmarkProvenance(score, benchmarkById.get(score.benchmark_id), policy)
  ));
  const count = <T extends BenchmarkTraceability | BenchmarkEvidenceFreshness>(
    field: 'traceability' | 'freshness',
    value: T,
  ) => assessments.filter((assessment) => assessment[field] === value).length;
  const maxAgeDays = policy.maxAgeDays ?? BENCHMARK_EVIDENCE_MAX_AGE_DAYS;
  const rankable = assessments.filter((assessment) => assessment.rankable).length;

  return {
    total: assessments.length,
    urlBacked: count('traceability', 'url-backed'),
    inheritedTraceable: count('traceability', 'inherited-traceable'),
    labelOnly: count('traceability', 'label-only'),
    missing: count('traceability', 'missing'),
    current: count('freshness', 'current'),
    stale: count('freshness', 'stale'),
    undated: count('freshness', 'undated'),
    invalidDate: count('freshness', 'invalid-date'),
    futureDated: count('freshness', 'future-dated'),
    rankable,
    unrankable: assessments.length - rankable,
    maxAgeDays,
    assessments,
  };
}

export function getBenchmarkProvenanceGateFailures(summary: BenchmarkProvenanceSummary): string[] {
  if (summary.total === 0) {
    return ['Benchmark provenance gate has no score rows to assess.'];
  }

  const failures: string[] = [];

  if (summary.labelOnly > 0 || summary.missing > 0) {
    failures.push(
      `Benchmark provenance is not traceable: label-only=${summary.labelOnly}, missing=${summary.missing}.`,
    );
  }

  if (
    summary.stale > 0
    || summary.undated > 0
    || summary.invalidDate > 0
    || summary.futureDated > 0
  ) {
    failures.push(
      `Benchmark evidence is not current: stale>${summary.maxAgeDays}d=${summary.stale}, `
      + `undated=${summary.undated}, invalid-date=${summary.invalidDate}, future-dated=${summary.futureDated}.`,
    );
  }

  if (summary.unrankable > 0) {
    failures.push(
      `Benchmark rankability gate failed: rankable=${summary.rankable}/${summary.total}, `
      + `unrankable=${summary.unrankable}.`,
    );
  }

  return failures;
}
