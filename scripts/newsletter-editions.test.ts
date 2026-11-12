import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildEditions, isSettled, loadArchive, pickDays, type ArchivedDay } from '../src/data/newsletter-editions';

const CATEGORIES = ['models', 'tools', 'agents', 'research', 'industry', 'policy', 'voices'] as const;

function story(i: number, publishedAt: string, extra: Record<string, unknown> = {}) {
  return {
    id: `s${i}`,
    title: `Story ${i}`,
    url: `https://example.com/story-${i}`,
    source: `Source ${i % 5}`,
    summary: `Summary ${i}`,
    publishedAt,
    readerCategory: CATEGORIES[i % CATEGORIES.length],
    readerTags: [],
    importance_score: (i * 37) % 100,
    ...extra,
  } as any;
}

const noEditorial = () => null;

/** Freeze every settled day the way scripts/snapshot-editions.ts does. */
function snapshot(stories: any[], now: Date, archive = new Map<string, ArchivedDay>()) {
  for (const [date, day] of pickDays(stories, now)) {
    if (!isSettled(date, now) || archive.has(date)) continue;
    archive.set(date, { version: 1, date, snapshotAt: now.toISOString(), totalAvailable: day.totalAvailable, stories: day.picked });
  }
  return archive;
}

// 61 stories over 13 Oct to 12 Nov, like the cache Codex used.
const ORIGINAL = Array.from({ length: 61 }, (_, i) => story(i, new Date(Date.UTC(2026, 9, 13, 9) + i * 12 * 3_600_000).toISOString()));
const NOW = new Date('2026-11-12T20:00:00Z');

test('250 newer stories do not remove or rewrite a closed edition', () => {
  const archive = snapshot(ORIGINAL, NOW);
  const before = buildEditions({ stories: ORIGINAL, archive, now: NOW, editorialFor: noEditorial });
  const closedBefore = before.filter((edition) => !edition.isToday);
  assert.ok(closedBefore.length >= 25, `expected many closed editions, got ${closedBefore.length}`);

  // The rolling cache now keeps only the newest 250 stories, all from 13 Nov.
  const later = new Date('2026-11-13T22:00:00Z');
  const newer = Array.from({ length: 250 }, (_, i) => story(1000 + i, new Date(Date.UTC(2026, 10, 13, 8) + i * 60_000).toISOString()));
  const rolled = [...newer, ...ORIGINAL].slice(0, 250);
  assert.ok(rolled.every((item) => item.publishedAt.startsWith('2026-11-13')), 'fixture: every original row has rolled out');

  const after = buildEditions({ stories: rolled, archive: snapshot(rolled, later, archive), now: later, editorialFor: noEditorial });
  for (const edition of closedBefore) {
    const same = after.find((candidate) => candidate.date === edition.date);
    assert.ok(same, `edition ${edition.date} disappeared`);
    assert.deepEqual({ ...same, isToday: false }, edition, `edition ${edition.date} was rewritten`);
  }
});

test('an archived day wins over different live stories for the same date', () => {
  const archive = snapshot(ORIGINAL, NOW);
  const date = '2026-11-01';
  assert.ok(archive.has(date));
  const intruder = story(9999, '2026-11-01T12:00:00Z', { importance_score: 1000, title: 'Late arrival' });
  const editions = buildEditions({ stories: [intruder, ...ORIGINAL], archive, now: NOW, editorialFor: noEditorial });
  const edition = editions.find((candidate) => candidate.date === date)!;
  assert.ok(![edition.lead, ...edition.stories].some((s) => s.title === 'Late arrival'));
});

test('a day only settles SETTLE_HOURS after UK midnight (GMT and BST)', () => {
  assert.equal(isSettled('2026-11-11', new Date('2026-11-12T05:59:00Z')), false);
  assert.equal(isSettled('2026-11-11', new Date('2026-11-12T06:00:00Z')), true);
  // BST: UK midnight on 1 Jul is 23:00 UTC on 30 Jun, so +6h is 05:00 UTC.
  assert.equal(isSettled('2026-06-30', new Date('2026-07-01T04:59:00Z')), false);
  assert.equal(isSettled('2026-06-30', new Date('2026-07-01T05:00:00Z')), true);
  assert.equal(isSettled('2026-11-12', NOW), false);
});

test('today and the unsettled day are not frozen', () => {
  const morning = new Date('2026-11-12T05:00:00Z');
  const archive = snapshot(ORIGINAL, morning);
  assert.equal(archive.has('2026-11-12'), false);
  assert.equal(archive.has('2026-11-11'), false);
  assert.equal(archive.has('2026-11-10'), true);
});

test('a malformed archive file fails loudly instead of falling back to the cache', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'airh-archive-'));
  fs.writeFileSync(path.join(dir, '2026-11-01.json'), JSON.stringify({ version: 1, date: '2026-11-02', stories: [] }));
  assert.throws(() => loadArchive(dir), /not a valid archived edition/);
});

test('the committed archive loads and every file matches its date', () => {
  const archive = loadArchive();
  for (const [date, day] of archive) {
    assert.equal(day.date, date);
    assert.ok(day.stories.length > 0 && day.stories.length <= 15);
  }
});
