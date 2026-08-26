#!/usr/bin/env npx tsx
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_FRONTIER_MODELS, type FrontierModelRequirement } from './frontier-registry';
import { getAiResourceHubNewsRoutingDiagnostics } from '../src/data/news-routing';
import { isPubliclyVerifiedModel } from '../src/data/model-verification';
import { getRecurringEvents } from '../src/data/research-intel';
import { getBenchmarkScores } from '../src/db/pg-cache';
import { getAiResourceHubSqlitePath } from './sqlite-path';
import {
  assessBenchmarkProvenance,
  getBenchmarkProvenanceGateFailures,
  summariseBenchmarkProvenance,
  type BenchmarkDefinitionProvenanceInput,
  type BenchmarkScoreProvenanceInput,
} from './benchmark-provenance';
import { getPublicQualityPolicyFailures } from './public-quality-policy';
import { findVerifiedBenchmarkScoreEvidence } from './benchmark-score-evidence';

const repoRoot = process.cwd();
const dbPath = getAiResourceHubSqlitePath();
const cacheDir = path.join(repoRoot, 'data', 'pg-cache');
const publicDataDir = path.join(repoRoot, 'public', 'data');
const providerStatusPath = path.join(repoRoot, 'data', 'provider-status.json');
const eventSourceStatusPath = path.join(repoRoot, 'data', 'events-source-status.json');
const releaseDeskPath = path.join(publicDataDir, 'model-release-desk.json');
const generatedReleaseDeskPath = path.join(repoRoot, 'src', 'data', 'model-release-desk.generated.ts');
interface CacheModel {
  id: string;
  name?: string | null;
  provider_name?: string | null;
  status?: string | null;
  notes?: string | null;
}

interface CacheNews {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: string | null;
  tags?: unknown;
  importance_score?: number | string | null;
  published_at?: string | null;
  discovered_at?: string | null;
}

interface CacheEvent {
  id: string;
  name: string;
  url: string;
  date_start?: string | null;
  date_end?: string | null;
  updated_at?: string | null;
}

interface CacheBenchmarkScore extends BenchmarkScoreProvenanceInput {
  score?: number | string | null;
}

interface CacheBenchmarkDefinition extends BenchmarkDefinitionProvenanceInput {
  name?: string | null;
}

interface EventSourceStatus {
  generatedAt?: string;
  live?: number;
  errors?: number;
}

interface SpreadsheetExport {
  generated?: string;
  model_count?: number;
  active_model_count?: number;
  tracking_model_count?: number;
  benchmark_policy?: {
    evidence_state?: string;
    raw_score_count?: number;
    rankable_score_count?: number;
    quarantined_score_count?: number;
  };
  models?: Array<{
    id?: string;
    status?: string | null;
    benchmarks?: Record<string, unknown> | null;
    benchmark_evidence?: Record<string, {
      score?: unknown;
      source?: string | null;
      source_url?: string | null;
      measured_at?: string | null;
      evidence_state?: string | null;
    }> | null;
  }>;
}

interface ProviderStatusSnapshot {
  generatedAt?: string;
  providers?: Array<{ name?: string; lastCheckedAt?: string | null }>;
}

interface ReleaseDeskSnapshot {
  generatedAt?: string;
  stats?: {
    totalReleases?: number;
    highPriority?: number;
    readyForEditor?: number;
  };
  releases?: Array<{
    id?: string;
    draftStatus?: string | null;
    verificationState?: 'official' | 'discovery_only' | 'unverified' | null;
    officialUrl?: string | null;
    benchmarkHighlights?: Array<{
      benchmark_id?: string;
      score?: unknown;
      source?: string | null;
      sourceUrl?: string | null;
      measuredAt?: string | null;
      evidenceState?: string | null;
    }>;
  }>;
}

function loadJson<T>(name: string): T[] {
  const filePath = path.join(cacheDir, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
}

function loadJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function loadGeneratedReleaseDesk(filePath: string): ReleaseDeskSnapshot | null {
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(
    /^export const modelReleaseDesk = ([\s\S]*?) as const;\r?\n\r?\nexport type ModelReleaseDesk/,
  );
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as ReleaseDeskSnapshot;
  } catch {
    return null;
  }
}

