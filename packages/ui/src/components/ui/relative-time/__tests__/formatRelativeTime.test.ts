import { describe, expect, it } from 'vitest';

// Extract the function for testing (same logic as RelativeTime.vue)
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime()))
    return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60)
    return 'now';
  if (diffMin < 60)
    return `${diffMin}m`;
  if (diffHour < 24)
    return `${diffHour}h`;
  if (diffDay < 7)
    return `${diffDay}d`;
  if (diffWeek < 52)
    return `${diffWeek}w`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function timeAgo(seconds: number): string {
  const date = new Date(Date.now() - seconds * 1000);
  return formatRelativeTime(date.toISOString());
}

describe('formatRelativeTime', () => {
  it('returns empty string for invalid dates', () => {
    expect(formatRelativeTime('')).toBe('');
    expect(formatRelativeTime('not-a-date')).toBe('');
    expect(formatRelativeTime('invalid')).toBe('');
  });

  it('shows "now" for less than 60 seconds', () => {
    expect(timeAgo(0)).toBe('now');
    expect(timeAgo(30)).toBe('now');
    expect(timeAgo(59)).toBe('now');
  });

  it('shows minutes for 1-59 minutes', () => {
    expect(timeAgo(60)).toBe('1m');
    expect(timeAgo(120)).toBe('2m');
    expect(timeAgo(5 * 60)).toBe('5m');
    expect(timeAgo(59 * 60)).toBe('59m');
  });

  it('shows hours for 1-23 hours', () => {
    expect(timeAgo(60 * 60)).toBe('1h');
    expect(timeAgo(3 * 60 * 60)).toBe('3h');
    expect(timeAgo(23 * 60 * 60)).toBe('23h');
  });

  it('shows days for 1-6 days', () => {
    expect(timeAgo(24 * 60 * 60)).toBe('1d');
    expect(timeAgo(3 * 24 * 60 * 60)).toBe('3d');
    expect(timeAgo(6 * 24 * 60 * 60)).toBe('6d');
  });

  it('shows weeks for 1-51 weeks', () => {
    expect(timeAgo(7 * 24 * 60 * 60)).toBe('1w');
    expect(timeAgo(14 * 24 * 60 * 60)).toBe('2w');
    expect(timeAgo(4 * 7 * 24 * 60 * 60)).toBe('4w');
  });

  it('shows full date for 52+ weeks', () => {
    const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(oldDate.toISOString());
    // Should be a formatted date string, not a relative time
    expect(result).not.toMatch(/^\d+[mhdw]$/);
    expect(result.length).toBeGreaterThan(3);
  });

  describe('boundary precision', () => {
    it('59 seconds is "now", 60 seconds is "1m"', () => {
      expect(timeAgo(59)).toBe('now');
      expect(timeAgo(60)).toBe('1m');
    });

    it('59 minutes is "59m", 60 minutes is "1h"', () => {
      expect(timeAgo(59 * 60 + 59)).toBe('59m');
      expect(timeAgo(60 * 60)).toBe('1h');
    });

    it('23 hours is "23h", 24 hours is "1d"', () => {
      expect(timeAgo(23 * 60 * 60 + 59 * 60)).toBe('23h');
      expect(timeAgo(24 * 60 * 60)).toBe('1d');
    });
  });
});
