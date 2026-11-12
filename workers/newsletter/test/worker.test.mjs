/**
 * Local end-to-end tests for the newsletter Worker, run in Miniflare (the
 * workerd runtime) with no listening port and no network: Resend and the
 * edition JSON are answered by an outbound mock, storage is in memory.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';

const API = 'https://newsletter.example.test';
const SITE = 'https://theairesourcehub.com';
const outbound = [];

const edition = {
  date: '2026-11-11',
  dateLabel: 'Wednesday 11 November 2026',
  url: `${SITE}/newsletter/2026-11-11/`,
  sixtySeconds: '4 stories from 3 sources: 2 Models, 1 Agents and 1 Industry.',
  stories: [
    { rank: 0, title: 'Lab ships a new model', url: 'https://example.com/a', source: 'Example', summary: 'Summary A.', category: 'models', categoryLabel: 'Models', company: 'OpenAI', whyItMatters: null },
    { rank: 1, title: 'Agent framework adds MCP', url: 'https://example.com/b', source: 'Example', summary: 'Summary B.', category: 'agents', categoryLabel: 'Agents', company: null, whyItMatters: 'Editor note B.' },
    { rank: 2, title: 'Chip maker raises money', url: 'https://example.com/c', source: 'Other', summary: 'Summary C.', category: 'industry', categoryLabel: 'Industry', company: 'Nvidia', whyItMatters: null },
    { rank: 3, title: 'Second model update', url: 'https://example.com/d', source: 'Third', summary: '', category: 'models', categoryLabel: 'Models', company: 'Google', whyItMatters: null },
  ],
};

let mf;

before(async () => {
  mf = new Miniflare({
    modules: true,
    script: readFileSync(new URL('../dist/worker.js', import.meta.url), 'utf8'),
    compatibilityDate: '2026-08-01',
    bindings: {
      ENVIRONMENT: 'test',
      SITE_URL: SITE,
      API_URL: API,
      FROM_EMAIL: 'The AI Resource Hub <edition@example.test>',
      SIGNING_KEY: 'test-signing-key-0123456789abcdef0123456789',
      RESEND_API_KEY: 're_test_not_a_real_key',
      SEND_TOKEN: 'send-token-for-tests',
      EDITION_JSON_URL: 'https://edition.example.test/latest.json',
      POSTAL_ADDRESS: 'Test address line',
    },
    outboundService: async (request) => {
      const body = request.method === 'POST' ? await request.text() : '';
      outbound.push({ url: request.url, method: request.method, headers: Object.fromEntries(request.headers), body });
      const { pathname, hostname } = new URL(request.url);
      if (hostname === 'edition.example.test') return Response.json(edition);
      if (hostname === 'api.resend.com' && pathname === '/emails') return Response.json({ id: 'email_confirm_1' });
      if (hostname === 'api.resend.com' && pathname === '/emails/batch') {
        const list = JSON.parse(body);
        return Response.json({ data: list.map((_, i) => ({ id: `email_batch_${i}` })) });
      }
      return new Response('unexpected outbound call', { status: 599 });
    },
  });
});

after(async () => {
  await mf?.dispose();
});

const call = (path, init = {}) => mf.dispatchFetch(`${API}${path}`, { redirect: 'manual', ...init });
const subscribe = (email, categories) =>
  call('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, categories }),
  });
const lastResend = (path) => [...outbound].reverse().find((entry) => entry.url === `https://api.resend.com${path}`);
const linkFrom = (text, route) => text.match(new RegExp(`${API.replace(/\./g, '\\.')}/${route}\\?t=[A-Za-z0-9_\\-.]+`))?.[0];

test('rejects a bad email and an empty category pick', async () => {
  assert.equal((await subscribe('not-an-email', ['models'])).status, 400);
  assert.equal((await subscribe('reader@example.com', [])).status, 400);
  assert.equal((await subscribe('reader@example.com', ['crypto'])).status, 400, 'unknown categories are dropped');
});

let confirmUrl;
test('subscribe stores a pending reader and sends a confirmation email', async () => {
  const response = await subscribe('Reader@Example.com', ['models', 'agents', 'models']);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);

  const sent = lastResend('/emails');
  assert.ok(sent, 'Resend /emails was called');
  assert.equal(sent.headers.authorization, 'Bearer re_test_not_a_real_key');
  const payload = JSON.parse(sent.body);
  assert.deepEqual(payload.to, ['reader@example.com']);
  assert.match(payload.subject, /Confirm/);
  assert.match(payload.text, /Models and Agents/);
  confirmUrl = linkFrom(payload.text, 'confirm');
  assert.ok(confirmUrl, 'confirmation link present');

  const state = await (await call('/__test/state')).json();
  const reader = state.subscribers.find((s) => s.email === 'reader@example.com');
  assert.equal(reader.status, 'pending');
  assert.deepEqual(reader.categories, ['models', 'agents']);
});

test('a tampered confirmation link is refused', async () => {
  const response = await mf.dispatchFetch(`${confirmUrl}x`, { redirect: 'manual' });
  assert.equal(response.status, 303);
  assert.match(response.headers.get('Location'), /status=expired/);
});

let manageUrl;
test('the confirmation link subscribes the reader (double opt-in)', async () => {
  const response = await mf.dispatchFetch(confirmUrl, { redirect: 'manual' });
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get('Location'));
  assert.equal(location.searchParams.get('status'), 'confirmed');
  manageUrl = location.searchParams.get('manage');
  assert.ok(manageUrl.startsWith(`${API}/manage?t=`));
  const state = await (await call('/__test/state')).json();
  assert.equal(state.subscribers.find((s) => s.email === 'reader@example.com').status, 'subscribed');
});

test('send-daily needs the send token', async () => {
  assert.equal((await call('/send-daily', { method: 'POST' })).status, 401);
});

let unsubscribeUrl;
test('daily send: only the reader\'s categories, a prose opening, and RFC 8058 headers', async () => {
  await subscribe('policy-only@example.com', ['policy']);
  const policyConfirm = linkFrom(JSON.parse(lastResend('/emails').body).text, 'confirm');
  await mf.dispatchFetch(policyConfirm, { redirect: 'manual' });

  const response = await call('/send-daily?force=1', { method: 'POST', headers: { Authorization: 'Bearer send-token-for-tests' } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.sent, 1);
  assert.equal(result.skipped, 1, 'the Policy-only reader has no matching stories and gets no email');

  const batch = JSON.parse(lastResend('/emails/batch').body);
  assert.equal(batch.length, 1);
  const email = batch[0];
  assert.deepEqual(email.to, ['reader@example.com']);
  assert.equal(email.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(email.headers['List-Unsubscribe'], /^<https:\/\/newsletter\.example\.test\/unsubscribe\?t=/);
  assert.match(email.text, /^Wednesday 11 November 2026\n\nHere's Wednesday 11 November 2026 in AI, picked for Models and Agents\. 3 of the day's 4 stories match/);
  assert.match(email.text, /Lab ships a new model/);
  assert.match(email.text, /Why it matters: Editor note B\./);
  assert.doesNotMatch(email.text, /Chip maker raises money/, 'Industry story is not in a Models+Agents email');
  assert.match(email.html, /Test address line/);
  unsubscribeUrl = email.headers['List-Unsubscribe'].slice(1, -1);
});

test('running the send again does not email anyone twice', async () => {
  const result = await (await call('/send-daily?force=1', { method: 'POST', headers: { Authorization: 'Bearer send-token-for-tests' } })).json();
  assert.equal(result.sent, 0);
});

test('an unsubscribe token cannot open the preferences page', async () => {
  const wrongPurpose = manageUrl.replace(/t=.*/, unsubscribeUrl.split('t=')[1] ? `t=${unsubscribeUrl.split('t=')[1]}` : '');
  assert.equal((await mf.dispatchFetch(wrongPurpose)).status, 400);
});

