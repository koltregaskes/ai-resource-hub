import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "pro-tier-price-premium",
  title: "OpenAI charges 6 to 12 times as much for its Pro tier",
  description: "Where OpenAI lists a model and its Pro version side by side, Pro costs 6 to 12 times as much per token. Our catalogue shows 14 pairs, and only some of them survive a check.",
  type: "Analysis",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-pro-tier-price-premium",
  formula: "Find language models (category llm, input and output price above zero) where one name is exactly the other plus \" Pro\". Multiple = Pro price / base price, for input and output separately. Four pairs were then re-read on OpenAI own pages on 14 November 2026 and their multiples recomputed from the live prices. Worked example: cost = (input tokens x input price + output tokens x output price) / 1,000,000.",
  assumptions: "Catalogue file data/pg-cache/models.json, snapshot 14 November 2026. Prices are US dollars per million tokens. ASSUMPTION for the worked example only: a job of 10,000 input tokens and 2,000 output tokens. The live prices are standard text-token prices for short prompts, typed in from the pages named in the sources.",
  limits: "These are list prices per token, not what a job costs: we did not measure how many tokens a Pro model uses compared with its base model. The catalogue holds our records (287 priced language-model entries on 14 November 2026), not the whole market. A Pro tier may differ from its base model in more than price, and we did not test or compare answers. Perplexity own pricing page could not be loaded, so the one Perplexity pair is unchecked.",
  sources: [
    { title: "OpenAI API pricing", url: "https://developers.openai.com/api/docs/pricing", checked: "14 November 2026", claim: "Standard-tier prices for GPT-5.5, GPT-5.5 Pro, GPT-5.4, GPT-5.4 Pro, GPT-5.2 Pro, GPT-5 Pro, o3 Pro and the GPT-5.6 and GPT-6 base models; no Pro rows for GPT-5.6 or GPT-6.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.5 Pro", url: "https://developers.openai.com/api/docs/models/gpt-5.5-pro", checked: "14 November 2026", claim: "The lab description of GPT-5.5 Pro, its statement about compute, and its price.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.4 Pro", url: "https://developers.openai.com/api/docs/models/gpt-5.4-pro", checked: "14 November 2026", claim: "The lab description of GPT-5.4 Pro, its statement about compute, and its price.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5.4", url: "https://developers.openai.com/api/docs/models/gpt-5.4", checked: "14 November 2026", claim: "GPT-5.4 base price: $2.50 input, $15 output per million tokens.", rights: "public documentation" },
    { title: "OpenAI model page: o3 Pro", url: "https://developers.openai.com/api/docs/models/o3-pro", checked: "14 November 2026", claim: "The lab description of o3 Pro, its price, and its deprecated status.", rights: "public documentation" },
    { title: "OpenAI model page: o3", url: "https://developers.openai.com/api/docs/models/o3", checked: "14 November 2026", claim: "o3 base price: $2 input, $8 output per million tokens.", rights: "public documentation" },
    { title: "OpenAI model page: GPT-5", url: "https://developers.openai.com/api/docs/models/gpt-5", checked: "14 November 2026", claim: "GPT-5 base price: $1.25 input, $10 output per million tokens.", rights: "public documentation" },
    { title: "OpenAI model page: gpt-5.6-sol-pro", url: "https://developers.openai.com/api/docs/models/gpt-5.6-sol-pro", checked: "14 November 2026", claim: "The address returned HTTP 404 (not found) when we requested it.", rights: "public documentation" }
  ],
  code: "scripts/insights/pro-tier-price-premium.mjs",
  frozen: "src/data/insights/2026-11-14-pro-tier-price-premium.json"
};
