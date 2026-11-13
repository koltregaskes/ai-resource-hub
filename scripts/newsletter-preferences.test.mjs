import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const component = fs.readFileSync(new URL('../src/components/newsletter/EditionView.astro', import.meta.url), 'utf8');
const script = component.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
const categories = JSON.parse(fs.readFileSync(new URL('../shared/news-categories.json', import.meta.url), 'utf8')).categories.map(({ id }) => id);

function visit(saved, search = '') {
  const storage = new Map([['airh:edition-categories', saved]]);
  const button = (id) => ({
    getAttribute: () => id,
    setAttribute() {},
    classList: { toggle() {} },
    addEventListener(event, fn) { this.click = fn; },
  });
  const buttons = ['all', 'models'].map(button);
  const story = { getAttribute: () => 'models', hidden: false };
  const empty = { classList: { toggle(name, value) { empty.hidden = value; } } };
  const root = { getAttribute: () => categories.join(','), querySelectorAll: () => buttons };
  vm.runInNewContext(script, {
    document: {
      querySelector: (selector) => selector === '[data-edition-filter]' ? root : empty,
      querySelectorAll: () => [story],
    },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    location: { search, href: `https://example.com/newsletter/2026-11-12/${search}` },
    history: { state: null, replaceState() {} },
    URL, URLSearchParams,
  });
  return { saved: () => storage.get('airh:edition-categories'), buttons, story, empty };
}

test('category validation uses canonical IDs rendered by Astro', () => {
  assert.match(component, /data-category-ids=\{NEWS_CATEGORIES\.map\(\(category\) => category\.id\)\.join\(','\)\}/);
});

test('Models-only edition preserves saved Agents and shows the empty state', () => {
  const page = visit('agents,invalid,agents');
  assert.equal(page.saved(), 'agents');
  assert.equal(page.story.hidden, true);
  assert.equal(page.empty.hidden, false);
  page.buttons[1].click();
  assert.equal(page.saved(), 'agents,models');
  assert.equal(page.story.hidden, false);
  page.buttons[0].click();
  assert.equal(page.saved(), '');
});

test('URL preferences accept absent canonical categories and explicit All', () => {
  assert.equal(visit('models', '?c=agents,invalid,agents').saved(), 'agents');
  assert.equal(visit('agents', '?c=all').saved(), '');
  assert.equal(visit('agents', '?c=').saved(), '');
});
