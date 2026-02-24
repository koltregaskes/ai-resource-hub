/**
 * Builds the search index for the global search component.
 * This runs at build time — the resulting array is serialised into every page.
 */
import { getDB } from '../db/schema';

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

  const db = getDB();
  const items: SearchItem[] = [];

  // Models (all categories)
  const models = db.prepare(`
    SELECT m.id, m.name, m.category, m.notes, p.name AS provider
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all() as Array<{ id: string; name: string; category: string; notes: string | null; provider: string }>;

  for (const m of models) {
    items.push({
      id: m.id,
      title: m.name,
      type: 'model',
      category: m.category,
      description: m.notes ?? `${m.category.toUpperCase()} model by ${m.provider}`,
      url: `${base}models/${m.id}/`,
      provider: m.provider,
    });
  }

  // Providers
  const providers = db.prepare(`
    SELECT id, name, description FROM providers ORDER BY name
  `).all() as Array<{ id: string; name: string; description: string | null }>;

  for (const p of providers) {
    items.push({
      id: p.id,
      title: p.name,
      type: 'provider',
      description: p.description ?? `AI provider`,
      url: `${base}labs/${p.id}/`,
    });
  }

  // People
  const people = db.prepare(`
    SELECT p.id, p.name, p.role, p.notable_for, pr.name AS organisation
    FROM people p
    LEFT JOIN providers pr ON p.provider_id = pr.id
    ORDER BY p.name
  `).all() as Array<{ id: string; name: string; role: string | null; notable_for: string | null; organisation: string | null }>;

  for (const p of people) {
    items.push({
      id: p.id,
      title: p.name,
      type: 'person',
      description: [p.role, p.organisation].filter(Boolean).join(' at '),
      url: `${base}people/`,
      provider: p.organisation ?? undefined,
    });
  }

  // Glossary terms
  const glossary = db.prepare(`
    SELECT id, term, definition, category FROM glossary ORDER BY term
  `).all() as Array<{ id: string; term: string; definition: string; category: string }>;

  for (const g of glossary) {
    items.push({
      id: g.id,
      title: g.term,
      type: 'glossary',
      category: g.category,
      description: g.definition.length > 120 ? g.definition.slice(0, 120) + '...' : g.definition,
      url: `${base}glossary/${g.id}/`,
    });
  }

  // Static guide pages
  const guides = [
    { id: 'prompting-basics', title: 'Prompting Basics', description: 'Learn the fundamentals of writing effective AI prompts' },
    { id: 'advanced-prompting', title: 'Advanced Prompting Techniques', description: 'Chain-of-thought, few-shot learning, and expert techniques' },
    { id: 'choosing-an-ai-model', title: 'How to Choose an AI Model', description: 'Framework for selecting the right AI model for your needs' },
    { id: 'understanding-ai-pricing', title: 'Understanding AI Pricing', description: 'How AI model pricing works — tokens, tiers, and cost optimisation' },
    { id: 'ai-for-writing', title: 'AI for Writing', description: 'Using AI tools to enhance your writing workflow' },
    { id: 'ai-for-research', title: 'AI for Research', description: 'Using AI to accelerate and improve your research' },
  ];

  for (const g of guides) {
    items.push({
      id: g.id,
      title: g.title,
      type: 'guide',
      description: g.description,
      url: `${base}guides/${g.id}/`,
    });
  }

  // Benchmarks
  const benchmarks = db.prepare(`
    SELECT id, name, category, description FROM benchmarks ORDER BY name
  `).all() as Array<{ id: string; name: string; category: string; description: string | null }>;

  for (const b of benchmarks) {
    items.push({
      id: b.id,
      title: b.name,
      type: 'benchmark',
      category: b.category,
      description: b.description ?? `AI benchmark in the ${b.category} category`,
      url: `${base}benchmarks/${b.id}/`,
    });
  }

  // Blog posts
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

  // YouTube creators
  const ytCreators = db.prepare(`
    SELECT id, name, channel_name, category, description FROM youtube_creators ORDER BY subscribers DESC
  `).all() as Array<{ id: string; name: string; channel_name: string; category: string; description: string | null }>;

  for (const c of ytCreators) {
    items.push({
      id: c.id,
      title: c.channel_name,
      type: 'youtube',
      category: c.category,
      description: c.description ?? `YouTube channel by ${c.name}`,
      url: `${base}youtube/`,
    });
  }

  // Tags
  const tags = db.prepare(`
    SELECT id, name, category, description FROM tags ORDER BY name
  `).all() as Array<{ id: string; name: string; category: string; description: string | null }>;

  for (const t of tags) {
    items.push({
      id: t.id,
      title: t.name,
      type: 'tag',
      category: t.category,
      description: t.description ?? `Tag: ${t.name}`,
      url: `${base}tags/${t.id}/`,
    });
  }

  // Static section pages
  const sectionPages = [
    { id: 'news', title: 'AI News', description: 'Latest AI news — model releases, research, funding, and industry updates' },
    { id: 'youtube', title: 'AI YouTube Channels', description: 'Curated list of the best YouTube channels covering AI' },
    { id: 'twitter', title: 'AI on X/Twitter', description: 'Curated list of the top AI accounts to follow on X/Twitter' },
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
  ];

  // Custom URL pages
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

  for (const s of sectionPages) {
    items.push({
      id: s.id,
      title: s.title,
      type: 'page',
      description: s.description,
      url: `${base}${s.id}/`,
    });
  }

  _cachedIndex = items;
  return items;
}
