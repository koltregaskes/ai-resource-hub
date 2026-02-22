import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface SearchItem {
  id: string;
  title: string;
  type: string;
  category?: string;
  description?: string;
  url: string;
  provider?: string;
}

interface Props {
  items: SearchItem[];
  baseUrl?: string;
}

const typeLabels: Record<string, string> = {
  model: 'Model',
  provider: 'Provider',
  person: 'Person',
  glossary: 'Glossary',
  guide: 'Guide',
};

const typeColors: Record<string, string> = {
  model: 'var(--color-accent)',
  provider: 'var(--color-success)',
  person: 'var(--color-warning)',
  glossary: 'var(--color-danger)',
  guide: '#a855f7',
};

export default function GlobalSearch({ items, baseUrl = '/' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.provider?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query, items]);

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    window.location.href = url;
  }, []);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-colors text-sm"
        aria-label="Search"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            ref={dialogRef}
            className="relative w-full max-w-xl rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
              <svg className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search models, providers, glossary, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none text-sm"
              />
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query && results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                  No results found for "{query}"
                </div>
              )}

              {results.length > 0 && (
                <ul className="py-2">
                  {results.map((item) => (
                    <li key={`${item.type}-${item.id}`}>
                      <button
                        onClick={() => handleSelect(item.url)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <span
                          className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            color: typeColors[item.type] ?? 'var(--color-text-muted)',
                            backgroundColor: `color-mix(in srgb, ${typeColors[item.type] ?? 'var(--color-text-muted)'} 15%, transparent)`,
                          }}
                        >
                          {typeLabels[item.type] ?? item.type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.provider && (
                          <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                            {item.provider}
                          </span>
                        )}
                        <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!query && (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  Start typing to search across {items.length} items
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
