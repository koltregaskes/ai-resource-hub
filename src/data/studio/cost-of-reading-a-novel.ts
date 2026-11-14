import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "cost-of-reading-a-novel",
  title: "Reading a novel costs from $0.0024 to $3.60, and five models cannot hold it",
  description: "For an assumed 90,000-word novel, one read costs between a quarter of a cent and $3.60 across 65 language models, and 60 of the 65 have a context window big enough to hold it.",
  type: "Analysis",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-cost-of-reading-a-novel",
  formula: "Tokens = 90,000 words / 0.75 = 120,000 (OpenAI's rule of thumb: 100 tokens is about 75 words). Read cost = tokens / 1,000,000 x input price per million tokens. Write cost = tokens / 1,000,000 x output price per million tokens. A model fits if its recorded context window is at least 120,000 tokens. Novels that fit = context window / 120,000.",
  assumptions: "Data: data/pg-cache/models.json, snapshot of 14 November 2026 (language models, status active, input and output price above zero, variants removed by the suffix rule: id ends in a date stamp or -fast), 65 models. ASSUMPTION: the novel is 90,000 English words; real books vary. ASSUMPTION: a model writing a novel produces the same number of tokens it read. The table shows 10 models at evenly spaced ranks of the list sorted by input price. Prices are US dollars per million tokens; 45 come from the cheapest OpenRouter host and 20 from a lab's own list.",
  limits: "The words-to-tokens rule is for English and is an estimate; other tokenizers may count differently. Prices are list prices on the snapshot date and leave out cached-input and batch discounts and any surcharge for long prompts, which we did not check model by model. Context windows are the catalogue's recorded figures and were not re-checked against each lab. Fitting says nothing about how well a model uses a long text, and the question and reply also need room.",
  sources: [
    {
      title: "OpenAI Help Center: Understanding and counting tokens",
      url: "https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them",
      checked: "14 November 2026",
      claim: "The rule of thumb for English text that 100 tokens are approximately 75 words, described on the page as estimates, not exact counts.",
      rights: "public documentation"
    }
  ],
  code: "scripts/insights/cost-of-reading-a-novel.mjs",
  frozen: "src/data/insights/2026-11-14-cost-of-reading-a-novel.json"
};
