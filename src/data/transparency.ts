/**
 * Data behind /transparency/.
 *
 * One entry per data source and one per calculation. When a collector, a
 * source's terms or a formula changes, change it here in the same pull request.
 * `reviewed` is the date a person or agent last checked the entry against the
 * code and the source, not the date the data last refreshed (the page reads
 * refresh times from the scrape log at build time).
 *
 * The Artificial Analysis and Arena entries mirror src/data/source-policy.ts
 * (the blocked-source list added for hub #1569). Once that file is on main,
 * read their reason, terms URL and checked date from it instead of repeating
 * them here.
 */

export type SourceState =
  | 'live' // fetched automatically from the source on a schedule
  | 'hand-entered' // typed in from the source's own page; only as fresh as the last manual check
  | 'stale' // shown on the site but known to be out of date
  | 'on-hold' // being switched off while we settle the source's terms
  | 'removed' // blocked in src/data/source-policy.ts: no longer collected or shown
  | 'not-collected'; // credited or linked on the site, but no data is taken

export type TermsStatus = 'open-licence' | 'public-api' | 'not-reviewed' | 'restricted' | 'own-data';

export interface TransparencySource {
  id: string;
  name: string;
  url: string;
  /** What we take from it, in plain words. */
  takes: string;
  /** How it gets from the source to the page. */
  how: string;
  /** Collector name as it appears in the scrape log, if any. */
  collector?: string;
  cadence: string;
  state: SourceState;
  terms: TermsStatus;
  termsNote: string;
  /** Pages that show this data. */
  shownOn: string[];
  caveat?: string;
  /**
   * Wording to use once the source is listed in src/data/source-policy.ts
   * (BLOCKED_DATA_SOURCES). The page switches to it automatically, and takes
   * the terms reason, link and checked date from that file.
   */
  whenBlocked?: { how: string; caveat: string };
  reviewed: string;
}

export const REVIEWED = '2026-11-14';

