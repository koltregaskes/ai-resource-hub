import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  SITE_SLUG,
  applySiteFilter,
  parseHtml,
  parseRss,
  refreshRoutedFeed,
} from '../scripts/refresh-routed-feed.mjs'

const siteFilter = {
  name: "AI Resource Hub",
  include_tags: ['product_launch', 'open_source'],
  exclude_tags: ['crypto'],
  min_importance_score: 0.35,
  max_articles_per_run: 15,
}

function pipeline(dir, sources) {
  fs.mkdirSync(path.join(dir, 'config'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'site-filters.json'), JSON.stringify({
    sites: { [SITE_SLUG]: siteFilter },
  }))
  fs.writeFileSync(path.join(dir, 'config', 'sources.json'), JSON.stringify({ sources }))
}

test('rss entries keep the source tags and the site filter', () => {
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Example</title>
    <item><title><![CDATA[Router launch]]></title><link>https://example.com/router</link><pubDate>Sun, 25 Oct 2026 21:31:16 +0000</pubDate><description>A real &amp; fetched summary.</description></item>
    </channel></rss>`
  const entries = parseRss(rss, { maxItems: 5 })
  assert.equal(entries.length, 1)
  assert.equal(entries[0].title, 'Router launch')
  assert.equal(entries[0].summary, 'A real & fetched summary.')
  assert.equal(entries[0].date, '2026-10-25T21:31:16.000Z')

  const kept = applySiteFilter([{
    ...entries[0],
    source: 'Example',
    tags: ['product_launch'],
    importance: 0.35,
    category: 'industry-media',
  }, {
    title: 'Paper',
    url: 'https://example.com/paper',
    date: '2026-10-25T12:00:00.000Z',
    source: 'Lab',
    tags: ['research_paper'],
    importance: 0.35,
    summary: 'Paper',
    category: 'academic',
  }], siteFilter, new Date('2026-10-26T00:00:00.000Z'))

  assert.deepEqual(kept.map((item) => item.url), ['https://example.com/router'])
  assert.deepEqual(kept[0].matching_tags, ['product_launch'])
})

test('html listings use dates that are on the page', () => {
  const html = `<!DOCTYPE html><html><body>
    <a href="https://arstechnica.com/ai/2026/10/openai-cloud/">OpenAI models reach Google Cloud</a>
    <time datetime="2026-10-23T16:19:55-04:00">10/23/2026</time>
    <a href="/news/donating-agent-skills-to-the-agentic-ai-foundation"><h3>Donating Agent Skills</h3></a>
    <time>Oct 22, 2026</time>
    <a href="https://www.digg.com/ai/bpr7gowe"><h3>T3 Code work list</h3></a>
    "clusterUrlId":"bpr7gowe","createdAt":"2026-10-25T20:01:22.038587+00:00"
    </body></html>`
  const dated = parseHtml(html, {
    url: 'https://www.anthropic.com/news',
    articleLinkPattern: 'https://(?:arstechnica\\.com/ai/2026/10/openai-cloud/|www\\.anthropic\\.com/news/donating-agent-skills-to-the-agentic-ai-foundation/?|www\\.digg\\.com/ai/bpr7gowe)/?$',
    maxItems: 5,
  })
  const byUrl = Object.fromEntries(dated.map((entry) => [entry.url, entry.date]))
  assert.equal(byUrl['https://arstechnica.com/ai/2026/10/openai-cloud/'], '2026-10-23T20:19:55.000Z')
  assert.equal(byUrl['https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation'], '2026-10-22T00:00:00.000Z')
  assert.equal(byUrl['https://www.digg.com/ai/bpr7gowe'], '2026-10-25T20:01:22.038Z')
})

test('a source that cannot be fetched fails by name and does not write', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-feed-'))
  const outputPath = path.join(dir, 'news-feed-latest.json')
  pipeline(dir, [{
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    adapter: 'rss',
    url: 'https://venturebeat.com/category/ai/feed/',
    tags: ['product_launch'],
  }])

  const result = await refreshRoutedFeed({
    pipelineDir: dir,
    outputPath,
    retries: 1,
    fetchImpl: async () => ({ ok: false, status: 429, text: async () => 'nope' }),
  })

  assert.equal(result.wrote, false)
  assert.equal(result.feed, null)
  assert.match(result.failures[0], /^venturebeat-ai \(VentureBeat AI\) could not be fetched: HTTP 429$/)
  assert.equal(fs.existsSync(outputPath), false)
})

test('an empty match writes a fresh empty feed and a matched item is written', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-feed-'))
  const outputPath = path.join(dir, 'news-feed-latest.json')
  fs.writeFileSync(outputPath, '{"untouched":true}\n')
  pipeline(dir, [
    {
      id: 'arxiv-cs-ai',
      name: 'arXiv cs.AI',
      adapter: 'rss',
      url: 'https://export.arxiv.org/rss/cs.AI',
      tags: ['research_paper'],
    },
    {
      id: 'techcrunch-ai',
      name: 'TechCrunch AI',
      adapter: 'rss',
      url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
      tags: ['product_launch'],
      categories: ['industry-media'],
    },
  ])
  const bodies = {
    'https://export.arxiv.org/rss/cs.AI': '<rss version="2.0"><channel><title>cs.AI</title></channel></rss>',
    'https://techcrunch.com/category/artificial-intelligence/feed/': '<rss version="2.0"><channel><item><title>Grok clip</title><link>https://techcrunch.com/2026/10/25/grok/</link><pubDate>Sun, 25 Oct 2026 21:31:16 +0000</pubDate><description>Fetched from the feed.</description></item></channel></rss>',
  }
  const missed = await refreshRoutedFeed({
    pipelineDir: dir,
    outputPath,
    now: new Date('2026-10-26T00:10:00.000Z'),
    retries: 1,
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      text: async () => url.endsWith('cs.AI') ? bodies[url] : '<rss version="2.0"><channel></channel></rss>',
    }),
  })
  assert.deepEqual(missed.failures, [])
  assert.equal(missed.wrote, true)
  const emptyFeed = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  assert.equal(emptyFeed.site, siteFilter.name)
  assert.equal(emptyFeed.generated, '2026-10-26T00:10:00.000Z')
  assert.equal(emptyFeed.article_count, 0)
  assert.deepEqual(emptyFeed.articles, [])

  const result = await refreshRoutedFeed({
    pipelineDir: dir,
    outputPath,
    now: new Date('2026-10-26T00:10:00.000Z'),
    retries: 1,
    fetchImpl: async (url) => ({ ok: true, status: 200, text: async () => bodies[url] }),
  })

  assert.deepEqual(result.failures, [])
  assert.equal(result.wrote, true)
  const feed = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  assert.equal(feed.site, "AI Resource Hub")
  assert.equal(feed.generated, '2026-10-26T00:10:00.000Z')
  assert.equal(feed.article_count, 1)
  assert.equal(feed.articles[0].title, 'Grok clip')
  assert.equal(feed.articles[0].source, 'TechCrunch AI')
  assert.deepEqual(feed.articles[0].tags, ['product_launch'])
  assert.equal(feed.articles[0].summary, 'Fetched from the feed.')
})


test('html dates come from the enclosing card when the time is before the link', () => {
  const html = `<!DOCTYPE html><html><body>
    <article><time datetime="2026-10-25T12:00:00Z">Oct 25, 2026</time><a href="https://example.com/first-story-headline">First story headline</a></article>
    <article><time datetime="2026-10-24T12:00:00Z">Oct 24, 2026</time><a href="https://example.com/second-story-headline">Second story headline</a></article>
    <div class="card"><time datetime="2026-10-23T08:00:00Z"></time><a href="https://example.com/card-story-headline">Card story headline</a></div>
    <div class="card"><time datetime="2026-10-22T08:00:00Z"></time><a href="https://example.com/other-card-headline">Other card headline</a></div>
    </body></html>`
  const dated = parseHtml(html, {
    url: 'https://example.com/news',
    articleLinkPattern: 'https://example\\.com/(?:first-story-headline|second-story-headline|card-story-headline|other-card-headline)/?$',
    maxItems: 10,
  })
  const byUrl = Object.fromEntries(dated.map((entry) => [entry.url, entry.date]))
  assert.equal(byUrl['https://example.com/first-story-headline'], '2026-10-25T12:00:00.000Z')
  assert.equal(byUrl['https://example.com/second-story-headline'], '2026-10-24T12:00:00.000Z')
  assert.equal(byUrl['https://example.com/card-story-headline'], '2026-10-23T08:00:00.000Z')
  assert.equal(byUrl['https://example.com/other-card-headline'], '2026-10-22T08:00:00.000Z')
  assert.equal(dated.length, 4)
})

test('a thrown timeout uses the remaining retries', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-feed-'))
  const outputPath = path.join(dir, 'news-feed-latest.json')
  pipeline(dir, [{
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    adapter: 'rss',
    url: 'https://venturebeat.com/category/ai/feed/',
    tags: ['product_launch'],
  }])
  let calls = 0
  const result = await refreshRoutedFeed({
    pipelineDir: dir,
    outputPath,
    now: new Date('2026-10-26T00:10:00.000Z'),
    retries: 3,
    fetchImpl: async () => {
      calls += 1
      if (calls === 1) throw new Error('The operation was aborted due to timeout')
      return { ok: true, status: 200, text: async () => '<rss version="2.0"><channel></channel></rss>' }
    },
  })
  assert.ok(calls >= 2)
  assert.deepEqual(result.failures, [])
  assert.equal(result.wrote, true)
  const feed = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  assert.equal(feed.article_count, 0)
  assert.equal(feed.generated, '2026-10-26T00:10:00.000Z')
})

test('a non-retryable HTTP response fails immediately and names the source', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routed-feed-'))
  const outputPath = path.join(dir, 'news-feed-latest.json')
  pipeline(dir, [{
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    adapter: 'rss',
    url: 'https://venturebeat.com/category/ai/feed/',
    tags: ['product_launch'],
  }])
  let calls = 0
  const result = await refreshRoutedFeed({
    pipelineDir: dir,
    outputPath,
    retries: 3,
    fetchImpl: async () => {
      calls += 1
      return { ok: false, status: 404, text: async () => 'missing' }
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.wrote, false)
  assert.equal(result.feed, null)
  assert.match(result.failures[0], /^venturebeat-ai \(VentureBeat AI\) could not be fetched: HTTP 404$/)
  assert.equal(fs.existsSync(outputPath), false)
})

test('the refresh workflow fetches the shared config and commits only the feed', () => {
  const workflow = fs.readFileSync(
    path.join(import.meta.dirname, '..', '.github', 'workflows', 'refresh-routed-feed.yml'),
    'utf8',
  )
  assert.match(workflow, /cron: '15 5 \* \* \*'/)
  assert.match(workflow, /repository: koltregaskes\/ai-resource-hub/)
  assert.match(workflow, /shared\/website-tools\/pipelines\/news/)
  assert.match(workflow, /persist-credentials: false/)
  assert.match(workflow, /node scripts\/refresh-routed-feed\.mjs --pipeline/)
  assert.match(workflow, /git add -- src\/data\/news-feed-latest.json/)
  assert.doesNotMatch(workflow, /git add -A|git add \./)
  assert.match(workflow, /actions\/deploy-pages@/)
  assert.match(workflow, /pages: write/)
  assert.match(workflow, /id-token: write/)
  assert.doesNotMatch(workflow, /secrets\.[A-Z0-9_]*(?:PAT|TOKEN)/)
})
