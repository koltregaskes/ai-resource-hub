import { curateNewsItems, type CuratedNewsItem } from './content-curation';
import { newsPipelineSnapshot } from './news-pipeline.generated';

const SITE_SLUG = 'ai-resource-hub';
const AI_RESOURCE_HUB_SITE = newsPipelineSnapshot.sites.find((site) => site.slug === SITE_SLUG);
const ROUTED_SOURCES = newsPipelineSnapshot.sources.filter((source) => (
  source.routeSiteSlugs?.includes(SITE_SLUG)
));

const HIGH_SIGNAL_TAGS = new Set([
  'model_release',
  'benchmark',
  'evaluation',
  'research_paper',
  'api_update',
  'pricing_change',
  'architecture',
  'dataset',
  'training',
  'inference',
  'hardware',
  'open_source',
]);

const KEYWORD_TAG_PATTERNS: Array<[string, RegExp]> = [
  ['model_release', /\b(new model|model release|releases?|released|launch(?:es|ed)?|introduc(?:es|ed|ing)|unveil(?:s|ed)|debut(?:s|ed)|preview|gpt-[\w.]+|claude[\w\s.-]*|gemini[\w\s.-]*|llama[\w\s.-]*|qwen[\w\s.-]*|glm[\w\s.-]*|kimi[\w\s.-]*|grok[\w\s.-]*|gemma[\w\s.-]*|minimax[\w\s.-]*|deepseek[\w\s.-]*)\b/i],
  ['benchmark', /\b(benchmark|leaderboard|arena|mmlu|gpqa|gsm8k|humaneval|swe-bench|lmarena|lmsys|elo)\b/i],
  ['evaluation', /\b(evaluation|evals?|assessed|performance|capability|test results|scor(?:e|es|ing))\b/i],
  ['research_paper', /\b(paper|research paper|arxiv|preprint|study|we present|we introduce|findings)\b/i],
  ['api_update', /\b(api|sdk|endpoint|rate limit|context window|token limit|function calling|tool use|tooling update)\b/i],
  ['pricing_change', /\b(pricing|price|cost per|per million tokens|cheaper|free tier|subscription)\b/i],
  ['architecture', /\b(transformer|architecture|attention|moe|mixture of experts|diffusion)\b/i],
  ['dataset', /\b(dataset|training data|preference data|synthetic data)\b/i],
  ['training', /\b(training|trained on|pre-training|fine-tun|rlhf|dpo)\b/i],
  ['inference', /\b(inference|latency|throughput|tokens per second|faster inference|serving)\b/i],
  ['hardware', /\b(gpu|tpu|chip|nvidia|amd|intel|h100|a100|datacenter|compute)\b/i],
  ['open_source', /\b(open source|open-source|open weights|released weights|apache\b|mit license|github|hugging face)\b/i],
  ['ai_safety', /\b(ai safety|alignment|guardrails|red teaming|jailbreak|safety blueprint)\b/i],
  ['opinion', /\b(opinion|editorial|commentary|hot take|analysis:)\b/i],
  ['image_gen', /\b(image generation|text-to-image|flux|dall-e|midjourney|imagen)\b/i],
  ['video_gen', /\b(video generation|text-to-video|runway|sora|pika|kling|veo)\b/i],
  ['music_gen', /\b(music generation|text-to-music|udio|suno)\b/i],
  ['voice_synthesis', /\b(voice synthesis|voice clone|text-to-speech|tts|speech synthesis|elevenlabs)\b/i],
  ['creative_tool', /\b(creative tool|design tool|adobe ai|canva ai|figma ai)\b/i],
  ['art_ai', /\b(ai art|generative art|digital art|artist tool)\b/i],
  ['photography', /\b(photography|photographer|camera|lens|mirrorless|wildlife photography|photo editing)\b/i],
  ['camera', /\b(camera|mirrorless|dslr|lens)\b/i],
  ['camera_release', /\b(new camera|camera launch|camera announce|new lens|lens release)\b/i],
  ['lens', /\b(lens|focal length|telephoto|macro lens)\b/i],
  ['photo_editing', /\b(lightroom|photoshop|capture one|raw processing|post-processing)\b/i],
  ['lightroom', /\blightroom\b/i],
  ['photoshop', /\bphotoshop\b/i],
  ['capture_one', /\bcapture one\b/i],
  ['photography_ai', /\b(topaz|luminar ai|ai denoise|ai upscale|computational photography)\b/i],
  ['photography_technique', /\b(composition|long exposure|portrait lighting|street photography)\b/i],
  ['photography_business', /\b(stock photography|print sales|photo exhibition|photography business)\b/i],
  ['crypto', /\b(bitcoin|crypto|cryptocurrency|ethereum|solana|defi|nft|web3|stablecoin)\b/i],
  ['crypto_trading', /\b(price action|bull market|bear market|liquidation|binance|coinbase|kraken)\b/i],
  ['crypto_defi', /\b(defi|staking|liquidity|dao|smart contract)\b/i],
  ['crypto_regulation', /\b(cftc|sec|spot etf|crypto regulation|crypto tax)\b/i],
];

