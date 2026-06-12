export type MetaBenchmarkModeId = 'plain_chat' | 'tool_enabled_chat' | 'deep_research' | 'agent_harness';

export interface MetaBenchmarkMode {
  id: MetaBenchmarkModeId;
  label: string;
  comparisonRule: string;
  evidenceRule: string;
  status: 'ready' | 'draft' | 'blocked';
}

export interface MetaBenchmarkDimension {
  id: string;
  label: string;
  weight: number;
  critical: boolean;
  saturationRisk: 'low' | 'medium' | 'high';
  target: string;
}

export interface MetaBenchmarkFamily {
  id: string;
  label: string;
  purpose: string;
  modeIds: MetaBenchmarkModeId[];
  promptTarget: number;
  scoringState: 'architecture-ready' | 'prompt-pack-needed' | 'pilot-needed';
}

export interface MetaBenchmarkRawTable {
  name: string;
  purpose: string;
  keyFields: string[];
}

export interface MetaBenchmarkPilotItem {
  id: string;
  familyId: string;
  modeId: MetaBenchmarkModeId;
  nextAction: string;
  dataCaptured: string;
  status: 'not-started' | 'ready-to-build' | 'needs-source-pack';
}

export interface MetaBenchmarkScoreSet {
  floorCapability: number;
  operatingEnvelope: number;
  frontierReality: number;
  researchTrust: number;
}

export interface MetaBenchmarkLeaderboardEntry {
  rank: number | null;
  modelId: string;
  modelName: string;
  providerName: string;
  providerColour: string;
  leaderboardMode: 'frontier_today' | 'external_proxy' | 'internal_manual';
  primaryMetric: string;
  floorMetaScore: number;
  metaScores: MetaBenchmarkScoreSet;
  scoreConfidence: 'high' | 'medium' | 'low';
  score: number | null;
  proxyScore: number;
  operatingNote: string;
  researchNote: string;
  dsweMetrics?: {
    source: 'DeepSWE';
    passAt1Pct: number;
    averageCostUsd: number;
    averageTimeMinutes: number;
    outputTokensK: number;
    effortLabel?: string;
  };
  coverage: number;
  scoredDimensions: number;
  rankStatus: 'ranked' | 'partial-evidence';
  caveat: string;
  evidence: string[];
  sourceSummary?: string;
  scoreComponents: {
    accuracyGrounding: number;
    instructionDiscipline: number;
    honestyReliability: number;
    reasoningFloor: number;
    agentCoding: number;
    operatingEnvelope: number;
  };
  dimensionScores: {
    factualAccuracy?: number;
    instructionFollowing?: number;
    reasoning?: number;
    codingAgent?: number;
    safetyTrust?: number;
  };
}

export interface MetaBenchmarkOverview {
  title: string;
  updatedAt: string;
  evidenceState: string;
  modes: MetaBenchmarkMode[];
  dimensions: MetaBenchmarkDimension[];
  families: MetaBenchmarkFamily[];
  leaderboard: MetaBenchmarkLeaderboardEntry[];
  rawTables: MetaBenchmarkRawTable[];
  pilotQueue: MetaBenchmarkPilotItem[];
}

export const META_BENCHMARK_MODES: MetaBenchmarkMode[] = [
  {
    id: 'plain_chat',
    label: 'Plain chat',
    comparisonRule: 'Compare only against other fresh-chat, no-tool runs.',
    evidenceRule: 'Prompt text, answer text, model label, plan, run number, scorer notes.',
    status: 'ready',
  },
  {
    id: 'tool_enabled_chat',
    label: 'Tool-enabled chat',
    comparisonRule: 'Compare only when the same visible tool class is allowed.',
    evidenceRule: 'Everything from plain chat plus visible tool calls, citations, files, retries, and tool errors.',
    status: 'ready',
  },
  {
    id: 'deep_research',
    label: 'Deep research',
    comparisonRule: 'Compare against other product research modes with source-quality caveats.',
    evidenceRule: 'Source list, citation accuracy, source class, elapsed time, synthesis quality, and date handling.',
    status: 'draft',
  },
  {
    id: 'agent_harness',
    label: 'Agent harness',
    comparisonRule: 'Compare only with harness, filesystem, tool, and permission context attached.',
    evidenceRule: 'Trace, changed files, commands, browser evidence, blockers, and handoff quality.',
    status: 'draft',
  },
];

