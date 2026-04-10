import {
  aiMilestoneSeed,
  type AiMilestoneCategory,
  type AiMilestoneKind,
  type AiMilestoneSeed,
  type AiMilestoneSignificance,
  type AiMilestoneSource,
  type AiMilestoneStatus,
} from './ai-milestones-seed';

const LONDON_TIME_ZONE = 'Europe/London';

const categoryLabels: Record<AiMilestoneCategory, string> = {
  model_release: 'Model release',
  lab_founded: 'Lab founded',
  research_breakthrough: 'Research breakthrough',
  product_launch: 'Product launch',
  benchmark_milestone: 'Benchmark milestone',
  industry_event: 'Industry event',
  funding: 'Funding',
  acquisition: 'Acquisition',
  policy: 'Policy',
};

const kindLabels: Record<AiMilestoneKind, string> = {
  launch: 'Launch',
  founded: 'Founded',
  milestone: 'Milestone',
  anniversary: 'Anniversary',
};

const significanceLabels: Record<AiMilestoneSignificance, string> = {
  major: 'Major',
  notable: 'Notable',
  reference: 'Reference',
};

const statusLabels: Record<AiMilestoneStatus, string> = {
  verified: 'Verified',
  tracking: 'Tracking',
  needs_review: 'Needs review',
};

export interface AiMilestoneRecord extends AiMilestoneSeed {
  canonicalSource: AiMilestoneSource;
  categoryLabel: string;
  kindLabel: string;
  significanceLabel: string;
  statusLabel: string;
  dateLabel: string;
  trackingDateLabel: string | null;
  href: string;
  sortKey: number;
}

export interface UpcomingAiMilestone extends AiMilestoneRecord {
  daysUntil: number;
  anniversaryYears: number;
  nextOccurrenceIso: string;
  nextOccurrenceLabel: string;
}

export interface AiMilestonesOverview {
  generatedAt: string;
  generatedForLabel: string;
  totalMilestones: number;
  verifiedMilestones: number;
  trackingMilestonesCount: number;
  needsReviewMilestones: number;
  exactDateMilestones: number;
  homepageEligibleMilestones: number;
  todayMilestones: UpcomingAiMilestone[];
  upcomingMilestones: UpcomingAiMilestone[];
  latestLaunches: AiMilestoneRecord[];
  labMilestones: AiMilestoneRecord[];
  historicalHighlights: AiMilestoneRecord[];
  trackingMilestones: AiMilestoneRecord[];
  estimatedMilestones: AiMilestoneRecord[];
  nextMilestone: UpcomingAiMilestone | null;
}

function getCanonicalSource(milestone: AiMilestoneSeed): AiMilestoneSource {
  return milestone.sources.find((source) => source.role === 'canonical') ?? milestone.sources[0];
}

function getHrefForMilestone(milestone: AiMilestoneSeed): string {
  switch (milestone.category) {
    case 'model_release':
      return '/new/';
    case 'lab_founded':
      return '/labs/';
    case 'benchmark_milestone':
      return '/benchmarks/';
    default:
      return '/timeline/';
  }
}

function asUtcMidday(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day, 12, 0, 0);
}

function getSortKey(milestone: AiMilestoneSeed): number {
  const month = milestone.month ?? 1;
  const day = milestone.day ?? 1;
  return asUtcMidday(milestone.year, month, day);
}

