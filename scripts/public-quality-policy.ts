import fs from 'node:fs';
import path from 'node:path';
import {
  MIN_EVALUATED_BENCHMARKS,
  getFrontierNow,
  getMetaLeaderboard,
} from '../src/data/hub-dashboard';
import {
  getBenchmarkScores,
  getLLMModelsFromDB,
  getModels,
} from '../src/db/pg-cache';

type SuppressedExportRow = {
  id?: string;
  quality_score?: number | null;
  qualityScore?: number | null;
  value_score?: number | null;
  valueScore?: number | null;
  quality_score_state?: string;
  qualityScoreState?: string;
};

type ExportEnvelope = {
  models?: SuppressedExportRow[];
  releases?: SuppressedExportRow[];
};

const PUBLIC_EXPORTS = [
  'public/data/ai-models-comparison.json',
  'public/data/models-latest.json',
  'public/data/model-release-desk.json',
] as const;

const STATIC_CONSUMERS = [
  'src/pages/quiz/index.astro',
  'src/pages/rss.xml.ts',
  'src/pages/math/index.astro',
  'src/pages/best-value/index.astro',
  'src/pages/compare/head-to-head.astro',
  'src/pages/compare/providers.astro',
  'src/pages/pricing-trends/index.astro',
  'scripts/generate-release-desk.ts',
  'scripts/generate-digest.ts',
  'scripts/generate-spreadsheet.ts',
  'src/db/pg-cache.ts',
  'src/db/queries.ts',
  'src/db/queries-sqlite.ts',
] as const;

function loadExport(repoRoot: string, relativePath: string): ExportEnvelope | null {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ExportEnvelope;
}

export function getPublicQualityPolicyFailures(repoRoot = process.cwd()): string[] {
  const failures: string[] = [];
  const publicModels = getModels();
  const publicLLMs = getLLMModelsFromDB();
  const rankableScores = getBenchmarkScores();
  const leaderboard = getMetaLeaderboard(250);
  const frontier = getFrontierNow(250);

  for (const model of publicModels) {
    if (model.quality_score !== null || model.quality_score_state !== 'suppressed_untraceable') {
      failures.push(`Public model adapter exposes untraceable quality: ${model.id}`);
    }
  }

  for (const model of publicLLMs) {
    if (
      model.qualityScore !== null
      || model.valueScore !== null
      || model.qualityScoreState !== 'suppressed_untraceable'
    ) {
      failures.push(`Public LLM adapter exposes untraceable quality/value: ${model.id}`);
    }
  }

  const rankableByModel = new Map<string, Set<string>>();
  for (const row of rankableScores) {
    const benchmarkIds = rankableByModel.get(row.model_id) ?? new Set<string>();
    benchmarkIds.add(row.benchmark_id);
    rankableByModel.set(row.model_id, benchmarkIds);
  }

  for (const model of leaderboard) {
    const distinctBenchmarks = rankableByModel.get(model.id)?.size ?? 0;
    if (distinctBenchmarks < MIN_EVALUATED_BENCHMARKS) {
      failures.push(
        `Evaluated composite admits thin evidence: ${model.id} has ${distinctBenchmarks} distinct rankable benchmark(s).`,
      );
    }
    if (model.qualityScore !== null) {
      failures.push(`Evaluated composite leaks legacy quality: ${model.id}`);
    }
  }

  for (const model of frontier) {
    if (model.qualityScore !== null) {
      failures.push(`Frontier watchlist leaks legacy quality: ${model.id}`);
    }
    if (
      model.benchmarkCount === 0
      && (model.evidenceState !== 'tracking' || !/awaiting rankable benchmark evidence/i.test(model.evidenceLabel))
    ) {
      failures.push(`Zero-evidence frontier model is not labelled as tracking: ${model.id}`);
    }
  }

  for (const relativePath of PUBLIC_EXPORTS) {
    const payload = loadExport(repoRoot, relativePath);
    if (!payload) {
      failures.push(`Missing public quality-policy export: ${relativePath}`);
      continue;
    }

    const rows = payload.models ?? payload.releases ?? [];
    for (const row of rows) {
      const quality = row.quality_score ?? row.qualityScore ?? null;
      const value = row.value_score ?? row.valueScore ?? null;
      const state = row.quality_score_state ?? row.qualityScoreState;
      if (quality !== null || value !== null || state !== 'suppressed_untraceable') {
        failures.push(`Public export exposes untraceable quality/value: ${relativePath}:${row.id ?? 'unknown'}`);
      }
    }
  }

  for (const relativePath of STATIC_CONSUMERS) {
    const filePath = path.join(repoRoot, relativePath);
    const source = fs.readFileSync(filePath, 'utf8');
    if (
      /\.qualityScore\s*[+\-*/]|[+\-*/]\s*[^;\n]*\.qualityScore/.test(source)
      || /\.quality_score\s*[+\-*/]|[+\-*/]\s*[^;\n]*\.quality_score/.test(source)
      || /\.sort\([^)]*quality(?:Score|_score)/s.test(source)
      || /\.quality(?:Score|_score)\.toFixed\(/.test(source)
      || /ORDER\s+BY[^;]*quality_score/i.test(source)
    ) {
      failures.push(`Public consumer performs legacy quality arithmetic or ranking: ${relativePath}`);
    }
  }

  return failures;
}