export const META_BENCHMARK_DIMENSIONS: MetaBenchmarkDimension[] = [
  {
    id: 'factual_accuracy',
    label: 'Factual accuracy',
    weight: 0.2,
    critical: true,
    saturationRisk: 'medium',
    target: 'Correct on boring verifiable facts without drifting into confident guesses.',
  },
  {
    id: 'grounded_evidence_use',
    label: 'Grounded evidence use',
    weight: 0.15,
    critical: true,
    saturationRisk: 'low',
    target: 'Keeps claims tied to supplied or verified evidence and exposes missing support.',
  },
  {
    id: 'instruction_following',
    label: 'Instruction following',
    weight: 0.2,
    critical: true,
    saturationRisk: 'high',
    target: 'Follows exact constraints, formats, exclusions, and ordering.',
  },
  {
    id: 'honesty_abstention',
    label: 'Honesty and abstention',
    weight: 0.15,
    critical: true,
    saturationRisk: 'low',
    target: 'Says when it does not know, separates inference from evidence, and avoids laundering guesses.',
  },
  {
    id: 'repeatability',
    label: 'Reliability and repeatability',
    weight: 0.1,
    critical: false,
    saturationRisk: 'low',
    target: 'Stable enough across 5, 10, and 20 run passes that a single lucky run is not rewarded.',
  },
  {
    id: 'bias_fallacy',
    label: 'Bias and fallacy handling',
    weight: 0.1,
    critical: false,
    saturationRisk: 'medium',
    target: 'Finds argument failures without false balance, partisan projection, or invented motives.',
  },
  {
    id: 'research_tool_discipline',
    label: 'Research and tool discipline',
    weight: 0.1,
    critical: false,
    saturationRisk: 'low',
    target: 'Uses tools only when allowed, records what happened, and does not invent hidden state.',
  },
];

export const META_BENCHMARK_FAMILIES: MetaBenchmarkFamily[] = [
  {
    id: 'floor-capability',
    label: 'Floor Capability',
    purpose: 'The headline manual benchmark for everyday trust basics.',
    modeIds: ['plain_chat', 'tool_enabled_chat'],
    promptTarget: 40,
    scoringState: 'prompt-pack-needed',
  },
  {
    id: 'fact-checking',
    label: 'Fact-Checking',
    purpose: 'Verifies source discipline, contradiction handling, and citation restraint.',
    modeIds: ['plain_chat', 'deep_research'],
    promptTarget: 20,
    scoringState: 'prompt-pack-needed',
  },
  {
    id: 'bias-fallacy',
    label: 'Bias And Fallacy',
    purpose: 'Tests argument analysis without overreach or false balance.',
    modeIds: ['plain_chat'],
    promptTarget: 20,
    scoringState: 'prompt-pack-needed',
  },
  {
    id: 'deep-research',
    label: 'Deep Research',
    purpose: 'Compares research-mode source discovery, citation accuracy, synthesis, and caveats.',
    modeIds: ['deep_research'],
    promptTarget: 15,
    scoringState: 'prompt-pack-needed',
  },
  {
    id: 'agent-adaptation',
    label: 'Agent Adaptation',
    purpose: 'KOL-3748/FutureSim-style dated information stream testing for belief updates and action routing.',
    modeIds: ['agent_harness'],
    promptTarget: 10,
    scoringState: 'prompt-pack-needed',
  },
  {
    id: 'creator-solver',
    label: 'Creator/Solver Meta-Benchmark',
    purpose: 'BenchBench-style test for whether models can design hard-but-solvable benchmark tasks.',
    modeIds: ['plain_chat', 'agent_harness'],
    promptTarget: 12,
    scoringState: 'architecture-ready',
  },
];

