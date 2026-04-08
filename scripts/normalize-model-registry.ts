#!/usr/bin/env npx tsx
import { getDB, logScrapeRun } from './scrapers/base';

async function main() {
  console.log('Normalising model registry statuses...');
  const db = getDB();

  const candidates = db.prepare(`
    SELECT m.id, m.name, m.notes
    FROM models m
    LEFT JOIN benchmark_scores bs ON bs.model_id = m.id
    WHERE m.category = 'llm'
      AND m.status = 'active'
      AND m.quality_score = 0
    GROUP BY m.id
    HAVING COUNT(bs.benchmark_id) = 0
    ORDER BY m.name
  `).all() as Array<{ id: string; name: string; notes: string | null }>;

  const updateModel = db.prepare(`
    UPDATE models
    SET status = 'tracking', notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  let updated = 0;

  const transaction = db.transaction(() => {
    for (const model of candidates) {
      const note = [model.notes, 'Tracking only until benchmark and quality coverage is available.']
        .filter(Boolean)
        .join(' ');
      updateModel.run(note, model.id);
      updated++;
    }
  });

  try {
    transaction();
    logScrapeRun(db, 'registry:normalise-status', 'success', updated);
    console.log(`  Demoted ${updated} zero-quality models from active to tracking`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logScrapeRun(db, 'registry:normalise-status', 'error', 0, message);
    throw error;
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
