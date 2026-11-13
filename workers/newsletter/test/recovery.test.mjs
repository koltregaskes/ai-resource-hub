import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
const NOW = Date.UTC(2026, 10, 12, 9);
async function fixture(mode, loseResponse = false, holdResponse = false) {
  let release, started; const waiting = new Promise(resolve => { release = resolve; }); const providerStarted = new Promise(resolve => { started = resolve; });
  const edition = { date: '2026-11-12', dateLabel: '12 November', url: 'https://site.example.test/newsletter/2026-11-12/', sixtySeconds: 'Model news.', stories: [{ rank: 0, title: 'A model update', summary: 'Source summary.', url: 'https://source.example.test/a', source: 'Example', category: 'models', categoryLabel: 'Models', company: null, whyItMatters: null }] };
  const accepted = new Map(), requests = [], deliveries = new Map();
  const mf = new Miniflare({ modules: true, script: readFileSync(new URL('../dist/recovery-test.js', import.meta.url), 'utf8'), compatibilityDate: '2026-08-01',
    bindings: { ENVIRONMENT: 'test', FAIL_MODE: mode, SITE_URL: 'https://site.example.test', API_URL: 'https://worker.example.test', EDITION_JSON_URL: 'https://edition.example.test/latest.json', RESEND_API_BASE: 'https://provider.example.test', RESEND_API_KEY: 'test-only', SIGNING_KEY: 'test-only-local-recovery-signing-material', FROM_EMAIL: 'edition@example.test', POSTAL_ADDRESS: 'Test address' },
    outboundService: async request => {
      if (request.url === 'https://edition.example.test/latest.json') return Response.json(edition);
      assert.equal(request.url, 'https://provider.example.test/emails/batch', 'no live destinations');
      const key = request.headers.get('Idempotency-Key'), body = await request.text();
      requests.push({ key, body });
      const existing = accepted.get(key);
      if (existing) {
        if (existing.body !== body) return Response.json({ message: 'different payload for same key' }, { status: 409 });
        return Response.json({ data: existing.ids.map(id => ({ id })) });
      }
      const emails = JSON.parse(body), ids = emails.map((_, i) => 'provider-' + accepted.size + '-' + i);
      for (const email of emails) for (const to of email.to) deliveries.set(to, (deliveries.get(to) || 0) + 1);
      accepted.set(key, { body, ids });
      if (holdResponse) { started(); await waiting; }
      if (loseResponse) { loseResponse = false; return Response.json({ message: 'response lost after acceptance' }, { status: 504 }); }
      return Response.json({ data: ids.map(id => ({ id })) });
    },
  });
  return { mf, edition, requests, deliveries, release, providerStarted, run: now => mf.dispatchFetch('https://worker.example.test/run', { method: 'POST', body: JSON.stringify({ now }) }), state: async () => (await mf.dispatchFetch('https://worker.example.test/state')).json() };
}

test('accepted batch survives recordSend failure: retry completes only unrecorded readers without re-sending', async () => {
  const f = await fixture('record');
  try {
    const first = await f.run(NOW); assert.equal(first.status, 500); assert.match((await first.json()).error, /recordSend/);
    const state = await f.state(); assert.equal(state.pending.length, 1); assert.equal(state.pending[0].providerIds.length, 2); assert.equal(f.requests.length, 1);
    assert.equal(state.pending[0].requestBody, f.requests[0].body); assert.equal(state.pending[0].key, f.requests[0].key);
    f.edition.stories[0].title = 'Feed changed since acceptance';
    const retry = await f.run(NOW + 24 * 3600000); assert.equal(retry.status, 200); assert.equal((await retry.json()).sent, 1);
    assert.equal(f.requests.length, 1, 'accepted request is never sent again, even after provider key expiry');
    assert.deepEqual([...f.deliveries.values()], [1, 1]);
    assert.deepEqual(Object.values((await f.state()).writes), [1, 1], 'already-recorded recipient is not recorded again');
    assert.equal((await f.state()).pending.length, 0);
    assert.equal((await f.run(NOW + 24 * 3600000 + 1000)).status, 200); assert.equal(f.requests.length, 1);
  } finally { await f.mf.dispose(); }
});

for (const [name, mode, lost] of [['response lost after acceptance', '', true], ['acceptance persistence fails', 'accept', false]]) {
  test(name + ': replay retains exact body and key despite changed feed and token time', async () => {
    const f = await fixture(mode, lost);
    try {
      assert.equal((await f.run(NOW)).status, 500);
      const state = await f.state(); assert.equal(state.pending.length, 1); assert.equal(state.pending[0].providerIds, null);
      assert.equal(state.pending[0].requestBody, f.requests[0].body);
      f.edition.stories[0].title = 'A different feed title'; f.edition.sixtySeconds = 'Changed round-up';
      const retry = await f.run(NOW + 3600000); assert.equal(retry.status, 200); assert.equal((await retry.json()).sent, 2);
      assert.equal(f.requests.length, 2); assert.deepEqual(f.requests[0], f.requests[1], 'byte-for-byte replay under original key; no 409');
      assert.deepEqual([...f.deliveries.values()], [1, 1]); assert.equal((await f.state()).pending.length, 0);
    } finally { await f.mf.dispose(); }
  });
}

test('uncertain acceptance past the safe recovery window fails closed without another provider request', async () => {
  const f = await fixture('', true);
  try {
    assert.equal((await f.run(NOW)).status, 500);
    const retry = await f.run(NOW + 24 * 3600000); assert.equal(retry.status, 500); assert.match((await retry.json()).error, /manual reconciliation/);
    assert.equal(f.requests.length, 1); assert.equal((await f.state()).pending.length, 1);
  } finally { await f.mf.dispose(); }
});

test('concurrent runs retain one reserved batch while its provider request is in flight', async () => {
  const f = await fixture('', false, true);
  let first;
  try {
    first = f.run(NOW); await f.providerStarted;
    const persisted = await f.state(); assert.equal(persisted.pending.length, 1); assert.equal(persisted.pending[0].providerIds, null);
    assert.equal(persisted.pending[0].requestBody, f.requests[0].body, 'request is saved before acceptance');
    const parallel = await f.run(NOW + 1000); assert.equal(parallel.status, 200); assert.equal((await parallel.json()).sent, 0);
    assert.equal(f.requests.length, 1, 'live batch lease and reservations prevent another send');
    f.release(); assert.equal((await first).status, 200); assert.deepEqual([...f.deliveries.values()], [1, 1]);
  } finally { f.release(); if (first) await first; await f.mf.dispose(); }
});
