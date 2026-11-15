# PR79 successor evidence

Original: `6fd836abc908e7c62bd14b81ebeed507c6db1798` (PR79).
Reconciled main: `cf0029baf3273ae0d10862e763e20653b2cc158d`.
Worker branch: `codex/2133-seo-10`. Original branch remains unchanged.
Owning project: rooms-os-hub #66; accessibility acceptance: #1411.

The existing independent changes-required verdict remains valid for the original
head. This successor is authored work and requires independent source review.
No merge or publication is authorised by this evidence.

## All 24 original files reconciled

| Original file | Successor disposition |
| --- | --- |
| public/cross-site-nav.js | Retain named navigation instead of a second contentinfo landmark |
| src/components/BenchmarkTable.tsx | Correct main's provider label to benchmark category |
| src/components/LLMComparisonTable.tsx | Main already labels both selects; preserve |
| src/components/MiniPriceChart.tsx | Preserve main's responsive sizing, role and accessible name |
| src/components/NewsFilter.tsx | Preserve main's toggle name, expanded state and date/archive labels; avoid duplicate attributes |
| src/components/PriceTrendChart.tsx | Preserve main's role and accessible name |
| src/data/badge-ink.ts | Omit duplicate helper; main's src/lib/contrast.ts already selects AA black/white ink |
| src/layouts/BaseLayout.astro | Add WebPage through serializeJsonLd, name ticker region; preserve current CSP, homepage graph, skip target and mutation-aware table wrapper |
| src/pages/404.astro | Preserve main's noindex, follow and canonical handling |
| src/pages/api-guides/index.astro | Preserve main's contrastColour badges |
| src/pages/benchmarks/meta/index.astro | Preserve main's aria-pressed buttons and matching controller; do not introduce incomplete tab semantics |
| src/pages/calculator/index.astro | Main already associates visible labels; preserve |
| src/pages/cli/[id].astro | Main already avoids nested main; preserve |
| src/pages/cli/index.astro | Main already avoids nested main; preserve |
| src/pages/compare/head-to-head.astro | Main already names model selects; preserve |
| src/pages/guides/choosing-an-ai-model.astro | Preserve main's higher-contrast black badge ink |
| src/pages/labs/[id].astro | Preserve main's contrastColour badges and safe JSON-LD |
| src/pages/labs/index.astro | Preserve main's contrastColour badges and sort label |
| src/pages/leaderboard/index.astro | Preserve main's four labelled selects |
| src/pages/models/[id].astro | Preserve main's contrastColour badges and safe JSON-LD |
| src/pages/models/index.astro | Preserve main's three labelled selects |
| src/pages/token-counter/index.astro | Preserve main's labels; avoid duplicate attributes |
| src/pages/tools/index.astro | Preserve main's category label; avoid duplicate attributes |
| src/styles/global.css | Retain light muted colour #6b5b48; preserve current main focus styling |

All 16 content conflicts were reproduced by rebasing the worker's single source
commit onto the main SHA above and resolved individually. No dependency, data,
search, newsletter, runtime or hosting implementation was changed.

## Offline verification

`node --test scripts/seo-successor.test.mjs` exercises the actual layout WebPage
expression with hostile titles and descriptions, mixed-case and whitespace script
terminators, escaped-script-state payloads, legitimate multilingual Unicode,
combining characters, canonical/base/locale metadata and JSON serialization
semantics. A source-wide guard covers every Astro JSON-LD script. The tests import
the actual TypeScript serializer and contrast helper using Node's native type
stripping; no copied implementation, provider or public retrieval is needed.

Contrast checks cover the four opaque base light surfaces and the original
provider badge colours. They do not certify composited cards, other theme
overrides or rendered text. The existing `test:seo` pipeline also runs this suite
through its already-declared tsx dependency.

## Unfulfilled acceptance

This checkout has no node_modules or Astro CLI. No installation, build, full
axe scan, visual/browser check, phone geometry or live site acceptance is claimed.
The original unfinished 1,416-variant scan remains unfinished; historical counts
are not successor results. F: and W: instructions were unavailable on this host;
the supplied safety rules were followed. Broader #1411 design/contrast and launch
acceptance remain with the existing owners. Independent exact-head review is the
next source dependency; approved dependency availability is the next local build
dependency. PR79 stays open and held, as does unrelated PR122.
