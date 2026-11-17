import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  HARD_MAX_DAYS,
  MISSING_SOURCE,
  WARN_AFTER_DAYS,
  assessRoutedFeedFreshness,
  formatReport,
} from '../scripts/check-routed-feed-freshness.mjs'

const now = new Date('2026-10-26T06:30:00.000Z')

function feedAt(iso) {
  return {
    generated: iso,
    site: "AI Resource Hub",
    article_count: 1,
    articles: [{ title: 'Release', url: 'https://example.com/release', date: iso }],
  }
}

test('a feed younger than one day does not warn', () => {
  const generated = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
  const assessment = assessRoutedFeedFreshness(feedAt(generated), now)

  assert.equal(assessment.warn, false)
  assert.equal(assessment.hardFail, false)
  assert.ok(assessment.ageDays < WARN_AFTER_DAYS)
})

test('a fresh empty feed does not warn', () => {
  const generated = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
  const assessment = assessRoutedFeedFreshness({
    generated,
    site: "AI Resource Hub",
    article_count: 0,
    articles: [],
  }, now)

  assert.equal(assessment.warn, false)
  assert.equal(assessment.newestItemAt, generated)
})

test('a one-day-old feed warns before it is three days old', () => {
  const generated = new Date(now.getTime() - WARN_AFTER_DAYS * 86_400_000).toISOString()
  const assessment = assessRoutedFeedFreshness(feedAt(generated), now)

  assert.equal(assessment.warn, true)
  assert.equal(assessment.hardFail, false)
  assert.ok(assessment.ageDays < HARD_MAX_DAYS)
  assert.match(formatReport(assessment), /Missing source: The 05:15 UTC refresh/)
  assert.match(MISSING_SOURCE, /sources\.json/)
  assert.match(MISSING_SOURCE, /src\/data/)
})

test('the scheduled workflow runs this check every day and does not fetch', () => {
  const workflow = fs.readFileSync(
    path.join(import.meta.dirname, '..', '.github', 'workflows', 'routed-feed-freshness.yml'),
    'utf8',
  )

  assert.match(workflow, /cron: '30 6 \* \* \*'/)
  assert.match(workflow, /node scripts\/check-routed-feed-freshness\.mjs/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.doesNotMatch(workflow, /contents: write/)
  assert.doesNotMatch(workflow, /refresh-routed-feed/)
})
