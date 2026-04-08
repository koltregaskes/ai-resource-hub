export interface ProviderCatalogEntry {
  id: string;
  name: string;
  colour: string;
  website: string;
  statusUrl?: string | null;
  apiDocsUrl?: string | null;
  description: string;
  founded?: string | null;
  headquarters?: string | null;
  ceo?: string | null;
  funding?: string | null;
  discoveryPrefixes?: string[];
}

export interface OfficialPricingDefinition {
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice?: number;
  source: string;
  sourceUrl: string;
}

export interface CatalogModelEntry {
  id: string;
  name: string;
  providerId: string;
  released?: string | null;
  contextWindow?: number | null;
  maxOutput?: number | null;
  openSource?: boolean;
  modality?: string;
  apiAvailable?: boolean;
  notes?: string | null;
  status?: 'active' | 'tracking' | 'preview' | 'superseded' | 'retired';
  category?: string;
  aliases?: string[];
  openRouterIds?: string[];
  officialUrl: string;
  frontier?: {
    requiredAsOf: string;
    providerHints?: string[];
    aliases?: string[];
  };
  officialPricing?: OfficialPricingDefinition;
}

export interface FrontierModelRequirement {
  name: string;
  providerHints: string[];
  aliases: string[];
  sourceUrl: string;
  requiredAsOf: string;
}

