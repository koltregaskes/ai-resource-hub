import { getEvents } from '../db/pg-cache';

export interface ReportEntry {
  id: string;
  title: string;
  organisation: string;
  cadence: string;
  focus: string;
  whyItMatters: string;
  bestFor: string;
  url: string;
}

export interface EventEntry {
  id: string;
  name: string;
  organiser: string;
  timing: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  city?: string;
  country?: string;
  venue?: string;
  status: 'confirmed' | 'tbc' | 'series';
  category: string;
  tags: string[];
  focus: string;
  whyWatch: string;
  url: string;
  updatedAt?: string;
}

export const recurringReports: ReportEntry[] = [
  {
    id: 'stanford-ai-index',
    title: 'AI Index',
    organisation: 'Stanford HAI',
    cadence: 'Annual',
    focus: 'Industry, research, investment, policy, labour, and education',
    whyItMatters: 'One of the most useful broad reality-check reports because it combines technical progress with economic and labour data.',
    bestFor: 'Big-picture market context and grounded charts',
    url: 'https://hai.stanford.edu/ai-index',
  },
  {
    id: 'mckinsey-state-of-ai',
    title: 'The State of AI',
    organisation: 'McKinsey',
    cadence: 'Annual',
    focus: 'Enterprise adoption, business value, deployment patterns, and executive sentiment',
    whyItMatters: 'Useful for separating public AI hype from what larger organisations are actually deploying.',
    bestFor: 'Enterprise adoption and operating-model signals',
    url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
  },
  {
    id: 'pwc-ai-jobs-barometer',
    title: 'AI Jobs Barometer',
    organisation: 'PwC',
    cadence: 'Annual',
    focus: 'Labour demand, skills, productivity, and wage signals linked to AI',
    whyItMatters: 'One of the clearest recurring labour-market views for checking whether AI hiring claims line up with real job-market data.',
    bestFor: 'Employment and skills trends',
    url: 'https://www.pwc.com/gx/en/issues/artificial-intelligence/ai-jobs-barometer.html',
  },
  {
    id: 'state-of-ai-report',
    title: 'State of AI Report',
    organisation: 'Air Street Capital',
    cadence: 'Annual',
    focus: 'Frontier-model landscape, funding, open-source momentum, and strategic market shifts',
    whyItMatters: 'Strong at synthesising market structure and competitive movement across labs, startups, and open models.',
    bestFor: 'Strategic market snapshots and slide-friendly charts',
    url: 'https://www.stateof.ai/',
  },
  {
    id: 'epoch-notable-models',
    title: 'Notable AI Models',
    organisation: 'Epoch AI',
    cadence: 'Continuously updated',
    focus: 'Model timelines, compute, parameter counts, and historical trend data',
    whyItMatters: 'A useful factual backbone for tracking long-run model growth without relying on social-media summaries.',
    bestFor: 'Model-history charts and technical scaling context',
    url: 'https://epoch.ai/data/notable-ai-models',
  },
  {
    id: 'oecd-ai-policy-observatory',
    title: 'OECD AI Policy Observatory',
    organisation: 'OECD',
    cadence: 'Ongoing',
    focus: 'Policy tracking, national AI initiatives, and public-sector measures',
    whyItMatters: 'Helpful when the story is regulation, national strategy, or policy movement rather than model launches.',
    bestFor: 'Policy and government tracking',
    url: 'https://oecd.ai/',
  },
  {
    id: 'helm',
    title: 'HELM Benchmarking',
    organisation: 'Stanford CRFM',
    cadence: 'Ongoing',
    focus: 'Holistic model evaluation across scenarios, tradeoffs, and benchmark methodology',
    whyItMatters: 'Important when a reader wants nuance around evaluation quality rather than just a single headline score.',
    bestFor: 'Benchmark methodology and model-quality context',
    url: 'https://crfm.stanford.edu/helm/',
  },
  {
    id: 'artificial-analysis',
    title: 'Artificial Analysis',
    organisation: 'Artificial Analysis',
    cadence: 'Frequent',
    focus: 'Model quality, speed, price, and arena-style comparisons',
    whyItMatters: 'Closer to an operating dashboard than a yearly report, and very useful for keeping current comparisons grounded.',
    bestFor: 'Fast-moving model and provider comparisons',
    url: 'https://artificialanalysis.ai/',
  },
];

