export interface VerifiedBenchmarkScoreEvidence {
  modelId: string;
  benchmarkId: string;
  score: number;
  source: string;
  sourceUrl: string;
  measuredAt: string;
  evidenceNote: string;
}

export interface UnresolvedBenchmarkScoreReview {
  modelId: string;
  benchmarkId: string;
  reason: string;
}

const OPENAI_GPT5_URL = 'https://openai.com/index/introducing-gpt-5-for-developers/';
const OPENAI_GPT5_SYSTEM_CARD_URL = 'https://cdn.openai.com/gpt-5-system-card.pdf';
const OPENAI_GPT52_URL = 'https://openai.com/index/introducing-gpt-5-2/';
const OPENAI_GPT45_URL = 'https://openai.com/index/introducing-gpt-4-5/';
const OPENAI_SIMPLEQA_URL = 'https://cdn.openai.com/papers/simpleqa.pdf';
const GOOGLE_GEMINI25_URL = 'https://storage.googleapis.com/model-cards/documents/gemini-2.5-pro.pdf';
const DEEPSEEK_R1_URL = 'https://github.com/deepseek-ai/DeepSeek-R1';
const DEEPSEEK_R1_0528_URL = 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528';
const META_LLAMA4_MAVERICK_URL = 'https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct';
const MICROSOFT_PHI4_REASONING_URL = 'https://huggingface.co/microsoft/Phi-4-reasoning';

/**
 * Exact, row-level public evidence. These entries intentionally replace
 * provider-release-date estimates and correct several AIME 2024 values that
 * had been filed as AIME 2025.
 */
