import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import {
  getAIJobsOverview,
  getBenchmarks,
  getBenchmarkScores,
  getLastScrapeTime,
  getLLMModelsFromDB,
  getPublicModelsByCategory,
  getRecentModels,
} from '../db/queries';

type PublicLLMModel = ReturnType<typeof getPublicModelsByCategory>[number];
type BenchmarkDefinition = ReturnType<typeof getBenchmarks>[number];
type BenchmarkScoreRow = ReturnType<typeof getBenchmarkScores>[number];
type RecentModel = ReturnType<typeof getRecentModels>[number];
type JobsOverview = ReturnType<typeof getAIJobsOverview>;

interface CacheReport {
  id: string;
  name: string;
  publisher: string;
  frequency: string;
  category: string;
  url: string;
  updated_at: string | null;
}

interface CacheEvent {
  id: string;
  name: string;
  category: string;
  url: string;
  date_start: string | null;
  updated_at: string | null;
}

interface CacheScrapeLog {
  id: number;
  scraper: string;
  status: string;
  models_updated: number | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

interface ParsedDigestEntry {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  score: number | null;
  publishedDate: string | null;
  digestDate: string;
  tags: string[];
}

export interface LatestDigest {
  digestDate: string;
  storyCount: number | null;
  sourceCount: number | null;
  entries: ParsedDigestEntry[];
}

export interface MetaLeaderboardEntry {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  status: string;
  metaScore: number;
  benchmarkScore: number;
  qualityScore: number;
  freshnessScore: number;
  benchmarkCount: number;
  coverageRatio: number;
  bestFor: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  valueScore: number;
  released: string | null;
  openSource: boolean;
  apiAvailable: boolean;
  modality: string[];
}

export interface FrontierNowEntry {
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
  benchmarkCount: number;
  coverageRatio: number;
  openSource: boolean;
  apiAvailable: boolean;
  modality: string[];
  evidenceLabel: string;
  evidenceState: 'scored' | 'partial' | 'tracking';
}

export interface AgiFrontierPoint {
  label: string;
  modelId: string;
  modelName: string;
  released: string;
  score: number;
  benchmarkCount: number;
}

export interface AgiOverview {
  frontierPoints: AgiFrontierPoint[];
  currentLeader: AgiFrontierPoint | null;
  twelveMonthGain: number;
  strongestBenchmark: { name: string; score: number } | null;
  updatedAt: string | null;
}

export interface DataPulseEntry {
  id: string;
  label: string;
  note: string;
  updatedAt: string | null;
  href: string;
}

export type ActivityCategory = 'site' | 'models' | 'data' | 'digest' | 'jobs';

export interface ActivityEntry {
  id: string;
  date: string;
  category: ActivityCategory;
  title: string;
  detail: string;
  href: string | null;
}

const CACHE_DIR = path.join(process.cwd(), 'data', 'pg-cache');
const DIGEST_SEARCH_DIRS = [
  path.join(process.cwd(), 'src', 'data'),
  path.join(process.cwd(), 'news-digests'),
];

const AGI_BENCHMARK_WEIGHTS: Record<string, number> = {
  'arc-agi': 1.6,
  'gpqa-diamond': 1.5,
  'humanitys-last-exam': 1.5,
  'mmlu-pro': 1.2,
  'swe-bench-verified': 1.2,
  'chatbot-arena-elo': 1.0,
};

const BEST_FOR_LABELS: Record<string, string> = {
  coding: 'Coding',
  conversational: 'Chat',
  knowledge: 'General use',
  math: 'Math',
  multimodal: 'Multimodal',
  reasoning: 'Reasoning',
  safety: 'Safety',
  vision: 'Vision',
};

const FRONTIER_NOW_PRIORITY_IDS = [
  'gpt-5.4',
  'claude-opus-4.6',
  'gemini-3.1-pro',
  'claude-sonnet-4.6',
  'grok-4.20',
  'qwen3.6-plus',
  'minimax-m2.7',
  'glm-5',
  'kimi-k2.5',
  'gemma-4',
  'deepseek-r1',
  'deepseek-v3.2',
] as const;

const SCRAPER_ACTIVITY_LABELS: Record<string, { title: string; detail: string; href: string }> = {
  'quality-scores': {
    title: 'Recomputed benchmark-weighted quality scores',
    detail: 'Refreshed the model quality layer that feeds ranking and comparison pages.',
    href: '/leaderboard/',
  },
  'official-pricing': {
    title: 'Validated official pricing snapshots',
    detail: 'Rechecked provider pricing pages against the comparison database.',
    href: '/compare/llm/',
  },
  'pricing:openrouter': {
    title: 'Pulled latest OpenRouter price index',
    detail: 'Updated comparison data for providers and routed model endpoints.',
    href: '/compare/llm/',
  },
  speed: {
    title: 'Updated speed measurements',
    detail: 'Refreshed output speed and latency references for tracked models.',
    href: '/speed/',
  },
  'benchmarks:chatbot-arena': {
    title: 'Synced Chatbot Arena benchmark track',
    detail: 'Updated the frontier conversation signal used in leaderboard weighting.',
    href: '/benchmarks/',
  },
  'benchmarks:open-llm-leaderboard': {
    title: 'Synced Open LLM leaderboard benchmarks',
    detail: 'Updated benchmark rows used for open model scoring and ranking.',
    href: '/benchmarks/',
  },
};

const SITE_RELEASES: ActivityEntry[] = [
  {
    id: 'site-release-2026-02-24',
    date: '2026-02-24T10:00:00Z',
    category: 'site',
    title: 'Shipped specialist leaderboards and provider comparison routes',
    detail: 'Added fastest, cheapest, best value, multimodal, context, reasoning, and provider comparison pages.',
    href: '/leaderboard/',
  },
  {
    id: 'site-release-2026-02-22',
    date: '2026-02-22T10:00:00Z',
    category: 'site',
    title: 'Initial public launch of the hub',
    detail: 'Published the first live version with model comparison, benchmarks, pricing, news, tools, and guides.',
    href: '/about/',
  },
];

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function normaliseDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T12:00:00Z`;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed.replace(' ', 'T')}Z`;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed.replace(' ', 'T')}:00Z`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return `${trimmed}${trimmed.endsWith('Z') ? '' : 'Z'}`;
  }

  return trimmed;
}

function latestDateTime(...values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => normaliseDateTime(value))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a));

  return timestamps[0] ?? null;
}

function readCacheArray<T>(name: string): T[] {
  const filePath = path.join(CACHE_DIR, `${name}.json`);
  if (!existsSync(filePath)) return [];
  return JSON.parse(readFileSync(filePath, 'utf8')) as T[];
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function parseHumanDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const isoLike = value.match(/\d{4}-\d{2}-\d{2}/);
  if (isoLike) return isoLike[0];

  const ukDate = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!ukDate) return null;
  return `${ukDate[3]}-${ukDate[2]}-${ukDate[1]}`;
}

function hostLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname.split('.')[0] ?? hostname;
  } catch {
    return 'Source';
  }
}

function parseDigestFile(filePath: string, fileName: string): LatestDigest | null {
  const fileDateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  if (!fileDateMatch) return null;

  const digestDate = fileDateMatch[1];
  const content = readFileSync(filePath, 'utf8');
  const headerMatch = content.match(/\*\*(\d{4}-\d{2}-\d{2})\*\*\s+\|\s+(\d+)\s+stories\s+\|\s+Auto-generated from\s+(\d+)\s+sources/i);

  const blocks = content.split(/\n---\n/);
  const entries: ParsedDigestEntry[] = [];

  for (const block of blocks) {
    const heading = block.match(/^##\s+\[(.+?)\]\((.+?)\)/m);
    if (!heading) continue;

    const meta = block.match(/^\*([^*]+)\*(?:\s+\|\s+([^|\n]+))?(?:\s+\|\s+Score:\s*([0-9.]+))?/m);
    const tagLine = block.match(/^Tags:\s*(.+)$/m);
    const quoteLines = Array.from(block.matchAll(/^>\s*(.+)$/gm)).map((match) => match[1].trim());

    const title = heading[1].trim();
    const url = heading[2].trim();
    const source = meta?.[1]?.trim() || hostLabel(url);
    const publishedDate = parseHumanDate(meta?.[2]?.trim()) ?? digestDate;
    const score = meta?.[3] ? Number(meta[3]) : null;

    entries.push({
      id: `${digestDate}-${slugify(title)}`,
      title,
      url,
      source,
      summary: quoteLines.join(' ').trim(),
      score: Number.isFinite(score) ? score : null,
      publishedDate,
      digestDate,
      tags: tagLine?.[1]?.split(',').map((item) => item.trim()).filter(Boolean) ?? [],
    });
  }

  return {
    digestDate: headerMatch?.[1] ?? digestDate,
    storyCount: headerMatch?.[2] ? Number(headerMatch[2]) : entries.length,
    sourceCount: headerMatch?.[3] ? Number(headerMatch[3]) : null,
    entries,
  };
}

export function getLatestDigest(): LatestDigest | null {
  for (const directory of DIGEST_SEARCH_DIRS) {
    if (!existsSync(directory)) continue;

    const files = readdirSync(directory)
      .filter((name) => /(^digest-\d{4}-\d{2}-\d{2}\.md$)|(^\d{4}-\d{2}-\d{2}-digest\.md$)/.test(name))
      .sort()
      .reverse();

    for (const fileName of files) {
      const parsed = parseDigestFile(path.join(directory, fileName), fileName);
      if (parsed && parsed.entries.length > 0) return parsed;
    }
  }

  return null;
}

function toModalityList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normaliseBenchmarkScore(score: BenchmarkScoreRow, benchmark: BenchmarkDefinition): number {
  const value = toNumber(score.score);
  const min = toNumber((benchmark as { scale_min?: number | string | null }).scale_min ?? 0);
  const rawMax = toNumber((benchmark as { scale_max?: number | string | null }).scale_max ?? 100);
  const max = rawMax > min ? rawMax : 100;
  const ratio = (value - min) / (max - min);
  const higherIsBetter = benchmark.higher_is_better !== false;
  const scaled = higherIsBetter ? ratio * 100 : (1 - ratio) * 100;
  return Math.max(0, Math.min(100, scaled));
}

function getCategoryLabel(category: string): string {
  return BEST_FOR_LABELS[category] ?? category.replace(/-/g, ' ');
}

function getBestForLabel(categoryScores: Map<string, { total: number; weight: number }>): string {
  let bestCategory = 'reasoning';
  let bestScore = -1;

  for (const [category, value] of categoryScores.entries()) {
    const average = value.weight > 0 ? value.total / value.weight : 0;
    if (average > bestScore) {
      bestScore = average;
      bestCategory = category;
    }
  }

  return getCategoryLabel(bestCategory);
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

function getFrontierEvidence(
  benchmarkCount: number,
  qualityScore: number,
): Pick<FrontierNowEntry, 'evidenceLabel' | 'evidenceState'> {
  if (benchmarkCount >= 4) {
    return {
      evidenceLabel: `${benchmarkCount} benchmark tracks`,
      evidenceState: 'scored',
    };
  }

  if (benchmarkCount >= 2 || qualityScore > 0) {
    return {
      evidenceLabel: benchmarkCount >= 2 ? `${benchmarkCount} public evals` : 'quality layer only',
      evidenceState: 'partial',
    };
  }

  return {
    evidenceLabel: 'tracking official release',
    evidenceState: 'tracking',
  };
}

export function getMetaLeaderboard(limit = 10): MetaLeaderboardEntry[] {
  const models = getPublicModelsByCategory('llm');
  const benchmarks = getBenchmarks().filter((benchmark) => toNumber(benchmark.weight) > 0);
  const benchmarkScores = getBenchmarkScores().filter((row) => row.model_category === 'llm');
  const benchmarkMap = new Map(benchmarks.map((benchmark) => [benchmark.id, benchmark]));
  const totalWeight = benchmarks.reduce((sum, benchmark) => sum + toNumber(benchmark.weight), 0);
  const scoresByModel = new Map<string, BenchmarkScoreRow[]>();
  const latestByProvider = buildProviderLatestReleaseMap(models);

  for (const score of benchmarkScores) {
    if (!scoresByModel.has(score.model_id)) scoresByModel.set(score.model_id, []);
    scoresByModel.get(score.model_id)?.push(score);
  }

  return models
    .map((model): MetaLeaderboardEntry | null => {
      const scores = (scoresByModel.get(model.id) ?? []).filter((row) => benchmarkMap.has(row.benchmark_id));
      const categoryScores = new Map<string, { total: number; weight: number }>();
      let weightedScoreTotal = 0;
      let coveredWeight = 0;

      for (const score of scores) {
        const benchmark = benchmarkMap.get(score.benchmark_id);
        if (!benchmark) continue;

        const weight = toNumber(benchmark.weight);
        const normalized = normaliseBenchmarkScore(score, benchmark);
        weightedScoreTotal += normalized * weight;
        coveredWeight += weight;

        const current = categoryScores.get(benchmark.category) ?? { total: 0, weight: 0 };
        current.total += normalized * weight;
        current.weight += weight;
        categoryScores.set(benchmark.category, current);
      }

      const benchmarkScore = coveredWeight > 0 ? weightedScoreTotal / coveredWeight : 0;
      const coverageRatio = totalWeight > 0 ? coveredWeight / totalWeight : 0;
      const coverageFactor = Math.min(1, coverageRatio / 0.55);
      const qualityScore = toNumber(model.quality_score);
      const freshnessScore = getFreshnessScore(model.released);

      if (scores.length === 0 && qualityScore === 0) return null;

      const baseScore = benchmarkScore * 0.5 + qualityScore * 0.25 + freshnessScore * 0.25;
      const metaScore = baseScore
        * (0.7 + 0.3 * coverageFactor)
        * getEvidenceFactor(scores.length)
        * getStatusMultiplier(model.status)
        * getProviderAgePenalty(model, latestByProvider)
        * getVariantPenalty(model.name);

      return {
        id: model.id,
        name: model.name,
        provider: model.provider_name,
        providerColour: model.provider_colour,
        status: model.status,
        metaScore: Number(metaScore.toFixed(1)),
        benchmarkScore: Number(benchmarkScore.toFixed(1)),
        qualityScore,
        freshnessScore,
        benchmarkCount: scores.length,
        coverageRatio: Number(coverageRatio.toFixed(3)),
        bestFor: scores.length > 0 ? getBestForLabel(categoryScores) : 'Frontier tracking',
        inputPrice: toNumber(model.input_price),
        outputPrice: toNumber(model.output_price),
        contextWindow: toNumber(model.context_window),
        valueScore: (() => {
          const blended = (toNumber(model.input_price) + 3 * toNumber(model.output_price)) / 4;
          return blended > 0 && qualityScore > 0 ? Math.round((qualityScore / blended) * 10) : 0;
        })(),
        released: model.released || null,
        openSource: Boolean(model.open_source),
        apiAvailable: Boolean(model.api_available),
        modality: toModalityList(model.modality),
      };
    })
    .filter((model): model is MetaLeaderboardEntry => Boolean(model))
    .sort((a, b) =>
      b.metaScore - a.metaScore ||
      b.freshnessScore - a.freshnessScore ||
      b.benchmarkScore - a.benchmarkScore ||
      b.qualityScore - a.qualityScore ||
      a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getFrontierNow(limit = 10): FrontierNowEntry[] {
  const models = getPublicModelsByCategory('llm');
  const benchmarkScores = getBenchmarkScores().filter((row) => row.model_category === 'llm');
  const scoreCounts = new Map<string, number>();

  for (const row of benchmarkScores) {
    scoreCounts.set(row.model_id, (scoreCounts.get(row.model_id) ?? 0) + 1);
  }

  const priorityOrder = new Map<string, number>(FRONTIER_NOW_PRIORITY_IDS.map((id, index) => [id, index]));

  return models
    .filter((model) => (
      priorityOrder.has(model.id)
      || (model.released ? Date.parse(model.released) >= Date.now() - (1000 * 60 * 60 * 24 * 180) : false)
      || (scoreCounts.get(model.id) ?? 0) > 0
      || toNumber(model.quality_score) > 0
    ))
    .map((model): FrontierNowEntry => {
      const benchmarkCount = scoreCounts.get(model.id) ?? 0;
      const qualityScore = toNumber(model.quality_score);

      return {
        id: model.id,
        name: model.name,
        provider: model.provider_name,
        providerColour: model.provider_colour,
        status: model.status,
        released: model.released || null,
        inputPrice: toNumber(model.input_price),
        outputPrice: toNumber(model.output_price),
        contextWindow: toNumber(model.context_window),
        qualityScore,
        benchmarkCount,
        coverageRatio: benchmarkCount > 0 ? Number((benchmarkCount / 11).toFixed(3)) : 0,
        openSource: Boolean(model.open_source),
        apiAvailable: Boolean(model.api_available),
        modality: toModalityList(model.modality),
        ...getFrontierEvidence(benchmarkCount, qualityScore),
      };
    })
    .sort((a, b) => {
      const priorityDelta = (priorityOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (priorityOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER);
      if (priorityDelta !== 0) return priorityDelta;

      const releaseDelta = Date.parse(b.released ?? '') - Date.parse(a.released ?? '');
      if (Number.isFinite(releaseDelta) && releaseDelta !== 0) return releaseDelta;

      return b.qualityScore - a.qualityScore || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getAgiOverview(): AgiOverview {
  const models = getLLMModelsFromDB().filter((model) => Boolean(model.released));
  const benchmarks = getBenchmarks().filter((benchmark) => AGI_BENCHMARK_WEIGHTS[benchmark.id]);
  const benchmarkScores = getBenchmarkScores().filter((row) => AGI_BENCHMARK_WEIGHTS[row.benchmark_id]);
  const benchmarkMap = new Map(benchmarks.map((benchmark) => [benchmark.id, benchmark]));
  const scoreMap = new Map<string, BenchmarkScoreRow[]>();

  for (const row of benchmarkScores) {
    if (!scoreMap.has(row.model_id)) scoreMap.set(row.model_id, []);
    scoreMap.get(row.model_id)?.push(row);
  }

  const ranked = models
    .map((model) => {
      const rows = scoreMap.get(model.id) ?? [];
      let total = 0;
      let weight = 0;

      for (const row of rows) {
        const benchmark = benchmarkMap.get(row.benchmark_id);
        if (!benchmark) continue;
        const benchmarkWeight = AGI_BENCHMARK_WEIGHTS[row.benchmark_id];
        total += normaliseBenchmarkScore(row, benchmark) * benchmarkWeight;
        weight += benchmarkWeight;
      }

      const score = weight > 0 ? total / weight : null;
      return {
        modelId: model.id,
        modelName: model.name,
        released: model.released as string,
        score,
        benchmarkCount: rows.length,
      };
    })
    .filter((entry): entry is { modelId: string; modelName: string; released: string; score: number; benchmarkCount: number } => entry.score !== null)
    .sort((a, b) => a.released.localeCompare(b.released));

  const eligible = ranked.filter((entry) => entry.benchmarkCount >= 2);
  const frontierPoints: AgiFrontierPoint[] = [];
  let frontierScore = -1;

  for (const entry of eligible) {
    if (entry.score <= frontierScore) continue;
    frontierScore = entry.score;
    frontierPoints.push({
      label: new Date(entry.released).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      modelId: entry.modelId,
      modelName: entry.modelName,
      released: entry.released,
      score: Number(entry.score.toFixed(1)),
      benchmarkCount: entry.benchmarkCount,
    });
  }

  const currentLeader = frontierPoints.at(-1) ?? null;
  const latestFrontierDate = currentLeader ? new Date(currentLeader.released) : null;
  let twelveMonthGain = 0;

  if (currentLeader && latestFrontierDate && frontierPoints.length > 1) {
    const cutoff = new Date(latestFrontierDate);
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const baseline = [...frontierPoints]
      .reverse()
      .find((point) => new Date(point.released) <= cutoff) ?? frontierPoints[0];

    twelveMonthGain = Number((currentLeader.score - baseline.score).toFixed(1));
  }

  let strongestBenchmark: { name: string; score: number } | null = null;
  if (currentLeader) {
    const leaderRows = scoreMap.get(currentLeader.modelId) ?? [];
    strongestBenchmark = leaderRows.reduce<{ name: string; score: number } | null>((best, row) => {
      const benchmark = benchmarkMap.get(row.benchmark_id);
      if (!benchmark) return best;
      const normalized = normaliseBenchmarkScore(row, benchmark);
      if (!best || normalized > best.score) {
        return {
          name: benchmark.name,
          score: Number(normalized.toFixed(1)),
        };
      }
      return best;
    }, null);
  }

  const benchmarkUpdatedAt = latestDateTime(
    ...benchmarks.map((benchmark) => ('updated_at' in benchmark ? String(benchmark.updated_at ?? '') : null)),
    ...benchmarkScores.map((score) => score.updated_at ?? score.measured_at ?? null),
  );

  return {
    frontierPoints,
    currentLeader,
    twelveMonthGain,
    strongestBenchmark,
    updatedAt: benchmarkUpdatedAt,
  };
}

export function getDataPulse(basePath = '/'): DataPulseEntry[] {
  const digest = getLatestDigest();
  const jobsOverview = getAIJobsOverview();
  const benchmarkRefresh = latestDateTime(
    getLastScrapeTime('quality-scores'),
    getLastScrapeTime('benchmarks:open-llm-leaderboard'),
    getLastScrapeTime('benchmarks:chatbot-arena'),
  );

  return [
    {
      id: 'meta',
      label: 'Evaluated composite',
      note: `${getBenchmarks().length} benchmark tracks feed the benchmark-backed scored view.`,
      updatedAt: benchmarkRefresh,
      href: `${basePath}leaderboard/`,
    },
    {
      id: 'pricing',
      label: 'Pricing & value',
      note: 'Official provider pricing and routed API cost references.',
      updatedAt: latestDateTime(getLastScrapeTime('official-pricing'), getLastScrapeTime('pricing:openrouter')),
      href: `${basePath}compare/llm/`,
    },
    {
      id: 'speed',
      label: 'Speed measurements',
      note: 'Latency and tokens-per-second snapshots for tracked models.',
      updatedAt: getLastScrapeTime('speed'),
      href: `${basePath}speed/`,
    },
    {
      id: 'jobs',
      label: 'Jobs market',
      note: `${jobsOverview.total_open_roles.toLocaleString('en-GB')} live roles across tracked company boards.`,
      updatedAt: jobsOverview.latest_snapshot_date ? normaliseDateTime(jobsOverview.latest_snapshot_date) : null,
      href: `${basePath}jobs/`,
    },
    {
      id: 'digest',
      label: 'Daily digest',
      note: digest
        ? `${digest.storyCount ?? digest.entries.length} stories from ${digest.sourceCount ?? 'tracked'} sources in the latest brief.`
        : 'Waiting for the latest digest publish.',
      updatedAt: digest ? normaliseDateTime(digest.digestDate) : null,
      href: `${basePath}news/`,
    },
  ];
}

function latestScrapeActivities(basePath: string): ActivityEntry[] {
  const logs = readCacheArray<CacheScrapeLog>('scrape_log')
    .filter((entry) => entry.status === 'success' || entry.status === 'computed')
    .sort((a, b) => Date.parse(normaliseDateTime(b.finished_at) ?? '') - Date.parse(normaliseDateTime(a.finished_at) ?? ''));

  const latestByScraper = new Map<string, CacheScrapeLog>();
  for (const log of logs) {
    if (!latestByScraper.has(log.scraper)) latestByScraper.set(log.scraper, log);
  }

  const entries = Array.from(latestByScraper.values())
    .map((entry) => {
      const config = SCRAPER_ACTIVITY_LABELS[entry.scraper];
      if (!config) return null;

      return {
        id: `scrape-${entry.scraper}`,
        date: normaliseDateTime(entry.finished_at) ?? normaliseDateTime(entry.started_at) ?? new Date(0).toISOString(),
        category: 'data' as const,
        title: config.title,
        detail: config.detail,
        href: `${basePath}${config.href.replace(/^\//, '')}`,
      };
    });

  return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function recentModelActivities(basePath: string): ActivityEntry[] {
  const recentModels = getRecentModels(8) as RecentModel[];
  return recentModels.map((model) => ({
    id: `model-${model.id}`,
    date: normaliseDateTime(model.released) ?? new Date(0).toISOString(),
    category: 'models' as const,
    title: `${model.name} added to the comparison layer`,
    detail: `${model.provider} now appears in the live model index and ranking surfaces.`,
    href: `${basePath}models/${model.id}/`,
  }));
}

