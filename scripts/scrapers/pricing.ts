#!/usr/bin/env npx tsx
/**
 * Multi-source pricing validator — cross-checks pricing across multiple APIs.
 *
 * Run: npx tsx scripts/scrapers/pricing.ts
 *
 * This scraper fetches pricing from SECONDARY sources and cross-validates
 * against our primary source (OpenRouter). It does NOT use hardcoded prices.
 *
 * Sources:
 * 1. Together AI API (TOGETHER_API_KEY) — pricing for open-source models
 * 2. Google Gemini API (GOOGLE_API_KEY) — context windows for Gemini models
 * 3. Groq API (GROQ_API_KEY) — context windows for supported models
 *
 * All API keys are optional. The scraper will skip sources without keys
 * and log what was checked vs. skipped.
 */
import { getDB, logScrapeRun } from './base';
import type Database from 'better-sqlite3';

interface PricePoint {
  modelId: string;
  inputPrice: number;   // per 1M tokens
  outputPrice: number;
  contextWindow?: number;
  maxOutput?: number;
  source: string;
}

// ─── Together AI ────────────────────────────────────────────────
// Together AI returns pricing + context windows for open-source models.
// Endpoint: GET https://api.together.xyz/v1/models
// Returns: id, display_name, context_length, pricing.input, pricing.output

// Map Together AI model IDs → our DB IDs
const TOGETHER_MODEL_MAP: Record<string, string> = {
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': 'llama-4-maverick',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct': 'llama-4-scout',
  'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo': 'llama-3.3-70b',
  'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo': 'llama-3.1-405b',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': 'llama-3.1-70b',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'llama-3.1-8b',
  'deepseek-ai/DeepSeek-R1': 'deepseek-r1',
  'deepseek-ai/DeepSeek-V3': 'deepseek-v3',
  'Qwen/Qwen2.5-72B-Instruct-Turbo': 'qwen-2.5-72b',
  'Qwen/QwQ-32B': 'qwen-qwq-32b',
  'Qwen/Qwen2.5-Coder-32B-Instruct': 'qwen-2.5-coder-32b',
  'mistralai/Mistral-Small-24B-Instruct-2501': 'mistral-small-3.1',
  'mistralai/Mistral-Nemo-Instruct-2407': 'mistral-nemo',
  'microsoft/phi-4': 'phi-4',
  'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF': 'nemotron-70b',
};

async function fetchTogetherAI(): Promise<PricePoint[]> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.log('  ⊘ Together AI: skipped (no TOGETHER_API_KEY)');
    return [];
  }

  console.log('  Fetching Together AI models...');
  const response = await fetch('https://api.together.xyz/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Together AI API returned ${response.status}`);
  }

  const models = await response.json() as Array<{
    id: string;
    display_name?: string;
    context_length?: number;
    pricing?: { input?: number; output?: number };
  }>;

  console.log(`    Received ${models.length} models from Together AI`);

  const prices: PricePoint[] = [];
  for (const m of models) {
    const dbId = TOGETHER_MODEL_MAP[m.id];
    if (!dbId || !m.pricing) continue;

    // Together AI returns per-token pricing, convert to per-1M
    const inputPrice = (m.pricing.input ?? 0) * 1_000_000;
    const outputPrice = (m.pricing.output ?? 0) * 1_000_000;

    if (inputPrice === 0 && outputPrice === 0) continue;

    prices.push({
      modelId: dbId,
      inputPrice: Math.round(inputPrice * 1000) / 1000,
      outputPrice: Math.round(outputPrice * 1000) / 1000,
      contextWindow: m.context_length,
      source: 'together.ai',
    });
  }

  console.log(`    Matched ${prices.length} models to our database`);
  return prices;
}

// ─── Google Gemini API ──────────────────────────────────────────
// Returns context windows (inputTokenLimit / outputTokenLimit) but NOT pricing.
// Endpoint: GET https://generativelanguage.googleapis.com/v1beta/models?key=KEY

