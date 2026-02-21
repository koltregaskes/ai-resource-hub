import type { LLMModel } from '../types/models';
import fs from 'node:fs';
import path from 'node:path';

function parseCSV(csv: string): LLMModel[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    // Handle quoted fields containing commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = values[i] ?? '';
    });

    const inputPrice = parseFloat(record.inputPrice);
    const outputPrice = parseFloat(record.outputPrice);
    const qualityScore = parseFloat(record.qualityScore);

    // Value score: quality per dollar (using blended cost: 3:1 output:input ratio)
    const blendedCostPer1M = (inputPrice + 3 * outputPrice) / 4;
    const valueScore = blendedCostPer1M > 0
      ? Math.round((qualityScore / blendedCostPer1M) * 10)
      : 0;

    return {
      id: record.id,
      name: record.name,
      provider: record.provider,
      providerColour: record.providerColour,
      inputPrice,
      outputPrice,
      contextWindow: parseInt(record.contextWindow),
      maxOutput: parseInt(record.maxOutput),
      speed: parseInt(record.speed),
      qualityScore,
      valueScore,
      released: record.released,
      openSource: record.openSource === 'true',
      modality: record.modality.split(',').map((m) => m.trim()),
      apiAvailable: record.apiAvailable === 'true',
      notes: record.notes || undefined,
    };
  });
}

let _cachedModels: LLMModel[] | null = null;

export function getLLMModels(): LLMModel[] {
  if (_cachedModels) return _cachedModels;

  const csvPath = path.join(process.cwd(), 'data', 'llm-models.csv');
  const csv = fs.readFileSync(csvPath, 'utf-8');
  _cachedModels = parseCSV(csv);
  return _cachedModels;
}
