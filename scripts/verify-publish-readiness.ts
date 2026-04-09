#!/usr/bin/env npx tsx
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_FRONTIER_MODELS, type FrontierModelRequirement } from './frontier-registry';
import { getAiResourceHubNewsRoutingDiagnostics } from '../src/data/news-routing';

const repoRoot = process.cwd();
const dbPath = path.join(repoRoot, 'data', 'the-ai-resource-hub.db');
const cacheDir = path.join(repoRoot, 'data', 'pg-cache');
const publicDataDir = path.join(repoRoot, 'public', 'data');
const providerStatusPath = path.join(repoRoot, 'data', 'provider-status.json');
const releaseDeskPath = path.join(publicDataDir, 'model-release-desk.json');
interface CacheModel {
  id: string;
  name?: string | null;
  provider_name?: string | null;
  status?: string | null;
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

interface SpreadsheetExport {
  generated?: string;
  model_count?: number;
  active_model_count?: number;
  tracking_model_count?: number;
  models?: Array<{ id?: string; status?: string | null }>;
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
  releases?: Array<{ id?: string; draftStatus?: string | null }>;
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
  const db = new Database(dbPath, { readonly: true });
  const failures: string[] = [];

  const cacheModels = loadJson<CacheModel>('models').filter((model) => (model.status ?? 'active') !== 'retired');
  const cacheProviders = loadJson<Record<string, unknown>>('providers');
  const cacheBenchmarks = loadJson<Record<string, unknown>>('benchmark_scores');
  const cacheNews = loadJson<CacheNews>('news');
  const spreadsheet = loadJsonFile<SpreadsheetExport>(path.join(publicDataDir, 'ai-models-comparison.json'));
  const latestSpreadsheet = loadJsonFile<SpreadsheetExport>(path.join(publicDataDir, 'models-latest.json'));
  const providerStatus = loadJsonFile<ProviderStatusSnapshot>(providerStatusPath);
  const releaseDesk = loadJsonFile<ReleaseDeskSnapshot>(releaseDeskPath);

  const dbCounts = {
    providers: Number((db.prepare('SELECT COUNT(*) AS count FROM providers').get() as { count: number }).count),
    models: Number((db.prepare('SELECT COUNT(*) AS count FROM models').get() as { count: number }).count),
    benchmarkScores: Number((db.prepare('SELECT COUNT(*) AS count FROM benchmark_scores').get() as { count: number }).count),
  };

  if (cacheProviders.length < dbCounts.providers) {
    failures.push(`Provider cache lagging local DB: cache=${cacheProviders.length}, db=${dbCounts.providers}`);
  }

  if (cacheModels.length < dbCounts.models) {
    failures.push(`Model cache lagging local DB: cache=${cacheModels.length}, db=${dbCounts.models}`);
  }

  if (cacheBenchmarks.length < dbCounts.benchmarkScores) {
    failures.push(`Benchmark score cache lagging local DB: cache=${cacheBenchmarks.length}, db=${dbCounts.benchmarkScores}`);
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
  }

  if (!latestSpreadsheet) {
    failures.push('Missing latest model export: public/data/models-latest.json');
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

  if (cacheNews.length > 0 && newsDiagnostics.routedItems.length === 0) {
    failures.push('News routing produced zero publishable AI Resource Hub items from the current cache.');
  }

  if (newsDiagnostics.routedItems.length > 0 && newsDiagnostics.highSignalCount === 0) {
    failures.push('News routing produced no high-signal stories (model releases, benchmarks, research, pricing, hardware).');
  }

  if (newsDiagnostics.routedItems.length > 0 && newsDiagnostics.officialSourceCount === 0) {
    failures.push('News routing produced no items from mapped official or routed sources.');
  }

  db.close();

  console.log('Publish readiness verification');
  console.log(`  Providers: ${cacheProviders.length}/${dbCounts.providers}`);
  console.log(`  Models: ${cacheModels.length}/${dbCounts.models}`);
  console.log(`  Benchmark scores: ${cacheBenchmarks.length}/${dbCounts.benchmarkScores}`);
  console.log(`  News items: ${cacheNews.length}`);
  console.log(`  Routed AI news items: ${newsDiagnostics.routedItems.length}`);
  console.log(`  High-signal AI news items: ${newsDiagnostics.highSignalCount}`);
  console.log(`  Official/routed source items: ${newsDiagnostics.officialSourceCount}`);
  console.log(`  Public export rows: ${spreadsheet?.model_count ?? 0}`);
  console.log(`  Release desk items: ${releaseDesk?.releases?.length ?? 0}`);
  console.log(`  Provider status snapshot: ${providerStatus?.generatedAt ?? 'missing'}`);

  if (failures.length > 0) {
    console.log('\nBLOCK: publish readiness verification failed');
    for (const failure of failures) {
      console.log(`  - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('\nOK publish cache, public exports, and status snapshot match local data and pass routing checks');
}

main();
