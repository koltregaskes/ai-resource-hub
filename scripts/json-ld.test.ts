import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { serializeJsonLd } from '../src/lib/json-ld';

function astroFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? astroFiles(file) : file.endsWith('.astro') ? [file] : [];
  });
}

test('every JSON-LD script uses the safe script-context serializer', () => {
  let blocks = 0;
  for (const file of astroFiles('src')) {
    const source = fs.readFileSync(file, 'utf8');
    for (const block of source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][\s\S]*?(?:<\/script>|\/>)/g)) {
      blocks++;
      assert.match(block[0], /set:html=\{serializeJsonLd\(/, file);
      assert.doesNotMatch(block[0], /JSON\.stringify/, file);
      assert.match(source, /import\s*\{\s*serializeJsonLd\s*\}\s*from/, file);
    }
  }
  assert.ok(blocks >= 24, 'guard all existing emitters, including scraped benchmark metadata');
});

test('hostile metadata cannot create another script element', () => {
  const data = { name: '</ScRiPt><script>alert(1)</script>', description: '<>&\u2028\u2029' };
  const html = '<script type="application/ld+json">' + serializeJsonLd(data) + '</script>';
  assert.equal((html.match(/<script/gi) || []).length, 1);
  assert.equal((html.match(/<\/script/gi) || []).length, 1);
  assert.deepEqual(JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('<'))), data);
});
