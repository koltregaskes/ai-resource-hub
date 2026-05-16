# AI Resource Hub — Agent Readiness

**Status:** DRAFT — awaiting Kol's sign-off. Not yet committed.
**Last updated:** 2026-05-16
**Estate-wide policy:** `W:\Websites\AGENT-READINESS-ESTATE.md`
**Repo:** `W:\Websites\sites\ai-resource-hub`
**Domain:** TBD (no CNAME at repo root — per memory `airesourcehub.com` or `theairesourcehub.com`; Codex confirms before shipping)
**Stack:** Astro (`astro.config.mjs`, build via `scripts/run-astro.mjs`)

---

## ⚠️ Interlock: build is blocked

Per estate memory (39 days old, may be stale): *"Build currently blocked by corrupted node_modules (esbuild file lock)."*

Codex must verify and unblock the build BEFORE schema work. Reset `node_modules` (`rm -rf node_modules && npm install`) or run the lockfile resolution sequence. If the build is still failing after a clean install, escalate to Kol — schema work is moot until the site can build.

---

## ⚠️ Interlock: forks need a scope decision

`ai-resource-hub-fairness` and `ai-resource-hub-reference-desk-build` are sibling repos with the same Astro shell and the same scrape scripts. They may be experiments rather than first-class sites.

**Default per estate doc:** skip the two forks. This document is for the main `ai-resource-hub` only. If Kol confirms the forks are first-class, copy this spec to each fork repo and adjust the domain.

---

## 1. Schema strategy

AI Resource Hub is a **directory / catalogue / comparison site** for AI models, with pricing, benchmarks, news, jobs, and reports. The schema surface is large.

### 1.1 Home page (`src/pages/index.astro`)

**`Organization`**:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://<DOMAIN>/#organization",
  "name": "AI Resource Hub",
  "url": "https://<DOMAIN>",
  "logo": "https://<DOMAIN>/favicon.svg",
  "description": "Comparison of AI models with pricing, benchmarks, and live jobs.",
  "founder": { "@id": "https://koltregaskes.com/#person-kol" },
  "parentOrganization": { "@id": "https://koltregaskes.com/#organization" }
}
```

**`WebSite`** with site search action:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://<DOMAIN>/#website",
  "name": "AI Resource Hub",
  "url": "https://<DOMAIN>",
  "publisher": { "@id": "https://<DOMAIN>/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://<DOMAIN>/search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

(Drop the SearchAction block if no site-search exists.)

### 1.2 Per-model pages (the biggest payoff)

Each model page (e.g. `/models/claude-opus`) gets `SoftwareApplication` with embedded `Offer`:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://<DOMAIN>/models/<slug>#app",
  "name": "<Model Name>",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Large Language Model",
  "operatingSystem": "API / Web",
  "url": "<official model URL>",
  "description": "<model summary>",
  "provider": {
    "@type": "Organization",
    "name": "<Anthropic | Google | OpenAI | etc>",
    "url": "<provider URL>"
  },
  "softwareVersion": "<version>",
  "datePublished": "<release date>",
  "offers": [
    {
      "@type": "Offer",
      "name": "Input tokens",
      "price": "<input $/M>",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "<price>",
        "priceCurrency": "USD",
        "unitCode": "MMT",
        "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "MMT" }
      }
    },
    {
      "@type": "Offer",
      "name": "Output tokens",
      "price": "<output $/M>",
      "priceCurrency": "USD"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<benchmark composite>",
    "bestRating": "100",
    "reviewCount": "<number of benchmarks>"
  }
}
```

This is the **highest-ROI schema work in the estate**. Google's AI Overviews surface pricing comparisons heavily; sites that mark up `Offer` correctly get picked.

### 1.3 Benchmarks pages

