import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

// Execute the component's actual inline script, with no dependencies or network.
const source = process.argv[2]
  ? execFileSync('git', ['show', `${process.argv[2]}:src/components/GlobalSearch.astro`], { encoding: 'utf8' })
  : readFileSync(new URL('../src/components/GlobalSearch.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>\s*([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);

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
  const nodes = Object.fromEntries(['trigger', 'overlay', 'backdrop', 'dialog', 'results', 'form'].map(key => [key, new Element()]));
  nodes.input = new Input();
  const root = new Element();
  root.querySelector = selector => nodes[selector.match(/data-search-(.*)\]/)[1]];
  const payloads = { items, labels: { model: 'Model' }, colors: { model: 'var(--color-accent)' } };
  const parentElement = { querySelector(selector) {
    if (selector === '[data-global-search]') return root;
    return { textContent: JSON.stringify(payloads[selector.match(/data-global-search-(.*)\]/)[1]]) };
  } };
  runInNewContext(script, {
    HTMLElement: Element, HTMLInputElement: Input, URL,
    document: { currentScript: { parentElement }, addEventListener() {} },
    window: { setTimeout() {}, location: { href: 'https://example.test/' } },
  });
  return { nodes, async search(query, agent = false) {
    nodes.input.value = query;
    if (!agent) { nodes.input.listeners.input(); return; }
    let response;
    let prevented = false;
    nodes.form.listeners.submit({ agentInvoked: true, preventDefault() { prevented = true; }, respondWith(value) { response = value; } });
    assert.ok(prevented);
    return await response;
  } };
}

for (const agent of [false, true]) {
  for (const query of ['<img src=x onerror=alert(1)>', '</div><svg onload=alert(1)>', '&lt;img&gt; "quotes" \'apostrophe\'']) {
    test(`${agent ? 'agent' : 'typed'} no-match query is escaped: ${query}`, async () => {
      const h = harness();
      await h.search(query, agent);
      const html = h.nodes.results.innerHTML;
      assert.equal((html.match(/<[^>]+>/g) || []).join(''), '<div class="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"></div>');
      const escaped = query.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
      assert.ok(html.includes(`No results found for "${escaped}"`));
    });
  }
  test(`${agent ? 'agent' : 'typed'} benign matching, missing and blank searches`, async () => {
    const h = harness([{ title: 'Claude <Model>', description: 'Safe & useful', provider: 'Example', type: 'model', url: '/models/claude/' }]);
    const summary = await h.search('  CLAUDE  ', agent);
    assert.ok(h.nodes.results.innerHTML.includes('Claude &lt;Model&gt;'));
    assert.ok(h.nodes.results.innerHTML.includes('Safe &amp; useful'));
    assert.ok(h.nodes.results.innerHTML.includes('data-search-result="/models/claude/"'));
    if (agent) assert.ok(summary.includes('https://example.test/models/claude/'));
    await h.search('missing', agent);
    assert.ok(h.nodes.results.innerHTML.includes('No results found for "missing"'));
    await h.search('   ', agent);
    assert.ok(h.nodes.results.innerHTML.includes('Start typing to search across 1 items'));
  });
}

test('human form submission cancels navigation without agent response', () => {
  const h = harness();
  let prevented = false;
  h.nodes.form.listeners.submit({ preventDefault() { prevented = true; }, respondWith() { assert.fail('human submission responded as agent'); } });
  assert.ok(prevented);
});