export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    colour: '#10a37f',
    website: 'https://openai.com',
    statusUrl: 'https://status.openai.com',
    apiDocsUrl: 'https://platform.openai.com/docs/models',
    description: 'OpenAI builds the GPT and o-series model families.',
    founded: '2015-12-11',
    headquarters: 'San Francisco, CA',
    ceo: 'Sam Altman',
    funding: '$13B+',
    discoveryPrefixes: ['openai'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    colour: '#d97706',
    website: 'https://anthropic.com',
    statusUrl: 'https://status.claude.com',
    apiDocsUrl: 'https://docs.anthropic.com',
    description: 'Anthropic builds the Claude family with a strong safety and enterprise focus.',
    founded: '2021-01-28',
    headquarters: 'San Francisco, CA',
    ceo: 'Dario Amodei',
    funding: '$7.6B+',
    discoveryPrefixes: ['anthropic'],
  },
  {
    id: 'google',
    name: 'Google',
    colour: '#4285f4',
    website: 'https://deepmind.google',
    statusUrl: 'https://status.cloud.google.com',
    apiDocsUrl: 'https://ai.google.dev/gemini-api/docs/models',
    description: 'Google DeepMind builds Gemini and Gemma.',
    founded: '2010-01-01',
    headquarters: 'London / Mountain View',
    ceo: 'Demis Hassabis',
    funding: 'Alphabet subsidiary',
    discoveryPrefixes: ['google'],
  },
  {
    id: 'xai',
    name: 'xAI',
    colour: '#1da1f2',
    website: 'https://x.ai',
    statusUrl: 'https://status.x.ai',
    apiDocsUrl: 'https://docs.x.ai/developers/models',
    description: 'xAI builds the Grok family.',
    founded: '2023-07-12',
    headquarters: 'Austin, TX',
    ceo: 'Elon Musk',
    funding: '$6B+',
    discoveryPrefixes: ['x-ai'],
  },
  {
    id: 'alibaba',
    name: 'Alibaba',
    colour: '#ff6a00',
    website: 'https://www.alibabacloud.com/solutions/generative-ai',
    apiDocsUrl: 'https://help.aliyun.com/zh/model-studio/model-pricing',
    description: 'Alibaba Cloud builds the Qwen family.',
    founded: '2023-04-01',
    headquarters: 'Hangzhou, China',
    ceo: 'Daniel Zhang',
    funding: 'Alibaba subsidiary',
    discoveryPrefixes: ['qwen', 'aliyun'],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    colour: '#e040fb',
    website: 'https://www.minimaxi.com',
    apiDocsUrl: 'https://platform.minimaxi.com/docs/api-reference/api-overview',
    description: 'MiniMax builds multimodal and coding-capable frontier models.',
    founded: '2021-12-01',
    headquarters: 'Shanghai, China',
    ceo: 'Yan Junjie',
    funding: '$600M+',
    discoveryPrefixes: ['minimax'],
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI',
    colour: '#00b4d8',
    website: 'https://www.zhipuai.cn',
    apiDocsUrl: 'https://docs.bigmodel.cn/cn/guide/models/text/glm-5',
    description: 'Zhipu AI builds the GLM series.',
    founded: '2019-01-01',
    headquarters: 'Beijing, China',
    ceo: 'Tang Jie',
    funding: '$400M+',
    discoveryPrefixes: ['zhipuai', 'z-ai'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    colour: '#f59e0b',
    website: 'https://moonshot.ai',
    apiDocsUrl: 'https://platform.moonshot.ai/docs/pricing/tools.en-US',
    description: 'Moonshot AI builds the Kimi family.',
    founded: '2023-03-01',
    headquarters: 'Beijing, China',
    discoveryPrefixes: ['moonshot', 'moonshotai'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    colour: '#2563eb',
    website: 'https://www.microsoft.com/ai',
    apiDocsUrl: 'https://learn.microsoft.com/azure/ai-foundry/model-inference/concepts/models',
    description: 'Microsoft publishes Phi-family models and hosts third-party frontier models via Azure AI Foundry.',
    discoveryPrefixes: ['microsoft'],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    colour: '#76b900',
    website: 'https://build.nvidia.com',
    apiDocsUrl: 'https://docs.api.nvidia.com',
    description: 'NVIDIA publishes Nemotron and hosted inference APIs for open models.',
    discoveryPrefixes: ['nvidia'],
  },
  {
    id: 'meta',
    name: 'Meta',
    colour: '#0a66ff',
    website: 'https://ai.meta.com/llama',
    description: 'Meta publishes the Llama family of open-weight models.',
    discoveryPrefixes: ['meta-llama', 'meta'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    colour: '#2563eb',
    website: 'https://deepseek.com',
    statusUrl: 'https://status.deepseek.com',
    apiDocsUrl: 'https://api-docs.deepseek.com',
    description: 'DeepSeek publishes efficient frontier and open-weight reasoning models.',
    discoveryPrefixes: ['deepseek'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    colour: '#111827',
    website: 'https://mistral.ai',
    statusUrl: 'https://status.mistral.ai',
    apiDocsUrl: 'https://docs.mistral.ai',
    description: 'Mistral builds open and commercial frontier models from Europe.',
    discoveryPrefixes: ['mistralai', 'mistral'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    colour: '#2563eb',
    website: 'https://cohere.com',
    statusUrl: 'https://status.cohere.com',
    apiDocsUrl: 'https://docs.cohere.com',
    description: 'Cohere builds the Command family and enterprise retrieval models.',
    discoveryPrefixes: ['cohere'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    colour: '#ff9900',
    website: 'https://aws.amazon.com/bedrock',
    apiDocsUrl: 'https://docs.aws.amazon.com/bedrock',
    description: 'Amazon publishes the Nova family through AWS Bedrock.',
    discoveryPrefixes: ['amazon'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    colour: '#0f766e',
    website: 'https://www.perplexity.ai',
    apiDocsUrl: 'https://docs.perplexity.ai',
    description: 'Perplexity ships search-grounded Sonar models and AI answer products.',
    discoveryPrefixes: ['perplexity'],
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    colour: '#7c3aed',
    website: 'https://www.ai21.com',
    apiDocsUrl: 'https://docs.ai21.com',
    description: 'AI21 Labs builds the Jamba model family.',
    discoveryPrefixes: ['ai21'],
  },
  {
    id: 'reka',
    name: 'Reka',
    colour: '#ec4899',
    website: 'https://www.reka.ai',
    description: 'Reka builds multimodal foundation models and fast reasoning variants.',
    discoveryPrefixes: ['rekaai', 'reka'],
  },
  {
    id: 'inflection',
    name: 'Inflection',
    colour: '#f97316',
    website: 'https://inflection.ai',
    description: 'Inflection develops conversational and assistant-style language models.',
    discoveryPrefixes: ['inflection'],
  },
  {
    id: '01ai',
    name: '01.AI',
    colour: '#16a34a',
    website: 'https://www.lingyiwanwu.com',
    description: '01.AI builds the Yi family and related multilingual foundation models.',
    discoveryPrefixes: ['01-ai', '01ai'],
  },
];

export const VERIFIED_MODEL_CATALOG: CatalogModelEntry[] = [
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    providerId: 'openai',
    released: '2026-03-05',
    contextWindow: 1_050_000,
    maxOutput: 32_768,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Current flagship GPT family model.',
    status: 'tracking',
    officialUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    openRouterIds: ['openai/gpt-5.4'],
    aliases: ['gpt 5.4'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
    officialPricing: {
      inputPrice: 2.5,
      outputPrice: 15,
      source: 'OpenAI (official)',
      sourceUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    },
  },
  {
    id: 'gpt-5.4-pro',
    name: 'GPT-5.4 Pro',
    providerId: 'openai',
    released: '2026-03-05',
    contextWindow: 1_050_000,
    maxOutput: 32_768,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Premium GPT-5.4 tier.',
    status: 'tracking',
    officialUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    openRouterIds: ['openai/gpt-5.4-pro'],
    officialPricing: {
      inputPrice: 30,
      outputPrice: 180,
      source: 'OpenAI (official)',
      sourceUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    },
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    providerId: 'openai',
    released: '2026-03-17',
    contextWindow: 400_000,
    maxOutput: 32_768,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Smaller GPT-5.4 tier.',
    status: 'tracking',
    officialUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    openRouterIds: ['openai/gpt-5.4-mini'],
    officialPricing: {
      inputPrice: 0.75,
      outputPrice: 4.5,
      source: 'OpenAI (official)',
      sourceUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    },
  },
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    providerId: 'openai',
    released: '2026-03-17',
    contextWindow: 400_000,
    maxOutput: 32_768,
    modality: 'text',
    apiAvailable: true,
    notes: 'Fastest and cheapest GPT-5.4 tier.',
    status: 'tracking',
    officialUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    openRouterIds: ['openai/gpt-5.4-nano'],
    officialPricing: {
      inputPrice: 0.2,
      outputPrice: 1.25,
      source: 'OpenAI (official)',
      sourceUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    },
  },
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6',
    providerId: 'anthropic',
    released: '2026-02-05',
    contextWindow: 200_000,
    maxOutput: 128_000,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Anthropic flagship model.',
    status: 'active',
    officialUrl: 'https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf',
    openRouterIds: ['anthropic/claude-opus-4.6'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
    officialPricing: {
      inputPrice: 15,
      outputPrice: 75,
      source: 'Anthropic (official)',
      sourceUrl: 'https://www.anthropic.com/pricing',
    },
  },
  {
    id: 'claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    providerId: 'anthropic',
    released: '2026-02-17',
    contextWindow: 200_000,
    maxOutput: 128_000,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Anthropic balanced frontier model.',
    status: 'active',
    officialUrl: 'https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf',
    openRouterIds: ['anthropic/claude-sonnet-4.6'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
    officialPricing: {
      inputPrice: 3,
      outputPrice: 15,
      source: 'Anthropic (official)',
      sourceUrl: 'https://www.anthropic.com/pricing',
    },
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    providerId: 'google',
    released: '2026-02-19',
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    modality: 'text,vision,audio',
    apiAvailable: true,
    notes: 'Current Gemini 3.1 Pro preview line.',
    status: 'tracking',
    officialUrl: 'https://ai.google.dev/gemini-api/docs/changelog',
    openRouterIds: [
      'google/gemini-3.1-pro-preview',
      'google/gemini-3.1-pro-preview-customtools',
      'google/gemini-3.1-pro',
    ],
    aliases: ['gemini-3.1-pro-preview', 'gemini 3.1 pro preview'],
    frontier: {
      requiredAsOf: '2026-04-06',
      aliases: ['gemini-3.1-pro', 'gemini-3.1-pro-preview', 'gemini 3.1 pro'],
    },
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    providerId: 'google',
    released: '2025-12-17',
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    modality: 'text,vision,audio',
    apiAvailable: true,
    notes: 'Fast Gemini 3 series model.',
    status: 'tracking',
    officialUrl: 'https://ai.google.dev/gemini-api/docs/changelog',
    openRouterIds: ['google/gemini-3-flash-preview'],
  },
  {
    id: 'gemma-4',
    name: 'Gemma 4',
    providerId: 'google',
    released: '2026-04-02',
    contextWindow: 131_072,
    maxOutput: 16_384,
    modality: 'text',
    apiAvailable: false,
    openSource: true,
    notes: 'Open-weight Gemma 4 family anchor for local/open-source coverage.',
    status: 'tracking',
    officialUrl: 'https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/',
    openRouterIds: ['google/gemma-4-31b-it', 'google/gemma-4-26b-a4b-it'],
    aliases: ['gemma 4', 'gemma-4-27b', 'gemma-4-12b', 'gemma-4-e4b', 'gemma-4-e2b'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
  {
    id: 'grok-4.20',
    name: 'Grok 4.20',
    providerId: 'xai',
    released: '2026-03-31',
    contextWindow: 2_000_000,
    maxOutput: 32_768,
    modality: 'text',
    apiAvailable: true,
    notes: 'xAI flagship model.',
    status: 'tracking',
    officialUrl: 'https://docs.x.ai/developers/models',
    openRouterIds: ['x-ai/grok-4.20', 'x-ai/grok-4.20-beta'],
    aliases: ['grok 4.20'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
  {
    id: 'grok-4.20-multi-agent',
    name: 'Grok 4.20 Multi-Agent',
    providerId: 'xai',
    released: '2026-03-31',
    contextWindow: 2_000_000,
    maxOutput: 32_768,
    modality: 'text',
    apiAvailable: true,
    notes: 'xAI multi-agent Grok variant.',
    status: 'tracking',
    officialUrl: 'https://docs.x.ai/developers/models',
    openRouterIds: ['x-ai/grok-4.20-multi-agent', 'x-ai/grok-4.20-multi-agent-beta'],
  },
  {
    id: 'qwen3.6-plus',
    name: 'Qwen 3.6 Plus',
    providerId: 'alibaba',
    released: '2026-04-02',
    contextWindow: 1_000_000,
    maxOutput: 65_536,
    modality: 'text,vision',
    apiAvailable: true,
    notes: 'Latest Qwen Plus line in Model Studio pricing.',
    status: 'tracking',
    officialUrl: 'https://help.aliyun.com/zh/model-studio/model-pricing',
    openRouterIds: ['qwen/qwen3.6-plus'],
    aliases: ['qwen 3.6 plus', 'qwen3.6plus'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
  {
    id: 'minimax-m2.7',
    name: 'MiniMax M2.7',
    providerId: 'minimax',
    released: '2026-03-18',
    contextWindow: 204_800,
    maxOutput: 32_768,
    modality: 'text',
    apiAvailable: true,
    notes: 'Current MiniMax flagship family line.',
    status: 'tracking',
    officialUrl: 'https://platform.minimaxi.com/docs/api-reference/api-overview',
    openRouterIds: ['minimax/minimax-m2.7'],
    aliases: ['minimax m2.7', 'm2.7'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
  {
    id: 'glm-5',
    name: 'GLM-5',
    providerId: 'zhipu',
    released: '2026-02-12',
    contextWindow: 128_000,
    maxOutput: 16_384,
    modality: 'text',
    apiAvailable: true,
    notes: 'Zhipu flagship GLM 5 line.',
    status: 'tracking',
    officialUrl: 'https://docs.bigmodel.cn/cn/guide/models/text/glm-5',
    openRouterIds: ['z-ai/glm-5'],
    aliases: ['glm 5'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
  {
    id: 'glm-5-turbo',
    name: 'GLM-5 Turbo',
    providerId: 'zhipu',
    released: '2026-03-15',
    contextWindow: 128_000,
    maxOutput: 16_384,
    modality: 'text',
    apiAvailable: true,
    notes: 'Lower-cost GLM 5 line.',
    status: 'tracking',
    officialUrl: 'https://docs.bigmodel.cn/cn/update/new-releases',
    openRouterIds: ['z-ai/glm-5-turbo'],
    aliases: ['glm 5 turbo'],
    frontier: {
      requiredAsOf: '2026-04-06',
      aliases: ['glm-5', 'glm 5', 'glm-5-turbo'],
    },
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    providerId: 'moonshot',
    released: '2026-03-28',
    contextWindow: 128_000,
    maxOutput: 16_384,
    modality: 'text',
    apiAvailable: true,
    notes: 'Current Kimi family line in Moonshot platform docs.',
    status: 'tracking',
    officialUrl: 'https://platform.moonshot.ai/docs/pricing/tools.en-US',
    openRouterIds: ['moonshotai/kimi-k2.5', 'moonshotai/kimi-k2'],
    aliases: ['kimi k2.5', 'kimi-k2', 'kimi k2'],
    frontier: {
      requiredAsOf: '2026-04-06',
    },
  },
];

const EXTRA_PROVIDER_PREFIX_MAP: Record<string, string> = {
  'meta-llama': 'meta',
  'deepseek': 'deepseek',
  'mistralai': 'mistral',
  'cohere': 'cohere',
  'perplexity': 'perplexity',
  'ai21': 'ai21',
  'amazon': 'amazon',
  'microsoft': 'microsoft',
  'nvidia': 'nvidia',
  'inflection': 'inflection',
  'rekaai': 'reka',
  '01-ai': '01ai',
};

export const PROVIDER_PREFIX_MAP: Record<string, string> = {
  ...EXTRA_PROVIDER_PREFIX_MAP,
  ...Object.fromEntries(
    PROVIDER_CATALOG.flatMap((provider) => (
      provider.discoveryPrefixes?.map((prefix) => [prefix, provider.id] as const) ?? []
    )),
  ),
};

function normaliseSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[:@].*$/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function deriveModelIdFromOpenRouterId(openRouterId: string): string {
  const [, rawModel = openRouterId] = openRouterId.split('/');
  return normaliseSegment(rawModel)
    .replace(/-preview(?:-[a-z0-9]+)?$/g, '')
    .replace(/-beta$/g, '')
    .replace(/-latest$/g, '')
    .replace(/-customtools$/g, '')
    .replace(/-thinking$/g, '')
    .replace(/-multi-agent$/g, '-multi-agent')
    .replace(/-\d{4}-\d{2}-\d{2}$/g, '');
}

export function getOpenRouterModelMap(): Record<string, string> {
  const explicitEntries = VERIFIED_MODEL_CATALOG.flatMap((model) => (
    model.openRouterIds?.map((openRouterId) => [openRouterId, model.id] as const) ?? []
  ));
  return Object.fromEntries(explicitEntries);
}

export function getWatchedProviderPrefixes(): Set<string> {
  return new Set(Object.keys(PROVIDER_PREFIX_MAP));
}

export function getCatalogProvidersById(): Map<string, ProviderCatalogEntry> {
  return new Map(PROVIDER_CATALOG.map((provider) => [provider.id, provider]));
}

export function getCatalogModelsById(): Map<string, CatalogModelEntry> {
  return new Map(VERIFIED_MODEL_CATALOG.map((model) => [model.id, model]));
}

export function findCatalogModelByAlias(candidate: string): CatalogModelEntry | null {
  const normalised = normaliseSegment(candidate).replace(/-/g, '');
  return VERIFIED_MODEL_CATALOG.find((model) => {
    const candidates = [
      model.id,
      model.name,
      ...(model.aliases ?? []),
      ...(model.openRouterIds ?? []),
    ].flatMap((value) => value.includes('/') ? [value, value.split('/')[1]] : [value]);
    return candidates.some((value) => normaliseSegment(value).replace(/-/g, '') === normalised);
  }) ?? null;
}

export function getFrontierRequirements(): FrontierModelRequirement[] {
  return VERIFIED_MODEL_CATALOG
    .filter((model) => model.frontier)
    .map((model) => ({
      name: model.name,
      providerHints: model.frontier?.providerHints ?? [model.providerId],
      aliases: model.frontier?.aliases ?? [model.id, model.name],
      sourceUrl: model.officialUrl,
      requiredAsOf: model.frontier?.requiredAsOf ?? new Date().toISOString().slice(0, 10),
    }));
}

export function getOfficialPricingCatalog(): CatalogModelEntry[] {
  return VERIFIED_MODEL_CATALOG.filter((model) => model.officialPricing);
}
