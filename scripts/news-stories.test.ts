import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildHubStories, loadStoryArchive, modelsNamedIn, slugify, storySlug, urlHash, type ArchivedStoryDay } from '../src/data/news-stories';

const story = (i: number, publishedAt: string, extra: Record<string, unknown> = {}) =>
  ({
    id: `s${i}`,
    title: `Story ${i}: Lab ships a model`,
    url: `https://example.com/story-${i}`,
    source: 'Example',
    summary: `Summary ${i}`,
    publishedAt,
    category: 'models',
    tags: [],
    importance: 50,
    ...extra,
  }) as any;

test('slugs are readable, bounded and stable', () => {
  assert.equal(slugify("OpenAI’s GPT-5.4 &amp; Claude: what's new?"), 'openais-gpt-5-4-claude-whats-new');
  assert.ok(slugify('word '.repeat(40)).length <= 70);
  assert.ok(!slugify('word '.repeat(40)).endsWith('-'));
  assert.equal(urlHash('https://example.com/a'), urlHash('https://example.com/a'));
  assert.notEqual(storySlug({ title: 'Same title', url: 'https://a.test/1' }), storySlug({ title: 'Same title', url: 'https://a.test/2' }));
});

test('a frozen story page survives the cache dropping the story', () => {
  const day = '2026-11-10';
  const s1 = story(1, '2026-11-10T09:00:00Z');
  const storyArchive = new Map<string, ArchivedStoryDay>([[day, { version: 1, date: day, snapshotAt: '2026-11-11T07:00:00Z', stories: [s1] }]]);
  const before = buildHubStories({ storyArchive, editionArchive: new Map(), live: new Map([[day, [s1]]]) });
  const after = buildHubStories({ storyArchive, editionArchive: new Map(), live: new Map() }); // rolled out of the cache
  assert.deepEqual(after.map((s) => s.path), before.map((s) => s.path));
  assert.equal(after[0].frozen, true);
});

test('live stories fill only days with no story archive; frozen days ignore late arrivals', () => {
  const frozenDay = '2026-11-10';
  const s1 = story(1, '2026-11-10T09:00:00Z');
  const late = story(2, '2026-11-10T22:00:00Z');
  const today = story(3, '2026-11-12T09:00:00Z');
  const storyArchive = new Map<string, ArchivedStoryDay>([[frozenDay, { version: 1, date: frozenDay, snapshotAt: 'x', stories: [s1] }]]);
  const stories = buildHubStories({ storyArchive, editionArchive: new Map(), live: new Map([[frozenDay, [s1, late]], ['2026-11-12', [today]]]) });
  assert.deepEqual(stories.map((s) => s.id).sort(), ['s1', 's3']);
  assert.equal(stories.find((s) => s.id === 's3')!.frozen, false);
});

test('edition picks always get a page, even if the story archive lacks them', () => {
  const day = '2026-11-09';
  const pick = story(7, '2026-11-09T10:00:00Z');
  const stories = buildHubStories({ storyArchive: new Map(), editionArchive: new Map([[day, { stories: [pick] }]]), live: new Map() });
  assert.equal(stories.length, 1);
  assert.match(stories[0].path, /^news\/2026-11-09\/story-7-lab-ships-a-model-[0-9a-f]{6}\/$/);
});

test('model names match exactly, not inside longer versions', () => {
  const models = [
    { id: 'gpt-5.4', name: 'GPT-5.4' },
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini' },
    { id: 'gemini-3.1', name: 'Gemini 3.1' },
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
    { id: 'o3', name: 'o3' },
  ];
  const ids = (text: string) => modelsNamedIn(text, models).map((m) => m.id).sort();
  assert.deepEqual(ids('OpenAI ships GPT-5.4 to everyone.'), ['gpt-5.4']);
  assert.deepEqual(ids('GPT-5.45 is rumoured'), []);
  assert.deepEqual(ids('Notes on GPT-5.4-turbo'), []);
  assert.deepEqual(ids('Google updates Gemini 3.1 Pro pricing'), ['gemini-3.1-pro']);
  assert.deepEqual(ids('The o3 model'), [], 'names under 4 characters are skipped');
  assert.deepEqual(ids('Nothing about models here'), []);
});

test('a malformed story archive file fails the build', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'airh-stories-'));
  fs.writeFileSync(path.join(dir, '2026-11-01.json'), JSON.stringify({ version: 1, date: '2026-11-02', stories: [] }));
  assert.throws(() => loadStoryArchive(dir), /not a valid story archive/);
});

test('the committed story archive loads, every file matches its date and every story has a unique page', () => {
  const archive = loadStoryArchive();
  const paths = new Set<string>();
  for (const [date, day] of archive) {
    assert.equal(day.date, date);
    for (const s of day.stories) {
      const p = `news/${date}/${storySlug(s)}/`;
      assert.ok(!paths.has(p), `duplicate path ${p}`);
      paths.add(p);
    }
  }
});
