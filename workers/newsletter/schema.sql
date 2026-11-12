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
  provider_id   TEXT,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (subscriber_id, edition_date)
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
