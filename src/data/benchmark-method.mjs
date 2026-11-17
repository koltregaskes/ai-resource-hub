/** Public method contract. Deliberately does not accept evaluation items or outputs. */
export const METHOD_FIELDS = Object.freeze([
  'dataset', 'split', 'version', 'metric', 'promptVersion', 'sampling', 'model', 'effort', 'harness', 'tools',
  'attempts', 'aggregation', 'contextLimit', 'tokenLimit', 'sampleSize',
  'uncertainty', 'origin', 'measuredAt', 'retrievedAt', 'releasedAt', 'revisedAt',
  'accuracy', 'brier', 'coverage', 'abstention', 'totalCostUsd', 'acceptedCorrect',
  'latency', 'route', 'perturbation', 'equivalence', 'pairing',
]);
const CONTROLS = ['dataset', 'split', 'version', 'metric', 'promptVersion', 'sampling', 'effort', 'harness', 'tools',
  'attempts', 'aggregation', 'contextLimit', 'tokenLimit'];
const NUMBER_FIELDS = ['attempts', 'contextLimit', 'tokenLimit', 'sampleSize',
  'accuracy', 'brier', 'coverage', 'abstention', 'totalCostUsd', 'acceptedCorrect'];
const DATE_FIELDS = ['measuredAt', 'retrievedAt', 'releasedAt', 'revisedAt'];

// Require a real calendar day and explicit timezone for timestamps. Date.parse
// alone rolls invalid days forward and accepts ambiguous locale date strings.
function evidenceTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return NaN;
  const day = value.slice(0, 10);
  const calendar = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(calendar) || new Date(calendar).toISOString().slice(0, 10) !== day) return NaN;
  // ISO 24:00 rolls into the following day; evidence must name that day explicitly.
  if (value.length > 10 && Number(value.slice(11, 13)) > 23) return NaN;
  return Date.parse(value);
}

/** Fail closed on unexpected keys at every admitted level; do not persist input. */
export function admitMethod(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Expected aggregate envelope');
  const allowed = ['kind', 'privacyReview', 'rightsReview', 'method'];
  if (Object.keys(input).some(k => !allowed.includes(k))) throw Error('Unexpected envelope field');
  if (!['public-report', 'internal-aggregate', 'synthetic'].includes(input.kind)) throw Error('Not an aggregate');
  for (const key of ['privacyReview', 'rightsReview']) {
    if (typeof input[key] !== 'string' || !input[key].trim()) throw Error('Review reference required');
  }
  const method = input.method;
  if (!method || typeof method !== 'object' || Array.isArray(method)) throw Error('Expected method');
  if (Object.keys(method).some(k => !METHOD_FIELDS.includes(k))) throw Error('Unexpected method field');
  for (const [key, value] of Object.entries(method)) {
    if (value === null) continue;
    if (DATE_FIELDS.includes(key) && !Number.isFinite(evidenceTime(value))) throw Error('Invalid evidence date');
    if (NUMBER_FIELDS.includes(key)) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw Error('Invalid aggregate number');
      if (['accuracy', 'coverage', 'abstention', 'brier'].includes(key) && value > 1) throw Error('Invalid probability');
      if (['attempts', 'sampleSize', 'acceptedCorrect', 'contextLimit', 'tokenLimit'].includes(key) && !Number.isSafeInteger(value)) throw Error('Invalid count');
      if (['attempts', 'contextLimit', 'tokenLimit'].includes(key) && value === 0) throw Error('Invalid protocol limit');
    } else if (typeof value !== 'string' || !value.trim() || value.length > 600) throw Error('Expected bounded aggregate text');
  }
  if (method.acceptedCorrect != null && method.sampleSize != null && method.acceptedCorrect > method.sampleSize) throw Error('Accepted count exceeds sample');
  if (method.coverage != null && method.abstention != null && Math.abs(method.coverage + method.abstention - 1) > 1e-6) throw Error('Coverage and abstention disagree');
  return Object.freeze({ ...method });
}