function formatMonthYear(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatAiMilestoneDate(milestone: Pick<AiMilestoneSeed, 'year' | 'month' | 'day' | 'datePrecision'>): string {
  if (milestone.datePrecision === 'day' && milestone.month && milestone.day) {
    return new Date(Date.UTC(milestone.year, milestone.month - 1, milestone.day, 12, 0, 0)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  if (milestone.datePrecision === 'month' && milestone.month) {
    return formatMonthYear(milestone.year, milestone.month);
  }

  return String(milestone.year);
}

function formatTrackingDate(value: string | null | undefined): string | null {
  if (!value) return null;

  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function getLondonParts(referenceDate = new Date()): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(referenceDate);
  return {
    year: Number(parts.find((part) => part.type === 'year')?.value ?? '0'),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? '0'),
    day: Number(parts.find((part) => part.type === 'day')?.value ?? '0'),
  };
}

function getUpcomingInfo(milestone: AiMilestoneRecord, todayParts: { year: number; month: number; day: number }): UpcomingAiMilestone | null {
  if (!milestone.exactAnniversaryEligible || !milestone.month || !milestone.day) {
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

  return {
    ...milestone,
    daysUntil,
    anniversaryYears: candidateYear - milestone.year,
    nextOccurrenceIso: new Date(candidateStamp).toISOString(),
    nextOccurrenceLabel: new Date(candidateStamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

function sortByDateDescending(left: AiMilestoneRecord, right: AiMilestoneRecord): number {
  if (left.sortKey !== right.sortKey) return right.sortKey - left.sortKey;
  return left.title.localeCompare(right.title);
}

function sortUpcoming(left: UpcomingAiMilestone, right: UpcomingAiMilestone): number {
  if (left.daysUntil !== right.daysUntil) return left.daysUntil - right.daysUntil;
  if (left.significance !== right.significance) {
    return left.significance === 'major' ? -1 : 1;
  }

  return left.title.localeCompare(right.title);
}

export function getAiMilestones(): AiMilestoneRecord[] {
  return aiMilestoneSeed
    .map((milestone) => {
      const canonicalSource = getCanonicalSource(milestone);

      return {
        ...milestone,
        canonicalSource,
        categoryLabel: categoryLabels[milestone.category],
        kindLabel: kindLabels[milestone.kind],
        significanceLabel: significanceLabels[milestone.significance],
        statusLabel: statusLabels[milestone.status],
        dateLabel: formatAiMilestoneDate(milestone),
        trackingDateLabel: formatTrackingDate(milestone.trackingDate?.date),
        href: getHrefForMilestone(milestone),
        sortKey: getSortKey(milestone),
      };
    })
    .sort(sortByDateDescending);
}

export function getAiMilestonesOverview(referenceDate = new Date()): AiMilestonesOverview {
  const all = getAiMilestones();
  const todayParts = getLondonParts(referenceDate);
  const upcoming = all
    .map((milestone) => getUpcomingInfo(milestone, todayParts))
    .filter((milestone): milestone is UpcomingAiMilestone => Boolean(milestone))
    .sort(sortUpcoming);

  const todayMilestones = upcoming.filter((milestone) => milestone.daysUntil === 0);
  const trackingMilestones = all.filter((milestone) => milestone.status === 'tracking');
  const estimatedMilestones = all.filter((milestone) => Boolean(milestone.trackingDate));

  return {
    generatedAt: new Date().toISOString(),
    generatedForLabel: referenceDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: LONDON_TIME_ZONE,
    }),
    totalMilestones: all.length,
    verifiedMilestones: all.filter((milestone) => milestone.status === 'verified').length,
    trackingMilestonesCount: trackingMilestones.length,
    needsReviewMilestones: all.filter((milestone) => milestone.status === 'needs_review').length,
    exactDateMilestones: all.filter((milestone) => milestone.exactAnniversaryEligible).length,
    homepageEligibleMilestones: all.filter((milestone) => milestone.homepageEligible).length,
    todayMilestones,
    upcomingMilestones: upcoming.filter((milestone) => milestone.daysUntil > 0).slice(0, 8),
    latestLaunches: all
      .filter((milestone) => milestone.category === 'model_release')
      .slice(0, 10),
    labMilestones: all
      .filter((milestone) => milestone.category === 'lab_founded')
      .slice(0, 10),
    historicalHighlights: all
      .filter((milestone) => milestone.category !== 'lab_founded' && milestone.category !== 'model_release')
      .slice(0, 12),
    trackingMilestones,
    estimatedMilestones,
    nextMilestone: upcoming.find((milestone) => milestone.daysUntil > 0) ?? null,
  };
}

export function getAiMilestonesSnapshot(referenceDate = new Date()) {
  const overview = getAiMilestonesOverview(referenceDate);
  const entries = getAiMilestones();

  return {
    generatedAt: overview.generatedAt,
    overview: {
      generatedForLabel: overview.generatedForLabel,
      totalMilestones: overview.totalMilestones,
      verifiedMilestones: overview.verifiedMilestones,
      trackingMilestones: overview.trackingMilestonesCount,
      needsReviewMilestones: overview.needsReviewMilestones,
      exactDateMilestones: overview.exactDateMilestones,
      homepageEligibleMilestones: overview.homepageEligibleMilestones,
      nextMilestone: overview.nextMilestone
        ? {
            id: overview.nextMilestone.id,
            title: overview.nextMilestone.title,
            nextOccurrenceLabel: overview.nextMilestone.nextOccurrenceLabel,
            daysUntil: overview.nextMilestone.daysUntil,
          }
        : null,
    },
    todayMilestones: overview.todayMilestones,
    upcomingMilestones: overview.upcomingMilestones,
    latestLaunches: overview.latestLaunches,
    labMilestones: overview.labMilestones,
    historicalHighlights: overview.historicalHighlights,
    trackingMilestones: overview.trackingMilestones,
    sourceRegistryCount: new Set(entries.flatMap((milestone) => milestone.sources.map((source) => source.url))).size,
    entries,
  };
}
