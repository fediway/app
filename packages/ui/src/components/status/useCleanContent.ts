import type { Tag } from '@repo/types';
import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';

// Mastodon wraps URLs in <span class="invisible/ellipsis"> inside the anchor,
// so we must allow nested tags inside <a>…</a> (use [\s\S]*? not [^<]*).
const QUOTE_RE = /<p[^>]*>\s*RE:\s*(?:<a[^>]*>[\s\S]*?<\/a>|https?:\/\/\S+)\s*<\/p>/i;

// Captures the href from the RE: paragraph's anchor tag, or a plain URL.
const QUOTE_URL_RE = /<p[^>]*>\s*RE:\s*(?:<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>|(https?:\/\/\S+))\s*<\/p>/i;

// Matches a trailing <p> that contains ONLY hashtag links and whitespace.
// Uses [^<]* instead of .*? to prevent catastrophic backtracking.
const TRAILING_HASHTAGS_RE = /<p>\s*(?:<a[^>]*class="[^"]*hashtag[^"]*"[^>]*>[^<]*<\/a>\s*)+<\/p>$/i;

/**
 * Extracts the quoted status URL from a "RE: <url>" paragraph in status HTML.
 * Returns null if no quote reference is found.
 */
export function extractQuoteUrl(html: string): string | null {
  const match = QUOTE_URL_RE.exec(html);
  if (!match)
    return null;
  return match[1] ?? match[2] ?? null;
}

/**
 * Strips ActivityPub artifacts from status content:
 * - "RE: https://..." quote references (always stripped — resolved as embedded quote card)
 * - Trailing paragraph of pure hashtags (when shown as tag pills)
 */
export function useCleanContent(
  content: MaybeRefOrGetter<string>,
  tags: MaybeRefOrGetter<Tag[]>,
) {
  return computed(() => {
    let html = toValue(content);

    // Always strip "RE: https://..." — the quote is either already resolved
    // as a card or will be resolved lazily by useQuoteResolver
    html = html.replace(QUOTE_RE, '');

    // Strip trailing paragraph if it's entirely hashtags (we show them as pills)
    if (toValue(tags).length > 0) {
      html = html.replace(TRAILING_HASHTAGS_RE, '');
    }

    return html.trim();
  });
}
