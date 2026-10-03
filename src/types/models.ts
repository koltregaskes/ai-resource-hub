export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  providerColour: string;
  inputPrice: number;       // USD per 1M tokens
  outputPrice: number;      // USD per 1M tokens
  contextWindow: number;    // tokens
  maxOutput: number;        // tokens
  speed: number;            // tokens per second (output)
  ttft: number;             // time to first token (ms)
  qualityScore: number | null; // suppressed until model-level method/source/date are traceable
  valueScore: number | null;   // suppressed with the untraceable quality score
  qualityScoreState: 'suppressed_untraceable';
  qualityScoreMethod: null;
  qualityScoreMeasuredAt: null;
  qualityScoreSourceUrls: string[];
  qualityScoreEvidenceCount: number;
  released: string;         // ISO date string
  openSource: boolean;
  modality: string[];       // e.g. ['text', 'vision', 'audio']
  apiAvailable: boolean;
  notes?: string;
}

export type SortField = keyof Pick<
  LLMModel,
  'name' | 'provider' | 'inputPrice' | 'outputPrice' | 'contextWindow' | 'speed' | 'qualityScore' | 'valueScore'
>;

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface ColumnDef {
  field: SortField;
  label: string;
  shortLabel?: string;
  format: (value: number | string | null) => string;
  align?: 'left' | 'right';
  defaultSort?: SortDirection;
}
