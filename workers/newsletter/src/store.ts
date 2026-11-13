/**
 * Subscriber storage. Production uses Neon over HTTP (schema.sql); local tests
 * use an in-memory store, which the Worker only allows when ENVIRONMENT=test.
 *
 * Consent rules the store enforces:
 * - Every sign-up gets a fresh single-use confirmation nonce. Confirming
 *   consumes it atomically; unsubscribing clears it. A replayed or
 *   superseded confirmation link therefore changes nothing.
 * - A public sign-up never changes an active reader's categories. It is
 *   stored as a pending change that applies only when its own confirmation
 *   link is clicked.
 * - Unsubscribing bumps token_gen, which kills every manage link issued so far.
 */
import { neon } from '@neondatabase/serverless';

export type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  categories: string[];
  pendingCategories: string[] | null;
  consentAt: string;
  confirmedAt: string | null;
  tokenGen: number;
}

/** Stale send claims (no provider id after this long) can be reclaimed by a later run. */
export const SEND_LEASE_SECONDS = 15 * 60;

/** Immutable provider request, persisted before the first outbound attempt. */
export interface SendBatch {
  key: string;
  editionDate: string;
  recipientIds: string[];
  requestBody: string;
  createdAtMs: number;
  providerIds: string[] | null;
  complete: boolean;
  closed?: boolean;
}

export interface Store {
  closeBatch(key: string, token: string): Promise<void>;
  purgeBatchBodies(nowMs: number): Promise<void>;
  saveBatch(batch: SendBatch): Promise<void>;
  listPendingBatches(): Promise<SendBatch[]>;
  claimBatch(key: string, nowMs: number, token: string): Promise<SendBatch | null>;
  acceptBatch(key: string, token: string, providerIds: string[]): Promise<void>;
  completeBatch(key: string, token: string): Promise<void>;
  releaseBatch(key: string, token: string): Promise<void>;
  isSendRecorded(id: string, editionDate: string): Promise<boolean>;
  /** Records a sign-up with a fresh confirmation nonce (see the consent rules above). */
  upsertPending(email: string, categories: string[], source: string, nonce: string): Promise<Subscriber>;
  get(id: string): Promise<Subscriber | null>;
  /** Consumes the nonce. Returns null if it is not the reader's current pending confirmation. */
  confirm(id: string, nonce: string): Promise<Subscriber | null>;
  setCategories(id: string, categories: string[]): Promise<Subscriber | null>;
  unsubscribe(id: string): Promise<Subscriber | null>;
  listSubscribed(): Promise<Subscriber[]>;
  /** Adds one hit to a fixed-window bucket and returns the hits so far in that window. */
  hit(bucket: string, windowSeconds: number, nowMs: number): Promise<number>;
  /** False if this reader already has a live claim or a send for the edition. Claims older than SEND_LEASE_SECONDS with no provider id are reclaimed. */
  claimSend(id: string, editionDate: string, nowMs: number): Promise<boolean>;
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
  pending_categories: string[] | null;
  consent_at: string | Date;
  confirmed_at: string | Date | null;
  token_gen: number;
}

const iso = (value: string | Date | null) => (value === null ? null : new Date(value).toISOString());
const fromRow = (row: Row | undefined): Subscriber | null =>
  row
    ? {
        id: row.id,
        email: row.email,
        status: row.status,
        categories: row.categories,
        pendingCategories: row.pending_categories,
        consentAt: iso(row.consent_at)!,
        confirmedAt: iso(row.confirmed_at),
        tokenGen: Number(row.token_gen),
      }
    : null;

function batchFromRow(row: any): SendBatch {
  return { key: row.batch_key, editionDate: String(row.edition_date).slice(0, 10), recipientIds: row.recipient_ids,
    requestBody: row.request_body, createdAtMs: Number(row.created_at_ms), providerIds: row.provider_ids,
    closed: row.state === 'closed', complete: row.state === 'complete' };
}
const batchCols = "batch_key, edition_date::text, recipient_ids, request_body, extract(epoch from created_at)*1000 AS created_at_ms, provider_ids, state";

