/**
 * One record per studio article. Each article has its own file in src/data/studio/<slug>.ts that exports
 * `article: StudioArticle`. src/data/studio/index.ts lists them. The blog index, RSS and /transparency/
 * read from here, so a source or a sum is stated once and shown in both places.
 */
export interface StudioSource {
  /** Page title or document name. */
  title: string;
  url: string;
  /** Date the page was read, e.g. "14 November 2026". */
  checked: string;
  /** What this source is used for in the article, in one sentence. Paraphrase; at most one quote under 15 words. */
  claim: string;
  /** Licence or terms status in a few words, e.g. "CC BY 4.0", "public documentation", "terms review pending". */
  rights?: string;
}

export interface StudioArticle {
  slug: string;
  title: string;
  description: string;
  type: 'Analysis' | 'Explainer' | 'Comparison' | 'Beginner' | 'Essay' | 'News';
  readTime: string;
  /** ISO date. */
  date: string;
  /** Anchor on /transparency/ and the id DataNote links to. Must start with "calc-studio-". */
  id: string;
  /** The sum or method, written so a reader could redo it. "No calculation" if the piece makes none. */
  formula: string;
  /** What went in: the data file, snapshot date, and any assumed numbers (labelled as assumptions). */
  assumptions: string;
  /** What the numbers cannot tell you. */
  limits: string;
  sources: StudioSource[];
  /** Script that produces the frozen data, if the article has figures of its own. */
  code?: string;
  /** Frozen data file, if any, relative to the repo root. */
  frozen?: string;
}
