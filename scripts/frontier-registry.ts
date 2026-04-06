export interface FrontierModelRequirement {
  name: string;
  providerHints: string[];
  aliases: string[];
  sourceUrl: string;
  requiredAsOf: string;
}

/**
 * Current must-track frontier models.
 *
 * This is a temporary guardrail until the shared registry becomes fully
 * provider-synced. If one of these is missing from the public cache, we
 * should treat the refresh as incomplete.
 */
export const REQUIRED_FRONTIER_MODELS: FrontierModelRequirement[] = [
  {
    name: 'GPT-5.4',
    providerHints: ['openai'],
    aliases: ['gpt-5.4'],
    sourceUrl: 'https://developers.openai.com/api/docs/guides/latest-model',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Claude Opus 4.6',
    providerHints: ['anthropic', 'claude'],
    aliases: ['claude-opus-4.6', 'claude opus 4.6'],
    sourceUrl: 'https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Claude Sonnet 4.6',
    providerHints: ['anthropic', 'claude'],
    aliases: ['claude-sonnet-4.6', 'claude sonnet 4.6'],
    sourceUrl: 'https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Gemini 3.1 Pro',
    providerHints: ['google', 'gemini'],
    aliases: ['gemini-3.1-pro', 'gemini-3.1-pro-preview', 'gemini 3.1 pro'],
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/changelog',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Gemma 4',
    providerHints: ['google', 'gemma'],
    aliases: ['gemma-4', 'gemma 4'],
    sourceUrl: 'https://ai.google.dev/gemma/docs/integrations/lmstudio',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Grok 4.20',
    providerHints: ['xai', 'x.ai', 'grok'],
    aliases: ['grok-4.20', 'grok 4.20'],
    sourceUrl: 'https://docs.x.ai/developers/models',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Qwen 3.6 Plus',
    providerHints: ['alibaba', 'qwen'],
    aliases: ['qwen3.6-plus', 'qwen 3.6 plus', 'qwen3.6plus'],
    sourceUrl: 'https://help.aliyun.com/zh/model-studio/model-pricing',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'MiniMax M2.7',
    providerHints: ['minimax'],
    aliases: ['minimax-m2.7', 'minimax m2.7', 'm2.7'],
    sourceUrl: 'https://platform.minimaxi.com/docs/api-reference/api-overview',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'GLM-5',
    providerHints: ['zhipu', 'glm', 'bigmodel'],
    aliases: ['glm-5', 'glm 5', 'glm-5-turbo'],
    sourceUrl: 'https://docs.bigmodel.cn/cn/update/new-releases',
    requiredAsOf: '2026-04-06',
  },
  {
    name: 'Kimi K2.5',
    providerHints: ['moonshot', 'kimi'],
    aliases: ['kimi-k2.5', 'kimi k2.5', 'kimi-k2', 'kimi k2'],
    sourceUrl: 'https://platform.moonshot.ai/docs/pricing/tools.en-US',
    requiredAsOf: '2026-04-06',
  },
];
