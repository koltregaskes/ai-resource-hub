# Source Registry Snapshot

Document built: 2026-10-10T23:56:04.357Z

Sync status: cached

Last sync attempted: 2026-10-10T23:56:03.450Z

Source edition generated: 2026-10-06T15:07:35.789Z

Canonical configuration last verified: 2026-10-06T15:07:35.789Z

Canonical source edition (SHA-256): {"siteFiltersSha256":"bad10f90faa07d54f4ce690f38214e0e06b7b46dbc1710c466d53bc45e7f5768","sourcesSha256":"4299709f06121cfefd781c092a5bc01a1168cb636477b159e5774bd69d38bc8d","estateManifestSha256":"a0aaffd48032be4a810d6152fecef37730130d3b2d1e3d655ede268b63f3b63f"}

Verification means the canonical configuration was read; it does not establish collector or whole-pipeline health.

This is the repo-readable mirror of the shared source registry. It shows where the exported source definitions live, how they route into the website estate, and which collection / verification lane each source should use.

Canonical config:

- `shared/website-tools/pipelines/news/config/sources.json`
- `shared/website-tools/pipelines/news/site-filters.json`

## Summary

| Metric | Value |
| --- | --- |
| Source edition generated | 06 Oct 2026, 15:07 UTC |
| Configured sources | 14 |
| AI Resource Hub routed sources | 14 |
| Automated sources | 14 |
| Manual-review-only sources | 0 |
| Official-first verification lanes | 4 |
| Cross-check verification lanes | 10 |

## Tracked Sources

| Source | Host | Type | Collection | Verification | Routes to | Categories | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Anthropic News](https://www.anthropic.com/news) | anthropic.com | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Official Lab | Active |
| [Ars Technica AI](https://arstechnica.com/tag/artificial-intelligence/) | arstechnica.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Technical Analysis | Active |
| [arXiv cs.AI](https://export.arxiv.org/rss/cs.AI) | export.arxiv.org | Research / open source | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Research Feed, Academic | Active |
| [arXiv cs.LG](https://export.arxiv.org/rss/cs.LG) | export.arxiv.org | Research / open source | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Research Feed, Academic | Active |
| [Ben's Bites](https://www.bensbites.co/) | bensbites.co | Digest / newsletter | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Newsletter, Curated Digest | Partial |
| [Digg AI](https://www.digg.com/ai) | digg.com | Research / open source | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Curated Digest, Open Source | Active |
| [Google DeepMind Blog](https://deepmind.google/blog/) | deepmind.google | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Research Lab | Active |
| [Hugging Face Blog](https://huggingface.co/blog/feed.xml) | huggingface.co | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Platform Blog, Open Source | Active |
| [HuggingNews](https://api.huggingnews.com/api/stories) | api.huggingnews.com | Digest / newsletter | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Curated Digest, AI Newsroom | Active |
| [Meta AI Blog](https://ai.meta.com/blog/) | ai.meta.com | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Research Lab | Active |
| [MIT Technology Review AI](https://www.technologyreview.com/topic/artificial-intelligence/feed/) | technologyreview.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Ghost in the Model | Industry Media, Analysis | Active |
| [TechCrunch AI](https://techcrunch.com/category/artificial-intelligence/feed/) | techcrunch.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, AI Newsroom | Active |
| [The Verge AI](https://www.theverge.com/ai-artificial-intelligence) | theverge.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Consumer Tech | Active |
| [VentureBeat AI](https://venturebeat.com/category/ai/feed/) | venturebeat.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Enterprise AI | Partial |

## Manual Review Lanes

No manual-review-only sources are currently configured in the shared registry.

Raw export: [source-registry.json](../../public/data/source-registry.json)
