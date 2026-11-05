import type { Event } from '../types';

/**
 * Cleans events that come from the CMS before the Events page shows them.
 * The CMS is edited by hand, so a field can be a placeholder (for example
 * dateEnd "0000-00-00") or a display label can disagree with the real date.
 * The ISO `date` is the single source of truth for the day, month and year
 * that are shown on a card.
 */

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/** True for a real calendar date written as YYYY-MM-DD (rejects 0000-00-00 and 2026-02-31). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 2000) return false;
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  );
}

/** The camp's dates are not set yet, so it is shown as "Summer 2027, dates to be announced". */
const SUMMER_CAMP_TITLE = /summer cinematography camp/i;
const SUMMER_CAMP_YEAR = '2027';

export function sanitizeEvent(event: Event): Event {
  const next: Event = {
    ...event,
    // Older CMS copy that the team has asked us not to show.
    description: event.description.replace(/\s*Over 107 attendees\./gi, ''),
  };

  // An end date only counts if it is a real date on or after the start date.
  if (
    !isIsoDate(next.dateEnd) ||
    (isIsoDate(next.date) && next.dateEnd < next.date)
  ) {
    delete next.dateEnd;
  }

  // Summer camp with no confirmed dates: show the season, not a made-up day.
  if (SUMMER_CAMP_TITLE.test(next.title) && !next.dateEnd) {
    return {
      ...next,
      day: 'TBA',
      month: 'SUMMER',
      year: SUMMER_CAMP_YEAR,
      time: 'Dates to be announced',
      datesTba: true,
    };
  }

  if (isIsoDate(next.date)) {
    const [y, m, d] = next.date.split('-');
    next.day = d;
    next.month = MONTHS[Number(m) - 1];
    next.year = y;
  }

  return next;
}

/** Sanitize a list, then the page decides upcoming vs past. */
export function sanitizeEvents(list: Event[]): Event[] {
  return list.map(sanitizeEvent);
}
