/**
 * Subscriber storage. Production uses Neon over HTTP (schema.sql); local tests
 * use an in-memory store, which the Worker only allows when ENVIRONMENT=test.
 */
import { neon } from '@neondatabase/serverless';

export type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  categories: string[];
  consentAt: string;
  confirmedAt: string | null;
}

export interface Store {
  upsertPending(email: string, categories: string[], source: string): Promise<Subscriber>;
  get(id: string): Promise<Subscriber | null>;
  confirm(id: string): Promise<Subscriber | null>;
  setCategories(id: string, categories: string[]): Promise<Subscriber | null>;
  unsubscribe(id: string): Promise<Subscriber | null>;
  listSubscribed(): Promise<Subscriber[]>;
  /** Returns false if this subscriber already has a send recorded for the edition. */
  claimSend(id: string, editionDate: string): Promise<boolean>;
  recordSend(id: string, editionDate: string, providerId: string | null): Promise<void>;
  releaseSend(id: string, editionDate: string): Promise<void>;
  logEvent(id: string | null, event: string, detail?: Record<string, unknown>): Promise<void>;
}

const SITE = 'ai-resource-hub';

/* ---------------------------- Neon (production) ---------------------------- */

interface Row {
  id: string;
  email: string;
  status: SubscriberStatus;
  categories: string[];
  consent_at: string | Date;
  confirmed_at: string | Date | null;
}

const iso = (value: string | Date | null) => (value === null ? null : new Date(value).toISOString());
const fromRow = (row: Row | undefined): Subscriber | null =>
  row
    ? {
        id: row.id,
        email: row.email,
        status: row.status,
        categories: row.categories,
        consentAt: iso(row.consent_at)!,
        confirmedAt: iso(row.confirmed_at),
      }
    : null;

export function neonStore(databaseUrl: string): Store {
  const sql = neon(databaseUrl);
  const cols = 'id, email, status, categories, consent_at, confirmed_at';
  return {
    async upsertPending(email, categories, source) {
      // A new sign-up for an address that is already subscribed only updates
      // the picks; it never downgrades the status or resets consent.
      const rows = (await sql.query(
        `INSERT INTO newsletter.subscribers (site, email, categories, consent_source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (site, email) DO UPDATE SET
           categories = EXCLUDED.categories,
           status = CASE WHEN newsletter.subscribers.status = 'subscribed' THEN 'subscribed' ELSE 'pending' END,
           consent_at = CASE WHEN newsletter.subscribers.status = 'subscribed' THEN newsletter.subscribers.consent_at ELSE now() END,
           updated_at = now()
         RETURNING ${cols}`,
        [SITE, email, categories, source],
      )) as Row[];
      return fromRow(rows[0])!;
    },
    async get(id) {
      const rows = (await sql.query(`SELECT ${cols} FROM newsletter.subscribers WHERE id = $1 AND site = $2`, [id, SITE])) as Row[];
      return fromRow(rows[0]);
    },
    async confirm(id) {
      const rows = (await sql.query(
        `UPDATE newsletter.subscribers SET status = 'subscribed', confirmed_at = COALESCE(confirmed_at, now()), unsubscribed_at = NULL, updated_at = now()
         WHERE id = $1 AND site = $2 RETURNING ${cols}`,
        [id, SITE],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async setCategories(id, categories) {
      const rows = (await sql.query(
        `UPDATE newsletter.subscribers SET categories = $3, updated_at = now() WHERE id = $1 AND site = $2 RETURNING ${cols}`,
        [id, SITE, categories],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async unsubscribe(id) {
      const rows = (await sql.query(
        `UPDATE newsletter.subscribers SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
         WHERE id = $1 AND site = $2 RETURNING ${cols}`,
        [id, SITE],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async listSubscribed() {
      const rows = (await sql.query(`SELECT ${cols} FROM newsletter.subscribers WHERE site = $1 AND status = 'subscribed'`, [SITE])) as Row[];
      return rows.map((row) => fromRow(row)!);
    },
    async claimSend(id, editionDate) {
      const rows = (await sql.query(
        `INSERT INTO newsletter.sends (subscriber_id, edition_date) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING subscriber_id`,
        [id, editionDate],
      )) as unknown[];
      return rows.length > 0;
    },
    async recordSend(id, editionDate, providerId) {
      await sql.query(`UPDATE newsletter.sends SET provider_id = $3, sent_at = now() WHERE subscriber_id = $1 AND edition_date = $2`, [
        id,
        editionDate,
        providerId,
      ]);
    },
    async releaseSend(id, editionDate) {
      await sql.query(`DELETE FROM newsletter.sends WHERE subscriber_id = $1 AND edition_date = $2 AND provider_id IS NULL`, [id, editionDate]);
    },
    async logEvent(id, event, detail = {}) {
      await sql.query(`INSERT INTO newsletter.email_events (subscriber_id, event, detail) VALUES ($1, $2, $3::jsonb)`, [
        id,
        event,
        JSON.stringify(detail),
      ]);
    },
  };
}

/* ------------------------------ Memory (tests) ----------------------------- */

const memory = {
  subscribers: new Map<string, Subscriber>(),
  sends: new Map<string, string | null>(),
  events: [] as Array<{ id: string | null; event: string; detail: Record<string, unknown> }>,
};

export function memoryStore(): Store {
  const byEmail = (email: string) => [...memory.subscribers.values()].find((s) => s.email === email);
  const update = (id: string, change: Partial<Subscriber>) => {
    const current = memory.subscribers.get(id);
    if (!current) return null;
    const next = { ...current, ...change };
    memory.subscribers.set(id, next);
    return next;
  };
  return {
    async upsertPending(email, categories) {
      const existing = byEmail(email);
      if (existing) {
        return update(existing.id, {
          categories,
          status: existing.status === 'subscribed' ? 'subscribed' : 'pending',
          consentAt: existing.status === 'subscribed' ? existing.consentAt : new Date().toISOString(),
        })!;
      }
      const subscriber: Subscriber = {
        id: crypto.randomUUID(),
        email,
        status: 'pending',
        categories,
        consentAt: new Date().toISOString(),
        confirmedAt: null,
      };
      memory.subscribers.set(subscriber.id, subscriber);
      return subscriber;
    },
    async get(id) {
      return memory.subscribers.get(id) ?? null;
    },
    async confirm(id) {
      const current = memory.subscribers.get(id);
      return update(id, { status: 'subscribed', confirmedAt: current?.confirmedAt ?? new Date().toISOString() });
    },
    async setCategories(id, categories) {
      return update(id, { categories });
    },
    async unsubscribe(id) {
      return update(id, { status: 'unsubscribed' });
    },
    async listSubscribed() {
      return [...memory.subscribers.values()].filter((s) => s.status === 'subscribed');
    },
    async claimSend(id, editionDate) {
      const key = `${id}:${editionDate}`;
      if (memory.sends.has(key)) return false;
      memory.sends.set(key, null);
      return true;
    },
    async recordSend(id, editionDate, providerId) {
      memory.sends.set(`${id}:${editionDate}`, providerId);
    },
    async releaseSend(id, editionDate) {
      const key = `${id}:${editionDate}`;
      if (memory.sends.get(key) === null) memory.sends.delete(key);
    },
    async logEvent(id, event, detail = {}) {
      memory.events.push({ id, event, detail });
    },
  };
}

/** Test-only view of the in-memory store. */
export function memorySnapshot() {
  return {
    subscribers: [...memory.subscribers.values()],
    sends: [...memory.sends.entries()],
    events: memory.events.map((entry) => entry.event),
  };
}
