#!/usr/bin/env npx tsx
import { getDB, logScrapeRun } from './scrapers/base';
import { VERIFIED_MODEL_CATALOG } from './model-catalog';

type Candidate = {
  id: string;
  name: string;
  notes: string | null;
};

type StaleSpeedCandidate = Candidate & {
  speed_source: string | null;
  speed_updated: string | null;
};

function appendNote(existing: string | null, addition: string): string {
  const parts = [existing?.trim(), addition.trim()].filter(Boolean) as string[];
  return [...new Set(parts)].join(' ');
}

async function main() {
  console.log('Normalising model registry statuses...');
  const db = getDB();
  const verifiedIds = new Set(VERIFIED_MODEL_CATALOG.map((model) => model.id));

  const zeroQualityCandidates = db.prepare(`
    SELECT m.id, m.name, m.notes
    FROM models m
    LEFT JOIN benchmark_scores bs ON bs.model_id = m.id
    WHERE m.category = 'llm'
      AND m.status = 'active'
      AND m.quality_score = 0
    GROUP BY m.id
    HAVING COUNT(bs.benchmark_id) = 0
    ORDER BY m.name
  `).all() as Candidate[];

  const noBenchmarkCandidates = db.prepare(`
    SELECT m.id, m.name, m.notes
    FROM models m
    LEFT JOIN benchmark_scores bs ON bs.model_id = m.id
    WHERE m.category = 'llm'
      AND m.status = 'active'
      AND m.quality_score >= 80
    GROUP BY m.id
    HAVING COUNT(bs.benchmark_id) = 0
    ORDER BY m.name
  `).all() as Candidate[];

  const unsourcedPricingCandidates = db.prepare(`
    SELECT m.id, m.name, m.notes
    FROM models m
    WHERE m.category = 'llm'
      AND m.status = 'active'
      AND m.api_available = 1
      AND (m.pricing_updated IS NULL OR m.pricing_updated < datetime('now', '-30 days'))
      AND m.released IS NOT NULL
      AND m.released < date('now', '-30 days')
    ORDER BY m.name
  `).all() as Candidate[];

  const staleSpeedCandidates = db.prepare(`
    SELECT m.id, m.name, m.notes, m.speed_source, m.speed_updated
    FROM models m
    WHERE m.category = 'llm'
      AND m.status = 'active'
      AND m.speed > 0
      AND (m.speed_updated IS NULL OR m.speed_updated < datetime('now', '-30 days'))
    ORDER BY m.name
  `).all() as StaleSpeedCandidate[];

  const updateModel = db.prepare(`
    UPDATE models
    SET status = 'tracking', notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  const clearStaleSpeed = db.prepare(`
    UPDATE models
    SET speed = 0,
        ttft = 0,
        speed_source = NULL,
        speed_updated = NULL,
        notes = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `);

  const candidates = new Map<string, { name: string; notes: string | null; reasons: Set<string> }>();

  for (const model of zeroQualityCandidates) {
    candidates.set(model.id, {
      name: model.name,
      notes: model.notes,
      reasons: new Set(['Tracking only until benchmark and quality coverage is available.']),
    });
  }

  for (const model of noBenchmarkCandidates) {
    if (verifiedIds.has(model.id)) continue;
    const existing = candidates.get(model.id);
    const reasons = existing?.reasons ?? new Set<string>();
    reasons.add('Tracking only until benchmark coverage is available.');
    candidates.set(model.id, {
      name: model.name,
      notes: existing?.notes ?? model.notes,
      reasons,
    });
  }

  for (const model of unsourcedPricingCandidates) {
    if (verifiedIds.has(model.id)) continue;
    const existing = candidates.get(model.id);
    const reasons = existing?.reasons ?? new Set<string>();
    reasons.add('Tracking only until pricing is refreshed from a live or official source.');
    candidates.set(model.id, {
      name: model.name,
      notes: existing?.notes ?? model.notes,
      reasons,
    });
  }

  let updated = 0;
  let speedRetired = 0;

  const transaction = db.transaction(() => {
    for (const [id, model] of candidates) {
      let note = model.notes;
      for (const reason of model.reasons) {
        note = appendNote(note, reason);
      }
      updateModel.run(note, id);
      updated++;
    }

    for (const model of staleSpeedCandidates) {
      const note = appendNote(
        model.notes,
        'Speed data hidden until it is refreshed from a current live measurement source.',
      );
      clearStaleSpeed.run(note, model.id);
      speedRetired++;
    }
  });

  try {
    transaction();
    logScrapeRun(db, 'registry:normalise-status', 'success', updated + speedRetired);
    console.log(`  Demoted ${updated} incomplete active models from active to tracking`);
    console.log(`    Zero-quality candidates: ${zeroQualityCandidates.length}`);
    console.log(`    No-benchmark candidates: ${noBenchmarkCandidates.length}`);
    console.log(`    Unsourced-pricing candidates: ${unsourcedPricingCandidates.length}`);
    console.log(`  Retired stale speed data for ${speedRetired} active models`);
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
