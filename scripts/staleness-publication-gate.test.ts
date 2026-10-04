import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { verifyPublicationMode, benchmarkAuditSeverity } from './staleness-publication-gate';
import { summariseBenchmarkProvenance, getBenchmarkProvenanceGateFailures } from './benchmark-provenance';

const rows = [
  { model_id: 'example', benchmark_id: 'test', source: 'Example', source_url: 'https://example.com/result', measured_at: '2020-01-01' },
  { model_id: 'example-2', benchmark_id: 'test', source: 'Unverified label', measured_at: null },
];
const summary = () => summariseBenchmarkProvenance(rows, [{ id: 'test', url: null }], { now: new Date('2026-10-04'), maxAgeDays: 365 });

test('raw audit stays strict and never invokes public verification implicitly', () => {
  const mode = verifyPublicationMode([], () => { throw new Error('must not run'); });
  assert.equal(mode, false);
  assert.deepEqual(benchmarkAuditSeverity(summary().unrankable, mode), { criticals: 2, warnings: 0 });
  assert.ok(getBenchmarkProvenanceGateFailures(summary()).length > 0);
});

test('verified safe publication retains raw warnings without changing evidence or dates', () => {
  const before = JSON.stringify(rows);
  let calls = 0;
  const mode = verifyPublicationMode(['--publication'], () => { calls++; return true; });
  assert.equal(calls, 1);
  assert.deepEqual(benchmarkAuditSeverity(summary().unrankable, mode), { criticals: 0, warnings: 2 });
  assert.equal(JSON.stringify(rows), before);
  assert.ok(getBenchmarkProvenanceGateFailures(summary()).length > 0);
});

test('unsafe or unavailable public verification blocks publication mode', () => {
  assert.throws(() => verifyPublicationMode(['--publication'], () => false), /Publication verification failed/);
  assert.throws(() => verifyPublicationMode(['--publication'], () => { throw new Error('verification unavailable'); }), /verification unavailable/);
  assert.throws(() => verifyPublicationMode(['--skip-checks'], () => true), /Unknown/);
});

test('refresh keeps publication verification and all checks before committing data', () => {
  const workflow = readFileSync(new URL('../.github/workflows/scrape.yml', import.meta.url), 'utf8');
  assert.match(workflow, /check-staleness\.ts --publication/);
  assert.ok(workflow.indexOf('npm run verify:publish') < workflow.indexOf('- name: Commit updated data'));
  assert.doesNotMatch(workflow, /continue-on-error/);
});
