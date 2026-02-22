/**
 * Database query functions for The AI Resource Hub.
 * Used at Astro build time to read data for static page generation.
 */
import { getDB } from './schema';
import type { LLMModel } from '../types/models';

export interface DBProvider {
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

export interface DBBenchmark {
  id: string;
  name: string;
  category: string;
  description: string | null;
  url: string | null;
  scale_min: number;
  scale_max: number;
  higher_is_better: number;
  weight: number;
}

export interface DBBenchmarkScore {
  model_id: string;
  benchmark_id: string;
  benchmark_name: string;
  score: number;
  source: string | null;
}

export interface DBPerson {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  provider_id: string | null;
  bio: string | null;
  twitter: string | null;
  website: string | null;
  notable_for: string | null;
}

/**
 * Get all LLM models with computed value scores, formatted for the frontend.
 */
export function getLLMModelsFromDB(): LLMModel[] {
  const db = getDB();

  const rows = db.prepare(`
    SELECT
      m.id,
      m.name,
      p.name AS provider,
      p.colour AS providerColour,
      m.input_price AS inputPrice,
      m.output_price AS outputPrice,
      m.context_window AS contextWindow,
      m.max_output AS maxOutput,
      m.speed,
      m.quality_score AS qualityScore,
      m.released,
      m.open_source AS openSource,
      m.modality,
      m.api_available AS apiAvailable,
      m.notes,
      m.status,
      m.pricing_source AS pricingSource,
      m.pricing_updated AS pricingUpdated
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.category = 'llm' AND m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all() as Array<Record<string, unknown>>;

  return rows.map((row) => {
    const inputPrice = row.inputPrice as number;
    const outputPrice = row.outputPrice as number;
    const qualityScore = row.qualityScore as number;

    // Value score: quality per dollar (blended cost: 3:1 output:input ratio)
    const blendedCostPer1M = (inputPrice + 3 * outputPrice) / 4;
    const valueScore = blendedCostPer1M > 0
      ? Math.round((qualityScore / blendedCostPer1M) * 10)
      : 0;

    return {
      id: row.id as string,
      name: row.name as string,
      provider: row.provider as string,
      providerColour: row.providerColour as string,
      inputPrice,
      outputPrice,
      contextWindow: row.contextWindow as number,
      maxOutput: row.maxOutput as number,
      speed: row.speed as number,
      qualityScore,
      valueScore,
      released: row.released as string,
      openSource: (row.openSource as number) === 1,
      modality: (row.modality as string).split(',').map((m: string) => m.trim()),
      apiAvailable: (row.apiAvailable as number) === 1,
      notes: (row.notes as string) || undefined,
    };
  });
}

/**
 * Get all providers.
 */
export function getProviders(): DBProvider[] {
  const db = getDB();
  return db.prepare('SELECT * FROM providers ORDER BY name').all() as DBProvider[];
}

/**
 * Get all benchmarks.
 */
export function getBenchmarks(): DBBenchmark[] {
  const db = getDB();
  return db.prepare('SELECT * FROM benchmarks ORDER BY category, name').all() as DBBenchmark[];
}

/**
 * Get benchmark scores for a specific model.
 */
export function getModelBenchmarks(modelId: string): DBBenchmarkScore[] {
  const db = getDB();
  return db.prepare(`
    SELECT bs.model_id, bs.benchmark_id, b.name AS benchmark_name, bs.score, bs.source
    FROM benchmark_scores bs
    JOIN benchmarks b ON bs.benchmark_id = b.id
    WHERE bs.model_id = ?
    ORDER BY b.category, b.name
  `).all(modelId) as DBBenchmarkScore[];
}

/**
 * Get all people.
 */
export function getPeople(): DBPerson[] {
  const db = getDB();
  return db.prepare(`
    SELECT p.*, pr.name AS organisation
    FROM people p
    LEFT JOIN providers pr ON p.provider_id = pr.id
    ORDER BY p.name
  `).all() as DBPerson[];
}

/**
 * Get the last scrape time for a given scraper.
 */
export function getLastScrapeTime(scraper: string): string | null {
  const db = getDB();
  const row = db.prepare(`
    SELECT finished_at FROM scrape_log
    WHERE scraper = ? AND status = 'success'
    ORDER BY finished_at DESC LIMIT 1
  `).get(scraper) as { finished_at: string } | undefined;
  return row?.finished_at ?? null;
}

/**
 * Get total model count by category.
 */
export function getModelCounts(): Record<string, number> {
  const db = getDB();
  const rows = db.prepare(`
    SELECT category, COUNT(*) AS count
    FROM models
    WHERE status = 'active'
    GROUP BY category
  `).all() as Array<{ category: string; count: number }>;

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.category] = row.count;
  }
  return counts;
}

/**
 * Get providers with their model counts.
 */
export function getProvidersWithCounts(): Array<DBProvider & { modelCount: number }> {
  const db = getDB();
  return db.prepare(`
    SELECT p.*, COUNT(m.id) AS modelCount
    FROM providers p
    LEFT JOIN models m ON m.provider_id = p.id AND m.status = 'active'
    GROUP BY p.id
    ORDER BY modelCount DESC, p.name
  `).all() as Array<DBProvider & { modelCount: number }>;
}

/**
 * Get all benchmark scores for all models, joined with model and benchmark info.
 */
export interface BenchmarkMatrix {
  benchmarks: DBBenchmark[];
  models: Array<{
    id: string;
    name: string;
    provider: string;
    providerColour: string;
    scores: Record<string, number>;
  }>;
}

/**
 * Get a single model by ID with full details.
 */
export interface DBModelDetail {
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
  quality_score: number;
  released: string | null;
  open_source: number;
  modality: string;
  api_available: number;
  notes: string | null;
  category: string;
  pricing_source: string | null;
  pricing_updated: string | null;
}

export function getModelById(modelId: string): DBModelDetail | null {
  const db = getDB();
  const row = db.prepare(`
    SELECT
      m.*,
      p.name AS provider_name,
      p.colour AS provider_colour,
      p.website AS provider_website
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.id = ? AND m.status = 'active'
  `).get(modelId) as DBModelDetail | undefined;
  return row ?? null;
}

/**
 * Get all active model IDs for static path generation.
 */
export function getAllModelIds(): string[] {
  const db = getDB();
  const rows = db.prepare("SELECT id FROM models WHERE status = 'active'").all() as Array<{ id: string }>;
  return rows.map(r => r.id);
}

/**
 * Get all models for a given provider.
 */
export function getModelsByProvider(providerId: string): LLMModel[] {
  const db = getDB();
  const rows = db.prepare(`
    SELECT
      m.id,
      m.name,
      p.name AS provider,
      p.colour AS providerColour,
      m.input_price AS inputPrice,
      m.output_price AS outputPrice,
      m.context_window AS contextWindow,
      m.max_output AS maxOutput,
      m.speed,
      m.quality_score AS qualityScore,
      m.released,
      m.open_source AS openSource,
      m.modality,
      m.api_available AS apiAvailable,
      m.notes
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.provider_id = ? AND m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all(providerId) as Array<Record<string, unknown>>;

  return rows.map((row) => {
    const inputPrice = row.inputPrice as number;
    const outputPrice = row.outputPrice as number;
    const qualityScore = row.qualityScore as number;
    const blendedCostPer1M = (inputPrice + 3 * outputPrice) / 4;
    const valueScore = blendedCostPer1M > 0
      ? Math.round((qualityScore / blendedCostPer1M) * 10)
      : 0;

    return {
      id: row.id as string,
      name: row.name as string,
      provider: row.provider as string,
      providerColour: row.providerColour as string,
      inputPrice,
      outputPrice,
      contextWindow: row.contextWindow as number,
      maxOutput: row.maxOutput as number,
      speed: row.speed as number,
      qualityScore,
      valueScore,
      released: row.released as string,
      openSource: (row.openSource as number) === 1,
      modality: (row.modality as string).split(',').map((m: string) => m.trim()),
      apiAvailable: (row.apiAvailable as number) === 1,
      notes: (row.notes as string) || undefined,
    };
  });
}

/**
 * Get a single provider by ID.
 */
export function getProviderById(providerId: string): DBProvider | null {
  const db = getDB();
  const row = db.prepare('SELECT * FROM providers WHERE id = ?').get(providerId) as DBProvider | undefined;
  return row ?? null;
}

/**
 * Get all provider IDs for static path generation.
 */
export function getAllProviderIds(): string[] {
  const db = getDB();
  const rows = db.prepare('SELECT id FROM providers').all() as Array<{ id: string }>;
  return rows.map(r => r.id);
}

/**
 * Get people associated with a provider.
 */
export function getPeopleByProvider(providerId: string): DBPerson[] {
  const db = getDB();
  return db.prepare(`
    SELECT p.*, pr.name AS organisation
    FROM people p
    LEFT JOIN providers pr ON p.provider_id = pr.id
    WHERE p.provider_id = ?
    ORDER BY p.name
  `).all(providerId) as DBPerson[];
}

/**
 * Get price history for a model.
 */
export interface DBPriceHistory {
  input_price: number;
  output_price: number;
  recorded_at: string;
  source: string | null;
}

export function getModelPriceHistory(modelId: string): DBPriceHistory[] {
  const db = getDB();
  return db.prepare(`
    SELECT input_price, output_price, recorded_at, source
    FROM price_history
    WHERE model_id = ?
    ORDER BY recorded_at ASC
  `).all(modelId) as DBPriceHistory[];
}

/**
 * Get all glossary terms.
 */
export interface DBGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  plain_english: string | null;
  category: string;
  related_terms: string | null;
  see_also: string | null;
}

export function getGlossaryTerms(): DBGlossaryTerm[] {
  const db = getDB();
  return db.prepare('SELECT * FROM glossary ORDER BY term').all() as DBGlossaryTerm[];
}

export function getGlossaryTermById(termId: string): DBGlossaryTerm | null {
  const db = getDB();
  const row = db.prepare('SELECT * FROM glossary WHERE id = ?').get(termId) as DBGlossaryTerm | undefined;
  return row ?? null;
}

export function getAllGlossaryIds(): string[] {
  const db = getDB();
  const rows = db.prepare('SELECT id FROM glossary').all() as Array<{ id: string }>;
  return rows.map(r => r.id);
}

/**
 * Generic model query by category, returning a simplified model list.
 */
export interface CategoryModel {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  maxOutput: number;
  speed: number;
  qualityScore: number;
  released: string;
  openSource: boolean;
  modality: string;
  apiAvailable: boolean;
  notes: string | undefined;
}

export function getModelsByCategory(category: string): CategoryModel[] {
  const db = getDB();
  const rows = db.prepare(`
    SELECT
      m.id,
      m.name,
      p.name AS provider,
      p.colour AS providerColour,
      m.input_price AS inputPrice,
      m.output_price AS outputPrice,
      m.context_window AS contextWindow,
      m.max_output AS maxOutput,
      m.speed,
      m.quality_score AS qualityScore,
      m.released,
      m.open_source AS openSource,
      m.modality,
      m.api_available AS apiAvailable,
      m.notes
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.category = ? AND m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all(category) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    provider: row.provider as string,
    providerColour: row.providerColour as string,
    inputPrice: row.inputPrice as number,
    outputPrice: row.outputPrice as number,
    contextWindow: row.contextWindow as number,
    maxOutput: row.maxOutput as number,
    speed: row.speed as number,
    qualityScore: row.qualityScore as number,
    released: row.released as string,
    openSource: (row.openSource as number) === 1,
    modality: row.modality as string,
    apiAvailable: (row.apiAvailable as number) === 1,
    notes: (row.notes as string) || undefined,
  }));
}

/**
 * Get a single benchmark by ID with all its scores.
 */
export interface BenchmarkDetail {
  id: string;
  name: string;
  category: string;
  description: string | null;
  url: string | null;
  scale_min: number;
  scale_max: number;
  higher_is_better: number;
  weight: number;
}

export interface BenchmarkModelScore {
  model_id: string;
  model_name: string;
  provider: string;
  provider_id: string;
  providerColour: string;
  score: number;
  source: string | null;
  source_url: string | null;
  measured_at: string | null;
  category: string;
}

export function getBenchmarkById(benchmarkId: string): BenchmarkDetail | null {
  const db = getDB();
  const row = db.prepare('SELECT * FROM benchmarks WHERE id = ?').get(benchmarkId) as BenchmarkDetail | undefined;
  return row ?? null;
}

export function getScoresForBenchmark(benchmarkId: string): BenchmarkModelScore[] {
  const db = getDB();
  return db.prepare(`
    SELECT
      bs.model_id, m.name AS model_name, p.name AS provider, m.provider_id,
      p.colour AS providerColour, bs.score, bs.source, bs.source_url, bs.measured_at,
      m.category
    FROM benchmark_scores bs
    JOIN models m ON bs.model_id = m.id
    JOIN providers p ON m.provider_id = p.id
    WHERE bs.benchmark_id = ? AND m.status = 'active'
    ORDER BY bs.score DESC
  `).all(benchmarkId) as BenchmarkModelScore[];
}

export function getAllBenchmarkIds(): string[] {
  const db = getDB();
  const rows = db.prepare('SELECT id FROM benchmarks').all() as Array<{ id: string }>;
  return rows.map(r => r.id);
}

/**
 * Get recently added/updated models across all categories.
 */
export interface RecentModel {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  category: string;
  released: string | null;
  qualityScore: number;
}

export function getRecentModels(limit: number = 12): RecentModel[] {
  const db = getDB();
  return db.prepare(`
    SELECT m.id, m.name, p.name AS provider, p.colour AS providerColour,
           m.category, m.released, m.quality_score AS qualityScore
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.status = 'active' AND m.released IS NOT NULL
    ORDER BY m.released DESC
    LIMIT ?
  `).all(limit) as RecentModel[];
}

/**
 * Get models by provider across all categories.
 */
export function getModelsByProviderGrouped(providerId: string): Record<string, Array<CategoryModel & { category: string }>> {
  const db = getDB();
  const rows = db.prepare(`
    SELECT
      m.id, m.name, p.name AS provider, p.colour AS providerColour,
      m.input_price AS inputPrice, m.output_price AS outputPrice,
      m.context_window AS contextWindow, m.max_output AS maxOutput,
      m.speed, m.quality_score AS qualityScore, m.released,
      m.open_source AS openSource, m.modality,
      m.api_available AS apiAvailable, m.notes, m.category
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.provider_id = ? AND m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all(providerId) as Array<Record<string, unknown>>;

  const grouped: Record<string, Array<CategoryModel & { category: string }>> = {};
  for (const row of rows) {
    const cat = row.category as string;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({
      id: row.id as string,
      name: row.name as string,
      provider: row.provider as string,
      providerColour: row.providerColour as string,
      inputPrice: row.inputPrice as number,
      outputPrice: row.outputPrice as number,
      contextWindow: row.contextWindow as number,
      maxOutput: row.maxOutput as number,
      speed: row.speed as number,
      qualityScore: row.qualityScore as number,
      released: row.released as string,
      openSource: (row.openSource as number) === 1,
      modality: row.modality as string,
      apiAvailable: (row.apiAvailable as number) === 1,
      notes: (row.notes as string) || undefined,
      category: cat,
    });
  }
  return grouped;
}

export function getBenchmarkMatrix(): BenchmarkMatrix {
  const db = getDB();

  const benchmarks = db.prepare(
    'SELECT * FROM benchmarks ORDER BY category, name'
  ).all() as DBBenchmark[];

  const rows = db.prepare(`
    SELECT
      bs.model_id,
      bs.benchmark_id,
      bs.score,
      m.name AS model_name,
      p.name AS provider,
      p.colour AS providerColour
    FROM benchmark_scores bs
    JOIN models m ON bs.model_id = m.id
    JOIN providers p ON m.provider_id = p.id
    WHERE m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all() as Array<{
    model_id: string;
    benchmark_id: string;
    score: number;
    model_name: string;
    provider: string;
    providerColour: string;
  }>;

  const modelMap = new Map<string, {
    id: string;
    name: string;
    provider: string;
    providerColour: string;
    scores: Record<string, number>;
  }>();

  for (const row of rows) {
    if (!modelMap.has(row.model_id)) {
      modelMap.set(row.model_id, {
        id: row.model_id,
        name: row.model_name,
        provider: row.provider,
        providerColour: row.providerColour,
        scores: {},
      });
    }
    modelMap.get(row.model_id)!.scores[row.benchmark_id] = row.score;
  }

  return {
    benchmarks,
    models: Array.from(modelMap.values()),
  };
}

// ─── YouTube Creators ────────────────────────────────────────────

export interface DBYouTubeCreator {
  id: string;
  name: string;
  channel_name: string;
  youtube_handle: string | null;
  subscribers: number;
  category: string;
  description: string | null;
  twitter: string | null;
  website: string | null;
  person_id: string | null;
}

export function getYouTubeCreators(): DBYouTubeCreator[] {
  const db = getDB();
  return db.prepare('SELECT * FROM youtube_creators ORDER BY subscribers DESC').all() as DBYouTubeCreator[];
}

export function getYouTubeCreatorsByCategory(category: string): DBYouTubeCreator[] {
  const db = getDB();
  return db.prepare('SELECT * FROM youtube_creators WHERE category = ? ORDER BY subscribers DESC').all(category) as DBYouTubeCreator[];
}

export function getYouTubeCreatorCategories(): Array<{ category: string; count: number }> {
  const db = getDB();
  return db.prepare('SELECT category, COUNT(*) as count FROM youtube_creators GROUP BY category ORDER BY count DESC').all() as Array<{ category: string; count: number }>;
}

// ─── Tags ────────────────────────────────────────────────────────

export interface DBTag {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export function getTags(): DBTag[] {
  const db = getDB();
  return db.prepare('SELECT * FROM tags ORDER BY category, name').all() as DBTag[];
}

export function getTagById(tagId: string): DBTag | null {
  const db = getDB();
  return (db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId) as DBTag | undefined) ?? null;
}

export function getAllTagIds(): string[] {
  const db = getDB();
  return (db.prepare('SELECT id FROM tags').all() as Array<{ id: string }>).map(r => r.id);
}

export function getTagsForItem(taggableId: string, taggableType: string): DBTag[] {
  const db = getDB();
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN taggables tg ON t.id = tg.tag_id
    WHERE tg.taggable_id = ? AND tg.taggable_type = ?
    ORDER BY t.name
  `).all(taggableId, taggableType) as DBTag[];
}

export function getItemsByTag(tagId: string, taggableType: string): string[] {
  const db = getDB();
  return (db.prepare(`
    SELECT taggable_id FROM taggables WHERE tag_id = ? AND taggable_type = ?
  `).all(tagId, taggableType) as Array<{ taggable_id: string }>).map(r => r.taggable_id);
}

export function getTagsWithCounts(): Array<DBTag & { count: number }> {
  const db = getDB();
  return db.prepare(`
    SELECT t.*, COUNT(tg.taggable_id) as count
    FROM tags t
    LEFT JOIN taggables tg ON t.id = tg.tag_id
    GROUP BY t.id
    ORDER BY count DESC, t.name
  `).all() as Array<DBTag & { count: number }>;
}

// ─── News ────────────────────────────────────────────────────────

export interface DBNews {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  image_url: string | null;
  published_at: string;
  category: string;
}

export function getNews(limit: number = 50): DBNews[] {
  const db = getDB();
  return db.prepare('SELECT * FROM news ORDER BY published_at DESC LIMIT ?').all(limit) as DBNews[];
}

export function getNewsByCategory(category: string, limit: number = 50): DBNews[] {
  const db = getDB();
  return db.prepare('SELECT * FROM news WHERE category = ? ORDER BY published_at DESC LIMIT ?').all(category, limit) as DBNews[];
}

export function getNewsCategories(): Array<{ category: string; count: number }> {
  const db = getDB();
  return db.prepare('SELECT category, COUNT(*) as count FROM news GROUP BY category ORDER BY count DESC').all() as Array<{ category: string; count: number }>;
}
