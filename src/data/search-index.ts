/**
 * Builds the search index for the global search component.
 *
 * This now reads from the public cache/query layer instead of talking to
 * SQLite directly, so builds and previews use the same source of truth.
 */
import {
  getAllBenchmarkIds,
  getAllModelIds,
  getAllTagIds,
  getBenchmarkById,
  getGlossaryTerms,
  getModelById,
  getPeople,
  getProviders,
  getTagById,
  getYouTubeCreators,
} from '../db/queries';

export interface SearchItem {
  id: string;
  title: string;
  type: string;
  category?: string;
  description?: string;
  url: string;
  provider?: string;
}

let _cachedIndex: SearchItem[] | null = null;

export function getSearchIndex(base: string): SearchItem[] {
  if (_cachedIndex) return _cachedIndex;

  const items: SearchItem[] = [];

  for (const modelId of getAllModelIds()) {
    const model = getModelById(modelId);
    if (!model) continue;
    items.push({
      id: model.id,
      title: model.name,
      type: 'model',
      category: model.category,
      description: model.notes ?? `${model.category.toUpperCase()} model by ${model.provider_name}`,
      url: `${base}models/${model.id}/`,
      provider: model.provider_name,
    });
  }

  for (const provider of getProviders()) {
    items.push({
      id: provider.id,
      title: provider.name,
      type: 'provider',
      description: provider.description ?? 'AI provider',
      url: `${base}labs/${provider.id}/`,
    });
  }

  for (const person of getPeople()) {
    items.push({
      id: person.id,
      title: person.name,
      type: 'person',
      description: [person.role, person.organisation_name].filter(Boolean).join(' at '),
      url: `${base}people/`,
      provider: person.organisation_name ?? undefined,
    });
  }

  for (const term of getGlossaryTerms()) {
    items.push({
      id: term.id,
      title: term.term,
      type: 'glossary',
      category: term.category,
      description: term.definition.length > 120 ? `${term.definition.slice(0, 120)}...` : term.definition,
      url: `${base}glossary/${term.id}/`,
    });
  }

  const guides = [
    { id: 'prompting-basics', title: 'Prompting Basics', description: 'Learn the fundamentals of writing effective AI prompts' },
    { id: 'advanced-prompting', title: 'Advanced Prompting Techniques', description: 'Chain-of-thought, few-shot learning, and expert techniques' },
    { id: 'choosing-an-ai-model', title: 'How to Choose an AI Model', description: 'Framework for selecting the right AI model for your needs' },
    { id: 'understanding-ai-pricing', title: 'Understanding AI Pricing', description: 'How AI model pricing works — tokens, tiers, and cost optimisation' },
    { id: 'ai-for-writing', title: 'AI for Writing', description: 'Using AI tools to enhance your writing workflow' },
    { id: 'ai-for-research', title: 'AI for Research', description: 'Using AI to accelerate and improve your research' },
  ];

  for (const guide of guides) {
    items.push({
      id: guide.id,
      title: guide.title,
      type: 'guide',
      description: guide.description,
      url: `${base}guides/${guide.id}/`,
    });
  }

  for (const benchmarkId of getAllBenchmarkIds()) {
    const benchmark = getBenchmarkById(benchmarkId);
    if (!benchmark) continue;
    items.push({
      id: benchmark.id,
      title: benchmark.name,
      type: 'benchmark',
      category: benchmark.category,
      description: benchmark.description ?? `AI benchmark in the ${benchmark.category} category`,
      url: `${base}benchmarks/${benchmark.id}/`,
    });
  }

  const blogPosts = [
    { id: 'how-ai-benchmarks-work', title: 'How AI Benchmarks Work', description: 'A plain-English guide to MMLU, GPQA, HumanEval, and more' },
    { id: 'ai-pricing-race-to-zero', title: 'The AI Pricing Race to Zero', description: 'AI model pricing has dropped over 90% in two years' },
    { id: 'open-source-vs-closed-ai', title: 'Open Source vs Closed AI Models', description: 'Comparing open-source and closed AI models on every benchmark' },
    { id: 'what-is-an-llm', title: 'What Is an LLM?', description: 'Large Language Models explained for everyone' },
  ];

  for (const post of blogPosts) {
    items.push({
      id: post.id,
      title: post.title,
      type: 'blog',
      description: post.description,
      url: `${base}blog/${post.id}/`,
    });
  }

  for (const creator of getYouTubeCreators()) {
    items.push({
      id: creator.id,
      title: creator.channel_name,
      type: 'youtube',
      category: creator.category,
      description: creator.description ?? `YouTube channel by ${creator.name}`,
      url: `${base}youtube/`,
    });
  }

  for (const tagId of getAllTagIds()) {
    const tag = getTagById(tagId);
    if (!tag) continue;
    items.push({
      id: tag.id,
      title: tag.name,
      type: 'tag',
      category: tag.category,
      description: tag.description ?? `Tag: ${tag.name}`,
      url: `${base}tags/${tag.id}/`,
    });
  }

  const sectionPages = [
    { id: 'reports', title: 'AI Reports', description: 'Recurring AI reports, indexes, and research dashboards worth tracking' },
    { id: 'events', title: 'AI Events', description: 'Recurring AI conferences and industry events worth watching' },
    { id: 'news', title: 'AI News', description: 'Latest AI news — model releases, research, funding, and industry updates' },
    { id: 'youtube', title: 'AI YouTube Channels', description: 'Curated list of the best YouTube channels covering AI' },
    { id: 'twitter', title: 'AI on X/Twitter', description: 'Curated list of the top AI accounts to follow on X/Twitter' },
    { id: 'jobs', title: 'AI Jobs Market', description: 'Track live AI-company openings, remote share, and role mix across public ATS boards' },
    { id: 'tags', title: 'Browse by Tag', description: 'Browse AI topics, technologies, and use cases' },
    { id: 'status', title: 'Provider Status Dashboard', description: 'Check if AI services are up — all provider status pages in one place' },
    { id: 'tools', title: 'AI Tools Directory', description: 'Comprehensive directory of the best AI tools — chatbots, coding assistants, image generators' },
    { id: 'timeline', title: 'AI Timeline', description: 'Key moments in AI history — from the Transformer paper to modern LLMs' },
    { id: 'leaderboard', title: 'AI Model Leaderboard', description: 'Ranked leaderboard of AI models by quality, value, and price' },
    { id: 'calculator', title: 'API Pricing Calculator', description: 'Calculate and compare AI API costs across different models' },
    { id: 'methodology', title: 'Methodology', description: 'How we score, rank, and compare AI models — full transparency' },
    { id: 'open-source', title: 'Open Source AI Models', description: 'Directory of open-source and open-weight AI models ranked by quality' },
    { id: 'coding', title: 'Best AI Models for Coding', description: 'Ranked leaderboard of the best AI models for coding and software development' },
    { id: 'stats', title: 'AI Industry Statistics', description: 'Comprehensive statistics on the AI model landscape — pricing, model counts, and more' },
    { id: 'references', title: 'References & Sources', description: 'Complete list of data sources, academic papers, benchmark methodologies, and citations' },
    { id: 'about', title: 'About', description: 'About The AI Resource Hub — independent AI model comparison and pricing data' },
    { id: 'changelog', title: 'Changelog', description: 'What\'s new — changelog of features, data updates, and improvements' },
    { id: 'pricing-trends', title: 'AI Pricing Trends', description: 'Track AI model pricing trends — how costs have dropped and where pricing is heading' },
    { id: 'fastest', title: 'Fastest AI Models', description: 'Ranked list of the fastest AI language models by tokens per second' },
    { id: 'cheapest', title: 'Cheapest AI Models', description: 'Find the most affordable AI language models ranked by price per million tokens' },
    { id: 'best-value', title: 'Best Value AI Models', description: 'AI models ranked by quality per dollar — find the best bang for your buck' },
    { id: 'multimodal', title: 'Multimodal AI Models', description: 'AI models that can process text, images, audio, and video' },
    { id: 'context-window', title: 'Context Window Comparison', description: 'Compare AI model context window sizes from 4K to 4M+ tokens' },
    { id: 'reasoning', title: 'AI Reasoning Models', description: 'Compare reasoning models ranked by math, logic, and reasoning benchmarks' },
    { id: 'new', title: 'New AI Models', description: 'Recently released AI models across all categories — track the latest launches' },
    { id: 'healthcare', title: 'Healthcare AI Models', description: 'AI models ranked by medical benchmark performance — MedQA scores for clinical reasoning' },
    { id: 'legal', title: 'Legal AI Models', description: 'AI models ranked by legal reasoning — LegalBench scores for issue-spotting and interpretation' },
    { id: 'finance', title: 'Finance AI Models', description: 'AI models ranked by financial analysis — FinQA and FinanceBench scores' },
    { id: 'creative-writing', title: 'Creative Writing AI Models', description: 'AI models ranked by creative writing quality — fiction, poetry, and narrative evaluation' },
    { id: 'agents', title: 'AI Agent Models', description: 'AI models ranked by agent performance — GAIA, WebArena, and TAU-bench for browser and tool use' },
    { id: 'speed', title: 'AI Speed Comparison', description: 'Compare AI model speed — TTFT, output tokens per second, and provider endpoint benchmarks' },
    { id: 'academy', title: 'AI Academy', description: 'Free 5-part beginner course — learn AI from scratch, no technical background required' },
    { id: 'prompts', title: 'Prompt Library', description: 'Model-specific prompting guides and task-based templates with official documentation links' },
    { id: 'api-guides', title: 'API Getting Started', description: 'Code snippets and setup guides for OpenAI, Anthropic, Google, and Ollama APIs' },
    { id: 'use-cases', title: 'Best Models by Use Case', description: 'The A-list — best AI models for coding, writing, reasoning, speed, privacy, and more' },
    { id: 'token-counter', title: 'Token Counter', description: 'Estimate token counts and API costs — paste text and see pricing across all models' },
    { id: 'rumours', title: 'Rumours & Leaks', description: 'Track stealth AI models, codenames, and leaks — unverified sightings from across the industry' },
    { id: 'scheduling', title: 'Scheduling Guide', description: 'Set up automated daily data updates on Windows, macOS, or Linux' },
  ];

  items.push({
    id: 'head-to-head',
    title: 'Head-to-Head Model Comparison',
    type: 'page',
    description: 'Compare 2–4 AI models side by side across pricing, benchmarks, and capabilities',
    url: `${base}compare/head-to-head/`,
  });

  items.push({
    id: 'compare-providers',
    title: 'Compare AI Providers',
    type: 'page',
    description: 'Side-by-side comparison of all major AI providers by quality, pricing, and model lineup',
    url: `${base}compare/providers/`,
  });

  for (const page of sectionPages) {
    items.push({
      id: page.id,
      title: page.title,
      type: 'page',
      description: page.description,
      url: `${base}${page.id}/`,
    });
  }

  _cachedIndex = items;
  return items;
}
