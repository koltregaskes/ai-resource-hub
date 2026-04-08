#!/usr/bin/env npx tsx
/**
 * OpenRouter API scraper — PRIMARY data source for live pricing.
 *
 * Run: npx tsx scripts/scrapers/openrouter.ts
 *
 * OpenRouter aggregates 400+ models from all major providers with real-time
 * pricing data. No API key required for the models endpoint.
 *
 * This scraper:
 * 1. Fetches live pricing for all mapped models
 * 2. Detects NEW models not yet in our database
 * 3. Writes a new-models report for manual review
 *
 * Pricing format: OpenRouter returns per-token costs as strings.
 * We convert to per-1M-tokens (our standard format).
 */
import { getDB, upsertModels, logScrapeRun, type ScrapedModel } from './base';
import fs from 'node:fs';
import path from 'node:path';
import {
  PROVIDER_PREFIX_MAP,
  deriveModelIdFromOpenRouterId,
  findCatalogModelByAlias,
  getOpenRouterModelMap,
  getWatchedProviderPrefixes,
} from '../model-catalog';

// ─── OpenRouter API types ──────────────────────────────────────
interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
    input_cache_read?: string;
    input_cache_write?: string;
    web_search?: string;
    internal_reasoning?: string;
  };
  context_length: number;
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    tokenizer?: string;
    instruct_type?: string;
  };
  created?: number;
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

