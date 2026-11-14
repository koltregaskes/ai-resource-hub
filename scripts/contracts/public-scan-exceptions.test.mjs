import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { INDEXNOW_KEY } from '../seo-ping.mjs';

test('the sole IndexNow scan exception is a published ownership proof', () => {
  // https://www.indexnow.org/documentation requires hosting this token as a public text file.
  // Boolean assertions deliberately avoid including a token value in failure output.
  assert.ok(/^[a-zA-Z0-9-]{8,128}$/.test(INDEXNOW_KEY), 'Ownership token has a safe filename');
  const file = new URL('../../public/' + INDEXNOW_KEY + '.txt', import.meta.url);
  assert.ok(fs.existsSync(file), 'Ownership verification file exists');
  assert.ok(fs.readFileSync(file, 'utf8').trim() === INDEXNOW_KEY, 'Token matches published verification file');
  const annotations = fs.readFileSync(new URL('../seo-ping.mjs', import.meta.url), 'utf8').split(/\r?\n/).filter(line => line.includes('gitleaks:allow'));
  assert.equal(annotations.length, 1, 'Exactly one narrowly scoped annotation');
  assert.ok(/^export const INDEXNOW_KEY = ['"][a-zA-Z0-9-]{8,128}['"]; \/\/ gitleaks:allow$/.test(annotations[0]), 'Exception applies only to the single public ownership declaration');
});

test('the newsletter signing fixture is explicitly synthetic', () => {
  const source = fs.readFileSync(new URL('../../workers/newsletter/test/worker.test.mjs', import.meta.url), 'utf8');
  assert.ok(source.includes("SIGNING_KEY: 'local-test-only-'.repeat(4)"), 'Fixture is constructed from a non-secret test marker');
});
