import type { Tag } from '@repo/types';
import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';

const QUOTE_RE = /<p[^>]*>RE:\s*<a[^>]*>.*?<\/a>\s*<\/p>/i;

// Matches a <p> that contains ONLY hashtag links and whitespace
const TRAILING_HASHTAGS_RE = /<p>\s*(?:<a[^>]*class="[^"]*hashtag[^"]*"[^>]*>.*?<\/a>\s*)+<\/p>$/i;

/**
 * Strips ActivityPub artifacts from status content:
 * - "RE: https://..." quote references (when a quote card is shown)
 * - Trailing paragraph of pure hashtags (when shown as tag pills)
 */
export function useCleanContent(
  content: MaybeRefOrGetter<string>,
  tags: MaybeRefOrGetter<Tag[]>,
  hasQuote: MaybeRefOrGetter<boolean>,
) {
  return computed(() => {
    let html = toValue(content);

    // Strip "RE: https://..." if we're showing the actual quote card
    if (toValue(hasQuote)) {
      html = html.replace(QUOTE_RE, '');
    }

    // Strip trailing paragraph if it's entirely hashtags (we show them as pills)
    if (toValue(tags).length > 0) {
      html = html.replace(TRAILING_HASHTAGS_RE, '');
    }

    return html.trim();
  });
}
