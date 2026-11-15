import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "ai-pricing-race-to-zero",
  title: "Claude Opus never got dearer. OpenAI's main line rose three times, then fell back",
  description: "On the labs' own price lists, Anthropic's Opus line never rose across eight versions. OpenAI's main line rose for three versions in a row before its Sol models cut it.",
  type: "Analysis",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-ai-pricing-race-to-zero",
  formula: "For each line, versions in version-number order. Step change = (new price - old price) / old price, for input and output separately, rounded to one decimal place. First-to-last change uses the first and latest version in the line. Multiples = one list price divided by another.",
  assumptions: "No catalogue data. Every price was read on 14 November 2026 from the lab's own page (fetched as raw HTML and checked in the page text) and is stored with its URL in src/data/insights/2026-11-14-ai-pricing-race-to-zero.json. US dollars per million tokens, standard rate, uncached, short prompts. Lines: Opus and Fable as grouped by the line field in Anthropic's Models API documentation; OpenAI's main line is GPT-5 to GPT-5.5 followed by the Sol models, because the GPT-5.6 Sol page says Sol roughly corresponds to the earlier unsuffixed tier. Dates are only those a page gives, inside a snapshot or model ID. No assumed numbers.",
  limits: "List prices per token only. Not the price of a fixed level of capability, not what any task costs (models can use different numbers of tokens), not the wider market or other labs, and not discounts or surcharges (batch, caching, fast mode, long prompts, data residency). The pages give few dates, and a date inside a snapshot name is not a launch date. GPT-5.6 Sol's price is promotional until 30 November 2026 and the page does not say what it becomes. The pages do not say whether Fable or GPT-6 Astra replaces anything.",
  sources: [
    { title: "Anthropic: Pricing (Claude Platform Docs)", url: "https://platform.claude.com/docs/en/about-claude/pricing", checked: "14 November 2026", claim: "Base input and output prices for Claude Opus 4 to Opus 5.5 and Fable 5 to Fable 5.2; Opus 4 and Opus 4.1 marked Retired.", rights: "public documentation" },
    { title: "Anthropic: Model deprecations", url: "https://platform.claude.com/docs/en/about-claude/model-deprecations", checked: "14 November 2026", claim: "Dated model IDs for Opus 4, 4.1 and 4.5; retirement dates for Opus 4 and 4.1; claude-opus-4-8 named as their recommended replacement.", rights: "public documentation" },
    { title: "Anthropic: Models overview", url: "https://platform.claude.com/docs/en/about-claude/models/overview", checked: "14 November 2026", claim: "The Models API line field (opus, fable and others); context windows of 200K for Opus 4.5 and 1M for Opus 4.6 and later; advice to start with Opus 5.5 and use Fable 5.2 for demanding work.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5", url: "https://developers.openai.com/api/docs/models/gpt-5", checked: "14 November 2026", claim: "GPT-5 at $1.25 input and $10 output; snapshot gpt-5-2025-08-07; Deprecated; 400,000 context window; recommends GPT-6 Astra.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.1", url: "https://developers.openai.com/api/docs/models/gpt-5.1", checked: "14 November 2026", claim: "GPT-5.1 at $1.25 input and $10 output; snapshot gpt-5.1-2025-11-13; Deprecated.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.2", url: "https://developers.openai.com/api/docs/models/gpt-5.2", checked: "14 November 2026", claim: "GPT-5.2 at $1.75 input and $14 output; snapshot gpt-5.2-2025-12-11; recommends GPT-6 Astra.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.4", url: "https://developers.openai.com/api/docs/models/gpt-5.4", checked: "14 November 2026", claim: "GPT-5.4 at $2.50 input and $15 output; snapshot gpt-5.4-2026-03-05; 1,050,000 context window.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.5", url: "https://developers.openai.com/api/docs/models/gpt-5.5", checked: "14 November 2026", claim: "GPT-5.5 at $5 input and $30 output; snapshot gpt-5.5-2026-04-23.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.6 Sol", url: "https://developers.openai.com/api/docs/models/gpt-5.6-sol", checked: "14 November 2026", claim: "GPT-5.6 Sol at $4 input and $20 output, described as a 20% and 33% reduction, promotional until 30 November 2026; Sol roughly corresponds to the earlier unsuffixed tier.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-6 Sol", url: "https://developers.openai.com/api/docs/models/gpt-6-sol", checked: "14 November 2026", claim: "GPT-6 Sol at $2 input and $10 output; points to GPT-6.1 Sol as the newer Sol model.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-6.1 Sol", url: "https://developers.openai.com/api/docs/models/gpt-6.1-sol", checked: "14 November 2026", claim: "GPT-6.1 Sol at $2 input and $10 output.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-6 Astra", url: "https://developers.openai.com/api/docs/models/gpt-6-astra", checked: "14 November 2026", claim: "GPT-6 Astra at $10 input and $50 output.", rights: "public documentation" },
    { title: "OpenAI API pricing", url: "https://developers.openai.com/api/docs/pricing", checked: "14 November 2026", claim: "Standard rows for gpt-6-astra ($10 / $50) and gpt-6.1-sol ($2 / $10); GPT-5.6 Sol promotional pricing until 30 November 2026.", rights: "public documentation" }
  ],
  code: "scripts/insights/ai-pricing-race-to-zero.mjs",
  frozen: "src/data/insights/2026-11-14-ai-pricing-race-to-zero.json"
};
