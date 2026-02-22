import { useState, useMemo, useCallback } from 'react';
import type { LLMModel, SortField, SortDirection, SortConfig, ColumnDef } from '../types/models';

interface Props {
  models: LLMModel[];
  baseUrl?: string;
}

function formatPrice(price: number): string {
  if (price < 0.01) return `<$0.01`;
  return `$${price.toFixed(2)}`;
}

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  return `${Math.round(tokens / 1_000)}K`;
}

function formatSpeed(tps: number): string {
  return `${tps} t/s`;
}

/** Determine if a model is "new" (released within the last 60 days) */
function isNewModel(released: string): boolean {
  const releaseDate = new Date(released);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  return releaseDate > sixtyDaysAgo;
}

/** Export filtered models to CSV */
function exportCSV(models: LLMModel[]): void {
  const headers = ['Name', 'Provider', 'Input $/1M', 'Output $/1M', 'Context', 'Max Output', 'Speed (t/s)', 'Quality', 'Value', 'Released', 'Open Source', 'Modality'];
  const rows = models.map((m) => [
    m.name,
    m.provider,
    m.inputPrice.toFixed(2),
    m.outputPrice.toFixed(2),
    m.contextWindow.toString(),
    m.maxOutput.toString(),
    m.speed.toString(),
    m.qualityScore.toString(),
    m.valueScore.toString(),
    m.released,
    m.openSource ? 'Yes' : 'No',
    m.modality.join('; '),
  ]);

  const csv = [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-models-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    label: 'Model',
    shortLabel: 'Model',
    format: (v) => String(v),
    align: 'left',
    defaultSort: 'asc',
  },
  {
    field: 'provider',
    label: 'Provider',
    shortLabel: 'Provider',
    format: (v) => String(v),
    align: 'left',
    defaultSort: 'asc',
  },
  {
    field: 'inputPrice',
    label: 'Input /1M',
    shortLabel: 'In $/1M',
    format: (v) => formatPrice(v as number),
    align: 'right',
    defaultSort: 'asc',
  },
  {
    field: 'outputPrice',
    label: 'Output /1M',
    shortLabel: 'Out $/1M',
    format: (v) => formatPrice(v as number),
    align: 'right',
    defaultSort: 'asc',
  },
  {
    field: 'contextWindow',
    label: 'Context',
    shortLabel: 'Ctx',
    format: (v) => formatContext(v as number),
    align: 'right',
    defaultSort: 'desc',
  },
  {
    field: 'speed',
    label: 'Speed',
    shortLabel: 'Speed',
    format: (v) => formatSpeed(v as number),
    align: 'right',
    defaultSort: 'desc',
  },
  {
    field: 'qualityScore',
    label: 'Quality',
    shortLabel: 'Qual.',
    format: (v) => String(v),
    align: 'right',
    defaultSort: 'desc',
  },
  {
    field: 'valueScore',
    label: 'Value',
    shortLabel: 'Value',
    format: (v) => String(v),
    align: 'right',
    defaultSort: 'desc',
  },
];

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

function ProviderBadge({ provider, colour }: { provider: string; colour: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: colour }}
      />
      {provider}
    </span>
  );
}

function ModelBadges({ model, isBestValue }: { model: LLMModel; isBestValue: boolean }) {
  const badges: JSX.Element[] = [];

  if (isBestValue) {
    badges.push(
      <span key="best" className="badge badge-best-value">BEST VALUE</span>
    );
  }

  if (isNewModel(model.released)) {
    badges.push(
      <span key="new" className="badge badge-new">NEW</span>
    );
  }

  if (model.openSource) {
    badges.push(
      <span key="oss" className="badge badge-oss">OSS</span>
    );
  }

  if (badges.length === 0) return null;
  return <>{badges}</>;
}

