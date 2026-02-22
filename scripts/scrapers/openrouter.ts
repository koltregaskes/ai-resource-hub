#!/usr/bin/env npx tsx
/**
 * OpenRouter API scraper — fetches live pricing from openrouter.ai/api/v1/models
 *
 * Run: npx tsx scripts/scrapers/openrouter.ts
 *
 * OpenRouter aggregates 400+ models from all major providers with real-time
 * pricing data. No API key required for the models endpoint.
 *
 * Pricing format: OpenRouter returns per-token costs as strings.
 * We convert to per-1M-tokens (our standard format).
 */
import { getDB, upsertModels, logScrapeRun, type ScrapedModel } from './base';

// ─── OpenRouter API types ──────────────────────────────────────
interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;              // cost per 1 prompt token (e.g. "0.0000025" = $2.50/1M)
    completion: string;          // cost per 1 completion token
    image?: string;              // cost per image input
    request?: string;            // flat per-request cost
    input_cache_read?: string;   // cost per cached input token read
    input_cache_write?: string;  // cost per cached input token write
    web_search?: string;         // cost per web search
    internal_reasoning?: string; // cost per internal reasoning token
  };
  context_length: number;
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  architecture?: {
    modality?: string;              // legacy: "text+image->text"
    input_modalities?: string[];    // e.g. ["text", "image"]
    output_modalities?: string[];   // e.g. ["text"]
    tokenizer?: string;
    instruct_type?: string;
  };
  created?: number;        // Unix timestamp
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

// ─── Model ID mapping ──────────────────────────────────────────
// Maps OpenRouter model IDs to our database model IDs.
// Only models we already track are mapped — we don't auto-add new models
// because they need quality scores and metadata that can't be scraped.
const MODEL_MAP: Record<string, string> = {
  // OpenAI
  'openai/gpt-4o': 'gpt-4o',
  'openai/gpt-4o-mini': 'gpt-4o-mini',
  'openai/gpt-4.1': 'gpt-4.1',
  'openai/gpt-4.1-mini': 'gpt-4.1-mini',
  'openai/gpt-4.1-nano': 'gpt-4.1-nano',
  'openai/o3': 'o3',
  'openai/o3-mini': 'o3-mini',
  'openai/o3-pro': 'o3-pro',
  'openai/o4-mini': 'o4-mini',

  // Anthropic
  'anthropic/claude-opus-4': 'claude-opus-4',
  'anthropic/claude-sonnet-4': 'claude-sonnet-4',
  'anthropic/claude-3.5-haiku': 'claude-haiku-3.5',
  'anthropic/claude-haiku-4.5': 'claude-haiku-4.5',
  'anthropic/claude-sonnet-4.5': 'claude-sonnet-4.5',
  'anthropic/claude-opus-4.5': 'claude-opus-4.5',
  'anthropic/claude-sonnet-4.6': 'claude-sonnet-4.6',
  'anthropic/claude-opus-4.6': 'claude-opus-4.6',

  // Google
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-2.0-flash': 'gemini-2.0-flash',
  'google/gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',

  // Meta
  'meta-llama/llama-4-maverick': 'llama-4-maverick',
  'meta-llama/llama-4-scout': 'llama-4-scout',
  'meta-llama/llama-3.3-70b-instruct': 'llama-3.3-70b',

  // DeepSeek
  'deepseek/deepseek-chat-v3': 'deepseek-v3',
  'deepseek/deepseek-chat-v3-0324': 'deepseek-v3.2',
  'deepseek/deepseek-r1': 'deepseek-r1',
  'deepseek/deepseek-r1-0528': 'deepseek-r1-0528',

  // Mistral
  'mistralai/mistral-large': 'mistral-large-3',
  'mistralai/mistral-medium': 'mistral-medium-3',
  'mistralai/mistral-small': 'mistral-small-3.1',
  'mistralai/codestral': 'codestral',
  'mistralai/mistral-nemo': 'mistral-nemo',
  'mistralai/pixtral-large': 'pixtral-large',

  // xAI
  'x-ai/grok-3': 'grok-3',
  'x-ai/grok-3-mini': 'grok-3-mini',

  // Cohere
  'cohere/command-a': 'command-a',
  'cohere/command-r-plus': 'command-r-plus',
  'cohere/command-r': 'command-r',
  'cohere/command-r7b': 'command-r7b',

  // Alibaba
  'qwen/qwen-2.5-72b-instruct': 'qwen-2.5-72b',
  'qwen/qwq-32b': 'qwen-qwq-32b',

  // Perplexity
  'perplexity/sonar-pro': 'sonar-pro',
  'perplexity/sonar': 'sonar',

  // AI21
  'ai21/jamba-1.5-large': 'jamba-1.5-large',
  'ai21/jamba-1.5-mini': 'jamba-1.5-mini',

  // Amazon
  'amazon/nova-pro': 'nova-pro',
  'amazon/nova-lite': 'nova-lite',
  'amazon/nova-micro': 'nova-micro',
};