export const VERIFIED_BENCHMARK_SCORE_EVIDENCE: readonly VerifiedBenchmarkScoreEvidence[] = [
  {
    modelId: 'deepseek-r1',
    benchmarkId: 'aime-2025',
    score: 70.0,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_0528_URL,
    measuredAt: '2025-05-28',
    evidenceNote: 'DeepSeek R1 0528 model card comparison reports base R1 AIME 2025 pass@1 as 70.0.',
  },
  {
    modelId: 'deepseek-r1',
    benchmarkId: 'gpqa-diamond',
    score: 71.5,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_URL,
    measuredAt: '2025-01-20',
    evidenceNote: 'DeepSeek R1 model card reports GPQA Diamond pass@1 as 71.5.',
  },
  {
    modelId: 'deepseek-r1',
    benchmarkId: 'humanitys-last-exam',
    score: 8.5,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_0528_URL,
    measuredAt: '2025-05-28',
    evidenceNote: 'DeepSeek R1 0528 model card comparison reports base R1 HLE pass@1 as 8.5.',
  },
  {
    modelId: 'deepseek-r1-0528',
    benchmarkId: 'aime-2025',
    score: 87.5,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_0528_URL,
    measuredAt: '2025-05-28',
    evidenceNote: 'DeepSeek R1 0528 model card reports AIME 2025 pass@1 as 87.5.',
  },
  {
    modelId: 'deepseek-r1-0528',
    benchmarkId: 'gpqa-diamond',
    score: 81.0,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_0528_URL,
    measuredAt: '2025-05-28',
    evidenceNote: 'DeepSeek R1 0528 model card reports GPQA Diamond pass@1 as 81.0.',
  },
  {
    modelId: 'deepseek-r1-0528',
    benchmarkId: 'swe-bench-verified',
    score: 57.6,
    source: 'DeepSeek',
    sourceUrl: DEEPSEEK_R1_0528_URL,
    measuredAt: '2025-05-28',
    evidenceNote: 'DeepSeek R1 0528 model card reports SWE-bench Verified resolved as 57.6.',
  },
  {
    modelId: 'gemini-2.5-pro',
    benchmarkId: 'aime-2025',
    score: 86.7,
    source: 'Google',
    sourceUrl: GOOGLE_GEMINI25_URL,
    measuredAt: '2025-03-25',
    evidenceNote: 'Google model card reports Gemini 2.5 Pro Experimental 03-25 AIME 2025 pass@1 as 86.7.',
  },
  {
    modelId: 'gemini-2.5-pro',
    benchmarkId: 'gpqa-diamond',
    score: 84.0,
    source: 'Google',
    sourceUrl: GOOGLE_GEMINI25_URL,
    measuredAt: '2025-03-25',
    evidenceNote: 'Google model card reports Gemini 2.5 Pro Experimental 03-25 GPQA Diamond pass@1 as 84.0.',
  },
  {
    modelId: 'gemini-2.5-pro',
    benchmarkId: 'simpleqa',
    score: 52.9,
    source: 'Google',
    sourceUrl: GOOGLE_GEMINI25_URL,
    measuredAt: '2025-03-25',
    evidenceNote: 'Google model card reports Gemini 2.5 Pro Experimental 03-25 SimpleQA as 52.9.',
  },
  {
    modelId: 'gemini-2.5-pro',
    benchmarkId: 'swe-bench-verified',
    score: 63.8,
    source: 'Google',
    sourceUrl: GOOGLE_GEMINI25_URL,
    measuredAt: '2025-03-25',
    evidenceNote: 'Google model card reports Gemini 2.5 Pro Experimental 03-25 SWE-bench Verified as 63.8.',
  },
  {
    modelId: 'gpt-5',
    benchmarkId: 'gpqa-diamond',
    score: 85.7,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 developer launch reports GPT-5 high GPQA Diamond as 85.7.',
  },
  {
    modelId: 'gpt-5',
    benchmarkId: 'swe-bench-verified',
    score: 74.9,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 developer launch reports SWE-bench Verified as 74.9.',
  },
  {
    modelId: 'gpt-5',
    benchmarkId: 'simpleqa',
    score: 55.0,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_SYSTEM_CARD_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 system card reports gpt-5-thinking SimpleQA accuracy without web access as 0.55.',
  },
  {
    modelId: 'o3',
    benchmarkId: 'aime-2025',
    score: 88.9,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 benchmark table reports o3 high AIME 2025 without tools as 88.9.',
  },
  {
    modelId: 'o3',
    benchmarkId: 'gpqa-diamond',
    score: 83.3,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 benchmark table reports o3 high GPQA Diamond as 83.3.',
  },
  {
    modelId: 'o3',
    benchmarkId: 'swe-bench-verified',
    score: 69.1,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 benchmark table reports o3 high SWE-bench Verified as 69.1.',
  },
  {
    modelId: 'o3',
    benchmarkId: 'simpleqa',
    score: 54.0,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_SYSTEM_CARD_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 system card reports OpenAI o3 SimpleQA accuracy without web access as 0.54.',
  },
  {
    modelId: 'o4-mini',
    benchmarkId: 'aime-2025',
    score: 92.7,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 benchmark table reports o4-mini high AIME 2025 without tools as 92.7.',
  },
  {
    modelId: 'o4-mini',
    benchmarkId: 'gpqa-diamond',
    score: 81.4,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT5_URL,
    measuredAt: '2025-08-07',
    evidenceNote: 'OpenAI GPT-5 benchmark table reports o4-mini high GPQA Diamond as 81.4.',
  },
  {
    modelId: 'gpt-5.2',
    benchmarkId: 'gpqa-diamond',
    score: 92.4,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT52_URL,
    measuredAt: '2025-12-11',
    evidenceNote: 'OpenAI GPT-5.2 launch reports GPQA Diamond without tools as 92.4.',
  },
  {
    modelId: 'gpt-5.2',
    benchmarkId: 'humanitys-last-exam',
    score: 34.5,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT52_URL,
    measuredAt: '2025-12-11',
    evidenceNote: 'OpenAI GPT-5.2 launch reports HLE without tools as 34.5.',
  },
  {
    modelId: 'gpt-5.2',
    benchmarkId: 'mmmu-pro',
    score: 79.5,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT52_URL,
    measuredAt: '2025-12-11',
    evidenceNote: 'OpenAI GPT-5.2 launch reports MMMU Pro without tools as 79.5.',
  },
  {
    modelId: 'gpt-5.2',
    benchmarkId: 'swe-bench-verified',
    score: 80.0,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT52_URL,
    measuredAt: '2025-12-11',
    evidenceNote: 'OpenAI GPT-5.2 launch reports SWE-bench Verified as 80.0.',
  },
  {
    modelId: 'gpt-4.5',
    benchmarkId: 'gpqa-diamond',
    score: 71.4,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT45_URL,
    measuredAt: '2025-02-27',
    evidenceNote: 'OpenAI GPT-4.5 launch reports GPQA as 71.4.',
  },
  {
    modelId: 'gpt-4.5',
    benchmarkId: 'simpleqa',
    score: 62.5,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT45_URL,
    measuredAt: '2025-02-27',
    evidenceNote: 'OpenAI GPT-4.5 launch SimpleQA accuracy chart reports 62.5.',
  },
  {
    modelId: 'gpt-4o',
    benchmarkId: 'gpqa-diamond',
    score: 53.6,
    source: 'OpenAI',
    sourceUrl: OPENAI_GPT45_URL,
    measuredAt: '2025-02-27',
    evidenceNote: 'OpenAI GPT-4.5 launch comparison table reports GPT-4o GPQA as 53.6.',
  },
  {
    modelId: 'gpt-4o',
    benchmarkId: 'simpleqa',
    score: 38.2,
    source: 'OpenAI',
    sourceUrl: OPENAI_SIMPLEQA_URL,
    measuredAt: '2024-10-30',
    evidenceNote: 'OpenAI SimpleQA paper Table 3 reports GPT-4o correct answers as 38.2.',
  },
  {
    modelId: 'llama-4-maverick',
    benchmarkId: 'mgsm',
    score: 92.3,
    source: 'Meta',
    sourceUrl: META_LLAMA4_MAVERICK_URL,
    measuredAt: '2025-04-05',
    evidenceNote: 'Meta Llama 4 Maverick model card reports instruction-tuned MGSM 0-shot average exact match as 92.3.',
  },
  {
    modelId: 'phi-4-reasoning',
    benchmarkId: 'aime-2025',
    score: 62.9,
    source: 'Microsoft',
    sourceUrl: MICROSOFT_PHI4_REASONING_URL,
    measuredAt: '2025-04-30',
    evidenceNote: 'Microsoft Phi-4 Reasoning model card reports AIME 2025 as 62.9; 75.3 is its AIME 2024 result.',
  },
  {
    modelId: 'phi-4-reasoning',
    benchmarkId: 'gpqa-diamond',
    score: 65.8,
    source: 'Microsoft',
    sourceUrl: MICROSOFT_PHI4_REASONING_URL,
    measuredAt: '2025-04-30',
    evidenceNote: 'Microsoft Phi-4 Reasoning model card reports GPQA Diamond as 65.8.',
  },
  {
    modelId: 'qwen-qwq-32b',
    benchmarkId: 'aime-2025',
    score: 65.8,
    source: 'Microsoft evaluation',
    sourceUrl: MICROSOFT_PHI4_REASONING_URL,
    measuredAt: '2025-04-30',
    evidenceNote: 'Microsoft comparative evaluation reports QwQ 32B AIME 2025 as 65.8; Qwen reports 79.5 for AIME 2024.',
  },
  {
    modelId: 'qwen-qwq-32b',
    benchmarkId: 'gpqa-diamond',
    score: 59.5,
    source: 'Microsoft evaluation',
    sourceUrl: MICROSOFT_PHI4_REASONING_URL,
    measuredAt: '2025-04-30',
    evidenceNote: 'Microsoft comparative evaluation reports QwQ 32B GPQA Diamond as 59.5.',
  },
];

