import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { admitMethod, comparisonReasons, renderMethodPanel, METHOD_FIELDS } from '../src/data/benchmark-method.mjs';

const envelope = method => ({ kind: 'synthetic', privacyReview: 'Original synthetic example; no private inputs', rightsReview: 'Original fixture', method });
const internal = { dataset: 'Synthetic office tasks', split: 'demo', version: '1', metric: 'exact-choice accuracy v1', promptVersion: 'prompt-v1', sampling: 'temperature 0', model: 'Example A',
  effort: 'standard', harness: 'synthetic-v1', tools: 'none', attempts: 1, aggregation: 'mean accuracy',
  contextLimit: 8000, tokenLimit: 1000, sampleSize: 100, accuracy: .6, brier: .18,
  coverage: .8, abstention: .2, totalCostUsd: 12, acceptedCorrect: 60,
  measuredAt: '2025-01-01', retrievedAt: '2026-11-16', releasedAt: null, revisedAt: null,
  uncertainty: null, origin: 'Synthetic internal aggregate; not a model evaluation' };
const render = method => renderMethodPanel({ model: method.model, method: admitMethod(envelope(method)), now: new Date('2026-11-16') });

test('public result projection preserves existing source/date and explicit unknowns', () => {
  const rows = JSON.parse(readFileSync('data/pg-cache/benchmark_scores.json', 'utf8'));
  const row = rows.find(r => r.source_url?.startsWith('https://') && r.measured_at);
  assert.ok(row, 'representative existing public score');
  const html = renderMethodPanel({ model: row.model_id, measuredAt: row.measured_at, sourceUrl: row.source_url });
  assert.ok(html.includes(row.measured_at));
  assert.match(html, /Result source/);
  assert.match(html, /Method unknown — comparison unavailable/);
  assert.match(html, /Sample size<\/dt><dd>Unknown/);
});
test('synthetic aggregate separates accuracy, Brier, abstention, cost and dates', () => {
  const html = render(internal);
  assert.match(html, /Accuracy<\/dt><dd>0.6/);
  assert.match(html, /Coverage<\/dt><dd>0.8/);
  assert.match(html, /Abstention<\/dt><dd>0.2/);
  assert.match(html, /Brier \(not a pure calibration grade\)<\/dt><dd>0.18/);
  assert.match(html, /Cost per accepted correct result \(USD\)<\/dt><dd>0.2000/);
  assert.match(html, /Stale measurement/);
  assert.match(html, /Retrieved<\/dt><dd>2026-11-16/);
  assert.match(html, /Model released<\/dt><dd>Unknown/);
});
test('comparison blocks changed and missing protocols without a numeric delta', () => {
  assert.deepEqual(comparisonReasons(internal, { ...internal, attempts: 5, aggregation: 'pass@5' }), ['attempts: incompatible', 'aggregation: incompatible']);
  assert.equal(comparisonReasons(null, internal).length, 13);
  assert.deepEqual(comparisonReasons(internal, internal), []);
});
test('all unknown and zero-denominator costs remain unknown; zero is displayed', () => {
  assert.match(render({ ...internal, accuracy: 0, acceptedCorrect: 0 }), /Accuracy<\/dt><dd>0/);
  assert.match(render({ ...internal, acceptedCorrect: 0 }), /result \(USD\)<\/dt><dd>Unknown/);
  assert.match(render({ ...internal, totalCostUsd: 0 }), /result \(USD\)<\/dt><dd>0.0000/);
});

test('direct renderer rejects invalid cost ratios and preserves tiny positive costs', () => {
  const direct = changes => renderMethodPanel({ model: 'A', method: { ...internal, ...changes } });
  for (const totalCostUsd of ['12', NaN, Infinity, -1]) {
    assert.match(direct({ totalCostUsd }), /result \(USD\)<\/dt><dd>Unknown/);
  }
  for (const acceptedCorrect of ['60', .5, Infinity, 101, Number.MAX_SAFE_INTEGER + 1]) {
    assert.match(direct({ acceptedCorrect }), /result \(USD\)<\/dt><dd>Unknown/);
  }
  assert.match(direct({ sampleSize: -1 }), /result \(USD\)<\/dt><dd>Unknown/);
  assert.match(direct({ totalCostUsd: .000001, acceptedCorrect: 1 }), /result \(USD\)<\/dt><dd>1.000e-6/);
  assert.match(direct({ totalCostUsd: Number.MIN_VALUE, acceptedCorrect: 60 }), /result \(USD\)<\/dt><dd>Unknown/);
  assert.match(direct({ totalCostUsd: 0 }), /result \(USD\)<\/dt><dd>0.0000/);
  assert.match(direct({ sampleSize: null }), /result \(USD\)<\/dt><dd>0.2000/);
});
test('private inputs and raw outputs cannot enter the aggregate contract', () => {
  for (const field of ['holdouts', 'raw_outputs', 'items', 'prompt', 'credentials', 'private_ids']) {
    assert.throws(() => admitMethod({ ...envelope(internal), [field]: ['private'] }));
    assert.throws(() => admitMethod(envelope({ ...internal, [field]: ['private'] })));
  }
  for (const field of METHOD_FIELDS) assert.throws(() => admitMethod(envelope({ ...internal, [field]: { raw: 'private' } })));
  assert.throws(() => admitMethod({ ...envelope(internal), privacyReview: null }));
  assert.throws(() => admitMethod({ ...envelope(internal), rightsReview: null }));
  assert.throws(() => admitMethod({ ...envelope(internal), kind: 'live-holdout' }));
});
test('invalid aggregate numbers and inconsistent counts are rejected', () => {
  for (const value of [NaN, Infinity, -1, '0.8', 1.1]) assert.throws(() => admitMethod(envelope({ ...internal, accuracy: value })));
  assert.throws(() => admitMethod(envelope({ ...internal, acceptedCorrect: 101 })));
  assert.throws(() => admitMethod(envelope({ ...internal, coverage: .9 })));
  assert.throws(() => admitMethod(envelope({ ...internal, attempts: 1.5 })));
});

