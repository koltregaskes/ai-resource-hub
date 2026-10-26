import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  ROUTED_FEED_PATH,
  loadRoutedHeadlines,
  loadRoutedNewsCards,
  mapRoutedArticles,
} from '../src/data/routed-news.ts'

test('the feed path is the checkout file, not the bundled module path', () => {
  assert.equal(ROUTED_FEED_PATH, path.resolve(process.cwd(), 'src', 'data', 'news-feed-latest.json'))
})

test('a dated gatherer article keeps its calendar day and source tags', () => {
  const cards = mapRoutedArticles([{
    title: 'Router launch',
    url: 'https://example.com/router',
    source: 'TechCrunch AI',
    tags: ['model_release', 'open_source'],
    date: '2026-10-25T21:31:16.000Z',
    summary: 'Fetched from the feed.',
  }])
  assert.equal(cards.length, 1)
  assert.equal(cards[0].date, '2026-10-25')
  assert.equal(cards[0].digestDate, '2026-10-25')
  assert.deepEqual(cards[0].tags, ['model_release', 'open_source'])
  assert.equal(cards[0].id, 'https://example.com/router')
  assert.equal(cards[0].category, 'News')
})

test('an empty or unnamed feed does not replace the archive', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-news-'))
  const emptyPath = path.join(dir, 'empty.json')
  fs.writeFileSync(emptyPath, JSON.stringify({
    generated: '2026-10-26T01:22:00.000Z',
    site: 'AI Resource Hub',
    article_count: 0,
    articles: [],
  }))
  assert.deepEqual(loadRoutedNewsCards(emptyPath), [])
  assert.equal(loadRoutedHeadlines(emptyPath), null)

  const otherPath = path.join(dir, 'other.json')
  fs.writeFileSync(otherPath, JSON.stringify({
    site: 'Somewhere Else',
    articles: [{ title: 'Nope', url: 'https://example.com/nope', date: '2026-10-25T00:00:00.000Z' }],
  }))
  assert.deepEqual(loadRoutedNewsCards(otherPath), [])
})

test('headlines use the gatherer dates and stop at six', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-news-'))
  const feedPath = path.join(dir, 'news-feed-latest.json')
  const articles = Array.from({ length: 7 }, (_, index) => ({
    title: `Story ${index}`,
    url: `https://example.com/${index}`,
    source: 'Example',
    tags: ['model_release'],
    date: `2026-10-${String(20 + index).padStart(2, '0')}T12:00:00.000Z`,
    summary: 'Fetched.',
  }))
  fs.writeFileSync(feedPath, JSON.stringify({
    site: 'AI Resource Hub',
    articles,
  }))
  const headlines = loadRoutedHeadlines(feedPath)
  assert.equal(headlines.length, 6)
  assert.equal(headlines[0].title, 'Story 6')
  assert.equal(headlines[0].headlineDate, '2026-10-26T12:00:00.000Z')
  assert.equal(headlines[0].url, 'https://example.com/6')
})
