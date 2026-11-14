import type { StudioArticle } from "./types";
export const article: StudioArticle = {
  slug: "twelve-words-on-an-ai-price-page",
  title: "Twelve words on an AI price page, and four that differ by provider",
  description: "Token, cached input, cache write, batch, flex and seven more terms from OpenAI, Anthropic and Google pricing pages, in plain English with what each page says.",
  type: "Beginner",
  readTime: "8 min",
  date: "2026-11-14",
  id: "calc-studio-twelve-words-on-an-ai-price-page",
  formula: "Ratios only: cached read price divided by input price; long-context price divided by standard price; fast price divided by standard price; cache write price divided by input price. Each uses prices typed from the provider page named, read 14 November 2026.",
  assumptions: "No catalogue data and no assumed numbers. Every price and multiplier is copied from the provider page and model named in the text, read on 14 November 2026. Several pages (OpenAI model, flex, batch and rate limit pages; Google pages) were read through a summarising fetch tool rather than a raw copy, so their quoted wording and figures were not re-checked against a raw copy. The Anthropic pricing and rate limit pages were read as raw text.",
  limits: "Providers change prices and rules often. Only four of the twelve terms were compared across all three providers; the article names the gaps (no Anthropic flex tier checked, no Google data residency, OpenAI token help article not loadable). The Google storage price is attached to the Gemini 3.1 Pro Preview row on our reading of the page layout.",
  sources: [
    { title: "OpenAI API pricing", url: "https://developers.openai.com/api/docs/pricing", checked: "14 November 2026", claim: "Regional processing uplift of 10% for models released on or after 5 March 2026; priority processing renamed Fast mode on 30 July 2026; Fast and Ultrafast tabs.", rights: "public documentation" },
    { title: "OpenAI GPT-5.5 model page", url: "https://developers.openai.com/api/docs/models/gpt-5.5", checked: "14 November 2026", claim: "1,050,000 context window, 128,000 max output tokens, $5 input, $0.5 cached input, 2x input and 1.5x output above 272K input tokens, 10% regional processing uplift.", rights: "public documentation" },
    { title: "OpenAI reasoning guide", url: "https://developers.openai.com/api/docs/guides/reasoning", checked: "14 November 2026", claim: "Reasoning tokens are not visible, are billed as output tokens, count in the context window, and max_output_tokens caps them.", rights: "public documentation" },
    { title: "OpenAI prompt caching guide", url: "https://developers.openai.com/api/docs/guides/prompt-caching", checked: "14 November 2026", claim: "Caching on by default for supported models; read rates 0.1x or 0.05x; write rates 1.25x (30 minutes) and 2.5x (12 hours) for GPT-5.6 and later.", rights: "public documentation" },
    { title: "OpenAI Batch guide", url: "https://developers.openai.com/api/docs/guides/batch", checked: "14 November 2026", claim: "50% discount, 24-hour window, unfinished requests cancelled, completed ones charged.", rights: "public documentation" },
    { title: "OpenAI Flex processing guide", url: "https://developers.openai.com/api/docs/guides/flex-processing", checked: "14 November 2026", claim: "Flex priced at Batch API rates, slower and sometimes unavailable, 429 not charged.", rights: "public documentation" },
    { title: "OpenAI rate limits guide", url: "https://developers.openai.com/api/docs/guides/rate-limits", checked: "14 November 2026", claim: "Measures RPM, RPD, TPM, TPD, IPM; organisation and project level; any limit can be hit first.", rights: "public documentation" },
    { title: "Anthropic pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", checked: "14 November 2026", claim: "Cache write and hit multipliers and Opus 5.5 prices, fast mode prices, batch 50%, US-only inference 1.1x, Haiku 5.5 long-context prices.", rights: "public documentation" },
    { title: "Anthropic context windows", url: "https://platform.claude.com/docs/en/build-with-claude/context-windows", checked: "14 November 2026", claim: "What counts toward the context window; thinking tokens are a subset of max_tokens and billed as output.", rights: "public documentation" },
    { title: "Anthropic rate limits", url: "https://platform.claude.com/docs/en/api/rate-limits", checked: "14 November 2026", claim: "RPM, ITPM, OTPM by tier; cache reads do not count toward ITPM; spend cap returns 429 without retry-after.", rights: "public documentation" },
    { title: "Google Gemini API pricing", url: "https://aistudio.google.com/docs/pricing", checked: "14 November 2026", claim: "Output price includes thinking tokens; caching and storage prices; 200k prompt price split for Gemini 3.1 Pro Preview and Gemini 2.5 Pro; Batch 50% reduction.", rights: "public documentation" },
    { title: "Google Gemini tokens guide", url: "https://aistudio.google.com/docs/tokens", checked: "14 November 2026", claim: "About 4 characters per token for Gemini; 100 tokens about 60 to 80 English words; Gemini 4 shares one window across input, thinking and output.", rights: "public documentation" },
    { title: "Google Gemini Flex inference", url: "https://aistudio.google.com/docs/flex-inference", checked: "14 November 2026", claim: "Flex at 50% of standard, variable latency, may be preempted, no automatic fallback.", rights: "public documentation" },
    { title: "Google Gemini rate limits", url: "https://aistudio.google.com/docs/rate-limits", checked: "14 November 2026", claim: "RPM, TPM (input), RPD, applied per project not per API key.", rights: "public documentation" }
  ],
  code: "scripts/insights/twelve-words-on-an-ai-price-page.mjs",
  frozen: "src/data/insights/2026-11-14-twelve-words-on-an-ai-price-page.json"
};
