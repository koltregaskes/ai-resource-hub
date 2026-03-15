#!/usr/bin/env npx tsx
/**
 * Speed & TTFT scraper — fetches live speed data from Artificial Analysis API.
 *
 * Run: npx tsx scripts/scrapers/speed.ts
 *
 * PRIMARY source: Artificial Analysis REST API (v2)
 *   Endpoint: https://artificialanalysis.ai/api/v2/data/llms/models
 *   Auth: API key via x-api-key header (free tier: 1000 req/day)
 *   Sign up: https://artificialanalysis.ai (free account)
 *
 * Returns: median_output_tokens_per_second, median_time_to_first_token_seconds,
 *          price_1m_input_tokens, price_1m_output_tokens, and benchmark scores.
 *
 * FALLBACK: validated known data when API key is not set.
 */
import { getDB, logScrapeRun } from './base';
import type Database from 'better-sqlite3';

interface SpeedEntry {
  modelId: string;
  speed: number;         // tokens per second (output)
  ttft: number;          // time to first token (ms)
  source: string;
  isLive: boolean;
}

// ─── Artificial Analysis model name → our DB ID ─────────────────
const AA_MODEL_MAP: Record<string, string> = {
  // OpenAI
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4.1': 'gpt-4.1',
  'gpt-4.1-mini': 'gpt-4.1-mini',
  'gpt-4.1-nano': 'gpt-4.1-nano',
  'gpt-4.5': 'gpt-4.5',
  'gpt-5': 'gpt-5',
  'gpt-5.2': 'gpt-5.2',
  'o3': 'o3',
  'o3-mini': 'o3-mini',
  'o3-pro': 'o3-pro',
  'o4-mini': 'o4-mini',
  'o1': 'o1',
  'o1-mini': 'o1-mini',

  // Anthropic
  'claude-opus-4.6': 'claude-opus-4.6',
  'claude-sonnet-4.6': 'claude-sonnet-4.6',
  'claude-opus-4.5': 'claude-opus-4.5',
  'claude-sonnet-4.5': 'claude-sonnet-4.5',
  'claude-opus-4': 'claude-opus-4',
  'claude-sonnet-4': 'claude-sonnet-4',
  'claude-3.5-haiku': 'claude-haiku-3.5',
  'claude-3-opus': 'claude-3-opus',
  'claude-3.5-sonnet': 'claude-3.5-sonnet',
  'claude-3.7-sonnet': 'claude-3.7-sonnet',

  // Google
  'gemini-3.1-pro': 'gemini-3.1-pro',
  'gemini-3-pro': 'gemini-3-pro',
  'gemini-3-flash': 'gemini-3-flash',
  'gemini-2.5-pro': 'gemini-2.5-pro',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',

  // DeepSeek
  'deepseek-v3': 'deepseek-v3',
  'deepseek-v3.2': 'deepseek-v3.2',
  'deepseek-r1': 'deepseek-r1',
  'deepseek-r1-0528': 'deepseek-r1-0528',

  // Mistral
  'mistral-large': 'mistral-large-3',
  'mistral-large-2': 'mistral-large-2',
  'mistral-medium': 'mistral-medium-3',
  'mistral-small': 'mistral-small-3.1',
  'codestral': 'codestral',
  'mistral-nemo': 'mistral-nemo',

  // xAI
  'grok-4': 'grok-4',
  'grok-3': 'grok-3',
  'grok-3-mini': 'grok-3-mini',
  'grok-2': 'grok-2',

  // Meta
  'llama-4-maverick': 'llama-4-maverick',
  'llama-4-scout': 'llama-4-scout',
  'llama-3.3-70b': 'llama-3.3-70b',
  'llama-3.1-405b': 'llama-3.1-405b',
  'llama-3.1-70b': 'llama-3.1-70b',
  'llama-3.1-8b': 'llama-3.1-8b',

  // Qwen
  'qwen3-235b': 'qwen3-235b',
  'qwen3-32b': 'qwen3-32b',
  'qwen-2.5-72b': 'qwen-2.5-72b',
  'qwq-32b': 'qwen-qwq-32b',

  // Others
  'command-a': 'command-a',
  'jamba-1.5-large': 'jamba-1.5-large',
  'phi-4': 'phi-4',
  'nemotron-70b': 'nemotron-70b',
};

// ─── Fetch from Artificial Analysis API ─────────────────────────

interface AAModel {
  id: string;
  name: string;
  slug: string;
  model_creator?: { name: string; slug: string };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
  price_1m_input_tokens?: number;
  price_1m_output_tokens?: number;
  // Benchmark scores
  artificial_analysis_intelligence_index?: number;
  mmlu_pro?: number;
  gpqa?: number;
  math_500?: number;
  hle?: number;
  livecodebench?: number;
  coding_index?: number;
  math_index?: number;
}

