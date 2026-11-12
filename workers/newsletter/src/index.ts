/**
 * AI Resource Hub newsletter Worker (hub #1497).
 *
 *   POST /subscribe          email + categories -> pending row + confirmation email (double opt-in)
 *   GET  /confirm?t=         signed link from that email -> subscribed
 *   GET  /manage?t=          change categories (signed link in every email)
 *   POST /manage?t=
 *   GET  /unsubscribe?t=     confirmation page (GET never unsubscribes: link scanners prefetch)
 *   POST /unsubscribe?t=     one-click unsubscribe, RFC 8058 (List-Unsubscribe-Post)
 *   POST /send-daily         Bearer SEND_TOKEN; also runs from the cron trigger
 *   GET  /health
 *
 * NOT DEPLOYED. Built and tested locally only (Miniflare). Deploying, the
 * Resend and Cloudflare accounts and the sending-domain DNS all wait for Kol.
 */
import categoriesConfig from '../../../shared/news-categories.json';
import { buildConfirmEmail, buildDailyEmail, type EditionPayload } from './email';
import { ResendClient, type OutgoingEmail } from './resend';
import { memoryStore, memorySnapshot, neonStore, type Store, type Subscriber } from './store';
import { signToken, verifyToken } from './tokens';

export interface Env {
  ENVIRONMENT: 'production' | 'test';
  SITE_URL: string;
  API_URL: string;
  FROM_EMAIL: string;
  SIGNING_KEY: string;
  RESEND_API_KEY: string;
  RESEND_API_BASE?: string;
  DATABASE_URL?: string;
  SEND_TOKEN: string;
  TURNSTILE_SECRET?: string;
  POSTAL_ADDRESS?: string;
  UNSUBSCRIBE_MAILTO?: string;
  EDITION_JSON_URL?: string;
}

const CATEGORY_IDS: string[] = categoriesConfig.categories.map((category) => category.id);
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(categoriesConfig.categories.map((c) => [c.id, c.label]));
const CONFIRM_TTL_SECONDS = 7 * 24 * 60 * 60;
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

function storeFor(env: Env): Store {
  if (env.DATABASE_URL) return neonStore(env.DATABASE_URL);
  if (env.ENVIRONMENT === 'test') return memoryStore();
  throw new Error('DATABASE_URL is not configured');
}

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.SITE_URL,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(env) },
  });
}

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;background:#12100f;color:#fff7eb;margin:0;padding:32px 16px}main{max-width:560px;margin:0 auto}a{color:#ef8c53}label{display:flex;gap:8px;align-items:flex-start;margin:8px 0;padding:8px 12px;border:1px solid #3a322c;border-radius:8px}button{background:#fff7eb;color:#12100f;border:0;border-radius:999px;padding:10px 18px;font-weight:bold;cursor:pointer}small{color:#c9bba8}</style>
</head><body><main><p style="color:#ef8c53;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">The AI Resource Hub</p>${body}</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    },
  });
}

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function cleanCategories(values: unknown[]): string[] {
  return [...new Set(values.map(String))].filter((id) => CATEGORY_IDS.includes(id));
}

async function readSubscribeBody(request: Request): Promise<{ email: string; categories: string[]; token: string; source: string }> {
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      email: String(body.email ?? ''),
      categories: cleanCategories(Array.isArray(body.categories) ? body.categories : []),
      token: String(body['cf-turnstile-response'] ?? ''),
      source: String(body.source ?? 'site').slice(0, 40),
    };
  }
  const form = await request.formData();
  return {
    email: String(form.get('email') ?? ''),
    categories: cleanCategories(form.getAll('categories')),
    token: String(form.get('cf-turnstile-response') ?? ''),
    source: String(form.get('source') ?? 'site').slice(0, 40),
  };
}

async function turnstileOk(env: Env, token: string, ip: string | null): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true; // optional; off until Kol turns it on
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = (await response.json().catch(() => ({}))) as { success?: boolean };
  return result.success === true;
}

async function linksFor(env: Env, subscriber: Subscriber) {
  const manage = await signToken({ p: 'manage', sid: subscriber.id }, env.SIGNING_KEY);
  const unsubscribe = await signToken({ p: 'unsubscribe', sid: subscriber.id }, env.SIGNING_KEY);
  return {
    manageUrl: `${env.API_URL}/manage?t=${manage}`,
    unsubscribeUrl: `${env.API_URL}/unsubscribe?t=${unsubscribe}`,
  };
}

