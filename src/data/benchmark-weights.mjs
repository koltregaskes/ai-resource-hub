/** Preference analysis only. Input must come from the existing public rankable selector. */
export function normaliseScore(value, benchmark) {
  const { scale_min: min, scale_max: max, higher_is_better: direction } = benchmark;
  if (typeof value !== 'number' || !Number.isFinite(value)
    || !Number.isFinite(min) || !Number.isFinite(max) || max <= min
    || ![true, false, 0, 1].includes(direction) || value < min || value > max) return null;
  const fraction = (value - min) / (max - min);
  return direction === true || direction === 1 ? fraction : 1 - fraction;
}

export function analyseWeights(benchmarks, models, weights, perturbation = .25) {
  if (!Number.isFinite(perturbation) || perturbation < 0 || perturbation > .5) throw Error('Perturbation must be between 0 and 50%');
  if (new Set(benchmarks.map(b => b.id)).size !== benchmarks.length
    || new Set(models.map(m => m.id)).size !== models.length) throw Error('Duplicate identity');
  const categories = [...new Set(benchmarks.map(b => b.category))];
  for (const key of Object.keys(weights)) {
    if (!categories.includes(key) || !Number.isInteger(weights[key]) || weights[key] < 0 || weights[key] > 100) throw Error('Invalid category weight');
  }
  const active = categories.filter(key => (weights[key] ?? 0) > 0);
  const selected = benchmarks.filter(b => active.includes(b.category));
  const total = active.reduce((sum, key) => sum + weights[key], 0);
  const shares = Object.fromEntries(active.map(key => [key, weights[key] / total]));
  const counts = Object.fromEntries(active.map(key => [key, selected.filter(b => b.category === key).length]));
  const rows = models.map(model => {
    const values = selected.map(b => ({ benchmark: b, value: normaliseScore(model.scores[b.id], b) }));
    const missing = values.filter(v => v.value === null).map(v => v.benchmark.name);
    const coverage = values.reduce((sum, v) => sum + (v.value === null ? 0 : shares[v.benchmark.category] / counts[v.benchmark.category]), 0);
    return { id: model.id, name: model.name, missing, coverage, measured: selected.length - missing.length,
      required: selected.length, score: null, rank: null, bestRank: null, worstRank: null,
      categoryScores: missing.length ? {} : Object.fromEntries(active.map(key => [key, values.filter(v => v.benchmark.category === key)
        .reduce((sum, v) => sum + v.value, 0) / counts[key]])) };
  });
  // Partial category sums are never emitted as scores or used in a ranking.
  const eligible = rows.filter(row => selected.length > 0 && row.missing.length === 0);
  const rank = scenario => {
    const denominator = active.reduce((sum, key) => sum + scenario[key], 0);
    const scores = eligible.map(row => ({ id: row.id,
      score: active.reduce((sum, key) => sum + scenario[key] / denominator * row.categoryScores[key], 0) * 100 }));
    return scores.map(row => ({ ...row, rank: 1 + scores.filter(other => other.score > row.score + 1e-10).length }));
  };
  const baseline = rank(weights);
  const scenarios = [baseline];
  if (perturbation > 0) for (const key of active) for (const sign of [-1, 1]) {
    scenarios.push(rank({ ...weights, [key]: weights[key] * (1 + sign * perturbation) }));
  }
  for (const row of rows) {
    const base = baseline.find(item => item.id === row.id);
    if (base) {
      row.score = base.score;
      row.rank = base.rank;
      const ranks = scenarios.map(scenario => scenario.find(item => item.id === row.id).rank);
      row.bestRank = Math.min(...ranks);
      row.worstRank = Math.max(...ranks);
    }
    delete row.categoryScores;
  }
  rows.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || a.name.localeCompare(b.name));
  return { rows, shares, selectedCount: selected.length, eligibleCount: eligible.length, scenarioCount: scenarios.length };
}
