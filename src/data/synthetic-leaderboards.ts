import {
  getBenchmarks,
  getBenchmarkScores,
  getModelsByCategory,
  getPublicModelsByCategory,
} from '../db/queries';

type PublicLLMModel = ReturnType<typeof getPublicModelsByCategory>[number];
type CategoryModel = ReturnType<typeof getModelsByCategory>[number];
type BenchmarkDefinition = ReturnType<typeof getBenchmarks>[number];
type BenchmarkScoreRow = ReturnType<typeof getBenchmarkScores>[number];

export const SYNTHETIC_EVALUATED_THRESHOLD = 4;

export type LeaderboardSurfaceClass = 'factual' | 'synthetic-evaluated' | 'frontier/tracking' | 'unsupported';
export type SyntheticRankingState = 'frontier' | 'evaluated' | 'tracking' | 'unsupported';
export type SyntheticEvidenceTier = 'evaluated' | 'partial' | 'tracking';
export type SyntheticFallbackPolicy = 'unranked' | 'tracking-only' | 'not-applicable';

export type SyntheticLeaderboardRouteId =
  | 'evaluated-composite'
  | 'best-value'
  | 'open-source'
  | 'multimodal'
  | 'coding'
  | 'reasoning'
  | 'math'
  | 'agents'
  | 'creative-writing'
  | 'finance'
  | 'healthcare'
  | 'legal'
  | 'cheapest'
  | 'fastest'
  | 'frontier-now';

export interface SyntheticBenchmarkRegistryEntry {
  id: string;
  name: string;
  category: string;
  registryState: 'published' | 'tracked';
  sourceStatus: string;
}

export interface SyntheticLeaderboardDefinition {
  routeId: SyntheticLeaderboardRouteId;
  displayTitle: string;
  surfaceClass: LeaderboardSurfaceClass;
  benchmarkIds: string[];
  eligibilityThreshold: number;
  fallbackPolicy: SyntheticFallbackPolicy;
  scoreLabel: string;
  summary: string;
}

export interface SyntheticLeaderboardModelBenchmark {
  id: string;
  name: string;
  category: string;
  registryState: 'published' | 'tracked';
  score: number | null;
  normalizedScore: number | null;
}

export interface SyntheticLeaderboardEntry {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  status: string;
  released: string | null;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  qualityScore: number;
  freshness: number;
  score: number | null;
  scoreLabel: string;
  benchmarkScore: number;
  evidenceTier: SyntheticEvidenceTier;
  relevantBenchmarkCount: number;
  relevantBenchmarks: SyntheticLeaderboardModelBenchmark[];
  isRankEligible: boolean;
  reasonIfNotEligible: string | null;
  rankingState: SyntheticRankingState;
  openSource: boolean;
  apiAvailable: boolean;
  modality: string[];
  notes: string | undefined;
  speed: number;
  valueScore: number;
}

export interface SyntheticLeaderboardView {
  definition: SyntheticLeaderboardDefinition;
  benchmarkRegistry: SyntheticBenchmarkRegistryEntry[];
  rankedEntries: SyntheticLeaderboardEntry[];
  partialEntries: SyntheticLeaderboardEntry[];
  trackingEntries: SyntheticLeaderboardEntry[];
  publishedBenchmarkCount: number;
  trackedBenchmarkCount: number;
  modelsWithEvidence: number;
  scoreRows: number;
}

export interface SyntheticLeaderboardValidationIssue {
  routeId: SyntheticLeaderboardRouteId;
  benchmarkId: string;
  message: string;
}

export interface SyntheticLeaderboardValidationReport {
  issues: SyntheticLeaderboardValidationIssue[];
  routes: Array<{
    routeId: SyntheticLeaderboardRouteId;
    displayTitle: string;
    surfaceClass: LeaderboardSurfaceClass;
    benchmarkCount: number;
    publishedBenchmarkCount: number;
    trackedBenchmarkCount: number;
  }>;
}

