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
import { META_BENCHMARK_LEADERBOARD, getMetaBenchmarkOverview, metaEntryCitesBlockedSource } from '../src/data/internal-meta-benchmarks';
import { AI_FINDS as RESEARCH_FINDS } from '../src/data/research-finds';

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

// Cases from the Codex review of PR 107.
test('aliases match across case and separators', () => {
  for (const label of ['artificial_analysis', 'ARTIFICIAL ANALYSIS', 'aa-intelligence-index', 'AA Intelligence Index', 'AA Index 64.9 (#1)', 'AA-Omniscience', 'GDPval-AA', 'https://www.artificialanalysis.ai/x']) {
    assert.equal(blockedSourceFor(label)?.id, 'artificial-analysis', label);
  }
  for (const label of ['chatbot_arena', 'Chatbot Arena', 'lm_arena', 'LM Arena', 'Arena Text', 'Arena Agent', 'https://huggingface.co/spaces/lmarena-ai/arena-leaderboard', 'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard']) {
    assert.equal(blockedSourceFor(label)?.id, 'arena', label);
  }
});

test('Arena-Hard (the open benchmark) is never treated as the Arena service', () => {
  for (const label of ['LMSYS Arena-Hard-Auto', 'https://github.com/lmsys/arena-hard-auto', 'arena_hard', 'Arena Hard Auto v2']) {
    assert.equal(isBlockedSource(label), false, label);
  }
});

test('other hosts are judged by host, not by words in the path', () => {
  assert.equal(isBlockedSource('https://github.com/lmsys/some-other-repo'), false);
  assert.equal(isBlockedSource('https://example.com/artificial-analysis-review'), false);
});

test('meta-benchmark rows built on blocked sources are withheld from public output', () => {
  const withheld = META_BENCHMARK_LEADERBOARD.filter(metaEntryCitesBlockedSource);
  assert.ok(withheld.length > 0, 'fixture should contain AA-based rows');
  const published = getMetaBenchmarkOverview().leaderboard;
  for (const entry of published) {
    assert.equal(metaEntryCitesBlockedSource(entry), false, entry.modelId);
    assert.doesNotMatch(`${entry.primaryMetric} ${entry.sourceSummary ?? ''}`, /\bAA\b|Artificial Analysis|Arena/i, entry.modelId);
  }
  assert.equal(published.length, META_BENCHMARK_LEADERBOARD.length - withheld.length);
});

test('research finds carry no Arena Elo figures', () => {
  for (const find of RESEARCH_FINDS) {
    const text = JSON.stringify(find);
    assert.doesNotMatch(text, /\d{3,4}\s*Elo\b.*(LMArena|Arena)|(LMArena|Chatbot Arena)[^"]*\d{3,4}/i, find.name);
  }
});

test('committed public exports carry no speed from a blocked source', () => {
  const speed = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'pg-cache', 'speed_history.json'), 'utf8')) as Array<{ id: number; model_id: string; source: string }>;
  const latest = new Map<string, { id: number; source: string }>();
  for (const row of speed) { const cur = latest.get(row.model_id); if (!cur || Number(row.id) > cur.id) latest.set(row.model_id, { id: Number(row.id), source: row.source }); }
  for (const file of ['models-latest.json', 'ai-models-comparison.json']) {
    const exported = JSON.parse(readFileSync(path.join(process.cwd(), 'public', 'data', file), 'utf8')) as { models: Array<{ id: string; speed_tps: number | null; ttft_ms: number | null }>; benchmark_policy: { raw_score_count: number } };
    const offenders = exported.models.filter((m) => (m.speed_tps != null || m.ttft_ms != null) && isBlockedSource(latest.get(m.id)?.source));
    assert.deepEqual(offenders.map((m) => m.id), [], file);
    const rawScores = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'pg-cache', 'benchmark_scores.json'), 'utf8')) as unknown[];
    assert.equal(exported.benchmark_policy.raw_score_count, rawScores.length, `${file} raw_score_count keeps blocked rows in the total`);
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