function unsubscribeHeaders(env: Env, unsubscribeUrl: string): Record<string, string> {
  const targets = [`<${unsubscribeUrl}>`];
  if (env.UNSUBSCRIBE_MAILTO) targets.push(`<mailto:${env.UNSUBSCRIBE_MAILTO}?subject=unsubscribe>`);
  return {
    'List-Unsubscribe': targets.join(', '),
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/* --------------------------------- routes --------------------------------- */

async function subscribe(request: Request, env: Env, store: Store): Promise<Response> {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
  const { email: rawEmail, categories, token, source } = await readSubscribeBody(request);
  const email = rawEmail.trim().toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400, env);
  if (categories.length === 0) return json({ ok: false, error: 'Pick at least one category.' }, 400, env);
  if (!(await turnstileOk(env, token, request.headers.get('CF-Connecting-IP')))) {
    return json({ ok: false, error: 'The spam check failed. Please try again.' }, 400, env);
  }

  const subscriber = await store.upsertPending(email, categories, source);
  await store.logEvent(subscriber.id, 'subscribe', { categories, source, status: subscriber.status });

  if (subscriber.status !== 'subscribed') {
    const confirmToken = await signToken(
      { p: 'confirm', sid: subscriber.id, exp: Math.floor(Date.now() / 1000) + CONFIRM_TTL_SECONDS },
      env.SIGNING_KEY,
    );
    const built = buildConfirmEmail(`${env.API_URL}/confirm?t=${confirmToken}`, categories.map((id) => CATEGORY_LABELS[id]));
    const resend = new ResendClient(env.RESEND_API_KEY, env.RESEND_API_BASE);
    await resend.send({ from: env.FROM_EMAIL, to: [email], ...built, tags: [{ name: 'type', value: 'confirm' }] });
    await store.logEvent(subscriber.id, 'confirm-sent');
  }

  // Same answer whether or not the address was already on the list, so the form can't be used to probe.
  const message = 'Check your inbox for a confirmation email. Nothing else arrives until you click it.';
  if (wantsJson) return json({ ok: true, message }, 200, env);
  return Response.redirect(`${env.SITE_URL}/newsletter/confirm/?status=check-email`, 303);
}

async function confirm(url: URL, env: Env, store: Store): Promise<Response> {
  const payload = await verifyToken(url.searchParams.get('t'), 'confirm', env.SIGNING_KEY);
  if (!payload) return Response.redirect(`${env.SITE_URL}/newsletter/confirm/?status=expired`, 303);
  const subscriber = await store.confirm(payload.sid);
  if (!subscriber) return Response.redirect(`${env.SITE_URL}/newsletter/confirm/?status=expired`, 303);
  await store.logEvent(subscriber.id, 'confirmed');
  const { manageUrl } = await linksFor(env, subscriber);
  return Response.redirect(`${env.SITE_URL}/newsletter/confirm/?status=confirmed&manage=${encodeURIComponent(manageUrl)}`, 303);
}

async function manage(request: Request, url: URL, env: Env, store: Store): Promise<Response> {
  const token = url.searchParams.get('t');
  const payload = await verifyToken(token, 'manage', env.SIGNING_KEY);
  const subscriber = payload ? await store.get(payload.sid) : null;
  if (!subscriber) return page('Link not valid', '<h1>That link has expired or isn\'t valid</h1><p>Use the link in your most recent email.</p>', 400);

  let notice = '';
  if (request.method === 'POST') {
    const form = await request.formData();
    const picks = cleanCategories(form.getAll('categories'));
    if (picks.length === 0) {
      notice = '<p><strong>Pick at least one category, or unsubscribe instead.</strong></p>';
    } else {
      await store.setCategories(subscriber.id, picks);
      subscriber.categories = picks;
      await store.logEvent(subscriber.id, 'preferences', { categories: picks });
      notice = '<p><strong>Saved.</strong> Your next email uses these categories.</p>';
    }
  }

  const { unsubscribeUrl } = await linksFor(env, subscriber);
  const boxes = categoriesConfig.categories
    .map(
      (category) =>
        `<label><input type="checkbox" name="categories" value="${category.id}"${subscriber.categories.includes(category.id) ? ' checked' : ''}><span><strong>${esc(category.label)}</strong><br><small>${esc(category.description)}</small></span></label>`,
    )
    .join('');
  return page(
    'Your daily edition categories',
    `<h1>Your categories</h1>${notice}<p>Pick what you want in your daily email.</p>
<form method="post" action="/manage?t=${esc(token!)}">${boxes}<p><button type="submit">Save</button></p></form>
<p><a href="${esc(unsubscribeUrl)}">Unsubscribe instead</a></p>`,
  );
}

async function unsubscribe(request: Request, url: URL, env: Env, store: Store): Promise<Response> {
  const token = url.searchParams.get('t');
  const payload = await verifyToken(token, 'unsubscribe', env.SIGNING_KEY);
  if (!payload) return page('Link not valid', '<h1>That link isn\'t valid</h1><p>Use the unsubscribe link in your most recent email.</p>', 400);

  if (request.method === 'GET') {
    return page(
      'Unsubscribe',
      `<h1>Unsubscribe from the daily edition?</h1><form method="post" action="/unsubscribe?t=${esc(token!)}"><button type="submit">Yes, unsubscribe me</button></form>`,
    );
  }

  // RFC 8058: the mail client POSTs "List-Unsubscribe=One-Click"; a person clicking the button posts an empty form.
  const subscriber = await store.unsubscribe(payload.sid);
  if (subscriber) await store.logEvent(subscriber.id, 'unsubscribed', { oneClick: (await request.text()).includes('List-Unsubscribe=One-Click') });
  return page('Unsubscribed', "<h1>You're unsubscribed</h1><p>No more daily emails will be sent to this address.</p>");
}

const ukDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });

