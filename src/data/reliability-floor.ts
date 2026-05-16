import {
  getBenchmarks,
  getBenchmarkScores,
  getPublicModelsByCategory,
} from '../db/queries';
import { getFrontierNow, normaliseDateTime } from './hub-dashboard';

type PublicModel = ReturnType<typeof getPublicModelsByCategory>[number];
type BenchmarkDefinition = ReturnType<typeof getBenchmarks>[number];
type BenchmarkScoreRow = ReturnType<typeof getBenchmarkScores>[number];

export type ReliabilityDimensionId =
  | 'factuality'
  | 'groundedness'
  | 'retrieval'
  | 'instruction_following'
  | 'memory_abstention';

export type ReliabilityEvidenceLabel =
  | 'Tracking'
  | 'Partial evidence'
  | 'Promising'
  | 'Reliable for general use'
  | 'Floor not cleared';

export interface ReliabilityDimensionDefinition {
  id: ReliabilityDimensionId;
  label: string;
  shortLabel: string;
  weight: number;
  critical: boolean;
  description: string;
}

export interface ReliabilitySourceDefinition {
  id: string;
  name: string;
  dimension: ReliabilityDimensionId;
  benchmarkIds: string[];
  sourceUrl: string;
  sourceType: 'official' | 'benchmark-maintainer' | 'research' | 'community';
  promptContext: string;
  harnessContext: string;
  judgeContext: string;
  notes: string;
}

export interface ReliabilitySourceScore {
  sourceId: string;
  sourceName: string;
  benchmarkId: string;
  rawScore: number;
  normalizedScore: number;
  sourceUrl: string | null;
  sourceType: ReliabilitySourceDefinition['sourceType'];
  promptContext: string;
  harnessContext: string;
  judgeContext: string;
  measuredAt: string | null;
  updatedAt: string | null;
}

export interface ReliabilityDimensionScore {
  id: ReliabilityDimensionId;
  label: string;
  shortLabel: string;
  weight: number;
  critical: boolean;
  score: number | null;
  evidenceStatus: 'scored' | 'missing';
  sourceScores: ReliabilitySourceScore[];
}

export interface ReliabilityFloorEntry {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  status: string;
  released: string | null;
  evidenceLabel: ReliabilityEvidenceLabel;
  floorScore: number | null;
  weightedAverage: number | null;
  weakestCriticalScore: number | null;
  evidenceCoverage: number;
  scoredDimensions: number;
  requiredDimensions: number;
  isRankEligible: boolean;
  reasonIfNotEligible: string;
  dimensions: ReliabilityDimensionScore[];
  lastUpdated: string | null;
}

export const RELIABILITY_DIMENSIONS: ReliabilityDimensionDefinition[] = [
  {
    id: 'factuality',
    label: 'Factual accuracy',
    shortLabel: 'Facts',
    weight: 0.25,
    critical: true,
    description: 'Does the model answer verifiable questions accurately instead of confidently guessing?',
  },
  {
    id: 'groundedness',
    label: 'Groundedness',
    shortLabel: 'Grounding',
    weight: 0.2,
    critical: true,
    description: 'Does the model stay faithful to supplied sources and avoid unsupported claims?',
  },
  {
    id: 'retrieval',
    label: 'Retrieval',
    shortLabel: 'Retrieval',
    weight: 0.2,
    critical: true,
    description: 'Can the model find and use the right information inside long or noisy context?',
  },
  {
    id: 'instruction_following',
    label: 'Instruction following',
    shortLabel: 'Instructions',
    weight: 0.2,
    critical: true,
    description: 'Does the model follow exact user constraints, formats, exclusions, and ordering?',
  },
  {
    id: 'memory_abstention',
    label: 'Memory and abstention',
    shortLabel: 'Memory',
    weight: 0.15,
    critical: false,
    description: 'Can the model preserve relevant user information and admit when evidence is missing?',
  },
];