export const META_BENCHMARK_RAW_TABLES: MetaBenchmarkRawTable[] = [
  {
    name: 'benchmark_scores',
    purpose: 'Existing AI Resource Hub external benchmark score cache used as one input to the frontier floor meta score.',
    keyFields: ['model_id', 'benchmark_id', 'score', 'source', 'source_url', 'measured_at', 'updated_at'],
  },
  {
    name: 'meta_benchmark_families',
    purpose: 'Defines each internal benchmark family and whether it is public, private, draft, or retired.',
    keyFields: ['id', 'label', 'purpose', 'status', 'created_at', 'updated_at'],
  },
  {
    name: 'meta_benchmark_prompts',
    purpose: 'Stores versioned prompt text, source-pack references, answer keys, rubrics, and holdout state.',
    keyFields: ['id', 'family_id', 'version', 'mode_allowed', 'difficulty_band', 'private_holdout', 'retire_after'],
  },
  {
    name: 'meta_benchmark_runs',
    purpose: 'Stores each manual run as model plus product plan plus mode plus date plus run number.',
    keyFields: ['id', 'prompt_id', 'provider', 'product_plan', 'model_label_shown', 'tool_mode', 'run_number', 'run_datetime'],
  },
  {
    name: 'meta_benchmark_scores',
    purpose: 'Stores dimension scores, hard-fail caps, scorer notes, caveats, and final floor score.',
    keyFields: ['run_id', 'dimension_scores_json', 'hard_fail_flags_json', 'score_total', 'scorer_id', 'scored_at'],
  },
  {
    name: 'meta_benchmark_operating_metrics',
    purpose: 'Stores visible cost, speed, token, tool-call, retry, citation, and elapsed-time metrics.',
    keyFields: ['run_id', 'wall_time_seconds', 'visible_tool_calls', 'visible_citation_count', 'retry_count', 'output_length_words'],
  },
  {
    name: 'external_benchmark_operating_metrics',
    purpose: 'Stores DSWE-style source-reported benchmark score, average cost, average time, and output token rows for external benchmarks.',
    keyFields: ['benchmark_id', 'source_name', 'model_id', 'run_configuration', 'score_value', 'average_cost_usd', 'average_time_seconds', 'output_tokens_average'],
  },
  {
    name: 'meta_benchmark_sources',
    purpose: 'Stores source packs and source evidence used by fact-checking, deep research, and adaptation tasks.',
    keyFields: ['id', 'source_type', 'url', 'source_pack_id', 'verified_at', 'caveat'],
  },
];

export const META_BENCHMARK_PILOT_QUEUE: MetaBenchmarkPilotItem[] = [
  {
    id: 'pilot-floor-001',
    familyId: 'floor-capability',
    modeId: 'plain_chat',
    nextAction: 'Build first 8 to 12 prompts and answer keys before any model run.',
    dataCaptured: 'Prompt, answer, score dimensions, hard fails, repeat-run variance.',
    status: 'ready-to-build',
  },
  {
    id: 'pilot-fact-001',
    familyId: 'fact-checking',
    modeId: 'plain_chat',
    nextAction: 'Create public source packs with supported, contradicted, and unsupported claims.',
    dataCaptured: 'Claim labels, source refs, quote discipline, fabricated citation flags.',
    status: 'needs-source-pack',
  },
  {
    id: 'pilot-research-001',
    familyId: 'deep-research',
    modeId: 'deep_research',
    nextAction: 'Define 5 public research tasks with expected source classes and citation checks.',
    dataCaptured: 'Source list, citation accuracy, elapsed time, caveats, synthesis score.',
    status: 'not-started',
  },
  {
    id: 'pilot-agent-001',
    familyId: 'agent-adaptation',
    modeId: 'agent_harness',
    nextAction: 'Turn KOL-3748 into 10 dated information-stream tasks.',
    dataCaptured: 'Search timing, belief update, memory preservation, action routing, evidence quality.',
    status: 'ready-to-build',
  },
];

