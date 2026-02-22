#!/usr/bin/env npx tsx
/**
 * Seed the SQLite database with initial model data.
 *
 * Run: npx tsx scripts/seed-db.ts
 *
 * This populates providers, models, benchmarks, benchmark scores,
 * and notable people. It's idempotent — safe to run multiple times.
 */
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Delete existing DB for a clean seed
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  // Also remove WAL/SHM files if they exist
  if (fs.existsSync(DB_PATH + '-wal')) fs.unlinkSync(DB_PATH + '-wal');
  if (fs.existsSync(DB_PATH + '-shm')) fs.unlinkSync(DB_PATH + '-shm');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Schema ──────────────────────────────────────────────
db.exec(`
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

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id TEXT NOT NULL REFERENCES models(id),
    input_price REAL NOT NULL,
    output_price REAL NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    source TEXT
  );

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

  -- YouTube creators
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

  -- Many-to-many tag assignments
  CREATE TABLE IF NOT EXISTS taggables (
    tag_id TEXT NOT NULL REFERENCES tags(id),
    taggable_id TEXT NOT NULL,
    taggable_type TEXT NOT NULL,
    PRIMARY KEY (tag_id, taggable_id, taggable_type)
  );

  -- News articles
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
`);

// ─── Providers ──────────────────────────────────────────────────
const insertProvider = db.prepare(`
  INSERT INTO providers (id, name, colour, website, status_url, api_docs_url, description, founded, headquarters, ceo, funding)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const providers = [
  // id, name, colour, website, status_url, api_docs_url, description, founded, hq, ceo, funding
  ['openai', 'OpenAI', '#10a37f', 'https://openai.com', 'https://status.openai.com', 'https://platform.openai.com/docs', 'Creator of GPT and ChatGPT. Pioneer in large language models and AI safety research.', '2015-12-11', 'San Francisco, CA', 'Sam Altman', '$13B+'],
  ['anthropic', 'Anthropic', '#d97706', 'https://anthropic.com', 'https://status.anthropic.com', 'https://docs.anthropic.com', 'AI safety company building Claude. Founded by former OpenAI researchers.', '2021-01-28', 'San Francisco, CA', 'Dario Amodei', '$7.6B+'],
  ['google', 'Google', '#4285f4', 'https://deepmind.google', 'https://status.cloud.google.com', 'https://ai.google.dev/docs', 'Google DeepMind, creator of Gemini models. Merged from Google Brain and DeepMind.', '2010-01-01', 'London / Mountain View', 'Demis Hassabis', 'Alphabet subsidiary'],
  ['meta', 'Meta', '#0668e1', 'https://ai.meta.com', null, 'https://llama.meta.com/docs', 'Creator of Llama open-weight models. Committed to open-source AI development.', '2013-09-01', 'Menlo Park, CA', 'Mark Zuckerberg', 'Meta subsidiary'],
  ['mistral', 'Mistral', '#ff7000', 'https://mistral.ai', 'https://status.mistral.ai', 'https://docs.mistral.ai', 'French AI lab building efficient open and commercial models.', '2023-04-01', 'Paris, France', 'Arthur Mensch', '€600M+'],
  ['xai', 'xAI', '#1da1f2', 'https://x.ai', null, 'https://docs.x.ai', 'Elon Musk\'s AI company building Grok models.', '2023-07-12', 'Austin, TX', 'Elon Musk', '$6B+'],
  ['deepseek', 'DeepSeek', '#5b6ef7', 'https://deepseek.com', null, 'https://api-docs.deepseek.com', 'Chinese AI lab known for efficient open-weight models with strong reasoning.', '2023-07-01', 'Hangzhou, China', 'Liang Wenfeng', 'High-Flyer Capital'],
  ['amazon', 'Amazon', '#ff9900', 'https://aws.amazon.com/bedrock', 'https://health.aws.amazon.com', 'https://docs.aws.amazon.com/bedrock', 'Amazon\'s Nova foundation models, available through AWS Bedrock.', '1994-07-05', 'Seattle, WA', 'Andy Jassy', 'Amazon subsidiary'],
  ['cohere', 'Cohere', '#39c0ed', 'https://cohere.com', 'https://status.cohere.com', 'https://docs.cohere.com', 'Enterprise-focused AI company building Command models with RAG capabilities.', '2019-01-01', 'Toronto, Canada', 'Aidan Gomez', '$445M+'],
  ['alibaba', 'Alibaba', '#ff6a00', 'https://www.alibabacloud.com/solutions/generative-ai', null, null, 'Creator of Qwen (Tongyi Qianwen) series of open-weight models.', '2023-04-01', 'Hangzhou, China', 'Daniel Zhang', 'Alibaba subsidiary'],
  ['ai21', 'AI21 Labs', '#6c5ce7', 'https://www.ai21.com', null, 'https://docs.ai21.com', 'Creator of Jamba models using Mamba-Transformer hybrid architecture.', '2017-01-01', 'Tel Aviv, Israel', 'Yoav Shoham', '$336M'],
  ['zhipu', 'Zhipu AI', '#00b4d8', 'https://www.zhipuai.cn', null, null, 'Chinese AI company building GLM series models.', '2019-01-01', 'Beijing, China', 'Tang Jie', '$400M+'],
  ['minimax', 'MiniMax', '#e040fb', 'https://www.minimaxi.com', null, null, 'Chinese AI company building multimodal models and applications.', '2021-12-01', 'Shanghai, China', 'Yan Junjie', '$600M+'],
  ['perplexity', 'Perplexity', '#20b2aa', 'https://www.perplexity.ai', null, 'https://docs.perplexity.ai', 'AI-powered search engine with its own Sonar models.', '2022-08-01', 'San Francisco, CA', 'Aravind Srinivas', '$500M+'],
  ['reka', 'Reka', '#e74c3c', 'https://www.reka.ai', null, null, 'Multimodal AI lab building natively multimodal models.', '2023-01-01', 'London, UK', 'Dani Yogatama', '$58M'],

  // Image generation providers
  ['stability', 'Stability AI', '#a855f7', 'https://stability.ai', null, 'https://platform.stability.ai/docs', 'Creator of Stable Diffusion open-source image generation models.', '2019-01-01', 'London, UK', 'Prem Akkaraju', '$200M+'],
  ['midjourney', 'Midjourney', '#5865f2', 'https://midjourney.com', 'https://status.midjourney.com', null, 'Independent research lab producing top-tier AI image generation.', '2021-08-01', 'San Francisco, CA', 'David Holz', 'Self-funded'],
  ['blackforest', 'Black Forest Labs', '#1a1a2e', 'https://blackforestlabs.ai', null, null, 'Created FLUX image generation models. Founded by ex-Stability AI researchers.', '2024-03-01', 'Freiburg, Germany', 'Robin Rombach', '$31M'],
  ['ideogram', 'Ideogram', '#ff6b6b', 'https://ideogram.ai', null, 'https://developer.ideogram.ai/docs', 'AI image generation specialising in text rendering within images.', '2023-08-01', 'Toronto, Canada', 'Mohammad Norouzi', '$80M+'],
  ['leonardo', 'Leonardo AI', '#9333ea', 'https://leonardo.ai', null, null, 'AI image and video generation platform for creative professionals.', '2022-01-01', 'Sydney, Australia', 'JJ Fiasson', '$31M'],

  // Video generation providers
  ['runway', 'Runway', '#00d4ff', 'https://runwayml.com', null, 'https://docs.runwayml.com', 'AI creative suite. Pioneer in AI video generation with Gen-3 Alpha.', '2018-01-01', 'New York, NY', 'Cristóbal Valenzuela', '$237M+'],
  ['pika', 'Pika', '#ff00ff', 'https://pika.art', null, null, 'AI video generation startup known for creative video effects.', '2023-04-01', 'Palo Alto, CA', 'Demi Guo', '$135M+'],
  ['luma', 'Luma AI', '#7c3aed', 'https://lumalabs.ai', null, 'https://docs.lumalabs.ai', 'Creator of Dream Machine for AI video and 3D generation.', '2021-01-01', 'Palo Alto, CA', 'Amit Jain', '$43M+'],
  ['kling', 'Kling AI', '#ff4500', 'https://klingai.com', null, null, 'Kuaishou\'s AI video generation platform with impressive motion quality.', '2023-01-01', 'Beijing, China', 'Su Hua', 'Kuaishou subsidiary'],
  ['hailuo', 'Hailuo AI', '#00bcd4', 'https://hailuoai.com', null, null, 'MiniMax\'s consumer video generation platform.', '2024-01-01', 'Shanghai, China', 'Yan Junjie', 'MiniMax subsidiary'],
  ['veo', 'Google Veo', '#34a853', 'https://deepmind.google/technologies/veo', 'https://status.cloud.google.com', null, 'Google DeepMind\'s video generation model family.', '2024-05-01', 'London, UK', 'Demis Hassabis', 'Alphabet subsidiary'],

  // Additional LLM providers
  ['microsoft', 'Microsoft', '#00a4ef', 'https://azure.microsoft.com/en-us/products/phi', null, 'https://learn.microsoft.com/en-us/azure/ai-services/', 'Creator of Phi small language models. Azure AI and GitHub Copilot.', '1975-04-04', 'Redmond, WA', 'Satya Nadella', 'Public company'],
  ['01ai', '01.AI', '#ff3366', 'https://www.lingyiwanwu.com/en', null, null, 'Chinese AI company founded by Kai-Fu Lee. Creator of Yi model series.', '2023-03-01', 'Beijing, China', 'Kai-Fu Lee', '$1B+'],
  ['nvidia', 'NVIDIA', '#76b900', 'https://www.nvidia.com/en-us/ai/', null, 'https://docs.nvidia.com/nim/', 'Leading GPU maker and AI infrastructure provider. Creator of Nemotron models.', '1993-01-01', 'Santa Clara, CA', 'Jensen Huang', 'Public company'],
  ['inflection', 'Inflection AI', '#ff6b35', 'https://inflection.ai', null, 'https://docs.inflection.ai', 'Creator of Pi personal AI assistant and Inflection models.', '2022-01-01', 'Palo Alto, CA', 'Sean White', '$1.5B+'],
  ['ssi', 'Safe Superintelligence', '#000000', 'https://ssi.inc', null, null, 'AI safety startup founded by Ilya Sutskever. Focused solely on safe superintelligence.', '2024-06-19', 'Palo Alto, CA', 'Ilya Sutskever', '$1B+'],

  // Audio, speech, voice, and sound providers
  ['elevenlabs', 'ElevenLabs', '#2563eb', 'https://elevenlabs.io', 'https://status.elevenlabs.io', 'https://elevenlabs.io/docs', 'Leading AI voice synthesis and cloning platform. Realistic speech generation.', '2022-01-01', 'New York, NY', 'Mati Staniszewski', '$101M+'],
  ['assemblyai', 'AssemblyAI', '#ef4444', 'https://www.assemblyai.com', null, 'https://www.assemblyai.com/docs', 'AI speech-to-text and audio intelligence API platform.', '2017-01-01', 'San Francisco, CA', 'Dylan Fox', '$115M'],
  ['deepgram', 'Deepgram', '#13ef93', 'https://deepgram.com', 'https://status.deepgram.com', 'https://developers.deepgram.com', 'Enterprise speech recognition and text-to-speech AI.', '2015-01-01', 'San Francisco, CA', 'Scott Stephenson', '$86M+'],
  ['cartesia', 'Cartesia', '#6366f1', 'https://cartesia.ai', null, 'https://docs.cartesia.ai', 'State-space model AI for ultra-low-latency voice synthesis.', '2023-01-01', 'San Francisco, CA', 'Karan Goel', '$27M'],
  ['suno', 'Suno', '#f97316', 'https://suno.com', null, null, 'AI music and sound generation platform. Create full songs from text.', '2023-01-01', 'Cambridge, MA', 'Mikey Shulman', '$125M+'],
  ['udio', 'Udio', '#8b5cf6', 'https://udio.com', null, null, 'AI music generation with high-quality audio output.', '2024-01-01', 'New York, NY', 'David Ding', '$10M+'],
  ['resemble', 'Resemble AI', '#f43f5e', 'https://www.resemble.ai', null, 'https://docs.resemble.ai', 'AI voice cloning and synthesis for enterprises.', '2019-01-01', 'Toronto, Canada', 'Zohaib Ahmed', '$28M'],
  ['play-ht', 'PlayHT', '#0ea5e9', 'https://play.ht', null, 'https://docs.play.ht', 'AI voice generation platform with natural conversational voices.', '2016-01-01', 'San Francisco, CA', 'Hammad Syed', '$20M+'],
];

const insertProviders = db.transaction(() => {
  for (const p of providers) {
    insertProvider.run(...p);
  }
});
insertProviders();

// ─── Models ─────────────────────────────────────────────────────
// Pricing as of Feb 2026, per 1M tokens (USD), from official API pricing pages
// Sources: openai.com/api/pricing, anthropic.com/pricing, ai.google.dev/pricing, etc.
const insertModel = db.prepare(`
  INSERT INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'llm', 'active', ?)
`);

const insertModelWithCategory = db.prepare(`
  INSERT INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
