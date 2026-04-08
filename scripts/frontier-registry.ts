import { getFrontierRequirements } from './model-catalog';

export type { FrontierModelRequirement } from './model-catalog';

/**
 * Current must-track frontier models.
 *
 * This remains a hard gate for the publish pipeline, but the underlying
 * source of truth now lives in the shared model catalog so OpenRouter
 * discovery, official pricing, and freshness checks all stay aligned.
 */
export const REQUIRED_FRONTIER_MODELS = getFrontierRequirements();
