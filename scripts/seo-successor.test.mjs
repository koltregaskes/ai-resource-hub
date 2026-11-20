import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { serializeJsonLd } from '../src/lib/json-ld.ts';
import { contrastColour } from '../src/lib/contrast.ts';

const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const pageEmitter = layout.match(/<script type="application\/ld\+json" set:html=\{serializeJsonLd\((\{[\s\S]*?\})\)\} \/>/);

function pageJson(title, description) {
  assert.ok(pageEmitter, 'exercise the actual layout WebPage expression');
  return serializeJsonLd(runInNewContext(`(${pageEmitter[1]})`, {
    title, description, URL,
    canonicalURL: new URL('https://example.test/hub/models/'),
    localeMeta: { code: 'ja-JP' }, base: '/hub/',
    Astro: { site: new URL('https://example.test/') },
  }));
}

test('actual WebPage emitter contains hostile metadata within the script', () => {
  const payloads = [
    '</script><img src=x onerror=alert(1)>',
    '</ScRiPt ><script>alert(1)</script>',
    '</script\n><svg onload=alert(1)>',
    '<!--<script>double escaped</script>-->',
    '" \\ & < > \u2028 \u2029',
  ];
  for (const value of payloads) {
    for (const [title, description] of [[value, 'ordinary'], ['ordinary', value]]) {
      const json = pageJson(title, description);
      // HTML script termination and escaped-script states both require a literal <.
      assert.doesNotMatch(json, /[<>&\u2028\u2029]/);
      const html = `<script type="application/ld+json">${json}</script>`;
      assert.equal((html.match(/<script\b/gi) ?? []).length, 1);
      assert.equal((html.match(/<\/script\s*>/gi) ?? []).length, 1);
      assert.equal(JSON.parse(json).name, title);
      assert.equal(JSON.parse(json).description, description);
    }
  }
});

test('page metadata preserves legitimate Unicode and canonical/site scope', () => {
  const name = '日本語 — café, Ελληνικά, العربية, 🚀 and e\u0301';
  const data = JSON.parse(pageJson(name, 'R&D <reference> "quoted" \\ path'));
  assert.deepEqual(data, {
    '@context': 'https://schema.org', '@type': 'WebPage', name,
    description: 'R&D <reference> "quoted" \\ path',
    url: 'https://example.test/hub/models/', inLanguage: 'ja-JP',
    isPartOf: { '@type': 'WebSite', name: 'The AI Resource Hub', url: 'https://example.test/hub/' },
  });
});

test('serializer preserves JSON semantics including nested keys, arrays and toJSON', () => {
  const data = {
    '</script>': ['日本語', null, true, false, 0, -1.5, { value: '<>&' }],
    omitted: undefined, array: [undefined, NaN, Infinity],
    custom: { toJSON: () => ({ name: '</script>🚀' }) },
  };
  assert.deepEqual(JSON.parse(serializeJsonLd(data)), JSON.parse(JSON.stringify(data)));
  assert.doesNotMatch(serializeJsonLd(data), /[<>&]/);
});

function astroFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = new URL(entry.name, dir);
    return entry.isDirectory() ? astroFiles(new URL(`${entry.name}/`, dir)) : entry.name.endsWith('.astro') ? [file] : [];
  });
}

test('all Astro JSON-LD emitters retain the shared safe serializer', () => {
  let blocks = 0;
  for (const file of astroFiles(new URL('../src/', import.meta.url))) {
    const source = readFileSync(file, 'utf8');
    for (const block of source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][\s\S]*?(?:<\/script>|\/>)/g)) {
      blocks++;
      assert.match(block[0], /set:html=\{serializeJsonLd\(/, file.pathname);
      assert.doesNotMatch(block[0], /JSON\.stringify/, file.pathname);
      assert.match(source, /import\s*\{\s*serializeJsonLd\s*\}\s*from/, file.pathname);
    }
  }
  assert.ok(blocks >= 25, `guard existing emitters plus WebPage (found ${blocks})`);
});

function luminance(hex) {
  const rgb = hex.replace('#', '').match(/../g).map(v => parseInt(v, 16) / 255);
  const [r, g, b] = rgb.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('remaining light muted-text repair meets AA on the opaque base surfaces', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const theme = css.match(/@theme\s*\{([\s\S]*?)\}/)[1];
  const muted = theme.match(/--color-text-muted:\s*(#[\da-f]{6})/i)[1];
  for (const key of ['primary', 'secondary', 'tertiary', 'hover']) {
    const bg = theme.match(new RegExp(`--color-bg-${key}:\\s*(#[\\da-f]{6})`, 'i'))[1];
    assert.ok(contrast(muted, bg) >= 4.5, `${key}: ${contrast(muted, bg)}`);
  }
});

test('main contrast helper already provides AA ink for the original provider colours', () => {
  for (const bg of ['#10a37f', '#ff6a00', '#ef8c53', '#d97706', '#4285f4', '#000000', '#ffffff']) {
    const ink = contrastColour(bg) === '#000' ? '#000000' : '#ffffff';
    assert.ok(contrast(ink, bg) >= 4.5, bg);
  }
});