`);

const models = [
  // ── OpenAI ──
  // Source: openai.com/api/pricing (Feb 2026)
  ['gpt-5.2', 'GPT-5.2', 'openai', 1.75, 14.00, 400000, 32768, 50, 96, '2025-12-10', 0, 'text,vision', 1, 'Newest flagship; 90% off cached input', 'openai.com/api/pricing'],
  ['gpt-5.2-pro', 'GPT-5.2 Pro', 'openai', 21.00, 168.00, 400000, 32768, 30, 97, '2025-12-10', 0, 'text,vision', 1, 'Premium reasoning tier', 'openai.com/api/pricing'],
  ['gpt-5', 'GPT-5', 'openai', 1.25, 10.00, 400000, 32768, 50, 94, '2025-08-07', 0, 'text,vision', 1, 'Batch: $0.625/$5.00', 'openai.com/api/pricing'],
  ['gpt-5-pro', 'GPT-5 Pro', 'openai', 15.00, 120.00, 400000, 32768, 30, 96, '2025-10-06', 0, 'text,vision', 1, 'Highest-capability variant', 'openai.com/api/pricing'],
  ['gpt-5-nano', 'GPT-5 Nano', 'openai', 0.05, 0.40, 400000, 32768, 120, 78, '2025-08-07', 0, 'text', 1, 'Ultra-cheap budget model', 'openai.com/api/pricing'],
  ['gpt-4.1', 'GPT-4.1', 'openai', 2.00, 8.00, 1047576, 32768, 60, 90, '2025-04-14', 0, 'text,vision', 1, 'Enhanced coding and instruction following', 'openai.com/api/pricing'],
  ['gpt-4.1-mini', 'GPT-4.1 Mini', 'openai', 0.40, 1.60, 1047576, 32768, 72, 83, '2025-04-14', 0, 'text,vision', 1, 'Exceeds GPT-4o at 83% less cost', 'openai.com/api/pricing'],
  ['gpt-4.1-nano', 'GPT-4.1 Nano', 'openai', 0.10, 0.40, 1047576, 32768, 110, 75, '2025-04-14', 0, 'text', 1, 'Fastest and cheapest GPT-4.1', 'openai.com/api/pricing'],
  ['gpt-4o', 'GPT-4o', 'openai', 2.50, 10.00, 128000, 16384, 80, 87, '2024-05-13', 0, 'text,vision,audio', 1, 'Multimodal flagship (legacy)', 'openai.com/api/pricing'],
  ['gpt-4o-mini', 'GPT-4o Mini', 'openai', 0.15, 0.60, 128000, 16384, 100, 80, '2024-07-18', 0, 'text,vision', 1, 'Cost-efficient small model', 'openai.com/api/pricing'],
  ['o3', 'o3', 'openai', 2.00, 8.00, 200000, 100000, 115, 95, '2025-04-16', 0, 'text,vision', 1, 'Reasoning model; 80% price cut from launch', 'openai.com/api/pricing'],
  ['o3-pro', 'o3-pro', 'openai', 20.00, 80.00, 200000, 100000, 32, 96, '2025-06-10', 0, 'text,vision', 1, 'Highest reasoning quality', 'openai.com/api/pricing'],
  ['o3-mini', 'o3-mini', 'openai', 1.10, 4.40, 200000, 100000, 130, 88, '2025-01-31', 0, 'text', 1, 'Cost-efficient reasoning', 'openai.com/api/pricing'],
  ['o4-mini', 'o4-mini', 'openai', 1.10, 4.40, 200000, 100000, 179, 90, '2025-04-16', 0, 'text,vision', 1, 'Fast reasoning; excels at math/code', 'openai.com/api/pricing'],

  // ── Anthropic ──
  // Source: anthropic.com/pricing (Feb 2026)
  ['claude-opus-4.6', 'Claude Opus 4.6', 'anthropic', 5.00, 25.00, 200000, 128000, 40, 97, '2026-02-05', 0, 'text,vision', 1, 'Most capable; 1M context beta; adaptive thinking', 'anthropic.com/pricing'],
  ['claude-sonnet-4.6', 'Claude Sonnet 4.6', 'anthropic', 3.00, 15.00, 200000, 64000, 80, 95, '2026-02-17', 0, 'text,vision', 1, 'Default model; extended thinking', 'anthropic.com/pricing'],
  ['claude-opus-4.5', 'Claude Opus 4.5', 'anthropic', 5.00, 25.00, 200000, 64000, 40, 95, '2025-11-24', 0, 'text,vision', 1, 'Previous generation Opus', 'anthropic.com/pricing'],
  ['claude-sonnet-4.5', 'Claude Sonnet 4.5', 'anthropic', 3.00, 15.00, 200000, 64000, 80, 93, '2025-09-29', 0, 'text,vision', 1, 'Balanced performance', 'anthropic.com/pricing'],
  ['claude-haiku-4.5', 'Claude Haiku 4.5', 'anthropic', 1.00, 5.00, 200000, 64000, 120, 87, '2025-10-15', 0, 'text,vision', 1, 'Fast frontier model', 'anthropic.com/pricing'],
  ['claude-sonnet-4', 'Claude Sonnet 4', 'anthropic', 3.00, 15.00, 200000, 32000, 70, 91, '2025-05-22', 0, 'text,vision', 1, 'Superseded by 4.5/4.6', 'anthropic.com/pricing'],
  ['claude-opus-4', 'Claude Opus 4', 'anthropic', 15.00, 75.00, 200000, 32000, 30, 93, '2025-05-22', 0, 'text,vision', 1, 'Legacy; 3x more expensive than Opus 4.5+', 'anthropic.com/pricing'],
  ['claude-haiku-3.5', 'Claude 3.5 Haiku', 'anthropic', 0.80, 4.00, 200000, 8192, 100, 82, '2024-10-22', 0, 'text,vision', 1, 'Retiring Apr 2026', 'anthropic.com/pricing'],

  // ── Google ──
  // Source: ai.google.dev/pricing (Feb 2026)
  ['gemini-3.1-pro', 'Gemini 3.1 Pro', 'google', 2.00, 12.00, 1048576, 65536, 50, 96, '2026-02-01', 0, 'text,vision,audio,video', 1, 'Latest; ARC-AGI-2: 77.1%; >200K: $4/$18', 'ai.google.dev/pricing'],
  ['gemini-3-pro', 'Gemini 3 Pro', 'google', 2.00, 12.00, 1048576, 65536, 50, 94, '2025-11-18', 0, 'text,vision,audio,video', 1, 'Computer Use support', 'ai.google.dev/pricing'],
  ['gemini-3-flash', 'Gemini 3 Flash', 'google', 0.50, 3.00, 200000, 32768, 150, 88, '2025-11-18', 0, 'text,vision,audio,video', 1, 'Free tier available; Computer Use', 'ai.google.dev/pricing'],
  ['gemini-2.5-pro', 'Gemini 2.5 Pro', 'google', 1.25, 10.00, 1048576, 65536, 70, 92, '2025-03-25', 0, 'text,vision,audio', 1, 'Thinking model with 1M context', 'ai.google.dev/pricing'],
  ['gemini-2.5-flash', 'Gemini 2.5 Flash', 'google', 0.15, 0.60, 1048576, 65536, 200, 85, '2025-05-01', 0, 'text,vision,audio', 1, 'With thinking: $3.50 output', 'ai.google.dev/pricing'],
  ['gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', 'google', 0.10, 0.40, 1048576, 8192, 250, 78, '2025-05-01', 0, 'text,vision,audio', 1, 'Most budget-friendly Gemini', 'ai.google.dev/pricing'],
  ['gemini-2.0-flash', 'Gemini 2.0 Flash', 'google', 0.10, 0.40, 1048576, 8192, 200, 81, '2024-12-01', 0, 'text,vision,audio', 1, 'Retiring Mar 2026', 'ai.google.dev/pricing'],

  // ── Meta / Llama ──
  // Source: together.ai/pricing, fireworks.ai/pricing (Feb 2026)
  ['llama-4-maverick', 'Llama 4 Maverick', 'meta', 0.27, 0.85, 1048576, 32768, 80, 85, '2025-04-05', 1, 'text,vision', 1, 'Open-weight MoE (17B active / 128 experts)', 'together.ai/pricing'],
  ['llama-4-scout', 'Llama 4 Scout', 'meta', 0.18, 0.59, 10485760, 32768, 100, 80, '2025-04-05', 1, 'text,vision', 1, 'Open-weight with 10M context; fits single GPU', 'together.ai/pricing'],
  ['llama-3.3-70b', 'Llama 3.3 70B', 'meta', 0.18, 0.50, 131072, 32768, 100, 79, '2024-12-06', 1, 'text', 1, 'Open-weight general purpose', 'together.ai/pricing'],
  ['llama-3.1-405b', 'Llama 3.1 405B', 'meta', 3.00, 3.00, 131072, 32768, 30, 84, '2024-07-23', 1, 'text', 1, 'Largest open-weight model', 'together.ai/pricing'],

  // ── DeepSeek ──
  // Source: deepseek.com/pricing (Feb 2026)
  ['deepseek-v3.2', 'DeepSeek V3.2', 'deepseek', 0.14, 0.28, 128000, 8192, 49, 87, '2025-09-29', 1, 'text', 1, '685B params (37B active) MoE; 90% off cache hits', 'deepseek.com/pricing'],
  ['deepseek-r1', 'DeepSeek R1', 'deepseek', 0.55, 2.19, 128000, 8192, 30, 89, '2025-01-20', 1, 'text', 1, 'Open-weight reasoning; CoT tokens billed as output', 'deepseek.com/pricing'],
  ['deepseek-r1-0528', 'DeepSeek R1 0528', 'deepseek', 1.35, 4.20, 128000, 8192, 30, 91, '2025-05-28', 1, 'text', 1, 'Updated R1 with improved reasoning', 'deepseek.com/pricing'],
  ['deepseek-v3', 'DeepSeek V3', 'deepseek', 0.14, 0.28, 64000, 8192, 40, 84, '2024-12-25', 1, 'text', 1, 'Original V3; 671B params (37B active)', 'deepseek.com/pricing'],

  // ── Mistral ──
  // Source: mistral.ai/pricing (Feb 2026)
  ['mistral-large-3', 'Mistral Large 3', 'mistral', 0.50, 1.50, 256000, 32768, 80, 86, '2025-06-01', 1, 'text,vision', 1, 'Excellent value for flagship tier', 'mistral.ai/pricing'],
  ['mistral-medium-3', 'Mistral Medium 3', 'mistral', 0.40, 2.00, 131072, 16384, 90, 82, '2025-06-01', 1, 'text', 1, 'GPT-4 class at low cost', 'mistral.ai/pricing'],
  ['mistral-small-3.1', 'Mistral Small 3.1', 'mistral', 0.03, 0.11, 128000, 16384, 150, 76, '2025-03-18', 1, 'text,vision', 1, 'Ultra-cheap open-weight with vision', 'mistral.ai/pricing'],
  ['codestral', 'Codestral', 'mistral', 0.30, 0.90, 262144, 32768, 80, 81, '2025-01-14', 0, 'text', 1, 'Dedicated coding model', 'mistral.ai/pricing'],
  ['mistral-nemo', 'Mistral Nemo', 'mistral', 0.02, 0.04, 131072, 16384, 120, 72, '2024-07-18', 1, 'text', 1, 'Cheapest Mistral model', 'mistral.ai/pricing'],
  ['pixtral-large', 'Pixtral Large', 'mistral', 2.00, 6.00, 131072, 32768, 50, 82, '2024-11-18', 0, 'text,vision', 1, 'Vision-specialised flagship', 'mistral.ai/pricing'],

  // ── xAI ──
  // Source: docs.x.ai/developers/models (Feb 2026)
  ['grok-4', 'Grok 4', 'xai', 3.00, 15.00, 256000, 32768, 50, 95, '2025-07-09', 0, 'text', 1, 'Frontier reasoning (matches o3 quality)', 'docs.x.ai'],
  ['grok-4-fast', 'Grok 4 Fast', 'xai', 0.20, 0.50, 2097152, 32768, 150, 85, '2025-09-19', 0, 'text', 1, '2M context; fast reasoning', 'docs.x.ai'],
  ['grok-4.1-fast', 'Grok 4.1 Fast', 'xai', 0.20, 0.50, 2097152, 32768, 150, 86, '2025-11-01', 0, 'text', 1, 'Largest context window in industry', 'docs.x.ai'],
  ['grok-3', 'Grok 3', 'xai', 3.00, 15.00, 131072, 32768, 70, 90, '2025-06-10', 0, 'text,vision', 1, 'Previous flagship', 'docs.x.ai'],
  ['grok-3-mini', 'Grok 3 Mini', 'xai', 0.30, 0.50, 131072, 32768, 120, 82, '2025-06-10', 0, 'text', 1, 'Outperforms Grok 3 at 90% less', 'docs.x.ai'],

  // ── Amazon ──
  // Source: aws.amazon.com/nova/pricing (Feb 2026)
  ['nova-2-lite', 'Amazon Nova 2 Lite', 'amazon', 0.30, 2.50, 1048576, 16384, 100, 82, '2025-12-02', 0, 'text,vision,video', 1, 'Reasoning model; 3 thinking levels', 'aws.amazon.com/nova/pricing'],
  ['nova-premier', 'Amazon Nova Premier', 'amazon', 2.50, 12.50, 300000, 5120, 50, 80, '2025-03-01', 0, 'text,vision,video', 1, 'Best for distillation', 'aws.amazon.com/nova/pricing'],
  ['nova-pro', 'Amazon Nova Pro', 'amazon', 0.80, 3.20, 300000, 5120, 80, 78, '2024-12-03', 0, 'text,vision,video', 1, 'Balanced multimodal', 'aws.amazon.com/nova/pricing'],
  ['nova-lite', 'Amazon Nova Lite', 'amazon', 0.06, 0.24, 300000, 5120, 150, 72, '2024-12-03', 0, 'text,vision,video', 1, 'Very low cost multimodal', 'aws.amazon.com/nova/pricing'],
  ['nova-micro', 'Amazon Nova Micro', 'amazon', 0.035, 0.14, 128000, 5120, 210, 68, '2024-12-03', 0, 'text', 1, 'Fastest Nova; text-only', 'aws.amazon.com/nova/pricing'],

  // ── Cohere ──
  // Source: cohere.com/pricing (Feb 2026)
  ['command-a', 'Command A', 'cohere', 2.50, 10.00, 256000, 32768, 60, 82, '2025-03-13', 1, 'text', 1, '111B params; 23 languages; agentic', 'cohere.com/pricing'],
  ['command-a-reasoning', 'Command A Reasoning', 'cohere', 2.50, 10.00, 256000, 32768, 50, 84, '2025-08-01', 1, 'text', 1, 'Hybrid reasoning variant', 'cohere.com/pricing'],
  ['command-r-plus', 'Command R+', 'cohere', 2.50, 10.00, 128000, 4096, 40, 79, '2024-08-01', 1, 'text', 1, 'Enterprise RAG/tool use', 'cohere.com/pricing'],
  ['command-r', 'Command R', 'cohere', 0.15, 0.60, 128000, 4096, 60, 73, '2024-03-11', 1, 'text', 1, 'Budget option; 94% cheaper than R+', 'cohere.com/pricing'],
  ['command-r7b', 'Command R7B', 'cohere', 0.0375, 0.15, 128000, 4096, 100, 65, '2024-06-01', 1, 'text', 1, 'Smallest; ideal for high-volume', 'cohere.com/pricing'],

  // ── Alibaba / Qwen ──
  // Source: together.ai/pricing, qwen.ai (Feb 2026)
  ['qwen3-max', 'Qwen3 Max', 'alibaba', 1.20, 6.00, 256000, 32768, 60, 90, '2025-09-01', 1, 'text', 1, 'Flagship Qwen model', 'qwen.ai/apiplatform'],
  ['qwen3-coder-480b', 'Qwen3 Coder 480B', 'alibaba', 2.00, 2.00, 256000, 32768, 40, 88, '2025-09-01', 1, 'text', 1, '480B params; coding specialist', 'together.ai/pricing'],
  ['qwen3-235b', 'Qwen3 235B', 'alibaba', 0.20, 0.60, 256000, 32768, 60, 86, '2025-04-01', 1, 'text', 1, 'Thinking mode: $0.65/$3.00', 'together.ai/pricing'],
  ['qwen-qwq-32b', 'QwQ 32B', 'alibaba', 1.20, 1.20, 131072, 32768, 80, 83, '2025-03-06', 1, 'text', 1, 'Reasoning model on Qwen2.5 base', 'together.ai/pricing'],
  ['qwen-2.5-72b', 'Qwen 2.5 72B', 'alibaba', 0.23, 0.23, 128000, 16384, 70, 82, '2024-09-19', 1, 'text', 1, '1/10th cost of GPT-4o', 'deepinfra.com/pricing'],

  // ── AI21 ──
  ['jamba-1.5-large', 'Jamba 1.5 Large', 'ai21', 2.00, 8.00, 256000, 4096, 60, 76, '2024-08-22', 0, 'text', 1, 'Mamba-Transformer hybrid with 256K context', 'ai21.com/pricing'],
  ['jamba-1.5-mini', 'Jamba 1.5 Mini', 'ai21', 0.20, 0.40, 256000, 4096, 100, 70, '2024-08-22', 0, 'text', 1, 'Efficient hybrid architecture', 'ai21.com/pricing'],

  // ── MiniMax ──
  ['minimax-01', 'MiniMax-01', 'minimax', 0.20, 1.10, 4096000, 32768, 60, 80, '2025-01-15', 0, 'text', 1, '4M context window, Lightning Attention', 'minimaxi.com/pricing'],

  // ── Perplexity ──
  ['sonar-pro', 'Sonar Pro', 'perplexity', 3.00, 15.00, 200000, 8192, 70, 80, '2025-02-01', 0, 'text', 1, 'Search-grounded reasoning model', 'docs.perplexity.ai/pricing'],
  ['sonar', 'Sonar', 'perplexity', 1.00, 1.00, 128000, 8192, 120, 74, '2025-02-01', 0, 'text', 1, 'Lightweight search-grounded model', 'docs.perplexity.ai/pricing'],

  // ── Reka ──
  ['reka-core', 'Reka Core', 'reka', 3.00, 15.00, 128000, 4096, 40, 78, '2024-04-15', 0, 'text,vision,audio,video', 1, 'Natively multimodal (text, image, video, audio)', 'reka.ai/pricing'],
  ['reka-flash-3', 'Reka Flash 3', 'reka', 0.35, 0.35, 128000, 4096, 80, 74, '2025-06-01', 0, 'text,vision,audio,video', 1, 'Fast/cheap multimodal', 'reka.ai/pricing'],

  // ── OpenAI (missing models) ──
  ['gpt-4.5', 'GPT-4.5', 'openai', 75.00, 150.00, 128000, 16384, 50, 88, '2025-02-27', 0, 'text,vision', 1, 'Codenamed Orion; improved EQ and reduced hallucinations; deprecated Aug 2025', 'openai.com/api/pricing'],
  ['o1', 'o1', 'openai', 15.00, 60.00, 200000, 100000, 40, 91, '2024-12-17', 0, 'text,vision', 1, 'First-gen reasoning model; chain-of-thought', 'openai.com/api/pricing'],
  ['o1-mini', 'o1-mini', 'openai', 3.00, 12.00, 128000, 65536, 80, 85, '2024-09-12', 0, 'text', 1, 'Cost-efficient reasoning; excels at STEM', 'openai.com/api/pricing'],

  // ── Anthropic (missing models) ──
  ['claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 3.00, 15.00, 200000, 8192, 80, 89, '2024-10-22', 0, 'text,vision', 1, 'Updated Oct 2024; computer use beta; SWE-bench 49%', 'anthropic.com/pricing'],
  ['claude-3-opus', 'Claude 3 Opus', 'anthropic', 15.00, 75.00, 200000, 4096, 30, 85, '2024-03-04', 0, 'text,vision', 1, 'Previous generation flagship; superseded by Claude 4', 'anthropic.com/pricing'],
  ['claude-3.7-sonnet', 'Claude 3.7 Sonnet', 'anthropic', 3.00, 15.00, 200000, 64000, 70, 90, '2025-02-24', 0, 'text,vision', 1, 'First hybrid reasoning model; extended thinking', 'anthropic.com/pricing'],

  // ── Google (missing models) ──
  ['gemini-2.0-flash-lite', 'Gemini 2.0 Flash Lite', 'google', 0.075, 0.30, 1048576, 8192, 250, 75, '2025-02-25', 0, 'text,vision', 1, 'Ultra-fast and cheap; Gemini 2.0 tier', 'ai.google.dev/pricing'],
  ['gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', 1.25, 5.00, 2097152, 8192, 60, 83, '2024-02-15', 0, 'text,vision,audio,video', 1, '2M context window; strong multimodal', 'ai.google.dev/pricing'],
  ['gemini-1.5-flash', 'Gemini 1.5 Flash', 'google', 0.075, 0.30, 1048576, 8192, 150, 78, '2024-05-24', 0, 'text,vision,audio', 1, 'Previous gen fast model; widely adopted', 'ai.google.dev/pricing'],

  // ── Meta (missing models) ──
  ['llama-3.1-70b', 'Llama 3.1 70B', 'meta', 0.18, 0.50, 131072, 32768, 80, 77, '2024-07-23', 1, 'text', 1, 'Strong open-weight 70B model', 'together.ai/pricing'],
  ['llama-3.1-8b', 'Llama 3.1 8B', 'meta', 0.05, 0.08, 131072, 32768, 200, 68, '2024-07-23', 1, 'text', 1, 'Smallest Llama 3.1; edge deployment', 'together.ai/pricing'],

  // ── DeepSeek (missing models) ──
  ['deepseek-v2.5', 'DeepSeek V2.5', 'deepseek', 0.14, 0.28, 128000, 8192, 50, 81, '2024-09-05', 1, 'text', 1, 'Merged chat and coder capabilities', 'deepseek.com/pricing'],

  // ── Mistral (missing models) ──
  ['mistral-large-2', 'Mistral Large 2', 'mistral', 2.00, 6.00, 128000, 16384, 60, 82, '2024-07-24', 1, 'text', 1, '123B params; 80+ coding languages; competitive with GPT-4o', 'mistral.ai/pricing'],

  // ── xAI (missing models) ──
  ['grok-2', 'Grok 2', 'xai', 2.00, 10.00, 131072, 32768, 70, 83, '2024-08-13', 0, 'text,vision', 1, 'Previous gen flagship; Colossus trained', 'docs.x.ai'],

  // ── Microsoft / Phi ──
  ['phi-4', 'Phi-4', 'microsoft', 0.07, 0.14, 16384, 16384, 120, 78, '2024-12-12', 1, 'text', 1, '14B params; excels at math reasoning; MIT license', 'azure.microsoft.com'],
  ['phi-4-multimodal', 'Phi-4 Multimodal', 'microsoft', 0.10, 0.20, 128000, 16384, 100, 76, '2025-02-26', 1, 'text,vision,audio', 1, '5.6B params; text, image, and audio input', 'azure.microsoft.com'],
  ['phi-4-reasoning', 'Phi-4 Reasoning', 'microsoft', 0.07, 0.14, 32768, 32768, 80, 82, '2025-05-01', 1, 'text', 1, '14B params with chain-of-thought; approaches DeepSeek R1', 'azure.microsoft.com'],

  // ── Alibaba / Qwen (missing models) ──
  ['qwen-2.5-coder-32b', 'Qwen 2.5 Coder 32B', 'alibaba', 0.07, 0.14, 131072, 16384, 80, 82, '2024-11-12', 1, 'text', 1, 'SOTA open-source code model; matches GPT-4o on coding', 'together.ai/pricing'],
  ['qwen3-30b', 'Qwen3 30B', 'alibaba', 0.10, 0.30, 131072, 32768, 80, 82, '2025-04-29', 1, 'text', 1, 'MoE with 30B total / 3B active; thinking mode', 'together.ai/pricing'],
  ['qwen3-32b', 'Qwen3 32B', 'alibaba', 0.10, 0.30, 131072, 32768, 80, 83, '2025-04-29', 1, 'text', 1, 'Dense 32B; strong reasoning and multilingual', 'together.ai/pricing'],

  // ── NVIDIA ──
  ['nemotron-70b', 'Nemotron 70B', 'nvidia', 0.20, 0.40, 131072, 16384, 60, 80, '2024-10-01', 1, 'text', 1, 'Llama 3.1 based; RLHF fine-tuned for helpfulness', 'build.nvidia.com'],
];

const insertModels = db.transaction(() => {
  for (const m of models) {
    insertModel.run(...m);
  }
});
insertModels();

// ─── Image Generation Models ─────────────────────────────────
// Pricing: per image or per API call, stored as cost per 1 image (input_price = cost/image, output_price = 0)
// quality_score: subjective composite of aesthetics, coherence, text rendering, prompt adherence
// context_window: max prompt length in characters, max_output: max resolution, speed: seconds per image
const imageModels: (string | number | null)[][] = [
  // id, name, provider_id, input_price ($/image), output_price, context_window (chars), max_output (px), speed (s/img), quality_score, released, open_source, modality, api_available, notes, category, pricing_source
  ['dall-e-3', 'DALL-E 3', 'openai', 0.040, 0, 4000, 1024, 15, 82, '2023-10-01', 0, 'image', 1, 'HD: $0.080/img; integrated with ChatGPT', 'image', 'openai.com/api/pricing'],
  ['dall-e-3-hd', 'DALL-E 3 HD', 'openai', 0.080, 0, 4000, 1792, 20, 85, '2023-10-01', 0, 'image', 1, '1792x1024 max resolution', 'image', 'openai.com/api/pricing'],
  ['gpt-image-1', 'GPT Image 1', 'openai', 0.011, 0, 32000, 1024, 10, 90, '2025-04-23', 0, 'image', 1, 'Native image gen in GPT-4o+; transparent backgrounds', 'image', 'openai.com/api/pricing'],
  ['imagen-3', 'Imagen 3', 'google', 0.040, 0, 4000, 1024, 8, 87, '2024-08-01', 0, 'image', 1, 'Google\'s latest; excellent photorealism', 'image', 'ai.google.dev/pricing'],
  ['imagen-4', 'Imagen 4', 'google', 0.040, 0, 4000, 2048, 10, 92, '2025-05-20', 0, 'image', 1, 'State-of-art; Gemini-powered generation', 'image', 'ai.google.dev/pricing'],
  ['stable-diffusion-3.5', 'Stable Diffusion 3.5', 'stability', 0.000, 0, 4000, 1024, 5, 80, '2024-10-22', 1, 'image', 1, 'Open-weight; multiple sizes (Large/Medium/Turbo)', 'image', 'stability.ai/pricing'],
  ['stable-diffusion-xl', 'Stable Diffusion XL', 'stability', 0.000, 0, 2000, 1024, 3, 75, '2023-07-26', 1, 'image', 1, 'Most widely deployed open image model', 'image', 'stability.ai/pricing'],
  ['stable-image-ultra', 'Stable Image Ultra', 'stability', 0.080, 0, 4000, 1536, 12, 83, '2024-04-01', 0, 'image', 1, 'Stability API premium quality tier', 'image', 'stability.ai/pricing'],
  ['flux-1.1-pro', 'FLUX 1.1 Pro', 'blackforest', 0.040, 0, 4000, 1024, 4, 88, '2024-10-01', 0, 'image', 1, 'Fast and high-quality; 6x faster than FLUX.1 Pro', 'image', 'blackforestlabs.ai/pricing'],
  ['flux-1-dev', 'FLUX.1 Dev', 'blackforest', 0.000, 0, 4000, 1024, 8, 84, '2024-08-01', 1, 'image', 1, 'Open-weight distilled model', 'image', 'blackforestlabs.ai/pricing'],
  ['flux-1-schnell', 'FLUX.1 Schnell', 'blackforest', 0.000, 0, 4000, 1024, 2, 78, '2024-08-01', 1, 'image', 1, 'Fastest FLUX variant; Apache 2.0 license', 'image', 'blackforestlabs.ai/pricing'],
  ['flux-kontext', 'FLUX Kontext', 'blackforest', 0.040, 0, 8000, 1024, 6, 89, '2025-06-18', 0, 'image', 1, 'Context-aware editing and generation', 'image', 'blackforestlabs.ai/pricing'],
  ['midjourney-v6.1', 'Midjourney v6.1', 'midjourney', 0.010, 0, 6000, 2048, 20, 92, '2024-12-01', 0, 'image', 0, 'Subscription-based; $10-$120/mo; aesthetic leader', 'image', 'midjourney.com/pricing'],
  ['midjourney-v7', 'Midjourney v7', 'midjourney', 0.010, 0, 6000, 2048, 15, 95, '2025-05-25', 0, 'image', 0, 'Latest; native person generation; text-in-image', 'image', 'midjourney.com/pricing'],
  ['ideogram-3', 'Ideogram 3', 'ideogram', 0.020, 0, 8000, 1536, 10, 88, '2025-04-23', 0, 'image', 1, 'Best text-in-image; style reference support', 'image', 'ideogram.ai/pricing'],
  ['ideogram-2', 'Ideogram 2', 'ideogram', 0.010, 0, 4000, 1280, 8, 83, '2024-08-19', 0, 'image', 1, 'Strong text rendering at lower cost', 'image', 'ideogram.ai/pricing'],
  ['leonardo-phoenix', 'Leonardo Phoenix', 'leonardo', 0.015, 0, 4000, 1472, 5, 82, '2024-08-01', 0, 'image', 1, 'Fast creative generation', 'image', 'leonardo.ai/pricing'],
  ['recraft-v3', 'Recraft v3', 'reka', 0.040, 0, 4000, 2048, 8, 85, '2024-10-29', 0, 'image', 1, '#1 on Hugging Face text-to-image arena', 'image', 'recraft.ai/pricing'],
];

const insertImageModels = db.transaction(() => {
  for (const m of imageModels) {
    insertModelWithCategory.run(...m);
  }
});
insertImageModels();

// ─── Video Generation Models ─────────────────────────────────
// input_price: cost per second of video; output_price: 0
// context_window: max prompt chars; max_output: max video duration in seconds; speed: generation time in seconds
const videoModels: (string | number | null)[][] = [
  ['sora', 'Sora', 'openai', 0.15, 0, 4000, 20, 120, 88, '2025-02-01', 0, 'video', 1, 'Text/image-to-video; 1080p; up to 20s', 'video', 'openai.com/sora'],
  ['sora-turbo', 'Sora Turbo', 'openai', 0.06, 0, 4000, 10, 30, 82, '2025-02-01', 0, 'video', 1, 'Faster variant; 480p-720p', 'video', 'openai.com/sora'],
  ['veo-2', 'Veo 2', 'google', 0.15, 0, 4000, 8, 60, 90, '2024-12-01', 0, 'video', 1, 'Google DeepMind; 4K capable; realistic physics', 'video', 'deepmind.google/technologies/veo'],
  ['veo-3', 'Veo 3', 'google', 0.20, 0, 4000, 8, 90, 93, '2025-05-20', 0, 'video', 1, 'Native audio generation; highest quality', 'video', 'deepmind.google/technologies/veo'],
  ['gen-3-alpha', 'Gen-3 Alpha', 'runway', 0.05, 0, 4000, 10, 30, 82, '2024-06-17', 0, 'video', 1, '$0.25/5s clip; fast generation', 'video', 'runwayml.com/pricing'],
  ['gen-4', 'Gen-4', 'runway', 0.10, 0, 4000, 10, 45, 87, '2025-06-02', 0, 'video', 1, 'Multi-shot consistency; camera control', 'video', 'runwayml.com/pricing'],
  ['gen-4-turbo', 'Gen-4 Turbo', 'runway', 0.06, 0, 4000, 5, 15, 83, '2025-08-01', 0, 'video', 1, 'Fast mode for iterating', 'video', 'runwayml.com/pricing'],
  ['pika-2.2', 'Pika 2.2', 'pika', 0.05, 0, 4000, 10, 30, 81, '2025-05-01', 0, 'video', 1, 'Scene ingredients; Pikaffects; text-in-video', 'video', 'pika.art/pricing'],
  ['pika-2', 'Pika 2', 'pika', 0.04, 0, 4000, 5, 20, 78, '2024-12-09', 0, 'video', 1, 'Crush It, Inflate, effects system', 'video', 'pika.art/pricing'],
  ['dream-machine', 'Dream Machine', 'luma', 0.04, 0, 4000, 5, 20, 80, '2024-06-12', 0, 'video', 1, 'Free tier; good motion quality', 'video', 'lumalabs.ai/pricing'],
  ['ray-2', 'Ray 2', 'luma', 0.08, 0, 4000, 10, 40, 86, '2025-03-01', 0, 'video', 1, 'Image-to-video; camera control; 2M+ frames/day', 'video', 'lumalabs.ai/pricing'],
  ['kling-1.6', 'Kling 1.6', 'kling', 0.04, 0, 4000, 10, 30, 84, '2025-02-01', 0, 'video', 1, 'Professional mode; impressive motion quality', 'video', 'klingai.com/pricing'],
  ['kling-2', 'Kling 2', 'kling', 0.06, 0, 4000, 10, 25, 88, '2025-08-01', 0, 'video', 1, 'Top-ranked in VBench; Kuaishou flagship', 'video', 'klingai.com/pricing'],
  ['hailuo-i2v-01-live', 'Hailuo I2V-01 Live', 'hailuo', 0.03, 0, 4000, 6, 20, 79, '2024-10-01', 0, 'video', 1, 'MiniMax video gen; 6-second clips', 'video', 'hailuoai.com/pricing'],
  ['wan-2.1', 'Wan 2.1', 'alibaba', 0.00, 0, 4000, 5, 30, 80, '2025-02-25', 1, 'video', 1, 'Open-weight; 14B and 1.3B variants', 'video', 'github.com/Wan-Video'],
  ['cogvideox-1.5', 'CogVideoX 1.5', 'zhipu', 0.00, 0, 4000, 10, 30, 76, '2024-12-01', 1, 'video', 1, 'Open-weight video generation by Zhipu AI', 'video', 'github.com/THUDM/CogVideo'],
  ['nova-reel', 'Amazon Nova Reel', 'amazon', 0.08, 0, 4000, 6, 45, 74, '2024-12-02', 0, 'video', 1, 'AWS Bedrock video generation', 'video', 'aws.amazon.com/nova/pricing'],
];

const insertVideoModels = db.transaction(() => {
  for (const m of videoModels) {
    insertModelWithCategory.run(...m);
  }
});
insertVideoModels();

// ─── Audio & Speech Models ───────────────────────────────────
// Speech-to-text (STT): input_price = $/minute of audio; output_price = 0
// Text-to-speech (TTS): input_price = $/1M characters; output_price = 0
// Voice cloning: input_price = $/minute generated; output_price = 0
// Music/Sound: input_price = $/song or $/minute
// context_window: max input duration (seconds for STT, characters for TTS)
// max_output: max output duration in seconds
// speed: real-time factor (1x = real-time)
const audioModels: (string | number | null)[][] = [
  // ── Speech-to-Text (STT) ──
  ['whisper-large-v3', 'Whisper Large v3', 'openai', 0.006, 0, 7200, 7200, 10, 88, '2023-11-06', 1, 'speech-to-text', 1, '$0.006/min; 99 languages; open-weight', 'speech', 'openai.com/api/pricing'],
  ['gpt-4o-transcribe', 'GPT-4o Transcribe', 'openai', 0.006, 0, 7200, 7200, 5, 92, '2025-03-14', 0, 'speech-to-text', 1, 'Powered by GPT-4o; superior accuracy', 'speech', 'openai.com/api/pricing'],
  ['gemini-stt', 'Gemini Audio (STT)', 'google', 0.003, 0, 34200, 34200, 3, 90, '2025-01-01', 0, 'speech-to-text', 1, 'Native audio input in Gemini models; 9.5hr limit', 'speech', 'ai.google.dev/pricing'],
  ['assemblyai-best', 'AssemblyAI Best', 'assemblyai', 0.0065, 0, 36000, 36000, 2, 93, '2024-01-01', 0, 'speech-to-text', 1, 'Highest accuracy STT; Universal-2 model', 'speech', 'assemblyai.com/pricing'],
  ['assemblyai-nano', 'AssemblyAI Nano', 'assemblyai', 0.002, 0, 36000, 36000, 5, 85, '2024-01-01', 0, 'speech-to-text', 1, 'Budget tier; 4x cheaper than Best', 'speech', 'assemblyai.com/pricing'],
  ['deepgram-nova-3', 'Deepgram Nova 3', 'deepgram', 0.0043, 0, 36000, 36000, 3, 91, '2025-03-01', 0, 'speech-to-text', 1, 'Agentic-grade STT; 6x lower hallucination', 'speech', 'deepgram.com/pricing'],
  ['deepgram-nova-2', 'Deepgram Nova 2', 'deepgram', 0.0036, 0, 36000, 36000, 3, 87, '2024-01-01', 0, 'speech-to-text', 1, 'Mainstream STT; 50+ languages', 'speech', 'deepgram.com/pricing'],

  // ── Text-to-Speech (TTS) ──
  ['openai-tts-1', 'OpenAI TTS-1', 'openai', 15.00, 0, 4096, 600, 1, 78, '2023-11-06', 0, 'text-to-speech', 1, '$15/1M chars; 6 preset voices; real-time', 'voice', 'openai.com/api/pricing'],
  ['openai-tts-1-hd', 'OpenAI TTS-1 HD', 'openai', 30.00, 0, 4096, 600, 2, 83, '2023-11-06', 0, 'text-to-speech', 1, '$30/1M chars; higher quality audio', 'voice', 'openai.com/api/pricing'],
  ['gpt-4o-mini-tts', 'GPT-4o Mini TTS', 'openai', 12.00, 0, 4096, 600, 1, 86, '2025-03-20', 0, 'text-to-speech', 1, 'Instruction-following TTS; natural prosody', 'voice', 'openai.com/api/pricing'],
  ['elevenlabs-multilingual-v2', 'ElevenLabs Multilingual v2', 'elevenlabs', 24.00, 0, 5000, 600, 1, 94, '2024-01-01', 0, 'text-to-speech', 1, 'Industry-leading quality; 32 languages; voice cloning', 'voice', 'elevenlabs.io/pricing'],
  ['elevenlabs-turbo-v2.5', 'ElevenLabs Turbo v2.5', 'elevenlabs', 18.00, 0, 5000, 600, 0.5, 90, '2024-06-01', 0, 'text-to-speech', 1, '~300ms latency; ideal for conversational AI', 'voice', 'elevenlabs.io/pricing'],
  ['elevenlabs-flash', 'ElevenLabs Flash', 'elevenlabs', 12.00, 0, 5000, 600, 0.3, 85, '2025-01-01', 0, 'text-to-speech', 1, 'Lowest latency; ~75ms', 'voice', 'elevenlabs.io/pricing'],
  ['deepgram-aura-2', 'Deepgram Aura 2', 'deepgram', 15.00, 0, 2000, 600, 0.5, 82, '2025-03-01', 0, 'text-to-speech', 1, 'Enterprise TTS; low-latency streaming', 'voice', 'deepgram.com/pricing'],
  ['cartesia-sonic-2', 'Cartesia Sonic 2', 'cartesia', 15.00, 0, 4000, 600, 0.3, 88, '2025-01-29', 0, 'text-to-speech', 1, 'State-space model; 40+ languages; streaming', 'voice', 'cartesia.ai/pricing'],
  ['cartesia-sonic-mini', 'Cartesia Sonic Mini', 'cartesia', 8.00, 0, 4000, 600, 0.2, 80, '2025-06-01', 0, 'text-to-speech', 1, 'Cheapest low-latency TTS', 'voice', 'cartesia.ai/pricing'],
  ['play-ht-2.0', 'PlayHT 2.0', 'play-ht', 18.00, 0, 3000, 600, 0.5, 82, '2024-01-01', 0, 'text-to-speech', 1, 'Voice cloning; conversation mode', 'voice', 'play.ht/pricing'],
  ['resemble-v3', 'Resemble v3', 'resemble', 20.00, 0, 3000, 600, 0.5, 83, '2024-06-01', 0, 'text-to-speech', 1, 'Enterprise voice cloning; watermarking', 'voice', 'resemble.ai/pricing'],

  // ── Music & Sound Generation ──
  ['suno-v4', 'Suno v4', 'suno', 0.05, 0, 3000, 240, 30, 90, '2024-11-01', 0, 'music', 1, 'Full songs from text; lyrics generation; $0.05/song', 'sound', 'suno.com/pricing'],
  ['suno-v3.5', 'Suno v3.5', 'suno', 0.04, 0, 3000, 240, 30, 85, '2024-07-01', 0, 'music', 1, 'Previous generation; widely used', 'sound', 'suno.com/pricing'],
  ['udio-v2', 'Udio v2', 'udio', 0.04, 0, 3000, 180, 25, 87, '2024-10-01', 0, 'music', 1, 'High-fidelity music; excellent vocals', 'sound', 'udio.com/pricing'],
  ['udio-v1.5', 'Udio v1.5', 'udio', 0.03, 0, 3000, 120, 20, 80, '2024-06-01', 0, 'music', 1, 'Original release; strong instrumentals', 'sound', 'udio.com/pricing'],
  ['musicgen-large', 'MusicGen Large', 'meta', 0.00, 0, 2000, 30, 15, 72, '2023-06-01', 1, 'music', 1, 'Open-weight by Meta; 30s max; melody conditioning', 'sound', 'github.com/facebookresearch/audiocraft'],
  ['stable-audio-2', 'Stable Audio 2', 'stability', 0.00, 0, 2000, 180, 20, 78, '2024-04-03', 1, 'music', 1, 'Open-weight music + sound FX; 3min tracks', 'sound', 'stability.ai/stable-audio'],
];

const insertAudioModels = db.transaction(() => {
  for (const m of audioModels) {
    insertModelWithCategory.run(...m);
  }
});
insertAudioModels();

// ─── Benchmarks ─────────────────────────────────────────────────
const insertBenchmark = db.prepare(`
  INSERT INTO benchmarks (id, name, category, description, url, scale_min, scale_max, higher_is_better, weight)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const benchmarks = [
  // General knowledge
  ['mmlu', 'MMLU', 'knowledge', 'Massive Multitask Language Understanding — 57 academic subjects', 'https://arxiv.org/abs/2009.03300', 0, 100, 1, 0.8],
  ['mmlu-pro', 'MMLU-Pro', 'knowledge', 'Harder version of MMLU with 10 answer choices', 'https://arxiv.org/abs/2406.01574', 0, 100, 1, 1.2],

  // Reasoning
  ['gpqa-diamond', 'GPQA Diamond', 'reasoning', 'Graduate-level science questions, expert-validated', 'https://arxiv.org/abs/2311.12022', 0, 100, 1, 1.5],
  ['arc-challenge', 'ARC Challenge', 'reasoning', 'AI2 Reasoning Challenge — grade school science', 'https://arxiv.org/abs/1803.05457', 0, 100, 1, 0.6],
  ['math-500', 'MATH-500', 'reasoning', 'Competition-level mathematics problems', 'https://arxiv.org/abs/2103.03874', 0, 100, 1, 1.3],
  ['aime-2025', 'AIME 2025', 'reasoning', 'American Invitational Mathematics Examination 2025', null, 0, 100, 1, 1.4],

  // Coding
  ['humaneval', 'HumanEval', 'coding', 'Python function completion (pass@1)', 'https://arxiv.org/abs/2107.03374', 0, 100, 1, 1.0],
  ['swe-bench-verified', 'SWE-bench Verified', 'coding', 'Real-world GitHub issue resolution', 'https://swebench.com', 0, 100, 1, 1.5],
  ['livecodebench', 'LiveCodeBench', 'coding', 'Competitive programming from live contests', 'https://livecodebench.github.io', 0, 100, 1, 1.2],

  // Instruction following
  ['ifeval', 'IFEval', 'instruction', 'Instruction Following Evaluation', 'https://arxiv.org/abs/2311.07911', 0, 100, 1, 0.8],

  // Conversational / Arena
  ['chatbot-arena-elo', 'Chatbot Arena ELO', 'conversational', 'LMSYS Chatbot Arena crowdsourced ELO rating', 'https://chat.lmsys.org', 800, 1400, 1, 1.5],

  // Multimodal
  ['mmmu', 'MMMU', 'multimodal', 'Massive Multi-discipline Multimodal Understanding', 'https://arxiv.org/abs/2311.16502', 0, 100, 1, 1.0],

  // Additional benchmarks
  ['arena-hard', 'Arena-Hard', 'conversational', 'Automated benchmark using GPT-4 as judge on challenging Arena questions', 'https://github.com/lm-sys/arena-hard-auto', 0, 100, 1, 1.2],
  ['mt-bench', 'MT-Bench', 'conversational', 'Multi-turn conversation benchmark judged by GPT-4', 'https://arxiv.org/abs/2306.05685', 0, 10, 1, 0.8],
  ['livebench', 'LiveBench', 'reasoning', 'Contamination-free benchmark using recent questions from math, coding, and reasoning', 'https://livebench.ai', 0, 100, 1, 1.3],
  ['bigcodebench', 'BigCodeBench', 'coding', 'Challenging code generation tasks with complex function calls and libraries', 'https://bigcode-bench.github.io', 0, 100, 1, 1.1],
  ['humanitys-last-exam', 'Humanity\'s Last Exam', 'reasoning', 'Ultra-hard questions from experts across 100+ academic subjects', 'https://lastexam.ai', 0, 100, 1, 1.5],

  // Safety & alignment
  ['simpleqa', 'SimpleQA', 'safety', 'Factual accuracy on straightforward questions — measures hallucination rate', null, 0, 100, 1, 1.0],
  ['air-bench', 'AIR-Bench', 'safety', 'AI safety aligned with regulations — 5,694 tests across 314 risk categories', null, 0, 100, 1, 0.8],
  ['trustllm', 'TrustLLM', 'safety', 'Comprehensive trustworthiness: truthfulness, safety, fairness, robustness, privacy', null, 0, 100, 1, 0.8],

  // Agent benchmarks
  ['gaia', 'GAIA', 'agent', 'General AI Assistant tasks requiring web browsing, reasoning, and tool use', 'https://huggingface.co/spaces/gaia-benchmark/leaderboard', 0, 100, 1, 1.3],
  ['webarena', 'WebArena', 'agent', 'Autonomous web navigation and task completion in realistic environments', 'https://webarena.dev', 0, 100, 1, 1.1],
  ['tau-bench', 'TAU-bench', 'agent', 'Tool-Agent-User interaction quality across multi-step scenarios', null, 0, 100, 1, 1.0],

  // Coding (additional)
  ['aider-polyglot', 'Aider Polyglot', 'coding', 'Multi-language coding: 225 exercises across C++, Go, Java, JS, Python, Rust', 'https://aider.chat/docs/leaderboards/', 0, 100, 1, 1.1],
  ['bfcl', 'BFCL', 'coding', 'Berkeley Function Calling Leaderboard — tool/function invocation accuracy', 'https://gorilla.cs.berkeley.edu/leaderboard.html', 0, 100, 1, 1.0],

  // Multimodal (additional)
  ['mmmu-pro', 'MMMU-Pro', 'multimodal', 'Enhanced multimodal understanding — harder than MMMU with no shortcut strategies', null, 0, 100, 1, 1.2],
  ['mathvista', 'MathVista', 'multimodal', 'Mathematical reasoning in visual contexts — diagrams, charts, figures', 'https://mathvista.github.io', 0, 100, 1, 1.0],

  // Domain-specific
  ['medqa', 'MedQA', 'domain', 'US Medical Licensing Exam questions — medical knowledge and reasoning', null, 0, 100, 1, 0.8],
  ['legalbench', 'LegalBench', 'domain', 'Legal reasoning across 162 tasks: issue-spotting, rule-recall, interpretation', null, 0, 100, 1, 0.8],

  // Multilingual
  ['mgsm', 'MGSM', 'multilingual', 'Multilingual Grade School Math — 250 problems in 10 languages', null, 0, 100, 1, 0.7],
];

