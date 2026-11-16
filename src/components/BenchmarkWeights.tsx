import { useMemo, useState } from 'react';
import { analyseWeights } from '../data/benchmark-weights.mjs';
import './BenchmarkWeights.css';

interface Benchmark { id: string; name: string; category: string; scale_min: number; scale_max: number; higher_is_better: number | boolean; }
interface Model { id: string; name: string; scores: Record<string, number>; }
interface Analysis { shares: Record<string, number>; selectedCount: number; eligibleCount: number; scenarioCount: number;
  rows: { id: string; name: string; missing: string[]; measured: number; required: number; coverage: number; score: number | null; rank: number | null; bestRank: number | null; worstRank: number | null }[]; }

export default function BenchmarkWeights({ benchmarks, models }: { benchmarks: Benchmark[]; models: Model[] }) {
  const categories = useMemo(() => [...new Set(benchmarks.map(b => b.category))].sort(), [benchmarks]);
  const [weights, setWeights] = useState<Record<string, number>>(() => Object.fromEntries(categories.map(c => [c, 1])));
  const [perturbation, setPerturbation] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => benchmarks.map(b => b.id));
  const result: Analysis = useMemo(() => {
    const selected = benchmarks.filter(b => selectedIds.includes(b.id));
    const selectedCategories = new Set(selected.map(b => b.category));
    return analyseWeights(selected, models, Object.fromEntries(Object.entries(weights).filter(([key]) => selectedCategories.has(key))), perturbation / 100);
  }, [benchmarks, models, weights, perturbation, selectedIds]);
  const format = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return <section className="weight-checker" aria-labelledby="weight-title">
    <div className="weight-heading"><div>
      <p className="weight-eyebrow">YOUR PRIORITIES · YOUR ASSUMPTIONS</p>
      <h2 id="weight-title">How much does the ranking depend on you?</h2>
      <p>Set category weights, then test how nearby preferences change the order. This exploratory index is not a measure of general intelligence.</p>
    </div><button type="button" onClick={() => { setWeights(Object.fromEntries(categories.map(c => [c, 1]))); setSelectedIds(benchmarks.map(b => b.id)); setPerturbation(25); }}>Reset equal weights</button></div>
    <div className="weight-layout"><fieldset className="weight-controls">
      <legend>Category weights</legend><p id="weight-help">Whole-number relative weights from 0 to 100. Zero excludes a category. Equal weights are a starting preference, not validated importance.</p>
      {categories.map(category => <label className="weight-control" key={category}>
        <span>{category}<small>{format((result.shares[category] ?? 0) * 100)}% of selected weight</small></span>
        <input aria-describedby="weight-help" aria-label={`${category} weight`} type="number" min="0" max="100" step="1" value={weights[category] ?? 0}
          onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 0 && value <= 100) setWeights(previous => ({ ...previous, [category]: value })); }} />
      </label>)}
      <details className="weight-scope"><summary>Choose benchmark scope ({selectedIds.length}/{benchmarks.length})</summary>
        <p>All benchmarks start selected. A narrower selection changes what this index measures.</p>
        {benchmarks.map(benchmark => <label key={benchmark.id}><input type="checkbox" checked={selectedIds.includes(benchmark.id)}
          onChange={event => setSelectedIds(previous => event.target.checked ? [...previous, benchmark.id] : previous.filter(id => id !== benchmark.id))} />{benchmark.name}</label>)}
      </details>
      <label className="weight-control"><span>Sensitivity perturbation<small>Relative change to one active weight at a time</small></span>
        <input aria-label="Sensitivity perturbation percent" type="number" min="0" max="50" step="1" value={perturbation}
          onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0 && value <= 50) setPerturbation(value); }} /></label>
    </fieldset><div className="weight-results">
      <p role="status">{result.eligibleCount} models have complete coverage of {result.selectedCount} selected benchmarks. {result.scenarioCount} weight scenarios tested.</p>
      {result.selectedCount === 0 ? <p>Choose at least one positive category weight to compare models.</p> : <>
        {result.eligibleCount === 0 && <p className="weight-notice">No complete model coverage. No scores or ranks are inferred. Set a category to zero to narrow the selected evidence.</p>}
        <div className="weight-scroll" role="region" aria-label="Weight sensitivity results" tabIndex={0} data-airh-scroll-region="true"><table>
          <caption>Current preferences and sampled rank sensitivity</caption><thead><tr><th scope="col">Model</th><th scope="col">Coverage</th><th scope="col">Preference index</th><th scope="col">Rank</th><th scope="col">Tested rank range</th></tr></thead>
          <tbody>{result.rows.map(row => <tr key={row.id}><th scope="row">{row.name}</th><td>{row.measured}/{row.required}<small>{format(row.coverage * 100)}% weighted coverage</small>
            {row.missing.length > 0 && <details><summary>Missing measurements</summary><ul>{row.missing.map((name, index) => <li key={index}>{name}</li>)}</ul></details>}</td>
            <td>{row.score === null ? 'Unknown' : format(row.score)}</td><td>{row.rank ?? 'Unranked'}</td><td>{row.bestRank === null ? 'Unavailable' : `${row.bestRank}–${row.worstRank}`}</td></tr>)}</tbody>
        </table></div>
      </>}
    </div></div>
    <details className="weight-method"><summary>Calculation, limits and efficiency caveats</summary>
      <p>Each selected benchmark is mapped linearly from its declared minimum and maximum to 0–100, reversing lower-is-better scores. Benchmarks are equally weighted inside each category; category shares are normalised to total 100%. Categories with no selected benchmarks are excluded. Out-of-scale or invalid measurements count as missing. A real measured zero stays zero. Missing values never become scores.</p>
      <p>Ranks require every selected measurement. Coverage is the share of selected benchmark weight actually measured. The index combines different constructs as your stated preference, not as proof of protocol comparability, statistical significance or universal capability. Only the existing source-verified, freshness-checked public matrix is used; models absent from that matrix are not assessed here.</p>
      <p>Sensitivity tests the baseline plus ±{perturbation}% of each positive category weight separately, renormalising all shares each time. Zero weights stay excluded. Equal scores share competition ranks. The range covers only these sampled scenarios, not simultaneous weight changes, confidence intervals or guaranteed extremes. A stable range can still reflect sparse coverage or a small eligible cohort.</p>
      <p>Time per accepted task and cost per accepted correct result are unknown in this matrix. Token price and tokens per second cannot substitute: include reasoning tokens, retries, failures, tools, judge costs and human review. Compare matched tasks, effort, routes and success criteria before claiming value or speed.</p>
      <p>Inspired by <a href="https://www.mypriors.com/cli" rel="noreferrer">Adam Holter’s Priors</a> and its editable mixes and coverage disclosures. This is an original local calculation; no Priors scores, weights or estimates are imported. Your edits stay in this page until reset or reload.</p>
    </details>
  </section>;
}