// Reverse lookup: our DB ID → provider ID for the model
const DB_ID_TO_PROVIDER: Record<string, string> = {};
for (const [orId, dbId] of Object.entries(MODEL_MAP)) {
  const provider = orId.split('/')[0];
  // Map OpenRouter provider prefixes to our DB provider IDs
  const providerMap: Record<string, string> = {
    'openai': 'openai',
    'anthropic': 'anthropic',
    'google': 'google',
    'meta-llama': 'meta',
    'deepseek': 'deepseek',
    'mistralai': 'mistral',
    'x-ai': 'xai',
    'cohere': 'cohere',
    'qwen': 'alibaba',
    'perplexity': 'perplexity',
    'ai21': 'ai21',
    'amazon': 'amazon',
  };
  DB_ID_TO_PROVIDER[dbId] = providerMap[provider] ?? provider;
}

// ─── Fetch and transform ───────────────────────────────────────
async function scrapeOpenRouter(): Promise<ScrapedModel[]> {
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
  let matched = 0;
  let skipped = 0;

  for (const orModel of data.data) {
    const dbId = MODEL_MAP[orModel.id];
    if (!dbId) {
      skipped++;
      continue;
    }

    // Convert per-token pricing to per-1M-tokens
    const promptPerToken = parseFloat(orModel.pricing.prompt);
    const completionPerToken = parseFloat(orModel.pricing.completion);

    // Skip free models that we track as paid (probably rate-limited free tier)
    if (isNaN(promptPerToken) || isNaN(completionPerToken)) continue;

    const inputPrice = promptPerToken * 1_000_000;
    const outputPrice = completionPerToken * 1_000_000;

    // Skip if pricing is $0 for models we know are paid
    // (OpenRouter sometimes lists free rate-limited variants)
    if (inputPrice === 0 && outputPrice === 0) continue;

    // Parse modality from architecture
    const modality = parseModality(orModel.architecture);

    const providerId = DB_ID_TO_PROVIDER[dbId];

    models.push({
      id: dbId,
      name: orModel.name.replace(/^[^:]+:\s*/, ''), // Remove "Provider: " prefix
      providerId,
      inputPrice: Math.round(inputPrice * 1000) / 1000, // Round to 3 decimal places
      outputPrice: Math.round(outputPrice * 1000) / 1000,
      contextWindow: orModel.context_length || undefined,
      maxOutput: orModel.top_provider?.max_completion_tokens || undefined,
      modality,
      pricingSource: 'openrouter.ai/api/v1/models',
    });
    matched++;
  }

  console.log(`    Matched ${matched} models to our database (${skipped} untracked)`);

  // Log price summary for matched models
  if (models.length > 0) {
    console.log('    Price summary (per 1M tokens):');
    for (const m of models.slice(0, 10)) {
      console.log(`      ${m.id}: $${m.inputPrice.toFixed(2)} in / $${m.outputPrice.toFixed(2)} out`);
    }
    if (models.length > 10) {
      console.log(`      ... and ${models.length - 10} more`);
    }
  }

  return models;
}

function parseModality(architecture?: OpenRouterModel['architecture']): string {
  if (!architecture) return 'text';

  // Prefer structured modality arrays (newer API format)
  if (architecture.input_modalities && architecture.input_modalities.length > 0) {
    const parts: string[] = ['text'];
    if (architecture.input_modalities.includes('image')) parts.push('vision');
    if (architecture.input_modalities.includes('audio')) parts.push('audio');
    return parts.join(',');
  }

  // Fall back to legacy modality string: "text+image->text"
  const legacy = architecture.modality;
  if (!legacy) return 'text';
  const parts: string[] = ['text'];
  if (legacy.includes('image')) parts.push('vision');
  if (legacy.includes('audio')) parts.push('audio');
  return parts.join(',');
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('Starting OpenRouter pricing scraper...');
  const db = getDB();

  try {
    const models = await scrapeOpenRouter();

    if (models.length > 0) {
      const updated = upsertModels(db, models);
      logScrapeRun(db, 'pricing:openrouter', 'success', updated);
      console.log(`  ✓ OpenRouter: ${updated} models updated`);
    } else {
      logScrapeRun(db, 'pricing:openrouter', 'success', 0);
      console.log('  ✓ OpenRouter: no matching models found');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logScrapeRun(db, 'pricing:openrouter', 'error', 0, message);
    console.error(`  ✗ OpenRouter: ${message}`);
  }

  console.log('\nOpenRouter pricing scraper complete.');
  db.close();
}

main().catch(console.error);
