export type AiMilestonePrecision = 'day' | 'month' | 'year';
export type AiMilestoneCategory = 'model' | 'lab' | 'product' | 'research';
export type AiMilestoneKind = 'launch' | 'founded' | 'milestone';
export type AiMilestoneSignificance = 'major' | 'notable';

export interface AiMilestone {
  id: string;
  title: string;
  summary: string;
  category: AiMilestoneCategory;
  kind: AiMilestoneKind;
  significance: AiMilestoneSignificance;
  year: number;
  month?: number;
  day?: number;
  datePrecision: AiMilestonePrecision;
  sourceLabel: string;
  sourceUrl: string;
  href?: string;
}

export interface UpcomingAiMilestone extends AiMilestone {
  daysUntil: number;
  anniversaryYears: number;
  nextOccurrenceIso: string;
  nextOccurrenceLabel: string;
}

export interface ThisDayInAiOverview {
  generatedForLabel: string;
  trackedMilestones: number;
  exactDateMilestones: number;
  todayMilestones: UpcomingAiMilestone[];
  upcomingMilestones: UpcomingAiMilestone[];
  launchMilestones: AiMilestone[];
  labMilestones: AiMilestone[];
  nextMilestone: UpcomingAiMilestone | null;
}

const LONDON_TIME_ZONE = 'Europe/London';