export const META_BENCHMARK_LEADERBOARD: MetaBenchmarkLeaderboardEntry[] = [
  {
    rank: 1,
    modelId: 'claude-fable-5',
    modelName: 'Claude Fable 5',
    providerName: 'Anthropic',
    providerColour: '#d97706',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 64.9 (#1)',
    floorMetaScore: 84,
    metaScores: {
      floorCapability: 84,
      operatingEnvelope: 58,
      frontierReality: 92,
      researchTrust: 82,
    },
    scoreConfidence: 'medium',
    score: 64.9,
    proxyScore: 64.9,
    operatingNote: 'Fable 5 DSWE is pending, so the operating score is capped until cost, time, and token rows exist.',
    researchNote: 'Strong external capability signal, but fallback routing keeps the research-trust score provisional.',
    coverage: 74,
    scoredDimensions: 6,
    rankStatus: 'ranked',
    caveat: 'Current external frontier leader, but the public AA row includes Opus 4.8 fallback routing. Treat as provisional until internal prompt runs separate Fable from fallback.',
    evidence: ['Artificial Analysis Intelligence Index', 'AA-Omniscience', 'Humanity\'s Last Exam', 'GDPval-AA', 'Terminal-Bench Hard'],
    sourceSummary: 'AA reported #1 Intelligence Index on 2026-06-10, score 64.9; HLE 53%; GDPval-AA Elo 1932; Opus 4.8 fallback observed in some tasks.',
    scoreComponents: {
      accuracyGrounding: 82,
      instructionDiscipline: 82,
      honestyReliability: 86,
      reasoningFloor: 88,
      agentCoding: 86,
      operatingEnvelope: 72,
    },
    dimensionScores: {
      factualAccuracy: 40,
      instructionFollowing: undefined,
      reasoning: 53,
      codingAgent: 62,
    },
  },
  {
    rank: 2,
    modelId: 'claude-opus-4.8',
    modelName: 'Claude Opus 4.8',
    providerName: 'Anthropic',
    providerColour: '#d97706',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 61 / AA-Omniscience #2',
    floorMetaScore: 80,
    metaScores: {
      floorCapability: 80,
      operatingEnvelope: 60,
      frontierReality: 88,
      researchTrust: 82,
    },
    scoreConfidence: 'high',
    score: 61.4,
    proxyScore: 61.4,
    operatingNote: 'Strong DSWE pass rate, but high average cost and token burn pull the operating score down.',
    researchNote: 'Best clean Anthropic row in the current set, with hallucination and accuracy evidence available.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 58,
      averageCostUsd: 12.58,
      averageTimeMinutes: 43,
      outputTokensK: 136,
      effortLabel: 'max',
    },
    coverage: 82,
    scoredDimensions: 6,
    rankStatus: 'ranked',
    caveat: 'Strongest clean Anthropic row for floor-style comparison. Cost is high, so operating envelope drags the meta score down.',
    evidence: ['Artificial Analysis Intelligence Index', 'AA-Omniscience', 'Humanity\'s Last Exam', 'IFBench', 'Terminal-Bench Hard', 'Kilo Bench'],
    sourceSummary: 'AA puts Opus 4.8 at 61 on Intelligence Index, #2 on AA-Omniscience with 46.6% accuracy and 35.9% hallucination rate; Kilo has it #3 coding at 67.6%.',
    scoreComponents: {
      accuracyGrounding: 80,
      instructionDiscipline: 80,
      honestyReliability: 86,
      reasoningFloor: 84,
      agentCoding: 78,
      operatingEnvelope: 62,
    },
    dimensionScores: {
      factualAccuracy: 46.6,
      instructionFollowing: undefined,
      reasoning: 61.4,
      codingAgent: 67.6,
    },
  },
  {
    rank: 3,
    modelId: 'gpt-5.5-xhigh',
    modelName: 'GPT-5.5 xhigh',
    providerName: 'OpenAI',
    providerColour: '#10a37f',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 60 / Kilo #1 coding',
    floorMetaScore: 78,
    metaScores: {
      floorCapability: 78,
      operatingEnvelope: 86,
      frontierReality: 87,
      researchTrust: 75,
    },
    scoreConfidence: 'medium',
    score: 60,
    proxyScore: 60,
    operatingNote: 'Best tracked DSWE pass rate with relatively low cost, short time, and compact output.',
    researchNote: 'Capability signal is strong, but abstention, citation, and hallucination evidence is thinner.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 70,
      averageCostUsd: 6.61,
      averageTimeMinutes: 21,
      outputTokensK: 47,
      effortLabel: 'xhigh',
    },
    coverage: 70,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Very strong capability and coding signal, but less floor-specific hallucination/abstention evidence in the current public rows.',
    evidence: ['Artificial Analysis Intelligence Index', 'Kilo Bench', 'Arena Text', 'Arena Agent'],
    sourceSummary: 'AA leaderboard puts GPT-5.5 xhigh at 60; Kilo lists GPT-5.5 #1 coding at 74.2% completion, $72.63 per attempt.',
    scoreComponents: {
      accuracyGrounding: 76,
      instructionDiscipline: 80,
      honestyReliability: 74,
      reasoningFloor: 82,
      agentCoding: 88,
      operatingEnvelope: 66,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 60,
      codingAgent: 74.2,
    },
  },
  {
    rank: 4,
    modelId: 'gemini-3.1-pro',
    modelName: 'Gemini 3.1 Pro',
    providerName: 'Google',
    providerColour: '#4285f4',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 63 / 148 tok/s',
    floorMetaScore: 77,
    metaScores: {
      floorCapability: 77,
      operatingEnvelope: 67,
      frontierReality: 86,
      researchTrust: 76,
    },
    scoreConfidence: 'medium',
    score: 63,
    proxyScore: 63,
    operatingNote: 'High speed and long context help, but no DSWE row keeps the operating score provisional.',
    researchNote: 'Strong current Gemini intelligence row; needs more direct source-discipline prompt runs.',
    coverage: 76,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Still a current top Gemini intelligence row even though Gemini 3.5 Flash is newer. DSWE has not reported a row yet.',
    evidence: ['Artificial Analysis Intelligence Index', 'AA-Omniscience', 'Humanity\'s Last Exam', 'SciCode', 'Terminal-Bench Hard'],
    sourceSummary: 'AA reported Gemini 3.1 Pro Preview at Intelligence Index 63, with 1M context and 148 output tokens/sec.',
    scoreComponents: {
      accuracyGrounding: 78,
      instructionDiscipline: 76,
      honestyReliability: 74,
      reasoningFloor: 82,
      agentCoding: 76,
      operatingEnvelope: 78,
    },
    dimensionScores: {
      factualAccuracy: 40,
      instructionFollowing: undefined,
      reasoning: 63,
      codingAgent: 67,
    },
  },
  {
    rank: 5,
    modelId: 'qwen3.7-max',
    modelName: 'Qwen3.7 Max',
    providerName: 'Alibaba',
    providerColour: '#ff6a00',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 56.6',
    floorMetaScore: 74,
    metaScores: {
      floorCapability: 74,
      operatingEnvelope: 62,
      frontierReality: 81,
      researchTrust: 70,
    },
    scoreConfidence: 'medium',
    score: 56.6,
    proxyScore: 56.6,
    operatingNote: 'Pricing is visible, but verbosity and missing DSWE rows keep the operating evidence thin.',
    researchNote: 'Good current Qwen signal, but verbose output raises source-discipline and citation-risk questions.',
    coverage: 62,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Top current Qwen row. Verbose output is a real operating cost risk for agentic sessions.',
    evidence: ['Artificial Analysis Intelligence Index', 'Qwen3.7 release notes', 'cost/token evidence'],
    sourceSummary: 'AA reports Qwen3.7 Max at 56.6 with high verbosity during evaluation; pricing is $2.50 input / $7.50 output per 1M tokens.',
    scoreComponents: {
      accuracyGrounding: 72,
      instructionDiscipline: 74,
      honestyReliability: 70,
      reasoningFloor: 78,
      agentCoding: 76,
      operatingEnvelope: 68,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 56.6,
      codingAgent: undefined,
    },
  },
  {
    rank: 6,
    modelId: 'gemini-3.5-flash',
    modelName: 'Gemini 3.5 Flash',
    providerName: 'Google',
    providerColour: '#4285f4',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 55 / Kilo #4 coding',
    floorMetaScore: 73,
    metaScores: {
      floorCapability: 73,
      operatingEnvelope: 78,
      frontierReality: 79,
      researchTrust: 68,
    },
    scoreConfidence: 'medium',
    score: 55.3,
    proxyScore: 55.3,
    operatingNote: 'Fast DSWE time, but output token volume is very high.',
    researchNote: 'Useful current Google row; needs internal hallucination and instruction-following runs.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 28,
      averageCostUsd: 7.42,
      averageTimeMinutes: 17,
      outputTokensK: 189,
      effortLabel: 'medium',
    },
    coverage: 68,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Newest Google row to track for this table. It may beat older Pro rows in practical coding/speed but still needs internal hallucination and instruction-following runs.',
    evidence: ['Artificial Analysis Intelligence Index', 'Kilo Bench', 'Google release coverage', 'speed/price evidence'],
    sourceSummary: 'AA changelog lists Gemini 3.5 Flash at 55; Kilo lists it #4 coding at 64.7% completion. Public coverage emphasizes speed and broad app availability.',
    scoreComponents: {
      accuracyGrounding: 70,
      instructionDiscipline: 72,
      honestyReliability: 68,
      reasoningFloor: 74,
      agentCoding: 78,
      operatingEnvelope: 76,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 55.3,
      codingAgent: 64.7,
    },
  },
  {
    rank: 7,
    modelId: 'minimax-m3',
    modelName: 'MiniMax-M3',
    providerName: 'MiniMax',
    providerColour: '#7c3aed',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 54.7 / Kilo #10 coding',
    floorMetaScore: 71,
    metaScores: {
      floorCapability: 71,
      operatingEnvelope: 70,
      frontierReality: 77,
      researchTrust: 67,
    },
    scoreConfidence: 'medium',
    score: 54.7,
    proxyScore: 54.7,
    operatingNote: 'Moderate DSWE cost but slow average time.',
    researchNote: 'Promising current/open-weight signal; provider and weight-release variance still need tracking.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 20,
      averageCostUsd: 5.57,
      averageTimeMinutes: 57,
      outputTokensK: 98,
    },
    coverage: 64,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Promising open-weight/current MiniMax row. Weight release and provider variance need tracking before treating it as a stable floor model.',
    evidence: ['Artificial Analysis Intelligence Index', 'Kilo Bench', 'price evidence'],
    sourceSummary: 'AA reports MiniMax-M3 around 55 and describes it as leading open weights once weights are released; Kilo lists 47.6% coding completion at $10.35 per attempt.',
    scoreComponents: {
      accuracyGrounding: 70,
      instructionDiscipline: 70,
      honestyReliability: 66,
      reasoningFloor: 74,
      agentCoding: 70,
      operatingEnvelope: 82,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 54.7,
      codingAgent: 47.6,
    },
  },
  {
    rank: 8,
    modelId: 'kimi-k2.6',
    modelName: 'Kimi K2.6',
    providerName: 'Moonshot AI',
    providerColour: '#111827',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 54 / Kilo #6 coding',
    floorMetaScore: 70,
    metaScores: {
      floorCapability: 70,
      operatingEnvelope: 77,
      frontierReality: 76,
      researchTrust: 66,
    },
    scoreConfidence: 'medium',
    score: 54,
    proxyScore: 54,
    operatingNote: 'Cheapest tracked DSWE row, but slow and verbose enough to cap the score.',
    researchNote: 'Strong open/current model, but token volume and verbosity make trust scoring cautious.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 24,
      averageCostUsd: 3.16,
      averageTimeMinutes: 56,
      outputTokensK: 84,
    },
    coverage: 64,
    scoredDimensions: 5,
    rankStatus: 'ranked',
    caveat: 'Strong open/current model. AA notes very verbose token generation, so operating metrics must be captured on every internal run.',
    evidence: ['Artificial Analysis Intelligence Index', 'Kilo Bench', 'Kimi release notes', 'token-volume evidence'],
    sourceSummary: 'AA reports Kimi K2.6 at 54 and notes 170M tokens generated during evaluation; Kilo lists 54.4% coding completion at $24.84 per attempt.',
    scoreComponents: {
      accuracyGrounding: 70,
      instructionDiscipline: 70,
      honestyReliability: 66,
      reasoningFloor: 72,
      agentCoding: 74,
      operatingEnvelope: 68,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 54,
      codingAgent: 54.4,
    },
  },
  {
    rank: 9,
    modelId: 'glm-5.1-reasoning',
    modelName: 'GLM-5.1 Reasoning',
    providerName: 'Z.ai',
    providerColour: '#2563eb',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA Index 51 / Kilo #8 coding',
    floorMetaScore: 67,
    metaScores: {
      floorCapability: 67,
      operatingEnvelope: 68,
      frontierReality: 72,
      researchTrust: 64,
    },
    scoreConfidence: 'medium',
    score: 51,
    proxyScore: 51,
    operatingNote: 'DSWE cost and time are mid-pack, with compact output tokens.',
    researchNote: 'Current GLM row is useful, but floor-specific honesty and citation data is thin.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 18,
      averageCostUsd: 7.46,
      averageTimeMinutes: 35,
      outputTokensK: 49,
    },
    coverage: 58,
    scoredDimensions: 4,
    rankStatus: 'ranked',
    caveat: 'Current GLM row is worth tracking, but public floor-specific honesty and instruction data is thin.',
    evidence: ['Artificial Analysis Intelligence Index', 'Kilo Bench', 'context window evidence'],
    sourceSummary: 'AA reports GLM-5.1 Reasoning at 51 with 200k context; Kilo lists GLM 5.1 at 49.4% coding completion.',
    scoreComponents: {
      accuracyGrounding: 66,
      instructionDiscipline: 68,
      honestyReliability: 64,
      reasoningFloor: 70,
      agentCoding: 68,
      operatingEnvelope: 66,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 51,
      codingAgent: 49.4,
    },
  },
  {
    rank: 10,
    modelId: 'deepseek-v4-pro',
    modelName: 'DeepSeek V4 Pro',
    providerName: 'DeepSeek',
    providerColour: '#334155',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'AA open top-3 / Index 52',
    floorMetaScore: 66,
    metaScores: {
      floorCapability: 66,
      operatingEnvelope: 72,
      frontierReality: 71,
      researchTrust: 62,
    },
    scoreConfidence: 'medium',
    score: 52,
    proxyScore: 52,
    operatingNote: 'Lower DSWE pass rate, but cost, time, and output tokens are contained.',
    researchNote: 'Current open-model baseline; source-discipline evidence is not yet deep enough.',
    dsweMetrics: {
      source: 'DeepSWE',
      passAt1Pct: 8,
      averageCostUsd: 4.22,
      averageTimeMinutes: 37,
      outputTokensK: 50,
    },
    coverage: 54,
    scoredDimensions: 4,
    rankStatus: 'ranked',
    caveat: 'Included as a current open-model baseline. Needs fresh internal floor prompts before it can be trusted as a user-facing assistant score.',
    evidence: ['Artificial Analysis open-weights leaderboard', 'Arena/Kilo coding signals'],
    sourceSummary: 'AA lists DeepSeek V4 Pro as a top-three open-weights model with Intelligence Index 52.',
    scoreComponents: {
      accuracyGrounding: 64,
      instructionDiscipline: 66,
      honestyReliability: 62,
      reasoningFloor: 70,
      agentCoding: 70,
      operatingEnvelope: 70,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: 52,
      codingAgent: undefined,
    },
  },
  {
    rank: null,
    modelId: 'mistral-watchlist',
    modelName: 'Mistral top model',
    providerName: 'Mistral',
    providerColour: '#f97316',
    leaderboardMode: 'frontier_today',
    primaryMetric: 'Watchlist only',
    floorMetaScore: 0,
    metaScores: {
      floorCapability: 0,
      operatingEnvelope: 0,
      frontierReality: 0,
      researchTrust: 0,
    },
    scoreConfidence: 'low',
    score: null,
    proxyScore: 0,
    operatingNote: 'No current comparable operating row.',
    researchNote: 'No current comparable research-trust evidence.',
    coverage: 15,
    scoredDimensions: 1,
    rankStatus: 'partial-evidence',
    caveat: 'Not ranked in the first table because there is no recent frontier-level Mistral signal comparable to the current leaders.',
    evidence: ['watchlist'],
    sourceSummary: 'Track only if a new Mistral release lands near the current frontier.',
    scoreComponents: {
      accuracyGrounding: 0,
      instructionDiscipline: 0,
      honestyReliability: 0,
      reasoningFloor: 0,
      agentCoding: 0,
      operatingEnvelope: 0,
    },
    dimensionScores: {
      factualAccuracy: undefined,
      instructionFollowing: undefined,
      reasoning: undefined,
      codingAgent: undefined,
    },
  },
];

export function getMetaBenchmarkOverview(): MetaBenchmarkOverview {
  return {
    title: 'Meta-Benchmark Workbench',
    updatedAt: '2026-06-12',
    evidenceState: 'Headline rows now show four provisional 0-100 meta scores for current top-lab models. Floor Capability is the finished leaderboard shape. Operating Envelope, Frontier Reality, and Research Trust are the next public tabs and remain provisional until prompt-pack runs backfill the current external evidence.',
    modes: META_BENCHMARK_MODES,
    dimensions: META_BENCHMARK_DIMENSIONS,
    families: META_BENCHMARK_FAMILIES,
    leaderboard: META_BENCHMARK_LEADERBOARD,
    rawTables: META_BENCHMARK_RAW_TABLES,
    pilotQueue: META_BENCHMARK_PILOT_QUEUE,
  };
}