test('admission preserves exact counts and rejects impossible protocol limits', () => {
  for (const key of ['attempts', 'sampleSize', 'acceptedCorrect', 'contextLimit', 'tokenLimit']) {
    assert.throws(() => admitMethod(envelope({ ...internal, [key]: Number.MAX_SAFE_INTEGER + 1 })));
  }
  for (const key of ['attempts', 'contextLimit', 'tokenLimit']) {
    assert.throws(() => admitMethod(envelope({ ...internal, [key]: 0 })));
    assert.equal(admitMethod(envelope({ ...internal, [key]: null }))[key], null);
  }
  const empty = admitMethod(envelope({ sampleSize: 0, acceptedCorrect: 0, totalCostUsd: 0 }));
  assert.equal(empty.sampleSize, 0);
  assert.equal(empty.acceptedCorrect, 0);
  assert.equal(admitMethod(envelope({ sampleSize: Number.MAX_SAFE_INTEGER })).sampleSize, Number.MAX_SAFE_INTEGER);
});
test('renderer escapes text and rejects executable or credential-bearing source links', () => {
  const html = renderMethodPanel({ model: '<script>alert(1)</script>', sourceUrl: 'javascript:alert(1)' });
  assert.doesNotMatch(html, /<script|href=/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(renderMethodPanel({ model: 'A', sourceUrl: 'https://user:password@example.com' }), /href=/);
});

test('evidence dates reject calendar rollover and ambiguous timestamps', () => {
  for (const value of ['2026-02-30', '2025-02-29', '2026-13-01', '11/16/2026', '2026-11-16T12:00:00', '2026-11-16T24:00:00Z']) {
    for (const key of ['measuredAt', 'retrievedAt', 'releasedAt', 'revisedAt']) {
      assert.throws(() => admitMethod(envelope({ ...internal, [key]: value })));
    }
    assert.match(renderMethodPanel({ model: 'A', measuredAt: value, now: new Date('2026-11-16') }), /Measurement age unknown/);
  }
  for (const value of ['2024-02-29', '2026-11-16T12:00:00Z', '2026-11-16T12:00:00.123+01:00']) {
    assert.equal(admitMethod(envelope({ measuredAt: value })).measuredAt, value);
  }
  assert.match(render({ ...internal, measuredAt: '2026-11-18' }), /future; review required/);
  assert.match(render({ ...internal, measuredAt: '2025-11-16' }), /within 365 days/);
  assert.match(render({ ...internal, measuredAt: '2025-11-15' }), /Stale measurement/);
});
test('semantic disclosure has a named native summary and paired definition fields', () => {
  const html = render(internal);
  assert.match(html, /<details[^>]*><summary>Method and limits for Example A<\/summary>/);
  assert.equal((html.match(/<dt>/g) ?? []).length, (html.match(/<dd>/g) ?? []).length);
  assert.doesNotMatch(html, /<script|<iframe|onclick=|tabindex=/);
  const page = readFileSync('src/pages/benchmarks/[id].astro', 'utf8');
  assert.match(page, /<BenchmarkMethodPanel model=\{s.model_name\}/);
});


test('comparison requires known metric, prompt revision and sampling controls', () => {
  for (const key of ['metric', 'promptVersion', 'sampling']) {
    const missing = { ...internal };
    delete missing[key];
    assert.deepEqual(comparisonReasons(missing, missing), [`${key}: unknown`]);
    assert.deepEqual(comparisonReasons(internal, { ...internal, [key]: 'different' }), [`${key}: incompatible`]);
  }
  assert.deepEqual(comparisonReasons(internal, { ...internal, model: 'Example B' }), []);
});

test('equal unknown placeholders and malformed controls cannot unlock a comparison', () => {
  for (const value of ['', '  ', 'Unknown', 'NOT REPORTED', 'not_reported', 'N/A', 'unspecified', {}, [], 0]) {
    const candidate = { ...internal, harness: value };
    assert.deepEqual(comparisonReasons(candidate, candidate), ['harness: unknown']);
  }
  for (const key of ['attempts', 'contextLimit', 'tokenLimit']) {
    for (const value of [0, -1, 1.5, NaN, Infinity, '1', Number.MAX_SAFE_INTEGER + 1]) {
      const candidate = { ...internal, [key]: value };
      assert.deepEqual(comparisonReasons(candidate, candidate), [`${key}: unknown`]);
    }
  }
  assert.deepEqual(comparisonReasons(internal, internal), []);
});
