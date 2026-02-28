import { useState, useMemo, useCallback, useEffect } from 'react';

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

// ─── Helpers ─────────────────────────────────────────────────────

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const TAG_COLOURS: Record<string, string> = {
  'Top Stories': 'bg-amber-500/20 text-amber-400',
  'News': 'bg-gray-500/20 text-gray-400',
  'YouTube': 'bg-red-500/20 text-red-400',
  'agents': 'bg-violet-500/20 text-violet-400',
  'models': 'bg-blue-500/20 text-blue-400',
  'research': 'bg-purple-500/20 text-purple-400',
  'funding': 'bg-yellow-500/20 text-yellow-400',
  'product': 'bg-emerald-500/20 text-emerald-400',
  'open-source': 'bg-orange-500/20 text-orange-400',
  'safety': 'bg-red-500/20 text-red-400',
  'coding': 'bg-cyan-500/20 text-cyan-400',
  'infrastructure': 'bg-slate-500/20 text-slate-400',
};

type DateRange = '24h' | '7d' | 'all';
type GroupBy = 'date' | 'source';

// ─── Component ───────────────────────────────────────────────────

export default function NewsFilter({ news }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [allSourcesSelected, setAllSourcesSelected] = useState(true);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load favourites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('airh-news-favourites');
      if (saved) setFavourites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  // Available sources (sorted alphabetically)
  const sources = useMemo(() => {
    const s = new Set<string>();
    news.forEach(n => s.add(n.source));
    return Array.from(s).sort();
  }, [news]);

  // Initialise selected sources on mount
  useEffect(() => {
    setSelectedSources(new Set(sources));
  }, [sources]);

  // Archive months
  const archiveMonths = useMemo(() => {
    const months = new Set<string>();
    news.forEach(n => {
      const [y, m] = n.date.split('-');
      months.add(`${y}-${m}`);
    });
    return Array.from(months).sort().reverse();
  }, [news]);
  const [archiveMonth, setArchiveMonth] = useState('');

  // ── Filtering ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let items = news;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Date range
    if (archiveMonth) {
      items = items.filter(n => n.date.startsWith(archiveMonth));
    } else if (customFrom || customTo) {
      if (customFrom) items = items.filter(n => n.date >= customFrom);
      if (customTo) items = items.filter(n => n.date <= customTo);
    } else if (dateRange === '24h') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const cutoff = yesterday.toISOString().split('T')[0];
      items = items.filter(n => n.date >= cutoff);
    } else if (dateRange === '7d') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const cutoff = weekAgo.toISOString().split('T')[0];
      items = items.filter(n => n.date >= cutoff);
    }
    // 'all' = no date filter

    // Sources
    if (!allSourcesSelected && selectedSources.size > 0) {
      items = items.filter(n => selectedSources.has(n.source));
    }

    // Highlights only
    if (highlightsOnly) {
      items = items.filter(n => favourites.has(n.id));
    }

    return items;
  }, [news, searchQuery, dateRange, customFrom, customTo, archiveMonth, selectedSources, allSourcesSelected, highlightsOnly, favourites]);

  // ── Grouping ───────────────────────────────────────────────────

  const grouped = useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};

    if (groupBy === 'source') {
      filtered.forEach(item => {
        const key = item.source;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      // Sort groups alphabetically
      const sorted: Record<string, NewsItem[]> = {};
      Object.keys(groups).sort().forEach(k => { sorted[k] = groups[k]; });
      return sorted;
    }

    // Default: group by date
    filtered.forEach(item => {
      const key = item.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    // Sort groups newest first
    const sorted: Record<string, NewsItem[]> = {};
    Object.keys(groups).sort().reverse().forEach(k => { sorted[k] = groups[k]; });
    return sorted;
  }, [filtered, groupBy]);

  // ── Actions ────────────────────────────────────────────────────

  const toggleFavourite = useCallback((id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('airh-news-favourites', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const toggleSource = useCallback((source: string) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      setAllSourcesSelected(next.size === sources.length);
      return next;
    });
  }, [sources]);

  const selectAllSources = useCallback(() => {
    setSelectedSources(new Set(sources));
    setAllSourcesSelected(true);
  }, [sources]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange('all');
    setCustomFrom('');
    setCustomTo('');
    setArchiveMonth('');
    setHighlightsOnly(false);
    selectAllSources();
  }, [selectAllSources]);

  const setQuickDate = useCallback((range: DateRange) => {
    setDateRange(range);
    setCustomFrom('');
    setCustomTo('');
    setArchiveMonth('');
  }, []);

  // ── Filter summary ─────────────────────────────────────────────

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery) parts.push(`"${searchQuery}"`);
    if (archiveMonth) {
      const [y, m] = archiveMonth.split('-');
      const label = new Date(+y, +m - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      parts.push(label);
    } else if (customFrom || customTo) {
      parts.push(`${customFrom || '...'} to ${customTo || '...'}`);
    } else if (dateRange === '24h') {
      parts.push('Last 24 hours');
    } else if (dateRange === '7d') {
      parts.push('Last 7 days');
    }
    if (!allSourcesSelected) parts.push(`${selectedSources.size} sources`);
    if (highlightsOnly) parts.push('Highlights only');
    return parts.join(' · ');
  }, [searchQuery, dateRange, customFrom, customTo, archiveMonth, selectedSources, allSourcesSelected, highlightsOnly]);

  // ── Favourited articles (pinned at top) ────────────────────────

  const favouritedItems = useMemo(
    () => filtered.filter(n => favourites.has(n.id)),
    [filtered, favourites]
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg cursor-pointer"
        style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-64 shrink-0 overflow-y-auto transition-transform`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}
      >
        <div className="p-4 space-y-5">
          {/* Close button mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-1 rounded cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Search */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Search</h3>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Date Range</h3>
            <div className="flex gap-1 mb-2">
              {([['24h', 'Last 24h'], ['7d', 'Last 7 Days'], ['all', 'All']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setQuickDate(key)}
                  className="flex-1 text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: dateRange === key && !archiveMonth && !customFrom && !customTo
                      ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                    color: dateRange === key && !archiveMonth && !customFrom && !customTo
                      ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <input type="date" value={customFrom}
                onChange={e => { setCustomFrom(e.target.value); setArchiveMonth(''); }}
                className="flex-1 px-2 py-1 rounded text-xs border outline-none"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>to</span>
              <input type="date" value={customTo}
                onChange={e => { setCustomTo(e.target.value); setArchiveMonth(''); }}
                className="flex-1 px-2 py-1 rounded text-xs border outline-none"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Archive */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Archive</h3>
            <select
              value={archiveMonth}
              onChange={e => { setArchiveMonth(e.target.value); setCustomFrom(''); setCustomTo(''); }}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">All Months</option>
              {archiveMonths.map(m => {
                const [y, mo] = m.split('-');
                const label = new Date(+y, +mo - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
          </div>

          {/* Group By */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Group By</h3>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as GroupBy)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="date">Date</option>
              <option value="source">Source</option>
            </select>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>
              Sources
              <button onClick={selectAllSources} className="ml-2 text-xs font-normal cursor-pointer"
                style={{ color: 'var(--color-accent)' }}>
                Select all
              </button>
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {sources.map(source => (
                <label key={source} className="flex items-center gap-2 cursor-pointer py-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={selectedSources.has(source)}
                    onChange={() => toggleSource(source)}
                    className="rounded accent-[var(--color-accent)]"
                  />
                  {source}
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Options</h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs py-1"
              style={{ color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={highlightsOnly}
                onChange={e => setHighlightsOnly(e.target.checked)}
                className="rounded accent-[var(--color-accent)]" />
              Highlights only
            </label>
          </div>

          {/* Clear */}
          <button onClick={clearFilters}
            className="w-full py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Filter summary */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} of {news.length} articles
            {filterSummary && ` · ${filterSummary}`}
          </p>
        </div>

        {/* Favourites section */}
        {favouritedItems.length > 0 && !highlightsOnly && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}>
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Highlights ({favouritedItems.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {favouritedItems.map(item => (
                <NewsCard key={`fav-${item.id}`} item={item} isFavourite toggleFavourite={toggleFavourite} />
              ))}
            </div>
          </div>
        )}

        {/* Grouped articles */}
        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([key, items]) => (
              <div key={key}>
                <h3 className="text-sm font-semibold mb-3 pb-1"
                  style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}>
                  {groupBy === 'date' ? getRelativeDateLabel(key) : key}
                  <span className="font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>
                    ({items.length})
                  </span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map(item => (
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
          <div className="p-8 rounded-xl text-center"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            <p className="text-lg mb-2">No articles found</p>
            <p className="text-sm mb-3">Try adjusting your filters or date range.</p>
            <button onClick={clearFilters}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── News Card ───────────────────────────────────────────────────

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
      className="p-4 rounded-xl transition-colors relative group"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: isFavourite
          ? '1px solid rgba(251, 191, 36, 0.3)'
          : '1px solid var(--color-border)',
      }}
    >
      {/* Favourite button */}
      <button
        onClick={e => { e.preventDefault(); toggleFavourite(item.id); }}
        className="absolute top-3 right-3 p-1 rounded opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
        title={isFavourite ? 'Remove highlight' : 'Highlight'}
      >
        <svg className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: isFavourite ? 'rgb(251, 191, 36)' : 'var(--color-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>

      {/* Header: date + source */}
      <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        <span>·</span>
        <span>{item.source}</span>
        <span className={`px-1.5 py-0.5 rounded font-medium ${TAG_COLOURS[item.category] ?? 'bg-gray-500/20 text-gray-400'}`}>
          {item.category}
        </span>
      </div>

      {/* Title */}
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className="block font-semibold text-sm leading-snug hover:underline mb-1"
        style={{ color: 'var(--color-text-primary)' }}>
        {item.title}
        <svg className="w-3 h-3 inline-block ml-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: 'var(--color-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Summary */}
      {item.summary && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          {item.summary}
        </p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span key={tag}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TAG_COLOURS[tag] ?? 'bg-gray-500/15 text-gray-400'}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
