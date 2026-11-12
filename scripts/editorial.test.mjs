import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEditorial, numbersIn, storiesByDay, quantitiesIn } from './validate-editorial.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decide, ukYesterday } from './editorial-precheck.mjs';

const A = 'https://example.com/united-agents';
const B = 'https://example.com/raise';
const day = new Map([
  [A, "United won't let your AI agent book your flight United says it won't let personal AI assistants book tickets, citing privacy and regulatory concerns."],
  [B, 'Startup raises $40m Series B The round values the company at $1,200m.'],
]);

test('a grounded file passes', () => {
  const problems = validateEditorial('2026-11-11', {
    lead_url: A,
    sixty_seconds: 'United ruled out bookings by personal AI agents. A startup raised $40m. 2 stories in all.',
    why_it_matters: { [A]: "Agent builders can't count on airline sites accepting automated bookings; United cites privacy and regulation." },
  }, day);
  assert.deepEqual(problems, []);
});

test('unknown story URLs and lead are rejected', () => {
  const problems = validateEditorial('2026-11-11', { lead_url: 'https://x.test/1', why_it_matters: { 'https://x.test/2': 'Fine line.' } }, day);
  assert.equal(problems.length, 2);
});

test('numbers not in the story text are rejected', () => {
  const problems = validateEditorial('2026-11-11', { why_it_matters: { [B]: 'The round is worth $50m to investors.' } }, day);
  assert.match(problems.join(' '), /number "\$50m"/);
});

test('numbers in the source, including with commas, are allowed', () => {
  assert.deepEqual(numbersIn('$1,200m and 4.5 and 40'), ['1200', '4.5', '40']);
  assert.deepEqual(validateEditorial('2026-11-11', { why_it_matters: { [B]: 'A $1,200m valuation for a Series B company.' } }, day), []);
});

test('em dashes, stock phrases and long lines are rejected', () => {
  const long = Array.from({ length: 31 }, () => 'word').join(' ');
  const problems = validateEditorial('2026-11-11', {
    sixty_seconds: 'A pivotal day — truly.',
    why_it_matters: { [A]: long, [B]: 'This matters because money.' },
  }, day);
  const text = problems.join(' | ');
  assert.match(text, /em dash/);
  assert.match(text, /pivotal/);
  assert.match(text, /31 words/);
  assert.match(text, /this matters because/i);
});

test('bad file names, unknown keys and empty days are rejected', () => {
  assert.match(validateEditorial('latest', {}, day)[0], /YYYY-MM-DD/);
  assert.match(validateEditorial('2026-11-11', { extra: 1 }, day)[0], /unknown key/);
  assert.match(validateEditorial('2026-11-11', {}, new Map()).join(' '), /no stories/);
});

test('stories are grouped by UK day', () => {
  const byDay = storiesByDay([
    { url: 'u1', title: 't', summary: 's', published_at: '2026-11-11T23:30:00.000Z' },
    { url: 'u2', title: 't', summary: 's', published_at: '2026-07-01T23:30:00.000Z' }, // BST: already 2 July in the UK
  ]);
  assert.ok(byDay.get('2026-11-11').has('u1'));
  assert.ok(byDay.get('2026-07-02').has('u2'));
});

const now = new Date('2026-11-12T06:30:00Z');
const edition = (date, newest) => ({ date, newestStoryAt: newest, stories: [{ url: A, publishedAt: newest }] });
const never = (path) => path.startsWith('src/data/newsletter-archive/'); // archive frozen, notes not written

test('precheck: ready for yesterday with a fresh feed', () => {
  assert.equal(ukYesterday(now), '2026-11-11');
  const result = decide(edition('2026-11-11', '2026-11-11T23:50:00Z'), now, never);
  assert.equal(result.ok, true);
  assert.equal(result.path, 'src/data/newsletter-editorial/2026-11-11.json');
});

test('precheck: stale feed (newest story over 36 hours old) writes nothing', () => {
  const result = decide(edition('2026-11-10', '2026-11-10T17:00:00Z'), now, never);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'stale');
});

test('precheck: skips when the file exists, the edition is not yesterday, or the fetch failed', () => {
  assert.equal(decide(edition('2026-11-11', '2026-11-11T23:50:00Z'), now, () => true).reason, 'already-written');
  assert.equal(decide(edition('2026-11-11', '2026-11-11T23:50:00Z'), now, () => false).reason, 'not-frozen', 'no notes until the day is frozen');
  assert.equal(decide(edition('2026-11-10', '2026-11-11T20:00:00Z'), now, never).reason, 'not-yesterday');
  assert.equal(decide(null, now, never).reason, 'fetch-failed');
  assert.equal(decide({ date: null, stories: [] }, now, never).reason, 'no-edition');
});

