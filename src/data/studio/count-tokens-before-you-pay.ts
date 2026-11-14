import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "count-tokens-before-you-pay",
  title: "How to count tokens before you send, and why the count depends on the model",
  description: "OpenAI, Anthropic and Google each document a way to count tokens first. Anthropic says its newer models count about 30 percent more for the same text.",
  type: "Beginner",
  readTime: "8 min",
  date: "2026-11-14",
  id: "calc-studio-count-tokens-before-you-pay",
  formula: "Prompt tokens = assumed words divided by words per token. Site rule: 3,000 / 0.75. Google range: 3,000 / 0.80 to 3,000 / 0.60. Reply tokens = 600 / 0.75. Cost per request = prompt tokens / 1,000,000 x input price + reply tokens / 1,000,000 x output price; multiplied by 1,000 requests. Sensitivity: site-rule prompt tokens x 1.3.",
  assumptions: "Snapshot src/data/insights/2026-11-14.json (catalogue prices in US dollars per million tokens; the three models used carry official-list source labels in the catalogue). ASSUMED: a 3,000-word prompt, a 600-word reply, 1,000 requests, the site's 0.75 words per token rule, Google's 60 to 80 words per 100 tokens, and Anthropic's approximately 30 percent figure applied to the prompt only. None of these is a measurement of real text.",
  limits: "The worked example uses word-based rules on assumed word counts, so it shows the size of the spread, not the count for any real text. It excludes reasoning tokens, cached tokens, tool use, images and any discount. OpenAI's help article on tokens returned an access error to our fetch, so it is not cited; the OpenAI claims come from the tiktoken README and OpenAI Cookbook.",
  sources: [
    {
      title: "Token counting, Claude Platform docs (Anthropic)",
      url: "https://platform.claude.com/docs/en/build-with-claude/token-counting",
      checked: "14 November 2026",
      claim: "The counting endpoint is free to use with request-per-minute limits, returns an estimate that might differ by a small amount, counts under the tokenizer of the model you pass, does not apply caching logic, and newer Claude models give approximately 30 percent more tokens for the same text.",
      rights: "public documentation"
    },
    {
      title: "Understand and count tokens, Gemini API docs (Google)",
      url: "https://ai.google.dev/gemini-api/docs/tokens",
      checked: "14 November 2026",
      claim: "A Gemini token is about 4 characters and 100 tokens about 60 to 80 English words; count_tokens returns the input only and should be called before sending; thinking and cached tokens appear in the usage on the response.",
      rights: "public documentation"
    },
    {
      title: "tiktoken README (OpenAI, GitHub)",
      url: "https://github.com/openai/tiktoken",
      checked: "14 November 2026",
      claim: "tiktoken is OpenAI's open-source tokeniser, installed from PyPI, and on average each token corresponds to about 4 bytes.",
      rights: "MIT-licensed repository documentation"
    },
    {
      title: "How to count tokens with tiktoken (OpenAI Cookbook)",
      url: "https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb",
      checked: "14 November 2026",
      claim: "Different models use different encodings; chat-message counts from the example function are an estimate, not a timeless guarantee.",
      rights: "public documentation"
    },
    {
      title: "Tokenizer & Token Counter (this site)",
      url: "https://theairesourcehub.com/token-counter/",
      checked: "14 November 2026",
      claim: "The on-site counter rounds up characters divided by four, says it is an estimate and not a billing guarantee, and prices input only.",
      rights: "own page"
    }
  ],
  code: "scripts/insights/count-tokens-before-you-pay.mjs",
  frozen: "src/data/insights/2026-11-14-count-tokens-before-you-pay.json"
};