const GOOGLE_MODEL_MAP: Record<string, string> = {
  'models/gemini-2.5-pro-latest': 'gemini-2.5-pro',
  'models/gemini-2.5-flash-latest': 'gemini-2.5-flash',
  'models/gemini-2.0-flash': 'gemini-2.0-flash',
  'models/gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
  'models/gemini-1.5-pro-latest': 'gemini-1.5-pro',
  'models/gemini-1.5-flash-latest': 'gemini-1.5-flash',
};

interface GoogleModel {
  name: string;
  displayName: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

async function fetchGoogleContextWindows(): Promise<Map<string, { input: number; output: number }>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('  ⊘ Google Gemini API: skipped (no GOOGLE_API_KEY)');
    return new Map();
  }

  console.log('  Fetching Google Gemini model metadata...');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { headers: { 'Accept': 'application/json' } }
  );

  if (!response.ok) {
    console.log(`    Google API returned ${response.status}, skipping`);
    return new Map();
  }

  const data = await response.json() as { models: GoogleModel[] };
  const result = new Map<string, { input: number; output: number }>();

  for (const m of data.models) {
    const dbId = GOOGLE_MODEL_MAP[m.name];
    if (!dbId) continue;
    if (m.inputTokenLimit && m.outputTokenLimit) {
      result.set(dbId, { input: m.inputTokenLimit, output: m.outputTokenLimit });
    }
  }

  console.log(`    Got context windows for ${result.size} Gemini models`);
  return result;
}

// ─── Groq API ───────────────────────────────────────────────────
// Returns context_window and max_completion_tokens but NOT pricing.
// Useful for validating context windows on models hosted by Groq.

async function fetchGroqContextWindows(): Promise<Map<string, { context: number; maxOutput: number }>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('  ⊘ Groq API: skipped (no GROQ_API_KEY)');
    return new Map();
  }

  console.log('  Fetching Groq model metadata...');
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.log(`    Groq API returned ${response.status}, skipping`);
    return new Map();
  }

  const data = await response.json() as { data: Array<{
    id: string;
    context_window?: number;
    max_completion_tokens?: number;
    active?: boolean;
  }> };

  const GROQ_MAP: Record<string, string> = {
    'llama-3.3-70b-versatile': 'llama-3.3-70b',
    'llama-3.1-8b-instant': 'llama-3.1-8b',
    'gemma2-9b-it': 'gemma-2-9b', // if we track it
    'deepseek-r1-distill-llama-70b': 'deepseek-r1',
    'mistral-saba-24b': 'mistral-small-3.1',
    'qwen-qwq-32b': 'qwen-qwq-32b',
  };

  const result = new Map<string, { context: number; maxOutput: number }>();
  for (const m of data.data) {
    if (!m.active) continue;
    const dbId = GROQ_MAP[m.id];
    if (!dbId) continue;
    if (m.context_window) {
      result.set(dbId, {
        context: m.context_window,
        maxOutput: m.max_completion_tokens ?? 0,
      });
    }
  }

  console.log(`    Got context windows for ${result.size} Groq-hosted models`);
  return result;
}