function normalise(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function matchesRequirement(model: CacheModel, requirement: FrontierModelRequirement): boolean {
  const provider = normalise(model.provider_name);
  const id = normalise(model.id);
  const name = normalise(model.name);

  const providerMatches = requirement.providerHints.some((hint) => provider.includes(normalise(hint)));
  if (!providerMatches) return false;

  return requirement.aliases.some((alias) => {
    const expected = normalise(alias);
    return id.includes(expected) || name.includes(expected);
  });
}

function main() {
  const failures: string[] = [];
  failures.push(...getPublicQualityPolicyFailures(repoRoot));

  const cacheModels = loadJson<CacheModel>('models').filter(isPubliclyVerifiedModel);
  const cacheProviders = loadJson<Record<string, unknown>>('providers');
  const cacheBenchmarkScores = loadJson<CacheBenchmarkScore>('benchmark_scores');
  const publicBenchmarkScores = getBenchmarkScores();
  const cacheBenchmarkDefinitions = loadJson<CacheBenchmarkDefinition>('benchmarks');
  const cacheNews = loadJson<CacheNews>('news');
  const cacheGlossary = loadJson<Record<string, unknown>>('glossary');
  const cacheEvents = loadJson<CacheEvent>('events');
  const renderedEvents = getRecurringEvents();
  const spreadsheet = loadJsonFile<SpreadsheetExport>(path.join(publicDataDir, 'ai-models-comparison.json'));
  const latestSpreadsheet = loadJsonFile<SpreadsheetExport>(path.join(publicDataDir, 'models-latest.json'));
  const providerStatus = loadJsonFile<ProviderStatusSnapshot>(providerStatusPath);
  const releaseDesk = loadJsonFile<ReleaseDeskSnapshot>(releaseDeskPath);
  const generatedReleaseDesk = loadGeneratedReleaseDesk(generatedReleaseDeskPath);
  const eventSourceStatus = loadJsonFile<EventSourceStatus>(eventSourceStatusPath);
  const dbAvailable = fs.existsSync(dbPath);
  const db = dbAvailable ? new Database(dbPath, { readonly: true }) : null;

  const dbCounts = db
    ? {
        providers: Number((db.prepare('SELECT COUNT(*) AS count FROM providers').get() as { count: number }).count),
        models: Number((db.prepare(`
          SELECT COUNT(*) AS count
          FROM models
          WHERE LOWER(COALESCE(status, 'active')) IN ('active', 'tracking', 'preview')
            AND LOWER(COALESCE(notes, '')) NOT LIKE '%awaiting official verification%'
        `).get() as { count: number }).count),
        benchmarkScores: Number((db.prepare('SELECT COUNT(*) AS count FROM benchmark_scores').get() as { count: number }).count),
      }
    : {
        providers: cacheProviders.length,
        models: cacheModels.length,
        benchmarkScores: cacheBenchmarkScores.length,
      };

  if (cacheProviders.length < dbCounts.providers) {
    failures.push(`Provider cache lagging local DB: cache=${cacheProviders.length}, db=${dbCounts.providers}`);
  }

  if (cacheModels.length < dbCounts.models) {
    failures.push(`Model cache lagging local DB: cache=${cacheModels.length}, db=${dbCounts.models}`);
  }

  if (cacheBenchmarkScores.length < dbCounts.benchmarkScores) {
    failures.push(`Benchmark score cache lagging local DB: cache=${cacheBenchmarkScores.length}, db=${dbCounts.benchmarkScores}`);
  }

  const benchmarkProvenance = summariseBenchmarkProvenance(
    cacheBenchmarkScores,
    cacheBenchmarkDefinitions,
  );
  const benchmarkDefinitionsById = new Map(
    cacheBenchmarkDefinitions.map((benchmark) => [benchmark.id, benchmark]),
  );
  const exactRankableBenchmarkScores = cacheBenchmarkScores.filter((score) => (
    findVerifiedBenchmarkScoreEvidence(score) !== null
    && assessBenchmarkProvenance(
      score,
      benchmarkDefinitionsById.get(score.benchmark_id),
    ).rankable
  ));
  const publicBenchmarkProvenance = summariseBenchmarkProvenance(
    publicBenchmarkScores,
    cacheBenchmarkDefinitions,
  );
  failures.push(...getBenchmarkProvenanceGateFailures(publicBenchmarkProvenance));

  if (publicBenchmarkScores.length !== exactRankableBenchmarkScores.length) {
    failures.push(
      `Public benchmark selector drift: rendered=${publicBenchmarkScores.length}, `
      + `exact-reviewed-and-current=${exactRankableBenchmarkScores.length}.`,
    );
  }

  const publicBenchmarkByKey = new Map(publicBenchmarkScores.map((score) => [
    `${score.model_id}:${score.benchmark_id}`,
    score,
  ]));

  if (cacheGlossary.length === 0) {
    failures.push('Glossary cache contains zero records.');
  }

  if (cacheEvents.length === 0) {
    failures.push('Events cache contains zero records.');
  }

  const invalidEvents = cacheEvents.filter((event) => (
    !event.id || !event.name || !/^https?:\/\//.test(event.url)
    || (event.date_start != null && !Number.isFinite(Date.parse(event.date_start)))
    || (event.date_end != null && !Number.isFinite(Date.parse(event.date_end)))
  ));
  if (invalidEvents.length > 0) {
    failures.push(`Events cache contains ${invalidEvents.length} invalid record(s).`);
  }

  const cacheEventIds = new Set(cacheEvents.map((event) => event.id));
  const missingRenderedEvents = renderedEvents.filter((event) => !cacheEventIds.has(event.id));
  if (renderedEvents.length !== cacheEvents.length || missingRenderedEvents.length > 0) {
    failures.push(`Events page loader is out of sync with the cache: rendered=${renderedEvents.length}, cache=${cacheEvents.length}`);
  }

  const currentDate = new Date().toISOString().slice(0, 10);
  const upcomingEvents = cacheEvents.filter((event) => (
    event.date_start && (event.date_end ?? event.date_start).slice(0, 10) >= currentDate
  ));
  if (upcomingEvents.length < 4) {
    failures.push(`Events cache has too few upcoming confirmed events: ${upcomingEvents.length}`);
  }

  if (!eventSourceStatus) {
    failures.push('Missing event source-check snapshot: data/events-source-status.json');
  } else if (!eventSourceStatus.live) {
    failures.push('Event source-check snapshot has no live official sources.');
  }

  if (!spreadsheet) {
    failures.push('Missing public model spreadsheet export: public/data/ai-models-comparison.json');
  } else {
    const spreadsheetCount = Number(spreadsheet.model_count ?? 0);
    const spreadsheetRows = spreadsheet.models?.length ?? 0;

    if (spreadsheetCount !== dbCounts.models || spreadsheetRows !== dbCounts.models) {
      failures.push(`Public model spreadsheet is out of sync: export=${spreadsheetCount}/${spreadsheetRows}, db=${dbCounts.models}`);
    }

    if ((spreadsheet.models ?? []).some((model) => !model.status)) {
      failures.push('Public model spreadsheet is missing status values on one or more rows.');
    }

    let exportedBenchmarkCount = 0;
    const spreadsheetModelIds = new Set<string>();
    for (const model of spreadsheet.models ?? []) {
      if (!model.id) continue;
      spreadsheetModelIds.add(model.id);
      const scores = model.benchmarks ?? {};
      const evidenceByBenchmark = model.benchmark_evidence ?? {};

      for (const [benchmarkId, score] of Object.entries(scores)) {
        exportedBenchmarkCount += 1;
        const evidence = evidenceByBenchmark[benchmarkId];
        const candidate = {
          model_id: model.id,
          benchmark_id: benchmarkId,
          score,
          source: evidence?.source,
          source_url: evidence?.source_url,
          measured_at: evidence?.measured_at,
        };
        const verified = findVerifiedBenchmarkScoreEvidence(candidate);
        const selected = publicBenchmarkByKey.get(`${model.id}:${benchmarkId}`);
        if (
          !verified
          || !selected
          || selected.score !== score
          || evidence?.score !== score
          || evidence?.evidence_state !== 'verified-row'
        ) {
          failures.push(`Public spreadsheet exposes an unverified benchmark cell: ${model.id}:${benchmarkId}`);
        }
      }

      for (const benchmarkId of Object.keys(evidenceByBenchmark)) {
        if (!(benchmarkId in scores)) {
          failures.push(`Public spreadsheet has orphan benchmark evidence: ${model.id}:${benchmarkId}`);
        }
      }
    }

    const expectedSpreadsheetBenchmarkCount = publicBenchmarkScores.filter((score) => (
      spreadsheetModelIds.has(score.model_id)
    )).length;
    if (exportedBenchmarkCount !== expectedSpreadsheetBenchmarkCount) {
      failures.push(
        `Public spreadsheet benchmark set drift: export=${exportedBenchmarkCount}, `
        + `expected=${expectedSpreadsheetBenchmarkCount}.`,
      );
    }

    if (
      spreadsheet.benchmark_policy?.evidence_state !== 'exact-reviewed-row'
      || spreadsheet.benchmark_policy?.raw_score_count !== cacheBenchmarkScores.length
      || spreadsheet.benchmark_policy?.rankable_score_count !== exportedBenchmarkCount
      || spreadsheet.benchmark_policy?.quarantined_score_count
        !== cacheBenchmarkScores.length - exportedBenchmarkCount
    ) {
      failures.push('Public spreadsheet benchmark policy counts or evidence state are stale.');
    }
  }

  if (!latestSpreadsheet) {
    failures.push('Missing latest model export: public/data/models-latest.json');
  } else if (spreadsheet && JSON.stringify(latestSpreadsheet) !== JSON.stringify(spreadsheet)) {
    failures.push('models-latest.json does not match the reviewed spreadsheet export.');
  }

  if (!fs.existsSync(path.join(publicDataDir, 'ai-models-comparison.csv'))) {
    failures.push('Missing public model spreadsheet export: public/data/ai-models-comparison.csv');
  }

  if (!providerStatus) {
    failures.push('Missing provider status snapshot: data/provider-status.json');
  } else {
    const generatedAt = providerStatus.generatedAt ? Date.parse(providerStatus.generatedAt) : NaN;
    if (!Number.isFinite(generatedAt)) {
      failures.push('Provider status snapshot is missing a valid generatedAt timestamp.');
    } else if (Date.now() - generatedAt > 1000 * 60 * 60 * 48) {
      failures.push(`Provider status snapshot is stale: generatedAt=${providerStatus.generatedAt}`);
    }
  }

  if (!releaseDesk) {
    failures.push('Missing release desk snapshot: public/data/model-release-desk.json');
  } else {
    const generatedAt = releaseDesk.generatedAt ? Date.parse(releaseDesk.generatedAt) : NaN;
    if (!Number.isFinite(generatedAt)) {
      failures.push('Release desk snapshot is missing a valid generatedAt timestamp.');
    } else if (Date.now() - generatedAt > 1000 * 60 * 60 * 48) {
      failures.push(`Release desk snapshot is stale: generatedAt=${releaseDesk.generatedAt}`);
    }

    const releaseCount = releaseDesk.releases?.length ?? 0;
    if (releaseCount === 0) {
      failures.push('Release desk snapshot contains zero releases.');
    }

    const readyForEditor = releaseDesk.stats?.readyForEditor ?? 0;
    if (releaseCount > 0 && readyForEditor === 0) {
      failures.push('Release desk snapshot contains no editor-ready release briefs.');
    }

    for (const release of releaseDesk.releases ?? []) {
      if (release.verificationState !== 'official' && release.draftStatus !== 'watch_only') {
        failures.push(`Unverified release promoted beyond watch-only: ${release.id ?? 'unknown'} (${release.draftStatus ?? 'missing status'})`);
      }

      if (release.verificationState === 'official' && !release.officialUrl) {
        failures.push(`Official release is missing a model-level source URL: ${release.id ?? 'unknown'}`);
      }

      for (const highlight of release.benchmarkHighlights ?? []) {
        const benchmarkId = highlight.benchmark_id ?? '';
        const candidate = {
          model_id: release.id,
          benchmark_id: benchmarkId,
          score: highlight.score,
          source: highlight.source,
          source_url: highlight.sourceUrl,
          measured_at: highlight.measuredAt,
        };
        const selected = publicBenchmarkByKey.get(`${release.id}:${benchmarkId}`);
        if (
          !release.id
          || !benchmarkId
          || !findVerifiedBenchmarkScoreEvidence(candidate)
          || !selected
          || selected.score !== highlight.score
          || highlight.evidenceState !== 'verified-row'
        ) {
          failures.push(`Release Desk exposes an unverified benchmark highlight: ${release.id ?? 'unknown'}:${benchmarkId || 'unknown'}`);
        }
      }
    }
  }

  if (!generatedReleaseDesk) {
    failures.push('Missing or invalid generated Release Desk TypeScript snapshot.');
  } else if (releaseDesk && JSON.stringify(generatedReleaseDesk) !== JSON.stringify(releaseDesk)) {
    failures.push('Release Desk JSON and generated TypeScript snapshots do not match.');
  }

  const missingFrontier = REQUIRED_FRONTIER_MODELS.filter((requirement) => (
    !cacheModels.some((model) => matchesRequirement(model, requirement))
  ));

  for (const requirement of missingFrontier) {
    failures.push(`Missing required frontier model in public cache: ${requirement.name} (${requirement.sourceUrl})`);
  }

  const newsDiagnostics = getAiResourceHubNewsRoutingDiagnostics(cacheNews.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    source: item.source,
    summary: item.summary ?? '',
    date: (item.published_at ?? item.discovered_at ?? new Date().toISOString()).slice(0, 10),
    dateLabel: '',
    category: 'News',
    tags: [],
    digestDate: (item.published_at ?? item.discovered_at ?? new Date().toISOString()).slice(0, 10),
    importance_score: item.importance_score,
  })));

  // News-routing health is reported as warnings, not failures. An empty or
  // low-quality news category must not block publishing the pricing,
  // benchmark, and model data that the rest of this gate verifies — that
  // coupling froze the whole site refresh when news routing dried up.
  const warnings: string[] = [];

  const quarantinedBenchmarkScores = cacheBenchmarkScores.length - publicBenchmarkScores.length;
  if (quarantinedBenchmarkScores > 0) {
    warnings.push(
      `Benchmark quarantine retains ${quarantinedBenchmarkScores}/${benchmarkProvenance.total} `
      + 'raw rows for source/date remediation; none are eligible for public ranking.',
    );
  }

  const latestEventUpdate = cacheEvents
    .map((event) => event.updated_at ? Date.parse(event.updated_at) : NaN)
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  if (!Number.isFinite(latestEventUpdate)) {
    warnings.push('Events cache has no valid update timestamp.');
  } else if (Date.now() - latestEventUpdate > 1000 * 60 * 60 * 24 * 7) {
    warnings.push(`Events cache is stale: latest update=${new Date(latestEventUpdate).toISOString()}`);
  }

  if (cacheNews.length > 0 && newsDiagnostics.routedItems.length === 0) {
    warnings.push('News routing produced zero publishable AI Resource Hub items from the current cache.');
  }

  if (newsDiagnostics.routedItems.length > 0 && newsDiagnostics.highSignalCount === 0) {
    warnings.push('News routing produced no high-signal stories (model releases, benchmarks, research, pricing, hardware).');
  }

  if (newsDiagnostics.routedItems.length > 0 && newsDiagnostics.officialSourceCount === 0) {
    warnings.push('News routing produced no items from mapped official or routed sources.');
  }

  db?.close();

  console.log('Publish readiness verification');
  console.log(`  SQLite source: ${dbAvailable ? dbPath : 'not present; pg-cache is source of truth'}`);
  console.log(`  Providers: ${cacheProviders.length}/${dbCounts.providers}`);
  console.log(`  Models: ${cacheModels.length}/${dbCounts.models}`);
  console.log(`  Benchmark scores: raw=${cacheBenchmarkScores.length}/${dbCounts.benchmarkScores}, public=${publicBenchmarkScores.length}`);
  console.log(`  Benchmark provenance: ${publicBenchmarkScores.length}/${benchmarkProvenance.total} exact reviewed rows public, ${quarantinedBenchmarkScores} quarantined`);
  console.log(`    URL/date policy alone would admit: ${benchmarkProvenance.rankable}/${benchmarkProvenance.total}`);
  console.log(`    URL-backed / inherited / label-only / missing: ${benchmarkProvenance.urlBacked} / ${benchmarkProvenance.inheritedTraceable} / ${benchmarkProvenance.labelOnly} / ${benchmarkProvenance.missing}`);
  console.log(`    Current / stale / undated / invalid / future: ${benchmarkProvenance.current} / ${benchmarkProvenance.stale} / ${benchmarkProvenance.undated} / ${benchmarkProvenance.invalidDate} / ${benchmarkProvenance.futureDated}`);
  console.log(`  News items: ${cacheNews.length}`);
  console.log(`  Glossary terms: ${cacheGlossary.length}`);
  console.log(`  Events: ${renderedEvents.length}/${cacheEvents.length} (${upcomingEvents.length} upcoming)`);
  console.log(`  Official event sources live: ${eventSourceStatus?.live ?? 0}`);
  console.log(`  Routed AI news items: ${newsDiagnostics.routedItems.length}`);
  console.log(`  High-signal AI news items: ${newsDiagnostics.highSignalCount}`);
  console.log(`  Official/routed source items: ${newsDiagnostics.officialSourceCount}`);
  console.log(`  Public export rows: ${spreadsheet?.model_count ?? 0}`);
  console.log(`  Release desk items: ${releaseDesk?.releases?.length ?? 0}`);
  console.log(`  Provider status snapshot: ${providerStatus?.generatedAt ?? 'missing'}`);

  if (warnings.length > 0) {
    console.log('\nWARN: publish data needs attention (publish not blocked)');
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (failures.length > 0) {
    console.log('\nBLOCK: publish readiness verification failed');
    for (const failure of failures) {
      console.log(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('\nOK publish cache, public exports, rankable-only benchmark presentation, status snapshot, and routing checks passed');
}

main();
