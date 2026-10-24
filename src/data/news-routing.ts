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

const KEYWORD_TAG_PATTERNS: Array<[string, RegExp]> = newsPipelineSnapshot.routingTags.flatMap((tag) => {
  if (tag.kind !== 'topic' || !tag.keywordPattern) return [];
  try {
    return [[tag.id, new RegExp(tag.keywordPattern, 'i')] as [string, RegExp]];
  } catch {
    return [];
  }
});

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
