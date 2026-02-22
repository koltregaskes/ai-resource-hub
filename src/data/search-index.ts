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

  _cachedIndex = items;
  return items;
}
