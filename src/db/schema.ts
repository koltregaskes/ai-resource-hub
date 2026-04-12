/**
 * Database schema definition and initialisation for The AI Resource Hub.
 *
 * Uses SQLite (via better-sqlite3) as a build-time database.
 * Scrapers write to the DB, Astro reads from it during static generation.
 */
import Database from 'better-sqlite3';
import { getAiResourceHubSqlitePath } from '../../scripts/sqlite-path';

const DB_PATH = getAiResourceHubSqlitePath();

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
      status_url TEXT,
      api_docs_url TEXT,
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
      ttft INTEGER NOT NULL DEFAULT 0,
      speed_source TEXT,
      speed_updated TEXT,
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

    -- YouTube creators covering AI topics
    CREATE TABLE IF NOT EXISTS youtube_creators (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      youtube_handle TEXT,
      subscribers INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'general',
      description TEXT,
      twitter TEXT,
      website TEXT,
      person_id TEXT REFERENCES people(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Tags for cross-cutting categorisation
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'topic',
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Many-to-many tag assignments (polymorphic)
    CREATE TABLE IF NOT EXISTS taggables (
      tag_id TEXT NOT NULL REFERENCES tags(id),
      taggable_id TEXT NOT NULL,
      taggable_type TEXT NOT NULL,
      PRIMARY KEY (tag_id, taggable_id, taggable_type)
    );

    -- News articles (populated by external aggregator)
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      summary TEXT,
      image_url TEXT,
      published_at TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Company boards used for AI jobs-market tracking
    CREATE TABLE IF NOT EXISTS job_companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider_id TEXT REFERENCES providers(id),
      careers_url TEXT NOT NULL,
      board_type TEXT NOT NULL,
      board_token TEXT NOT NULL,
      board_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Current AI-related job openings pulled from public ATS boards
    CREATE TABLE IF NOT EXISTS ai_jobs (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES job_companies(id),
      provider_id TEXT REFERENCES providers(id),
      title TEXT NOT NULL,
      team TEXT,
      location TEXT,
      location_group TEXT,
      workplace_type TEXT NOT NULL DEFAULT 'unknown',
      commitment TEXT,
      function_category TEXT NOT NULL DEFAULT 'other',
      url TEXT NOT NULL,
      posted_at TEXT,
      listed_at TEXT,
      source TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Daily rollups so the jobs page can chart movement over time
    CREATE TABLE IF NOT EXISTS ai_job_snapshots (
      snapshot_date TEXT NOT NULL,
      company_id TEXT NOT NULL REFERENCES job_companies(id),
      provider_id TEXT REFERENCES providers(id),
      open_role_count INTEGER NOT NULL DEFAULT 0,
      remote_role_count INTEGER NOT NULL DEFAULT 0,
      research_role_count INTEGER NOT NULL DEFAULT 0,
      engineering_role_count INTEGER NOT NULL DEFAULT 0,
      product_role_count INTEGER NOT NULL DEFAULT 0,
      gtm_role_count INTEGER NOT NULL DEFAULT 0,
      operations_role_count INTEGER NOT NULL DEFAULT 0,
      other_role_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (snapshot_date, company_id)
    );

    -- Speed history for tracking latency changes over time
    CREATE TABLE IF NOT EXISTS speed_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT NOT NULL REFERENCES models(id),
      speed INTEGER NOT NULL,
      ttft INTEGER NOT NULL DEFAULT 0,
      provider_endpoint TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT
    );

    -- Provider endpoints (same model available via different providers)
    CREATE TABLE IF NOT EXISTS provider_endpoints (
      id TEXT PRIMARY KEY,
      model_id TEXT NOT NULL REFERENCES models(id),
      provider_id TEXT NOT NULL REFERENCES providers(id),
      endpoint_name TEXT NOT NULL,
      speed INTEGER NOT NULL DEFAULT 0,
      ttft INTEGER NOT NULL DEFAULT 0,
      input_price REAL NOT NULL DEFAULT 0,
      output_price REAL NOT NULL DEFAULT 0,
      measured_at TEXT,
      source TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Stealth / rumoured model sightings
    CREATE TABLE IF NOT EXISTS rumoured_models (
      id TEXT PRIMARY KEY,
      codename TEXT NOT NULL,
      provider_id TEXT REFERENCES providers(id),
      status TEXT NOT NULL DEFAULT 'rumoured',  -- rumoured, confirmed, released, debunked
      first_seen TEXT NOT NULL,
      confirmed_as TEXT,                         -- model ID once confirmed (e.g., 'gpt-5.2')
      confirmed_name TEXT,                       -- human-readable name once known
      sources TEXT,                               -- JSON array of source URLs
      notes TEXT,
      category TEXT DEFAULT 'llm',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Subscription plans and message limits
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id),
      plan_name TEXT NOT NULL,
      price_monthly REAL,
      price_yearly_monthly REAL,
      tier_level INTEGER NOT NULL DEFAULT 0,
      source_url TEXT,
      notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plan_model_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
      model_id TEXT REFERENCES models(id),
      model_tier TEXT,
      messages_low INTEGER,
      messages_high INTEGER,
      message_period TEXT NOT NULL DEFAULT '5 hours',
      notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- AI CLI coding tools
    CREATE TABLE IF NOT EXISTS cli_tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider_id TEXT REFERENCES providers(id),
      maker TEXT NOT NULL,
      description TEXT,
      default_model TEXT,
      supported_models TEXT,
      context_window INTEGER NOT NULL DEFAULT 0,
      open_source INTEGER NOT NULL DEFAULT 0,
      license TEXT,
      github_url TEXT,
      website TEXT,
      install_command TEXT,
      pricing_type TEXT NOT NULL DEFAULT 'free',
      pricing_note TEXT,
      mcp_support INTEGER NOT NULL DEFAULT 0,
      multi_file INTEGER NOT NULL DEFAULT 0,
      git_integration INTEGER NOT NULL DEFAULT 0,
      platforms TEXT NOT NULL DEFAULT 'macOS, Linux',
      released TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_subscription_plans_provider ON subscription_plans(provider_id);
    CREATE INDEX IF NOT EXISTS idx_plan_model_limits_plan ON plan_model_limits(plan_id);
    CREATE INDEX IF NOT EXISTS idx_plan_model_limits_model ON plan_model_limits(model_id);
    CREATE INDEX IF NOT EXISTS idx_cli_tools_provider ON cli_tools(provider_id);
    CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider_id);
    CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
    CREATE INDEX IF NOT EXISTS idx_benchmark_scores_model ON benchmark_scores(model_id);
    CREATE INDEX IF NOT EXISTS idx_benchmark_scores_benchmark ON benchmark_scores(benchmark_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_model ON price_history(model_id);
    CREATE INDEX IF NOT EXISTS idx_people_provider ON people(provider_id);
    CREATE INDEX IF NOT EXISTS idx_youtube_creators_category ON youtube_creators(category);
    CREATE INDEX IF NOT EXISTS idx_taggables_tag ON taggables(tag_id);
    CREATE INDEX IF NOT EXISTS idx_taggables_target ON taggables(taggable_id, taggable_type);
    CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_job_companies_provider ON job_companies(provider_id);
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_company ON ai_jobs(company_id);
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_provider ON ai_jobs(provider_id);
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_active ON ai_jobs(active);
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_function ON ai_jobs(function_category);
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_workplace ON ai_jobs(workplace_type);
    CREATE INDEX IF NOT EXISTS idx_ai_job_snapshots_date ON ai_job_snapshots(snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_ai_job_snapshots_company ON ai_job_snapshots(company_id);
    CREATE INDEX IF NOT EXISTS idx_speed_history_model ON speed_history(model_id);
    CREATE INDEX IF NOT EXISTS idx_provider_endpoints_model ON provider_endpoints(model_id);
    CREATE INDEX IF NOT EXISTS idx_provider_endpoints_provider ON provider_endpoints(provider_id);
  `);

  ensureProviderColumns(db);
  ensureModelColumns(db);
}

function ensureProviderColumns(db: Database.Database): void {
  const columns = db.prepare('PRAGMA table_info(providers)').all() as Array<{ name: string }>;
  const existing = new Set(columns.map((column) => column.name));

  const missingColumns = [
    { name: 'status_url', sql: 'ALTER TABLE providers ADD COLUMN status_url TEXT' },
    { name: 'api_docs_url', sql: 'ALTER TABLE providers ADD COLUMN api_docs_url TEXT' },
  ];

  for (const column of missingColumns) {
    if (!existing.has(column.name)) {
      db.exec(column.sql);
    }
  }
}

function ensureModelColumns(db: Database.Database): void {
  const columns = db.prepare('PRAGMA table_info(models)').all() as Array<{ name: string }>;
  const existing = new Set(columns.map((column) => column.name));

  const missingColumns = [
    { name: 'ttft', sql: "ALTER TABLE models ADD COLUMN ttft INTEGER NOT NULL DEFAULT 0" },
    { name: 'speed_source', sql: 'ALTER TABLE models ADD COLUMN speed_source TEXT' },
    { name: 'speed_updated', sql: 'ALTER TABLE models ADD COLUMN speed_updated TEXT' },
  ];

  for (const column of missingColumns) {
    if (!existing.has(column.name)) {
      db.exec(column.sql);
    }
  }
}

export { DB_PATH };
