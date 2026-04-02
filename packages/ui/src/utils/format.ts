const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCount(n: number): string {
  return compactFormatter.format(n);
}