export default function LLMComparisonTable({ models, baseUrl = '/' }: Props) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const [sort, setSort] = useState<SortConfig>({
    field: 'valueScore',
    direction: 'desc',
  });
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [ossFilter, setOssFilter] = useState<boolean>(false);

  const providers = useMemo(() => {
    const unique = [...new Set(models.map((m) => m.provider))];
    return unique.sort();
  }, [models]);

  // Find the best value model ID for badging
  const bestValueId = useMemo(() => {
    const sorted = [...models].sort((a, b) => b.valueScore - a.valueScore);
    return sorted[0]?.id;
  }, [models]);

  const handleSort = useCallback(
    (field: SortField) => {
      setSort((prev) => {
        if (prev.field === field) {
          return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
        }
        const col = columns.find((c) => c.field === field);
        return { field, direction: col?.defaultSort ?? 'asc' };
      });
    },
    []
  );

  const filteredAndSorted = useMemo(() => {
    let result = [...models];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q)
      );
    }

    // Filter by provider
    if (providerFilter !== 'all') {
      result = result.filter((m) => m.provider === providerFilter);
    }

    // Filter by modality
    if (modalityFilter !== 'all') {
      result = result.filter((m) => m.modality.includes(modalityFilter));
    }

    // Filter by open source
    if (ossFilter) {
      result = result.filter((m) => m.openSource);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      let cmp: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = (aVal as number) - (bVal as number);
      }

      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [models, search, providerFilter, modalityFilter, ossFilter, sort]);

  const hasActiveFilters = search || providerFilter !== 'all' || modalityFilter !== 'all' || ossFilter;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none min-w-[140px]"
          >
            <option value="all">All Modalities</option>
            <option value="text">Text</option>
            <option value="vision">Vision</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
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
                onClick={() => { setSearch(''); setProviderFilter('all'); setModalityFilter('all'); setOssFilter(false); }}
                className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          <button
            onClick={() => exportCSV(filteredAndSorted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[var(--color-text-muted)] mb-3">
        {filteredAndSorted.length} model{filteredAndSorted.length !== 1 ? 's' : ''}
        {hasActiveFilters ? ' matching filters' : ''}
      </div>

      {/* Table */}
      <div className="table-scroll-container rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={`px-4 py-3 font-semibold text-[var(--color-text-secondary)] cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => handleSort(col.field)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(col.field);
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sort.field === col.field
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span className="hidden sm:inline">{col.label}</span>
                  <span className="sm:hidden">{col.shortLabel ?? col.label}</span>
                  <SortIcon
                    active={sort.field === col.field}
                    direction={sort.direction}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((model) => (
              <tr
                key={model.id}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                {/* Model name + badges */}
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <a
                      href={`${base}models/${model.id}/`}
                      className="hover:text-[var(--color-accent)] transition-colors"
                    >
                      {model.name}
                    </a>
                    <ModelBadges
                      model={model}
                      isBestValue={model.id === bestValueId}
                    />
                  </div>
                </td>

                {/* Provider */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <ProviderBadge
                    provider={model.provider}
                    colour={model.providerColour}
                  />
                </td>

                {/* Input price */}
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text-secondary)] whitespace-nowrap">
                  {formatPrice(model.inputPrice)}
                </td>

                {/* Output price */}
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text-secondary)] whitespace-nowrap">
                  {formatPrice(model.outputPrice)}
                </td>

                {/* Context window */}
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text-secondary)] whitespace-nowrap">
                  {formatContext(model.contextWindow)}
                </td>

                {/* Speed */}
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text-secondary)] whitespace-nowrap">
                  {formatSpeed(model.speed)}
                </td>

                {/* Quality score */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <QualityBadge score={model.qualityScore} />
                </td>

                {/* Value score */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <ValueBadge score={model.valueScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="px-4 py-12 text-center text-[var(--color-text-muted)]">
            No models match your search. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
        <span>Prices per 1M tokens (USD)</span>
        <span>Speed in output tokens/second</span>
        <span>Quality: composite benchmark score (0-100)</span>
        <span>Value: quality per unit cost</span>
      </div>
    </div>
  );
}

function QualityBadge({ score }: { score: number }) {
  let colour = 'var(--color-text-secondary)';
  if (score >= 90) colour = 'var(--color-success)';
  else if (score >= 85) colour = 'var(--color-accent)';
  else if (score >= 80) colour = 'var(--color-warning)';

  return (
    <span className="font-bold" style={{ color: colour }}>
      {score}
    </span>
  );
}

function ValueBadge({ score }: { score: number }) {
  let colour = 'var(--color-text-secondary)';
  if (score >= 500) colour = 'var(--color-success)';
  else if (score >= 200) colour = 'var(--color-accent)';
  else if (score >= 100) colour = 'var(--color-warning)';

  return (
    <span className="font-bold" style={{ color: colour }}>
      {score}
    </span>
  );
}