export const sources: TransparencySource[] = [
  {
    id: 'openrouter-models',
    name: 'OpenRouter models API',
    url: 'https://openrouter.ai/api/v1/models',
    takes:
      'Input and output price per million tokens, context window, maximum output, modality and the date the model was first listed.',
    how: 'One request to the public API each run. Prices arrive per token and are multiplied by one million, then rounded to three decimal places. Free, batch and other routing variants are skipped.',
    collector: 'pricing:openrouter',
    cadence: 'Hourly',
    state: 'live',
    terms: 'public-api',
    termsNote:
      "Terms review pending. It is a public API that needs no key, and we found no data licence covering it when we read OpenRouter's Terms of Service (last updated 31 August 2026) on 14 November 2026. Those terms bar scraping the website by automated means; we use only the API.",
    shownOn: ['Model pages', 'Compare', 'Cheapest', 'Context window', 'Pricing trends'],
    caveat:
      'The price is the cheapest host OpenRouter lists for that model, which can be lower than the lab\'s own list price. For these models the "released" date is the day OpenRouter listed the model, not the lab\'s announcement date. About three quarters of the language models in the catalogue get their price this way.',
    reviewed: REVIEWED,
  },
  {
    id: 'official-pricing',
    name: "Labs' own pricing pages",
    url: 'https://openai.com/api/pricing/',
    takes: 'List prices for input and output tokens for the models each lab sells directly.',
    how: 'Typed in by hand from each lab\'s pricing page into our model catalogue, then copied into the database on every run. Nothing is scraped from these pages.',
    collector: 'official-pricing',
    cadence: 'When someone re-checks the page',
    state: 'hand-entered',
    terms: 'own-data',
    termsNote: 'Published list prices, quoted with a link to the lab\'s page.',
    shownOn: ['Model pages', 'Compare', 'Calculator'],
    caveat:
      'The "pricing updated" time on these rows is the time of the last run, not the last time a person checked the lab\'s page. A price can therefore look fresh and still be out of date. This is a known fault.',
    reviewed: REVIEWED,
  },
  {
    id: 'model-catalogue',
    name: 'Our model catalogue',
    url: 'https://github.com/koltregaskes/ai-resource-hub/blob/main/scripts/model-catalog.ts',
    takes: 'Which models and providers exist, their names, release dates, lifecycle status and links to official documentation.',
    how: 'Maintained by hand from official announcements and documentation. New paid models from watched providers are also added automatically when OpenRouter lists them, with the status "tracking".',
    collector: 'catalog:sync',
    cadence: 'Hourly sync of a hand-maintained file',
    state: 'hand-entered',
    terms: 'own-data',
    termsNote: 'Our own compilation.',
    shownOn: ['Models', 'Labs', 'New releases'],
    caveat:
      'Coverage follows what we have added and what OpenRouter lists. It is strongest for the large US labs and thinner elsewhere. The open-source flag is unreliable for automatically added models, so we do not publish open-versus-closed statistics yet.',
    reviewed: REVIEWED,
  },
  {
    id: 'benchmark-seed',
    name: 'Benchmark scores entered by hand',
    url: 'https://github.com/koltregaskes/ai-resource-hub/blob/main/scripts/seed-db.ts',
    takes: 'Scores on public benchmarks, mostly as reported in lab announcements, model cards and papers. The set also holds older arena ratings, which are covered under Arena below.',
    how: 'Typed in by hand. The set is rebuilt from the same file on every run.',
    cadence: 'When someone adds or corrects a score',
    state: 'hand-entered',
    terms: 'own-data',
    termsNote: 'Figures quoted from the publishing lab. Each should link to where it was published.',
    shownOn: ['Benchmarks', 'Leaderboard', 'Model pages'],
    caveat:
      "Of {benchmarkTotal} scores, {benchmarkNoLink} have no source link recorded yet. Scores without a traceable source are held back from rankings until the link is added. A lab's own score is a claim by that lab, not an independent test.",
    reviewed: REVIEWED,
  },
  {
    id: 'artificial-analysis',
    name: 'Artificial Analysis',
    url: 'https://artificialanalysis.ai/',
    takes: 'Output speed (tokens per second), time to first token, and arena ratings for image, video and voice models.',
    how: 'On each run the collector tries the Artificial Analysis API. Without an API key it falls back to a fixed list recorded between 15 January and 20 February 2026, saves those figures again and logs the run as a success. Every speed figure on the site today comes from that fixed list.',
    collector: 'speed, creative-benchmarks',
    cadence: 'Runs hourly, but the figures do not change',
    state: 'on-hold',
    terms: 'restricted',
    termsNote:
      "On 14 November 2026 we read Artificial Analysis's Data Platform Terms (revised 19 August 2026). Section 2.5 bars use of its data in ranking or comparison products without written consent, and its Terms of Use bar automated requests to the site. We are removing these figures from the site until we have permission or a licensed alternative.",
    shownOn: ['Speed', 'Fastest', 'Creative model ratings'],
    caveat:
      'These numbers are about nine months old and should not be read as current. No article on this site is built on them.',
    whenBlocked: {
      how: 'No longer collected. Its figures are dropped before any page, export or score is built.',
      caveat: 'Speed and creative arena figures from this source have been removed from the site. No article on this site is built on them.',
    },
    reviewed: REVIEWED,
  },
  {
    id: 'arena',
    name: 'Arena (formerly LMArena and LMSYS Chatbot Arena)',
    url: 'https://arena.ai/',
    takes: 'Arena Elo ratings for language models.',
    how: 'A set of ratings entered by hand in the past. The collector still tries to fetch new ratings on each run; on the last recorded run it fell back and wrote none.',
    collector: 'benchmarks:chatbot-arena',
    cadence: 'Runs hourly; the last run wrote nothing',
    state: 'on-hold',
    terms: 'restricted',
    termsNote:
      "On 14 November 2026 we read the Arena Terms of Use (updated 23 February 2026). They bar programmatic access, manual or automated extraction of data, and reproduction of the service's output. We are removing these ratings from the site and from our composite scores.",
    shownOn: ['Benchmarks', 'Leaderboard'],
    caveat: 'No article on this site is built on Arena ratings.',
    whenBlocked: {
      how: 'No longer collected. Its ratings are dropped before any page, export or score is built.',
      caveat: 'Arena ratings have been removed from the site and from our composite scores. No article on this site is built on them.',
    },
    reviewed: REVIEWED,
  },
  {
    id: 'jobs',
    name: 'Company job boards (Greenhouse and Lever)',
    url: 'https://boards-api.greenhouse.io/',
    takes: 'Open roles at AI companies: title, team, location, workplace type and posting date.',
    how: 'The public job-board API each company uses for its own careers page.',
    collector: 'jobs',
    cadence: 'Hourly',
    state: 'live',
    terms: 'not-reviewed',
    termsNote: 'Public job-board APIs built for listing a company\'s roles. A written terms review is still to do.',
    shownOn: ['Jobs'],
    caveat:
      'Six companies are collected today. The feeds for Google DeepMind, Mistral, Runway and Wayve are returning nothing, so their roles are missing. We do not publish hiring statistics until those are fixed and we have more than one snapshot.',
    reviewed: REVIEWED,
  },
  {
    id: 'status-pages',
    name: 'Provider status pages',
    url: 'https://status.openai.com/',
    takes: 'Current service status and recent incidents for the main model providers.',
    how: 'Each provider\'s public status feed (Statuspage JSON or RSS).',
    cadence: 'Hourly',
    state: 'live',
    terms: 'public-api',
    termsNote: 'Public status feeds published for this purpose.',
    shownOn: ['Status'],
    reviewed: REVIEWED,
  },
  {
    id: 'news',
    name: 'News feeds',
    url: 'https://github.com/koltregaskes/ai-resource-hub/blob/main/docs/repo-reference/source-registry.md',
    takes: 'Headlines, links and short summaries from lab blogs, research feeds and technology news sites.',
    how: 'Two routes. The collector in this repository fetches seven feeds (OpenAI, Anthropic, Google, TechCrunch, VentureBeat, The Verge and Ars Technica). A shared news pipeline, used by several of our sites, is configured with 14 sources and supplies the rest. We link to the original and never republish full articles. Lab sources are treated as primary; media sources are cross-checked before a story is promoted.',
    collector: 'news:rss',
    cadence: 'Hourly',
    state: 'live',
    terms: 'public-api',
    termsNote: 'Feeds published for syndication. Headline, link and a short summary only.',
    shownOn: ['News', 'Daily digest', 'Newsletter'],
    caveat: 'The last-run time shown here is for the seven-feed collector only. It says nothing about the health of the shared pipeline. Some feeds rate-limit us from time to time, so a source can be missing from a given run.',
    reviewed: REVIEWED,
  },
  {
    id: 'subscription-plans',
    name: 'Consumer subscription plans',
    url: 'https://www.anthropic.com/pricing',
    takes: 'Monthly prices and usage limits for consumer AI plans.',
    how: 'Typed in by hand from each provider\'s pricing page.',
    cadence: 'When someone re-checks the page',
    state: 'stale',
    terms: 'own-data',
    termsNote: 'Published list prices.',
    shownOn: ['Compare plans'],
    caveat: 'These rows have not been re-checked recently and at least one source link points at the wrong page. Do not rely on them until this entry changes.',
    reviewed: REVIEWED,
  },
  {
    id: 'events',
    name: 'AI events calendar',
    url: 'https://github.com/koltregaskes/ai-resource-hub/blob/main/scripts/scrapers/events.ts',
    takes: 'Names, dates and locations of major AI conferences.',
    how: 'Entered by hand from each event\'s official site. An automatic check confirms each event page still loads.',
    cadence: 'When events are announced',
    state: 'hand-entered',
    terms: 'own-data',
    termsNote: 'Facts from official event pages, with links.',
    shownOn: ['Events'],
    reviewed: REVIEWED,
  },
  {
    id: 'epoch',
    name: 'Epoch AI',
    url: 'https://epoch.ai/data',
    takes: 'Nothing yet.',
    how: 'We link to Epoch\'s research and plan to use its capability and company datasets, which are published under CC BY 4.0. No Epoch figures are on the site today.',
    cadence: 'Not collected',
    state: 'not-collected',
    terms: 'open-licence',
    termsNote: 'CC BY 4.0, with attribution to epoch.ai/data.',
    shownOn: [],
    reviewed: REVIEWED,
  },
];

