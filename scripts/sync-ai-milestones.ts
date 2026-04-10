#!/usr/bin/env npx tsx
import Database from 'better-sqlite3';
import path from 'node:path';

import { aiMilestoneSourceRegistry } from '../src/data/ai-milestone-source-registry';
import { aiMilestoneSeed, validateAiMilestoneSeed } from '../src/data/ai-milestones-seed';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');
const summary = validateAiMilestoneSeed(aiMilestoneSeed);
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS ai_milestones (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    day INTEGER,
    date_precision TEXT NOT NULL,
    category TEXT NOT NULL,
    kind TEXT NOT NULL,
    significance TEXT NOT NULL,
    provider_id TEXT,
    model_id TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL,
    confidence TEXT NOT NULL,
    homepage_eligible INTEGER NOT NULL DEFAULT 0,
    calendar_eligible INTEGER NOT NULL DEFAULT 0,
    exact_anniversary_eligible INTEGER NOT NULL DEFAULT 0,
    tracking_date TEXT,
    tracking_date_kind TEXT,
    tracking_note TEXT,
    canonical_source_label TEXT,
    canonical_source_url TEXT,
    canonical_source_type TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_milestone_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone_id TEXT NOT NULL REFERENCES ai_milestones(id) ON DELETE CASCADE,
    source_label TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_role TEXT NOT NULL,
    notes TEXT,
    UNIQUE (milestone_id, source_url, source_role)
  );

  CREATE TABLE IF NOT EXISTS ai_milestone_source_registry (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    base_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    priority INTEGER NOT NULL,
    official_first INTEGER NOT NULL DEFAULT 1,
    active INTEGER NOT NULL DEFAULT 1,
    coverage TEXT NOT NULL,
    scrape_notes TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_ai_milestones_precision ON ai_milestones(date_precision);
  CREATE INDEX IF NOT EXISTS idx_ai_milestones_category ON ai_milestones(category);
  CREATE INDEX IF NOT EXISTS idx_ai_milestones_status ON ai_milestones(status);
  CREATE INDEX IF NOT EXISTS idx_ai_milestone_sources_milestone ON ai_milestone_sources(milestone_id);
`);

const insertMilestone = db.prepare(`
  INSERT INTO ai_milestones (
    id, slug, title, summary, year, month, day, date_precision, category, kind, significance,
    provider_id, model_id, tags, status, confidence, homepage_eligible, calendar_eligible,
    exact_anniversary_eligible, tracking_date, tracking_date_kind, tracking_note,
    canonical_source_label, canonical_source_url, canonical_source_type, updated_at
  )
  VALUES (
    @id, @slug, @title, @summary, @year, @month, @day, @datePrecision, @category, @kind, @significance,
    @providerId, @modelId, @tags, @status, @confidence, @homepageEligible, @calendarEligible,
    @exactAnniversaryEligible, @trackingDate, @trackingDateKind, @trackingNote,
    @canonicalSourceLabel, @canonicalSourceUrl, @canonicalSourceType, datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    slug = excluded.slug,
    title = excluded.title,
    summary = excluded.summary,
    year = excluded.year,
    month = excluded.month,
    day = excluded.day,
    date_precision = excluded.date_precision,
    category = excluded.category,
    kind = excluded.kind,
    significance = excluded.significance,
    provider_id = excluded.provider_id,
    model_id = excluded.model_id,
    tags = excluded.tags,
    status = excluded.status,
    confidence = excluded.confidence,
    homepage_eligible = excluded.homepage_eligible,
    calendar_eligible = excluded.calendar_eligible,
    exact_anniversary_eligible = excluded.exact_anniversary_eligible,
    tracking_date = excluded.tracking_date,
    tracking_date_kind = excluded.tracking_date_kind,
    tracking_note = excluded.tracking_note,
    canonical_source_label = excluded.canonical_source_label,
    canonical_source_url = excluded.canonical_source_url,
    canonical_source_type = excluded.canonical_source_type,
    updated_at = datetime('now')
`);

const insertSource = db.prepare(`
  INSERT INTO ai_milestone_sources (
    milestone_id, source_label, source_url, source_type, source_role, notes
  )
  VALUES (
    @milestoneId, @sourceLabel, @sourceUrl, @sourceType, @sourceRole, @notes
  )
  ON CONFLICT(milestone_id, source_url, source_role) DO UPDATE SET
    source_label = excluded.source_label,
    source_type = excluded.source_type,
    notes = excluded.notes
`);

const insertRegistry = db.prepare(`
  INSERT INTO ai_milestone_source_registry (
    id, label, base_url, source_type, priority, official_first, active, coverage, scrape_notes, updated_at
  )
  VALUES (
    @id, @label, @baseUrl, @sourceType, @priority, @officialFirst, @active, @coverage, @scrapeNotes, datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    label = excluded.label,
    base_url = excluded.base_url,
    source_type = excluded.source_type,
    priority = excluded.priority,
    official_first = excluded.official_first,
    active = excluded.active,
    coverage = excluded.coverage,
    scrape_notes = excluded.scrape_notes,
    updated_at = datetime('now')
`);

const deleteMissingMilestones = db.prepare(`
  DELETE FROM ai_milestones
  WHERE id NOT IN (${aiMilestoneSeed.map(() => '?').join(', ')})
`);

const deleteMissingSources = db.prepare(`
  DELETE FROM ai_milestone_sources
  WHERE milestone_id NOT IN (${aiMilestoneSeed.map(() => '?').join(', ')})
`);

const deleteMissingRegistry = db.prepare(`
  DELETE FROM ai_milestone_source_registry
  WHERE id NOT IN (${aiMilestoneSourceRegistry.map(() => '?').join(', ')})
`);

const sync = db.transaction(() => {
  for (const milestone of aiMilestoneSeed) {
    const canonicalSource = milestone.sources.find((source) => source.role === 'canonical') ?? null;

    insertMilestone.run({
      id: milestone.id,
      slug: milestone.slug,
      title: milestone.title,
      summary: milestone.summary,
      year: milestone.year,
      month: milestone.month ?? null,
      day: milestone.day ?? null,
      datePrecision: milestone.datePrecision,
      category: milestone.category,
      kind: milestone.kind,
      significance: milestone.significance,
      providerId: milestone.providerId ?? null,
      modelId: milestone.modelId ?? null,
      tags: JSON.stringify(milestone.tags),
      status: milestone.status,
      confidence: milestone.confidence,
      homepageEligible: milestone.homepageEligible ? 1 : 0,
      calendarEligible: milestone.calendarEligible ? 1 : 0,
      exactAnniversaryEligible: milestone.exactAnniversaryEligible ? 1 : 0,
      trackingDate: milestone.trackingDate?.date ?? null,
      trackingDateKind: milestone.trackingDate?.kind ?? null,
      trackingNote: milestone.trackingDate?.note ?? null,
      canonicalSourceLabel: canonicalSource?.label ?? null,
      canonicalSourceUrl: canonicalSource?.url ?? null,
      canonicalSourceType: canonicalSource?.sourceType ?? null,
    });

    for (const source of milestone.sources) {
      insertSource.run({
        milestoneId: milestone.id,
        sourceLabel: source.label,
        sourceUrl: source.url,
        sourceType: source.sourceType,
        sourceRole: source.role,
        notes: source.notes ?? null,
      });
    }
  }

  for (const source of aiMilestoneSourceRegistry) {
    insertRegistry.run({
      id: source.id,
      label: source.label,
      baseUrl: source.baseUrl,
      sourceType: source.sourceType,
      priority: source.priority,
      officialFirst: source.officialFirst ? 1 : 0,
      active: source.active ? 1 : 0,
      coverage: source.coverage,
      scrapeNotes: source.scrapeNotes,
    });
  }

  deleteMissingSources.run(...aiMilestoneSeed.map((item) => item.id));
  deleteMissingMilestones.run(...aiMilestoneSeed.map((item) => item.id));
  deleteMissingRegistry.run(...aiMilestoneSourceRegistry.map((item) => item.id));
});

sync();

const milestoneCount = db.prepare('SELECT COUNT(*) AS count FROM ai_milestones').get() as { count: number };
const sourceCount = db.prepare('SELECT COUNT(*) AS count FROM ai_milestone_sources').get() as { count: number };
const registryCount = db.prepare('SELECT COUNT(*) AS count FROM ai_milestone_source_registry').get() as { count: number };

console.log('Synced AI milestones into SQLite.');
console.log(`Milestones: ${milestoneCount.count}`);
console.log(`Sources: ${sourceCount.count}`);
console.log(`Source registry entries: ${registryCount.count}`);
console.log(`Verified: ${summary.verified}`);
console.log(`Tracking: ${summary.tracking}`);
console.log(`Needs review: ${summary.needsReview}`);
