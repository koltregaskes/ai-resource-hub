type VerificationCandidate = {
  notes?: string | null;
  status?: string | null;
};

const PUBLIC_MODEL_STATUSES = new Set(['active', 'tracking', 'preview']);
const DISCOVERY_ONLY_MARKER = 'awaiting official verification';
const DISCOVERY_NOTE_PATTERN =
  /Auto-tracked from OpenRouter discovery \([^)]*\); awaiting official verification\.\s*/gi;

export function isDiscoveryOnlyModel(model: VerificationCandidate): boolean {
  return (model.notes ?? '').toLowerCase().includes(DISCOVERY_ONLY_MARKER);
}

export function isPubliclyVerifiedModel(model: VerificationCandidate): boolean {
  return PUBLIC_MODEL_STATUSES.has((model.status ?? '').toLowerCase())
    && !isDiscoveryOnlyModel(model);
}

export function stripDiscoveryOnlyNote(notes: string | null | undefined): string | null {
  const cleaned = (notes ?? '').replace(DISCOVERY_NOTE_PATTERN, '').trim();
  return cleaned || null;
}