export interface Calculation {
  /** Anchor id on the page. Articles link to /transparency/#<id>. */
  id: string;
  name: string;
  /** Plain-English statement of what the number means. */
  meaning: string;
  formula: string;
  inputs: string;
  /** Path of the code that implements it, relative to the repo root. */
  code: string;
  usedOn: string;
  limits: string;
  /** An extra sentence for `limits` that depends on whether a source is blocked in src/data/source-policy.ts. */
  blockNote?: { source: string; pending: string; done: string };
  group: 'articles' | 'site';
}

export const calculations: Calculation[] = [
  {
    id: 'calc-context-median',
    group: 'articles',
    name: 'Median context window of new models, by half-year',
    meaning: 'The middle context window among language models first listed in each six-month period.',
    formula:
      'Take every language model with a release date and a context window. Remove variants. Group by half-year of release (H1 is January to June, H2 is July to December). Report the median of each group. Growth multiple = median of the latest group ÷ median of the earliest group with at least 10 models.',
    inputs: 'Context window and release date from the model catalogue (mostly the OpenRouter models API).',
    code: 'scripts/insights/compute-insights.mjs',
    usedOn: 'Data articles on context windows.',
    limits:
      'For most models the release date is the day OpenRouter listed it. Groups with fewer than 10 models are left out of the headline. The catalogue is not every model ever released, so this describes the models we track.',
  },
  {
    id: 'calc-variant-rule',
    group: 'articles',
    name: 'Removing variants',
    meaning: 'Leaves out catalogue entries whose names mark them as a dated snapshot or a fast tier, so that the same model is less likely to be counted more than once.',
    formula:
      'A catalogue entry is a variant if its id ends in a date stamp (-MMDD, -YYMM, -YYYYMMDD or -YYYY-MM-DD) or in -fast. Variants are dropped before any count or median.',
    inputs: 'Catalogue ids.',
    code: 'scripts/insights/compute-insights.mjs',
    usedOn: 'Every figure in the data articles.',
    limits:
      'A simple naming rule, not a check that another entry for the same model exists: it can drop a "-fast" entry that has no standard sibling in the catalogue. It removes 23 of 291 language-model entries in the 14 November 2026 snapshot. Point releases with their own name (for example 5.4 and 5.5) still count separately.',
  },
  {
    id: 'calc-price-spread',
    group: 'articles',
    name: 'Price spread',
    meaning: 'How many times dearer the most expensive model is than the cheapest, per million output tokens.',
    formula: 'Highest output price ÷ lowest output price, across language models with the status "active" and a price above zero, variants removed.',
    inputs: 'Output price per million tokens from the model catalogue.',
    code: 'scripts/insights/compute-insights.mjs',
    usedOn: 'Data articles on pricing.',
    limits:
      'The cheap end is the cheapest host on OpenRouter, not a lab\'s list price. The dear end is a lab\'s list price. Free models are excluded. Both ends were re-checked against OpenRouter\'s live API on the snapshot date.',
  },
  {
    id: 'calc-output-input-ratio',
    group: 'articles',
    name: 'Output-to-input price ratio',
    meaning: 'How many times more a model charges for a token it writes than for a token it reads.',
    formula: 'Output price ÷ input price for each model, then the median of those ratios for models first listed in each half-year, variants removed.',
    inputs: 'Input and output price per million tokens from the model catalogue.',
    code: 'scripts/insights/compute-insights.mjs',
    usedOn: 'Data articles on pricing and agents.',
    limits:
      'Uses today\'s prices grouped by release period, not the price on launch day. A few rows have extreme ratios that look like data errors; the median is not moved by them.',
  },
  {
    id: 'calc-blended-price',
    group: 'site',
    name: 'Blended price',
    meaning: 'A single price per million tokens that assumes a typical job reads one part and writes three.',
    formula: '(input price + 3 × output price) ÷ 4',
    inputs: 'Input and output price per million tokens.',
    code: 'src/data/hub-dashboard.ts',
    usedOn: 'Best value, Cheapest, model pages.',
    limits: 'The 1:3 mix is a convention. Chat with long documents reads far more than it writes, so the blended price overstates the cost of that kind of work.',
  },
  {
    id: 'calc-price-change',
    group: 'site',
    name: 'Price change',
    meaning: 'The percentage move between two consecutive price records for one model.',
    formula: '(new blended price − previous blended price) ÷ previous blended price × 100',
    inputs: 'Consecutive rows of our price history.',
    code: 'src/pages/models/[id].astro',
    usedOn: 'Model pages, Pricing trends.',
    limits:
      'The history mixes sources. A switch from a lab\'s list price to OpenRouter\'s cheapest host shows up as a price move when nothing changed. We do not publish "how often prices change" figures until the history is rebuilt on one source per model.',
  },
  {
    id: 'calc-benchmark-normalisation',
    group: 'site',
    name: 'Benchmark score on a 0 to 100 scale',
    meaning: 'Puts benchmarks with different scales on one scale so they can be combined.',
    formula: '(score − scale minimum) ÷ (scale maximum − scale minimum) × 100, flipped for benchmarks where lower is better, then limited to the range 0 to 100.',
    inputs: 'The score and each benchmark\'s stated scale.',
    code: 'src/data/hub-dashboard.ts',
    usedOn: 'Leaderboard, Benchmarks.',
    limits: 'Depends on the scale limits we set for each benchmark.',
  },
  {
    id: 'calc-composite',
    group: 'site',
    name: 'Evaluated composite score',
    meaning: 'One score per model from the benchmarks we hold for it, marked down when the evidence is thin.',
    formula:
      'Benchmark score = sum of (normalised score × benchmark weight) ÷ sum of the weights covered. Composite = benchmark score × (0.7 + 0.3 × coverage factor) × evidence factor. Coverage factor = the share of total benchmark weight covered ÷ 0.55, capped at 1. Evidence factor = 1.00 for seven or more scores, 0.98 for six, 0.96 for five, 0.93 for four, 0.88 for three, 0.82 for two. A model needs at least two benchmarks to be scored.',
    inputs: 'Normalised benchmark scores and benchmark weights.',
    code: 'src/data/hub-dashboard.ts',
    usedOn: 'Leaderboard.',
    limits:
      "Only as good as the scores underneath, most of which are labs' own claims and many of which lack a source link today.",
    blockNote: {
      source: 'arena',
      pending: 'Arena ratings still count towards this score today and are being removed.',
      done: 'Arena ratings no longer count towards this score.',
    },
  },
  {
    id: 'calc-value-score',
    group: 'site',
    name: 'Value score',
    meaning: 'Benchmark performance per dollar.',
    formula: 'Benchmark score ÷ blended price × 10, rounded to a whole number. Zero when there is no price.',
    inputs: 'Benchmark score and blended price.',
    code: 'src/data/hub-dashboard.ts',
    usedOn: 'Best value.',
    limits: 'Inherits every limit of the benchmark score and the blended price.',
  },
  {
    id: 'calc-freshness',
    group: 'site',
    name: 'Freshness score',
    meaning: 'A simple age band for a model.',
    formula: 'Days since release: up to 30 = 100, up to 75 = 95, up to 120 = 90, up to 180 = 82, up to 270 = 68, up to 365 = 55, up to 540 = 40, older = 24, no date = 35.',
    inputs: 'Release date.',
    code: 'src/data/hub-dashboard.ts',
    usedOn: 'Leaderboard.',
    limits: 'Age is not quality. The release date carries the caveat described under the OpenRouter source.',
  },
  {
    id: 'calc-reliability-floor',
    group: 'site',
    name: 'Reliability floor',
    meaning: 'A score that cannot be carried by one strong area if a critical area is weak.',
    formula:
      'Each dimension score is the mean of its normalised source scores. Floor = the lower of (the weighted average of all scored dimensions) and (the weakest critical dimension + 10). A model is only ranked when every critical dimension has a score.',
    inputs: 'Normalised scores grouped into reliability dimensions.',
    code: 'src/data/reliability-floor.ts',
    usedOn: 'Reliability floor.',
    limits: 'Few models have evidence in every critical dimension, so most are unranked.',
  },
  {
    id: 'calc-staleness',
    group: 'site',
    name: 'Staleness rules',
    meaning: 'When we stop treating a figure as current.',
    formula:
      'A price is flagged when it is more than 48 hours old. An active model is moved to "tracking" when its price is more than 30 days old and it was released more than 30 days ago. A speed figure is withdrawn when it is more than 30 days old.',
    inputs: 'The time each figure was last written.',
    code: 'scripts/check-staleness.ts, scripts/normalize-model-registry.ts',
    usedOn: 'Across the site.',
    limits:
      'These rules read the time a figure was last written. For hand-entered prices that time is refreshed on every run, so the rules do not catch them. This is a known fault.',
    blockNote: {
      source: 'artificial-analysis',
      pending: 'The fixed speed list has the same fault, so the 30-day speed rule never fires.',
      done: 'Speed figures are no longer shown, so the speed rule has nothing to act on.',
    },
  },
];

export const stateLabels: Record<SourceState, { label: string; tone: 'good' | 'warn' | 'bad' | 'muted' }> = {
  live: { label: 'Collected automatically', tone: 'good' },
  'hand-entered': { label: 'Entered by hand', tone: 'warn' },
  stale: { label: 'Out of date', tone: 'bad' },
  'on-hold': { label: 'Being removed', tone: 'bad' },
  removed: { label: 'Removed from the site', tone: 'muted' },
  'not-collected': { label: 'Not collected yet', tone: 'muted' },
};

export const termsLabels: Record<TermsStatus, string> = {
  'open-licence': 'Open licence',
  'public-api': 'Public API or feed',
  'not-reviewed': 'Review pending',
  restricted: 'Terms restrict our use',
  'own-data': 'Published facts, quoted with a link',
};