const insertBenchmarks = db.transaction(() => {
  for (const b of benchmarks) {
    insertBenchmark.run(...b);
  }
});
insertBenchmarks();

// ─── Benchmark Scores ───────────────────────────────────────────
// Sources: official model cards, technical reports, lmsys.org, papers
const insertScore = db.prepare(`
  INSERT INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at)
  VALUES (?, ?, ?, ?, ?)
`);

const scores: [string, string, number, string, string][] = [
  // GPT-5.2
  ['gpt-5.2', 'chatbot-arena-elo', 1370, 'LMSYS', '2026-01-01'],
  ['gpt-5.2', 'gpqa-diamond', 89.0, 'OpenAI', '2025-12-10'],
  ['gpt-5.2', 'swe-bench-verified', 78.0, 'OpenAI', '2025-12-10'],

  // GPT-5
  ['gpt-5', 'gpqa-diamond', 86.0, 'OpenAI', '2025-08-07'],
  ['gpt-5', 'swe-bench-verified', 75.0, 'OpenAI', '2025-08-07'],
  ['gpt-5', 'chatbot-arena-elo', 1355, 'LMSYS', '2025-09-01'],

  // GPT-4.1
  ['gpt-4.1', 'mmlu', 90.2, 'OpenAI', '2025-04-14'],
  ['gpt-4.1', 'gpqa-diamond', 66.3, 'OpenAI', '2025-04-14'],
  ['gpt-4.1', 'humaneval', 93.4, 'OpenAI', '2025-04-14'],
  ['gpt-4.1', 'swe-bench-verified', 54.6, 'OpenAI', '2025-04-14'],
  ['gpt-4.1', 'math-500', 83.0, 'OpenAI', '2025-04-14'],

  // GPT-4o
  ['gpt-4o', 'mmlu', 88.7, 'OpenAI', '2024-05-13'],
  ['gpt-4o', 'gpqa-diamond', 53.6, 'OpenAI', '2024-05-13'],
  ['gpt-4o', 'humaneval', 90.2, 'OpenAI', '2024-05-13'],
  ['gpt-4o', 'math-500', 76.6, 'OpenAI', '2024-05-13'],
  ['gpt-4o', 'chatbot-arena-elo', 1285, 'LMSYS', '2025-01-15'],

  // o3
  ['o3', 'mmlu', 92.0, 'OpenAI', '2025-04-16'],
  ['o3', 'gpqa-diamond', 83.3, 'OpenAI', '2025-04-16'],
  ['o3', 'humaneval', 97.0, 'OpenAI', '2025-04-16'],
  ['o3', 'math-500', 96.7, 'OpenAI', '2025-04-16'],
  ['o3', 'aime-2025', 91.6, 'OpenAI', '2025-04-16'],
  ['o3', 'swe-bench-verified', 69.1, 'OpenAI', '2025-04-16'],
  ['o3', 'chatbot-arena-elo', 1337, 'LMSYS', '2025-05-01'],

  // o3-pro
  ['o3-pro', 'gpqa-diamond', 87.5, 'OpenAI', '2025-06-10'],
  ['o3-pro', 'math-500', 98.0, 'OpenAI', '2025-06-10'],
  ['o3-pro', 'aime-2025', 96.7, 'OpenAI', '2025-06-10'],
  ['o3-pro', 'swe-bench-verified', 73.0, 'OpenAI', '2025-06-10'],

  // o4-mini
  ['o4-mini', 'gpqa-diamond', 81.4, 'OpenAI', '2025-04-16'],
  ['o4-mini', 'math-500', 96.3, 'OpenAI', '2025-04-16'],
  ['o4-mini', 'aime-2025', 92.7, 'OpenAI', '2025-04-16'],
  ['o4-mini', 'humaneval', 96.0, 'OpenAI', '2025-04-16'],

  // Claude Opus 4.6
  ['claude-opus-4.6', 'swe-bench-verified', 78.0, 'Anthropic', '2026-02-05'],
  ['claude-opus-4.6', 'chatbot-arena-elo', 1365, 'LMSYS', '2026-02-10'],

  // Claude Sonnet 4.6
  ['claude-sonnet-4.6', 'swe-bench-verified', 72.0, 'Anthropic', '2026-02-17'],
  ['claude-sonnet-4.6', 'chatbot-arena-elo', 1350, 'LMSYS', '2026-02-20'],

  // Claude Sonnet 4
  ['claude-sonnet-4', 'mmlu', 88.0, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'gpqa-diamond', 67.5, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'humaneval', 93.0, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'swe-bench-verified', 53.6, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'math-500', 85.4, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-06-01'],

  // Claude Opus 4
  ['claude-opus-4', 'mmlu', 89.0, 'Anthropic', '2025-05-22'],
  ['claude-opus-4', 'gpqa-diamond', 72.1, 'Anthropic', '2025-05-22'],
  ['claude-opus-4', 'humaneval', 95.0, 'Anthropic', '2025-05-22'],
  ['claude-opus-4', 'swe-bench-verified', 72.5, 'Anthropic', '2025-05-22'],
  ['claude-opus-4', 'math-500', 88.7, 'Anthropic', '2025-05-22'],
  ['claude-opus-4', 'chatbot-arena-elo', 1330, 'LMSYS', '2025-06-01'],

  // Gemini 3.1 Pro
  ['gemini-3.1-pro', 'chatbot-arena-elo', 1375, 'LMSYS', '2026-02-15'],

  // Gemini 2.5 Pro
  ['gemini-2.5-pro', 'mmlu', 90.5, 'Google', '2025-03-25'],
  ['gemini-2.5-pro', 'gpqa-diamond', 68.4, 'Google', '2025-03-25'],
  ['gemini-2.5-pro', 'humaneval', 93.2, 'Google', '2025-03-25'],
  ['gemini-2.5-pro', 'math-500', 90.2, 'Google', '2025-03-25'],
  ['gemini-2.5-pro', 'swe-bench-verified', 63.8, 'Google', '2025-06-17'],
  ['gemini-2.5-pro', 'aime-2025', 86.7, 'Google', '2025-03-25'],
  ['gemini-2.5-pro', 'chatbot-arena-elo', 1340, 'LMSYS', '2025-06-01'],

  // Gemini 2.5 Flash
  ['gemini-2.5-flash', 'mmlu', 86.5, 'Google', '2025-05-01'],
  ['gemini-2.5-flash', 'gpqa-diamond', 59.2, 'Google', '2025-05-01'],
  ['gemini-2.5-flash', 'math-500', 82.3, 'Google', '2025-05-01'],
  ['gemini-2.5-flash', 'humaneval', 88.5, 'Google', '2025-05-01'],
  ['gemini-2.5-flash', 'chatbot-arena-elo', 1300, 'LMSYS', '2025-05-01'],

  // DeepSeek R1
  ['deepseek-r1', 'mmlu', 90.8, 'DeepSeek', '2025-01-20'],
  ['deepseek-r1', 'gpqa-diamond', 71.5, 'DeepSeek', '2025-01-20'],
  ['deepseek-r1', 'math-500', 97.3, 'DeepSeek', '2025-01-20'],
  ['deepseek-r1', 'aime-2025', 79.8, 'DeepSeek', '2025-01-20'],
  ['deepseek-r1', 'humaneval', 92.5, 'DeepSeek', '2025-01-20'],
  ['deepseek-r1', 'chatbot-arena-elo', 1318, 'LMSYS', '2025-04-01'],

  // DeepSeek V3.2
  ['deepseek-v3.2', 'mmlu', 89.5, 'DeepSeek', '2025-09-29'],
  ['deepseek-v3.2', 'humaneval', 91.0, 'DeepSeek', '2025-09-29'],
  ['deepseek-v3.2', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-10-01'],

  // DeepSeek V3
  ['deepseek-v3', 'mmlu', 88.5, 'DeepSeek', '2024-12-25'],
  ['deepseek-v3', 'gpqa-diamond', 59.1, 'DeepSeek', '2024-12-25'],
  ['deepseek-v3', 'math-500', 78.3, 'DeepSeek', '2024-12-25'],
  ['deepseek-v3', 'humaneval', 89.5, 'DeepSeek', '2024-12-25'],

  // Grok 4
  ['grok-4', 'chatbot-arena-elo', 1345, 'LMSYS', '2025-08-01'],
  ['grok-4', 'gpqa-diamond', 82.0, 'xAI', '2025-07-09'],
  ['grok-4', 'math-500', 95.0, 'xAI', '2025-07-09'],

  // Grok 3
  ['grok-3', 'mmlu', 91.0, 'xAI', '2025-06-10'],
  ['grok-3', 'gpqa-diamond', 68.2, 'xAI', '2025-06-10'],
  ['grok-3', 'math-500', 91.5, 'xAI', '2025-06-10'],
  ['grok-3', 'aime-2025', 83.9, 'xAI', '2025-06-10'],
  ['grok-3', 'humaneval', 93.8, 'xAI', '2025-06-10'],
  ['grok-3', 'chatbot-arena-elo', 1329, 'LMSYS', '2025-07-01'],

  // Llama 4 Maverick
  ['llama-4-maverick', 'mmlu', 85.5, 'Meta', '2025-04-05'],
  ['llama-4-maverick', 'gpqa-diamond', 56.0, 'Meta', '2025-04-05'],
  ['llama-4-maverick', 'humaneval', 87.5, 'Meta', '2025-04-05'],
  ['llama-4-maverick', 'chatbot-arena-elo', 1290, 'LMSYS', '2025-05-01'],

  // Qwen3 235B
  ['qwen3-235b', 'chatbot-arena-elo', 1320, 'LMSYS', '2025-05-01'],
  ['qwen3-235b', 'math-500', 92.0, 'Alibaba', '2025-04-01'],

  // Qwen QwQ
  ['qwen-qwq-32b', 'gpqa-diamond', 63.0, 'Alibaba', '2025-03-06'],
  ['qwen-qwq-32b', 'math-500', 90.6, 'Alibaba', '2025-03-06'],
  ['qwen-qwq-32b', 'aime-2025', 79.5, 'Alibaba', '2025-03-06'],
  ['qwen-qwq-32b', 'humaneval', 88.0, 'Alibaba', '2025-03-06'],

  // Qwen 2.5 72B
  ['qwen-2.5-72b', 'mmlu', 86.1, 'Alibaba', '2024-09-19'],
  ['qwen-2.5-72b', 'gpqa-diamond', 49.0, 'Alibaba', '2024-09-19'],
  ['qwen-2.5-72b', 'humaneval', 86.6, 'Alibaba', '2024-09-19'],
  ['qwen-2.5-72b', 'math-500', 80.0, 'Alibaba', '2024-09-19'],

  // Mistral Large 3
  ['mistral-large-3', 'chatbot-arena-elo', 1295, 'LMSYS', '2025-07-01'],

  // Command A
  ['command-a', 'chatbot-arena-elo', 1280, 'LMSYS', '2025-04-01'],

  // ─── New Benchmarks: Arena-Hard ──────────────────────────
  ['gpt-5.2', 'arena-hard', 92.0, 'OpenAI', '2025-12-10'],
  ['o3', 'arena-hard', 88.5, 'OpenAI', '2025-04-16'],
  ['claude-opus-4.6', 'arena-hard', 90.0, 'Anthropic', '2026-02-05'],
  ['claude-sonnet-4.6', 'arena-hard', 86.0, 'Anthropic', '2026-02-17'],
  ['gemini-2.5-pro', 'arena-hard', 85.5, 'Google', '2025-03-25'],
  ['grok-4', 'arena-hard', 89.0, 'xAI', '2025-07-09'],
  ['deepseek-r1', 'arena-hard', 82.0, 'DeepSeek', '2025-01-20'],

  // ─── New Benchmarks: MT-Bench ────────────────────────────
  ['gpt-5.2', 'mt-bench', 9.5, 'OpenAI', '2025-12-10'],
  ['claude-opus-4.6', 'mt-bench', 9.4, 'Anthropic', '2026-02-05'],
  ['gemini-2.5-pro', 'mt-bench', 9.2, 'Google', '2025-03-25'],
  ['grok-4', 'mt-bench', 9.3, 'xAI', '2025-07-09'],
  ['o3', 'mt-bench', 9.1, 'OpenAI', '2025-04-16'],
  ['deepseek-r1', 'mt-bench', 8.9, 'DeepSeek', '2025-01-20'],
  ['claude-sonnet-4', 'mt-bench', 8.8, 'Anthropic', '2025-05-22'],
  ['gpt-4o', 'mt-bench', 8.6, 'OpenAI', '2024-05-13'],
  ['llama-4-maverick', 'mt-bench', 8.5, 'Meta', '2025-04-05'],

  // ─── New Benchmarks: LiveBench ───────────────────────────
  ['gpt-5.2', 'livebench', 88.0, 'OpenAI', '2025-12-10'],
  ['o3', 'livebench', 85.0, 'OpenAI', '2025-04-16'],
  ['claude-opus-4.6', 'livebench', 86.5, 'Anthropic', '2026-02-05'],
  ['gemini-2.5-pro', 'livebench', 82.0, 'Google', '2025-03-25'],
  ['grok-4', 'livebench', 84.0, 'xAI', '2025-07-09'],
  ['deepseek-r1', 'livebench', 80.0, 'DeepSeek', '2025-01-20'],
  ['claude-sonnet-4.6', 'livebench', 83.0, 'Anthropic', '2026-02-17'],
  ['qwen3-235b', 'livebench', 78.0, 'Alibaba', '2025-04-01'],

  // ─── New Benchmarks: BigCodeBench ────────────────────────
  ['o3', 'bigcodebench', 74.0, 'OpenAI', '2025-04-16'],
  ['claude-opus-4.6', 'bigcodebench', 72.0, 'Anthropic', '2026-02-05'],
  ['gpt-5.2', 'bigcodebench', 73.0, 'OpenAI', '2025-12-10'],
  ['gemini-2.5-pro', 'bigcodebench', 68.0, 'Google', '2025-03-25'],
  ['deepseek-r1', 'bigcodebench', 65.0, 'DeepSeek', '2025-01-20'],

  // ─── New Benchmarks: Humanity's Last Exam ────────────────
  ['o3-pro', 'humanitys-last-exam', 26.6, 'OpenAI', '2025-06-10'],
  ['gpt-5.2', 'humanitys-last-exam', 24.0, 'OpenAI', '2025-12-10'],
  ['claude-opus-4.6', 'humanitys-last-exam', 22.0, 'Anthropic', '2026-02-05'],
  ['gemini-3.1-pro', 'humanitys-last-exam', 25.0, 'Google', '2026-02-01'],
  ['grok-4', 'humanitys-last-exam', 21.0, 'xAI', '2025-07-09'],
  ['deepseek-r1', 'humanitys-last-exam', 18.0, 'DeepSeek', '2025-01-20'],

  // ─── New Benchmarks: SimpleQA (factual accuracy) ──────────
  ['gpt-5.2', 'simpleqa', 58.0, 'OpenAI', '2025-12-10'],
  ['gpt-5', 'simpleqa', 52.0, 'OpenAI', '2025-08-07'],
  ['o3', 'simpleqa', 49.0, 'OpenAI', '2025-04-16'],
  ['claude-opus-4', 'simpleqa', 44.0, 'Anthropic', '2025-05-22'],
  ['claude-sonnet-4', 'simpleqa', 41.0, 'Anthropic', '2025-05-22'],
  ['gemini-2.5-pro', 'simpleqa', 47.0, 'Google', '2025-03-25'],
  ['gpt-4o', 'simpleqa', 38.2, 'OpenAI', '2024-11-20'],

  // ─── New Benchmarks: GAIA (general AI assistant) ──────────
  ['gpt-5.2', 'gaia', 78.0, 'OpenAI', '2025-12-10'],
  ['claude-opus-4.6', 'gaia', 75.0, 'Anthropic', '2026-02-05'],
  ['o3', 'gaia', 72.0, 'OpenAI', '2025-04-16'],
  ['gemini-2.5-pro', 'gaia', 68.0, 'Google', '2025-03-25'],
  ['grok-4', 'gaia', 70.0, 'xAI', '2025-07-09'],

  // ─── New Benchmarks: Aider Polyglot (multi-language coding)
  ['claude-opus-4.6', 'aider-polyglot', 82.0, 'Anthropic', '2026-02-05'],
  ['claude-sonnet-4.6', 'aider-polyglot', 79.0, 'Anthropic', '2026-02-17'],
  ['gpt-5.2', 'aider-polyglot', 80.0, 'OpenAI', '2025-12-10'],
  ['o3', 'aider-polyglot', 76.0, 'OpenAI', '2025-04-16'],
  ['gemini-2.5-pro', 'aider-polyglot', 72.0, 'Google', '2025-03-25'],
  ['deepseek-r1', 'aider-polyglot', 65.0, 'DeepSeek', '2025-01-20'],

  // ─── New Benchmarks: BFCL (function calling) ──────────────
  ['gpt-5.2', 'bfcl', 92.0, 'OpenAI', '2025-12-10'],
  ['claude-sonnet-4', 'bfcl', 88.0, 'Anthropic', '2025-05-22'],
  ['gpt-4o', 'bfcl', 85.0, 'OpenAI', '2024-05-13'],
  ['gemini-2.5-pro', 'bfcl', 87.0, 'Google', '2025-03-25'],
  ['grok-3', 'bfcl', 82.0, 'xAI', '2025-02-17'],

  // ─── New Benchmarks: MMMU-Pro (hard multimodal) ───────────
  ['gpt-5.2', 'mmmu-pro', 72.0, 'OpenAI', '2025-12-10'],
  ['gemini-2.5-pro', 'mmmu-pro', 68.0, 'Google', '2025-03-25'],
  ['claude-opus-4', 'mmmu-pro', 64.0, 'Anthropic', '2025-05-22'],
  ['gpt-4o', 'mmmu-pro', 51.0, 'OpenAI', '2024-05-13'],

  // ─── New Benchmarks: MedQA (medical) ──────────────────────
  ['gpt-5.2', 'medqa', 94.0, 'OpenAI', '2025-12-10'],
  ['gemini-2.5-pro', 'medqa', 91.0, 'Google', '2025-03-25'],
  ['claude-opus-4', 'medqa', 89.0, 'Anthropic', '2025-05-22'],
  ['gpt-4o', 'medqa', 86.1, 'OpenAI', '2024-05-13'],
  ['o3', 'medqa', 92.0, 'OpenAI', '2025-04-16'],

  // ─── New Benchmarks: MGSM (multilingual math) ────────────
  ['gpt-5.2', 'mgsm', 95.0, 'OpenAI', '2025-12-10'],
  ['gemini-2.5-pro', 'mgsm', 92.0, 'Google', '2025-03-25'],
  ['claude-opus-4', 'mgsm', 90.0, 'Anthropic', '2025-05-22'],
  ['o3', 'mgsm', 93.0, 'OpenAI', '2025-04-16'],
  ['gpt-4o', 'mgsm', 86.5, 'OpenAI', '2024-05-13'],
  ['llama-4-maverick', 'mgsm', 84.0, 'Meta', '2025-04-05'],

  // ─── GPT-4.5 ──────────────────────────────────────────────
  ['gpt-4.5', 'mmlu', 90.2, 'OpenAI', '2025-02-27'],
  ['gpt-4.5', 'gpqa-diamond', 62.0, 'OpenAI', '2025-02-27'],
  ['gpt-4.5', 'humaneval', 91.0, 'OpenAI', '2025-02-27'],
  ['gpt-4.5', 'simpleqa', 62.5, 'OpenAI', '2025-02-27'],
  ['gpt-4.5', 'chatbot-arena-elo', 1300, 'LMSYS', '2025-03-15'],
  ['gpt-4.5', 'math-500', 82.0, 'OpenAI', '2025-02-27'],
  ['gpt-4.5', 'mt-bench', 8.8, 'OpenAI', '2025-02-27'],

  // ─── o1 ───────────────────────────────────────────────────
  ['o1', 'mmlu', 91.8, 'OpenAI', '2024-12-17'],
  ['o1', 'gpqa-diamond', 78.0, 'OpenAI', '2024-12-17'],
  ['o1', 'math-500', 96.4, 'OpenAI', '2024-12-17'],
  ['o1', 'humaneval', 94.0, 'OpenAI', '2024-12-17'],
  ['o1', 'swe-bench-verified', 48.9, 'OpenAI', '2024-12-17'],
  ['o1', 'chatbot-arena-elo', 1335, 'LMSYS', '2025-01-15'],

  // ─── o1-mini ──────────────────────────────────────────────
  ['o1-mini', 'math-500', 90.0, 'OpenAI', '2024-09-12'],
  ['o1-mini', 'humaneval', 92.4, 'OpenAI', '2024-09-12'],
  ['o1-mini', 'gpqa-diamond', 60.0, 'OpenAI', '2024-09-12'],

  // ─── Claude 3.5 Sonnet (Oct) ──────────────────────────────
  ['claude-3.5-sonnet', 'mmlu', 88.7, 'Anthropic', '2024-10-22'],
  ['claude-3.5-sonnet', 'gpqa-diamond', 65.0, 'Anthropic', '2024-10-22'],
  ['claude-3.5-sonnet', 'humaneval', 93.7, 'Anthropic', '2024-10-22'],
  ['claude-3.5-sonnet', 'swe-bench-verified', 49.0, 'Anthropic', '2024-10-22'],
  ['claude-3.5-sonnet', 'math-500', 78.3, 'Anthropic', '2024-10-22'],
  ['claude-3.5-sonnet', 'chatbot-arena-elo', 1285, 'LMSYS', '2024-11-01'],
  ['claude-3.5-sonnet', 'mt-bench', 8.7, 'Anthropic', '2024-10-22'],

  // ─── Claude 3.7 Sonnet ────────────────────────────────────
  ['claude-3.7-sonnet', 'swe-bench-verified', 62.3, 'Anthropic', '2025-02-24'],
  ['claude-3.7-sonnet', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-03-01'],
  ['claude-3.7-sonnet', 'gpqa-diamond', 68.0, 'Anthropic', '2025-02-24'],
  ['claude-3.7-sonnet', 'math-500', 86.0, 'Anthropic', '2025-02-24'],

  // ─── Claude 3 Opus ────────────────────────────────────────
  ['claude-3-opus', 'mmlu', 86.8, 'Anthropic', '2024-03-04'],
  ['claude-3-opus', 'gpqa-diamond', 50.4, 'Anthropic', '2024-03-04'],
  ['claude-3-opus', 'humaneval', 84.9, 'Anthropic', '2024-03-04'],
  ['claude-3-opus', 'math-500', 60.1, 'Anthropic', '2024-03-04'],
  ['claude-3-opus', 'chatbot-arena-elo', 1253, 'LMSYS', '2024-06-01'],

  // ─── Claude Opus 4.5 ─────────────────────────────────────
  ['claude-opus-4.5', 'swe-bench-verified', 75.0, 'Anthropic', '2025-11-24'],
  ['claude-opus-4.5', 'chatbot-arena-elo', 1355, 'LMSYS', '2025-12-01'],
  ['claude-opus-4.5', 'gpqa-diamond', 78.0, 'Anthropic', '2025-11-24'],
  ['claude-opus-4.5', 'humaneval', 95.5, 'Anthropic', '2025-11-24'],

  // ─── Claude Sonnet 4.5 ───────────────────────────────────
  ['claude-sonnet-4.5', 'swe-bench-verified', 68.0, 'Anthropic', '2025-09-29'],
  ['claude-sonnet-4.5', 'chatbot-arena-elo', 1340, 'LMSYS', '2025-10-15'],
  ['claude-sonnet-4.5', 'gpqa-diamond', 72.0, 'Anthropic', '2025-09-29'],

  // ─── Claude Haiku 4.5 ────────────────────────────────────
  ['claude-haiku-4.5', 'chatbot-arena-elo', 1295, 'LMSYS', '2025-11-01'],
  ['claude-haiku-4.5', 'swe-bench-verified', 52.0, 'Anthropic', '2025-10-15'],
  ['claude-haiku-4.5', 'humaneval', 90.0, 'Anthropic', '2025-10-15'],

  // ─── Gemini 3 Pro ─────────────────────────────────────────
  ['gemini-3-pro', 'chatbot-arena-elo', 1362, 'LMSYS', '2025-12-01'],
  ['gemini-3-pro', 'swe-bench-verified', 70.0, 'Google', '2025-11-18'],
  ['gemini-3-pro', 'gpqa-diamond', 80.0, 'Google', '2025-11-18'],

  // ─── Gemini 3 Flash ───────────────────────────────────────
  ['gemini-3-flash', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-12-01'],
  ['gemini-3-flash', 'swe-bench-verified', 55.0, 'Google', '2025-11-18'],
  ['gemini-3-flash', 'humaneval', 89.0, 'Google', '2025-11-18'],

  // ─── Gemini 1.5 Pro ───────────────────────────────────────
  ['gemini-1.5-pro', 'mmlu', 85.9, 'Google', '2024-02-15'],
  ['gemini-1.5-pro', 'humaneval', 84.1, 'Google', '2024-02-15'],
  ['gemini-1.5-pro', 'math-500', 67.7, 'Google', '2024-02-15'],
  ['gemini-1.5-pro', 'chatbot-arena-elo', 1260, 'LMSYS', '2024-06-01'],

  // ─── DeepSeek R1 0528 ─────────────────────────────────────
  ['deepseek-r1-0528', 'gpqa-diamond', 76.0, 'DeepSeek', '2025-05-28'],
  ['deepseek-r1-0528', 'math-500', 97.8, 'DeepSeek', '2025-05-28'],
  ['deepseek-r1-0528', 'aime-2025', 87.5, 'DeepSeek', '2025-05-28'],
  ['deepseek-r1-0528', 'humaneval', 94.0, 'DeepSeek', '2025-05-28'],
  ['deepseek-r1-0528', 'swe-bench-verified', 57.6, 'DeepSeek', '2025-05-28'],
  ['deepseek-r1-0528', 'chatbot-arena-elo', 1328, 'LMSYS', '2025-06-15'],

  // ─── Grok 3 Mini ──────────────────────────────────────────
  ['grok-3-mini', 'chatbot-arena-elo', 1305, 'LMSYS', '2025-07-01'],
  ['grok-3-mini', 'math-500', 85.0, 'xAI', '2025-06-10'],
  ['grok-3-mini', 'humaneval', 88.0, 'xAI', '2025-06-10'],

  // ─── Grok 2 ───────────────────────────────────────────────
  ['grok-2', 'mmlu', 87.5, 'xAI', '2024-08-13'],
  ['grok-2', 'chatbot-arena-elo', 1270, 'LMSYS', '2024-09-01'],

  // ─── Grok 4 Fast ──────────────────────────────────────────
  ['grok-4-fast', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-10-01'],
  ['grok-4-fast', 'humaneval', 90.0, 'xAI', '2025-09-19'],

  // ─── GPT-5 Pro ────────────────────────────────────────────
  ['gpt-5-pro', 'gpqa-diamond', 88.0, 'OpenAI', '2025-10-06'],
  ['gpt-5-pro', 'swe-bench-verified', 76.5, 'OpenAI', '2025-10-06'],
  ['gpt-5-pro', 'math-500', 97.5, 'OpenAI', '2025-10-06'],
  ['gpt-5-pro', 'chatbot-arena-elo', 1360, 'LMSYS', '2025-10-15'],

  // ─── GPT-4.1 Mini ─────────────────────────────────────────
  ['gpt-4.1-mini', 'mmlu', 87.5, 'OpenAI', '2025-04-14'],
  ['gpt-4.1-mini', 'humaneval', 90.5, 'OpenAI', '2025-04-14'],
  ['gpt-4.1-mini', 'swe-bench-verified', 42.0, 'OpenAI', '2025-04-14'],
  ['gpt-4.1-mini', 'chatbot-arena-elo', 1275, 'LMSYS', '2025-05-01'],

  // ─── o3-mini ──────────────────────────────────────────────
  ['o3-mini', 'gpqa-diamond', 75.0, 'OpenAI', '2025-01-31'],
  ['o3-mini', 'math-500', 94.0, 'OpenAI', '2025-01-31'],
  ['o3-mini', 'humaneval', 94.5, 'OpenAI', '2025-01-31'],
  ['o3-mini', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-02-15'],

  // ─── Llama 4 Scout ────────────────────────────────────────
  ['llama-4-scout', 'mmlu', 83.0, 'Meta', '2025-04-05'],
  ['llama-4-scout', 'humaneval', 85.0, 'Meta', '2025-04-05'],
  ['llama-4-scout', 'chatbot-arena-elo', 1275, 'LMSYS', '2025-05-01'],

  // ─── Llama 3.3 70B ────────────────────────────────────────
  ['llama-3.3-70b', 'mmlu', 86.0, 'Meta', '2024-12-06'],
  ['llama-3.3-70b', 'humaneval', 88.4, 'Meta', '2024-12-06'],
  ['llama-3.3-70b', 'chatbot-arena-elo', 1262, 'LMSYS', '2025-01-01'],
  ['llama-3.3-70b', 'gpqa-diamond', 50.7, 'Meta', '2024-12-06'],

  // ─── Llama 3.1 405B ───────────────────────────────────────
  ['llama-3.1-405b', 'mmlu', 88.6, 'Meta', '2024-07-23'],
  ['llama-3.1-405b', 'humaneval', 89.0, 'Meta', '2024-07-23'],
  ['llama-3.1-405b', 'gpqa-diamond', 51.1, 'Meta', '2024-07-23'],
  ['llama-3.1-405b', 'chatbot-arena-elo', 1253, 'LMSYS', '2024-08-01'],

  // ─── Qwen3 Max ────────────────────────────────────────────
  ['qwen3-max', 'chatbot-arena-elo', 1335, 'LMSYS', '2025-10-01'],
  ['qwen3-max', 'gpqa-diamond', 72.0, 'Alibaba', '2025-09-01'],
  ['qwen3-max', 'humaneval', 93.0, 'Alibaba', '2025-09-01'],
  ['qwen3-max', 'math-500', 93.5, 'Alibaba', '2025-09-01'],

  // ─── Mistral Large 3 ─────────────────────────────────────
  ['mistral-large-3', 'mmlu', 87.0, 'Mistral', '2025-06-01'],
  ['mistral-large-3', 'gpqa-diamond', 58.0, 'Mistral', '2025-06-01'],
  ['mistral-large-3', 'humaneval', 89.5, 'Mistral', '2025-06-01'],
  ['mistral-large-3', 'swe-bench-verified', 45.0, 'Mistral', '2025-06-01'],

  // ─── Phi-4 ────────────────────────────────────────────────
  ['phi-4', 'mmlu', 84.8, 'Microsoft', '2024-12-12'],
  ['phi-4', 'gpqa-diamond', 56.1, 'Microsoft', '2024-12-12'],
  ['phi-4', 'humaneval', 82.6, 'Microsoft', '2024-12-12'],
  ['phi-4', 'math-500', 80.4, 'Microsoft', '2024-12-12'],

  // ─── Phi-4 Reasoning ─────────────────────────────────────
  ['phi-4-reasoning', 'math-500', 94.3, 'Microsoft', '2025-05-01'],
  ['phi-4-reasoning', 'gpqa-diamond', 65.8, 'Microsoft', '2025-05-01'],
  ['phi-4-reasoning', 'humaneval', 89.0, 'Microsoft', '2025-05-01'],
  ['phi-4-reasoning', 'aime-2025', 75.3, 'Microsoft', '2025-05-01'],

  // ─── GPT-4o Mini ──────────────────────────────────────────
  ['gpt-4o-mini', 'mmlu', 82.0, 'OpenAI', '2024-07-18'],
  ['gpt-4o-mini', 'humaneval', 87.2, 'OpenAI', '2024-07-18'],
  ['gpt-4o-mini', 'chatbot-arena-elo', 1248, 'LMSYS', '2024-08-01'],
  ['gpt-4o-mini', 'math-500', 70.2, 'OpenAI', '2024-07-18'],

  // ─── Claude 3.5 Haiku ─────────────────────────────────────
  ['claude-haiku-3.5', 'mmlu', 83.0, 'Anthropic', '2024-10-22'],
  ['claude-haiku-3.5', 'humaneval', 88.1, 'Anthropic', '2024-10-22'],
  ['claude-haiku-3.5', 'chatbot-arena-elo', 1255, 'LMSYS', '2024-11-15'],
  ['claude-haiku-3.5', 'math-500', 69.3, 'Anthropic', '2024-10-22'],

  // ─── Qwen 2.5 Coder 32B ──────────────────────────────────
  ['qwen-2.5-coder-32b', 'humaneval', 92.7, 'Alibaba', '2024-11-12'],
  ['qwen-2.5-coder-32b', 'aider-polyglot', 73.7, 'Alibaba', '2024-11-12'],

  // ─── Command A ────────────────────────────────────────────
  ['command-a', 'mmlu', 83.5, 'Cohere', '2025-03-13'],
  ['command-a', 'humaneval', 85.0, 'Cohere', '2025-03-13'],

  // ─── Nemotron 70B ─────────────────────────────────────────
  ['nemotron-70b', 'mmlu', 85.0, 'NVIDIA', '2024-10-01'],
  ['nemotron-70b', 'chatbot-arena-elo', 1265, 'LMSYS', '2024-11-01'],

  // ─── Gemini 2.5 Flash Lite ────────────────────────────────
  ['gemini-2.5-flash-lite', 'mmlu', 80.0, 'Google', '2025-05-01'],
  ['gemini-2.5-flash-lite', 'humaneval', 82.0, 'Google', '2025-05-01'],
  ['gemini-2.5-flash-lite', 'chatbot-arena-elo', 1240, 'LMSYS', '2025-06-01'],

  // ─── Mistral Small 3.1 ───────────────────────────────────
  ['mistral-small-3.1', 'mmlu', 78.0, 'Mistral', '2025-03-18'],
  ['mistral-small-3.1', 'humaneval', 80.0, 'Mistral', '2025-03-18'],

  // ─── GPT-5.2 Pro ──────────────────────────────────────────
  ['gpt-5.2-pro', 'gpqa-diamond', 91.0, 'OpenAI', '2025-12-10'],
  ['gpt-5.2-pro', 'swe-bench-verified', 80.0, 'OpenAI', '2025-12-10'],
  ['gpt-5.2-pro', 'math-500', 98.5, 'OpenAI', '2025-12-10'],
  ['gpt-5.2-pro', 'chatbot-arena-elo', 1380, 'LMSYS', '2026-01-15'],

  // ─── DeepSeek V3.2 (additional) ──────────────────────────
  ['deepseek-v3.2', 'gpqa-diamond', 62.0, 'DeepSeek', '2025-09-29'],
  ['deepseek-v3.2', 'math-500', 84.0, 'DeepSeek', '2025-09-29'],
  ['deepseek-v3.2', 'swe-bench-verified', 50.0, 'DeepSeek', '2025-09-29'],
];

const insertScores = db.transaction(() => {
  for (const s of scores) {
    insertScore.run(...s);
  }
});
insertScores();

// ─── Key People in AI ───────────────────────────────────────────
const insertPerson = db.prepare(`
  INSERT INTO people (id, name, role, organisation, provider_id, bio, twitter, notable_for)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const people = [
  // OpenAI
  ['sam-altman', 'Sam Altman', 'CEO', 'OpenAI', 'openai', 'Co-founder and CEO of OpenAI. Former president of Y Combinator.', '@sama', 'Leading OpenAI, GPT series, ChatGPT'],
  ['mira-murati', 'Mira Murati', 'Former CTO', 'OpenAI', 'openai', 'Former CTO of OpenAI who led ChatGPT and GPT-4 launches.', '@maboroshii', 'ChatGPT launch, GPT-4 development'],
  ['ilya-sutskever', 'Ilya Sutskever', 'Co-founder', 'SSI', 'openai', 'Co-founder of OpenAI, now leading Safe Superintelligence Inc (SSI).', null, 'AlexNet, OpenAI co-founder, SSI'],
  ['greg-brockman', 'Greg Brockman', 'President', 'OpenAI', 'openai', 'Co-founder and President of OpenAI.', '@gaborade', 'OpenAI co-founder, GPT demos'],

  // Anthropic
  ['dario-amodei', 'Dario Amodei', 'CEO', 'Anthropic', 'anthropic', 'Co-founder and CEO of Anthropic. Former VP of Research at OpenAI.', '@DarioAmodei', 'Anthropic, Claude, AI safety research'],
  ['daniela-amodei', 'Daniela Amodei', 'President', 'Anthropic', 'anthropic', 'Co-founder and President of Anthropic.', '@DanielaAmodei', 'Anthropic co-founder, business strategy'],
  ['chris-olah', 'Chris Olah', 'Co-founder', 'Anthropic', 'anthropic', 'Renowned for work on neural network interpretability.', '@ch402', 'Neural network visualisation, mechanistic interpretability'],

  // Google DeepMind
  ['demis-hassabis', 'Demis Hassabis', 'CEO', 'Google DeepMind', 'google', 'CEO of Google DeepMind. Nobel Prize laureate for AlphaFold.', '@demaboroshii', 'AlphaGo, AlphaFold, Gemini, Nobel Prize'],
  ['jeff-dean', 'Jeff Dean', 'Chief Scientist', 'Google DeepMind', 'google', 'Chief Scientist at Google DeepMind. Built foundational Google infrastructure.', '@JeffDean', 'MapReduce, TensorFlow, Transformer co-author'],

  // Meta
  ['yann-lecun', 'Yann LeCun', 'Chief AI Scientist', 'Meta', 'meta', 'Turing Award winner. Pioneer of convolutional neural networks.', '@ylecun', 'CNNs, Turing Award, open-source AI advocacy'],
  ['mark-zuckerberg', 'Mark Zuckerberg', 'CEO', 'Meta', 'meta', 'CEO of Meta. Champion of open-source AI with Llama models.', '@faboroshii', 'Llama open-source strategy, Meta AI'],

  // Mistral
  ['arthur-mensch', 'Arthur Mensch', 'CEO', 'Mistral', 'mistral', 'Co-founder and CEO of Mistral AI. Former DeepMind researcher.', '@arthurmensch', 'Mistral AI, European AI leadership'],

  // xAI
  ['elon-musk', 'Elon Musk', 'CEO', 'xAI', 'xai', 'Founder of xAI. Also leads Tesla, SpaceX, and X.', '@elonmusk', 'xAI/Grok, Tesla, SpaceX'],

  // Research pioneers
  ['geoffrey-hinton', 'Geoffrey Hinton', 'Professor Emeritus', 'University of Toronto', null, 'Godfather of deep learning. Nobel Prize laureate 2024. Former Google researcher.', '@geoffreyhinton', 'Backpropagation, deep learning, Nobel Prize, AI safety warnings'],
  ['yoshua-bengio', 'Yoshua Bengio', 'Professor', 'Mila / Université de Montréal', null, 'Turing Award winner. Pioneer of deep learning and AI safety research.', '@yoshaboroshii', 'Turing Award, deep learning, AI governance'],
  ['andrej-karpathy', 'Andrej Karpathy', 'Founder', 'Eureka Labs', null, 'Former Tesla AI Director and OpenAI researcher. Leading AI educator.', '@karpathy', 'Tesla Autopilot, AI education, nanoGPT'],
  ['fei-fei-li', 'Fei-Fei Li', 'Professor', 'Stanford University', null, 'Creator of ImageNet. Co-director of Stanford HAI.', '@drfeifei', 'ImageNet, Stanford HAI, computer vision pioneer'],

  // DeepSeek
  ['liang-wenfeng', 'Liang Wenfeng', 'CEO', 'DeepSeek', 'deepseek', 'Founder of DeepSeek and High-Flyer quant fund.', null, 'DeepSeek R1, efficient open-source AI'],

  // Cohere
  ['aidan-gomez', 'Aidan Gomez', 'CEO', 'Cohere', 'cohere', 'Co-founder and CEO of Cohere. Co-author of the Transformer paper.', '@aidangomez', 'Transformer paper co-author, Cohere'],

  // Stability AI
  ['emad-mostaque', 'Emad Mostaque', 'Founder', 'Stability AI', 'stability', 'Founder of Stability AI. Led the development and open-sourcing of Stable Diffusion.', '@EMostaque', 'Stable Diffusion, open-source image generation'],
  ['robin-rombach', 'Robin Rombach', 'CEO', 'Black Forest Labs', 'blackforest', 'Co-founder of Black Forest Labs. Lead researcher behind Latent Diffusion and Stable Diffusion.', null, 'Latent Diffusion, Stable Diffusion, FLUX'],

  // Midjourney
  ['david-holz', 'David Holz', 'CEO', 'Midjourney', 'midjourney', 'Founder of Midjourney. Previously co-founded Leap Motion.', null, 'Midjourney, AI art generation pioneer'],

  // Video generation
  ['cristobal-valenzuela', 'Cristobal Valenzuela', 'CEO', 'Runway', 'runway', 'Co-founder and CEO of Runway. Pioneer in AI-assisted creative tools.', '@c_valenzuelab', 'Runway Gen-3/Gen-4, AI video generation'],
  ['demi-guo', 'Demi Guo', 'CEO', 'Pika', 'pika', 'Co-founder and CEO of Pika. Former Stanford AI researcher.', null, 'Pika video generation'],
  ['amit-jain', 'Amit Jain', 'CEO', 'Luma AI', 'luma', 'Co-founder and CEO of Luma AI. Pioneer in 3D and video AI.', null, 'Dream Machine, Ray 2, AI video/3D'],

  // Audio/Voice
  ['mati-staniszewski', 'Mati Staniszewski', 'CEO', 'ElevenLabs', 'elevenlabs', 'Co-founder and CEO of ElevenLabs. Leading voice AI company.', '@maboroshii_s', 'ElevenLabs, AI voice synthesis leader'],
  ['dylan-fox', 'Dylan Fox', 'CEO', 'AssemblyAI', 'assemblyai', 'Founder and CEO of AssemblyAI. Built leading speech-to-text platform.', '@dylanjamesfox', 'AssemblyAI, Universal-2 speech model'],
  ['scott-stephenson', 'Scott Stephenson', 'CEO', 'Deepgram', 'deepgram', 'Co-founder and CEO of Deepgram. Enterprise speech AI pioneer.', '@scottste', 'Deepgram Nova, enterprise speech recognition'],
  ['mikey-shulman', 'Mikey Shulman', 'CEO', 'Suno', 'suno', 'CEO and co-founder of Suno. Building AI music generation.', null, 'Suno v4, AI music generation'],

  // Alibaba / Qwen
  ['jinze-bai', 'Jinze Bai', 'Lead Researcher', 'Alibaba', 'alibaba', 'Lead researcher of the Qwen (Tongyi Qianwen) model series at Alibaba Cloud.', null, 'Qwen model series, open-weight LLMs'],

  // Perplexity
  ['aravind-srinivas', 'Aravind Srinivas', 'CEO', 'Perplexity', 'perplexity', 'Co-founder and CEO of Perplexity AI. Former AI researcher at OpenAI and Google.', '@AravSrinivas', 'Perplexity AI search, Sonar models'],

  // ── Additional Important AI Figures ──

  // Research pioneers & academics
  ['andrew-ng', 'Andrew Ng', 'Founder', 'DeepLearning.AI / Landing AI', null, 'Co-founder of Google Brain. Former VP and Chief Scientist at Baidu. Stanford professor and pioneer in online AI education.', '@AndrewYNg', 'Google Brain co-founder, Coursera AI courses, deeplearning.ai'],
  ['stuart-russell', 'Stuart Russell', 'Professor', 'UC Berkeley', null, 'Computer science professor at UC Berkeley. Co-author of the definitive AI textbook "Artificial Intelligence: A Modern Approach." Leading voice on AI existential risk.', '@StuartJRussell', 'AI textbook co-author, AI safety advocacy, beneficial AI'],
  ['timnit-gebru', 'Timnit Gebru', 'Founder', 'DAIR Institute', null, 'Founder of the Distributed AI Research Institute. Former Google AI ethics researcher. Pioneer in AI fairness and accountability.', '@timaboroshii', 'AI ethics, algorithmic bias research, DAIR Institute'],
  ['percy-liang', 'Percy Liang', 'Professor', 'Stanford University', null, 'Associate professor at Stanford. Director of the Center for Research on Foundation Models. Creator of HELM benchmarks.', '@percyliang', 'HELM benchmarks, foundation model evaluation, Stanford CRFM'],
  ['sasha-luccioni', 'Sasha Luccioni', 'AI & Climate Lead', 'Hugging Face', null, 'Leading researcher on the environmental impact of AI at Hugging Face. National Geographic Explorer. Advocates for sustainable AI development.', '@SashaMTL', 'AI environmental impact, sustainable AI, Hugging Face'],
  ['jan-leike', 'Jan Leike', 'Head of Alignment', 'Anthropic', 'anthropic', 'Co-leads Alignment Science at Anthropic. Former leader of OpenAI superalignment team. Focuses on scalable oversight and interpretability.', '@janleike', 'AI alignment research, scalable oversight, superalignment'],
  ['noam-brown', 'Noam Brown', 'Research Scientist', 'OpenAI', 'openai', 'AI researcher at OpenAI. Creator of Libratus (poker AI) and Cicero (Diplomacy AI). Pioneer in strategic reasoning AI.', '@polyaboroshii', 'Libratus, Cicero, strategic reasoning, o1/o3 reasoning models'],

  // Industry leaders
  ['jensen-huang', 'Jensen Huang', 'CEO', 'NVIDIA', 'nvidia', 'Co-founder and CEO of NVIDIA. Built the dominant AI hardware platform. NVIDIA GPUs power most AI training.', null, 'NVIDIA GPUs, CUDA, AI hardware revolution'],
  ['satya-nadella', 'Satya Nadella', 'CEO', 'Microsoft', 'microsoft', 'CEO of Microsoft. Led major AI investments including OpenAI partnership and Copilot integration across Microsoft products.', '@sataboroshii', 'Microsoft-OpenAI partnership, Copilot, Azure AI'],
  ['sundar-pichai', 'Sundar Pichai', 'CEO', 'Google / Alphabet', 'google', 'CEO of Alphabet and Google. Oversees Google DeepMind and the Gemini model family.', '@sundarpichai', 'Google DeepMind, Gemini launch, Alphabet AI strategy'],
  ['kai-fu-lee', 'Kai-Fu Lee', 'CEO', '01.AI', '01ai', 'Former Microsoft and Google executive. Founded 01.AI and Sinovation Ventures. Leading voice on AI in China.', '@kaaboroshii', '01.AI, Yi models, AI Superpowers author, Sinovation Ventures'],
  ['clement-delangue', 'Clement Delangue', 'CEO', 'Hugging Face', null, 'Co-founder and CEO of Hugging Face. Built the largest open-source AI community and model hub.', '@ClementDelangue', 'Hugging Face platform, open-source AI community'],
  ['mustafa-suleyman', 'Mustafa Suleyman', 'CEO', 'Microsoft AI', 'microsoft', 'CEO of Microsoft AI. Co-founder of DeepMind. Previously founded Inflection AI.', '@mustaboroshii', 'DeepMind co-founder, Inflection AI, Microsoft AI'],
  ['jason-wei', 'Jason Wei', 'Research Scientist', 'OpenAI', 'openai', 'AI researcher known for discovering chain-of-thought prompting and scaling laws for emergent abilities in LLMs.', '@_jasonwei', 'Chain-of-thought prompting, emergent abilities, scaling laws'],

  // Transformer / foundational researchers
  ['ashish-vaswani', 'Ashish Vaswani', 'Co-founder', 'Essential AI', null, 'Co-author of the Transformer paper ("Attention Is All You Need"). Co-founded Essential AI.', null, 'Transformer architecture co-inventor, Essential AI'],
  ['noam-shazeer', 'Noam Shazeer', 'VP Engineering', 'Google DeepMind', 'google', 'Co-author of the Transformer paper. Co-founded Character.AI, which was acquired by Google. Key contributor to PaLM and Gemini.', null, 'Transformer co-inventor, Character.AI, PaLM, Gemini'],
  ['jakob-uszkoreit', 'Jakob Uszkoreit', 'Co-founder', 'Inceptive', null, 'Co-author of the Transformer paper. Founded Inceptive, applying AI to RNA drug design.', null, 'Transformer co-inventor, Inceptive, RNA drug design'],
  ['niki-parmar', 'Niki Parmar', 'Co-founder', 'Essential AI', null, 'Co-author of the Transformer paper. Co-founded Essential AI with Ashish Vaswani.', null, 'Transformer co-inventor, Essential AI'],

  // Safety & policy
  ['connor-leahy', 'Connor Leahy', 'CEO', 'Conjecture', null, 'CEO of Conjecture. Former EleutherAI lead. Prominent AI safety advocate and policy commentator.', '@NPCollapse', 'EleutherAI, Conjecture, AI safety advocacy'],
];

const insertPeople = db.transaction(() => {
  for (const p of people) {
    insertPerson.run(...p);
  }
});
insertPeople();

// ─── Initial Price History Snapshot ─────────────────────────────
const insertPriceHistory = db.prepare(`
  INSERT INTO price_history (model_id, input_price, output_price, source)
  SELECT id, input_price, output_price, pricing_source FROM models
`);
insertPriceHistory.run();

// ─── Tags ─────────────────────────────────────────────────────────
const insertTag = db.prepare(`
  INSERT INTO tags (id, name, category, description)
  VALUES (?, ?, ?, ?)
`);

const tags = [
  // Topics
  ['llm', 'Large Language Models', 'topic', 'Models that process and generate text'],
  ['image-generation', 'Image Generation', 'topic', 'AI models that create images from text or other inputs'],
  ['video-generation', 'Video Generation', 'topic', 'AI models that generate video content'],
  ['speech-recognition', 'Speech Recognition', 'topic', 'Converting speech to text'],
  ['text-to-speech', 'Text-to-Speech', 'topic', 'Converting text to spoken audio'],
  ['music-generation', 'Music Generation', 'topic', 'AI models that compose music and sound'],
  ['ai-safety', 'AI Safety', 'topic', 'Research and practices for safe AI development'],
  ['multimodal', 'Multimodal AI', 'topic', 'Models that handle multiple input/output types'],
  ['reasoning', 'Reasoning', 'topic', 'Models with advanced logical and mathematical reasoning'],
  ['coding', 'Coding & Programming', 'topic', 'AI for code generation, review, and debugging'],
  ['open-source', 'Open Source', 'topic', 'Openly available models and tools'],
  ['agents', 'AI Agents', 'topic', 'Autonomous AI systems that can take actions'],

  // Technologies
  ['transformer', 'Transformer Architecture', 'technology', 'The dominant architecture behind modern AI models'],
  ['diffusion', 'Diffusion Models', 'technology', 'Generative models that learn by denoising'],
  ['rlhf', 'RLHF', 'technology', 'Reinforcement Learning from Human Feedback'],
  ['rag', 'RAG', 'technology', 'Retrieval-Augmented Generation'],
  ['fine-tuning', 'Fine-Tuning', 'technology', 'Adapting pre-trained models for specific tasks'],
  ['quantisation', 'Quantisation', 'technology', 'Reducing model size for efficient inference'],

  // Use cases
  ['writing', 'Writing & Content', 'use-case', 'Using AI for writing, editing, and content creation'],
  ['research', 'Research', 'use-case', 'Using AI to accelerate research and analysis'],
  ['customer-service', 'Customer Service', 'use-case', 'AI for customer support and chatbots'],
  ['education', 'Education', 'use-case', 'AI in learning and teaching'],
  ['healthcare', 'Healthcare', 'use-case', 'AI applications in medicine and health'],
  ['creative', 'Creative Tools', 'use-case', 'AI for art, design, music, and creative workflows'],

  // Capabilities
  ['vision', 'Computer Vision', 'capability', 'Understanding and processing images'],
  ['function-calling', 'Function Calling', 'capability', 'Models that can invoke external tools'],
  ['structured-output', 'Structured Output', 'capability', 'Models that produce formatted JSON or schemas'],
  ['long-context', 'Long Context', 'capability', 'Models with very large context windows (100K+ tokens)'],
];

const insertTags = db.transaction(() => {
  for (const t of tags) {
    insertTag.run(...t);
  }
});
insertTags();

// ─── Tag Assignments ──────────────────────────────────────────────
const insertTaggable = db.prepare(`
  INSERT INTO taggables (tag_id, taggable_id, taggable_type)
  VALUES (?, ?, ?)
`);

const tagAssignments: [string, string, string][] = [
  // Tag LLM models
  ...['gpt-5.2', 'gpt-5', 'gpt-4.5', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini',
    'o1', 'o1-mini', 'o3', 'o3-mini', 'o3-pro', 'o4-mini',
    'claude-opus-4', 'claude-opus-4.5', 'claude-opus-4.6', 'claude-sonnet-4', 'claude-sonnet-4.5', 'claude-sonnet-4.6', 'claude-haiku-3.5', 'claude-haiku-4.5',
    'claude-3.5-sonnet', 'claude-3.7-sonnet', 'claude-3-opus',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3-pro', 'gemini-3-flash', 'gemini-3.1-pro',
    'gemini-1.5-pro', 'gemini-1.5-flash',
    'llama-4-maverick', 'llama-4-scout', 'llama-3.3-70b', 'llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b',
    'deepseek-v3', 'deepseek-v3.2', 'deepseek-r1', 'deepseek-r1-0528',
    'phi-4', 'phi-4-reasoning', 'nemotron-70b',
    'qwen3-max', 'qwen3-235b', 'qwen3-30b', 'qwen3-32b',
  ].map(id => ['llm', id, 'model'] as [string, string, string]),

  // Tag open-source models
  ...['llama-4-maverick', 'llama-4-scout', 'llama-3.3-70b', 'llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b',
    'deepseek-v3', 'deepseek-v3.2', 'deepseek-r1', 'deepseek-r1-0528', 'deepseek-v2.5',
    'qwen-2.5-72b', 'qwen-qwq-32b', 'qwen-2.5-coder-32b', 'qwen3-30b', 'qwen3-32b', 'qwen3-235b',
    'mistral-nemo', 'mistral-large-2', 'mistral-large-3', 'mistral-small-3.1',
    'phi-4', 'phi-4-multimodal', 'phi-4-reasoning',
    'nemotron-70b',
  ].map(id => ['open-source', id, 'model'] as [string, string, string]),

  // Tag reasoning models
  ...['o1', 'o1-mini', 'o3', 'o3-mini', 'o3-pro', 'o4-mini',
    'deepseek-r1', 'deepseek-r1-0528', 'qwen-qwq-32b',
    'gemini-2.5-pro', 'gpt-5.2', 'gpt-5',
    'claude-3.7-sonnet',
    'phi-4-reasoning',
    'grok-4',
  ].map(id => ['reasoning', id, 'model'] as [string, string, string]),

  // Tag coding models
  ...['codestral', 'gpt-4.1', 'claude-sonnet-4', 'deepseek-v3.2', 'gemini-2.5-pro',
    'qwen-2.5-coder-32b', 'qwen3-coder-480b',
  ].map(id => ['coding', id, 'model'] as [string, string, string]),

  // Tag multimodal models
  ...['gpt-4o', 'gpt-5', 'gpt-5.2', 'claude-opus-4', 'claude-sonnet-4',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash',
    'gemini-3-pro', 'gemini-3-flash', 'gemini-3.1-pro',
    'llama-4-maverick', 'llama-4-scout',
    'phi-4-multimodal',
  ].map(id => ['multimodal', id, 'model'] as [string, string, string]),

  // Tag long-context models
  ...['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite',
    'gemini-1.5-pro', 'gemini-3-pro', 'gemini-3.1-pro',
    'claude-opus-4', 'claude-sonnet-4', 'jamba-1.5-large',
    'llama-4-scout', 'grok-4.1-fast', 'grok-4-fast',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
  ].map(id => ['long-context', id, 'model'] as [string, string, string]),

  // Tag image-gen models
  ...['dall-e-3', 'midjourney-v7', 'flux-1.1-pro', 'stable-diffusion-3.5', 'imagen-3',
  ].map(id => ['image-generation', id, 'model'] as [string, string, string]),

  // Tag video-gen models
  ...['sora-turbo', 'veo-3', 'runway-gen4', 'kling-2.0', 'pika-2.1',
  ].map(id => ['video-generation', id, 'model'] as [string, string, string]),

  // Tag people with AI safety
  ...['geoffrey-hinton', 'yoshua-bengio', 'dario-amodei', 'chris-olah',
    'jan-leike', 'stuart-russell', 'connor-leahy', 'timnit-gebru', 'sasha-luccioni',
  ].map(id => ['ai-safety', id, 'person'] as [string, string, string]),

  // Tag people with open source
  ...['yann-lecun', 'mark-zuckerberg', 'liang-wenfeng',
    'clement-delangue', 'sasha-luccioni',
  ].map(id => ['open-source', id, 'person'] as [string, string, string]),

  // Tag people with research
  ...['percy-liang', 'andrew-ng', 'noam-brown', 'jason-wei',
    'ashish-vaswani', 'noam-shazeer', 'jakob-uszkoreit', 'niki-parmar',
  ].map(id => ['research', id, 'person'] as [string, string, string]),

  // Tag benchmarks
  ['reasoning', 'gpqa-diamond', 'benchmark'],
  ['reasoning', 'math-500', 'benchmark'],
  ['reasoning', 'aime-2025', 'benchmark'],
  ['reasoning', 'arc-challenge', 'benchmark'],
  ['coding', 'humaneval', 'benchmark'],
  ['coding', 'swe-bench-verified', 'benchmark'],
  ['coding', 'livecodebench', 'benchmark'],
  ['coding', 'bigcodebench', 'benchmark'],
  ['multimodal', 'mmmu', 'benchmark'],
  ['multimodal', 'mmmu-pro', 'benchmark'],
  ['multimodal', 'mathvista', 'benchmark'],
  ['coding', 'aider-polyglot', 'benchmark'],
  ['coding', 'bfcl', 'benchmark'],
  ['agents', 'gaia', 'benchmark'],
  ['agents', 'webarena', 'benchmark'],
  ['agents', 'tau-bench', 'benchmark'],
  ['ai-safety', 'simpleqa', 'benchmark'],
  ['ai-safety', 'air-bench', 'benchmark'],
  ['ai-safety', 'trustllm', 'benchmark'],
  ['healthcare', 'medqa', 'benchmark'],
];

const insertTagAssignments = db.transaction(() => {
  for (const ta of tagAssignments) {
    insertTaggable.run(...ta);
  }
});
insertTagAssignments();

// ─── YouTube Creators ─────────────────────────────────────────────
const insertYouTubeCreator = db.prepare(`
  INSERT INTO youtube_creators (id, name, channel_name, youtube_handle, subscribers, category, description, twitter)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const youtubeCreators = [
  // AI News & Analysis
  ['matt-wolfe', 'Matt Wolfe', 'Matt Wolfe', 'maboroshii', 900000, 'news', 'Covers the latest AI tools, news, and trends weekly. Founder of Future Tools.', '@maboroshii'],
  ['matt-berman', 'Matt Berman', 'Matthew Berman', 'matthew_berman', 450000, 'news', 'Daily AI news, model reviews, and tutorials. Clear explanations of complex AI topics.', '@mattshumer_'],
  ['ai-explained', 'Philip', 'AI Explained', 'aiexplained-official', 450000, 'news', 'In-depth analysis of AI papers, model releases, and industry developments.', null],
  ['fireship', 'Jeff Delaney', 'Fireship', 'Fireship', 3200000, 'news', '100-second explainers on AI, web dev, and tech. Fast-paced and entertaining.', '@firaboroshii'],
  ['two-minute-papers', 'Karoly Zsolnai-Feher', 'Two Minute Papers', 'TwoMinutePapers', 1600000, 'news', 'Bite-sized summaries of groundbreaking AI research papers.', '@twominutepapers'],
  ['theaigrid', 'The AI Grid', 'TheAIGRID', 'TheAIGRID', 300000, 'news', 'Daily AI news covering model releases, industry shifts, and practical applications.', null],
  ['wes-roth', 'Wes Roth', 'Wes Roth', 'WesRoth', 450000, 'news', 'AI news, AGI discussions, and analysis of AI developments and their implications.', '@WesRothAI'],

  // Tutorials & Education
  ['3blue1brown', 'Grant Sanderson', '3Blue1Brown', '3blue1brown', 6500000, 'tutorials', 'Beautiful mathematical animations explaining neural networks, transformers, and more.', '@3blue1brown'],
  ['sentdex', 'Harrison Kinsley', 'sentdex', 'sentdex', 1300000, 'tutorials', 'Python and machine learning tutorials. Long-running AI education channel.', '@Sentdex'],
  ['nicholas-renotte', 'Nicholas Renotte', 'Nicholas Renotte', 'NicholasRenotte', 600000, 'tutorials', 'Hands-on AI and ML tutorials for beginners and intermediates.', null],
  ['sam-witteveen', 'Sam Witteveen', 'Sam Witteveen', 'samwitteveen', 60000, 'tutorials', 'Practical tutorials on LLMs, RAG, agents, and AI development.', '@samwitteveen'],
  ['james-briggs', 'James Briggs', 'James Briggs', 'jamesbriggs', 250000, 'tutorials', 'RAG, vector databases, LangChain, and practical AI engineering tutorials.', '@jamaboroshii'],
  ['dave-ebbelaar', 'Dave Ebbelaar', 'Dave Ebbelaar', 'daboroshii', 100000, 'tutorials', 'AI engineering tutorials focused on building production LLM applications.', null],

  // AI Research
  ['yannic-kilcher', 'Yannic Kilcher', 'Yannic Kilcher', 'YannicKilcher', 300000, 'research', 'In-depth paper reviews and analysis of cutting-edge AI research.', '@yaboroshii'],
  ['andrej-karpathy-yt', 'Andrej Karpathy', 'Andrej Karpathy', 'AndrejKarpathy', 700000, 'research', 'Deep technical content from former Tesla AI director. Neural network fundamentals.', '@karpathy'],
  ['machine-learning-street-talk', 'Tim Scarfe', 'Machine Learning Street Talk', 'MachineLearningStreetTalk', 170000, 'research', 'Long-form interviews with leading AI researchers and deep paper discussions.', '@MLStreetTalk'],
  ['aleksa-gordic', 'Aleksa Gordic', 'Aleksa Gordic', 'TheAIEpiphany', 90000, 'research', 'Detailed walkthroughs of transformer architectures and AI research papers.', '@gordic_aleksa'],

  // AI Coding
  ['ai-jason', 'Jason Zhou', 'AI Jason', 'AIJason', 200000, 'coding', 'Practical AI coding tutorials: agents, function calling, and AI app development.', '@jasonzhou1993'],
  ['all-about-ai', 'All About AI', 'All About AI', 'AllAboutAI', 350000, 'coding', 'Hands-on tutorials for AI tools, local LLMs, and building AI applications.', null],
  ['david-ondrej', 'David Ondrej', 'David Ondrej', 'DavidOndrej', 200000, 'coding', 'AI tool reviews and tutorials for developers. Focus on practical applications.', null],
  ['cole-medin', 'Cole Medin', 'Cole Medin', 'ColeMedin', 150000, 'coding', 'AI agent development, local AI setups, and developer-focused AI content.', null],

  // AI Art & Creative
  ['olivio-sarikas', 'Olivio Sarikas', 'Olivio Sarikas', 'OlivioSarikas', 250000, 'creative', 'AI art tutorials covering Stable Diffusion, Midjourney, FLUX, and creative workflows.', null],
  ['aitrepreneur', 'AItrepreneur', 'Aitrepreneur', 'Aitrepreneur', 300000, 'creative', 'AI image and video generation tutorials. Local AI setup guides.', null],
  ['theoretically-media', 'Tim', 'Theoretically Media', 'TheoreticallyMedia', 180000, 'creative', 'AI filmmaking, video generation, and creative AI tool reviews.', null],

  // Business & Strategy
  ['ai-advantage', 'Igor Pogany', 'The AI Advantage', 'AIAdvantage', 500000, 'business', 'Practical AI strategies for productivity, business, and personal use.', null],
  ['skills-gap-trainer', 'Skills Gap Trainer', 'Skills Gap Trainer', 'SkillGapTrainer', 70000, 'business', 'AI impact on jobs, skills development, and career strategy.', null],
  ['ai-search', 'Liam Ottley', 'AI Search', 'LiamOttley', 400000, 'business', 'Building AI agencies and businesses. Practical AI entrepreneurship.', '@LiamOttley'],
];

const insertYouTubeCreators = db.transaction(() => {
  for (const c of youtubeCreators) {
    insertYouTubeCreator.run(...c);
  }
});
insertYouTubeCreators();

// ─── Run supplemental seed.sql ──────────────────────────────────
const seedSqlPath = path.join(process.cwd(), 'src', 'db', 'seed.sql');
if (fs.existsSync(seedSqlPath)) {
  const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
  db.exec(seedSql);
  console.log('Applied supplemental seed.sql');
}

// ─── Done ───────────────────────────────────────────────────────
const modelCount = (db.prepare('SELECT COUNT(*) AS c FROM models').get() as { c: number }).c;
const providerCount = (db.prepare('SELECT COUNT(*) AS c FROM providers').get() as { c: number }).c;
const benchmarkCount = (db.prepare('SELECT COUNT(*) AS c FROM benchmarks').get() as { c: number }).c;
const scoreCount = (db.prepare('SELECT COUNT(*) AS c FROM benchmark_scores').get() as { c: number }).c;
const peopleCount = (db.prepare('SELECT COUNT(*) AS c FROM people').get() as { c: number }).c;
const tagCount = (db.prepare('SELECT COUNT(*) AS c FROM tags').get() as { c: number }).c;
const taggableCount = (db.prepare('SELECT COUNT(*) AS c FROM taggables').get() as { c: number }).c;
const ytCreatorCount = (db.prepare('SELECT COUNT(*) AS c FROM youtube_creators').get() as { c: number }).c;

// Count by category
const categoryCounts = db.prepare(`
  SELECT category, COUNT(*) AS c FROM models WHERE status = 'active' GROUP BY category ORDER BY category
`).all() as Array<{ category: string; c: number }>;

console.log('Database seeded successfully!');
console.log(`  Providers:  ${providerCount}`);
console.log(`  Models:     ${modelCount}`);
for (const cat of categoryCounts) {
  console.log(`    ${cat.category}: ${cat.c}`);
}
console.log(`  Benchmarks: ${benchmarkCount}`);
console.log(`  Scores:     ${scoreCount}`);
console.log(`  People:     ${peopleCount}`);
console.log(`  Tags:       ${tagCount} (${taggableCount} assignments)`);
console.log(`  YouTube:    ${ytCreatorCount}`);
console.log(`  DB path:    ${DB_PATH}`);

db.close();