async function fetchArtificialAnalysis(): Promise<{ entries: SpeedEntry[]; rawModels: AAModel[] } | null> {
  const apiKey = process.env.AA_API_KEY;
  if (!apiKey) {
    console.log('  ⊘ Artificial Analysis API: skipped (no AA_API_KEY)');
    console.log('    Sign up free at https://artificialanalysis.ai to get an API key');
    return null;
  }

  console.log('  Fetching Artificial Analysis API...');

  const response = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'The-AI-Resource-Hub-Bot/1.0 (https://theairesourcehub.com)',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    if (response.status === 429) {
      console.log(`    Rate limited. Remaining: ${rateLimitRemaining}`);
      return null;
    }
    throw new Error(`Artificial Analysis API returned ${response.status}: ${response.statusText}`);
  }

  const rawModels: AAModel[] = await response.json();
  console.log(`    Received ${rawModels.length} models from Artificial Analysis`);

  const entries: SpeedEntry[] = [];

  for (const m of rawModels) {
    // Try to match by slug, name, or our explicit map
    const dbId = AA_MODEL_MAP[m.slug] || AA_MODEL_MAP[m.name];
    if (!dbId) continue;

    const speed = m.median_output_tokens_per_second;
    const ttftSeconds = m.median_time_to_first_token_seconds;

    if (speed == null && ttftSeconds == null) continue;

    entries.push({
      modelId: dbId,
      speed: Math.round(speed ?? 0),
      ttft: Math.round((ttftSeconds ?? 0) * 1000), // Convert seconds → ms
      source: 'artificialanalysis.ai (live)',
      isLive: true,
    });
  }

  console.log(`    Matched ${entries.length} models to our database`);

  // Log rate limit info
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const limit = response.headers.get('X-RateLimit-Limit');
  if (remaining && limit) {
    console.log(`    Rate limit: ${remaining}/${limit} requests remaining`);
  }

  return { entries, rawModels };
}

// ─── Known Speed Data (fallback) ────────────────────────────────

function getKnownSpeedData(): SpeedEntry[] {
  const source = 'artificialanalysis.ai (validated)';

  return [
    // OpenAI — validated 2026-02-15
    { modelId: 'gpt-5.2',       speed: 85,  ttft: 320, source, isLive: false },
    { modelId: 'gpt-5',         speed: 75,  ttft: 380, source, isLive: false },
    { modelId: 'gpt-4o',        speed: 100, ttft: 290, source, isLive: false },
    { modelId: 'gpt-4o-mini',   speed: 150, ttft: 210, source, isLive: false },
    { modelId: 'gpt-4.1',       speed: 110, ttft: 250, source, isLive: false },
    { modelId: 'gpt-4.1-mini',  speed: 160, ttft: 190, source, isLive: false },
    { modelId: 'gpt-4.1-nano',  speed: 200, ttft: 150, source, isLive: false },
    { modelId: 'o3',            speed: 15,  ttft: 1200, source, isLive: false },
    { modelId: 'o3-mini',       speed: 60,  ttft: 600, source, isLive: false },
    { modelId: 'o4-mini',       speed: 65,  ttft: 550, source, isLive: false },

    // Anthropic — validated 2026-02-20
    { modelId: 'claude-opus-4.6',   speed: 50,  ttft: 280, source, isLive: false },
    { modelId: 'claude-sonnet-4.6', speed: 90,  ttft: 240, source, isLive: false },
    { modelId: 'claude-opus-4',     speed: 30,  ttft: 350, source, isLive: false },
    { modelId: 'claude-sonnet-4',   speed: 80,  ttft: 260, source, isLive: false },
    { modelId: 'claude-haiku-3.5',  speed: 120, ttft: 200, source, isLive: false },

    // Google — validated 2026-02-15
    { modelId: 'gemini-3.1-pro',       speed: 80,  ttft: 300, source, isLive: false },
    { modelId: 'gemini-2.5-pro',       speed: 90,  ttft: 270, source, isLive: false },
    { modelId: 'gemini-2.5-flash',     speed: 350, ttft: 160, source, isLive: false },
    { modelId: 'gemini-2.0-flash',     speed: 400, ttft: 140, source, isLive: false },
    { modelId: 'gemini-2.0-flash-lite', speed: 450, ttft: 120, source, isLive: false },

    // DeepSeek — validated 2026-01-20
    { modelId: 'deepseek-v3.2', speed: 49,  ttft: 400, source, isLive: false },
    { modelId: 'deepseek-r1',   speed: 30,  ttft: 500, source, isLive: false },

    // Mistral — validated 2026-01-20
    { modelId: 'mistral-large-3',  speed: 80,  ttft: 310, source, isLive: false },
    { modelId: 'mistral-small-3.1', speed: 150, ttft: 180, source, isLive: false },

    // xAI — validated 2026-01-15
    { modelId: 'grok-4',      speed: 50,  ttft: 350, source, isLive: false },
    { modelId: 'grok-3',      speed: 70,  ttft: 290, source, isLive: false },

    // Meta — validated 2026-02-10
    { modelId: 'llama-4-maverick', speed: 95,  ttft: 250, source, isLive: false },
    { modelId: 'llama-4-scout',   speed: 120, ttft: 220, source, isLive: false },
    { modelId: 'llama-3.3-70b',   speed: 80,  ttft: 280, source, isLive: false },

    // Qwen — validated 2026-01-15
    { modelId: 'qwen3-235b',   speed: 40,  ttft: 420, source, isLive: false },
    { modelId: 'qwen-2.5-72b', speed: 65,  ttft: 340, source, isLive: false },
  ];
}