export const recurringEvents: EventEntry[] = [
  {
    id: 'aaai-2026',
    name: 'AAAI-26',
    organiser: 'Association for the Advancement of Artificial Intelligence',
    timing: '20-27 Jan 2026',
    startDate: '2026-01-20',
    endDate: '2026-01-27',
    timezone: 'Asia/Singapore',
    city: 'Singapore',
    country: 'Singapore',
    venue: 'Singapore EXPO',
    status: 'confirmed',
    category: 'Research conference',
    tags: ['research', 'industry', 'agents', 'conference'],
    focus: 'Broad AI research, applications, tutorials, demos, and industry participation',
    whyWatch: 'A strong early-year checkpoint for broad AI research and applied systems.',
    url: 'https://aaai.org/conference/aaai/aaai-26/',
  },
  {
    id: 'iclr-2026',
    name: 'ICLR 2026',
    organiser: 'International Conference on Learning Representations',
    timing: '23-27 Apr 2026',
    startDate: '2026-04-23',
    endDate: '2026-04-27',
    timezone: 'America/Sao_Paulo',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    venue: 'Riocentro Convention and Event Center',
    status: 'confirmed',
    category: 'Research conference',
    tags: ['research', 'foundation-models', 'deep-learning', 'conference'],
    focus: 'Representation learning, foundation models, and fast-moving deep learning research',
    whyWatch: 'Often one of the earliest clear looks at new model directions and methods each year.',
    url: 'https://iclr.cc/Conferences/FutureMeetings',
  },
  {
    id: 'icml-2026',
    name: 'ICML 2026',
    organiser: 'International Machine Learning Society',
    timing: '6-11 Jul 2026',
    startDate: '2026-07-06',
    endDate: '2026-07-11',
    timezone: 'Asia/Seoul',
    city: 'Seoul',
    country: 'South Korea',
    venue: 'COEX Convention & Exhibition Center',
    status: 'confirmed',
    category: 'Research conference',
    tags: ['research', 'machine-learning', 'conference'],
    focus: 'Machine learning research, methods, systems, and empirical findings',
    whyWatch: 'Useful for watching what is gaining traction in mainstream ML research before it becomes product marketing.',
    url: 'https://icml.cc/Conferences/2026',
  },
  {
    id: 'neurips-2026',
    name: 'NeurIPS 2026',
    organiser: 'Neural Information Processing Systems Foundation',
    timing: '6-12 Dec 2026',
    startDate: '2026-12-06',
    endDate: '2026-12-12',
    timezone: 'Australia/Sydney',
    city: 'Sydney',
    country: 'Australia',
    venue: 'International Convention Centre',
    status: 'confirmed',
    category: 'Research conference',
    tags: ['research', 'benchmarks', 'foundation-models', 'conference'],
    focus: 'Frontier machine learning research, papers, workshops, and benchmark discussion',
    whyWatch: 'One of the core annual checkpoints for serious ML research and direction of travel.',
    url: 'https://neurips.cc/Conferences/2026',
  },
  {
    id: 'wwdc-2026',
    name: 'WWDC26',
    organiser: 'Apple',
    timing: '8-12 Jun 2026',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    timezone: 'America/Los_Angeles',
    city: 'Cupertino / online',
    country: 'United States',
    venue: 'Apple Park kickoff plus online sessions',
    status: 'confirmed',
    category: 'Major tech conference',
    tags: ['major-tech', 'developer', 'platform', 'conference'],
    focus: 'Developer tooling, platform launches, design systems, and ecosystem changes',
    whyWatch: 'Not AI-only, but still important when AI features land inside mainstream developer platforms and products.',
    url: 'https://developer.apple.com/wwdc26/index.html',
  },
  {
    id: 'google-io',
    name: 'Google I/O',
    organiser: 'Google',
    timing: 'Date TBC',
    status: 'tbc',
    category: 'Major tech conference',
    tags: ['major-tech', 'developer', 'google', 'conference'],
    focus: 'Platform launches, Gemini product direction, developer tooling, and ecosystem updates',
    whyWatch: 'A major signal source for Google AI tooling, model products, and developer-facing launches.',
    url: 'https://developers.google.com/events',
  },
  {
    id: 'google-build-with-ai',
    name: 'Build with AI',
    organiser: 'Google for Developers',
    timing: 'Series / regional dates',
    status: 'series',
    category: 'AI Dev Day',
    tags: ['ai-dev-day', 'developer', 'google', 'series'],
    focus: 'Hands-on developer sessions, Gemini tooling, and practical build workflows',
    whyWatch: 'Useful because these events often show what Google is actively pushing developers to build right now.',
    url: 'https://developers.google.com/events',
  },
  {
    id: 'google-cloud-next',
    name: 'Google Cloud Next',
    organiser: 'Google Cloud',
    timing: 'Date TBC',
    status: 'tbc',
    category: 'Industry conference',
    tags: ['industry', 'cloud', 'enterprise', 'conference'],
    focus: 'Enterprise AI, cloud infrastructure, agents, developer workflows, and customer stories',
    whyWatch: 'Strong signal for commercial AI deployment patterns and infrastructure messaging.',
    url: 'https://developers.google.com/events',
  },
  {
    id: 'nvidia-gtc',
    name: 'NVIDIA GTC',
    organiser: 'NVIDIA',
    timing: 'Usually spring with additional editions',
    status: 'series',
    category: 'Industry conference',
    tags: ['industry', 'infrastructure', 'chips', 'developer', 'conference'],
    focus: 'Infrastructure, chips, enterprise AI, robotics, and developer platform launches',
    whyWatch: 'A major signal source for AI infrastructure and commercial deployment direction.',
    url: 'https://www.nvidia.com/gtc/',
  },
  {
    id: 'world-summit-ai',
    name: 'World Summit AI',
    organiser: 'InspiredMinds',
    timing: 'Multiple editions each year',
    status: 'series',
    category: 'Industry conference',
    tags: ['industry', 'executive', 'summit', 'conference'],
    focus: 'Commercial AI strategy, product launches, and executive or operator conversations',
    whyWatch: 'Good for demand-side and business-use-case signals outside pure research circles.',
    url: 'https://worldsummit.ai/',
  },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDateOnly(value: string | null): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return undefined;

  // Postgres date-only values are currently serialised through the UK runtime
  // as timestamps. Recover the intended civil date without shifting BST rows
  // back to the previous day.
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(parsed);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const year = part('year');
  const month = part('month');
  const day = part('day');
  return year && month && day ? `${year}-${month}-${day}` : undefined;
}

