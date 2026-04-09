import { useCallback, useEffect, useMemo, useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  date: string;
  dateLabel: string;
  category: string;
  tags: string[];
  digestDate: string;
}

interface Props {
  news: NewsItem[];
  baseUrl: string;
}

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const parts = dateStr.split('-').map(Number);
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';

  return target.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const TAG_COLOURS: Record<string, string> = {
  'Top Stories': 'bg-amber-500/20 text-amber-400',
  News: 'bg-gray-500/20 text-gray-400',
  YouTube: 'bg-red-500/20 text-red-400',
  agents: 'bg-violet-500/20 text-violet-400',
  models: 'bg-blue-500/20 text-blue-400',
  research: 'bg-purple-500/20 text-purple-400',
  funding: 'bg-yellow-500/20 text-yellow-400',
  product: 'bg-emerald-500/20 text-emerald-400',
  'open-source': 'bg-orange-500/20 text-orange-400',
  safety: 'bg-red-500/20 text-red-400',
  coding: 'bg-cyan-500/20 text-cyan-400',
  infrastructure: 'bg-slate-500/20 text-slate-400',
};

type DateRange = '24h' | '7d' | 'all';

export default function NewsFilter({ news }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [archiveMonth, setArchiveMonth] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('airh-news-favourites');
      if (saved) setFavourites(new Set(JSON.parse(saved)));
    } catch {
      // Ignore local storage failures in strict privacy contexts.
    }
  }, []);

  const archiveMonths = useMemo(() => {
    const months = new Set<string>();
    news.forEach((item) => {
      const [year, month] = item.date.split('-');
      months.add(`${year}-${month}`);
    });
    return Array.from(months).sort().reverse();
  }, [news]);

  const filtered = useMemo(() => {
    let items = news;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.title.toLowerCase().includes(query)
        || item.summary.toLowerCase().includes(query)
        || item.source.toLowerCase().includes(query)
        || item.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (archiveMonth) {
      items = items.filter((item) => item.date.startsWith(archiveMonth));
    } else if (customFrom || customTo) {
      if (customFrom) items = items.filter((item) => item.date >= customFrom);
      if (customTo) items = items.filter((item) => item.date <= customTo);
    } else if (dateRange === '24h') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const cutoff = yesterday.toISOString().split('T')[0];
      items = items.filter((item) => item.date >= cutoff);
    } else if (dateRange === '7d') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const cutoff = weekAgo.toISOString().split('T')[0];
      items = items.filter((item) => item.date >= cutoff);
    }

    if (highlightsOnly) {
      items = items.filter((item) => favourites.has(item.id));
    }

    return items;
  }, [archiveMonth, customFrom, customTo, dateRange, favourites, highlightsOnly, news, searchQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};

    filtered.forEach((item) => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });

    const sorted: Record<string, NewsItem[]> = {};
    Object.keys(groups).sort().reverse().forEach((key) => {
      sorted[key] = groups[key];
    });

    return sorted;
  }, [filtered]);

  const favouritedItems = useMemo(
    () => filtered.filter((item) => favourites.has(item.id)),
    [filtered, favourites],
  );

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('airh-news-favourites', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange('all');
    setCustomFrom('');
    setCustomTo('');
    setArchiveMonth('');
    setHighlightsOnly(false);
  }, []);

  const setQuickDate = useCallback((range: DateRange) => {
    setDateRange(range);
    setCustomFrom('');
    setCustomTo('');
    setArchiveMonth('');
  }, []);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery) parts.push(`"${searchQuery}"`);

    if (archiveMonth) {
      const [year, month] = archiveMonth.split('-');
      parts.push(new Date(+year, +month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
    } else if (customFrom || customTo) {
      parts.push(`${customFrom || '...'} to ${customTo || '...'}`);
    } else if (dateRange === '24h') {
      parts.push('Last 24 hours');
    } else if (dateRange === '7d') {
      parts.push('Last 7 days');
    }

    if (highlightsOnly) parts.push('Highlights only');
    return parts.join(' · ');
  }, [archiveMonth, customFrom, customTo, dateRange, highlightsOnly, searchQuery]);

  return (
    <div className="relative flex gap-6">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg lg:hidden"
        style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>

      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto transition-transform lg:static lg:w-64 lg:translate-x-0`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}
      >
        <div className="space-y-5 p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 rounded p-1 lg:hidden"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Search</h3>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Date Range</h3>
            <div className="mb-2 flex gap-1">
              {([['24h', 'Last 24h'], ['7d', 'Last 7 Days'], ['all', 'All']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setQuickDate(key)}
                  className="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: dateRange === key && !archiveMonth && !customFrom && !customTo
                      ? 'var(--color-accent)'
                      : 'var(--color-bg-tertiary)',
                    color: dateRange === key && !archiveMonth && !customFrom && !customTo
                      ? '#fff'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                value={customFrom}
                onChange={(event) => {
                  setCustomFrom(event.target.value);
                  setArchiveMonth('');
                }}
                className="flex-1 rounded border px-2 py-1 text-xs outline-none"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(event) => {
                  setCustomTo(event.target.value);
                  setArchiveMonth('');
                }}
                className="flex-1 rounded border px-2 py-1 text-xs outline-none"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Archive</h3>
            <select
              value={archiveMonth}
              onChange={(event) => {
                setArchiveMonth(event.target.value);
                setCustomFrom('');
                setCustomTo('');
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">All Months</option>
              {archiveMonths.map((monthValue) => {
                const [year, month] = monthValue.split('-');
                const label = new Date(+year, +month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                return <option key={monthValue} value={monthValue}>{label}</option>;
              })}
            </select>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Options</h3>
            <label className="flex cursor-pointer items-center gap-2 py-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                checked={highlightsOnly}
                onChange={(event) => setHighlightsOnly(event.target.checked)}
                className="rounded accent-[var(--color-accent)]"
              />
              Highlights only
            </label>
          </div>

          <button
            onClick={clearFilters}
            className="w-full rounded-lg py-2 text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {sidebarOpen ? <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} of {news.length} articles
            {filterSummary ? ` · ${filterSummary}` : ''}
          </p>
        </div>

        {favouritedItems.length > 0 && !highlightsOnly ? (
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Highlights ({favouritedItems.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {favouritedItems.map((item) => (
                <NewsCard key={`fav-${item.id}`} item={item} isFavourite toggleFavourite={toggleFavourite} />
              ))}
            </div>
          </div>
        ) : null}

        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([key, items]) => (
              <div key={key}>
                <h3
                  className="mb-3 border-b pb-1 text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)', borderBottomColor: 'var(--color-border)' }}
                >
                  {getRelativeDateLabel(key)}
                  <span className="ml-2 font-normal" style={{ color: 'var(--color-text-muted)' }}>
                    ({items.length})
                  </span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      isFavourite={favourites.has(item.id)}
                      toggleFavourite={toggleFavourite}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <p className="mb-2 text-lg">No articles found</p>
            <p className="mb-3 text-sm">Try adjusting your filters or date range.</p>
            <button
              onClick={clearFilters}
              className="rounded-lg px-4 py-2 text-sm"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsCard({
  item,
  isFavourite,
  toggleFavourite,
}: {
  item: NewsItem;
  isFavourite: boolean;
  toggleFavourite: (id: string) => void;
}) {
  return (
    <div
      className="group relative rounded-xl p-4 transition-colors"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: isFavourite
          ? '1px solid rgba(251, 191, 36, 0.3)'
          : '1px solid var(--color-border)',
      }}
    >
      <button
        onClick={(event) => {
          event.preventDefault();
          toggleFavourite(item.id);
        }}
        className="absolute right-3 top-3 rounded p-1 opacity-40 transition-opacity group-hover:opacity-100"
        title={isFavourite ? 'Remove highlight' : 'Highlight'}
      >
        <svg
          className="h-4 w-4"
          fill={isFavourite ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: isFavourite ? 'rgb(251, 191, 36)' : 'var(--color-text-muted)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

      <div className="mb-2 flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        <span className={`rounded px-1.5 py-0.5 font-medium ${TAG_COLOURS[item.category] ?? 'bg-gray-500/20 text-gray-400'}`}>
          {item.category}
        </span>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1 block text-sm font-semibold leading-snug hover:underline"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {item.title}
        <svg className="ml-1 inline-block h-3 w-3 -translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {item.summary ? (
        <p className="mb-2 line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {item.summary}
        </p>
      ) : null}

      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TAG_COLOURS[tag] ?? 'bg-gray-500/15 text-gray-400'}`}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