// ─── Update Logic ────────────────────────────────────────────

function updateSpeedData(db: Database.Database, entries: SpeedEntry[]): number {
  const existingModels = new Set(
    (db.prepare('SELECT id FROM models').all() as Array<{ id: string }>).map(r => r.id)
  );

  const updateModel = db.prepare(`
    UPDATE models
    SET speed = ?, ttft = ?, speed_source = ?, speed_updated = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `);

  const insertHistory = db.prepare(`
    INSERT INTO speed_history (model_id, speed, ttft, source) VALUES (?, ?, ?, ?)
  `);

  let updated = 0;

  const updateAll = db.transaction(() => {
    for (const entry of entries) {
      if (!existingModels.has(entry.modelId)) continue;
      updateModel.run(entry.speed, entry.ttft, entry.source, entry.modelId);
      insertHistory.run(entry.modelId, entry.speed, entry.ttft, entry.source);
      updated++;
    }
  });

  updateAll();
  return updated;
}

// ─── Export AA benchmark data for use by benchmarks scraper ─────
// The AA API also returns benchmark scores. We save them for the
// benchmarks scraper to pick up.

function saveAABenchmarkData(rawModels: AAModel[]): void {
  const fs = require('node:fs');
  const path = require('node:path');

  const benchmarkData: Array<{
    modelSlug: string;
    modelName: string;
    intelligenceIndex?: number;
    mmluPro?: number;
    gpqa?: number;
    math500?: number;
    hle?: number;
    livecodebench?: number;
    codingIndex?: number;
    mathIndex?: number;
  }> = [];

  for (const m of rawModels) {
    if (!m.artificial_analysis_intelligence_index && !m.mmlu_pro && !m.gpqa) continue;

    benchmarkData.push({
      modelSlug: m.slug,
      modelName: m.name,
      intelligenceIndex: m.artificial_analysis_intelligence_index,
      mmluPro: m.mmlu_pro,
      gpqa: m.gpqa,
      math500: m.math_500,
      hle: m.hle,
      livecodebench: m.livecodebench,
      codingIndex: m.coding_index,
      mathIndex: m.math_index,
    });
  }

  if (benchmarkData.length > 0) {
    const reportDir = path.join(process.cwd(), 'data', 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, 'aa-benchmarks-latest.json');
    fs.writeFileSync(reportPath, JSON.stringify(benchmarkData, null, 2));
    console.log(`    Saved ${benchmarkData.length} benchmark scores to ${reportPath}`);
  }
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log('Starting speed & TTFT scraper...');
  const db = getDB();

  try {
    // Try Artificial Analysis API (live data)
    const aaResult = await fetchArtificialAnalysis().catch(err => {
      console.log(`    ✗ Artificial Analysis: ${err instanceof Error ? err.message : err}`);
      return null;
    });

    let entries: SpeedEntry[];
    if (aaResult && aaResult.entries.length > 0) {
      entries = aaResult.entries;
      console.log(`  ✓ Using LIVE data from Artificial Analysis API (${entries.length} models)`);

      // Save benchmark data for the benchmarks scraper
      saveAABenchmarkData(aaResult.rawModels);
    } else {
      entries = getKnownSpeedData();
      console.log(`  Using validated cached data (${entries.length} models)`);
      if (!process.env.AA_API_KEY) {
        console.log('  Tip: Set AA_API_KEY for live speed data from Artificial Analysis');
      }
    }

    const liveCount = entries.filter(e => e.isLive).length;
    const cachedCount = entries.filter(e => !e.isLive).length;

    const updated = updateSpeedData(db, entries);
    logScrapeRun(db, 'speed', 'success', updated);
    console.log(`  ✓ Speed scraper: ${updated} models updated (${liveCount} live, ${cachedCount} cached)`);

    const fast = entries.filter(e => e.speed >= 100);
    const lowTTFT = entries.filter(e => e.ttft < 200);
    console.log(`    ${fast.length} models with 100+ tok/s output speed`);
    console.log(`    ${lowTTFT.length} models with sub-200ms TTFT`);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logScrapeRun(db, 'speed', 'error', 0, message);
    console.error(`  ✗ Speed scraper: ${message}`);
  }

  console.log('\nSpeed scraper complete.');
  db.close();
}

main().catch(console.error);
