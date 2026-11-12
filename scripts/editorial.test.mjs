import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEditorial, numbersIn, storiesByDay } from './validate-editorial.mjs';
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
  assert.match(problems.join(' '), /number 50/);
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
const never = () => false;

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
  assert.equal(decide(edition('2026-11-10', '2026-11-11T20:00:00Z'), now, never).reason, 'not-yesterday');
  assert.equal(decide(null, now, never).reason, 'fetch-failed');
  assert.equal(decide({ date: null, stories: [] }, now, never).reason, 'no-edition');
});

test('precheck: yesterday is right across the clock change', () => {
  assert.equal(ukYesterday(new Date('2026-03-29T00:30:00Z')), '2026-03-28');
  assert.equal(ukYesterday(new Date('2026-10-25T23:30:00Z')), '2026-10-24');
});
