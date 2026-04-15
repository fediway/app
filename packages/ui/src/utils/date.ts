// Every formatter routes its locale through `resolveLocale` — the single
// seam for future i18n. Pluralization and special forms ("today", "in 3
// minutes", "last year") come from `Intl.RelativeTimeFormat`, so no English
// phrases are baked in here.

export type DateInput = Date | string | number | null | undefined;

export interface FormatDateOptions {
  locale?: string;
  /** Override for testing. */
  now?: Date;
}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

// Pass-through today. When i18n lands, read from a user-locale composable
// here and every call site becomes locale-aware without further edits.
function resolveLocale(locale?: string): string | undefined {
  return locale;
}

function toDate(input: DateInput): Date | null {
  if (input == null || input === '')
    return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfLocalDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Long relative duration — "yesterday", "3 days ago", "in 5 hours".
 *
 * Month ≈ 30 days, year ≈ 365 days. Calendar-precise math is not worth a
 * dependency for coarse copy like account age or event timing.
 */
export function formatRelativeDuration(
  input: DateInput,
  { locale, now }: FormatDateOptions = {},
): string {
  const date = toDate(input);
  if (!date)
    return '';

  const ref = now ?? new Date();
  const formatter = new Intl.RelativeTimeFormat(resolveLocale(locale), {
    numeric: 'auto',
    style: 'long',
  });

  const diffMs = date.getTime() - ref.getTime();
  const sign = diffMs < 0 ? -1 : 1;
  const abs = Math.abs(diffMs);

  if (abs < MINUTE)
    return formatter.format(0, 'second');
  if (abs < HOUR)
    return formatter.format(sign * Math.floor(abs / MINUTE), 'minute');
  if (abs < DAY)
    return formatter.format(sign * Math.floor(abs / HOUR), 'hour');
  if (abs < MONTH)
    return formatter.format(sign * Math.floor(abs / DAY), 'day');
  if (abs < YEAR)
    return formatter.format(sign * Math.floor(abs / MONTH), 'month');
  return formatter.format(sign * Math.floor(abs / YEAR), 'year');
}

/**
 * Compact stream timestamp — "5m", "3h", "2d", "1w". Past only.
 *
 * Unit letters are ASCII and intentionally untranslated: compact columns
 * need a stable character budget that localized unit strings cannot
 * guarantee. For narrative text use `formatRelativeDuration` instead.
 */
export function formatCompactTimestamp(
  input: DateInput,
  { locale, now }: FormatDateOptions = {},
): string {
  const date = toDate(input);
  if (!date)
    return '';

  const ref = now ?? new Date();
  const diffMs = ref.getTime() - date.getTime();

  if (diffMs < MINUTE)
    return 'now';
  if (diffMs < HOUR)
    return `${Math.floor(diffMs / MINUTE)}m`;
  if (diffMs < DAY)
    return `${Math.floor(diffMs / HOUR)}h`;

  const days = Math.floor(diffMs / DAY);
  if (days < 7)
    return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52)
    return `${weeks}w`;

  return date.toLocaleDateString(resolveLocale(locale), {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== ref.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Calendar-bucket label — "today", "yesterday", a weekday, or a short date.
 *
 * Buckets by calendar day, not elapsed time: 23:55 and 00:05 land in
 * different buckets though only ten minutes apart. Use for chronological
 * group headers; for durations use `formatRelativeDuration`.
 *
 * Output is lowercase where Intl lowercases it. Apply CSS
 * `first-letter:uppercase` in sentence-start contexts to stay correct
 * across non-Latin scripts.
 */
export function formatCalendarLabel(
  input: DateInput,
  { locale, now }: FormatDateOptions = {},
): string {
  const date = toDate(input);
  if (!date)
    return '';

  const ref = now ?? new Date();
  const resolved = resolveLocale(locale);

  const target = startOfLocalDay(date);
  const today = startOfLocalDay(ref);
  const dayDelta = Math.round((target.getTime() - today.getTime()) / DAY);

  if (dayDelta === 0 || Math.abs(dayDelta) === 1) {
    return new Intl.RelativeTimeFormat(resolved, { numeric: 'auto', style: 'long' })
      .format(dayDelta, 'day');
  }

  if (Math.abs(dayDelta) < 7)
    return date.toLocaleDateString(resolved, { weekday: 'long' });

  return date.toLocaleDateString(resolved, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== ref.getFullYear() ? 'numeric' : undefined,
  });
}

/** Locale-aware time of day — "2:34 PM" in en-US, "14:34" in de-DE. */
export function formatTimeOfDay(
  input: DateInput,
  { locale }: Pick<FormatDateOptions, 'locale'> = {},
): string {
  const date = toDate(input);
  if (!date)
    return '';

  return date.toLocaleTimeString(resolveLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Long full date for tooltips — "Monday, March 5, 2024 at 2:34 PM" in en-US. */
export function formatFullDate(
  input: DateInput,
  { locale }: Pick<FormatDateOptions, 'locale'> = {},
): string {
  const date = toDate(input);
  if (!date)
    return '';

  return date.toLocaleString(resolveLocale(locale), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