export const RELIABILITY_SOURCES: ReliabilitySourceDefinition[] = [
  {
    id: 'simpleqa',
    name: 'SimpleQA',
    dimension: 'factuality',
    benchmarkIds: ['simpleqa'],
    sourceUrl: 'https://openai.com/index/introducing-simpleqa/',
    sourceType: 'official',
    promptContext: 'Published benchmark default; short fact-seeking prompts.',
    harnessContext: 'Simple factual QA harness with correct, incorrect, and not-attempted grading.',
    judgeContext: 'Benchmark-specific verifier and grading process.',
    notes: 'Good first signal for short factuality, but too narrow to prove broad reliability.',
  },
  {
    id: 'facts-grounding',
    name: 'FACTS Grounding',
    dimension: 'groundedness',
    benchmarkIds: ['facts-grounding'],
    sourceUrl: 'https://deepmind.google/blog/facts-grounding-a-new-benchmark-for-evaluating-the-factuality-of-large-language-models/',
    sourceType: 'benchmark-maintainer',
    promptContext: 'Published benchmark default; long-form answers grounded in supplied documents.',
    harnessContext: 'Eligibility check followed by factual-grounding judgement.',
    judgeContext: 'Multiple frontier LLM judges in the published setup.',
    notes: 'Tracked as a grounding source; no comparable local score rows are currently present.',
  },
  {
    id: 'ifeval',
    name: 'IFEval',
    dimension: 'instruction_following',
    benchmarkIds: ['ifeval'],
    sourceUrl: 'https://arxiv.org/abs/2311.07911',
    sourceType: 'research',
    promptContext: 'Zero-shot prompts with verifiable instruction constraints.',
    harnessContext: 'Rule-based checks for instruction constraints such as required words, counts, and format.',
    judgeContext: 'Deterministic validators where possible.',
    notes: 'Tracked as the first instruction-following source; score rows will rank once ingested.',
  },
  {
    id: 'ruler',
    name: 'RULER',
    dimension: 'retrieval',
    benchmarkIds: ['ruler'],
    sourceUrl: 'https://arxiv.org/abs/2404.06654',
    sourceType: 'research',
    promptContext: 'Synthetic long-context retrieval and tracing prompts.',
    harnessContext: 'Configurable long-context evaluation tasks beyond simple needle-in-haystack.',
    judgeContext: 'Task-specific exact or structured scoring.',
    notes: 'Useful retrieval stress test; should be paired with more realistic long-context sources.',
  },
  {
    id: 'helmet',
    name: 'HELMET',
    dimension: 'retrieval',
    benchmarkIds: ['helmet'],
    sourceUrl: 'https://huggingface.co/blog/helmet',
    sourceType: 'research',
    promptContext: 'Long-context task prompts across RAG, citations, summarization, and reranking.',
    harnessContext: 'Holistic long-context benchmark suite.',
    judgeContext: 'Task-specific scoring; varies by subtask.',
    notes: 'Better real-task counterweight to synthetic retrieval probes.',
  },
  {
    id: 'crag',
    name: 'CRAG',
    dimension: 'groundedness',
    benchmarkIds: ['crag'],
    sourceUrl: 'https://papers.nips.cc/paper_files/paper/2024/hash/1435d2d0fca85a84d83ddcb754f58c29-Abstract-Datasets_and_Benchmarks_Track.html',
    sourceType: 'research',
    promptContext: 'Factual QA with web and knowledge-graph retrieval simulation.',
    harnessContext: 'RAG benchmark where retrieval setup affects the final result.',
    judgeContext: 'Benchmark-specific factual QA scoring.',
    notes: 'Treat as RAG-system evidence rather than a pure base-model score.',
  },
  {
    id: 'longmemeval',
    name: 'LongMemEval',
    dimension: 'memory_abstention',
    benchmarkIds: ['longmemeval'],
    sourceUrl: 'https://openreview.net/forum?id=wIonk5yTDq',
    sourceType: 'research',
    promptContext: 'Multi-session assistant memory questions over long user histories.',
    harnessContext: 'Memory benchmark covering extraction, temporal reasoning, updates, and abstention.',
    judgeContext: 'Benchmark-specific answer matching and evaluation.',
    notes: 'Memory claims are easy to overstate; keep limitations visible.',
  },
  {
    id: 'livebench-instruction',
    name: 'LiveBench instruction tasks',
    dimension: 'instruction_following',
    benchmarkIds: ['livebench-instruction'],
    sourceUrl: 'https://livebench.ai/',
    sourceType: 'benchmark-maintainer',
    promptContext: 'Published LiveBench task setup; use only relevant instruction-following categories for this dimension.',
    harnessContext: 'Frequently refreshed objective benchmark tasks.',
    judgeContext: 'Objective ground-truth scoring where available.',
    notes: 'Local rows are currently aggregate LiveBench, so they remain context until category-level rows exist.',
  },
  {
    id: 'helm-reliability',
    name: 'HELM reliability scenarios',
    dimension: 'factuality',
    benchmarkIds: ['helm-reliability'],
    sourceUrl: 'https://crfm.stanford.edu/helm/',
    sourceType: 'research',
    promptContext: 'Scenario-specific HELM prompts; only reliability-relevant scenarios should be mapped into this floor.',
    harnessContext: 'Holistic Evaluation of Language Models harness with explicit scenarios, metrics, and adapters.',
    judgeContext: 'Scenario-specific automated metrics and human or model-graded evaluations where applicable.',
    notes: 'Tracked as provenance and future context. It is not scored locally until comparable reliability-specific HELM rows are ingested.',
  },
];

