export type BlogType = 'Explainer' | 'Analysis' | 'Comparison' | 'Beginner' | 'Essay' | 'News';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  type: BlogType;
  readTime: string;
}

/** Editorial posts, newest first. The blog index, search, RSS, and tickers share this list. */
export const blogPosts: BlogPost[] = [
  {
    slug: 'four-million-entrepreneurs',
    title: "What the OpenAI entrepreneurship report didn't say",
    description:
      "OpenAI says 4 million people used ChatGPT to start, plan, run, or grow a business in March 2026. Here's the part the report skipped — and why most of those four million won't earn anything.",
    date: '2026-05-05',
    type: 'Essay',
    readTime: '8 min',
  },
  {
    slug: 'what-is-rag',
    title: 'What Is RAG? Retrieval-Augmented Generation Explained',
    description:
      'A plain-English guide to RAG — the technique that lets AI models pull in real data instead of guessing. When to use it, when not to, and how it actually works.',
    date: '2026-02-27',
    type: 'Explainer',
    readTime: '7 min',
  },
  {
    slug: 'context-windows-explained',
    title: 'Context Windows Explained: Why Bigger Is Not Always Better',
    description:
      'What context windows actually are, why very large ones can degrade quality, and how to think about them when choosing a model.',
    date: '2026-02-26',
    type: 'Explainer',
    readTime: '7 min',
  },
  {
    slug: 'bench-maxing-personal-benchmarks',
    title: 'Bench-Maxing and Why You Should Test AI Models on Your Actual Work',
    description:
      'Formal benchmarks are increasingly gamed by AI labs. Here is the case for building a small personal test suite based on the work you actually do — and why community signal often beats published scores.',
    date: '2026-02-25',
    type: 'Analysis',
    readTime: '9 min',
  },
  {
    slug: 'temperature-top-p-and-inference-settings',
    title: 'Temperature, Top-p, and the Inference Settings Nobody Explains',
    description:
      'A practical guide to temperature, top-p, frequency penalty, and other generation settings — what they do, when to change them, and when to leave them alone.',
    date: '2026-02-24',
    type: 'Explainer',
    readTime: '6 min',
  },
  {
    slug: 'ai-agents-explained',
    title: 'AI Agents Explained: What They Are and How They Work',
    description:
      'AI agents are models that can plan, use tools, and take actions autonomously. Here is what that actually means in practice — and which models are best at it.',
    date: '2026-02-22',
    type: 'Explainer',
    readTime: '8 min',
  },
  {
    slug: 'how-ai-benchmarks-work',
    title: 'How AI Benchmarks Work (And Why You Should Care)',
    description:
      'A plain-English guide to MMLU, GPQA, HumanEval, SWE-bench, and Chatbot Arena — the tests that determine which AI models are actually good.',
    date: '2026-02-20',
    type: 'Explainer',
    readTime: '8 min',
  },
  {
    slug: 'ai-pricing-race-to-zero',
    title: 'The AI Pricing Race to Zero',
    description:
      'AI model pricing has dropped over 90% in two years. We tracked every price change and here is what the data shows about where pricing is heading.',
    date: '2026-02-15',
    type: 'Analysis',
    readTime: '6 min',
  },
  {
    slug: 'open-source-vs-closed-ai',
    title: 'Open Source vs Closed AI Models in 2026',
    description:
      'DeepSeek, Llama, Mistral, and Qwen are closing the gap. We compare the latest open-source models against GPT, Claude, and Gemini on every benchmark.',
    date: '2026-02-10',
    type: 'Comparison',
    readTime: '10 min',
  },
  {
    slug: 'what-is-an-llm',
    title: 'What Is an LLM? A Non-Technical Guide',
    description:
      'Large Language Models explained for everyone — what they are, how they work, and why they matter. No jargon, no PhD required.',
    date: '2026-02-05',
    type: 'Beginner',
    readTime: '5 min',
  },
];

export function blogPostHref(basePath: string, slug: string): string {
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${base}blog/${slug}/`;
}