export const aiMilestones: AiMilestone[] = [
  {
    id: 'deepmind-founded',
    title: 'DeepMind founded',
    summary: 'DeepMind launched in London, years before it became one of the labs that defined modern frontier AI.',
    category: 'lab',
    kind: 'founded',
    significance: 'major',
    year: 2010,
    datePrecision: 'year',
    sourceLabel: 'Google DeepMind',
    sourceUrl: 'https://deepmind.google/en/blog/announcing-google-deepmind/',
    href: '/labs/',
  },
  {
    id: 'openai-founded',
    title: 'OpenAI founded',
    summary: 'OpenAI launched as a non-profit AI research company and set up the institution that later shipped GPT-3, GPT-4, and GPT-5.',
    category: 'lab',
    kind: 'founded',
    significance: 'major',
    year: 2015,
    month: 12,
    day: 11,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://openai.com/index/introducing-openai/',
    href: '/labs/',
  },
  {
    id: 'cohere-founded',
    title: 'Cohere founded',
    summary: 'Cohere started in Toronto with an enterprise-first AI strategy that later focused heavily on business deployments.',
    category: 'lab',
    kind: 'founded',
    significance: 'notable',
    year: 2019,
    datePrecision: 'year',
    sourceLabel: 'Cohere',
    sourceUrl: 'https://cohere.com/about',
    href: '/labs/',
  },
  {
    id: 'anthropic-founded',
    title: 'Anthropic founded',
    summary: 'Anthropic emerged as a safety-focused frontier lab and later built the Claude family into one of the strongest commercial model lines.',
    category: 'lab',
    kind: 'founded',
    significance: 'major',
    year: 2021,
    datePrecision: 'year',
    sourceLabel: 'Anthropic',
    sourceUrl: 'https://www.anthropic.com/news/introducing-claude',
    href: '/labs/',
  },
  {
    id: 'mistral-founded',
    title: 'Mistral AI founded',
    summary: 'Mistral AI launched in Europe and quickly became a major open-weight and API competitor.',
    category: 'lab',
    kind: 'founded',
    significance: 'major',
    year: 2023,
    month: 4,
    datePrecision: 'month',
    sourceLabel: 'Mistral AI',
    sourceUrl: 'https://mistral.ai/news/welcome-to-mistral-ai',
    href: '/labs/',
  },
  {
    id: 'gpt-3-launch',
    title: 'GPT-3 launched via the OpenAI API',
    summary: 'OpenAI opened access to GPT-3 through the API and kicked off the first big wave of general-purpose LLM product building.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2020,
    month: 6,
    day: 11,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://openai.com/blog/openai-api',
    href: '/timeline/',
  },
  {
    id: 'claude-launch',
    title: 'Claude introduced',
    summary: 'Anthropic officially introduced Claude and Claude Instant, opening the commercial story for the Claude model family.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2023,
    month: 3,
    day: 14,
    datePrecision: 'day',
    sourceLabel: 'Anthropic',
    sourceUrl: 'https://www.anthropic.com/news/introducing-claude',
    href: '/timeline/',
  },
  {
    id: 'gpt-4-launch',
    title: 'GPT-4 introduced',
    summary: 'OpenAI launched GPT-4, the model release that reset expectations around multimodal frontier capability.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2023,
    month: 3,
    day: 14,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://openai.com/hy-AM/index/gpt-4-research/',
    href: '/timeline/',
  },
  {
    id: 'google-deepmind-formed',
    title: 'Google DeepMind formed',
    summary: 'Google merged DeepMind and the Google Brain team into Google DeepMind, concentrating one of the biggest AI research groups under a single lab brand.',
    category: 'lab',
    kind: 'milestone',
    significance: 'major',
    year: 2023,
    month: 4,
    day: 20,
    datePrecision: 'day',
    sourceLabel: 'Google DeepMind',
    sourceUrl: 'https://deepmind.google/en/blog/announcing-google-deepmind/',
    href: '/labs/',
  },
  {
    id: 'gemini-1-launch',
    title: 'Gemini 1 launched',
    summary: 'Google introduced the Gemini model family, establishing the Gemini naming line that now anchors its frontier model releases.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2023,
    month: 12,
    day: 6,
    datePrecision: 'day',
    sourceLabel: 'Google DeepMind',
    sourceUrl: 'https://deepmind.google/gemini/gemini_1_report.pdf',
    href: '/timeline/',
  },
  {
    id: 'gpt-4.1-launch',
    title: 'GPT-4.1 launched',
    summary: 'OpenAI launched GPT-4.1 as a developer-focused model line with strong coding and instruction-following improvements.',
    category: 'model',
    kind: 'launch',
    significance: 'notable',
    year: 2025,
    month: 4,
    day: 14,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes',
    href: '/new/',
  },
  {
    id: 'gpt-5-launch',
    title: 'GPT-5 introduced',
    summary: 'OpenAI launched GPT-5 as the flagship unified frontier model with stronger coding, math, health, and multimodal performance.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2025,
    month: 8,
    day: 7,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://openai.com/index/introducing-gpt-5/',
    href: '/new/',
  },
  {
    id: 'gemini-3.1-pro-launch',
    title: 'Gemini 3.1 Pro Preview released',
    summary: 'Google shipped Gemini 3.1 Pro Preview and made it the main continuation of the Gemini 3 Pro line.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2026,
    month: 2,
    day: 19,
    datePrecision: 'day',
    sourceLabel: 'Google AI for Developers',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/changelog',
    href: '/new/',
  },
  {
    id: 'gpt-5.4-launch',
    title: 'GPT-5.4 introduced',
    summary: 'OpenAI introduced GPT-5.4 as its most capable and efficient frontier model for professional work with a 1M-token context window.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2026,
    month: 3,
    day: 5,
    datePrecision: 'day',
    sourceLabel: 'OpenAI',
    sourceUrl: 'https://openai.com/research/index/release/',
    href: '/new/',
  },
  {
    id: 'gemma-4-launch',
    title: 'Gemma 4 launched',
    summary: 'Google launched Gemma 4 and expanded the open-weight, local-model lane with new Gemma 4 endpoints.',
    category: 'model',
    kind: 'launch',
    significance: 'major',
    year: 2026,
    month: 4,
    day: 2,
    datePrecision: 'day',
    sourceLabel: 'Google AI for Developers',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/changelog',
    href: '/new/',
  },
];

function getLondonParts(referenceDate = new Date()): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(referenceDate);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0');

  return { year, month, day };
}

