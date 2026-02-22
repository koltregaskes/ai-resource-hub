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

  CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider_id);
  CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
  CREATE INDEX IF NOT EXISTS idx_benchmark_scores_model ON benchmark_scores(model_id);
  CREATE INDEX IF NOT EXISTS idx_benchmark_scores_benchmark ON benchmark_scores(benchmark_id);
  CREATE INDEX IF NOT EXISTS idx_price_history_model ON price_history(model_id);
  CREATE INDEX IF NOT EXISTS idx_people_provider ON people(provider_id);
`);

// ─── Providers ──────────────────────────────────────────────────
const insertProvider = db.prepare(`
  INSERT INTO providers (id, name, colour, website, description, founded, headquarters, ceo, funding)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const providers = [
  ['openai', 'OpenAI', '#10a37f', 'https://openai.com', 'Creator of GPT and ChatGPT. Pioneer in large language models and AI safety research.', '2015-12-11', 'San Francisco, CA', 'Sam Altman', '$13B+'],
  ['anthropic', 'Anthropic', '#d97706', 'https://anthropic.com', 'AI safety company building Claude. Founded by former OpenAI researchers.', '2021-01-28', 'San Francisco, CA', 'Dario Amodei', '$7.6B+'],
  ['google', 'Google', '#4285f4', 'https://deepmind.google', 'Google DeepMind, creator of Gemini models. Merged from Google Brain and DeepMind.', '2010-01-01', 'London / Mountain View', 'Demis Hassabis', 'Alphabet subsidiary'],
  ['meta', 'Meta', '#0668e1', 'https://ai.meta.com', 'Creator of Llama open-weight models. Committed to open-source AI development.', '2013-09-01', 'Menlo Park, CA', 'Mark Zuckerberg', 'Meta subsidiary'],
  ['mistral', 'Mistral', '#ff7000', 'https://mistral.ai', 'French AI lab building efficient open and commercial models.', '2023-04-01', 'Paris, France', 'Arthur Mensch', '€600M+'],
  ['xai', 'xAI', '#1da1f2', 'https://x.ai', 'Elon Musk\'s AI company building Grok models.', '2023-07-12', 'Austin, TX', 'Elon Musk', '$6B+'],
  ['deepseek', 'DeepSeek', '#5b6ef7', 'https://deepseek.com', 'Chinese AI lab known for efficient open-weight models with strong reasoning.', '2023-07-01', 'Hangzhou, China', 'Liang Wenfeng', 'High-Flyer Capital'],
  ['amazon', 'Amazon', '#ff9900', 'https://aws.amazon.com/bedrock', 'Amazon\'s Nova foundation models, available through AWS Bedrock.', '1994-07-05', 'Seattle, WA', 'Andy Jassy', 'Amazon subsidiary'],
  ['cohere', 'Cohere', '#39c0ed', 'https://cohere.com', 'Enterprise-focused AI company building Command models with RAG capabilities.', '2019-01-01', 'Toronto, Canada', 'Aidan Gomez', '$445M+'],
  ['alibaba', 'Alibaba', '#ff6a00', 'https://www.alibabacloud.com/solutions/generative-ai', 'Creator of Qwen (Tongyi Qianwen) series of open-weight models.', '2023-04-01', 'Hangzhou, China', 'Daniel Zhang', 'Alibaba subsidiary'],
  ['ai21', 'AI21 Labs', '#6c5ce7', 'https://www.ai21.com', 'Creator of Jamba models using Mamba-Transformer hybrid architecture.', '2017-01-01', 'Tel Aviv, Israel', 'Yoav Shoham', '$336M'],
  ['zhipu', 'Zhipu AI', '#00b4d8', 'https://www.zhipuai.cn', 'Chinese AI company building GLM series models.', '2019-01-01', 'Beijing, China', 'Tang Jie', '$400M+'],
  ['minimax', 'MiniMax', '#e040fb', 'https://www.minimaxi.com', 'Chinese AI company building multimodal models and applications.', '2021-12-01', 'Shanghai, China', 'Yan Junjie', '$600M+'],
  ['perplexity', 'Perplexity', '#20b2aa', 'https://www.perplexity.ai', 'AI-powered search engine with its own Sonar models.', '2022-08-01', 'San Francisco, CA', 'Aravind Srinivas', '$500M+'],
  ['reka', 'Reka', '#e74c3c', 'https://www.reka.ai', 'Multimodal AI lab building natively multimodal models.', '2023-01-01', 'London, UK', 'Dani Yogatama', '$58M'],

  // Image generation providers
  ['stability', 'Stability AI', '#a855f7', 'https://stability.ai', 'Creator of Stable Diffusion open-source image generation models.', '2019-01-01', 'London, UK', 'Prem Akkaraju', '$200M+'],
  ['midjourney', 'Midjourney', '#5865f2', 'https://midjourney.com', 'Independent research lab producing top-tier AI image generation.', '2021-08-01', 'San Francisco, CA', 'David Holz', 'Self-funded'],
  ['blackforest', 'Black Forest Labs', '#1a1a2e', 'https://blackforestlabs.ai', 'Created FLUX image generation models. Founded by ex-Stability AI researchers.', '2024-03-01', 'Freiburg, Germany', 'Robin Rombach', '$31M'],
  ['ideogram', 'Ideogram', '#ff6b6b', 'https://ideogram.ai', 'AI image generation specialising in text rendering within images.', '2023-08-01', 'Toronto, Canada', 'Mohammad Norouzi', '$80M+'],
  ['leonardo', 'Leonardo AI', '#9333ea', 'https://leonardo.ai', 'AI image and video generation platform for creative professionals.', '2022-01-01', 'Sydney, Australia', 'JJ Fiasson', '$31M'],

  // Video generation providers
  ['runway', 'Runway', '#00d4ff', 'https://runwayml.com', 'AI creative suite. Pioneer in AI video generation with Gen-3 Alpha.', '2018-01-01', 'New York, NY', 'Cristóbal Valenzuela', '$237M+'],
  ['pika', 'Pika', '#ff00ff', 'https://pika.art', 'AI video generation startup known for creative video effects.', '2023-04-01', 'Palo Alto, CA', 'Demi Guo', '$135M+'],
  ['luma', 'Luma AI', '#7c3aed', 'https://lumalabs.ai', 'Creator of Dream Machine for AI video and 3D generation.', '2021-01-01', 'Palo Alto, CA', 'Amit Jain', '$43M+'],
  ['kling', 'Kling AI', '#ff4500', 'https://klingai.com', 'Kuaishou\'s AI video generation platform with impressive motion quality.', '2023-01-01', 'Beijing, China', 'Su Hua', 'Kuaishou subsidiary'],
  ['hailuo', 'Hailuo AI', '#00bcd4', 'https://hailuoai.com', 'MiniMax\'s consumer video generation platform.', '2024-01-01', 'Shanghai, China', 'Yan Junjie', 'MiniMax subsidiary'],
  ['veo', 'Google Veo', '#34a853', 'https://deepmind.google/technologies/veo', 'Google DeepMind\'s video generation model family.', '2024-05-01', 'London, UK', 'Demis Hassabis', 'Alphabet subsidiary'],

  // Audio, speech, voice, and sound providers
  ['elevenlabs', 'ElevenLabs', '#2563eb', 'https://elevenlabs.io', 'Leading AI voice synthesis and cloning platform. Realistic speech generation.', '2022-01-01', 'New York, NY', 'Mati Staniszewski', '$101M+'],
  ['assemblyai', 'AssemblyAI', '#ef4444', 'https://www.assemblyai.com', 'AI speech-to-text and audio intelligence API platform.', '2017-01-01', 'San Francisco, CA', 'Dylan Fox', '$115M'],
  ['deepgram', 'Deepgram', '#13ef93', 'https://deepgram.com', 'Enterprise speech recognition and text-to-speech AI.', '2015-01-01', 'San Francisco, CA', 'Scott Stephenson', '$86M+'],
  ['cartesia', 'Cartesia', '#6366f1', 'https://cartesia.ai', 'State-space model AI for ultra-low-latency voice synthesis.', '2023-01-01', 'San Francisco, CA', 'Karan Goel', '$27M'],
  ['suno', 'Suno', '#f97316', 'https://suno.com', 'AI music and sound generation platform. Create full songs from text.', '2023-01-01', 'Cambridge, MA', 'Mikey Shulman', '$125M+'],
  ['udio', 'Udio', '#8b5cf6', 'https://udio.com', 'AI music generation with high-quality audio output.', '2024-01-01', 'New York, NY', 'David Ding', '$10M+'],
  ['resemble', 'Resemble AI', '#f43f5e', 'https://www.resemble.ai', 'AI voice cloning and synthesis for enterprises.', '2019-01-01', 'Toronto, Canada', 'Zohaib Ahmed', '$28M'],
  ['play-ht', 'PlayHT', '#0ea5e9', 'https://play.ht', 'AI voice generation platform with natural conversational voices.', '2016-01-01', 'San Francisco, CA', 'Hammad Syed', '$20M+'],
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

// ─── Done ───────────────────────────────────────────────────────
const modelCount = (db.prepare('SELECT COUNT(*) AS c FROM models').get() as { c: number }).c;
const providerCount = (db.prepare('SELECT COUNT(*) AS c FROM providers').get() as { c: number }).c;
const benchmarkCount = (db.prepare('SELECT COUNT(*) AS c FROM benchmarks').get() as { c: number }).c;
const scoreCount = (db.prepare('SELECT COUNT(*) AS c FROM benchmark_scores').get() as { c: number }).c;
const peopleCount = (db.prepare('SELECT COUNT(*) AS c FROM people').get() as { c: number }).c;

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
console.log(`  DB path:    ${DB_PATH}`);

db.close();
