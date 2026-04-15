import { describe, expect, it } from 'vitest';
import {
  formatCalendarLabel,
  formatCompactTimestamp,
  formatFullDate,
  formatRelativeDuration,
  formatTimeOfDay,
} from '../date';

const NOW = new Date('2026-04-15T14:30:00Z');

const UNIT_MS: Record<'second' | 'minute' | 'hour' | 'day', number> = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
};

function past(amount: number, unit: keyof typeof UNIT_MS): Date {
  return new Date(NOW.getTime() - amount * UNIT_MS[unit]);
}
function future(amount: number, unit: keyof typeof UNIT_MS): Date {
  return new Date(NOW.getTime() + amount * UNIT_MS[unit]);
}
const opts = (overrides: object = {}) => ({ now: NOW, locale: 'en-US', ...overrides });

describe('formatRelativeDuration', () => {
  it('returns empty string for nullish or invalid input', () => {
    expect(formatRelativeDuration(null)).toBe('');
    expect(formatRelativeDuration(undefined)).toBe('');
    expect(formatRelativeDuration('')).toBe('');
    expect(formatRelativeDuration('not-a-date')).toBe('');
    expect(formatRelativeDuration(Number.NaN)).toBe('');
  });

  it('accepts Date, string, and number inputs', () => {
    expect(formatRelativeDuration(past(3, 'day'), opts())).toBe('3 days ago');
    expect(formatRelativeDuration(past(3, 'day').toISOString(), opts())).toBe('3 days ago');
    expect(formatRelativeDuration(past(3, 'day').getTime(), opts())).toBe('3 days ago');
  });

  describe('past dates', () => {
    it('shows "now" for sub-minute differences', () => {
      expect(formatRelativeDuration(NOW, opts())).toBe('now');
      expect(formatRelativeDuration(past(30, 'second'), opts())).toBe('now');
      expect(formatRelativeDuration(past(59, 'second'), opts())).toBe('now');
    });

    it('shows minutes from 1 to 59', () => {
      expect(formatRelativeDuration(past(1, 'minute'), opts())).toBe('1 minute ago');
      expect(formatRelativeDuration(past(5, 'minute'), opts())).toBe('5 minutes ago');
      expect(formatRelativeDuration(past(59, 'minute'), opts())).toBe('59 minutes ago');
    });

    it('shows hours from 1 to 23', () => {
      expect(formatRelativeDuration(past(1, 'hour'), opts())).toBe('1 hour ago');
      expect(formatRelativeDuration(past(23, 'hour'), opts())).toBe('23 hours ago');
    });

    it('shows "yesterday" for 1 day ago and "N days ago" for 2..29', () => {
      expect(formatRelativeDuration(past(1, 'day'), opts())).toBe('yesterday');
      expect(formatRelativeDuration(past(36, 'hour'), opts())).toBe('yesterday');
      expect(formatRelativeDuration(past(2, 'day'), opts())).toBe('2 days ago');
      expect(formatRelativeDuration(past(29, 'day'), opts())).toBe('29 days ago');
    });

    it('shows "last month" at 1 month and "N months ago" beyond', () => {
      expect(formatRelativeDuration(past(30, 'day'), opts())).toBe('last month');
      expect(formatRelativeDuration(past(60, 'day'), opts())).toBe('2 months ago');
      expect(formatRelativeDuration(past(330, 'day'), opts())).toBe('11 months ago');
    });

    it('shows "last year" and "N years ago"', () => {
      expect(formatRelativeDuration(past(365, 'day'), opts())).toBe('last year');
      expect(formatRelativeDuration(past(2 * 365, 'day'), opts())).toBe('2 years ago');
    });
  });

  describe('future dates', () => {
    it('shows "in N minutes" and "in N hours"', () => {
      expect(formatRelativeDuration(future(5, 'minute'), opts())).toBe('in 5 minutes');
      expect(formatRelativeDuration(future(3, 'hour'), opts())).toBe('in 3 hours');
    });

    it('shows "tomorrow" and "in N days"', () => {
      expect(formatRelativeDuration(future(1, 'day'), opts())).toBe('tomorrow');
      expect(formatRelativeDuration(future(5, 'day'), opts())).toBe('in 5 days');
    });

    it('shows "next month" and "next year"', () => {
      expect(formatRelativeDuration(future(30, 'day'), opts())).toBe('next month');
      expect(formatRelativeDuration(future(365, 'day'), opts())).toBe('next year');
    });
  });

  describe('locale override', () => {
    it('emits German strings under de-DE', () => {
      expect(formatRelativeDuration(past(1, 'day'), { now: NOW, locale: 'de-DE' })).toBe('gestern');
      expect(formatRelativeDuration(past(3, 'day'), { now: NOW, locale: 'de-DE' })).toBe('vor 3 Tagen');
      expect(formatRelativeDuration(future(1, 'day'), { now: NOW, locale: 'de-DE' })).toBe('morgen');
    });
  });
});

