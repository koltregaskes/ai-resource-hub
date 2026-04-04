# Events Calendar Architecture

## Recommendation

Use **Postgres as the source of truth** for AI events.

The website should render its own calendar from database records.
Public calendar outputs should be generated from that database, not treated as the master record.

## Why

- Events need daily verification.
- Dates, locations, and statuses change.
- A real database is better than a static file once event volume grows.
- The same event record may need:
  - a website detail page
  - a month calendar cell
  - filters by category and tags
  - an RSS or ICS feed
  - optional sync to a public Google Calendar

## Integration Choice

### GitHub

GitHub is useful for:

- storing the code
- storing data-ingestion scripts
- tracking manual review tasks

GitHub is **not** the best primary public calendar surface.
GitHub Projects can show planning views, but that is not the same thing as a reliable public event calendar for readers.

### Google Calendar

Google Calendar is useful as a **distribution surface**:

- readers can subscribe
- it can be embedded publicly
- it is familiar

Google Calendar should still be **secondary**.
The site database should remain canonical, with Google Calendar generated or synced from Postgres.

## Suggested Postgres Tables

### `hub_events`

One row per logical event.

Suggested columns:

- `id`
- `slug`
- `name`
- `organiser`
- `series_name`
- `category`
- `status` (`confirmed`, `tbc`, `series`, `cancelled`, `completed`)
- `description`
- `focus`
- `why_watch`
- `source_url`
- `official_site_url`
- `created_at`
- `updated_at`

### `hub_event_occurrences`

One row per actual dated occurrence.

Suggested columns:

- `id`
- `event_id`
- `start_at`
- `end_at`
- `timezone`
- `venue`
- `city`
- `region`
- `country`
- `location_mode` (`in_person`, `online`, `hybrid`)
- `registration_url`
- `cfp_url`
- `status`
- `last_verified_at`
- `verification_notes`
- `created_at`
- `updated_at`

### `hub_event_tags`

- `id`
- `name`
- `slug`
- `group_name`

### `hub_event_taggings`

- `event_id`
- `tag_id`

### `hub_event_sources`

Track where each event record came from and when it was checked.

- `id`
- `event_id`
- `source_type`
- `source_url`
- `checked_at`
- `status`
- `notes`

### `hub_calendar_sync_targets`

Optional later.

- `id`
- `target_type` (`google_calendar`, `ics_feed`)
- `target_identifier`
- `last_synced_at`
- `status`

## Daily Update Flow

1. Pull candidate events from trusted official sources.
2. Re-check known events for changes to:
   - date
   - time
   - venue
   - city
   - status
3. Mark any changed records with a fresh `last_verified_at`.
4. Regenerate:
   - website calendar views
   - filterable event pages
   - optional ICS feed
   - optional Google Calendar sync

## UI Shape

### Phase 1

- month calendar for confirmed events
- filterable directory with multi-select tags
- separate TBC / recurring-series watchlist

### Phase 2

- event detail pages
- "next 30 days" and "this quarter" views
- CFP deadlines and registration deadlines
- public ICS export

### Phase 3

- Google Calendar sync
- personalized saved filters
- newsletter or digest hooks
