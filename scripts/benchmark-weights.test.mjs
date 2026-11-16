import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseWeights, normaliseScore } from '../src/data/benchmark-weights.mjs';

const benchmark = (id, category, rest = {}) => ({ id, name: id, category, scale_min: 0, scale_max: 100, higher_is_better: true, ...rest });
const benchmarks = [benchmark('code', 'coding'), benchmark('math', 'maths')];
const model = (id, scores) => ({ id, name: id, scores });
const weights = { coding: 1, maths: 1 };
const models = [model('A', { code: 100, math: 0 }), model('B', { code: 0, math: 90 })];

test('normalisation respects declared scale, direction and true zero', () => {
  assert.equal(normaliseScore(0, benchmarks[0]), 0);
  assert.equal(normaliseScore(25, benchmark('x', 'c', { scale_min: 0, scale_max: 50 })), .5);
  assert.equal(normaliseScore(25, benchmark('x', 'c', { higher_is_better: false })), .75);
  assert.equal(normaliseScore(25, benchmark('x', 'c', { higher_is_better: 0 })), .75);
  for (const value of [null, undefined, NaN, Infinity, -1, 101, '0']) assert.equal(normaliseScore(value, benchmarks[0]), null);
  for (const rest of [{ scale_min: 100 }, { scale_max: NaN }, { higher_is_better: null }]) assert.equal(normaliseScore(25, benchmark('x', 'c', rest)), null);
});
test('hand-calculated baseline and weight perturbation change ranks', () => {
  const result = analyseWeights(benchmarks, models, weights);
  assert.equal(result.scenarioCount, 5);
  assert.equal(result.rows[0].score, 50);
  assert.equal(result.rows[1].score, 45);
  assert.deepEqual(result.rows.map(r => [r.rank, r.bestRank, r.worstRank]), [[1, 1, 2], [2, 1, 2]]);
});
test('missing, null and invalid measurements remain unranked, unlike measured zero', () => {
  for (const scores of [{ code: 100 }, { code: 100, math: null }, { code: 100, math: NaN }, { code: 100, math: 101 }]) {
    const result = analyseWeights(benchmarks, [model('partial', scores), model('zero', { code: 0, math: 0 })], weights);
    const partial = result.rows.find(r => r.id === 'partial');
    assert.equal(partial.coverage, .5);
    assert.equal(partial.score, null);
    assert.equal(partial.rank, null);
    assert.equal(partial.bestRank, null);
    assert.deepEqual(partial.missing, ['math']);
    assert.equal(result.rows[0].id, 'zero');
    assert.equal(result.rows[0].score, 0);
  }
});
test('category shares divide equally across benchmarks without rewarding dense categories', () => {
  const result = analyseWeights([...benchmarks, benchmark('code2', 'coding')], [model('X', { code: 100, code2: 0, math: 100 })], { coding: 1, maths: 3 });
  assert.equal(result.rows[0].score, 87.5);
  const partial = analyseWeights([...benchmarks, benchmark('code2', 'coding')], [model('X', { code: 100, math: 100 })], { coding: 1, maths: 3 });
  assert.equal(partial.rows[0].coverage, .875);
  assert.equal(partial.rows[0].score, null);
});
test('zero weights exclude categories; all zero and empty data produce no ranking', () => {
  const result = analyseWeights(benchmarks, [model('X', { code: 70 })], { coding: 1, maths: 0 });
  assert.equal(result.selectedCount, 1);
  assert.equal(result.rows[0].score, 70);
  for (const bs of [benchmarks, []]) {
    const result = analyseWeights(bs, models, bs.length ? { coding: 0, maths: 0 } : {});
    assert.equal(result.eligibleCount, 0);
    assert.ok(result.rows.every(r => r.rank === null && r.score === null));
  }
});
test('equal values share competition ranks; zero perturbation gives baseline only', () => {
  const result = analyseWeights(benchmarks, [model('A', { code: 100, math: 0 }), model('B', { code: 50, math: 50 }), model('C', { code: 0, math: 0 })], weights, 0);
  assert.equal(result.scenarioCount, 1);
  assert.deepEqual(result.rows.map(r => r.rank), [1, 1, 3]);
  assert.ok(result.rows.every(r => r.bestRank === r.rank && r.worstRank === r.rank));
});
test('scaling weights preserves index and rank sensitivity; inputs stay untouched', () => {
  const original = JSON.stringify({ benchmarks, models, weights });
  assert.deepEqual(analyseWeights(benchmarks, models, weights), analyseWeights(benchmarks, models, { coding: 10, maths: 10 }));
  assert.equal(JSON.stringify({ benchmarks, models, weights }), original);
});
test('malformed settings and duplicate identities fail explicitly', () => {
  for (const w of [{ coding: Number.MIN_VALUE }, { coding: .5 }, { coding: -1 }, { coding: NaN }, { coding: Infinity }, { coding: '1' }, { coding: 101 }, { missing: 1 }]) assert.throws(() => analyseWeights(benchmarks, models, w));
  for (const delta of [-1, .51, NaN, Infinity]) assert.throws(() => analyseWeights(benchmarks, models, weights, delta));
  assert.throws(() => analyseWeights([...benchmarks, benchmarks[0]], models, weights));
  assert.throws(() => analyseWeights(benchmarks, [...models, models[0]], weights));
});
