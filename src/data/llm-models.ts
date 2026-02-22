/**
 * Data access layer for LLM models.
 * Reads from SQLite database at Astro build time.
 */
import { getLLMModelsFromDB } from '../db/queries';
import type { LLMModel } from '../types/models';

let _cachedModels: LLMModel[] | null = null;

export function getLLMModels(): LLMModel[] {
  if (_cachedModels) return _cachedModels;
  _cachedModels = getLLMModelsFromDB();
  return _cachedModels;
}