// This helper also guards callers that have not yet admitted an aggregate envelope.
// Equal placeholders are not evidence that two measurement protocols align.
function knownControl(key, value) {
  if (NUMBER_FIELDS.includes(key)) return Number.isSafeInteger(value) && value > 0;
  return typeof value === 'string' && value.trim().length > 0
    && !/^(unknown|not reported|not_reported|n\/a|unspecified)$/i.test(value.trim());
}

export function comparisonReasons(left, right) {
  return CONTROLS.flatMap(key => !knownControl(key, left?.[key]) || !knownControl(key, right?.[key])
    ? [`${key}: unknown`] : left[key] !== right[key] ? [`${key}: incompatible`] : []);
}

const escape = value => String(value ?? 'Unknown').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const labels = {
  dataset: 'Dataset', split: 'Split', version: 'Dataset version',
  metric: 'Metric / scoring definition', promptVersion: 'Prompt revision', sampling: 'Sampling protocol', model: 'Served model',
  effort: 'Effort', harness: 'Harness / scorer', tools: 'Tools', attempts: 'Attempts',
  aggregation: 'Aggregation (AVG@k / pass@k)', contextLimit: 'Context limit', tokenLimit: 'Token limit',
  sampleSize: 'Sample size', uncertainty: 'Uncertainty / population / method', origin: 'Provider or independent measurement',
  measuredAt: 'Measured', retrievedAt: 'Retrieved', releasedAt: 'Model released', revisedAt: 'Result revised',
  accuracy: 'Accuracy', brier: 'Brier (not a pure calibration grade)', coverage: 'Coverage',
  abstention: 'Abstention', totalCostUsd: 'Total task cost (USD; include failures, tools and judge)',
  acceptedCorrect: 'Accepted correct results', latency: 'Latency', route: 'Route availability',
  perturbation: 'Perturbation: invariant or task change', equivalence: 'Equivalence validation', pairing: 'Aggregate pairing validation',
};

/** Only caller-selected public fields enter this renderer. Escapes all displayed text.
 * @param {{ model: string, measuredAt?: string | null, sourceUrl?: string | null, method?: Record<string, any> | null, now?: Date }} options
 */
export function renderMethodPanel({ model, measuredAt = null, sourceUrl = null, method = null, now = new Date() }) {
  const values = method ?? { model, measuredAt };
  const measured = values.measuredAt;
  const age = (now.getTime() - evidenceTime(measured)) / 86400000;
  const freshness = !Number.isFinite(age) ? 'Measurement age unknown'
    : age < -1 ? 'Measurement date is in the future; review required'
    : age > 365 ? 'Stale measurement (over 365 days)' : 'Measurement within 365 days';
  let source = 'Source URL unknown';
  try {
    const url = new URL(sourceUrl);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) {
      source = `<a href="${escape(url.href)}" rel="noreferrer">Result source</a>`;
    }
  } catch { /* unknown */ }
  const totalCost = values.totalCostUsd;
  const accepted = values.acceptedCorrect;
  const validSample = values.sampleSize == null || (Number.isSafeInteger(values.sampleSize)
    && values.sampleSize >= accepted);
  const unitCost = typeof totalCost === 'number' && Number.isFinite(totalCost) && totalCost >= 0
    && Number.isSafeInteger(accepted) && accepted > 0 && validSample ? totalCost / accepted : NaN;
  // Guard direct renderer callers too. Never label an invalid ratio, or a tiny
  // positive measured cost rounded to zero, as a free accepted result.
  const cost = !Number.isFinite(unitCost) || (totalCost > 0 && unitCost === 0) ? 'Unknown'
    : unitCost > 0 && unitCost < .00005 ? unitCost.toExponential(3) : unitCost.toFixed(4);
  return `<details class="benchmark-method"><summary>Method and limits for ${escape(model)}</summary>
    <p>${method ? 'Method metadata supplied; comparison requires aligned controls.' : 'Method unknown — comparison unavailable.'}</p>
    <p>${escape(freshness)}. ${source}</p>
    <dl>${METHOD_FIELDS.map(key => `<dt>${escape(labels[key])}</dt><dd>${escape(values[key])}</dd>`).join('')}
    <dt>Cost per accepted correct result (USD)</dt><dd>${escape(cost)}</dd></dl>
    <p>Token price is not task cost. Missing uncertainty is unknown. Protocol alignment does not establish significance.
    A robustness drop is not proof of training contamination. Benchmark outcomes, evaluator judgements and forecasts are separate;
    restricted research results do not establish generally available product capability.</p></details>`;
}

