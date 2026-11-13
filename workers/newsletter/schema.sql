-- AI Resource Hub newsletter tables (hub #1497).
-- Target: the Rooms OS Neon database, schema `newsletter`. NOT applied anywhere yet:
-- creating these in Neon waits for Kol's yes on the Worker going live.
-- Category ids come from shared/news-categories.json and must stay stable.

CREATE SCHEMA IF NOT EXISTS newsletter;

CREATE TABLE IF NOT EXISTS newsletter.subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site          TEXT NOT NULL DEFAULT 'ai-resource-hub',
  email         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'subscribed', 'unsubscribed')),
  categories    TEXT[] NOT NULL,
  pending_categories TEXT[],                          -- a sign-up from an active reader; applied only when confirmed
  confirm_nonce TEXT,                                 -- current single-use confirmation; NULL once used or after unsubscribe
  token_gen     INTEGER NOT NULL DEFAULT 1,           -- manage-link generation; bumped on unsubscribe
  consent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),   -- when the sign-up form was submitted
  consent_source TEXT NOT NULL DEFAULT 'site',
  confirmed_at  TIMESTAMPTZ,                          -- double opt-in click
  unsubscribed_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site, email)
);

CREATE INDEX IF NOT EXISTS subscribers_active_idx ON newsletter.subscribers (site) WHERE status = 'subscribed';

-- One row per subscriber per edition, so a re-run of the daily send never emails anyone twice.
CREATE TABLE IF NOT EXISTS newsletter.sends (
  subscriber_id UUID NOT NULL REFERENCES newsletter.subscribers(id),
  edition_date  DATE NOT NULL,
  provider_id   TEXT,                                 -- NULL while claimed but not yet sent
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),   -- a NULL-provider claim older than 15 minutes can be reclaimed
  sent_at       TIMESTAMPTZ,
  PRIMARY KEY (subscriber_id, edition_date)
);

-- Fixed-window counters for sign-up limits. Buckets hold keyed hashes, never raw addresses or IPs.
CREATE TABLE IF NOT EXISTS newsletter.rate_limits (
  bucket        TEXT NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  hits          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

-- Audit trail: subscribe, confirm, preferences, unsubscribe, send, bounce, complaint.
CREATE TABLE IF NOT EXISTS newsletter.email_events (
  id            BIGSERIAL PRIMARY KEY,
  subscriber_id UUID REFERENCES newsletter.subscribers(id),
  event         TEXT NOT NULL,
  detail        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_events_subscriber_idx ON newsletter.email_events (subscriber_id, created_at DESC);

-- Immutable outbox: persist BEFORE calling Resend. Apply at the approved schema setup, not from a build.
CREATE TABLE IF NOT EXISTS newsletter.send_batches (
  batch_key TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  edition_date DATE NOT NULL,
  recipient_ids UUID[] NOT NULL,
  request_body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  state TEXT NOT NULL DEFAULT 'prepared' CHECK (state IN ('prepared','accepted','complete')),
  provider_ids JSONB,
  lease_token TEXT,
  lease_until TIMESTAMPTZ,
  CHECK ((state = 'prepared' AND provider_ids IS NULL) OR (state <> 'prepared' AND provider_ids IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS send_batches_pending_idx ON newsletter.send_batches (site, created_at) WHERE state <> 'complete';
CREATE TABLE IF NOT EXISTS newsletter.send_batch_recipients (
  subscriber_id UUID NOT NULL REFERENCES newsletter.subscribers(id),
  edition_date DATE NOT NULL,
  batch_key TEXT NOT NULL REFERENCES newsletter.send_batches(batch_key),
  PRIMARY KEY (subscriber_id, edition_date)
);
