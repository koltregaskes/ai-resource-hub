import { useState, useMemo, useCallback } from 'react';

interface CategoryModel {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  maxOutput: number;
  speed: number;
  qualityScore: number;
  released: string;
  openSource: boolean;
  modality: string;
  apiAvailable: boolean;
  notes?: string;
}

type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
  field: keyof CategoryModel;
  label: string;
  shortLabel: string;
  format: (value: unknown, model: CategoryModel) => string;
  align: 'left' | 'right';
  defaultSort: SortDirection;
}

interface Props {
  models: CategoryModel[];
  columns: ColumnConfig[];
  category: string;
  baseUrl?: string;
  priceLabel?: string;
  priceUnit?: string;
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="inline-flex flex-col ml-1" aria-hidden="true">
      <svg
        className={`w-3 h-3 -mb-0.5 ${active && direction === 'asc' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
        viewBox="0 0 10 6"
        fill="currentColor"
      >
        <path d="M5 0L10 6H0z" />
      </svg>
      <svg
        className={`w-3 h-3 -mt-0.5 ${active && direction === 'desc' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
        viewBox="0 0 10 6"
        fill="currentColor"
      >
        <path d="M5 6L0 0h10z" />
      </svg>
    </span>
  );
}

function isNewModel(released: string): boolean {
  const releaseDate = new Date(released);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  return releaseDate > sixtyDaysAgo;
}

export default function ModelComparisonTable({ models, columns, category, baseUrl = '/', priceLabel, priceUnit }: Props) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const [sortField, setSortField] = useState<keyof CategoryModel>('qualityScore');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [ossFilter, setOssFilter] = useState(false);

  const providers = useMemo(() => {
    return [...new Set(models.map((m) => m.provider))].sort();
  }, [models]);

  const handleSort = useCallback((field: keyof CategoryModel) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      const col = columns.find((c) => c.field === field);
      setSortDir(col?.defaultSort ?? 'desc');
      return field;
    });
  }, [columns]);

  const filtered = useMemo(() => {
    let result = [...models];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q)
      );
    }

    if (providerFilter !== 'all') {
      result = result.filter((m) => m.provider === providerFilter);
    }

    if (ossFilter) {
      result = result.filter((m) => m.openSource);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      let cmp: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'boolean') {
        cmp = (aVal ? 1 : 0) - (bVal ? 1 : 0);
      } else {
        cmp = (aVal as number) - (bVal as number);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [models, search, providerFilter, ossFilter, sortField, sortDir]);

  const hasActiveFilters = search || providerFilter !== 'all' || ossFilter;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
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
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none min-w-[160px]"
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ossFilter}
              onChange={(e) => setOssFilter(e.target.checked)}
              className="rounded border-[var(--color-border)] accent-[var(--color-accent)]"
            />
            Open source only
          </label>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setProviderFilter('all'); setOssFilter(false); }}
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-[var(--color-text-muted)] mb-3">
        {filtered.length} model{filtered.length !== 1 ? 's' : ''}{hasActiveFilters ? ' matching filters' : ''}
      </div>

      {/* Table */}
      <div className="table-scroll-container rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {columns.map((col) => (
                <th
                  key={String(col.field)}
                  className={`px-4 py-3 font-semibold text-[var(--color-text-secondary)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => handleSort(col.field)}
                  tabIndex={0}
                  role="columnheader"
                >
                  <span className="hidden sm:inline">{col.label}</span>
                  <span className="sm:hidden">{col.shortLabel}</span>
                  <SortIcon active={sortField === col.field} direction={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((model) => (
              <tr
                key={model.id}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                {columns.map((col) => {
                  const isName = col.field === 'name';
                  const isProvider = col.field === 'provider';
                  const isQuality = col.field === 'qualityScore';

                  if (isName) {
                    return (
                      <td key={String(col.field)} className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a href={`${base}models/${model.id}/`} className="hover:text-[var(--color-accent)] transition-colors">
                            {model.name}
                          </a>
                          {isNewModel(model.released) && <span className="badge badge-new">NEW</span>}
                          {model.openSource && <span className="badge badge-oss">OSS</span>}
                        </div>
                      </td>
                    );
                  }

                  if (isProvider) {
                    return (
                      <td key={String(col.field)} className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: model.providerColour }} />
                          {model.provider}
                        </span>
                      </td>
                    );
                  }

                  if (isQuality) {
                    const score = model.qualityScore;
                    let colour = 'var(--color-text-secondary)';
                    if (score >= 90) colour = 'var(--color-success)';
                    else if (score >= 85) colour = 'var(--color-accent)';
                    else if (score >= 80) colour = 'var(--color-warning)';
                    return (
                      <td key={String(col.field)} className={`px-4 py-3 whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}>
                        <span className="font-bold" style={{ color: colour }}>{score}</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={String(col.field)}
                      className={`px-4 py-3 font-mono text-[var(--color-text-secondary)] whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.format(model[col.field], model)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-[var(--color-text-muted)]">
            No models match your search. Try adjusting your filters.
          </div>
        )}
      </div>

      {priceLabel && priceUnit && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
          <span>{priceLabel} ({priceUnit})</span>
          <span>Quality: composite score (0-100)</span>
        </div>
      )}
    </div>
  );
}
