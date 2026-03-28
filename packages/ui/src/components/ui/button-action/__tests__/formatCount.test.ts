import { describe, expect, it } from 'vitest';

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatCount(n: number): string {
  return compactFormatter.format(n);
}

describe('formatCount', () => {
  it('shows small numbers as-is', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1)).toBe('1');
    expect(formatCount(42)).toBe('42');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands', () => {
    expect(formatCount(1000)).toBe('1K');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(2300)).toBe('2.3K');
    expect(formatCount(10000)).toBe('10K');
    expect(formatCount(100000)).toBe('100K');
  });

  it('formats millions', () => {
    expect(formatCount(1000000)).toBe('1M');
    expect(formatCount(1500000)).toBe('1.5M');
    expect(formatCount(2300000)).toBe('2.3M');
  });

  it('handles the 999999 boundary correctly', () => {
    // Should display as 1M, not 1000K
    expect(formatCount(999999)).toBe('1M');
  });

  it('handles edge cases', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1050)).toBe('1.1K');
    expect(formatCount(1949)).toBe('1.9K');
    expect(formatCount(1999)).toBe('2K');
  });
});
