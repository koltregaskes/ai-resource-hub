/**
 * Hub #1569: numbers from sources whose current terms bar our use must never
 * reach a page, export or score. The labels below are the real source names and
 * URLs found in data/pg-cache on 14 Nov 2026.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { blockedSourceFor, isBlockedSource } from '../src/data/source-policy';
import { getBenchmarkScores, getModels, getModelsWithTTFT, getModelsWithMultipleEndpoints } from '../src/db/pg-cache';

test('real Artificial Analysis labels are blocked', () => {
  for (const label of ['artificialanalysis.ai (validated)', 'artificial-analysis', 'Artificial Analysis', 'https://artificialanalysis.ai/leaderboards/models']) {
    assert.equal(blockedSourceFor(label)?.id, 'artificial-analysis', label);
  }
});

test('real Arena labels are blocked', () => {
  for (const label of ['LMSYS', 'LMSYS (validated)', 'LMSYS Chatbot Arena (live)', 'https://chat.lmsys.org', 'LM Arena', 'https://lmarena.ai/leaderboard', 'https://arena.ai/leaderboard']) {
    assert.equal(blockedSourceFor(label)?.id, 'arena', label);
  }
});

test('licensed and first-party sources are not blocked', () => {
  for (const label of ['OpenAI', 'Anthropic evaluation', 'Expert Review', 'openrouter.ai/api/v1/models', 'https://epoch.ai/benchmarks', 'arena-hard', 'Arena-Hard', null, undefined, '']) {
    assert.equal(isBlockedSource(label), false, String(label));
  }
});

test('a row is blocked if either its name or its URL is', () => {
  assert.equal(isBlockedSource('Validated', 'https://chat.lmsys.org'), true);
  assert.equal(isBlockedSource('Artificial Analysis', null), true);
});

test('no public model carries speed from a blocked source', () => {
  const raw = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'pg-cache', 'models.json'), 'utf8')) as Array<{ id: string; speed_source: string | null; speed: number }>;
  const rawBlocked = raw.filter((m) => isBlockedSource(m.speed_source) && Number(m.speed) > 0);
  assert.ok(rawBlocked.length > 0, 'the fixture should contain blocked speed rows, or this test proves nothing');
  const publicById = new Map(getModels().map((m) => [m.id, m]));
  for (const m of rawBlocked) {
    const pub = publicById.get(m.id);
    assert.ok(pub, m.id);
    assert.equal(pub!.speed, 0, `${m.id} speed`);
    assert.equal(pub!.ttft, 0, `${m.id} ttft`);
    assert.equal((pub as { speed_source: string | null }).speed_source, null, `${m.id} speed_source`);
  }
  assert.equal(getModelsWithTTFT().filter((m) => isBlockedSource(m.speed_source)).length, 0);
});

test('no public benchmark score comes from a blocked source', () => {
  const raw = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'pg-cache', 'benchmark_scores.json'), 'utf8')) as Array<{ source: string; source_url: string | null }>;
  assert.ok(raw.some((r) => isBlockedSource(r.source, r.source_url)), 'the fixture should contain blocked rows');
  assert.equal(getBenchmarkScores().filter((s) => isBlockedSource(s.source, s.source_url)).length, 0);
});

test('provider endpoints from blocked sources are not shown', () => {
  const raw = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'pg-cache', 'provider_endpoints.json'), 'utf8')) as Array<{ model_id: string; source: string }>;
  const licensedModels = new Set(raw.filter((e) => !isBlockedSource(e.source)).map((e) => e.model_id));
  for (const row of getModelsWithMultipleEndpoints()) assert.ok(licensedModels.has(row.model_id), row.model_id);
});
