import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "cost-of-filling-a-million-token-window",
  title: "Filling a million-token window once costs between $0.10 and $30",
  description: "Across 28 active language models with a recorded window of a million tokens or more, one full prompt at list price runs from $0.10 to $30. We also check three labs for long-prompt price rules.",
  type: "Analysis",
  readTime: "8 min",
  date: "2026-11-14",
  id: "calc-studio-cost-of-filling-a-million-token-window",
  formula: "For each model: fill = input price per million tokens x 1; answer = output price per million tokens x 0.001 (1,000 tokens); total = fill + answer. Median and spread are taken over the 28 rows (spread = dearest fill / cheapest fill). GPT-5.5 worked example: base total = 5 + 30 x 0.001; with the documented rule = 5 x 2 + 30 x 1.5 x 0.001. Gemini 2.5 Pro: 2.50 + 15 x 0.001 against 1.25 + 10 x 0.001.",
  assumptions: "Data: data/pg-cache/models.json, snapshot 14 November 2026. Set: category llm, status active, input and output price above zero, variants removed by the suffix rule (id ends in a date stamp or -fast), recorded context_window of 1,000,000 or more. ASSUMPTION: the prompt is exactly 1,000,000 input tokens sent once; the answer is 1,000 tokens. Provider tokenisers count differently, so the same text is a different number of tokens on different models.",
  limits: "List prices only: caching, batch, regional and priority pricing are left out. A window is a limit on what can be sent, not a promise about answer quality. Catalogue prices for 10 of the 28 rows are the cheapest host on OpenRouter, not the lab's price. The catalogue does not hold every current model, and long-prompt rules were checked for GPT-5.5, Claude and Gemini 2.5 Pro only; other rows may have rules we did not read.",
  sources: [
    { title: "OpenAI API docs: GPT-5.5 model page", url: "https://developers.openai.com/api/docs/models/gpt-5.5", checked: "14 November 2026", claim: "Base prices of $5 input and $30 output per million tokens, a 1,050,000 context window, and prompts over 272K input tokens priced at 2x input and 1.5x output for the full session.", rights: "public documentation" },
    { title: "Anthropic: Claude API pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", checked: "14 November 2026", claim: "Claude 4.6 and later models other than Haiku 5.5 include the full 1M window at standard pricing; Haiku 5.5 is priced higher above 100,000 prompt tokens; base prices for Claude Opus 5 and Sonnet 4.6.", rights: "public documentation" },
    { title: "Google AI Studio: Gemini API pricing", url: "https://aistudio.google.com/docs/pricing", checked: "14 November 2026", claim: "Gemini 2.5 Pro Standard tier lists $1.25 input and $10 output for prompts up to 200k tokens, and $2.50 and $15 for prompts above 200k.", rights: "public documentation" }
  ],
  code: "scripts/insights/cost-of-filling-a-million-token-window.mjs",
  frozen: "src/data/insights/2026-11-14-cost-of-filling-a-million-token-window.json"
};