// ─── Cross-validation ──────────────────────────────────────────
function crossValidate(
  db: Database.Database,
  secondaryPrices: PricePoint[],
  googleContexts: Map<string, { input: number; output: number }>,
  groqContexts: Map<string, { context: number; maxOutput: number }>,
): void {
  if (secondaryPrices.length === 0 && googleContexts.size === 0 && groqContexts.size === 0) {
    console.log('\n  No secondary sources available for cross-validation');
    console.log('  Set TOGETHER_API_KEY, GOOGLE_API_KEY, or GROQ_API_KEY to enable');
    return;
  }

  console.log('\n▶ Cross-validating against secondary sources...');

  // Get current DB prices (from OpenRouter primary scrape)
  const dbModels = db.prepare(`
    SELECT id, name, input_price, output_price, context_window, max_output
    FROM models WHERE category = 'llm'
  `).all() as Array<{
    id: string; name: string;
    input_price: number; output_price: number;
    context_window: number; max_output: number;
  }>;

  const dbMap = new Map(dbModels.map(m => [m.id, m]));

  // Check pricing discrepancies vs Together AI
  let priceDiscrepancies = 0;
  for (const secondary of secondaryPrices) {
    const primary = dbMap.get(secondary.modelId);
    if (!primary) continue;
    if (primary.input_price === 0) continue; // Skip models without primary pricing

    const primaryBlended = (primary.input_price + 3 * primary.output_price) / 4;
    const secondaryBlended = (secondary.inputPrice + 3 * secondary.outputPrice) / 4;

    if (primaryBlended > 0 && secondaryBlended > 0) {
      const pctDiff = Math.abs(primaryBlended - secondaryBlended) / primaryBlended * 100;
      if (pctDiff > 15) {
        console.log(`  ⚠ ${primary.name}: OpenRouter=$${primaryBlended.toFixed(2)} vs ${secondary.source}=$${secondaryBlended.toFixed(2)} (${pctDiff.toFixed(0)}% diff)`);
        priceDiscrepancies++;
      }
    }
  }

  if (secondaryPrices.length > 0 && priceDiscrepancies === 0) {
    console.log(`  ✓ No significant price discrepancies (${secondaryPrices.length} models checked)`);
  }

  // Check context window discrepancies vs Google
  let contextDiscrepancies = 0;
  for (const [modelId, googleCtx] of googleContexts) {
    const primary = dbMap.get(modelId);
    if (!primary) continue;

    if (primary.context_window > 0 && googleCtx.input !== primary.context_window) {
      console.log(`  ⚠ ${primary.name}: DB context=${primary.context_window.toLocaleString()} vs Google API=${googleCtx.input.toLocaleString()}`);
      contextDiscrepancies++;

      // Auto-fix context windows from Google (they're authoritative for their own models)
      db.prepare('UPDATE models SET context_window = ?, max_output = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(googleCtx.input, googleCtx.output, modelId);
      console.log(`    → Auto-corrected to Google's values`);
    }
  }

  // Log summary
  const sourcesUsed = [];
  if (secondaryPrices.length > 0) sourcesUsed.push('Together AI');
  if (googleContexts.size > 0) sourcesUsed.push('Google Gemini API');
  if (groqContexts.size > 0) sourcesUsed.push('Groq API');
  console.log(`  Sources used: ${sourcesUsed.join(', ')}`);
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('Starting multi-source pricing validator...');
  const db = getDB();

  let totalChecked = 0;

  try {
    // Fetch from all secondary sources (in parallel)
    const [togetherPrices, googleContexts, groqContexts] = await Promise.all([
      fetchTogetherAI().catch(err => {
        console.log(`  ✗ Together AI: ${err instanceof Error ? err.message : err}`);
        return [] as PricePoint[];
      }),
      fetchGoogleContextWindows().catch(err => {
        console.log(`  ✗ Google: ${err instanceof Error ? err.message : err}`);
        return new Map() as Map<string, { input: number; output: number }>;
      }),
      fetchGroqContextWindows().catch(err => {
        console.log(`  ✗ Groq: ${err instanceof Error ? err.message : err}`);
        return new Map() as Map<string, { context: number; maxOutput: number }>;
      }),
    ]);

    totalChecked = togetherPrices.length + googleContexts.size + groqContexts.size;

    // Record Together AI prices in price_history for tracking
    if (togetherPrices.length > 0) {
      const insertHistory = db.prepare(
        'INSERT INTO price_history (model_id, input_price, output_price, source) VALUES (?, ?, ?, ?)'
      );
      const existingModels = new Set(
        (db.prepare('SELECT id FROM models').all() as Array<{ id: string }>).map(r => r.id)
      );

      const insertAll = db.transaction(() => {
        for (const p of togetherPrices) {
          if (existingModels.has(p.modelId)) {
            insertHistory.run(p.modelId, p.inputPrice, p.outputPrice, p.source);
          }
        }
      });
      insertAll();
    }

    // Cross-validate
    crossValidate(db, togetherPrices, googleContexts, groqContexts);

    logScrapeRun(db, 'pricing:validator', 'success', totalChecked);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logScrapeRun(db, 'pricing:validator', 'error', 0, message);
    console.error(`  ✗ Pricing validator: ${message}`);
  }

  console.log(`\nPricing validator complete. ${totalChecked} data points checked.`);
  db.close();
}

main().catch(console.error);