test('preferences page changes categories', async () => {
  const get = await mf.dispatchFetch(manageUrl);
  assert.equal(get.status, 200);
  assert.match(await get.text(), /value="models" checked/);
  const form = new URLSearchParams([['categories', 'research'], ['categories', 'policy']]);
  const post = await mf.dispatchFetch(manageUrl, { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  assert.equal(post.status, 200);
  const state = await (await call('/__test/state')).json();
  assert.deepEqual(state.subscribers.find((s) => s.email === 'reader@example.com').categories, ['research', 'policy']);
});

test('GET on the unsubscribe link does not unsubscribe (link scanners)', async () => {
  const response = await mf.dispatchFetch(unsubscribeUrl);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Yes, unsubscribe me/);
  const state = await (await call('/__test/state')).json();
  assert.equal(state.subscribers.find((s) => s.email === 'reader@example.com').status, 'subscribed');
});

test('one-click unsubscribe POST (RFC 8058) unsubscribes', async () => {
  const response = await mf.dispatchFetch(unsubscribeUrl, {
    method: 'POST',
    body: 'List-Unsubscribe=One-Click',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert.equal(response.status, 200);
  const state = await (await call('/__test/state')).json();
  assert.equal(state.subscribers.find((s) => s.email === 'reader@example.com').status, 'unsubscribed');
  assert.ok(state.events.includes('unsubscribed'));
});

test('re-subscribing an unsubscribed address needs a fresh confirmation', async () => {
  await subscribe('reader@example.com', ['tools']);
  const state = await (await call('/__test/state')).json();
  assert.equal(state.subscribers.find((s) => s.email === 'reader@example.com').status, 'pending');
});

test('no outbound call went anywhere except the mocks', () => {
  for (const entry of outbound) assert.match(entry.url, /^https:\/\/(api\.resend\.com|edition\.example\.test)\//);
});