const TRACKED_BENCHMARK_REGISTRY: Record<string, Omit<SyntheticBenchmarkRegistryEntry, 'id'>> = {
  gaia: {
    name: 'GAIA',
    category: 'agent',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  webarena: {
    name: 'WebArena',
    category: 'agent',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  'tau-bench': {
    name: 'TAU-bench',
    category: 'agent',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  'creative-writing-bench': {
    name: 'Creative Writing Bench',
    category: 'creative-writing',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  'wildbench-creative': {
    name: 'WildBench Creative',
    category: 'creative-writing',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  gsm8k: {
    name: 'GSM8K',
    category: 'reasoning',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  'aime-2024': {
    name: 'AIME 2024',
    category: 'reasoning',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  'omni-math': {
    name: 'Omni-MATH',
    category: 'reasoning',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  finqa: {
    name: 'FinQA',
    category: 'finance',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  financebench: {
    name: 'FinanceBench',
    category: 'finance',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  medqa: {
    name: 'MedQA',
    category: 'healthcare',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
  legalbench: {
    name: 'LegalBench',
    category: 'legal',
    registryState: 'tracked',
    sourceStatus: 'Tracked benchmark definition only; no canonical score rows published in the current registry.',
  },
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toModalityList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function normaliseBenchmarkScore(score: BenchmarkScoreRow, benchmark: BenchmarkDefinition): number {
  const value = toNumber(score.score);
  const min = toNumber((benchmark as { scale_min?: number | string | null }).scale_min ?? 0);
  const rawMax = toNumber((benchmark as { scale_max?: number | string | null }).scale_max ?? 100);
  const max = rawMax > min ? rawMax : 100;
  const ratio = (value - min) / (max - min);
  const higherIsBetter = benchmark.higher_is_better !== false;
  const scaled = higherIsBetter ? ratio * 100 : (1 - ratio) * 100;
  return Math.max(0, Math.min(100, scaled));
}

function getFreshnessScore(released: string | null | undefined): number {
  if (!released) return 35;

  const releasedAt = Date.parse(released);
  if (!Number.isFinite(releasedAt)) return 35;

  const daysAgo = (Date.now() - releasedAt) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 30) return 100;
  if (daysAgo <= 75) return 95;
  if (daysAgo <= 120) return 90;
  if (daysAgo <= 180) return 82;
  if (daysAgo <= 270) return 68;
  if (daysAgo <= 365) return 55;
  if (daysAgo <= 540) return 40;
  return 24;
}

function getStatusMultiplier(status: string | null | undefined): number {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return 1;
    case 'tracking':
      return 0.97;
    case 'preview':
      return 0.9;
    case 'superseded':
      return 0.82;
    case 'retired':
      return 0.65;
    default:
      return 0.8;
  }
}

function getVariantPenalty(name: string): number {
  const lower = name.toLowerCase();
  let penalty = 1;

  if (/\bbeta\b/.test(lower)) penalty *= 0.8;
  if (/\bpreview\b/.test(lower)) penalty *= 0.88;
  if (/\bmini\b|\bnano\b|\bflash\b|\bhaiku\b|\blite\b/.test(lower)) penalty *= 0.82;

  return penalty;
}

function getEvidenceFactor(benchmarkCount: number): number {
  if (benchmarkCount >= 7) return 1;
  if (benchmarkCount === 6) return 0.98;
  if (benchmarkCount === 5) return 0.96;
  if (benchmarkCount === 4) return 0.93;
  if (benchmarkCount === 3) return 0.88;
  if (benchmarkCount === 2) return 0.82;
  if (benchmarkCount === 1) return 0.7;
  return 0.5;
}

function getProviderAgePenalty(model: PublicLLMModel, latestByProvider: Map<string, string>): number {
  if (!model.released) return 0.85;

  const providerLatest = latestByProvider.get(model.provider_id);
  if (!providerLatest || providerLatest === model.released) return 1;

  const gapDays = (Date.parse(providerLatest) - Date.parse(model.released)) / (1000 * 60 * 60 * 24);
  if (gapDays >= 240) return 0.55;
  if (gapDays >= 120) return 0.7;
  if (gapDays >= 60) return 0.84;
  if (gapDays >= 30) return 0.92;
  return 1;
}

function getEvidenceTier(relevantBenchmarkCount: number): SyntheticEvidenceTier {
  if (relevantBenchmarkCount >= SYNTHETIC_EVALUATED_THRESHOLD) return 'evaluated';
  if (relevantBenchmarkCount >= 1) return 'partial';
  return 'tracking';
}

function getReasonIfNotEligible(relevantBenchmarkCount: number, threshold: number): string | null {
  if (relevantBenchmarkCount >= threshold) return null;
  if (relevantBenchmarkCount === 0) return `No published benchmark rows yet. Requires ${threshold}+ relevant benchmark rows to rank.`;
  return `${relevantBenchmarkCount} of ${threshold}+ relevant benchmark rows available. This model stays unranked until evidence is thicker.`;
}

function buildProviderLatestReleaseMap(models: PublicLLMModel[]): Map<string, string> {
  const latestByProvider = new Map<string, string>();

  for (const model of models) {
    if (!model.released) continue;
    const current = latestByProvider.get(model.provider_id);
    if (!current || model.released > current) {
      latestByProvider.set(model.provider_id, model.released);
    }
  }

  return latestByProvider;
}

function getWeightedBenchmarkIds(): string[] {
  return getBenchmarks()
    .filter((benchmark) => toNumber(benchmark.weight) > 0)
    .map((benchmark) => benchmark.id);
}

export const SYNTHETIC_LEADERBOARD_DEFINITIONS: Record<SyntheticLeaderboardRouteId, SyntheticLeaderboardDefinition> = {
  'evaluated-composite': {
    routeId: 'evaluated-composite',
    displayTitle: 'Evaluated composite',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: getWeightedBenchmarkIds(),
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Composite',
    summary: 'Best-evidenced current synthetic ranking across the weighted benchmark set.',
  },
  'best-value': {
    routeId: 'best-value',
    displayTitle: 'Best value',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: getWeightedBenchmarkIds(),
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Value index',
    summary: 'Benchmark-backed value ranking using the evaluated composite and blended API price.',
  },
  'open-source': {
    routeId: 'open-source',
    displayTitle: 'Open source',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: getWeightedBenchmarkIds(),
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Open composite',
    summary: 'Synthetic ranking for open-weight language models with enough benchmark evidence to compare fairly.',
  },
  multimodal: {
    routeId: 'multimodal',
    displayTitle: 'Multimodal',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: getWeightedBenchmarkIds(),
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Multimodal score',
    summary: 'Synthetic ranking for multimodal language models, blending evaluated strength with modality breadth.',
  },
  coding: {
    routeId: 'coding',
    displayTitle: 'Coding',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: ['bigcodebench', 'humaneval', 'livecodebench', 'swe-bench-verified'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Coding score',
    summary: 'Synthetic ranking for coding models with enough relevant benchmark coverage to compare fairly.',
  },
  reasoning: {
    routeId: 'reasoning',
    displayTitle: 'Reasoning',
    surfaceClass: 'synthetic-evaluated',
    benchmarkIds: ['aime-2025', 'arc-challenge', 'gpqa-diamond', 'humanitys-last-exam', 'livebench', 'math-500'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'unranked',
    scoreLabel: 'Reasoning score',
    summary: 'Synthetic ranking for reasoning models using math and reasoning benchmarks plus freshness and quality context.',
  },
  math: {
    routeId: 'math',
    displayTitle: 'Math',
    surfaceClass: 'unsupported',
    benchmarkIds: ['math-500', 'aime-2025', 'gsm8k', 'aime-2024', 'omni-math'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until math benchmark coverage is deep enough to rank honestly.',
  },
  agents: {
    routeId: 'agents',
    displayTitle: 'Agents',
    surfaceClass: 'unsupported',
    benchmarkIds: ['gaia', 'webarena', 'tau-bench'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until agent benchmark coverage is present in the canonical registry.',
  },
  'creative-writing': {
    routeId: 'creative-writing',
    displayTitle: 'Creative writing',
    surfaceClass: 'unsupported',
    benchmarkIds: ['creative-writing-bench', 'wildbench-creative'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until creative-writing benchmark coverage is present in the canonical registry.',
  },
  finance: {
    routeId: 'finance',
    displayTitle: 'Finance',
    surfaceClass: 'unsupported',
    benchmarkIds: ['finqa', 'financebench'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until finance benchmark coverage is present in the canonical registry.',
  },
  healthcare: {
    routeId: 'healthcare',
    displayTitle: 'Healthcare',
    surfaceClass: 'unsupported',
    benchmarkIds: ['medqa'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until healthcare benchmark coverage is present in the canonical registry.',
  },
  legal: {
    routeId: 'legal',
    displayTitle: 'Legal',
    surfaceClass: 'unsupported',
    benchmarkIds: ['legalbench'],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Tracking',
    summary: 'Tracking view only until legal benchmark coverage is present in the canonical registry.',
  },
  cheapest: {
    routeId: 'cheapest',
    displayTitle: 'Cheapest',
    surfaceClass: 'factual',
    benchmarkIds: [],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'not-applicable',
    scoreLabel: 'Price',
    summary: 'Pure price-first ordering, not a synthetic rank.',
  },
  fastest: {
    routeId: 'fastest',
    displayTitle: 'Fastest',
    surfaceClass: 'factual',
    benchmarkIds: [],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'not-applicable',
    scoreLabel: 'Speed',
    summary: 'Pure speed-first ordering, not a synthetic rank.',
  },
  'frontier-now': {
    routeId: 'frontier-now',
    displayTitle: 'Frontier now',
    surfaceClass: 'frontier/tracking',
    benchmarkIds: [],
    eligibilityThreshold: SYNTHETIC_EVALUATED_THRESHOLD,
    fallbackPolicy: 'tracking-only',
    scoreLabel: 'Frontier',
    summary: 'Current flagship and launch watchlist. Not a synthetic score.',
  },
};

interface SyntheticUniverse {
  models: PublicLLMModel[];
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>;
  scoreRowsByModel: Map<string, BenchmarkScoreRow[]>;
  latestByProvider: Map<string, string>;
}

let syntheticUniverseCache: SyntheticUniverse | null = null;

function getSyntheticUniverse(): SyntheticUniverse {
  if (syntheticUniverseCache) return syntheticUniverseCache;

  const models = getPublicModelsByCategory('llm');
  const publishedBenchmarks = getBenchmarks();
  const scoreRows = getBenchmarkScores().filter((row) => row.model_category === 'llm');
  const benchmarkRegistry = new Map<string, SyntheticBenchmarkRegistryEntry>();
  const scoreRowsByModel = new Map<string, BenchmarkScoreRow[]>();

  for (const benchmark of publishedBenchmarks) {
    benchmarkRegistry.set(benchmark.id, {
      id: benchmark.id,
      name: benchmark.name,
      category: benchmark.category,
      registryState: 'published',
      sourceStatus: 'Present in the canonical benchmark registry and available for scored comparisons.',
    });
  }

  for (const [id, benchmark] of Object.entries(TRACKED_BENCHMARK_REGISTRY)) {
    if (!benchmarkRegistry.has(id)) {
      benchmarkRegistry.set(id, {
        id,
        ...benchmark,
      });
    }
  }

  for (const row of scoreRows) {
    if (!scoreRowsByModel.has(row.model_id)) scoreRowsByModel.set(row.model_id, []);
    scoreRowsByModel.get(row.model_id)?.push(row);
  }

  syntheticUniverseCache = {
    models,
    benchmarkRegistry,
    scoreRowsByModel,
    latestByProvider: buildProviderLatestReleaseMap(models),
  };

  return syntheticUniverseCache;
}

function buildBaseEntry(
  model: PublicLLMModel,
  score: number | null,
  scoreLabel: string,
  benchmarkScore: number,
  relevantBenchmarks: SyntheticLeaderboardModelBenchmark[],
  eligibilityThreshold: number,
  rankingState: SyntheticRankingState,
  extraReason: string | null = null,
): SyntheticLeaderboardEntry {
  const relevantBenchmarkCount = relevantBenchmarks.filter((benchmark) => benchmark.score !== null).length;
  const qualityScore = toNumber(model.quality_score);
  const inputPrice = toNumber(model.input_price);
  const outputPrice = toNumber(model.output_price);
  const blendedPrice = (inputPrice + 3 * outputPrice) / 4;

  return {
    id: model.id,
    name: model.name,
    provider: model.provider_name,
    providerColour: model.provider_colour,
    status: model.status,
    released: model.released || null,
    inputPrice,
    outputPrice,
    contextWindow: toNumber(model.context_window),
    qualityScore,
    freshness: getFreshnessScore(model.released),
    score,
    scoreLabel,
    benchmarkScore,
    evidenceTier: getEvidenceTier(relevantBenchmarkCount),
    relevantBenchmarkCount,
    relevantBenchmarks,
    isRankEligible: rankingState === 'evaluated',
    reasonIfNotEligible: extraReason ?? getReasonIfNotEligible(relevantBenchmarkCount, eligibilityThreshold),
    rankingState,
    openSource: Boolean(model.open_source),
    apiAvailable: Boolean(model.api_available),
    modality: toModalityList(model.modality),
    notes: model.notes ?? undefined,
    speed: toNumber((model as { speed?: number | string | null }).speed ?? 0),
    valueScore: blendedPrice > 0 && score && score > 0 ? Number(((score / blendedPrice) * 10).toFixed(1)) : 0,
  };
}

function mapBenchmarkScores(
  scoreRows: BenchmarkScoreRow[],
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  benchmarkIds: string[],
): SyntheticLeaderboardModelBenchmark[] {
  return benchmarkIds.map((benchmarkId) => {
    const registryEntry = benchmarkRegistry.get(benchmarkId);
    const benchmark = publishedBenchmarkMap.get(benchmarkId);
    const score = scoreRows.find((row) => row.benchmark_id === benchmarkId) ?? null;

    return {
      id: benchmarkId,
      name: registryEntry?.name ?? benchmark?.name ?? benchmarkId,
      category: registryEntry?.category ?? benchmark?.category ?? 'unknown',
      registryState: registryEntry?.registryState ?? 'tracked',
      score: score ? toNumber(score.score) : null,
      normalizedScore: score && benchmark ? Number(normaliseBenchmarkScore(score, benchmark).toFixed(1)) : null,
    };
  });
}

function sortRankedEntries(a: SyntheticLeaderboardEntry, b: SyntheticLeaderboardEntry): number {
  return (b.score ?? -1) - (a.score ?? -1)
    || b.freshness - a.freshness
    || b.qualityScore - a.qualityScore
    || a.name.localeCompare(b.name);
}

function sortTrackingEntries(a: SyntheticLeaderboardEntry, b: SyntheticLeaderboardEntry): number {
  const tierOrder = { partial: 0, tracking: 1, evaluated: 2 };
  return tierOrder[a.evidenceTier] - tierOrder[b.evidenceTier]
    || b.relevantBenchmarkCount - a.relevantBenchmarkCount
    || b.freshness - a.freshness
    || b.qualityScore - a.qualityScore
    || a.name.localeCompare(b.name);
}

function getPublishedBenchmarkMap(): Map<string, BenchmarkDefinition> {
  return new Map(getBenchmarks().map((benchmark) => [benchmark.id, benchmark]));
}

function getBenchmarkRowsForModel(modelId: string): BenchmarkScoreRow[] {
  return getSyntheticUniverse().scoreRowsByModel.get(modelId) ?? [];
}

function buildOverallCompositeEntry(
  model: PublicLLMModel,
  definition: SyntheticLeaderboardDefinition,
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  latestByProvider: Map<string, string>,
): SyntheticLeaderboardEntry {
  const scoreRows = getBenchmarkRowsForModel(model.id).filter((row) => definition.benchmarkIds.includes(row.benchmark_id));
  const relevantBenchmarks = mapBenchmarkScores(scoreRows, benchmarkRegistry, publishedBenchmarkMap, definition.benchmarkIds);
  const availableBenchmarks = relevantBenchmarks.filter((benchmark) => benchmark.normalizedScore !== null);
  const totalWeight = definition.benchmarkIds.reduce((sum, benchmarkId) => {
    const benchmark = publishedBenchmarkMap.get(benchmarkId);
    return sum + toNumber(benchmark?.weight ?? 0);
  }, 0);
  const weightedTotal = availableBenchmarks.reduce((sum, benchmark) => {
    const benchmarkDef = publishedBenchmarkMap.get(benchmark.id);
    return sum + (benchmark.normalizedScore ?? 0) * toNumber(benchmarkDef?.weight ?? 0);
  }, 0);
  const coveredWeight = availableBenchmarks.reduce((sum, benchmark) => {
    const benchmarkDef = publishedBenchmarkMap.get(benchmark.id);
    return sum + toNumber(benchmarkDef?.weight ?? 0);
  }, 0);
  const benchmarkScore = coveredWeight > 0 ? weightedTotal / coveredWeight : 0;
  const coverageRatio = totalWeight > 0 ? coveredWeight / totalWeight : 0;
  const coverageFactor = Math.min(1, coverageRatio / 0.55);
  const qualityScore = toNumber(model.quality_score);
  const freshness = getFreshnessScore(model.released);
  const baseScore = benchmarkScore * 0.5 + qualityScore * 0.25 + freshness * 0.25;
  const compositeScore = baseScore
    * (0.7 + 0.3 * coverageFactor)
    * getEvidenceFactor(availableBenchmarks.length)
    * getStatusMultiplier(model.status)
    * getProviderAgePenalty(model, latestByProvider)
    * getVariantPenalty(model.name);
  const evidenceTier = getEvidenceTier(availableBenchmarks.length);
  const rankingState = evidenceTier === 'evaluated' ? 'evaluated' : 'tracking';

  return buildBaseEntry(
    model,
    Number(compositeScore.toFixed(1)),
    definition.scoreLabel,
    Number(benchmarkScore.toFixed(1)),
    relevantBenchmarks,
    definition.eligibilityThreshold,
    rankingState,
  );
}

function buildBenchmarkSubsetEntry(
  model: PublicLLMModel,
  definition: SyntheticLeaderboardDefinition,
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  latestByProvider: Map<string, string>,
): SyntheticLeaderboardEntry {
  const scoreRows = getBenchmarkRowsForModel(model.id).filter((row) => definition.benchmarkIds.includes(row.benchmark_id));
  const relevantBenchmarks = mapBenchmarkScores(scoreRows, benchmarkRegistry, publishedBenchmarkMap, definition.benchmarkIds);
  const availableBenchmarks = relevantBenchmarks.filter((benchmark) => benchmark.normalizedScore !== null);
  const totalWeight = definition.benchmarkIds.reduce((sum, benchmarkId) => {
    const benchmark = publishedBenchmarkMap.get(benchmarkId);
    return sum + Math.max(1, toNumber(benchmark?.weight ?? 1));
  }, 0);
  const weightedTotal = availableBenchmarks.reduce((sum, benchmark) => {
    const benchmarkDef = publishedBenchmarkMap.get(benchmark.id);
    return sum + (benchmark.normalizedScore ?? 0) * Math.max(1, toNumber(benchmarkDef?.weight ?? 1));
  }, 0);
  const coveredWeight = availableBenchmarks.reduce((sum, benchmark) => {
    const benchmarkDef = publishedBenchmarkMap.get(benchmark.id);
    return sum + Math.max(1, toNumber(benchmarkDef?.weight ?? 1));
  }, 0);
  const benchmarkScore = coveredWeight > 0 ? weightedTotal / coveredWeight : 0;
  const coverageRatio = totalWeight > 0 ? coveredWeight / totalWeight : 0;
  const baseScore = benchmarkScore * 0.65 + toNumber(model.quality_score) * 0.15 + getFreshnessScore(model.released) * 0.2;
  const score = baseScore
    * (0.8 + 0.2 * coverageRatio)
    * getStatusMultiplier(model.status)
    * getProviderAgePenalty(model, latestByProvider)
    * getVariantPenalty(model.name);
  const evidenceTier = getEvidenceTier(availableBenchmarks.length);
  const rankingState = evidenceTier === 'evaluated' ? 'evaluated' : 'tracking';

  return buildBaseEntry(
    model,
    Number(score.toFixed(1)),
    definition.scoreLabel,
    Number(benchmarkScore.toFixed(1)),
    relevantBenchmarks,
    definition.eligibilityThreshold,
    rankingState,
  );
}

function buildValueEntry(
  model: PublicLLMModel,
  definition: SyntheticLeaderboardDefinition,
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  latestByProvider: Map<string, string>,
): SyntheticLeaderboardEntry {
  const compositeEntry = buildOverallCompositeEntry(
    model,
    SYNTHETIC_LEADERBOARD_DEFINITIONS['evaluated-composite'],
    benchmarkRegistry,
    publishedBenchmarkMap,
    latestByProvider,
  );
  const blendedPrice = (compositeEntry.inputPrice + 3 * compositeEntry.outputPrice) / 4;

  if (blendedPrice <= 0) {
    return {
      ...compositeEntry,
      score: null,
      scoreLabel: definition.scoreLabel,
      rankingState: 'tracking',
      isRankEligible: false,
      reasonIfNotEligible: 'No comparable public API price published. This model stays out of the ranked value table.',
      valueScore: 0,
    };
  }

  const score = compositeEntry.score ? Number(((compositeEntry.score / blendedPrice) * 10).toFixed(1)) : null;
  return {
    ...compositeEntry,
    score,
    scoreLabel: definition.scoreLabel,
    rankingState: compositeEntry.isRankEligible ? 'evaluated' : 'tracking',
    isRankEligible: compositeEntry.isRankEligible,
    reasonIfNotEligible: compositeEntry.reasonIfNotEligible,
    valueScore: score ?? 0,
  };
}

function buildOpenSourceEntry(
  model: PublicLLMModel,
  definition: SyntheticLeaderboardDefinition,
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  latestByProvider: Map<string, string>,
): SyntheticLeaderboardEntry {
  const entry = buildOverallCompositeEntry(
    model,
    SYNTHETIC_LEADERBOARD_DEFINITIONS['evaluated-composite'],
    benchmarkRegistry,
    publishedBenchmarkMap,
    latestByProvider,
  );
  return {
    ...entry,
    scoreLabel: definition.scoreLabel,
  };
}

function buildMultimodalEntry(
  model: PublicLLMModel,
  definition: SyntheticLeaderboardDefinition,
  benchmarkRegistry: Map<string, SyntheticBenchmarkRegistryEntry>,
  publishedBenchmarkMap: Map<string, BenchmarkDefinition>,
  latestByProvider: Map<string, string>,
): SyntheticLeaderboardEntry {
  const entry = buildOverallCompositeEntry(
    model,
    SYNTHETIC_LEADERBOARD_DEFINITIONS['evaluated-composite'],
    benchmarkRegistry,
    publishedBenchmarkMap,
    latestByProvider,
  );
  const modalityBreadthScore = Math.min(100, 40 + Math.max(0, entry.modality.length - 1) * 20);
  const score = entry.score ? Number((entry.score * 0.75 + modalityBreadthScore * 0.25).toFixed(1)) : null;
  return {
    ...entry,
    score,
    scoreLabel: definition.scoreLabel,
  };
}

function getTrackedWatchlist(limit = 12): SyntheticLeaderboardEntry[] {
  const { models, benchmarkRegistry, latestByProvider } = getSyntheticUniverse();
  const publishedBenchmarkMap = getPublishedBenchmarkMap();
  return models
    .map((model) => buildOverallCompositeEntry(
      model,
      SYNTHETIC_LEADERBOARD_DEFINITIONS['evaluated-composite'],
      benchmarkRegistry,
      publishedBenchmarkMap,
      latestByProvider,
    ))
    .filter((entry) => entry.rankingState !== 'evaluated')
    .sort(sortTrackingEntries)
    .slice(0, limit);
}

export function getSyntheticLeaderboardView(routeId: SyntheticLeaderboardRouteId, limit = 50): SyntheticLeaderboardView {
  const definition = SYNTHETIC_LEADERBOARD_DEFINITIONS[routeId];
  const { models, benchmarkRegistry, latestByProvider } = getSyntheticUniverse();
  const publishedBenchmarkMap = getPublishedBenchmarkMap();
  const benchmarkRegistryEntries = definition.benchmarkIds
    .map((benchmarkId) => benchmarkRegistry.get(benchmarkId))
    .filter((benchmark): benchmark is SyntheticBenchmarkRegistryEntry => Boolean(benchmark));

  const publishedBenchmarkCount = benchmarkRegistryEntries.filter((benchmark) => benchmark.registryState === 'published').length;
  const trackedBenchmarkCount = benchmarkRegistryEntries.filter((benchmark) => benchmark.registryState === 'tracked').length;

  if (definition.surfaceClass === 'unsupported') {
    const watchlist = getTrackedWatchlist(limit).map((entry) => ({
      ...entry,
      rankingState: 'unsupported' as const,
      score: null,
      scoreLabel: definition.scoreLabel,
      isRankEligible: false,
      reasonIfNotEligible: `This page is currently tracking sources only. ${definition.eligibilityThreshold}+ relevant benchmark rows are required before ranking goes live.`,
    }));

    return {
      definition,
      benchmarkRegistry: benchmarkRegistryEntries,
      rankedEntries: [],
      partialEntries: [],
      trackingEntries: watchlist,
      publishedBenchmarkCount,
      trackedBenchmarkCount,
      modelsWithEvidence: 0,
      scoreRows: 0,
    };
  }

  let entries = models.map((model) => {
    switch (routeId) {
      case 'coding':
      case 'reasoning':
        return buildBenchmarkSubsetEntry(model, definition, benchmarkRegistry, publishedBenchmarkMap, latestByProvider);
      case 'best-value':
        return buildValueEntry(model, definition, benchmarkRegistry, publishedBenchmarkMap, latestByProvider);
      case 'open-source':
        return buildOpenSourceEntry(model, definition, benchmarkRegistry, publishedBenchmarkMap, latestByProvider);
      case 'multimodal':
        return buildMultimodalEntry(model, definition, benchmarkRegistry, publishedBenchmarkMap, latestByProvider);
      case 'evaluated-composite':
      default:
        return buildOverallCompositeEntry(model, definition, benchmarkRegistry, publishedBenchmarkMap, latestByProvider);
    }
  });

  if (routeId === 'open-source') {
    entries = entries.filter((entry) => entry.openSource);
  }

  if (routeId === 'multimodal') {
    entries = entries.filter((entry) => entry.modality.length > 1);
  }

  const rankedEntries = entries
    .filter((entry) => entry.rankingState === 'evaluated' && entry.score !== null)
    .sort(sortRankedEntries)
    .slice(0, limit);

  const partialEntries = entries
    .filter((entry) => entry.rankingState === 'tracking' && entry.evidenceTier === 'partial')
    .sort(sortTrackingEntries)
    .slice(0, limit);

  const trackingEntries = entries
    .filter((entry) => entry.rankingState === 'tracking' && entry.evidenceTier === 'tracking')
    .sort(sortTrackingEntries)
    .slice(0, limit);

  return {
    definition,
    benchmarkRegistry: benchmarkRegistryEntries,
    rankedEntries,
    partialEntries,
    trackingEntries,
    publishedBenchmarkCount,
    trackedBenchmarkCount,
    modelsWithEvidence: entries.filter((entry) => entry.relevantBenchmarkCount > 0).length,
    scoreRows: entries.reduce((sum, entry) => sum + entry.relevantBenchmarkCount, 0),
  };
}

export function getSyntheticLeaderboardValidationReport(
  definitions: Record<string, Pick<SyntheticLeaderboardDefinition, 'routeId' | 'displayTitle' | 'surfaceClass' | 'benchmarkIds'>> = SYNTHETIC_LEADERBOARD_DEFINITIONS,
): SyntheticLeaderboardValidationReport {
  const { benchmarkRegistry } = getSyntheticUniverse();
  const issues: SyntheticLeaderboardValidationIssue[] = [];
  const routes = Object.values(definitions).map((definition) => {
    const publishedBenchmarkCount = definition.benchmarkIds.filter((benchmarkId) => benchmarkRegistry.get(benchmarkId)?.registryState === 'published').length;
    const trackedBenchmarkCount = definition.benchmarkIds.filter((benchmarkId) => benchmarkRegistry.get(benchmarkId)?.registryState === 'tracked').length;

    for (const benchmarkId of definition.benchmarkIds) {
      if (!benchmarkRegistry.has(benchmarkId)) {
        issues.push({
          routeId: definition.routeId,
          benchmarkId,
          message: `${definition.displayTitle} references unknown benchmark id "${benchmarkId}".`,
        });
      }
    }

    return {
      routeId: definition.routeId,
      displayTitle: definition.displayTitle,
      surfaceClass: definition.surfaceClass,
      benchmarkCount: definition.benchmarkIds.length,
      publishedBenchmarkCount,
      trackedBenchmarkCount,
    };
  });

  return { issues, routes };
}

export function getAllLeaderboardSurfaceDefinitions(): SyntheticLeaderboardDefinition[] {
  return Object.values(SYNTHETIC_LEADERBOARD_DEFINITIONS);
}

export function getOpenSourceReferenceModels() {
  const categories = ['image', 'video', 'voice', 'speech', 'sound'] as const;
  const models: Array<CategoryModel & { modalities: string[] }> = [];

  for (const category of categories) {
    for (const model of getModelsByCategory(category)) {
      if (!model.openSource) continue;
      models.push({
        ...model,
        modalities: toModalityList(model.modality),
      });
    }
  }

  return models.sort((a, b) => b.qualityScore - a.qualityScore || a.name.localeCompare(b.name));
}
