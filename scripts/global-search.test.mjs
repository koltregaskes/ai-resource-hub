import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

// Runs the component's real inline script in a tiny fake DOM: no browser, no network.
const source = readFileSync(new URL('../src/components/GlobalSearch.astro', import.meta.url), 'utf8');
const script = [...source.matchAll(/<script is:inline>\s*([\s\S]*?)<\/script>/g)].map((m) => m[1]).at(-1);
assert.ok(script, 'inline search script not found');

function harness(items = []) {
  class Element {
    listeners = {};
    innerHTML = '';
    value = '';
    classList = { add() {}, remove() {} };
    addEventListener(type, handler) { this.listeners[type] = handler; }
    querySelectorAll() { return []; }
    focus() {}
  }
  class Input extends Element {}
  const nodes = Object.fromEntries(['trigger', 'overlay', 'backdrop', 'dialog', 'results'].map((key) => [key, new Element()]));
  nodes.input = new Input();
  const root = new Element();
  root.querySelector = (selector) => nodes[selector.match(/data-search-(.*)\]/)[1]];
  const payloads = { items, labels: { model: 'Model' }, colors: { model: 'var(--color-accent)' } };
  const parentElement = {
    querySelector(selector) {
      if (selector === '[data-global-search]') return root;
      return { textContent: JSON.stringify(payloads[selector.match(/data-global-search-(.*)\]/)[1]]) };
    },
  };
  runInNewContext(script, {
    HTMLElement: Element,
    HTMLInputElement: Input,
    document: { currentScript: { parentElement }, addEventListener() {} },
    window: { setTimeout() {}, location: { href: 'https://example.test/' } },
  });
  return {
    nodes,
    search(query) {
      nodes.input.value = query;
      nodes.input.listeners.input();
      return nodes.results.innerHTML;
    },
  };
}

const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

for (const query of ['<img src=x onerror=alert(1)>', '</div><svg onload=alert(1)>', '&lt;b&gt; "quotes" \'apostrophe\'']) {
  test(`no-match query is shown as text, not HTML: ${query}`, () => {
    const html = harness().search(query);
    const tags = (html.match(/<[^>]+>/g) || []).join('');
    assert.equal(tags, '<div class="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"></div>', 'query created extra elements');
    assert.ok(html.includes(`No results found for "${escape(query)}"`));
  });
}

test('normal, missing and blank searches still work', () => {
  const h = harness([{ title: 'Claude <Model>', description: 'Safe & useful', provider: 'Example', type: 'model', url: '/models/claude/' }]);
  let html = h.search('  CLAUDE  ');
  assert.ok(html.includes('Claude &lt;Model&gt;'));
  assert.ok(html.includes('Safe &amp; useful'));
  assert.ok(html.includes('data-search-result="/models/claude/"'));
  html = h.search('missing');
  assert.ok(html.includes('No results found for "missing"'));
  html = h.search('   ');
  assert.ok(html.includes('Start typing to search across 1 items'));
});