/** The morning email covers the previous complete UK day. */
function ukYesterday(now = new Date()): string {
  const [y, m, d] = ukDay.format(now).split('-').map(Number);
  return ukDay.format(new Date(Date.UTC(y, m - 1, d, 12) - 86_400_000));
}

export async function sendDaily(env: Env, store: Store, options: { force?: boolean } = {}) {
  const source = env.EDITION_JSON_URL ?? `${env.SITE_URL}/newsletter/latest.json`;
  const response = await fetch(source, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Edition fetch failed: HTTP ${response.status} from ${source}`);
  const edition = (await response.json()) as EditionPayload;
  if (!options.force && edition.date !== ukYesterday()) {
    return { edition: edition.date, sent: 0, skipped: 0, reason: "latest complete edition is not yesterday's; nothing sent" };
  }

  const resend = new ResendClient(env.RESEND_API_KEY, env.RESEND_API_BASE);
  const subscribers = await store.listSubscribed();
  const queue: Array<{ subscriber: Subscriber; email: OutgoingEmail }> = [];
  let skipped = 0;

  for (const subscriber of subscribers) {
    if (!(await store.claimSend(subscriber.id, edition.date))) continue; // already sent this edition
    const links = await linksFor(env, subscriber);
    const built = buildDailyEmail(edition, subscriber.categories, CATEGORY_LABELS, { ...links, postalAddress: env.POSTAL_ADDRESS });
    if (!built) {
      await store.recordSend(subscriber.id, edition.date, 'skipped:no-matching-stories');
      skipped++;
      continue;
    }
    queue.push({
      subscriber,
      email: {
        from: env.FROM_EMAIL,
        to: [subscriber.email],
        ...built,
        headers: unsubscribeHeaders(env, links.unsubscribeUrl),
        tags: [
          { name: 'type', value: 'daily' },
          { name: 'edition', value: edition.date },
        ],
      },
    });
  }

  let sent = 0;
  for (let i = 0; i < queue.length; i += 100) {
    const chunk = queue.slice(i, i + 100);
    try {
      const ids = await resend.sendBatch(chunk.map((entry) => entry.email), `daily-${edition.date}-${i / 100}`);
      for (const [index, entry] of chunk.entries()) {
        await store.recordSend(entry.subscriber.id, edition.date, ids[index]);
        await store.logEvent(entry.subscriber.id, 'sent', { edition: edition.date, id: ids[index] });
      }
      sent += chunk.length;
    } catch (error) {
      for (const entry of chunk) await store.releaseSend(entry.subscriber.id, edition.date);
      throw error;
    }
  }
  return { edition: edition.date, sent, skipped };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) });
      if (url.pathname === '/health') return json({ ok: true }, 200, env);

      const store = storeFor(env);
      if (url.pathname === '/subscribe' && request.method === 'POST') return await subscribe(request, env, store);
      if (url.pathname === '/confirm' && request.method === 'GET') return await confirm(url, env, store);
      if (url.pathname === '/manage' && (request.method === 'GET' || request.method === 'POST')) return await manage(request, url, env, store);
      if (url.pathname === '/unsubscribe' && (request.method === 'GET' || request.method === 'POST')) return await unsubscribe(request, url, env, store);
      if (url.pathname === '/send-daily' && request.method === 'POST') {
        if (!env.SEND_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.SEND_TOKEN}`) return json({ ok: false }, 401, env);
        const result = await sendDaily(env, store, { force: url.searchParams.get('force') === '1' });
        return json({ ok: true, ...result }, 200, env);
      }
      if (url.pathname === '/__test/state' && env.ENVIRONMENT === 'test') return json(memorySnapshot(), 200, env);
      return json({ ok: false, error: 'Not found' }, 404, env);
    } catch (error) {
      console.error(error);
      return json({ ok: false, error: 'Something went wrong. Please try again later.' }, 500, env);
    }
  },

  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    ctx.waitUntil(sendDaily(env, storeFor(env)).then((result) => console.log('send-daily', JSON.stringify(result))));
  },
};
