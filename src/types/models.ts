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
  qualityScore: number;     // 0-100 composite benchmark score
  valueScore: number;       // computed: quality / cost ratio
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
  format: (value: number | string) => string;
  align?: 'left' | 'right';
  defaultSort?: SortDirection;
}
