/**
 * Database schema definition and initialisation for The AI Resource Hub.
 *
 * Uses SQLite (via better-sqlite3) as a build-time database.
 * Scrapers write to the DB, Astro reads from it during static generation.
 */
import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');

let _db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    -- AI providers / labs
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      colour TEXT NOT NULL DEFAULT '#888888',
      website TEXT,
      description TEXT,
      founded TEXT,
      headquarters TEXT,
      ceo TEXT,
      funding TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- LLM models
    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider_id TEXT NOT NULL REFERENCES providers(id),
      input_price REAL NOT NULL DEFAULT 0,
      output_price REAL NOT NULL DEFAULT 0,
      context_window INTEGER NOT NULL DEFAULT 0,
      max_output INTEGER NOT NULL DEFAULT 0,
      speed INTEGER NOT NULL DEFAULT 0,
      quality_score REAL NOT NULL DEFAULT 0,
      released TEXT,
      open_source INTEGER NOT NULL DEFAULT 0,
      modality TEXT NOT NULL DEFAULT 'text',
      api_available INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      category TEXT NOT NULL DEFAULT 'llm',
      status TEXT NOT NULL DEFAULT 'active',
      pricing_source TEXT,
      pricing_updated TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Benchmark definitions
    CREATE TABLE IF NOT EXISTS benchmarks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      description TEXT,
      url TEXT,
      scale_min REAL NOT NULL DEFAULT 0,
      scale_max REAL NOT NULL DEFAULT 100,
      higher_is_better INTEGER NOT NULL DEFAULT 1,
      weight REAL NOT NULL DEFAULT 1.0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Benchmark scores per model
    CREATE TABLE IF NOT EXISTS benchmark_scores (
      model_id TEXT NOT NULL REFERENCES models(id),
      benchmark_id TEXT NOT NULL REFERENCES benchmarks(id),
      score REAL NOT NULL,
      source TEXT,
      source_url TEXT,
      measured_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (model_id, benchmark_id)
    );

    -- Key people in AI
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      organisation TEXT,
      provider_id TEXT REFERENCES providers(id),
      bio TEXT,
      twitter TEXT,
      website TEXT,
      notable_for TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Price history for tracking changes over time
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT NOT NULL REFERENCES models(id),
      input_price REAL NOT NULL,
      output_price REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT
    );

    -- Scraper run log
    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scraper TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'success',
      models_updated INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT
    );

    -- Glossary of AI terms
    CREATE TABLE IF NOT EXISTS glossary (
      id TEXT PRIMARY KEY,
      term TEXT NOT NULL,
      definition TEXT NOT NULL,
      plain_english TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      related_terms TEXT,
      see_also TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider_id);
    CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
    CREATE INDEX IF NOT EXISTS idx_benchmark_scores_model ON benchmark_scores(model_id);
    CREATE INDEX IF NOT EXISTS idx_benchmark_scores_benchmark ON benchmark_scores(benchmark_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_model ON price_history(model_id);
    CREATE INDEX IF NOT EXISTS idx_people_provider ON people(provider_id);
  `);
}

export { DB_PATH };