// ─── Model ID mapping ──────────────────────────────────────────
// Maps OpenRouter model IDs to our database model IDs.
// This is the COMPLETE mapping for all ~99 LLM models we track.
// OpenRouter IDs use the format "provider/model-name".
// Our DB IDs are simpler slugs.
//
// When OpenRouter lists a model we DON'T have here, it gets reported
// as a new/untracked model in the detection report.
const LEGACY_MODEL_MAP: Record<string, string> = {
  // ── OpenAI ───────────────────────────────────────────────────
  'openai/gpt-4o': 'gpt-4o',
  'openai/gpt-4o-mini': 'gpt-4o-mini',
  'openai/gpt-4.1': 'gpt-4.1',
  'openai/gpt-4.1-mini': 'gpt-4.1-mini',
  'openai/gpt-4.1-nano': 'gpt-4.1-nano',
  'openai/gpt-4.5-preview': 'gpt-4.5',
  'openai/gpt-5': 'gpt-5',
  'openai/gpt-5-pro': 'gpt-5-pro',
  'openai/gpt-5-nano': 'gpt-5-nano',
  'openai/gpt-5.2': 'gpt-5.2',
  'openai/gpt-5.2-pro': 'gpt-5.2-pro',
  'openai/o1': 'o1',
  'openai/o1-mini': 'o1-mini',
  'openai/o3': 'o3',
  'openai/o3-mini': 'o3-mini',
  'openai/o3-pro': 'o3-pro',
  'openai/o4-mini': 'o4-mini',

  // ── Anthropic ────────────────────────────────────────────────
  'anthropic/claude-3-opus': 'claude-3-opus',
  'anthropic/claude-3.5-sonnet': 'claude-3.5-sonnet',
  'anthropic/claude-3.7-sonnet': 'claude-3.7-sonnet',
  'anthropic/claude-3.5-haiku': 'claude-haiku-3.5',
  'anthropic/claude-haiku-4': 'claude-haiku-4',
  'anthropic/claude-haiku-4.5': 'claude-haiku-4.5',
  'anthropic/claude-opus-4': 'claude-opus-4',
  'anthropic/claude-sonnet-4': 'claude-sonnet-4',
  'anthropic/claude-opus-4.5': 'claude-opus-4.5',
  'anthropic/claude-sonnet-4.5': 'claude-sonnet-4.5',
  'anthropic/claude-opus-4.6': 'claude-opus-4.6',
  'anthropic/claude-sonnet-4.6': 'claude-sonnet-4.6',

  // ── Google ───────────────────────────────────────────────────
  'google/gemini-1.5-pro': 'gemini-1.5-pro',
  'google/gemini-1.5-flash': 'gemini-1.5-flash',
  'google/gemini-2.0-flash': 'gemini-2.0-flash',
  'google/gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
  'google/gemini-3-pro': 'gemini-3-pro',
  'google/gemini-3-flash': 'gemini-3-flash',
  'google/gemini-3.1-pro': 'gemini-3.1-pro',

  // ── Meta / Llama ─────────────────────────────────────────────
  'meta-llama/llama-4-maverick': 'llama-4-maverick',
  'meta-llama/llama-4-scout': 'llama-4-scout',
  'meta-llama/llama-3.3-70b-instruct': 'llama-3.3-70b',
  'meta-llama/llama-3.1-405b-instruct': 'llama-3.1-405b',
  'meta-llama/llama-3.1-70b-instruct': 'llama-3.1-70b',
  'meta-llama/llama-3.1-8b-instruct': 'llama-3.1-8b',

  // ── DeepSeek ─────────────────────────────────────────────────
  'deepseek/deepseek-chat': 'deepseek-v3',
  'deepseek/deepseek-chat-v3-0324': 'deepseek-v3.2',
  'deepseek/deepseek-r1': 'deepseek-r1',
  'deepseek/deepseek-r1-0528': 'deepseek-r1-0528',
  'deepseek/deepseek-chat-v2.5': 'deepseek-v2.5',

  // ── Mistral ──────────────────────────────────────────────────
  'mistralai/mistral-large': 'mistral-large-3',
  'mistralai/mistral-large-2407': 'mistral-large-2',
  'mistralai/mistral-medium': 'mistral-medium-3',
  'mistralai/mistral-small': 'mistral-small-3.1',
  'mistralai/codestral': 'codestral',
  'mistralai/codestral-2501': 'codestral-25.01',
  'mistralai/mistral-nemo': 'mistral-nemo',
  'mistralai/pixtral-large': 'pixtral-large',

  // ── xAI / Grok ──────────────────────────────────────────────
  'x-ai/grok-2': 'grok-2',
  'x-ai/grok-3': 'grok-3',
  'x-ai/grok-3-mini': 'grok-3-mini',
  'x-ai/grok-4': 'grok-4',
  'x-ai/grok-4-fast': 'grok-4-fast',
  'x-ai/grok-4.1-fast': 'grok-4.1-fast',

  // ── Cohere ───────────────────────────────────────────────────
  'cohere/command-a': 'command-a',
  'cohere/command-a-reasoning': 'command-a-reasoning',
  'cohere/command-r-plus': 'command-r-plus',
  'cohere/command-r': 'command-r',
  'cohere/command-r7b': 'command-r7b',

  // ── Alibaba / Qwen ──────────────────────────────────────────
  'qwen/qwen-2.5-72b-instruct': 'qwen-2.5-72b',
  'qwen/qwen-2.5-coder-32b-instruct': 'qwen-2.5-coder-32b',
  'qwen/qwq-32b': 'qwen-qwq-32b',
  'qwen/qwen3-235b-a22b': 'qwen3-235b',
  'qwen/qwen3-32b': 'qwen3-32b',
  'qwen/qwen3-30b-a3b': 'qwen3-30b',
  'qwen/qwen3-coder-480b': 'qwen3-coder-480b',
  'qwen/qwen3-max': 'qwen3-max',

  // ── Perplexity ───────────────────────────────────────────────
  'perplexity/sonar-pro': 'sonar-pro',
  'perplexity/sonar': 'sonar',

  // ── AI21 Labs ────────────────────────────────────────────────
  'ai21/jamba-1.5-large': 'jamba-1.5-large',
  'ai21/jamba-1.5-mini': 'jamba-1.5-mini',

  // ── Amazon ───────────────────────────────────────────────────
  'amazon/nova-premier': 'nova-premier',
  'amazon/nova-pro': 'nova-pro',
  'amazon/nova-lite': 'nova-lite',
  'amazon/nova-micro': 'nova-micro',
  'amazon/nova-2-lite': 'nova-2-lite',

  // ── Microsoft ────────────────────────────────────────────────
  'microsoft/phi-4': 'phi-4',
  'microsoft/phi-4-multimodal': 'phi-4-multimodal',
  'microsoft/phi-4-reasoning': 'phi-4-reasoning',

  // ── NVIDIA ───────────────────────────────────────────────────
  'nvidia/llama-3.1-nemotron-70b-instruct': 'nemotron-70b',
  'nvidia/nemotron-ultra': 'nemotron-ultra',

  // ── MiniMax ──────────────────────────────────────────────────
  'minimax/minimax-01': 'minimax-01',

  // ── Inflection ───────────────────────────────────────────────
  'inflection/inflection-3-0': 'inflection-3',
  'inflection/inflection-2.5': 'inflection-2.5',

  // ── Reka ─────────────────────────────────────────────────────
  'rekaai/reka-core': 'reka-core',
  'rekaai/reka-flash-3': 'reka-flash-3',

  // ── 01.AI / Yi ───────────────────────────────────────────────
  '01-ai/yi-large': 'yi-large',
  '01-ai/yi-lightning': 'yi-lightning',
  '01-ai/yi-vision': 'yi-vision',
};

