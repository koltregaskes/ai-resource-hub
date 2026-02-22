import { useState, useMemo } from 'react';

interface Benchmark {
  id: string;
  name: string;
  category: string;
  description: string | null;
  scale_min: number;
  scale_max: number;
  higher_is_better: number;
  weight: number;
}

interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  scores: Record<string, number>;
}

interface Props {
  benchmarks: Benchmark[];
  models: ModelEntry[];
}

type SortTarget = 'name' | 'provider' | string; // string = benchmark id

function getScoreColour(score: number, min: number, max: number): string {
  const ratio = (score - min) / (max - min);
  if (ratio >= 0.9) return 'var(--color-success)';
  if (ratio >= 0.75) return 'var(--color-accent)';
  if (ratio >= 0.6) return 'var(--color-warning)';
  return 'var(--color-text-secondary)';
}

export default function BenchmarkTable({ benchmarks, models }: Props) {
  const [sortBy, setSortBy] = useState<SortTarget>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    return [...new Set(benchmarks.map((b) => b.category))].sort();
  }, [benchmarks]);

  const filteredBenchmarks = useMemo(() => {
    if (categoryFilter === 'all') return benchmarks;
    return benchmarks.filter((b) => b.category === categoryFilter);
  }, [benchmarks, categoryFilter]);

  const handleSort = (target: SortTarget) => {
    if (sortBy === target) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(target);
      setSortDir(target === 'name' || target === 'provider' ? 'asc' : 'desc');
    }
  };

  const sortedModels = useMemo(() => {
    let result = [...models];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp: number;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'provider') {
        cmp = a.provider.localeCompare(b.provider);
      } else {
        const aScore = a.scores[sortBy] ?? -1;
        const bScore = b.scores[sortBy] ?? -1;
        cmp = aScore - bScore;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [models, search, sortBy, sortDir]);

  // Find best score per benchmark for highlighting
  const bestScores = useMemo(() => {
    const bests: Record<string, number> = {};
    for (const b of filteredBenchmarks) {
      let best = -Infinity;
      for (const m of models) {
        if (m.scores[b.id] !== undefined && m.scores[b.id] > best) {
          best = m.scores[b.id];
        }
      }
      if (best > -Infinity) bests[b.id] = best;
    }
    return bests;
  }, [filteredBenchmarks, models]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none min-w-[160px]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-[var(--color-text-muted)] mb-3">
        {sortedModels.length} model{sortedModels.length !== 1 ? 's' : ''} &middot;{' '}
        {filteredBenchmarks.length} benchmark{filteredBenchmarks.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="table-scroll-container rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th
                className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap sticky left-0 bg-[var(--color-bg-card)] z-10"
                onClick={() => handleSort('name')}
              >
                Model
                <SortArrow active={sortBy === 'name'} dir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap"
                onClick={() => handleSort('provider')}
              >
                Provider
                <SortArrow active={sortBy === 'provider'} dir={sortDir} />
              </th>
              {filteredBenchmarks.map((b) => (
                <th
                  key={b.id}
                  className="px-3 py-3 text-right font-semibold text-[var(--color-text-secondary)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap"
                  onClick={() => handleSort(b.id)}
                  title={b.description ?? b.name}
                >
                  <span className="text-xs">{b.name}</span>
                  <SortArrow active={sortBy === b.id} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedModels.map((model) => (
              <tr
                key={model.id}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap sticky left-0 bg-[var(--color-bg-card)]">
                  {model.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: model.providerColour }}
                    />
                    {model.provider}
                  </span>
                </td>
                {filteredBenchmarks.map((b) => {
                  const score = model.scores[b.id];
                  const isBest = score !== undefined && score === bestScores[b.id];
                  return (
                    <td
                      key={b.id}
                      className="px-3 py-3 text-right font-mono whitespace-nowrap"
                    >
                      {score !== undefined ? (
                        <span
                          className={isBest ? 'font-bold' : ''}
                          style={{
                            color: getScoreColour(score, b.scale_min, b.scale_max),
                          }}
                        >
                          {b.id === 'chatbot-arena-elo' ? score.toFixed(0) : score.toFixed(1)}
                          {isBest && <span className="ml-1 text-[0.6rem]" title="Best score">&#9733;</span>}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedModels.length === 0 && (
          <div className="px-4 py-12 text-center text-[var(--color-text-muted)]">
            No models match your search.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
        <span>&#9733; = best score in column</span>
        <span>— = not yet measured</span>
        <span>Scores from official reports and LMSYS Chatbot Arena</span>
      </div>
    </div>
  );
}

function SortArrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return null;
  return (
    <span className="ml-1 text-[var(--color-accent)]">
      {dir === 'asc' ? '▲' : '▼'}
    </span>
  );
}
