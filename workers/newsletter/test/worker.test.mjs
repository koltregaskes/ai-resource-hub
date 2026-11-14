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
let batchCalls = 0;
let failBatchCall = 0; // when set, that numbered /emails/batch call answers HTTP 500
const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 10, 12, 9); // test clock base; each test that needs fresh limit windows uses its own hour

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
      // Deliberately generated non-secret Miniflare fixture, never a deployed signing key.
      SIGNING_KEY: 'local-test-only-'.repeat(4),
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
        batchCalls++;
        if (failBatchCall && batchCalls === failBatchCall) return Response.json({ message: 'mock failure' }, { status: 500 });
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
const subscribe = (email, categories, { ip = '198.51.100.1', now = T0 } = {}) =>
  call('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'CF-Connecting-IP': ip, 'x-test-now': String(now) },
    body: JSON.stringify({ email, categories }),
  });
const at = (url, now, init = {}) => mf.dispatchFetch(url, { redirect: 'manual', ...init, headers: { ...(init.headers ?? {}), 'x-test-now': String(now) } });
const state = async () => (await call('/__test/state')).json();
const reader = async (email) => (await state()).subscribers.find((s) => s.email === email);
const confirmLinkFor = (email) => {
  const sent = [...outbound].reverse().find((entry) => entry.url === 'https://api.resend.com/emails' && JSON.parse(entry.body).to[0] === email);
  return sent ? linkFrom(JSON.parse(sent.body).text, 'confirm') : undefined;
};
const confirmEmailsTo = (email) => outbound.filter((entry) => entry.url === 'https://api.resend.com/emails' && JSON.parse(entry.body).to[0] === email).length;
const send = (now = T0) => call('/send-daily?force=1', { method: 'POST', headers: { Authorization: 'Bearer send-token-for-tests', 'x-test-now': String(now) } });
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
  await subscribe('reader@example.com', ['tools'], { now: T0 + HOUR });
  const state = await (await call('/__test/state')).json();
  assert.equal(state.subscribers.find((s) => s.email === 'reader@example.com').status, 'pending');
});

/* ------------- regressions for the Codex review of 685f41fd (#86) ------------- */

test('[P1] 25 rapid sign-ups for one address send one confirmation, and nothing is changed', async () => {
  const email = 'burst@example.com';
  const now = T0 + 2 * HOUR;
  const statuses = [];
  for (let i = 0; i < 25; i++) statuses.push((await subscribe(email, i % 2 ? ['models'] : ['policy'], { ip: `203.0.113.${i}`, now: now + i * 1000 })).status);
  assert.deepEqual([...new Set(statuses)], [200], 'every request gets the same answer');
  assert.equal(confirmEmailsTo(email), 1);
  assert.deepEqual((await reader(email)).categories, ['policy'], 'later requests stored nothing');
  // The first link still works, because the throttled requests did not replace its nonce.
  const response = await at(confirmLinkFor(email), now + 60_000);
  assert.match(response.headers.get('Location'), /status=confirmed/);
});

test('[P1] the address limit allows one email per 15 minutes and five per day', async () => {
  const email = 'daily-cap@example.com';
  const base = T0 + 3 * HOUR;
  for (let i = 0; i < 8; i++) await subscribe(email, ['tools'], { ip: `203.0.113.${100 + i}`, now: base + i * 16 * 60_000 });
  assert.equal(confirmEmailsTo(email), 5);
});

test('[P1] the per-IP limit answers 429 and sends nothing', async () => {
  const now = T0 + 30 * HOUR;
  const before = outbound.length;
  const statuses = [];
  for (let i = 0; i < 12; i++) statuses.push((await subscribe(`ip-${i}@example.com`, ['models'], { ip: '192.0.2.77', now })).status);
  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(200));
  assert.deepEqual(statuses.slice(10), [429, 429]);
  assert.equal(outbound.length - before, 10, 'no email for the limited requests');
  assert.equal(await reader('ip-10@example.com'), undefined, 'nothing stored for the limited requests');
});

test('[P1] the site-wide limit answers 429 across many IPs', async () => {
  const now = T0 + 40 * HOUR;
  let limited = 0;
  for (let i = 0; i < 305; i++) {
    const status = (await subscribe(`global-${i}@example.com`, ['models'], { ip: `10.0.${Math.floor(i / 250)}.${i % 250}`, now })).status;
    if (status === 429) limited++;
  }
  assert.equal(limited, 5);
});

