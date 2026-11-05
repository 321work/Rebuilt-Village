import { describe, expect, it } from 'vitest';
import type { Event } from '../types';
import { isIsoDate, sanitizeEvent } from '../src/events';

const base: Event = {
  id: 'x',
  title: 'Some Workshop',
  date: '2027-04-05',
  day: '05',
  month: 'APR',
  year: '2027',
  time: '10:00 AM',
  location: 'TBA',
  description: 'A workshop.',
  type: 'workshop',
};

describe('isIsoDate', () => {
  it('accepts real dates', () => {
    expect(isIsoDate('2026-11-28')).toBe(true);
    expect(isIsoDate('2028-02-29')).toBe(true);
  });

  it('rejects placeholders and impossible dates', () => {
    expect(isIsoDate('0000-00-00')).toBe(false);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe('sanitizeEvent', () => {
  it('shows the Summer 2027 camp as dates TBA when the CMS end date is a placeholder', () => {
    // This is what the CMS holds today.
    const camp = sanitizeEvent({
      ...base,
      title: 'Summer Cinematography Camp',
      date: '2027-07-01',
      dateEnd: '0000-00-00',
      day: '13',
      month: 'JUL',
      year: '2027',
      time: 'July 13–24 · 9:00 AM – 3:00 PM (Weekdays)',
      description:
        'Students gain hands-on experience with Sony cameras and lighting rigs.',
    });
    expect(camp.dateEnd).toBeUndefined();
    expect(camp.datesTba).toBe(true);
    expect(camp.month).toBe('SUMMER');
    expect(camp.day).toBe('TBA');
    expect(camp.year).toBe('2027');
    expect(camp.time).toBe('Dates to be announced');
    // Equipment wording is the CMS's to decide; it is left alone.
    expect(camp.description).toContain('Sony cameras');
  });

  it('keeps real camp dates once they are set in the CMS', () => {
    const camp = sanitizeEvent({
      ...base,
      title: 'Summer Cinematography Camp',
      date: '2027-07-12',
      dateEnd: '2027-07-23',
      day: '99',
      month: 'XXX',
    });
    expect(camp.datesTba).toBeUndefined();
    expect(camp.day).toBe('12');
    expect(camp.month).toBe('JUL');
    expect(camp.dateEnd).toBe('2027-07-23');
  });

  it('derives the labels from the date, so Films on the Field shows October 17', () => {
    const film = sanitizeEvent({
      ...base,
      title: 'Inaugural Films on the Field',
      date: '2025-10-17',
      day: '25',
      month: 'OCT',
      year: '2025',
    });
    expect(film.day).toBe('17');
    expect(film.month).toBe('OCT');
    expect(film.year).toBe('2025');
  });

  it('keeps a valid multi-day range and drops one that ends before it starts', () => {
    const ok = sanitizeEvent({
      ...base,
      date: '2026-05-15',
      dateEnd: '2026-05-17',
    });
    expect(ok.dateEnd).toBe('2026-05-17');
    const bad = sanitizeEvent({
      ...base,
      date: '2026-05-15',
      dateEnd: '2026-05-10',
    });
    expect(bad.dateEnd).toBeUndefined();
  });

  it('removes the old unverified attendance claim', () => {
    const e = sanitizeEvent({
      ...base,
      description: 'A great night. Over 107 attendees. See you there.',
    });
    expect(e.description).not.toMatch(/107/);
  });
});