/** Descriptive invariant-pair check only: no significance or contamination claim.
 * Inputs must already be admitted public aggregate projections.
 */
export function robustnessComparison(original, perturbed) {
  const reasons = comparisonReasons(original, perturbed);
  for (const key of ['model', 'route']) {
    if (!knownControl(key, original?.[key]) || !knownControl(key, perturbed?.[key])) reasons.push(key + ': unknown');
    else if (original[key] !== perturbed[key]) reasons.push(key + ': incompatible');
  }
  if (perturbed?.perturbation !== 'invariant') reasons.push('perturbation: invariant required; task changes are not robustness pairs');
  if (!knownControl('equivalence', perturbed?.equivalence)) reasons.push('equivalence: validation unknown');
  if (!knownControl('pairing', perturbed?.pairing)) reasons.push('pairing: validation unknown');
  for (const [label, result] of [['original', original], ['perturbed', perturbed]]) {
    if (!Number.isSafeInteger(result?.sampleSize) || result.sampleSize <= 0) reasons.push(label + ' sample size: unknown');
    if (typeof result?.accuracy !== 'number' || !Number.isFinite(result.accuracy) || result.accuracy < 0 || result.accuracy > 1) reasons.push(label + ' accuracy: unknown');
  }
  if (Number.isSafeInteger(original?.sampleSize) && Number.isSafeInteger(perturbed?.sampleSize)
      && original.sampleSize !== perturbed.sampleSize) reasons.push('sampleSize: incompatible');
  return Object.freeze({ reasons: Object.freeze(reasons),
    delta: reasons.length ? null : perturbed.accuracy - original.accuracy });
}

/** Reusable disclosure for reviewed aggregate envelopes; no raw inputs are rendered.
 * Real export wiring remains subject to independent privacy and rights admission.
 */
export function renderRobustnessPanel({ original = null, perturbed = null, now = new Date() } = {}) {
  let left, right;
  try {
    left = admitMethod(original);
    right = admitMethod(perturbed);
  } catch {
    return '<details class="benchmark-method"><summary>Paired robustness method and limits</summary><p>Comparison unavailable: reviewed aggregate metadata missing or invalid.</p></details>';
  }
  const result = robustnessComparison(left, right);
  const reasons = [...result.reasons];
  if (original.kind !== perturbed.kind) reasons.push('measurement kind: incompatible');
  const outcome = reasons.length
    ? '<p>Comparison unavailable.</p><ul>' + reasons.map(reason => '<li>' + escape(reason) + '</li>').join('') + '</ul>'
    : '<p>Descriptive accuracy change (perturbed minus original): ' + escape(Number((result.delta * 100).toPrecision(4))) + ' percentage points. This is not a significance test.</p>';
  return '<details class="benchmark-method"><summary>Paired robustness method and limits</summary>'
    + (original.kind === 'synthetic' && perturbed.kind === 'synthetic' ? '<p>Synthetic example — not a model evaluation.</p>' : '')
    + outcome + '<h3>Original result</h3>' + (original.kind === 'synthetic' ? '<p>Synthetic example — not a model evaluation.</p>' : '') + renderMethodPanel({ model: left.model, method: left, now })
    + '<h3>Perturbed result</h3>' + (perturbed.kind === 'synthetic' ? '<p>Synthetic example — not a model evaluation.</p>' : '') + renderMethodPanel({ model: right.model, method: right, now })
    + '<p>Equivalence and pairing references require independent review. A drop is not proof of training contamination. Task changes are separate evaluations.</p></details>';
}