Each benchmark family (MMLU, GPQA, etc.) as `Dataset`:

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://<DOMAIN>/benchmarks/<slug>#dataset",
  "name": "<Benchmark Name>",
  "description": "<what it measures>",
  "creator": "<benchmark author>",
  "url": "<official benchmark URL>",
  "license": "<license>",
  "variableMeasured": ["<metrics>"]
}
```

### 1.4 Jobs pages

If `JobPosting` schema applies (per estate memory: "1,122 jobs"), use schema.org/JobPosting per posting. **Only if Kol has explicit syndication rights from the source job feed** — JobPosting markup falsely applied is a major Google penalty.

If jobs are linked aggregator-style (Kol points at LinkedIn / Indeed listings), don't apply JobPosting; treat as `ItemList` of links.

### 1.5 News + reports pages

Per the scrape scripts (`scripts/scrapers/news.ts`, `scripts/generate-digest.ts`), there's a news pipeline. Article schema per digest, NewsArticle for breaking-news entries.

### 1.6 Implementation pattern (for Codex)

Astro is the natural fit for shared schema components:

- Create `src/components/seo/SchemaOrg.astro` that takes a `data` prop and renders the appropriate JSON-LD.
- One component per type: `<SchemaOrganization />`, `<SchemaWebSite />`, `<SchemaSoftwareApplication model={...} />`, etc.
- Use Astro's `<Layout>` / `<BaseHead>` pattern to ensure every page gets `Organization` + `WebSite` automatically.
- Page-specific schema gets included via per-page frontmatter / component composition.

The existing Postgres → JSON cache → Astro build flow (per memory) feeds model data. The schema components consume the same JSON.

---

## 2. Robots.txt and sitemap

### Robots.txt

Verify exists. Align to estate baseline. Disclaimer for jobs: if any job pages are gated to prevent Indeed-style scraping, those exclusions stay.

### Sitemap.xml

Astro sitemap integration (`@astrojs/sitemap`) is the standard. Verify it's installed and generating. If missing, Codex adds it. Ensure:
- All static pages listed
- All dynamic pages (models, benchmarks, jobs, news, reports) listed
- `lastmod` from frontmatter or DB query

---

## 3. Browser-agent UX audit (web.dev spec)

Astro renders static HTML — generally good for browser agents. Audit:

- Interactive elements (comparison tables, filter dropdowns, model cards) — verify semantic markup
- If any client-side JS hydrates filters or modals, verify SSR fallback works without JS
- Charts / data visualisations (likely on benchmarks pages) — provide `alt` text and / or `<figcaption>` for AI agents to extract meaning

---

## 4. Content cadence — non-commodity check

The site's core value is **structured data Kol has assembled** (pricing, benchmarks, jobs). That's genuinely unique aggregation — fine for Google's non-commodity test, as long as each model / benchmark page has some commentary or perspective beyond the raw data.

Per-model page recommendation: add a 1-paragraph editor's note (Kol-written or Kol-curated) explaining where each model shines / fails. Without that, model pages are pure data and risk being seen as commodity catalogue content.

---

## 5. Crawl budget

Per memory: 139 AI models, 1,122 jobs, plus news + reports. That's a LOT of pages. Crawl budget IS a concern:

- Verify Astro generates an XML sitemap **per content type** (models, benchmarks, jobs, news) for cleaner crawl scheduling
- Add `lastmod` based on per-model `last_updated` from DB
- For 1,122 jobs: stale jobs should `noindex` automatically after N days (e.g. 60 days). Codex confirms the jobs pipeline handles this.

---

## 6. Open items and dependencies

- **Build fix first** — see warning at top.
- **Domain confirmation** — CNAME absent.
- **JobPosting schema scope** — Kol confirms syndication rights before any jobs get JSON-LD.
- **AggregateRating sources** — benchmark composite needs a defined methodology before it can be `aggregateRating`'d. Otherwise omit.
- **Forks scope decision** (fairness + reference-desk-build).

---

## 7. Definition of done for Codex

Prerequisites:
- [ ] Build unblocked; `npm run build` succeeds
- [ ] Domain CNAME confirmed

Schema work:
- [ ] `Organization` + `WebSite` JSON-LD on home + every page (Astro `<Layout>` pattern)
- [ ] `SoftwareApplication` + `Offer` JSON-LD on every model page
- [ ] `Dataset` JSON-LD on every benchmark page
- [ ] `JobPosting` JSON-LD on every job page **only if syndication rights confirmed**
- [ ] `Article` / `NewsArticle` on news + reports
- [ ] `BreadcrumbList` on deep pages
- [ ] `robots.txt` matches estate baseline
- [ ] Astro sitemap config emits per-content-type sitemaps with `lastmod`
- [ ] Stale jobs auto-`noindex` after N days
- [ ] `audit-agent-ready.py` passes
- [ ] Google Rich Results Test passes on a sample of 10 model + benchmark + news pages