// ─── Provider prefix → DB provider ID ─────────────────────────
const MODEL_MAP: Record<string, string> = {
  ...LEGACY_MODEL_MAP,
  ...getOpenRouterModelMap(),
};

// Reverse lookup: our DB ID → provider ID for the model
const DB_ID_TO_PROVIDER: Record<string, string> = {};
for (const [orId, dbId] of Object.entries(MODEL_MAP)) {
  const prefix = orId.split('/')[0];
  DB_ID_TO_PROVIDER[dbId] = PROVIDER_PREFIX_MAP[prefix] ?? prefix;
}

// ─── Providers we care about for new model detection ──────────
// Only flag new models from these major providers (ignore niche/community models)
const WATCHED_PROVIDERS = getWatchedProviderPrefixes();

function resolveDbId(orModel: OpenRouterModel, validModelIds: Set<string>): string | null {
  const mapped = MODEL_MAP[orModel.id];
  if (mapped) return mapped;

  const derived = deriveModelIdFromOpenRouterId(orModel.id);
  if (validModelIds.has(derived)) return derived;

  const catalogMatch = findCatalogModelByAlias(orModel.id)
    ?? findCatalogModelByAlias(orModel.name)
    ?? findCatalogModelByAlias(derived);

  return catalogMatch?.id ?? null;
}

