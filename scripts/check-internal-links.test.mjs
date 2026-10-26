import assert from 'node:assert/strict';
import test from 'node:test';
import { htmlForLinkScan, toInternalPath } from './check-internal-links.mjs';

test('script and style bodies are not scanned as links', () => {
  const html = `
    <a href="/models/gpt-4o/">Real</a>
    <script>
      const html = '<a href="\${base}models/\${model.id}/">\${model.name}</a>';
    </script>
    <style>
      .x { background: url('/missing-style-asset.png'); }
    </style>
  `;
  const scanned = htmlForLinkScan(html);
  assert.equal(scanned.includes('${base}'), false);
  assert.equal(scanned.includes('missing-style-asset'), false);
  assert.equal(toInternalPath('/models/gpt-4o/', '/'), '/models/gpt-4o/');
});

test('template strings and external links are ignored', () => {
  assert.equal(toInternalPath('${base}models/${m.id}/', '/quiz/'), null);
  assert.equal(toInternalPath('mailto:hello@example.com', '/'), null);
  assert.equal(toInternalPath('https://example.com/docs', '/'), null);
  assert.equal(toInternalPath('https://theairesourcehub.com/benchmarks/', '/'), '/benchmarks/');
  assert.equal(toInternalPath('#section', '/'), null);
});

test('relative links resolve against the page directory', () => {
  assert.equal(toInternalPath('../glossary/', '/academy/what-is-a-transformer/'), '/academy/glossary/');
  assert.equal(toInternalPath('../../glossary/', '/academy/what-is-a-transformer/'), '/glossary/');
});