function eventDateKey(milestone: AiMilestone): string {
  if (milestone.datePrecision !== 'day' || !milestone.month || !milestone.day) {
    return '';
  }

  return `${String(milestone.month).padStart(2, '0')}-${String(milestone.day).padStart(2, '0')}`;
}

function asUtcMidday(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day, 12, 0, 0);
}

function getUpcomingInfo(milestone: AiMilestone, todayParts: { year: number; month: number; day: number }): UpcomingAiMilestone | null {
  if (milestone.datePrecision !== 'day' || !milestone.month || !milestone.day) {
    return null;
  }

  const todayStamp = asUtcMidday(todayParts.year, todayParts.month, todayParts.day);
  let candidateYear = todayParts.year;
  let candidateStamp = asUtcMidday(candidateYear, milestone.month, milestone.day);

  if (candidateStamp < todayStamp) {
    candidateYear += 1;
    candidateStamp = asUtcMidday(candidateYear, milestone.month, milestone.day);
  }

  const daysUntil = Math.round((candidateStamp - todayStamp) / (1000 * 60 * 60 * 24));
  const anniversaryYears = candidateYear - milestone.year;

  return {
    ...milestone,
    daysUntil,
    anniversaryYears,
    nextOccurrenceIso: new Date(candidateStamp).toISOString().slice(0, 10),
    nextOccurrenceLabel: new Date(candidateStamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

export function formatAiMilestoneDate(milestone: AiMilestone): string {
  if (milestone.datePrecision === 'day' && milestone.month && milestone.day) {
    return new Date(Date.UTC(milestone.year, milestone.month - 1, milestone.day, 12, 0, 0)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  if (milestone.datePrecision === 'month' && milestone.month) {
    return new Date(Date.UTC(milestone.year, milestone.month - 1, 1, 12, 0, 0)).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  return String(milestone.year);
}

export function getThisDayInAiOverview(): ThisDayInAiOverview {
  const todayParts = getLondonParts();
  const todayLabel = new Date(asUtcMidday(todayParts.year, todayParts.month, todayParts.day)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const todayKey = `${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`;

  const exactDateMilestones = aiMilestones.filter((milestone) => milestone.datePrecision === 'day');
  const todayMilestones = exactDateMilestones
    .filter((milestone) => eventDateKey(milestone) === todayKey)
    .map((milestone) => getUpcomingInfo(milestone, todayParts))
    .filter((milestone): milestone is UpcomingAiMilestone => Boolean(milestone))
    .sort((left, right) => {
      const significanceOrder = { major: 0, notable: 1 };
      return significanceOrder[left.significance] - significanceOrder[right.significance] || left.year - right.year;
    });

  const upcomingMilestones = exactDateMilestones
    .map((milestone) => getUpcomingInfo(milestone, todayParts))
    .filter((milestone): milestone is UpcomingAiMilestone => Boolean(milestone))
    .filter((milestone) => milestone.daysUntil > 0)
    .sort((left, right) => left.daysUntil - right.daysUntil || left.year - right.year)
    .slice(0, 8);

  const launchMilestones = aiMilestones
    .filter((milestone) => milestone.category === 'model')
    .sort((left, right) => {
      const leftMonth = left.month ?? 13;
      const rightMonth = right.month ?? 13;
      const leftDay = left.day ?? 32;
      const rightDay = right.day ?? 32;
      return leftMonth - rightMonth || leftDay - rightDay || left.year - right.year;
    });

  const labMilestones = aiMilestones
    .filter((milestone) => milestone.category === 'lab')
    .sort((left, right) => left.year - right.year || (left.month ?? 13) - (right.month ?? 13) || (left.day ?? 32) - (right.day ?? 32));

  return {
    generatedForLabel: todayLabel,
    trackedMilestones: aiMilestones.length,
    exactDateMilestones: exactDateMilestones.length,
    todayMilestones,
    upcomingMilestones,
    launchMilestones,
    labMilestones,
    nextMilestone: upcomingMilestones[0] ?? null,
  };
}
