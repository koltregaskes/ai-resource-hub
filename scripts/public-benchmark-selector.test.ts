#!/usr/bin/env npx tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAllBenchmarkScores,
  getBenchmarks,
  getBenchmarkScores,
} from '../src/db/pg-cache';
import { summariseBenchmarkProvenance } from './benchmark-provenance';

test('public benchmark selector excludes every non-rankable cache row', () => {
  const allScores = getAllBenchmarkScores();
  const publicScores = getBenchmarkScores();
  const benchmarks = getBenchmarks();
  const rawSummary = summariseBenchmarkProvenance(allScores, benchmarks);
  const publicSummary = summariseBenchmarkProvenance(publicScores, benchmarks);

  assert.ok(allScores.length > 0, 'raw benchmark cache must not be empty');
  assert.ok(publicScores.length > 0, 'public benchmark selector must retain verified evidence');
  assert.equal(publicScores.length, rawSummary.rankable);
  assert.equal(publicSummary.unrankable, 0);
  assert.equal(publicSummary.rankable, publicScores.length);
});
