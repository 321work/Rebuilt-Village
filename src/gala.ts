import { useEffect, useState } from 'react';

/**
 * Hollywood Holidays Gala: the single source of truth for every place the site
 * promotes it. Ticket prices are copied from the OpenDate ticket page; update
 * them here (and in index.html and public/llms*.txt) if they change there.
 */

export const GALA = {
  TITLE: 'Hollywood Holidays Gala',
  DATE_ISO: '2026-11-28', // event day in America/New_York
  START_ISO: '2026-11-28T19:00:00-05:00',
  DATE_LABEL: 'Saturday, November 28, 2026',
  DATE_SHORT: 'Nov 28',
  TIME_LABEL: '7:00 PM',
  DOORS_LABEL: 'Doors 6:00 PM',
  VENUE: 'The Palmer Room',
  ADDRESS: '425 N Bumby Ave, Orlando, FL 32803',
  AUDIENCE: 'All Ages',
  TICKETS_URL:
    'https://app.opendate.io/e/hollywood-holidays-gala-by-rebuilt-village-november-28-2026-750913',
} as const;

export interface GalaTicketTier {
  name: string;
  /** Face price in dollars. */
  price: number;
  /** What the buyer pays at checkout, including OpenDate's fee. */
  total: number;
  note: string;
}

export const GALA_TICKET_TIERS: readonly GalaTicketTier[] = [
  { name: 'K-12 Student', price: 5, total: 11.39, note: 'K-12 students only. Theater seating.' },
  { name: 'College Student', price: 15, total: 22.75, note: 'Student ID required at the door. Theater seating.' },
  { name: 'General Admission', price: 40, total: 50.12, note: 'Theater seating.' },
  { name: 'VIP', price: 65, total: 76.47, note: 'Reserved seating at a banquet table with other VIP guests.' },
  { name: 'VIP for 2', price: 120, total: 132.91, note: 'Two VIP seats at a banquet table with other VIP guests.' },
  { name: 'Table Buyout', price: 500, total: 525.23, note: 'One reserved banquet table, up to 8 seats for you and your guests.' },
] as const;

export type GalaPlacement =
  | 'announcement-bar'
  | 'nav'
  | 'hero'
  | 'sticky-bar'
  | 'home-band'
  | 'mobile-menu';

/** Ticket link tagged so OpenDate reports which spot on the site sold tickets. */
export function galaTicketsUrl(placement: GalaPlacement): string {
  const url = new URL(GALA.TICKETS_URL);
  url.searchParams.set('utm_source', 'website');
  url.searchParams.set('utm_medium', placement);
  url.searchParams.set('utm_campaign', 'hollywood-holidays-gala');
  return url.href;
}

export function formatDollars(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

// ─── Dates (all calendar math is in the event's own time zone) ───────────────

const EVENT_TIME_ZONE = 'America/New_York';

function easternDateString(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function dayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Whole calendar days from today (Eastern) to the gala. 0 on the day, negative after. */
export function daysUntilGala(now: Date = new Date()): number {
  return dayNumber(GALA.DATE_ISO) - dayNumber(easternDateString(now));
}

export type GalaPhase = 'upcoming' | 'today' | 'past';

export function galaPhase(now: Date = new Date()): GalaPhase {
  const days = daysUntilGala(now);
  if (days > 0) return 'upcoming';
  if (days === 0) return 'today';
  return 'past';
}

export function countdownLabel(days: number): string {
  if (days <= 0) return 'Tonight';
  if (days === 1) return 'Tomorrow';
  return `${days} days away`;
}

/**
 * Drives every gala promo. The first render is always "active" so it matches the
 * prerendered HTML the site hydrates from; the effect then hides the promos once
 * the event has passed and fills in the countdown (which depends on the visitor's
 * clock, so it must not be part of the first render).
 */
export function useGalaPromo(): { active: boolean; countdown: string | null } {
  const [state, setState] = useState<{ active: boolean; countdown: string | null }>({
    active: true,
    countdown: null,
  });

  useEffect(() => {
    // The build-time prerender (prerender.cjs) snapshots the DOM after effects run.
    // Skip them there so the static HTML matches the first client render exactly.
    if ((window as unknown as { __PRERENDER__?: boolean }).__PRERENDER__) return;
    const now = new Date();
    setState({
      active: galaPhase(now) !== 'past',
      countdown: countdownLabel(daysUntilGala(now)),
    });
  }, []);

  return state;
}