function digestActivities(basePath: string): ActivityEntry[] {
  const digest = getLatestDigest();
  if (!digest) return [];

  const summaryEntry: ActivityEntry = {
    id: `digest-${digest.digestDate}`,
    date: normaliseDateTime(digest.digestDate) ?? new Date(0).toISOString(),
    category: 'digest',
    title: `Published the ${digest.digestDate} daily digest`,
    detail: `${digest.storyCount ?? digest.entries.length} stories captured from ${digest.sourceCount ?? 'tracked'} sources.`,
    href: `${basePath}news/`,
  };

  const storyEntries = digest.entries.slice(0, 3).map((entry) => ({
    id: `digest-story-${entry.id}`,
    date: normaliseDateTime(entry.publishedDate ?? digest.digestDate) ?? new Date(0).toISOString(),
    category: 'digest' as const,
    title: entry.title,
    detail: `${entry.source} featured in the latest daily brief.`,
    href: entry.url,
  }));

  return [summaryEntry, ...storyEntries];
}

function jobsActivities(basePath: string, jobsOverview: JobsOverview): ActivityEntry[] {
  if (!jobsOverview.latest_snapshot_date) return [];

  return [
    {
      id: `jobs-${jobsOverview.latest_snapshot_date}`,
      date: normaliseDateTime(jobsOverview.latest_snapshot_date) ?? new Date(0).toISOString(),
      category: 'jobs',
      title: 'Jobs market snapshot refreshed',
      detail: `${jobsOverview.total_open_roles.toLocaleString('en-GB')} open roles across ${jobsOverview.tracked_companies} tracked companies.`,
      href: `${basePath}jobs/`,
    },
  ];
}