test('[P1] a confirmation link cannot restore consent after unsubscribe, before or after a new sign-up', async () => {
  const email = 'replay@example.com';
  const base = T0 + 50 * HOUR;
  await subscribe(email, ['models'], { ip: '198.51.100.50', now: base });
  const first = confirmLinkFor(email);
  const confirmed = await at(first, base + 1000);
  const manage = new URL(confirmed.headers.get('Location')).searchParams.get('manage');
  // Clicking the same link again changes nothing and returns no new manage link.
  const again = new URL((await at(first, base + 2000)).headers.get('Location'));
  assert.equal(again.searchParams.get('status'), 'confirmed');
  assert.equal(again.searchParams.get('manage'), null);

  const unsubscribeUrl = (await (await mf.dispatchFetch(manage)).text()).match(/href="([^"]*\/unsubscribe\?t=[^"]+)"/)[1].replace(/&amp;/g, '&');
  await mf.dispatchFetch(unsubscribeUrl, { method: 'POST', body: 'List-Unsubscribe=One-Click', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  assert.equal((await reader(email)).status, 'unsubscribed');

  // Replay before a new sign-up.
  assert.match((await at(first, base + 3000)).headers.get('Location'), /status=expired/);
  assert.equal((await reader(email)).status, 'unsubscribed');

  // Replay after a new sign-up: the old link stays dead, the new one works.
  await subscribe(email, ['tools'], { ip: '198.51.100.50', now: base + HOUR });
  const second = confirmLinkFor(email);
  assert.notEqual(second, first);
  assert.match((await at(first, base + HOUR + 1000)).headers.get('Location'), /status=expired/);
  assert.equal((await reader(email)).status, 'pending');
  assert.match((await at(second, base + HOUR + 2000)).headers.get('Location'), /status=confirmed/);
  assert.deepEqual((await reader(email)).categories, ['tools']);

  // The manage link issued before the unsubscribe stays dead after re-subscribing.
  assert.equal((await mf.dispatchFetch(manage)).status, 400);
});

test('[P1] an unsigned sign-up cannot change an active reader\'s categories', async () => {
  const email = 'active@example.com';
  const base = T0 + 60 * HOUR;
  await subscribe(email, ['models', 'agents'], { ip: '198.51.100.60', now: base });
  await at(confirmLinkFor(email), base + 1000);
  const before = confirmEmailsTo(email);

  const response = await subscribe(email, ['policy'], { ip: '198.51.100.61', now: base + HOUR });
  assert.equal(response.status, 200);
  const after = await reader(email);
  assert.equal(after.status, 'subscribed');
  assert.deepEqual(after.categories, ['models', 'agents'], 'active picks unchanged');
  assert.deepEqual(after.pendingCategories, ['policy']);
  assert.equal(confirmEmailsTo(email), before + 1, 'the change waits for its own confirmation link');

  await at(confirmLinkFor(email), base + HOUR + 1000);
  const applied = await reader(email);
  assert.deepEqual(applied.categories, ['policy']);
  assert.equal(applied.pendingCategories, null);
});

test('[P2] manage links expire after 45 days and stop at once on unsubscribe', async () => {
  const email = 'expiry@example.com';
  const base = T0 + 70 * HOUR;
  await subscribe(email, ['models'], { ip: '198.51.100.70', now: base });
  const manage = new URL((await at(confirmLinkFor(email), base)).headers.get('Location')).searchParams.get('manage');
  assert.equal((await at(manage, base + 44 * 24 * HOUR)).status, 200);
  const expired = await at(manage, base + 46 * 24 * HOUR);
  assert.equal(expired.status, 400);
  assert.match(await expired.text(), /Sign up again/);
  assert.equal((await at(manage, base + 50 * 365 * 24 * HOUR)).status, 400, 'not valid 50 years later');
});

test('[P2] a failed middle batch strands nobody: retry sends every remaining reader exactly once', async () => {
  edition.date = '2026-11-12'; // a fresh edition, so earlier sends don't count
  await call('/__test/seed', { method: 'POST', body: JSON.stringify({ count: 201, categories: ['models'], prefix: 'bulk' }) });
  const active = (await state()).subscribers.filter((s) => s.status === 'subscribed');
  const matching = active.filter((s) => s.categories.some((c) => ['models', 'agents', 'industry'].includes(c)));
  assert.ok(matching.length > 200, `need over 200 matching readers, have ${matching.length}`);

  batchCalls = 0;
  failBatchCall = 2;
  const failed = await send(T0 + 80 * HOUR);
  assert.equal(failed.status, 500);
  const claimedAfterFailure = (await state()).sends.filter(([key]) => key.endsWith(':2026-11-12'));
  assert.ok(claimedAfterFailure.every(([, provider]) => provider !== null), 'no claim left without a provider id');
  assert.equal(claimedAfterFailure.filter(([, provider]) => provider && !provider.startsWith('skipped')).length, 100, 'only the first batch went out');

  failBatchCall = 0;
  const retry = await (await send(T0 + 80 * HOUR + 60_000)).json();
  const sends = (await state()).sends.filter(([key]) => key.endsWith(':2026-11-12'));
  const delivered = sends.filter(([, provider]) => provider && !provider.startsWith('skipped'));
  assert.equal(retry.sent, matching.length - 100);
  assert.equal(delivered.length, matching.length, 'every matching reader sent exactly once');
  assert.equal(new Set(sends.map(([key]) => key)).size, sends.length);
});

test('[P2] batch idempotency keys depend on the readers, not the batch position', async () => {
  const keys = outbound.filter((entry) => entry.url === 'https://api.resend.com/emails/batch').map((entry) => entry.headers['idempotency-key']);
  assert.ok(keys.every((key) => /^daily-\d{4}-\d{2}-\d{2}-[0-9a-f]{32}$/.test(key)), keys.join(' '));
  // The failed second batch and the retry's first batch hold the same 100 readers, so they share a key.
  const forEdition = keys.filter((key) => key.startsWith('daily-2026-11-12-'));
  assert.equal(forEdition[1], forEdition[2]);
});

test('a failed first batch releases its claims, so the retry sends everyone', async () => {
  edition.date = '2026-11-13';
  const base = T0 + 90 * HOUR;
  batchCalls = 0;
  failBatchCall = 1; // first batch fails: its claims are released, so nothing is stuck
  assert.equal((await send(base)).status, 500);
  failBatchCall = 0;
  const retry = await (await send(base + 1000)).json();
  assert.ok(retry.sent > 200);
});
test('no outbound call went anywhere except the mocks', () => {
  for (const entry of outbound) assert.match(entry.url, /^https:\/\/(api\.resend\.com|edition\.example\.test)\//);
});