test('precheck: yesterday is right across the clock change', () => {
  assert.equal(ukYesterday(new Date('2026-03-29T00:30:00Z')), '2026-03-28');
  assert.equal(ukYesterday(new Date('2026-10-25T23:30:00Z')), '2026-10-24');
});

/* ---------- regressions for the Codex review of 02c5b871 (#87) ---------- */

const reject = (data, pattern) => {
  const problems = validateEditorial('2026-11-11', data, day);
  assert.ok(problems.length > 0, `expected a rejection for ${JSON.stringify(data)}`);
  if (pattern) assert.match(problems.join(' | '), pattern);
};

test('[P1] invented amounts are rejected even when the digit is a small count', () => {
  reject({ sixty_seconds: 'The company raised $2 billion.' }, /\$2 billion/);
  reject({ sixty_seconds: 'The company raised fifty billion dollars.' }, /50 billion dollars/);
  reject({ why_it_matters: { [B]: 'A $40bn round is huge for a Series B.' } }, /\$40bn/);
  reject({ sixty_seconds: 'Funding rose 2% today.' }, /2%/);
  reject({ sixty_seconds: '3 stories in all.' }, /"3"/); // only 2 stories that day
  reject({ sixty_seconds: 'The startup hired 2 executives.' }, /"2"/); // not count wording
});

test('[P1] the same quantity in another form is accepted', () => {
  assert.deepEqual(validateEditorial('2026-11-11', { why_it_matters: { [B]: 'A 40 million dollar raise, valuing it at $1.2bn.' } }, day), []);
  assert.deepEqual(validateEditorial('2026-11-11', { sixty_seconds: 'Two stories: one on agents, one on a $40m raise.' }, day), []);
  assert.deepEqual(validateEditorial('2026-11-11', { sixty_seconds: '2 stories from 2 sources in 2026.' }, day), []);
});

test('quantities keep value, size and unit', () => {
  const q = (text) => quantitiesIn(text).map((item) => [item.value, item.currency, item.percent]);
  assert.deepEqual(q('$40m'), [[40e6, 'USD', false]]);
  assert.deepEqual(q('40 million dollars'), [[40e6, 'USD', false]]);
  assert.deepEqual(q('£1,200m'), [[1.2e9, 'GBP', false]]);
  assert.deepEqual(q('a billion pounds'), [[1e9, 'GBP', false]]);
  assert.deepEqual(q('twenty-five per cent'), [[25, null, true]]);
  assert.deepEqual(q('one of the biggest'), [], 'a lone prose "one" is not a number');
});

test('category counts in the 60-second text must match the edition', () => {
  const tagged = new Map([
    [A, { text: day.get(A), source: 'Reuters', category: 'Agents' }],
    [B, { text: day.get(B), source: 'TechCrunch', category: 'Industry' }],
  ]);
  assert.deepEqual(validateEditorial('2026-11-11', { sixty_seconds: '2 stories from 2 sources: 1 Agents and 1 Industry.' }, tagged), []);
  assert.match(validateEditorial('2026-11-11', { sixty_seconds: '2 Agents stories today.' }, tagged).join(' '), /"2"/);
  assert.match(validateEditorial('2026-11-11', { sixty_seconds: '2 stories from 3 sources.' }, tagged).join(' '), /"3"/);
});

test('[P2] non-string values and a null map are schema errors, not crashes', () => {
  reject({ sixty_seconds: true }, /sixty_seconds must be a string/);
  reject({ sixty_seconds: { text: 'x' } }, /sixty_seconds must be a string/);
  reject({ why_it_matters: { [A]: { text: 'Anything' } } }, /must be a string/);
  reject({ why_it_matters: { [A]: false } }, /must be a string/);
  reject({ why_it_matters: null }, /must be an object/);
  reject({ why_it_matters: [] }, /must be an object/);
  reject({ lead_url: 42 }, /lead_url must be a string/);
});

test('[P2] the CLI exits 1 with a schema error (no uncaught TypeError) for a null map', () => {
  const dir = mkdtempSync(join(tmpdir(), 'airh-editorial-'));
  const file = join(dir, '2026-11-11.json');
  writeFileSync(file, JSON.stringify({ why_it_matters: null }));
  const run = spawnSync(process.execPath, ['scripts/validate-editorial.mjs', file], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /why_it_matters must be an object/);
  assert.doesNotMatch(run.stderr, /TypeError/);
});