export function neonStore(databaseUrl: string): Store {
  const sql = neon(databaseUrl);
  const cols = 'id, email, status, categories, pending_categories, consent_at, confirmed_at, token_gen';
  const S = 'newsletter.subscribers';
  return {
    async closeBatch(key, token) {
      const rows = await sql.query("UPDATE newsletter.send_batches SET state='closed', request_body='' WHERE batch_key=$1 AND lease_token=$2 AND site=$3 RETURNING batch_key", [key, token, SITE]);
      if (!rows.length) throw new Error('Batch lease lost before closure');
    },
    async purgeBatchBodies(nowMs) {
      await sql.query("UPDATE newsletter.send_batches SET request_body='' WHERE site=$1 AND (state IN ('complete','closed') OR created_at <= to_timestamp($2)-interval '24 hours')", [SITE, nowMs/1000]);
    },
    async saveBatch(batch) {
      // One transaction: the immutable request and every unique recipient reservation.
      // A competing batch for any (reader, edition) rolls the whole transaction back.
      await sql.transaction([
        sql.query(`INSERT INTO newsletter.send_batches (batch_key, site, edition_date, recipient_ids, request_body, created_at)
          VALUES ($1,$2,$3,$4,$5,to_timestamp($6))`,
          [batch.key, SITE, batch.editionDate, batch.recipientIds, batch.requestBody, batch.createdAtMs / 1000]),
        sql.query(`INSERT INTO newsletter.send_batch_recipients (subscriber_id, edition_date, batch_key)
          SELECT unnest($1::uuid[]), $2::date, $3`, [batch.recipientIds, batch.editionDate, batch.key]),
      ]);
    },
    async listPendingBatches() {
      const rows = await sql.query(`SELECT ${batchCols} FROM newsletter.send_batches WHERE site=$1 AND state IN ('prepared','accepted') ORDER BY created_at, batch_key`, [SITE]);
      return rows.map(batchFromRow);
    },
    async claimBatch(key, nowMs, token) {
      const rows = await sql.query(`UPDATE newsletter.send_batches SET lease_token=$3, lease_until=to_timestamp($2)+make_interval(secs => $4)
        WHERE batch_key=$1 AND site=$5 AND state IN ('prepared','accepted') AND (lease_until IS NULL OR lease_until <= to_timestamp($2))
        RETURNING ${batchCols}`, [key, nowMs / 1000, token, SEND_LEASE_SECONDS, SITE]);
      return rows[0] ? batchFromRow(rows[0]) : null;
    },
    async acceptBatch(key, token, ids) {
      const rows = await sql.query(`UPDATE newsletter.send_batches SET provider_ids=$3::jsonb, state='accepted'
        WHERE batch_key=$1 AND lease_token=$2 AND site=$4 RETURNING batch_key`, [key, token, JSON.stringify(ids), SITE]);
      if (!rows.length) throw new Error('Batch lease lost before acceptance was recorded');
    },
    async completeBatch(key, token) {
      const rows = await sql.query(`UPDATE newsletter.send_batches SET state='complete', request_body=''
        WHERE batch_key=$1 AND lease_token=$2 AND site=$3 AND state='accepted' RETURNING batch_key`, [key, token, SITE]);
      if (!rows.length) throw new Error('Batch lease lost before completion');
    },
    async releaseBatch(key, token) {
      await sql.query(`UPDATE newsletter.send_batches SET lease_token=NULL, lease_until=NULL WHERE batch_key=$1 AND lease_token=$2 AND site=$3`, [key, token, SITE]);
    },
    async isSendRecorded(id, date) {
      return (await sql.query('SELECT 1 FROM newsletter.sends WHERE subscriber_id=$1 AND edition_date=$2 AND provider_id IS NOT NULL', [id, date])).length > 0;
    },
    async upsertPending(email, categories, source, nonce) {
      const rows = (await sql.query(
        `INSERT INTO ${S} (site, email, categories, consent_source, confirm_nonce)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (site, email) DO UPDATE SET
           categories         = CASE WHEN ${S}.status = 'subscribed' THEN ${S}.categories ELSE EXCLUDED.categories END,
           pending_categories = CASE WHEN ${S}.status = 'subscribed' THEN EXCLUDED.categories ELSE NULL END,
           status             = CASE WHEN ${S}.status = 'subscribed' THEN 'subscribed' ELSE 'pending' END,
           consent_at         = CASE WHEN ${S}.status = 'subscribed' THEN ${S}.consent_at ELSE now() END,
           consent_source     = CASE WHEN ${S}.status = 'subscribed' THEN ${S}.consent_source ELSE EXCLUDED.consent_source END,
           confirm_nonce      = EXCLUDED.confirm_nonce,
           updated_at         = now()
         RETURNING ${cols}`,
        [SITE, email, categories, source, nonce],
      )) as Row[];
      return fromRow(rows[0])!;
    },
    async get(id) {
      const rows = (await sql.query(`SELECT ${cols} FROM ${S} WHERE id = $1 AND site = $2`, [id, SITE])) as Row[];
      return fromRow(rows[0]);
    },
    async confirm(id, nonce) {
      // One statement: the nonce check and its consumption cannot race.
      const rows = (await sql.query(
        `UPDATE ${S} SET
           categories = COALESCE(pending_categories, categories),
           pending_categories = NULL,
           confirmed_at = CASE WHEN status = 'pending' THEN now() ELSE confirmed_at END,
           status = 'subscribed',
           confirm_nonce = NULL,
           unsubscribed_at = NULL,
           updated_at = now()
         WHERE id = $1 AND site = $2 AND confirm_nonce = $3 AND status IN ('pending', 'subscribed')
         RETURNING ${cols}`,
        [id, SITE, nonce],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async setCategories(id, categories) {
      const rows = (await sql.query(
        `UPDATE ${S} SET categories = $3, updated_at = now() WHERE id = $1 AND site = $2 AND status = 'subscribed' RETURNING ${cols}`,
        [id, SITE, categories],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async unsubscribe(id) {
      const rows = (await sql.query(
        `UPDATE ${S} SET status = 'unsubscribed', unsubscribed_at = now(), confirm_nonce = NULL, pending_categories = NULL,
           token_gen = token_gen + 1, updated_at = now()
         WHERE id = $1 AND site = $2 RETURNING ${cols}`,
        [id, SITE],
      )) as Row[];
      return fromRow(rows[0]);
    },
    async listSubscribed() {
      const rows = (await sql.query(`SELECT ${cols} FROM ${S} WHERE site = $1 AND status = 'subscribed' ORDER BY created_at, id`, [SITE])) as Row[];
      return rows.map((row) => fromRow(row)!);
    },
    async hit(bucket, windowSeconds, nowMs) {
      const windowStart = Math.floor(nowMs / 1000 / windowSeconds) * windowSeconds;
      const rows = (await sql.query(
        `INSERT INTO newsletter.rate_limits (bucket, window_start, hits) VALUES ($1, to_timestamp($2), 1)
         ON CONFLICT (bucket, window_start) DO UPDATE SET hits = newsletter.rate_limits.hits + 1
         RETURNING hits`,
        [bucket, windowStart],
      )) as Array<{ hits: number }>;
      return Number(rows[0].hits);
    },
    async claimSend(id, editionDate, nowMs) {
      const rows = (await sql.query(
        `INSERT INTO newsletter.sends (subscriber_id, edition_date, claimed_at) SELECT $1, $2, to_timestamp($3)
         WHERE NOT EXISTS (SELECT 1 FROM newsletter.send_batch_recipients WHERE subscriber_id=$1 AND edition_date=$2)
         ON CONFLICT (subscriber_id, edition_date) DO UPDATE SET claimed_at = EXCLUDED.claimed_at
           WHERE newsletter.sends.provider_id IS NULL
             AND newsletter.sends.claimed_at < EXCLUDED.claimed_at - make_interval(secs => $4)
         RETURNING subscriber_id`,
        [id, editionDate, nowMs / 1000, SEND_LEASE_SECONDS],
      )) as unknown[];
      return rows.length > 0;
    },
    async recordSend(id, editionDate, providerId) {
      await sql.query(`INSERT INTO newsletter.sends (subscriber_id, edition_date, provider_id, sent_at) VALUES ($1,$2,$3,now())
        ON CONFLICT (subscriber_id, edition_date) DO UPDATE SET provider_id=EXCLUDED.provider_id, sent_at=EXCLUDED.sent_at`, [
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

type MemoryRecord = Subscriber & { confirmNonce: string | null };

const memory = {
  batches: new Map<string, SendBatch & { leaseToken: string | null; leaseUntilMs: number }>(),
  subscribers: new Map<string, MemoryRecord>(),
  sends: new Map<string, { providerId: string | null; claimedAt: number }>(),
  buckets: new Map<string, number>(),
  events: [] as Array<{ id: string | null; event: string; detail: Record<string, unknown> }>,
};

const publicView = ({ confirmNonce: _nonce, ...subscriber }: MemoryRecord): Subscriber => ({ ...subscriber });

export function memoryStore(): Store {
  const byEmail = (email: string) => [...memory.subscribers.values()].find((s) => s.email === email);
  const update = (id: string, change: Partial<MemoryRecord>) => {
    const current = memory.subscribers.get(id);
    if (!current) return null;
    const next = { ...current, ...change };
    memory.subscribers.set(id, next);
    return publicView(next);
  };
  return {
    async closeBatch(key, token) {
      const batch = memory.batches.get(key)!;
      if (batch.leaseToken !== token) throw new Error('Batch lease lost before closure');
      batch.closed = true; batch.requestBody = '';
    },
    async purgeBatchBodies(nowMs) {
      for (const batch of memory.batches.values()) if (batch.complete || batch.closed || nowMs-batch.createdAtMs >= 24*3600000) batch.requestBody = '';
    },
    async saveBatch(batch) {
      if (memory.batches.has(batch.key) || [...memory.batches.values()].some(b => b.editionDate === batch.editionDate && b.recipientIds.some(id => batch.recipientIds.includes(id)))) throw new Error('Batch recipients already reserved');
      memory.batches.set(batch.key, { ...structuredClone(batch), leaseToken: null, leaseUntilMs: 0 });
    },
    async listPendingBatches() {
      return structuredClone([...memory.batches.values()].filter(b => !b.complete && !b.closed));
    },
    async claimBatch(key, nowMs, token) {
      const batch = memory.batches.get(key);
      if (!batch || batch.complete || batch.closed || (batch.leaseToken && batch.leaseUntilMs > nowMs)) return null;
      batch.leaseToken = token; batch.leaseUntilMs = nowMs + SEND_LEASE_SECONDS * 1000;
      return structuredClone(batch);
    },
    async acceptBatch(key, token, ids) {
      const batch = memory.batches.get(key)!;
      if (batch.leaseToken !== token) throw new Error('Batch lease lost before acceptance was recorded');
      batch.providerIds = [...ids];
    },
    async completeBatch(key, token) {
      const batch = memory.batches.get(key)!;
      if (batch.leaseToken !== token || !batch.providerIds) throw new Error('Batch lease lost before completion');
      batch.complete = true; batch.requestBody = '';
    },
    async releaseBatch(key, token) {
      const batch = memory.batches.get(key)!;
      if (batch.leaseToken === token) { batch.leaseToken = null; batch.leaseUntilMs = 0; }
    },
    async isSendRecorded(id, date) {
      return memory.sends.get(id + ':' + date)?.providerId != null;
    },
    async upsertPending(email, categories, _source, nonce) {
      const existing = byEmail(email);
      if (existing) {
        const active = existing.status === 'subscribed';
        return update(existing.id, {
          categories: active ? existing.categories : categories,
          pendingCategories: active ? categories : null,
          status: active ? 'subscribed' : 'pending',
          consentAt: active ? existing.consentAt : new Date().toISOString(),
          confirmNonce: nonce,
        })!;
      }
      const record: MemoryRecord = {
        id: crypto.randomUUID(),
        email,
        status: 'pending',
        categories,
        pendingCategories: null,
        consentAt: new Date().toISOString(),
        confirmedAt: null,
        tokenGen: 1,
        confirmNonce: nonce,
      };
      memory.subscribers.set(record.id, record);
      return publicView(record);
    },
    async get(id) {
      const record = memory.subscribers.get(id);
      return record ? publicView(record) : null;
    },
    async confirm(id, nonce) {
      const current = memory.subscribers.get(id);
      if (!current || !nonce || current.confirmNonce !== nonce || current.status === 'unsubscribed') return null;
      return update(id, {
        categories: current.pendingCategories ?? current.categories,
        pendingCategories: null,
        confirmedAt: current.status === 'pending' ? new Date().toISOString() : current.confirmedAt,
        status: 'subscribed',
        confirmNonce: null,
      });
    },
    async setCategories(id, categories) {
      return memory.subscribers.get(id)?.status === 'subscribed' ? update(id, { categories }) : null;
    },
    async unsubscribe(id) {
      const current = memory.subscribers.get(id);
      if (!current) return null;
      return update(id, { status: 'unsubscribed', confirmNonce: null, pendingCategories: null, tokenGen: current.tokenGen + 1 });
    },
    async listSubscribed() {
      return [...memory.subscribers.values()].filter((s) => s.status === 'subscribed').map(publicView);
    },
    async hit(bucket, windowSeconds, nowMs) {
      const key = `${bucket}@${Math.floor(nowMs / 1000 / windowSeconds)}`;
      const hits = (memory.buckets.get(key) ?? 0) + 1;
      memory.buckets.set(key, hits);
      return hits;
    },
    async claimSend(id, editionDate, nowMs) {
      if ([...memory.batches.values()].some(b => b.editionDate === editionDate && b.recipientIds.includes(id))) return false;
      const key = `${id}:${editionDate}`;
      const existing = memory.sends.get(key);
      if (existing && (existing.providerId !== null || nowMs - existing.claimedAt < SEND_LEASE_SECONDS * 1000)) return false;
      memory.sends.set(key, { providerId: null, claimedAt: nowMs });
      return true;
    },
    async recordSend(id, editionDate, providerId) {
      const key = `${id}:${editionDate}`;
      memory.sends.set(key, { providerId, claimedAt: memory.sends.get(key)?.claimedAt ?? Date.now() });
    },
    async releaseSend(id, editionDate) {
      const key = `${id}:${editionDate}`;
      if (memory.sends.get(key)?.providerId === null) memory.sends.delete(key);
    },
    async logEvent(id, event, detail = {}) {
      memory.events.push({ id, event, detail });
    },
  };
}

/** Test-only: add already-confirmed readers directly (for large-send tests). */
export function memorySeed(count: number, categories: string[], prefix: string): number {
  for (let i = 0; i < count; i++) {
    const record: MemoryRecord = {
      id: crypto.randomUUID(),
      email: `${prefix}-${i}@example.com`,
      status: 'subscribed',
      categories,
      pendingCategories: null,
      consentAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      tokenGen: 1,
      confirmNonce: null,
    };
    memory.subscribers.set(record.id, record);
  }
  return count;
}

/** Test-only view of the in-memory store. */
export function memorySnapshot() {
  return {
    batches: structuredClone([...memory.batches.values()]),
    subscribers: [...memory.subscribers.values()].map(publicView),
    sends: [...memory.sends.entries()].map(([key, value]) => [key, value.providerId]),
    events: memory.events.map((entry) => entry.event),
  };
}
