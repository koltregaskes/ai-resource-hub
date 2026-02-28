import { useState, useMemo } from 'react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  image_url: string | null;
  published_at: string;
  category: string;
}

interface Props {
  news: NewsItem[];
  baseUrl: string;
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  models: 'Model Releases',
  research: 'Research',
  industry: 'Industry',
  funding: 'Funding & Deals',
  policy: 'Policy & Regulation',
  tools: 'Tools & Products',
  'open-source': 'Open Source',
};

const categoryColours: Record<string, string> = {
  general: 'bg-gray-500/20 text-gray-400',
  models: 'bg-blue-500/20 text-blue-400',
  research: 'bg-purple-500/20 text-purple-400',
  industry: 'bg-green-500/20 text-green-400',
  funding: 'bg-yellow-500/20 text-yellow-400',
  policy: 'bg-red-500/20 text-red-400',
  tools: 'bg-cyan-500/20 text-cyan-400',
  'open-source': 'bg-orange-500/20 text-orange-400',
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NewsFilter({ news, baseUrl }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of news) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }, [news]);

  const filtered = useMemo(() => {
    let items = news;
    if (activeCategory !== 'all') {
      items = items.filter((n) => n.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          n.source.toLowerCase().includes(q)
      );
    }
    return items;
  }, [news, activeCategory, searchQuery]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 rounded-lg text-sm border outline-none transition-colors"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor:
              activeCategory === 'all'
                ? 'rgba(59, 130, 246, 0.2)'
                : 'var(--color-bg-tertiary)',
            color:
              activeCategory === 'all'
                ? 'rgb(59, 130, 246)'
                : 'var(--color-text-secondary)',
          }}
        >
          All ({news.length})
        </button>
        {categories.map(({ category, count }) => (
          <button
            key={category}
            onClick={() =>
              setActiveCategory(activeCategory === category ? 'all' : category)
            }
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor:
                activeCategory === category
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'var(--color-bg-tertiary)',
              color:
                activeCategory === category
                  ? 'rgb(59, 130, 246)'
                  : 'var(--color-text-secondary)',
            }}
          >
            {categoryLabels[category] ?? category} ({count})
          </button>
        ))}
      </div>

      {/* Results count */}
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Showing {filtered.length} of {news.length} articles
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* News list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 sm:p-5 rounded-xl transition-colors group"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor =
                  'var(--color-border-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--color-border)')
              }
            >
              <div className="flex items-start gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 hidden sm:block"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-semibold transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p
                      className="text-sm mt-1 line-clamp-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {item.summary}
                    </p>
                  )}
                  <div
                    className="flex flex-wrap items-center gap-3 mt-2 text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <span>{item.source}</span>
                    <span>{timeAgo(item.published_at)}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${categoryColours[item.category] ?? 'bg-gray-500/20 text-gray-400'}`}
                    >
                      {categoryLabels[item.category] ?? item.category}
                    </span>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 shrink-0 mt-1 transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <p className="text-lg mb-2">No matching articles</p>
          <p className="text-sm">
            Try a different search term or category filter.
          </p>
        </div>
      )}
    </div>
  );
}
