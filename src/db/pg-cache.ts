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
  model_name: string;
  provider_name: string;
  provider_colour: string;
  model_category: string;
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
  tags: string[];
  importance_score: number;
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

// ─── Public API (drop-in replacements for queries.ts functions) ─

export function getModels(): CachedModel[] {
  return loadCache<CachedModel>('models');
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
  return loadCache<CachedBenchmarkScore>('benchmark_scores');
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
  return loadCache<CachedNews>('news').slice(0, limit);
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
  return loadCache<CachedPriceHistory>('price_history');
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

// Stub functions for tables not yet in Postgres
export function getGlossaryTerms() { return []; }
export function getGlossaryTermById(_id: string) { return null; }
export function getAllGlossaryIds() { return []; }
export function getYouTubeCreators() { return []; }
export function getYouTubeCreatorsByCategory(_cat: string) { return []; }
export function getYouTubeCreatorCategories() { return []; }
export function getTags() { return []; }
export function getTagById(_id: string) { return null; }
export function getAllTagIds() { return []; }
export function getTagsForItem(_id: string, _type: string) { return []; }
export function getItemsByTag(_tagId: string, _type: string) { return []; }
export function getTagsWithCounts() { return []; }
export function getRumouredModels() { return []; }
export function getCLITools() { return []; }
export function getCLIToolById(_id: string) { return null; }
export function getAllCLIToolIds() { return []; }
export function getProviderPlans(_id: string) { return []; }
export function getModelMessageLimits(_id: string) { return []; }
export function getPlanLimits(_id: string) { return []; }
export function getAllSubscriptionPlans() { return []; }
export function getProviderEndpoints(_id: string) { return []; }
export function getModelsWithMultipleEndpoints() { return []; }
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
