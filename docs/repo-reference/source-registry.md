# Source Registry Snapshot

Generated: 28 Apr 2026, 09:33 UTC

This is the repo-readable mirror of the shared source registry. It shows where source definitions currently live, how they route into the website estate, and which collection / verification lane each source should use.

Canonical config:

- `shared/website-tools/pipelines/news/config/sources.json`
- `shared/website-tools/pipelines/news/site-filters.json`

## Summary

| Metric | Value |
| --- | --- |
| Generated | 28 Apr 2026, 09:33 UTC |
| Configured sources | 12 |
| AI Resource Hub routed sources | 12 |
| Automated sources | 12 |
| Manual-review-only sources | 0 |
| Official-first verification lanes | 4 |
| Cross-check verification lanes | 8 |

## Tracked Sources

| Source | Host | Type | Collection | Verification | Routes to | Categories | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Anthropic News](https://www.anthropic.com/news) | anthropic.com | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Official Lab | Active |
| [Ars Technica AI](https://arstechnica.com/tag/artificial-intelligence/) | arstechnica.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Technical Analysis | Active |
| [arXiv cs.AI](https://export.arxiv.org/rss/cs.AI) | export.arxiv.org | Research / open source | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Research Feed, Academic | Active |
| [arXiv cs.LG](https://export.arxiv.org/rss/cs.LG) | export.arxiv.org | Research / open source | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Research Feed, Academic | Active |
| [Ben's Bites](https://www.bensbites.co/) | bensbites.co | Digest / newsletter | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Newsletter, Curated Digest | Partial |
| [Google DeepMind Blog](https://deepmind.google/blog/) | deepmind.google | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Research Lab | Active |
| [Hugging Face Blog](https://huggingface.co/blog/feed.xml) | huggingface.co | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Platform Blog, Open Source | Active |
| [Meta AI Blog](https://ai.meta.com/blog/) | ai.meta.com | Official lab / provider | Automated public source | Official-first | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Provider Blog, Research Lab | Active |
| [MIT Technology Review AI](https://www.technologyreview.com/topic/artificial-intelligence/feed/) | technologyreview.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Ghost in the Model | Industry Media, Analysis | Active |
| [TechCrunch AI](https://techcrunch.com/category/artificial-intelligence/feed/) | techcrunch.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, AI Newsroom | Active |
| [The Verge AI](https://www.theverge.com/ai-artificial-intelligence) | theverge.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Consumer Tech | Active |
| [VentureBeat AI](https://venturebeat.com/category/ai/feed/) | venturebeat.com | Media / analysis | Automated public source | Cross-check before promotion | Kol's Korner, AI Resource Hub, Axy Lusion, Ghost in the Model | Industry Media, Enterprise AI | Partial |

## Manual Review Lanes

No manual-review-only sources are currently configured in the shared registry.

Raw export: [source-registry.json](../../public/data/source-registry.json)
