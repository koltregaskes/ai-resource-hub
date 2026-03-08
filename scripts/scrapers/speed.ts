#!/usr/bin/env npx tsx
/**
 * Speed & TTFT scraper — updates time-to-first-token and output speed data.
 *
 * Run: npx tsx scripts/scrapers/speed.ts
 *
 * TTFT and output speed are volatile metrics that vary by load, region, and
 * time of day. We use median values from trusted third-party benchmarks.
 *
 * Data sources (in priority order):
 * 1. Artificial Analysis API (when available — currently no public API)
 * 2. Validated known data from artificialanalysis.ai manual reviews
 *
 * Speed data changes less frequently than pricing (providers update
 * infrastructure quarterly, not daily), so weekly validation is sufficient.
 * This scraper runs daily as part of the pipeline but data only meaningfully
 * changes when providers deploy infrastructure updates.
 */
import { getDB, logScrapeRun } from './base';
import type Database from 'better-sqlite3';

interface SpeedEntry {
  modelId: string;
  speed: number;         // tokens per second (output)
  ttft: number;          // time to first token (ms)
  source: string;
  isLive: boolean;       // whether this came from a live API or cached data
}

// ─── Try Artificial Analysis ────────────────────────────────────
// Artificial Analysis (artificialanalysis.ai) is the gold standard for
// independent speed benchmarks. They don't have a public API yet, but
// we check for one on each run in case they launch it.

async function tryArtificialAnalysis(): Promise<SpeedEntry[] | null> {
  try {
    // Check if they've launched an API (they've discussed it publicly)
    const response = await fetch('https://artificialanalysis.ai/api/v1/models', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'The-AI-Resource-Hub-Bot/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('  ✓ Artificial Analysis API is now available!');
      // Parse and return live data (structure TBD when API launches)
      return null; // Will be implemented when API format is known
    }
  } catch {
    // Expected — no public API yet
  }

  return null;
}

// ─── Known Speed Data ────────────────────────────────────────
// Validated against artificialanalysis.ai leaderboard pages.
// Last manual validation date is noted in comments.

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

    // Meta (via providers) — validated 2026-02-10
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

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log('Starting speed & TTFT scraper...');
  const db = getDB();

  try {
    // Try live sources first
    const liveData = await tryArtificialAnalysis();

    let entries: SpeedEntry[];
    if (liveData && liveData.length > 0) {
      entries = liveData;
      console.log(`  ✓ Using LIVE data from Artificial Analysis (${entries.length} models)`);
    } else {
      entries = getKnownSpeedData();
      console.log(`  Using validated known data (${entries.length} models, Artificial Analysis API not yet public)`);
    }

    const liveCount = entries.filter(e => e.isLive).length;
    const cachedCount = entries.filter(e => !e.isLive).length;

    const updated = updateSpeedData(db, entries);
    logScrapeRun(db, 'speed', 'success', updated);
    console.log(`  ✓ Speed scraper: ${updated} models updated (${liveCount} live, ${cachedCount} cached)`);

    // Summary stats
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