function reportActivities(basePath: string): ActivityEntry[] {
  const reports = readCacheArray<CacheReport>('reports').slice(0, 2);
  const events = readCacheArray<CacheEvent>('events').slice(0, 2);

  const reportEntries = reports.map((report) => ({
    id: `report-${report.id}`,
    date: normaliseDateTime(report.updated_at) ?? new Date(0).toISOString(),
    category: 'data' as const,
    title: `${report.name} is tracked in the reports index`,
    detail: `${report.publisher} is now part of the recurring reports watchlist.`,
    href: `${basePath}reports/`,
  }));

  const eventEntries = events.map((event) => ({
    id: `event-${event.id}`,
    date: normaliseDateTime(event.updated_at ?? event.date_start) ?? new Date(0).toISOString(),
    category: 'data' as const,
    title: `${event.name} appears in the events watchlist`,
    detail: `Tracked as a ${event.category} signal date in the hub calendar.`,
    href: `${basePath}events/`,
  }));

  return [...reportEntries, ...eventEntries];
}

export function getLatestActivities(limit = 18, basePath = '/'): ActivityEntry[] {
  const jobsOverview = getAIJobsOverview();
  const entries = [
    ...SITE_RELEASES.map((entry) => ({
      ...entry,
      href: entry.href ? `${basePath}${entry.href.replace(/^\//, '')}` : null,
    })),
    ...recentModelActivities(basePath),
    ...latestScrapeActivities(basePath),
    ...digestActivities(basePath),
    ...jobsActivities(basePath, jobsOverview),
    ...reportActivities(basePath),
  ];

  return entries
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.title.localeCompare(b.title))
    .slice(0, limit);
}