const unresolvedByBenchmark: Record<string, { models: string[]; reason: string }> = {
  'aime-2025': {
    models: ['grok-3', 'o3-pro'],
    reason: 'No primary public result matching the cached score and evaluation configuration was found.',
  },
  'creative-writing-bench': {
    models: [
      'claude-opus-4', 'claude-opus-4.6', 'claude-sonnet-4', 'deepseek-r1',
      'gemini-2.5-pro', 'gpt-4o', 'gpt-5.2', 'grok-4', 'llama-4-maverick',
      'mistral-large-3',
    ],
    reason: 'No named public benchmark methodology or exact row-level result matching the cached score was found.',
  },
  legalbench: {
    models: [
      'claude-opus-4', 'claude-opus-4.6', 'claude-sonnet-4', 'deepseek-r1',
      'gemini-2.5-pro', 'gpt-4o', 'gpt-5.2', 'grok-4', 'llama-4-maverick', 'o3',
    ],
    reason: 'No exact official LegalBench aggregate matching the cached score was found.',
  },
  medqa: {
    models: ['claude-opus-4', 'gemini-2.5-pro', 'gpt-4o', 'gpt-5.2', 'o3'],
    reason: 'No exact official MedQA result matching the cached score and model configuration was found.',
  },
  mgsm: {
    models: ['claude-opus-4', 'gemini-2.5-pro', 'gpt-4o', 'gpt-5.2', 'o3'],
    reason: 'No exact official MGSM result matching the cached score and model configuration was found.',
  },
  'mmmu-pro': {
    models: ['claude-opus-4', 'gemini-2.5-pro', 'gpt-4o'],
    reason: 'No exact official MMMU-Pro result matching the cached value was found; published variants use different values or settings.',
  },
  simpleqa: {
    models: ['claude-opus-4', 'claude-sonnet-4', 'gpt-5.2'],
    reason: 'No exact official SimpleQA result matching the cached score was found.',
  },
  'tau-bench': {
    models: [
      'claude-opus-4', 'claude-opus-4.6', 'deepseek-r1', 'gemini-2.5-pro',
      'gpt-4o', 'gpt-5.2', 'grok-4', 'o3',
    ],
    reason: 'The cached generic aggregate is ambiguous because public results are domain- and harness-specific.',
  },
};

export const UNRESOLVED_LABEL_ONLY_BENCHMARK_SCORE_REVIEWS: readonly UnresolvedBenchmarkScoreReview[] =
  Object.entries(unresolvedByBenchmark).flatMap(([benchmarkId, review]) => (
    review.models.map((modelId) => ({
      modelId,
      benchmarkId,
      reason: review.reason,
    }))
  ));

export const VERIFIED_LABEL_ONLY_REMEDIATION_KEYS = new Set([
  'deepseek-r1:aime-2025',
  'deepseek-r1-0528:aime-2025',
  'gemini-2.5-pro:aime-2025',
  'o3:aime-2025',
  'o4-mini:aime-2025',
  'phi-4-reasoning:aime-2025',
  'qwen-qwq-32b:aime-2025',
  'gpt-5.2:mmmu-pro',
  'gpt-5:simpleqa',
  'gemini-2.5-pro:simpleqa',
  'gpt-4.5:simpleqa',
  'gpt-4o:simpleqa',
  'llama-4-maverick:mgsm',
  'o3:simpleqa',
]);

export function benchmarkScoreKey(modelId: string, benchmarkId: string): string {
  return `${modelId}:${benchmarkId}`;
}