function formatTiming(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Date TBC';

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  if (!endDate || startDate === endDate) {
    return `${startDay} ${MONTH_NAMES[startMonth - 1]} ${startYear}`;
  }

  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}-${endDay} ${MONTH_NAMES[startMonth - 1]} ${startYear}`;
  }
  return `${startDay} ${MONTH_NAMES[startMonth - 1]}-${endDay} ${MONTH_NAMES[endMonth - 1]} ${endYear}`;
}

function eventLocation(location: string | null, seed?: EventEntry): Pick<EventEntry, 'city' | 'country'> {
  if (!location) return { city: seed?.city, country: seed?.country };

  const separator = location.lastIndexOf(',');
  if (separator !== -1) {
    return {
      city: location.slice(0, separator).trim(),
      country: location.slice(separator + 1).trim(),
    };
  }

  if (seed?.country?.toLowerCase() === location.toLowerCase()) {
    return { city: seed.city, country: seed.country };
  }

  return { city: location, country: seed?.country };
}

function humaniseCategory(category: string): string {
  return category
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Return the Postgres-backed event set used by the public events page.
 * Static entries supply richer editorial metadata for matching records only;
 * they are a fallback only when no exported cache is available.
 */
export function getRecurringEvents(): EventEntry[] {
  const cachedEvents = getEvents();
  if (cachedEvents.length === 0) return recurringEvents;

  const staticById = new Map(recurringEvents.map((event) => [event.id, event]));

  return cachedEvents.map((cached) => {
    const seed = staticById.get(cached.id);
    const startDate = toDateOnly(cached.date_start);
    const endDate = toDateOnly(cached.date_end);
    const location = eventLocation(cached.location, seed);
    const category = seed?.category ?? humaniseCategory(cached.category);
    const description = cached.description?.trim();
    const status: EventEntry['status'] = startDate
      ? 'confirmed'
      : cached.recurring || seed?.status === 'series'
        ? 'series'
        : 'tbc';

    return {
      id: cached.id,
      name: cached.name,
      organiser: seed?.organiser ?? cached.name,
      timing: startDate ? formatTiming(startDate, endDate) : seed?.timing ?? 'Date TBC',
      startDate,
      endDate,
      timezone: seed?.timezone,
      city: location.city,
      country: location.country,
      venue: seed?.venue,
      status,
      category,
      tags: seed?.tags ?? [cached.category.replace(/_/g, '-'), status === 'series' ? 'series' : 'conference'],
      focus: description ?? seed?.focus ?? `Official updates and schedule changes for ${cached.name}`,
      whyWatch: seed?.whyWatch ?? description ?? `${cached.name} is tracked in the AI Resource Hub event database.`,
      url: cached.url,
      updatedAt: cached.updated_at ?? undefined,
    };
  });
}
