/**
 * Postgres cache reader — replaces SQLite for build-time data access.
 *
 * Reads pre-dumped JSON files from data/pg-cache/ (created by dump-pg-to-json.mjs).
 * All functions are synchronous so existing Astro pages don't need changing.
 *
 * Data flow:
 *   Postgres (live) → dump-pg-to-json.mjs → JSON files → this module → Astro pages
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'pg-cache');

// In-memory cache — loaded once per build
const _cache = new Map<string, unknown[]>();

function loadCache<T = Record<string, unknown>>(name: string): T[] {
  if (_cache.has(name)) return _cache.get(name) as T[];

  const filePath = path.join(CACHE_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    console.warn(`[pg-cache] Missing cache file: ${name}.json — returning empty array`);
    return [];
  }

  const data = JSON.parse(readFileSync(filePath, 'utf8')) as T[];
  _cache.set(name, data);
  return data;
}

// ─── Type helpers ───────────────────────────────────────────────

interface CachedModel {
  id: string;
  name: string;
  provider_id: string;
  provider_name: string;
  provider_colour: string;
  provider_website: string | null;
  input_price: number;
  output_price: number;
  context_window: number;
  max_output: number;
  speed: number;
  ttft: number;
  quality_score: number;
  released: string | null;
  open_source: boolean;
  modality: string;
  api_available: boolean;
  category: string;
  status: string;
  notes: string | null;
  pricing_source: string | null;
  pricing_updated: string | null;
  speed_source: string | null;
  speed_updated: string | null;
}

interface CachedProvider {
  id: string;
  name: string;
  colour: string;
  website: string | null;
  description: string | null;
  founded: string | null;
  headquarters: string | null;
  ceo: string | null;
  funding: string | null;
}

interface CachedBenchmark {
  id: string;
  name: string;
  category: string;
  description: string | null;
  url: string | null;
  scale_min: number;
  scale_max: number;
  higher_is_better: boolean;
  weight: number;
}

interface CachedBenchmarkScore {
  model_id: string;
  benchmark_id: string;
  score: number;
  source: string | null;
  source_url: string | null;
  measured_at?: string | null;
  updated_at?: string | null;
  model_name: string;
  provider_name: string;
  provider_colour: string;
  model_category: string;
  provider_id?: string;
}

interface CachedPerson {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  provider_id: string | null;
  organisation_name: string | null;
  bio: string | null;
  twitter: string | null;
  website: string | null;
  notable_for: string | null;
}

interface CachedNews {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  category: string;
  tags: string[] | string | null;
  importance_score: number | string | null;
  published_at: string | null;
  discovered_at: string | null;
}

interface CachedPriceHistory {
  model_id: string;
  model_name: string;
  provider_name: string;
  provider_colour: string;
  input_price: number;
  output_price: number;
  recorded_at: string;
  source: string | null;
}

type LooseRecord = Record<string, any>;

interface CachedYouTubeCreator {
  id: string;
  name: string;
  channel_name: string;
  youtube_handle: string | null;
  youtube_url: string | null;
  subscribers: number;
  category: string;
  vertical: string;
  description: string;
  twitter?: string | null;
  website?: string | null;
  person_id?: string | null;
}

interface CachedGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  plain_english: string | null;
  category: string;
  related_terms: string | null;
  see_also: string | null;
}

interface CachedTag {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface CachedTagWithCount extends CachedTag {
  count: number;
}

interface CachedProviderEndpoint {
  id: string;
  model_id: string;
  provider_id: string;
  provider_name: string;
  provider_colour: string;
  endpoint_name: string;
  speed: number;
  ttft: number;
  input_price: number;
  output_price: number;
  measured_at: string | null;
  source: string | null;
}

interface CachedPlanLimit {
  plan_id: string;
  plan_name: string;
  price_monthly: number | null;
  model_id: string | null;
  model_tier: string | null;
  model_name: string | null;
  messages_low: number | null;
  messages_high: number | null;
  message_period: string;
  notes: string | null;
}

interface CachedRumouredModel {
  id: string;
  codename: string;
  provider_id: string | null;
  provider_name: string | null;
  provider_colour: string | null;
  status: string;
  first_seen: string;
  confirmed_as: string | null;
  confirmed_name: string | null;
  sources: string | null;
  notes: string | null;
  category: string;
}

interface CachedSubscriptionPlan {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_colour: string;
  plan_name: string;
  price_monthly: number | null;
  price_yearly_monthly: number | null;
  tier_level: number;
  source_url: string | null;
  notes: string | null;
}

interface CachedCliTool {
  id: string;
  name: string;
  provider_id: string | null;
  provider_name: string | null;
  provider_colour: string | null;
  maker: string;
  description: string | null;
  default_model: string | null;
  supported_models: string | null;
  context_window: number;
  open_source: boolean;
  license: string | null;
  github_url: string | null;
  website: string | null;
  install_command: string | null;
  pricing_type: string;
  pricing_note: string | null;
  mcp_support: boolean;
  multi_file: boolean;
  git_integration: boolean;
  platforms: string;
  released: string | null;
  status: string;
  notes: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

// ─── Public API (drop-in replacements for queries.ts functions) ─

export function getModels(): CachedModel[] {
  return loadCache<CachedModel>('models').map((model) => ({
    ...model,
    input_price: toNumber(model.input_price),
    output_price: toNumber(model.output_price),
    speed: toNumber(model.speed),
    ttft: toNumber(model.ttft),
    quality_score: toNumber(model.quality_score),
  }));
}

export function getModelsByCategory(category: string): CachedModel[] {
  return getModels().filter(m => m.category === category && m.status === 'active');
}

export function getModelById(id: string): CachedModel | null {
  return getModels().find(m => m.id === id) ?? null;
}

export function getAllModelIds(): string[] {
  return getModels().filter(m => m.status === 'active').map(m => m.id);
}

export function getRecentModels(limit = 12): CachedModel[] {
  return getModels()
    .filter(m => m.status === 'active' && m.released)
    .sort((a, b) => (b.released || '').localeCompare(a.released || ''))
    .slice(0, limit);
}

export function getProviders(): CachedProvider[] {
  return loadCache<CachedProvider>('providers');
}

export function getProviderById(id: string): CachedProvider | null {
  return getProviders().find(p => p.id === id) ?? null;
}

export function getAllProviderIds(): string[] {
  return getProviders().map(p => p.id);
}

export function getProvidersWithCounts(): Array<CachedProvider & { modelCount: number }> {
  const models = getModels().filter(m => m.status === 'active');
  return getProviders().map(p => ({
    ...p,
    modelCount: models.filter(m => m.provider_id === p.id).length,
  })).sort((a, b) => b.modelCount - a.modelCount || a.name.localeCompare(b.name));
}

export function getBenchmarks(): CachedBenchmark[] {
  return loadCache<CachedBenchmark>('benchmarks');
}

export function getBenchmarkById(id: string): CachedBenchmark | null {
  return getBenchmarks().find(b => b.id === id) ?? null;
}

export function getAllBenchmarkIds(): string[] {
  return getBenchmarks().map(b => b.id);
}

export function getBenchmarkScores(): CachedBenchmarkScore[] {
  const models = new Map(getModels().map((model) => [model.id, model]));
  return loadCache<CachedBenchmarkScore>('benchmark_scores').map((score) => ({
    ...score,
    score: toNumber(score.score),
    provider_id: score.provider_id ?? models.get(score.model_id)?.provider_id,
    measured_at: score.measured_at ?? null,
    updated_at: score.updated_at ?? null,
  }));
}

export function getModelBenchmarks(modelId: string): CachedBenchmarkScore[] {
  return getBenchmarkScores().filter(s => s.model_id === modelId);
}

export function getScoresForBenchmark(benchmarkId: string): CachedBenchmarkScore[] {
  return getBenchmarkScores()
    .filter(s => s.benchmark_id === benchmarkId)
    .sort((a, b) => b.score - a.score);
}

export function getBenchmarkMatrix() {
  const benchmarks = getBenchmarks();
  const scores = getBenchmarkScores();

  const modelMap = new Map<string, {
    id: string;
    name: string;
    provider: string;
    providerColour: string;
    scores: Record<string, number>;
  }>();

  for (const s of scores) {
    if (!modelMap.has(s.model_id)) {
      modelMap.set(s.model_id, {
        id: s.model_id,
        name: s.model_name,
        provider: s.provider_name,
        providerColour: s.provider_colour,
        scores: {},
      });
    }
    modelMap.get(s.model_id)!.scores[s.benchmark_id] = s.score;
  }

  return { benchmarks, models: Array.from(modelMap.values()) };
}

export function getPeople(): CachedPerson[] {
  return loadCache<CachedPerson>('people');
}

export function getPeopleByProvider(providerId: string): CachedPerson[] {
  return getPeople().filter(p => p.provider_id === providerId);
}

export function getNews(limit = 50): CachedNews[] {
  return loadCache<CachedNews>('news')
    .map((item) => {
      const rawTags = item.tags;
      const tags = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
          ? rawTags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : [];

      return {
        ...item,
        tags,
        importance_score: toNumber(item.importance_score),
      };
    })
    .slice(0, limit);
}

export function getNewsByCategory(category: string, limit = 50): CachedNews[] {
  return loadCache<CachedNews>('news')
    .filter(n => n.category === category)
    .slice(0, limit);
}

export function getNewsCategories(): Array<{ category: string; count: number }> {
  const news = loadCache<CachedNews>('news');
  const counts = new Map<string, number>();
  for (const n of news) {
    counts.set(n.category, (counts.get(n.category) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPriceHistory(): CachedPriceHistory[] {
  return loadCache<CachedPriceHistory>('price_history').map((entry) => ({
    ...entry,
    input_price: toNumber(entry.input_price),
    output_price: toNumber(entry.output_price),
  }));
}

export function getModelPriceHistory(modelId: string): CachedPriceHistory[] {
  return getPriceHistory().filter(p => p.model_id === modelId);
}

export function getModelsWithPriceHistory(): CachedPriceHistory[] {
  return getPriceHistory();
}

// ─── Compatibility shims ────────────────────────────────────────
// These match the old queries.ts signatures that Astro pages expect.
// Values that were SQLite integers (0/1) are now proper booleans from Postgres.

export function getLLMModelsFromDB() {
  return getModelsByCategory('llm').map(m => {
    const blended = (Number(m.input_price) + 3 * Number(m.output_price)) / 4;
    const valueScore = blended > 0 && m.quality_score > 0
      ? Math.round((Number(m.quality_score) / blended) * 10)
      : 0;

    return {
      id: m.id,
      name: m.name,
      provider: m.provider_name,
      providerColour: m.provider_colour,
      inputPrice: Number(m.input_price),
      outputPrice: Number(m.output_price),
      contextWindow: Number(m.context_window),
      maxOutput: Number(m.max_output),
      speed: Number(m.speed),
      ttft: Number(m.ttft),
      qualityScore: Number(m.quality_score),
      valueScore,
      released: m.released || '',
      openSource: !!m.open_source,
      modality: (m.modality || 'text').split(',').map((s: string) => s.trim()),
      apiAvailable: m.api_available !== false,
      notes: m.notes || undefined,
    };
  });
}

export function getGlossaryTerms(): CachedGlossaryTerm[] {
  return loadCache<CachedGlossaryTerm>('glossary').sort((a, b) => a.term.localeCompare(b.term));
}
export function getGlossaryTermById(id: string): CachedGlossaryTerm | null {
  return getGlossaryTerms().find((term) => term.id === id) ?? null;
}
export function getAllGlossaryIds(): string[] {
  return getGlossaryTerms().map((term) => term.id);
}
export function getYouTubeCreators() {
  return loadCache<CachedYouTubeCreator>('youtube_creators');
}
export function getYouTubeCreatorsByCategory(cat: string) {
  return getYouTubeCreators().filter(c => c.category === cat);
}
export function getYouTubeCreatorCategories() {
  const creators = getYouTubeCreators();
  const counts = new Map<string, number>();
  for (const c of creators) counts.set(c.category, (counts.get(c.category) || 0) + 1);
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}
export function getTags(): CachedTag[] {
  return loadCache<CachedTag>('tags').sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
export function getTagById(id: string): CachedTag | null {
  return getTags().find((tag) => tag.id === id) ?? null;
}
export function getAllTagIds(): string[] {
  return getTags().map((tag) => tag.id);
}
export function getTagsForItem(id: string, type: string): CachedTag[] {
  const tagIds = loadCache<{ tag_id: string; taggable_id: string; taggable_type: string }>('taggables')
    .filter((row) => row.taggable_id === id && row.taggable_type === type)
    .map((row) => row.tag_id);
  return getTags().filter((tag) => tagIds.includes(tag.id));
}
export function getItemsByTag(tagId: string, type: string): string[] {
  return loadCache<{ tag_id: string; taggable_id: string; taggable_type: string }>('taggables')
    .filter((row) => row.tag_id === tagId && row.taggable_type === type)
    .map((row) => row.taggable_id);
}
export function getTagsWithCounts(): CachedTagWithCount[] {
  const counts = new Map<string, number>();
  for (const row of loadCache<{ tag_id: string }>('taggables')) {
    counts.set(row.tag_id, (counts.get(row.tag_id) ?? 0) + 1);
  }
  return getTags()
    .map((tag) => ({ ...tag, count: counts.get(tag.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
export function getRumouredModels(): CachedRumouredModel[] {
  return loadCache<CachedRumouredModel>('rumoured_models');
}
export function getCLITools(): CachedCliTool[] {
  return loadCache<CachedCliTool>('cli_tools')
    .filter((tool) => tool.status === 'active')
    .map((tool) => ({
      ...tool,
      context_window: toNumber(tool.context_window),
      open_source: !!tool.open_source,
      mcp_support: !!tool.mcp_support,
      multi_file: !!tool.multi_file,
      git_integration: !!tool.git_integration,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
export function getCLIToolById(id: string): CachedCliTool | null {
  return getCLITools().find((tool) => tool.id === id) ?? null;
}
export function getAllCLIToolIds(): string[] {
  return getCLITools().map((tool) => tool.id);
}
export function getProviderPlans(id: string): CachedSubscriptionPlan[] {
  return loadCache<CachedSubscriptionPlan>('subscription_plans')
    .filter((plan) => plan.provider_id === id)
    .map((plan) => ({
      ...plan,
      price_monthly: plan.price_monthly == null ? null : toNumber(plan.price_monthly),
      price_yearly_monthly: plan.price_yearly_monthly == null ? null : toNumber(plan.price_yearly_monthly),
      tier_level: toNumber(plan.tier_level),
    }))
    .sort((a, b) => a.tier_level - b.tier_level || a.plan_name.localeCompare(b.plan_name));
}
export function getModelMessageLimits(id: string): CachedPlanLimit[] {
  return loadCache<CachedPlanLimit>('plan_model_limits')
    .filter((limit) => limit.model_id === id)
    .map((limit) => ({
      ...limit,
      price_monthly: limit.price_monthly == null ? null : toNumber(limit.price_monthly),
      messages_low: limit.messages_low == null ? null : toNumber(limit.messages_low),
      messages_high: limit.messages_high == null ? null : toNumber(limit.messages_high),
    }));
}
export function getPlanLimits(id: string): CachedPlanLimit[] {
  return loadCache<CachedPlanLimit>('plan_model_limits')
    .filter((limit) => limit.plan_id === id)
    .map((limit) => ({
      ...limit,
      price_monthly: limit.price_monthly == null ? null : toNumber(limit.price_monthly),
      messages_low: limit.messages_low == null ? null : toNumber(limit.messages_low),
      messages_high: limit.messages_high == null ? null : toNumber(limit.messages_high),
    }));
}
export function getAllSubscriptionPlans(): Array<CachedSubscriptionPlan & { limit_count: number }> {
  const limitCounts = new Map<string, number>();
  for (const limit of loadCache<CachedPlanLimit>('plan_model_limits')) {
    limitCounts.set(limit.plan_id, (limitCounts.get(limit.plan_id) ?? 0) + 1);
  }
  return loadCache<CachedSubscriptionPlan>('subscription_plans')
    .map((plan) => ({
      ...plan,
      price_monthly: plan.price_monthly == null ? null : toNumber(plan.price_monthly),
      price_yearly_monthly: plan.price_yearly_monthly == null ? null : toNumber(plan.price_yearly_monthly),
      tier_level: toNumber(plan.tier_level),
      limit_count: limitCounts.get(plan.id) ?? 0,
    }))
    .sort((a, b) => a.provider_name.localeCompare(b.provider_name) || a.tier_level - b.tier_level || a.plan_name.localeCompare(b.plan_name));
}
export function getProviderEndpoints(id: string): CachedProviderEndpoint[] {
  return loadCache<CachedProviderEndpoint>('provider_endpoints')
    .filter((endpoint) => endpoint.model_id === id)
    .map((endpoint) => ({
      ...endpoint,
      speed: toNumber(endpoint.speed),
      ttft: toNumber(endpoint.ttft),
      input_price: toNumber(endpoint.input_price),
      output_price: toNumber(endpoint.output_price),
    }))
    .sort((a, b) => b.speed - a.speed || a.provider_name.localeCompare(b.provider_name));
}
export function getModelsWithMultipleEndpoints(): Array<{ model_id: string; model_name: string; provider: string; provider_colour: string; endpoint_count: number }> {
  const modelMap = new Map(getModels().map((model) => [model.id, model]));
  const grouped = new Map<string, CachedProviderEndpoint[]>();
  for (const endpoint of loadCache<CachedProviderEndpoint>('provider_endpoints')) {
    const list = grouped.get(endpoint.model_id) ?? [];
    list.push(endpoint);
    grouped.set(endpoint.model_id, list);
  }
  return Array.from(grouped.entries())
    .filter(([, endpoints]) => endpoints.length >= 2)
    .map(([model_id, endpoints]) => {
      const model = modelMap.get(model_id);
      return {
        model_id,
        model_name: model?.name ?? endpoints[0]?.model_id ?? model_id,
        provider: model?.provider_name ?? endpoints[0]?.provider_name ?? '',
        provider_colour: model?.provider_colour ?? endpoints[0]?.provider_colour ?? '#888888',
        endpoint_count: endpoints.length,
      };
    })
    .sort((a, b) => b.endpoint_count - a.endpoint_count || a.model_name.localeCompare(b.model_name));
}
export function getModelsWithTTFT() {
  return getModels()
    .filter(m => Number(m.ttft) > 0 && m.status === 'active' && m.category === 'llm')
    .map(m => ({
      id: m.id,
      name: m.name,
      ttft: Number(m.ttft),
      speed: Number(m.speed),
      provider: m.provider_name,
      provider_colour: m.provider_colour,
      quality_score: Number(m.quality_score),
      input_price: Number(m.input_price),
      output_price: Number(m.output_price),
      speed_source: m.speed_source,
    }))
    .sort((a, b) => a.ttft - b.ttft);
}
export function getModelsByProvider(providerId: string) {
  return getModelsByCategory('llm').filter(m => m.provider_id === providerId);
}
export function getModelsByProviderGrouped(providerId: string) {
  const models = getModels().filter(m => m.provider_id === providerId && m.status === 'active');
  const grouped: Record<string, typeof models> = {};
  for (const m of models) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }
  return grouped;
}
export function getModelCounts() {
  const models = getModels().filter(m => m.status === 'active');
  const counts: Record<string, number> = {};
  for (const m of models) counts[m.category] = (counts[m.category] || 0) + 1;
  return counts;
}
export function getLastScrapeTime(_scraper: string) {
  const logs = loadCache<{ scraper: string; status: string; finished_at: string }>('scrape_log');
  const match = logs.find(l => l.scraper === _scraper && l.status === 'success');
  return match?.finished_at ?? null;
}
