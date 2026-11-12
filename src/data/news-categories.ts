/**
 * Canonical reader categories for AI Resource Hub news (hub #1495, #1497).
 *
 * The source of truth is shared/news-categories.json so the backfill script,
 * the newsletter Worker and other sites read the same file. This module adds
 * types and the classifier used at build time.
 */
import config from '../../shared/news-categories.json';

export type NewsCategoryId = 'models' | 'tools' | 'agents' | 'research' | 'industry' | 'policy' | 'voices';
export type NewsTagId = 'benchmark' | 'pricing_change' | 'open_source';

export interface NewsCategory {
  id: NewsCategoryId;
  label: string;
  description: string;
  className: string;
}

export type LegacyVocabulary = 'newsFeed' | 'database' | 'curationMeta' | 'legacyLabels';

export const NEWS_CATEGORIES: NewsCategory[] = config.categories as NewsCategory[];
export const NEWS_CATEGORY_IDS: NewsCategoryId[] = NEWS_CATEGORIES.map((category) => category.id);
export const NEWS_TAG_IDS: NewsTagId[] = config.tags as NewsTagId[];

const byId = new Map(NEWS_CATEGORIES.map((category) => [category.id, category]));

const legacyMap = config.legacyMap as unknown as Record<LegacyVocabulary, Record<string, NewsCategoryId | null>>;

const rules = config.keywordRules;
const orderedPatterns: Array<[NewsCategoryId, RegExp]> = (rules.order as NewsCategoryId[]).map((id) => [
  id,
  new RegExp((rules.patterns as Record<string, string>)[id], 'i'),
]);
const SPECIFIC = new Set<NewsCategoryId>(['policy', 'voices', 'agents', 'research']);
const tagPatterns:Array<[NewsTagId, RegExp]> = Object.entries(rules.tagPatterns as Record<string, string>).map(
  ([id, pattern]) => [id as NewsTagId, new RegExp(pattern, 'i')],
);

export function isNewsCategoryId(value: unknown): value is NewsCategoryId {
  return typeof value === 'string' && byId.has(value as NewsCategoryId);
}

export function getNewsCategory(id: NewsCategoryId): NewsCategory {
  return byId.get(id)!;
}

/**
 * Maps a value from one of the old vocabularies onto a canonical id.
 * Returns undefined when the value is unknown, null when it is deliberately excluded (e.g. crypto).
 */
export function mapLegacyCategory(value: string | null | undefined, vocabulary?: LegacyVocabulary): NewsCategoryId | null | undefined {
  if (!value) return undefined;
  if (isNewsCategoryId(value)) return value;
  const vocabularies: LegacyVocabulary[] = vocabulary ? [vocabulary] : ['newsFeed', 'database', 'curationMeta', 'legacyLabels'];
  for (const name of vocabularies) {
    const map = legacyMap[name];
    if (Object.prototype.hasOwnProperty.call(map, value)) return map[value];
  }
  return undefined;
}

export interface ClassifyInput {
  title: string;
  summary?: string | null;
  /** The category the source row already carries, in any legacy vocabulary. */
  sourceCategory?: string | null;
  vocabulary?: LegacyVocabulary;
}

export interface Classification {
  category: NewsCategoryId | null;
  tags: NewsTagId[];
  /** How the category was chosen, for audits and the backfill report. */
  reason: 'keyword' | 'legacy' | 'default' | 'excluded';
}

/**
 * Picks one canonical category for a story:
 *   1. keywords for the specific topics (policy, voices, agents, research);
 *   2. the source's own label, unless it is the catch-all "industry";
 *   3. keywords for industry, models, tools;
 *   4. the source label, else Industry. Stories whose legacy category maps to null (crypto, other) are
 * excluded unless a keyword rule claims them.
 */
export function classifyNewsItem({ title, summary, sourceCategory, vocabulary }: ClassifyInput): Classification {
  const text = `${title} ${summary ?? ''}`;
  const tags = tagPatterns.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
  const legacy = mapLegacyCategory(sourceCategory, vocabulary);

  if (legacy === null) {
    return { category: null, tags, reason: 'excluded' };
  }

  // Specific topics (policy, voices, agents, research) win over the source's own label.
  for (const [id, pattern] of orderedPatterns.filter(([id]) => SPECIFIC.has(id))) {
    if (pattern.test(text)) return { category: id, tags, reason: 'keyword' };
  }

  // A specific source label (e.g. an arXiv or lab-blog feed) beats generic keywords.
  // "industry" is the catch-all label of general tech feeds, so keywords refine it.
  if (legacy && legacy !== 'industry') return { category: legacy, tags, reason: 'legacy' };

  for (const [id, pattern] of orderedPatterns.filter(([id]) => !SPECIFIC.has(id))) {
    if (pattern.test(text)) return { category: id, tags, reason: 'keyword' };
  }

  if (legacy) return { category: legacy, tags, reason: 'legacy' };
  return { category: 'industry', tags, reason: 'default' };
}