const CRITICAL_DIMENSION_IDS = RELIABILITY_DIMENSIONS.filter((dimension) => dimension.critical).map((dimension) => dimension.id);

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeBenchmarkScore(score: BenchmarkScoreRow, benchmark: BenchmarkDefinition | undefined): number {
  const value = toNumber(score.score);
  const min = toNumber((benchmark as { scale_min?: number | string | null } | undefined)?.scale_min ?? 0);
  const rawMax = toNumber((benchmark as { scale_max?: number | string | null } | undefined)?.scale_max ?? 100);
  const max = rawMax > min ? rawMax : 100;
  const higherIsBetter = benchmark?.higher_is_better !== false;
  const ratio = (value - min) / (max - min);
  const normalized = higherIsBetter ? ratio * 100 : (1 - ratio) * 100;
  return Math.max(0, Math.min(100, normalized));
}

function latestDate(values: Array<string | null | undefined>): string | null {
  return values
    .map((value) => normaliseDateTime(value))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}

function buildCandidateModels(models: PublicModel[], rows: BenchmarkScoreRow[]): PublicModel[] {
  const byId = new Map(models.map((model) => [model.id, model]));
  const candidateIds = new Set<string>();

  getFrontierNow(24).forEach((model) => candidateIds.add(model.id));
  rows.forEach((row) => candidateIds.add(row.model_id));

  return Array.from(candidateIds)
    .map((id) => byId.get(id))
    .filter((model): model is PublicModel => Boolean(model));
}

function getEntryLabel(
  scoredCriticalDimensions: number,
  scoredDimensions: number,
  weakestCriticalScore: number | null,
): ReliabilityEvidenceLabel {
  if (scoredDimensions === 0) return 'Tracking';
  if (scoredCriticalDimensions < CRITICAL_DIMENSION_IDS.length) return 'Partial evidence';
  if (weakestCriticalScore !== null && weakestCriticalScore < 70) return 'Floor not cleared';
  if (weakestCriticalScore !== null && weakestCriticalScore >= 85) return 'Reliable for general use';
  return 'Promising';
}