// ─── Fetch and transform ───────────────────────────────────────
async function scrapeOpenRouter(validProviderIds: Set<string>, validModelIds: Set<string>): Promise<{
  models: ScrapedModel[];
  newModels: OpenRouterModel[];
  totalOnOpenRouter: number;
}> {
  console.log('  Fetching OpenRouter API...');

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'The-AI-Resource-Hub-Bot/1.0 (https://theairesourcehub.com)',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API returned ${response.status}: ${response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  console.log(`    Received ${data.data.length} models from OpenRouter`);

  const models: ScrapedModel[] = [];
  const newModels: OpenRouterModel[] = [];
  let matched = 0;

  for (const orModel of data.data) {
    const dbId = resolveDbId(orModel, validModelIds);

    if (!dbId) {
      // New model detection: is this from a provider we watch?
      const prefix = orModel.id.split('/')[0];
      if (WATCHED_PROVIDERS.has(prefix)) {
        // Skip free/community variants (typically have ":free" suffix)
        if (!orModel.id.includes(':free') && !orModel.id.includes(':extended')) {
          const prompt = parseFloat(orModel.pricing.prompt);
          const completion = parseFloat(orModel.pricing.completion);
          // Only flag paid models (free tier variants aren't new models)
          if (!isNaN(prompt) && !isNaN(completion) && (prompt > 0 || completion > 0)) {
            newModels.push(orModel);
          }
        }
      }
      continue;
    }

    // Convert per-token pricing to per-1M-tokens
    const promptPerToken = parseFloat(orModel.pricing.prompt);
    const completionPerToken = parseFloat(orModel.pricing.completion);

    if (isNaN(promptPerToken) || isNaN(completionPerToken)) continue;

    const inputPrice = promptPerToken * 1_000_000;
    const outputPrice = completionPerToken * 1_000_000;

    // Skip $0 pricing (free tier variants)
    if (inputPrice === 0 && outputPrice === 0) continue;

    const modality = parseModality(orModel.architecture);
    const providerId = DB_ID_TO_PROVIDER[dbId];
    if (!providerId || !validProviderIds.has(providerId)) {
      console.warn(`    Skipping ${orModel.id}: missing provider record for "${providerId ?? 'unknown'}"`);
      continue;
    }

    models.push({
      id: dbId,
      name: orModel.name.replace(/^[^:]+:\s*/, ''),
      providerId,
      inputPrice: Math.round(inputPrice * 1000) / 1000,
      outputPrice: Math.round(outputPrice * 1000) / 1000,
      contextWindow: orModel.context_length || undefined,
      maxOutput: orModel.top_provider?.max_completion_tokens || undefined,
      modality,
      pricingSource: 'openrouter.ai/api/v1/models',
    });
    matched++;
  }

  console.log(`    Matched ${matched} models to our database`);
  if (newModels.length > 0) {
    console.log(`    ⚠ Found ${newModels.length} NEW untracked models from watched providers`);
  }

  return { models, newModels, totalOnOpenRouter: data.data.length };
}

function parseModality(architecture?: OpenRouterModel['architecture']): string {
  if (!architecture) return 'text';

  if (architecture.input_modalities && architecture.input_modalities.length > 0) {
    const parts: string[] = ['text'];
    if (architecture.input_modalities.includes('image')) parts.push('vision');
    if (architecture.input_modalities.includes('audio')) parts.push('audio');
    return parts.join(',');
  }

  const legacy = architecture.modality;
  if (!legacy) return 'text';
  const parts: string[] = ['text'];
  if (legacy.includes('image')) parts.push('vision');
  if (legacy.includes('audio')) parts.push('audio');
  return parts.join(',');
}

// ─── New Model Detection Report ─────────────────────────────────
function writeNewModelsReport(newModels: OpenRouterModel[]): void {
  if (newModels.length === 0) return;

  const reportDir = path.join(process.cwd(), 'data', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `new-models-${date}.json`);

  // Group by provider
  const byProvider: Record<string, Array<{
    openrouterId: string;
    suggestedId: string;
    name: string;
    inputPrice: number;
    outputPrice: number;
    contextWindow: number;
    created: string | null;
  }>> = {};

  for (const m of newModels) {
    const prefix = m.id.split('/')[0];
    const provider = PROVIDER_PREFIX_MAP[prefix] ?? prefix;
    if (!byProvider[provider]) byProvider[provider] = [];

    const inputPrice = parseFloat(m.pricing.prompt) * 1_000_000;
    const outputPrice = parseFloat(m.pricing.completion) * 1_000_000;

    byProvider[provider].push({
      openrouterId: m.id,
      suggestedId: deriveModelIdFromOpenRouterId(m.id),
      name: m.name,
      inputPrice: Math.round(inputPrice * 1000) / 1000,
      outputPrice: Math.round(outputPrice * 1000) / 1000,
      contextWindow: m.context_length,
      created: m.created ? new Date(m.created * 1000).toISOString().split('T')[0] : null,
    });
  }

  const report = {
    generated: new Date().toISOString(),
    totalNewModels: newModels.length,
    byProvider,
    instructions: 'Review the canonical model catalog and promote verified discoveries into scripts/model-catalog.ts.',
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`    Report written to ${reportPath}`);

  // Print summary to console
  console.log('\n  ┌─ NEW MODELS DETECTED ──────────────────────────');
  for (const [provider, models] of Object.entries(byProvider)) {
    console.log(`  │ ${provider} (${models.length} new):`);
    for (const m of models.slice(0, 5)) {
      console.log(`  │   ${m.openrouterId} — $${m.inputPrice.toFixed(2)}/$${m.outputPrice.toFixed(2)} per 1M tok`);
    }
    if (models.length > 5) {
      console.log(`  │   ... and ${models.length - 5} more`);
    }
  }
  console.log('  └──────────────────────────────────────────────────');
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('Starting OpenRouter pricing scraper...');
  const db = getDB();
  const validProviderIds = new Set(
    (db.prepare('SELECT id FROM providers').all() as Array<{ id: string }>).map((row) => row.id)
  );
  const validModelIds = new Set(
    (db.prepare('SELECT id FROM models').all() as Array<{ id: string }>).map((row) => row.id)
  );

  try {
    const { models, newModels, totalOnOpenRouter } = await scrapeOpenRouter(validProviderIds, validModelIds);

    if (models.length > 0) {
      const updated = upsertModels(db, models);
      logScrapeRun(db, 'pricing:openrouter', 'success', updated);
      console.log(`  ✓ OpenRouter: ${updated} models updated (${totalOnOpenRouter} total on platform)`);
    } else {
      logScrapeRun(db, 'pricing:openrouter', 'success', 0);
      console.log('  ✓ OpenRouter: no matching models found');
    }

    // Write new model detection report
    writeNewModelsReport(newModels);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logScrapeRun(db, 'pricing:openrouter', 'error', 0, message);
    console.error(`  ✗ OpenRouter: ${message}`);
  }

  console.log('\nOpenRouter pricing scraper complete.');
  db.close();
}

main().catch(console.error);
