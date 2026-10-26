export interface UpcomingEventInput {
  id: string;
  date_start?: string | null;
  date_end?: string | null;
}

export const MIN_UPCOMING_EVENTS = 4;
export const UPCOMING_EVENTS_LOOKAHEAD_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function eventEndDay(event: UpcomingEventInput): string | null {
  const end = event.date_end ?? event.date_start;
  return end ? end.slice(0, 10) : null;
}

/** Events whose start date is set and whose end day is on or after `onDay`. */
export function getUpcomingEvents<T extends UpcomingEventInput>(events: T[], onDay: string): T[] {
  return events.filter((event) => {
    const end = eventEndDay(event);
    return Boolean(event.date_start) && end !== null && end >= onDay;
  });
}

/**
 * Low upcoming-event counts are advisory: they warn (now, and ahead of time
 * within the lookahead window) but never block publishing. Hard failures for
 * broken data (zero events, invalid records) stay in verify-publish-readiness.
 */
export function getUpcomingEventWarnings(
  events: UpcomingEventInput[],
  options: { now?: Date; minimum?: number; lookaheadDays?: number } = {},
): string[] {
  const now = options.now ?? new Date();
  const minimum = options.minimum ?? MIN_UPCOMING_EVENTS;
  const lookaheadDays = options.lookaheadDays ?? UPCOMING_EVENTS_LOOKAHEAD_DAYS;
  const upcomingNow = getUpcomingEvents(events, isoDay(now));

  if (upcomingNow.length < minimum) {
    return [
      `Events cache has ${upcomingNow.length} upcoming confirmed event(s), below the target of ${minimum}. `
      + 'Add newly confirmed events to scripts/scrapers/events.ts. Publishing is not blocked.',
    ];
  }

  const horizon = isoDay(new Date(now.getTime() + lookaheadDays * DAY_MS));
  const endDays = upcomingNow
    .map(eventEndDay)
    .filter((day): day is string => day !== null && day < horizon)
    .sort();
  for (const endDay of endDays) {
    const dayAfter = isoDay(new Date(Date.parse(`${endDay}T00:00:00Z`) + DAY_MS));
    const remaining = getUpcomingEvents(events, dayAfter).length;
    if (remaining < minimum) {
      return [
        `Events cache will drop to ${remaining} upcoming event(s) on ${dayAfter} (within ${lookaheadDays} days), `
        + `below the target of ${minimum}. Add newly confirmed events before then. Publishing is not blocked.`,
      ];
    }
  }
  return [];
}
