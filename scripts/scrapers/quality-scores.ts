#!/usr/bin/env npx tsx
/**
 * Quality score auto-calculator.
 * Derives quality_score from available benchmark data using weighted composite.
 * Fills in missing scores for models that have benchmark data but no quality_score.
 *
 * Run: npx tsx scripts/scrapers/quality-scores.ts
 *
 * Methodology:
 *   - Chatbot Arena ELO: 30% (normalised to 0-100)
 *   - GPQA Diamond: 20% (already 0-100 scale)
 *   - MATH-500: 15% (already 0-100 scale)
 *   - MMLU: 15% (already 0-100 scale)
 *   - HumanEval: 10% (already 0-100 scale)
 *   - SWE-bench Verified: 10% (already 0-100 scale)
 *
 * If a model doesn't have all benchmarks, weights are redistributed
 * proportionally among available scores.
 */
import { getDB, logScrapeRun } from './base';
import type Database from 'better-sqlite3';

const WEIGHTS: Record<string, number> = {
  'chatbot-arena-elo': 0.30,
  'gpqa-diamond': 0.20,
  'math-500': 0.15,
  'mmlu': 0.15,
  'humaneval': 0.10,
  'swe-bench-verified': 0.10,
};

// ELO normalisation: map arena ELO range to 0-100
// Typical range: 900 (weak) to 1400 (frontier)
function normaliseElo(elo: number): number {
  const MIN_ELO = 900;
  const MAX_ELO = 1400;
  const clamped = Math.max(MIN_ELO, Math.min(MAX_ELO, elo));
  return ((clamped - MIN_ELO) / (MAX_ELO - MIN_ELO)) * 100;
}

function main() {
  const db = getDB();

  console.log('Quality score auto-calculator starting...\n');

  // Get all models
  const models = db.prepare('SELECT id, name, quality_score FROM models').all() as Array<{
    id: string;
    name: string;
    quality_score: number | null;
  }>;

  // Get all benchmark scores indexed by model
  const allScores = db.prepare('SELECT model_id, benchmark_id, score FROM benchmark_scores').all() as Array<{
    model_id: string;
    benchmark_id: string;
    score: number;
  }>;

  const scoresByModel = new Map<string, Map<string, number>>();
  for (const s of allScores) {
    if (!scoresByModel.has(s.model_id)) scoresByModel.set(s.model_id, new Map());
    scoresByModel.get(s.model_id)!.set(s.benchmark_id, s.score);
  }

  const updateQuality = db.prepare('UPDATE models SET quality_score = ?, updated_at = datetime(\'now\') WHERE id = ?');

  let updated = 0;
  let skipped = 0;

  const calcAll = db.transaction(() => {
    for (const model of models) {
      const benchmarks = scoresByModel.get(model.id);
      if (!benchmarks || benchmarks.size === 0) {
        skipped++;
        continue;
      }

      // Calculate weighted composite
      let totalWeight = 0;
      let weightedSum = 0;

      for (const [benchId, weight] of Object.entries(WEIGHTS)) {
        const score = benchmarks.get(benchId);
        if (score == null) continue;

        let normalisedScore: number;
        if (benchId === 'chatbot-arena-elo') {
          normalisedScore = normaliseElo(score);
        } else {
          // Already on ~0-100 scale
          normalisedScore = Math.min(100, Math.max(0, score));
        }

        weightedSum += normalisedScore * weight;
        totalWeight += weight;
      }

      if (totalWeight === 0) {
        skipped++;
        continue;
      }

      // Redistribute weights proportionally
      const qualityScore = Math.round(weightedSum / totalWeight);

      // Only update if we have meaningful data (at least 2 benchmarks)
      const benchCount = [...Object.keys(WEIGHTS)].filter(b => benchmarks.has(b)).length;
      if (benchCount < 2) {
        // If only 1 benchmark, use it but mark lower confidence
        if (model.quality_score === 0 || model.quality_score == null) {
          updateQuality.run(qualityScore, model.id);
          updated++;
          console.log(`  [1-bench] ${model.name}: ${qualityScore} (from ${benchCount} benchmark)`);
        }
        continue;
      }

      const oldScore = model.quality_score ?? 0;
      updateQuality.run(qualityScore, model.id);
      updated++;

      if (oldScore === 0) {
        console.log(`  [NEW] ${model.name}: 0 → ${qualityScore} (from ${benchCount} benchmarks)`);
      } else if (Math.abs(oldScore - qualityScore) > 3) {
        console.log(`  [CHANGE] ${model.name}: ${oldScore} → ${qualityScore} (from ${benchCount} benchmarks)`);
      }
    }
  });

  calcAll();

  // Final stats
  const remaining = db.prepare('SELECT COUNT(*) as c FROM models WHERE quality_score = 0 OR quality_score IS NULL').get() as { c: number };

  console.log(`\n  Updated: ${updated} models`);
  console.log(`  Skipped: ${skipped} (no benchmark data)`);
  console.log(`  Still zero: ${remaining.c} models`);

  logScrapeRun(db, 'quality-scores', 'computed', updated, 0);
  db.close();
  console.log('  Done.');
}

main();
