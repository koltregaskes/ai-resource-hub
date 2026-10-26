/* eslint-disable no-console */
/**
 * Fetches the shared news sources and writes this site's routed feed.
 *
 * Sources and filters come from the news pipeline config
 * (config/sources.json and site-filters.json). Articles are the entries
 * those sources return. This script does not invent items. A source that
 * cannot be fetched fails the run by name, and the feed file is left unchanged.
 * A successful fetch writes the feed even when nothing matches: a fresh
 * generated timestamp and an empty article list.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SITE_SLUG = 'ai-resource-hub'
const OUTPUT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'news-feed-latest.json')
const USER_AGENTS = [
  'Mozilla/5.0 (compatible; KolRoutedFeed/1.0; +https://github.com/koltregaskes)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
]
const FETCH_HEADERS = {
  accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml,application/json;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504])
const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function cleanText(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
      const lower = entity.toLowerCase()
      if (lower.startsWith('#x')) {
        const code = Number.parseInt(lower.slice(2), 16)
        return Number.isNaN(code) ? match : String.fromCodePoint(code)
      }
      if (lower.startsWith('#')) {
        const code = Number.parseInt(lower.slice(1), 10)
        return Number.isNaN(code) ? match : String.fromCodePoint(code)
      }
      const named = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' }
      return named[lower] ?? match
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function isoFromValue(value) {
  const text = String(value || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}|$)/.test(text)) return ''
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

function humanDate(value) {
  const match = /^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})$/.exec(String(value || '').trim())
  if (!match) return ''
  const month = MONTHS[match[1].slice(0, 3).toLowerCase()]
  const day = Number(match[2])
  const year = Number(match[3])
  if (month == null || day < 1 || day > 31) return ''
  return new Date(Date.UTC(year, month, day)).toISOString()
}

function parseTimestamp(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const iso = isoFromValue(text)
  if (iso) return iso
  const human = humanDate(text)
  if (human) return human
  if (/^[A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\b/.test(text)) {
    const parsed = new Date(text)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return ''
}

function readTag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : ''
}

function readLink(block) {
  const text = cleanText(readTag(block, 'link'))
  if (/^https?:\/\//i.test(text)) return text
  let fallback = ''
  for (const link of block.matchAll(/<link\b([^>]*?)\/?>/gi)) {
    const href = /href=["']([^"']+)["']/i.exec(link[1])?.[1] || ''
    if (!href) continue
    const rel = /rel=["']([^"']+)["']/i.exec(link[1])?.[1] || 'alternate'
    if (rel === 'alternate') return href
    if (!fallback) fallback = href
  }
  const guid = cleanText(readTag(block, 'guid') || readTag(block, 'id'))
  return /^https?:\/\//i.test(guid) ? guid : fallback
}

function parseRss(xml, source) {
  if (!/<(rss|feed|channel)\b/i.test(xml)) {
    throw new Error('response was not an RSS or Atom feed')
  }
  const entries = []
  for (const match of xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const block = match[2]
    const title = cleanText(readTag(block, 'title'))
    const url = readLink(block)
    const date = parseTimestamp(
      readTag(block, 'pubDate')
      || readTag(block, 'dc:date')
      || readTag(block, 'published')
      || readTag(block, 'updated'),
    )
    const summary = cleanText(
      readTag(block, 'description') || readTag(block, 'summary') || readTag(block, 'content'),
    )
    if (title && /^https?:\/\//i.test(url)) entries.push({ title, url, date, summary })
  }
  return capEntries(entries, source.maxItems)
}

function tagBoundary(lower, start, tagName) {
  const next = lower[start + 1 + tagName.length]
  return next === undefined || /[\s>/]/.test(next)
}

function elementEnd(lower, start, tagName) {
  const open = `<${tagName}`
  const close = `</${tagName}>`
  let depth = 0
  let cursor = start
  while (cursor < lower.length) {
    const nextOpen = lower.indexOf(open, cursor)
    const nextClose = lower.indexOf(close, cursor)
    if (nextClose === -1) return -1
    if (nextOpen !== -1 && nextOpen < nextClose && tagBoundary(lower, nextOpen, tagName)) {
      depth += 1
      cursor = nextOpen + open.length
      continue
    }
    depth -= 1
    if (depth === 0) return nextClose
    cursor = nextClose + close.length
  }
  return -1
}

function enclosingSlice(html, index, tagName) {
  const lower = html.toLowerCase()
  const open = `<${tagName}`
  let cursor = index
  while (cursor > 0) {
    const start = lower.lastIndexOf(open, cursor - 1)
    if (start === -1) return ''
    if (!tagBoundary(lower, start, tagName)) {
      cursor = start
      continue
    }
    const end = elementEnd(lower, start, tagName)
    if (end === -1) return ''
    if (end < index) {
      cursor = start
      continue
    }
    return html.slice(start, end)
  }
  return ''
}

function isCardClass(value) {
  return String(value || '').toLowerCase().split(/\s+/).some((token) => (
    token === 'card' || token === 'post' || token === 'story' || token === 'entry'
    || token.endsWith('-card') || token.endsWith('-post') || token.endsWith('-story') || token.endsWith('-entry')
  ))
}

function enclosingClassCard(html, index) {
  const lower = html.toLowerCase()
  const pattern = /<([a-z0-9]+)\b[^>]*\bclass\s*=\s*["']([^"']*)["'][^>]*>/gi
  let best = ''
  for (const match of html.matchAll(pattern)) {
    const start = match.index ?? -1
    if (start === -1 || start >= index || !isCardClass(match[2])) continue
    const end = elementEnd(lower, start, match[1].toLowerCase())
    if (end === -1 || end < index) continue
    const slice = html.slice(start, end)
    if (!best || slice.length < best.length) best = slice
  }
  return best
}

function dateFromScope(scope) {
  const stamped = scope.match(/\b(?:datetime|dateTime)=["']([^"']+)["']/)
  if (stamped) {
    const iso = parseTimestamp(stamped[1])
    if (iso) return iso
  }
  const human = scope.match(/<time\b[^>]*>\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})\s*<\/time>/)
  return human ? humanDate(human[1]) : ''
}

function nextTag(lower, tagName, from) {
  const open = `<${tagName}`
  let cursor = from
  while (cursor < lower.length) {
    const start = lower.indexOf(open, cursor)
    if (start === -1) return -1
    if (tagBoundary(lower, start, tagName)) return start
    cursor = start + open.length
  }
  return -1
}

function dateInCard(html, index) {
  const regions = ['article', 'li'].map((tag) => enclosingSlice(html, index, tag)).filter(Boolean)
  const card = enclosingClassCard(html, index)
  if (card) regions.push(card)
  if (regions.length > 0) {
    regions.sort((left, right) => left.length - right.length)
    for (const region of regions) {
      const date = dateFromScope(region)
      if (date) return date
    }
    return ''
  }
  const lower = html.toLowerCase()
  const bounds = [index + 4000]
  const nextArticle = nextTag(lower, 'article', index + 1)
  const nextItem = nextTag(lower, 'li', index + 1)
  if (nextArticle !== -1) bounds.push(nextArticle)
  if (nextItem !== -1) bounds.push(nextItem)
  return dateFromScope(html.slice(index, Math.min(...bounds)))
}

function dateNearSlug(html, href) {
  let slug = ''
  try {
    slug = new URL(href).pathname.split('/').filter(Boolean).pop() || ''
  } catch {
    return ''
  }
  if (slug.length < 4) return ''
  let index = 0
  while ((index = html.indexOf(slug, index)) !== -1) {
    const created = html.slice(index, index + 1200).match(/createdAt\\?":\\?"([^"\\]+)/)
    if (created) {
      const iso = isoFromValue(created[1])
      if (iso) return iso
    }
    index += slug.length
  }
  return ''
}

function parseHtml(html, source) {
  if (!/<html\b|<a\b/i.test(html)) {
    throw new Error('response was not an HTML listing')
  }
  let pattern
  try {
    pattern = new RegExp(source.articleLinkPattern || '$^')
  } catch (error) {
    throw new Error(`article link pattern is invalid (${error.message})`)
  }
  const found = new Map()
  const anchors = html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
  for (const anchor of anchors) {
    let href = ''
    try {
      href = new URL(anchor[1], source.url).toString().split('#')[0]
    } catch {
      continue
    }
    if (!pattern.test(href)) continue
    const title = cleanText(anchor[2])
    const current = found.get(href)
    if (current && title.length <= current.title.length) continue
    const date = dateInCard(html, anchor.index) || dateNearSlug(html, href)
    const summaryMatch = html.slice(anchor.index, anchor.index + 2500).match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)
    found.set(href, {
      title: title.length >= (current?.title.length || 0) ? title : current.title,
      url: href,
      date: date || current?.date || '',
      summary: cleanText(summaryMatch?.[1] || ''),
    })
  }
  const entries = [...found.values()].filter((entry) => entry.title && entry.title.length >= 8)
  return capEntries(entries, source.maxItems)
}

function parseHuggingNews(body, source) {
  let data
  try {
    data = JSON.parse(body)
  } catch (error) {
    throw new Error(`response was not JSON (${error.message})`)
  }
  const groups = data?.dayGroups
  if (!Array.isArray(groups) && !Array.isArray(data?.stories)) {
    throw new Error('response did not include stories')
  }
  const stories = Array.isArray(groups)
    ? groups.flatMap((group) => group?.stories || [])
    : data.stories
  const entries = stories.map((story) => ({
    title: cleanText(story?.title),
    url: story?.url || (story?.slug ? `https://huggingnews.com/ai/${story.slug}` : ''),
    date: parseTimestamp(story?.publishedAt || story?.date || ''),
    summary: cleanText(story?.summary || story?.description || ''),
  })).filter((entry) => entry.title && /^https?:\/\//i.test(entry.url))
  return capEntries(entries, source.maxItems)
}

function capEntries(entries, maxItems) {
  const dated = entries.filter((entry) => entry.date)
  dated.sort((left, right) => right.date.localeCompare(left.date) || left.url.localeCompare(right.url))
  const limit = Number(maxItems) > 0 ? Number(maxItems) : 40
  return dated.slice(0, limit)
}

function loadPipeline(pipelineDir) {
  const filtersPath = path.join(pipelineDir, 'site-filters.json')
  const sourcesPath = path.join(pipelineDir, 'config', 'sources.json')
  let filters
  let sourcesDoc
  try {
    filters = JSON.parse(fs.readFileSync(filtersPath, 'utf8'))
    sourcesDoc = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'))
  } catch (error) {
    throw new Error(`News pipeline config could not be read from ${pipelineDir}: ${error.message}`)
  }
  if (!filters?.sites || !Array.isArray(sourcesDoc?.sources)) {
    throw new Error(`News pipeline config at ${pipelineDir} is missing sites or sources.`)
  }
  return { filters, sources: sourcesDoc.sources }
}

function applySiteFilter(items, siteFilter, now) {
  const include = new Set(siteFilter.include_tags || [])
  const exclude = new Set(siteFilter.exclude_tags || [])
  const minImportance = Number(siteFilter.min_importance_score ?? 0)
  const maxArticles = Number(siteFilter.max_articles_per_run ?? 15)
  const futureLimit = new Date(now).getTime() + 5 * 60 * 1000
  const matched = []
  const seen = new Set()
  for (const item of items) {
    if (!item?.title || !item?.url || !item?.date || seen.has(item.url)) continue
    const published = new Date(item.date).getTime()
    if (!Number.isFinite(published) || published > futureLimit) continue
    const tags = Array.isArray(item.tags) ? item.tags : []
    const importance = Number(item.importance)
    if (!Number.isFinite(importance) || importance < minImportance) continue
    if (tags.some((tag) => exclude.has(tag))) continue
    if (include.size > 0 && !tags.some((tag) => include.has(tag))) continue
    seen.add(item.url)
    matched.push({
      ...item,
      matching_tags: (siteFilter.include_tags || []).filter((tag) => tags.includes(tag)),
    })
  }
  matched.sort((left, right) => right.date.localeCompare(left.date) || left.url.localeCompare(right.url))
  return matched.slice(0, Number.isFinite(maxArticles) && maxArticles > 0 ? maxArticles : matched.length)
}

function tagEntries(entries, source, importance) {
  return entries.map((entry) => ({
    title: entry.title,
    url: entry.url,
    source: source.name,
    tags: [...(source.tags || [])],
    importance,
    date: entry.date,
    summary: (entry.summary || entry.title).slice(0, 700),
    category: source.categories?.[0] || source.section || '',
  }))
}

async function fetchText(url, fetchImpl, retries) {
  let lastError = 'fetch failed'
  const attempts = Math.max(1, retries)
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    for (const userAgent of USER_AGENTS) {
      try {
        const response = await fetchImpl(url, {
          redirect: 'follow',
          headers: { ...FETCH_HEADERS, 'user-agent': userAgent },
          signal: AbortSignal.timeout(20000),
        })
        const text = await response.text()
        if (response.ok) return text
        lastError = `HTTP ${response.status}`
        if (!RETRY_STATUSES.has(response.status) && response.status !== 400) {
          const failure = new Error(lastError)
          failure.nonRetryable = true
          throw failure
        }
      } catch (error) {
        if (error?.nonRetryable) throw error
        lastError = error?.message || lastError
      }
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
    }
  }
  throw new Error(lastError)
}

async function fetchSource(source, fetchImpl, retries) {
  if (!source?.url) throw new Error('source URL is missing')
  const body = await fetchText(source.url, fetchImpl, retries)
  if (source.adapter === 'rss') return parseRss(body, source)
  if (source.adapter === 'html') return parseHtml(body, source)
  if (source.adapter === 'huggingnews') return parseHuggingNews(body, source)
  throw new Error(`unsupported adapter ${source.adapter || 'missing'}`)
}

function buildFeedDocument(siteFilter, articles, now) {
  return {
    generated: new Date(now).toISOString(),
    site: siteFilter.name,
    article_count: articles.length,
    articles: articles.map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source,
      tags: article.tags,
      matching_tags: article.matching_tags,
      importance: article.importance,
      date: article.date,
      summary: article.summary,
      category: article.category,
    })),
  }
}

async function refreshRoutedFeed({
  pipelineDir,
  siteSlug = SITE_SLUG,
  outputPath = OUTPUT_PATH,
  fetchImpl = globalThis.fetch,
  now = new Date(),
  write = true,
  retries = 3,
}) {
  const { filters, sources } = loadPipeline(pipelineDir)
  const siteFilter = filters.sites[siteSlug]
  if (!siteFilter?.name) throw new Error(`Site filter ${siteSlug} is missing from site-filters.json.`)
  const failures = []
  const tagged = []
  for (const source of sources) {
    try {
      const entries = await fetchSource(source, fetchImpl, retries)
      tagged.push(...tagEntries(entries, source, Number(siteFilter.min_importance_score ?? 0)))
      console.log(`${source.id}: fetched ${entries.length} dated entries`)
    } catch (error) {
      const message = `${source.id} (${source.name || source.id}) could not be fetched: ${error.message}`
      failures.push(message)
      console.error(`::error title=Source fetch failed::${message}`)
    }
  }
  if (failures.length > 0) {
    return { wrote: false, failures, feed: null }
  }
  const articles = applySiteFilter(tagged, siteFilter, now)
  const feed = buildFeedDocument(siteFilter, articles, now)
  if (write) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8')
  }
  return { wrote: write, failures: [], feed }
}

function parseArgs(argv) {
  const args = { pipelineDir: process.env.NEWS_PIPELINE_DIR || '' }
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--pipeline') args.pipelineDir = argv[index + 1] || ''
  }
  return args
}

async function main() {
  const { pipelineDir } = parseArgs(process.argv.slice(2))
  if (!pipelineDir) {
    throw new Error('Pass --pipeline with the shared news config directory.')
  }
  const result = await refreshRoutedFeed({ pipelineDir })
  if (result.failures.length > 0) {
    process.exitCode = 1
    return
  }
  const newest = result.feed.articles[0]?.date
  console.log(
    `Wrote ${result.feed.article_count} articles to ${path.relative(process.cwd(), OUTPUT_PATH)}.${newest ? ` Newest: ${newest}.` : ''}`,
  )
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((error) => {
    console.error(`::error title=Routed feed refresh failed::${error.message}`)
    process.exitCode = 1
  })
}

export {
  OUTPUT_PATH,
  SITE_SLUG,
  applySiteFilter,
  buildFeedDocument,
  loadPipeline,
  parseHtml,
  parseHuggingNews,
  parseRss,
  refreshRoutedFeed,
}
