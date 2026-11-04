import { describe, expect, it } from 'vitest';
import {
  GALA,
  GALA_TICKET_TIERS,
  countdownLabel,
  daysUntilGala,
  formatDollars,
  galaPhase,
  galaTicketsUrl,
} from '../src/gala';

// The gala is Saturday 2026-11-28 in America/New_York (EST, UTC-5).
describe('gala dates', () => {
  it('counts calendar days in Eastern time', () => {
    expect(daysUntilGala(new Date('2026-11-04T15:00:00Z'))).toBe(24);
    expect(daysUntilGala(new Date('2026-11-27T17:00:00Z'))).toBe(1);
    expect(daysUntilGala(new Date('2026-11-28T17:00:00Z'))).toBe(0);
    expect(daysUntilGala(new Date('2026-11-29T17:00:00Z'))).toBe(-1);
  });

  it('uses the Eastern date, not the UTC date, near midnight', () => {
    // 03:00 UTC on Nov 28 is still 10 PM on Nov 27 in Orlando.
    expect(daysUntilGala(new Date('2026-11-28T03:00:00Z'))).toBe(1);
    // 04:30 UTC on Nov 29 is 11:30 PM on Nov 28: still gala day.
    expect(galaPhase(new Date('2026-11-29T04:30:00Z'))).toBe('today');
    // 05:30 UTC on Nov 29 is 12:30 AM on Nov 29: over.
    expect(galaPhase(new Date('2026-11-29T05:30:00Z'))).toBe('past');
  });

  it('reports upcoming, today and past', () => {
    expect(galaPhase(new Date('2026-11-04T15:00:00Z'))).toBe('upcoming');
    expect(galaPhase(new Date('2026-11-28T15:00:00Z'))).toBe('today');
    expect(galaPhase(new Date('2026-12-01T15:00:00Z'))).toBe('past');
  });

  it('words the countdown', () => {
    expect(countdownLabel(24)).toBe('24 days away');
    expect(countdownLabel(1)).toBe('Tomorrow');
    expect(countdownLabel(0)).toBe('Tonight');
  });
});

describe('gala tickets', () => {
  it('tags each placement and keeps the OpenDate event path', () => {
    const url = new URL(galaTicketsUrl('hero'));
    expect(`${url.origin}${url.pathname}`).toBe(GALA.TICKETS_URL);
    expect(url.searchParams.get('utm_source')).toBe('website');
    expect(url.searchParams.get('utm_medium')).toBe('hero');
    expect(url.searchParams.get('utm_campaign')).toBe('hollywood-holidays-gala');
  });

  it('lists the six tiers with totals above the face price', () => {
    expect(GALA_TICKET_TIERS.map((t) => t.name)).toEqual([
      'K-12 Student',
      'College Student',
      'General Admission',
      'VIP',
      'VIP for 2',
      'Table Buyout',
    ]);
    for (const tier of GALA_TICKET_TIERS) expect(tier.total).toBeGreaterThan(tier.price);
  });

  it('formats whole and fractional dollars', () => {
    expect(formatDollars(5)).toBe('$5');
    expect(formatDollars(11.39)).toBe('$11.39');
    expect(formatDollars(525.23)).toBe('$525.23');
  });
});
