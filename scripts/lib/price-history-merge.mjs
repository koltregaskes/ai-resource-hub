/**
 * Hub #2121: the public price history records real price changes only.
 *
 * The hourly job reseeds SQLite on every run, so the seed, catalogue sync and
 * OpenRouter steps re-record every model's price each hour. Merging those rows
 * as they are filled the published history with one repeat row per model per
 * day. Instead, take each model's final row from this run and keep it only when
 * its input or output price differs from the latest row already published.
 */

function compareRows(a, b) {
  const byTime = String(a.recorded_at).localeCompare(String(b.recorded_at));
  if (byTime !== 0) return byTime;
  return Number(a.id ?? 0) - Number(b.id ?? 0);
}

function latestByModel(rows) {
  const latest = new Map();
  for (const row of rows) {
    const previous = latest.get(row.model_id);
    if (!previous || compareRows(row, previous) > 0) latest.set(row.model_id, row);
  }
  return latest;
}

export function selectChangedPriceRows(publishedRows, currentRunRows) {
  const published = latestByModel(publishedRows);
  const changed = [];
  for (const [modelId, row] of latestByModel(currentRunRows)) {
    const previous = published.get(modelId);
    if (!previous
      || Number(previous.input_price) !== Number(row.input_price)
      || Number(previous.output_price) !== Number(row.output_price)) {
      changed.push(row);
    }
  }
  return changed;
}