export interface NewsRouteCandidate extends CuratedNewsItem {
  importance_score?: number | string | null;
  published_at?: string | null;
  discovered_at?: string | null;
}

export interface RoutedNewsItem extends CuratedNewsItem {
  importanceScore: number;
  routingTags: string[];
  sourceTags: string[];
  matchedSourceId: string | null;
}

export interface AiNewsRoutingDiagnostics {
  routedItems: RoutedNewsItem[];
  excludedCount: number;
  highSignalCount: number;
  officialSourceCount: number;
}

function normaliseText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function getHostname(url: string | null | undefined): string {
  try {
    return new URL(url ?? '').hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '[]') return [];

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1)
        .split(',')
        .map((item) => item.replace(/^"+|"+$/g, '').trim())
        .filter(Boolean);
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed)
          .map((item: unknown) => String(item).trim())
          .filter(Boolean);
      } catch {
        return [];
      }
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getKeywordTags(item: Pick<CuratedNewsItem, 'title' | 'summary' | 'source' | 'url'>): string[] {
  const haystack = `${item.title} ${item.summary} ${item.source} ${item.url}`;
  return KEYWORD_TAG_PATTERNS
    .filter(([, pattern]) => pattern.test(haystack))
    .map(([tag]) => tag);
}

function matchPipelineSource(item: Pick<CuratedNewsItem, 'source' | 'url'>) {
  const itemHost = getHostname(item.url);
  const sourceName = normaliseText(item.source);

  return ROUTED_SOURCES.find((source) => {
    if (normaliseText(source.name) === sourceName) return true;

    if (source.articleLinkPattern) {
      try {
        if (new RegExp(source.articleLinkPattern).test(item.url)) return true;
      } catch {
        // ignore invalid patterns in generated snapshot
      }
    }

    const sourceHosts = [source.url, source.listingUrl]
      .map((value) => getHostname(value))
      .filter(Boolean);

    return sourceHosts.includes(itemHost);
  }) ?? null;
}

function getImportanceScore(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function routeAiResourceHubNews<T extends NewsRouteCandidate>(items: T[]): RoutedNewsItem[] {
  const curated = curateNewsItems(items);
  const includeTags = new Set<string>(AI_RESOURCE_HUB_SITE?.includeTags ?? []);
  const excludeTags = new Set<string>(AI_RESOURCE_HUB_SITE?.excludeTags ?? []);
  const minImportance = Number(AI_RESOURCE_HUB_SITE?.minImportanceScore ?? 0);

  return curated.flatMap((item) => {
    const matchedSource = matchPipelineSource(item);
    const explicitTags = parseTags((item as { tags?: unknown }).tags);
    const sourceTags = matchedSource?.tags?.filter(Boolean) ?? [];
    const keywordTags = getKeywordTags(item);
    const routingTags = [...new Set([...explicitTags, ...sourceTags, ...keywordTags])];

    const hasIncludeTag = routingTags.some((tag) => includeTags.has(tag));
    const hasExcludeTag = routingTags.some((tag) => excludeTags.has(tag));
    const importanceScore = getImportanceScore(item.importance_score);
    const hasHighSignal = routingTags.some((tag) => HIGH_SIGNAL_TAGS.has(tag));

    if (hasExcludeTag || !hasIncludeTag) {
      return [];
    }

    if (importanceScore < minImportance && !hasHighSignal && sourceTags.length === 0) {
      return [];
    }

    return [{
      ...item,
      tags: routingTags,
      importanceScore,
      routingTags,
      sourceTags,
      matchedSourceId: matchedSource?.id ?? null,
    }];
  });
}

export function getAiResourceHubNewsRoutingDiagnostics<T extends NewsRouteCandidate>(items: T[]): AiNewsRoutingDiagnostics {
  const curated = curateNewsItems(items);
  const routedItems = routeAiResourceHubNews(items);

  return {
    routedItems,
    excludedCount: Math.max(0, curated.length - routedItems.length),
    highSignalCount: routedItems.filter((item) => item.routingTags.some((tag) => HIGH_SIGNAL_TAGS.has(tag))).length,
    officialSourceCount: routedItems.filter((item) => item.sourceTags.length > 0).length,
  };
}
