import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { routeAiResourceHubNews, type NewsRouteCandidate } from '../src/data/news-routing.ts';
import { newsPipelineSnapshot } from '../src/data/news-pipeline.generated.ts';

const catalog = JSON.parse(readFileSync(
  new URL('../shared/website-tools/pipelines/news/tag-catalog.json', import.meta.url),
  'utf8',
));
const filters = JSON.parse(readFileSync(
  new URL('../shared/website-tools/pipelines/news/site-filters.json', import.meta.url),
  'utf8',
));
const sources = JSON.parse(readFileSync(
  new URL('../shared/website-tools/pipelines/news/config/sources.json', import.meta.url),
  'utf8',
));
const estate = readFileSync(new URL('../estate.yml', import.meta.url), 'utf8');
const estateSites = [...estate.matchAll(/^\s*-\s+([a-z0-9-]+)\s*$/gm)].map((match) => match[1]);

const PATTERN_TAGS = [
  'model_release', 'benchmark', 'evaluation', 'research_paper', 'api_update', 'pricing_change',
  'architecture', 'dataset', 'training', 'inference', 'hardware', 'open_source', 'ai_safety',
  'opinion', 'image_gen', 'video_gen', 'music_gen', 'voice_synthesis', 'creative_tool', 'art_ai',
  'photography', 'camera', 'camera_release', 'lens', 'photo_editing', 'lightroom', 'photoshop',
  'capture_one', 'photography_ai', 'photography_technique', 'photography_business', 'crypto',
  'crypto_trading', 'crypto_defi', 'crypto_regulation',
];

function usedTags(): Set<string> {
  const used = new Set<string>();
  for (const site of Object.values(filters.sites) as Array<{ include_tags?: string[]; exclude_tags?: string[] }>) {
    for (const tag of [...(site.include_tags ?? []), ...(site.exclude_tags ?? [])]) used.add(tag);
  }
  for (const source of sources.sources as Array<{ tags?: string[] }>) {
    for (const tag of source.tags ?? []) used.add(tag);
  }
  return used;
}

function story(title: string, summary: string, source: string, url: string): NewsRouteCandidate {
  return {
    id: url,
    title,
    url,
    source,
    summary,
    date: '2026-10-24',
    dateLabel: '24 Oct 2026',
    category: 'industry',
    tags: [],
    digestDate: '2026-10-24',
    published_at: '2026-10-24T12:00:00.000Z',
  };
}

test('every estate site has a coverage brief and a symbol', () => {
  assert.deepEqual(Object.keys(catalog.sites).sort(), [...estateSites].sort());
  for (const slug of estateSites) {
    const site = catalog.sites[slug];
    assert.equal(typeof site.symbol, 'string');
    assert.ok(site.symbol.trim().length > 0, slug);
    assert.ok(site.definition.trim().length > 20, slug);
    assert.equal(site.include_tags, undefined);
    assert.equal(site.exclude_tags, undefined);
  }
});

test('every tag already used by a site or source has a definition and a symbol', () => {
  const used = usedTags();
  assert.deepEqual(Object.keys(catalog.tags).sort(), [...used].sort());
  for (const id of used) {
    const tag = catalog.tags[id];
    assert.equal(typeof tag.symbol, 'string');
    assert.ok(tag.symbol.trim().length > 0, id);
    assert.ok(tag.definition.trim().length > 12, id);
  }
});

test('keyword rules are only the patterns the hub router already used', () => {
  const withPattern = Object.entries(catalog.tags)
    .filter(([, tag]) => (tag as { keywordPattern?: string }).keywordPattern)
    .map(([id]) => id);
  assert.deepEqual(withPattern.sort(), [...PATTERN_TAGS].sort());
  for (const id of PATTERN_TAGS) {
    const pattern = catalog.tags[id].keywordPattern as string;
    assert.doesNotThrow(() => new RegExp(pattern, 'i'));
  }
});

test('the synced snapshot publishes website tags and topic definitions', () => {
  const hub = newsPipelineSnapshot.sites.find((site) => site.slug === 'ai-resource-hub');
  assert.equal(hub?.symbol, '📘');
  assert.match(hub?.description ?? '', /model releases/i);
  assert.equal(hub?.coverageTag, 'ai-resource-hub');
  assert.equal(newsPipelineSnapshot.summary.routingTagCount, Object.keys(catalog.tags).length);
  assert.equal(newsPipelineSnapshot.summary.siteTagCount, estateSites.length);
  const modelRelease = newsPipelineSnapshot.routingTags.find((tag) => tag.id === 'model_release');
  assert.equal(modelRelease?.kind, 'topic');
  assert.equal(modelRelease?.keywordPattern, catalog.tags.model_release.keywordPattern);
  const sunWindow = newsPipelineSnapshot.routingTags.find((tag) => tag.id === 'sun-window');
  assert.equal(sunWindow?.kind, 'site');
  assert.match(sunWindow?.definition ?? '', /No shared news brief/);
});

test('hub routing still keeps a model release and drops an excluded beat', () => {
  const kept = routeAiResourceHubNews([
    story(
      'OpenAI releases a new model',
      'A preview of the model.',
      'OpenAI',
      'https://openai.com/news/example-model',
    ),
  ]);
  assert.equal(kept.length, 1);
  assert.ok(kept[0].routingTags.includes('model_release'));

  const dropped = routeAiResourceHubNews([
    story(
      'Opinion: a hot take on the new model',
      'Editorial commentary.',
      'VentureBeat',
      'https://venturebeat.com/ai/example-opinion',
    ),
  ]);
  assert.equal(dropped.length, 0);
});

test('the hub collector does not keep a separate VentureBeat quota', () => {
  const source = readFileSync(new URL('./scrapers/news.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('minIntervalHours'), false);
  assert.equal(source.includes('isVentureBeat'), false);
  assert.equal(source.includes('https://venturebeat.com/category/ai/feed/'), true);
});