describe('formatCompactTimestamp', () => {
  it('returns empty string for invalid input', () => {
    expect(formatCompactTimestamp(null)).toBe('');
    expect(formatCompactTimestamp('not-a-date')).toBe('');
  });

  it('collapses sub-minute to "now"', () => {
    expect(formatCompactTimestamp(NOW, opts())).toBe('now');
    expect(formatCompactTimestamp(past(59, 'second'), opts())).toBe('now');
  });

  it('emits m / h / d / w at the right boundaries', () => {
    expect(formatCompactTimestamp(past(1, 'minute'), opts())).toBe('1m');
    expect(formatCompactTimestamp(past(59, 'minute'), opts())).toBe('59m');
    expect(formatCompactTimestamp(past(1, 'hour'), opts())).toBe('1h');
    expect(formatCompactTimestamp(past(23, 'hour'), opts())).toBe('23h');
    expect(formatCompactTimestamp(past(1, 'day'), opts())).toBe('1d');
    expect(formatCompactTimestamp(past(6, 'day'), opts())).toBe('6d');
    expect(formatCompactTimestamp(past(7, 'day'), opts())).toBe('1w');
    expect(formatCompactTimestamp(past(51 * 7, 'day'), opts())).toBe('51w');
  });

  it('falls back to a short date beyond 52 weeks', () => {
    const result = formatCompactTimestamp(past(400, 'day'), opts());
    expect(result).not.toMatch(/^\d+[mhdw]$/);
    expect(result).not.toBe('now');
    expect(result.length).toBeGreaterThan(3);
  });
});

describe('formatCalendarLabel', () => {
  const ATERNOON = new Date('2026-04-15T14:30:00Z');

  it('labels today and yesterday via Intl', () => {
    expect(formatCalendarLabel(ATERNOON, { now: ATERNOON, locale: 'en-US' })).toBe('today');
    const yesterday = new Date(ATERNOON.getTime() - UNIT_MS.day);
    expect(formatCalendarLabel(yesterday, { now: ATERNOON, locale: 'en-US' })).toBe('yesterday');
  });

  it('labels tomorrow via Intl', () => {
    const tomorrow = new Date(ATERNOON.getTime() + UNIT_MS.day);
    expect(formatCalendarLabel(tomorrow, { now: ATERNOON, locale: 'en-US' })).toBe('tomorrow');
  });

  it('uses the weekday name for 2..6 days back', () => {
    const fiveDaysBack = new Date(ATERNOON.getTime() - 5 * UNIT_MS.day);
    const label = formatCalendarLabel(fiveDaysBack, { now: ATERNOON, locale: 'en-US' });
    expect(label).toMatch(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$/);
  });

  it('falls back to a short date beyond a week', () => {
    const longAgo = new Date(ATERNOON.getTime() - 30 * UNIT_MS.day);
    const label = formatCalendarLabel(longAgo, { now: ATERNOON, locale: 'en-US' });
    expect(label).not.toMatch(/^(today|yesterday|tomorrow)$/);
    expect(label).toMatch(/\d/);
  });

  it('returns empty string for invalid input', () => {
    expect(formatCalendarLabel(null)).toBe('');
    expect(formatCalendarLabel('nope')).toBe('');
  });
});

describe('formatTimeOfDay', () => {
  it('returns a locale-formatted time', () => {
    expect(formatTimeOfDay('2026-04-15T14:30:00Z', { locale: 'en-US' }))
      .toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });

  it('returns empty string for invalid input', () => {
    expect(formatTimeOfDay(null)).toBe('');
  });
});

describe('formatFullDate', () => {
  it('returns a long locale-formatted date', () => {
    const result = formatFullDate('2026-04-15T14:30:00Z', { locale: 'en-US' });
    expect(result).toContain('2026');
    expect(result.length).toBeGreaterThan(10);
  });

  it('returns empty string for invalid input', () => {
    expect(formatFullDate(null)).toBe('');
  });
});
