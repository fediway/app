const TRAILING_DOT_ZERO_RE = /\.0$/;

/**
 * Format a number for compact display (e.g. 1500 → "1.5k", 2300000 → "2.3m").
 * Uses lowercase suffixes to align with packages/ui convention.
 */
export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(TRAILING_DOT_ZERO_RE, '')}m`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(TRAILING_DOT_ZERO_RE, '')}k`;
  }
  return count.toString();
}