export function getReliabilityFloorEntries(limit = 40): ReliabilityFloorEntry[] {
  const models = getPublicModelsByCategory('llm');
  const benchmarkDefinitions = getBenchmarks();
  const benchmarkMap = new Map(benchmarkDefinitions.map((benchmark) => [benchmark.id, benchmark]));
  const sourceByBenchmarkId = new Map<string, ReliabilitySourceDefinition>();

  for (const source of RELIABILITY_SOURCES) {
    for (const benchmarkId of source.benchmarkIds) {
      sourceByBenchmarkId.set(benchmarkId, source);
    }
  }

  const sourceRows = getBenchmarkScores()
    .filter((row) => row.model_category === 'llm')
    .filter((row) => sourceByBenchmarkId.has(row.benchmark_id));
  const rowsByModel = new Map<string, BenchmarkScoreRow[]>();

  for (const row of sourceRows) {
    if (!rowsByModel.has(row.model_id)) rowsByModel.set(row.model_id, []);
    rowsByModel.get(row.model_id)?.push(row);
  }

  return buildCandidateModels(models, sourceRows)
    .map((model): ReliabilityFloorEntry => {
      const modelRows = rowsByModel.get(model.id) ?? [];

      const dimensions = RELIABILITY_DIMENSIONS.map((dimension): ReliabilityDimensionScore => {
        const sourceScores = modelRows
          .map((row): ReliabilitySourceScore | null => {
            const source = sourceByBenchmarkId.get(row.benchmark_id);
            if (!source || source.dimension !== dimension.id) return null;

            const benchmark = benchmarkMap.get(row.benchmark_id);
            return {
              sourceId: source.id,
              sourceName: source.name,
              benchmarkId: row.benchmark_id,
              rawScore: toNumber(row.score),
              normalizedScore: Number(normalizeBenchmarkScore(row, benchmark).toFixed(1)),
              sourceUrl: row.source_url || benchmark?.url || source.sourceUrl,
              sourceType: source.sourceType,
              promptContext: source.promptContext,
              harnessContext: source.harnessContext,
              judgeContext: source.judgeContext,
              measuredAt: row.measured_at || null,
              updatedAt: row.updated_at || null,
            };
          })
          .filter((row): row is ReliabilitySourceScore => Boolean(row));

        const score = sourceScores.length > 0
          ? Number((sourceScores.reduce((sum, row) => sum + row.normalizedScore, 0) / sourceScores.length).toFixed(1))
          : null;

        return {
          ...dimension,
          score,
          evidenceStatus: score === null ? 'missing' : 'scored',
          sourceScores,
        };
      });

      const scoredDimensions = dimensions.filter((dimension) => dimension.score !== null);
      const criticalDimensions = dimensions.filter((dimension) => dimension.critical);
      const scoredCriticalDimensions = criticalDimensions.filter((dimension) => dimension.score !== null);
      const hasAllCriticalDimensions = scoredCriticalDimensions.length === criticalDimensions.length;
      const weightedTotal = scoredDimensions.reduce((sum, dimension) => sum + (dimension.score ?? 0) * dimension.weight, 0);
      const coveredWeight = scoredDimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
      const weightedAverage = coveredWeight > 0 ? Number((weightedTotal / coveredWeight).toFixed(1)) : null;
      const weakestCriticalScore = hasAllCriticalDimensions
        ? Math.min(...criticalDimensions.map((dimension) => dimension.score ?? 0))
        : null;
      const floorScore = weightedAverage !== null && weakestCriticalScore !== null
        ? Number(Math.min(weightedAverage, weakestCriticalScore + 10).toFixed(1))
        : null;
      const evidenceCoverage = Number((scoredDimensions.length / RELIABILITY_DIMENSIONS.length).toFixed(2));
      const evidenceLabel = getEntryLabel(scoredCriticalDimensions.length, scoredDimensions.length, weakestCriticalScore);
      const isRankEligible = floorScore !== null && hasAllCriticalDimensions;

      return {
        id: model.id,
        name: model.name,
        provider: model.provider_name,
        providerColour: model.provider_colour,
        status: model.status,
        released: model.released || null,
        evidenceLabel,
        floorScore,
        weightedAverage,
        weakestCriticalScore,
        evidenceCoverage,
        scoredDimensions: scoredDimensions.length,
        requiredDimensions: RELIABILITY_DIMENSIONS.length,
        isRankEligible,
        reasonIfNotEligible: isRankEligible
          ? ''
          : `Needs all ${CRITICAL_DIMENSION_IDS.length} critical dimensions before it can be ranked as reliable.`,
        dimensions,
        lastUpdated: latestDate(modelRows.flatMap((row) => [row.updated_at, row.measured_at])),
      };
    })
    .sort((a, b) => {
      if (a.isRankEligible !== b.isRankEligible) return a.isRankEligible ? -1 : 1;
      return (b.floorScore ?? -1) - (a.floorScore ?? -1)
        || b.scoredDimensions - a.scoredDimensions
        || Date.parse(b.released ?? '') - Date.parse(a.released ?? '')
        || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getReliabilityFloorOverview() {
  const entries = getReliabilityFloorEntries(48);
  const ranked = entries.filter((entry) => entry.isRankEligible);
  const partial = entries.filter((entry) => !entry.isRankEligible && entry.scoredDimensions > 0);
  const tracking = entries.filter((entry) => entry.scoredDimensions === 0);
  const lastUpdated = latestDate(entries.map((entry) => entry.lastUpdated));

  return {
    entries,
    ranked,
    partial,
    tracking,
    sources: RELIABILITY_SOURCES,
    dimensions: RELIABILITY_DIMENSIONS,
    lastUpdated,
  };
}
