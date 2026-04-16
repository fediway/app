import type { FediwayStatus, Status } from '@repo/types';
import type { MaybeRefOrGetter } from 'vue';
import { toValue, watch } from 'vue';
import { useClient } from './useClient';
import { useStatusStore } from './useStatusStore';

// Duplicated from @repo/ui's useCleanContent — kept in sync via tests.
// Can't import from @repo/ui because @repo/api doesn't depend on it.
const QUOTE_URL_RE = /<p[^>]*>\s*RE:\s*(?:<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>|(https?:\/\/\S+))\s*<\/p>/i;

function extractQuoteUrl(html: string): string | null {
  const match = QUOTE_URL_RE.exec(html);
  if (!match)
    return null;
  return match[1] ?? match[2] ?? null;
}

/**
 * Watches a list of statuses and lazily resolves unresolved quote references.
 *
 * Some Mastodon servers include a "RE: <url>" paragraph in the HTML content
 * for quote posts but don't populate the structured `quote` field. This
 * composable detects those, resolves the URL via the search API, and patches
 * the status store so the quote card renders reactively.
 */
export function useQuoteResolver(statuses: MaybeRefOrGetter<Status[]>) {
  const client = useClient();
  const store = useStatusStore();

  // Track URLs we've already attempted to avoid duplicate requests
  const attempted = new Set<string>();

  async function resolve(status: Status) {
    const inner = status.reblog ?? status;
    if (inner.quote)
      return;

    const url = extractQuoteUrl(inner.content);
    if (!url || attempted.has(url))
      return;

    attempted.add(url);

    try {
      const result = await client.rest.v2.search.list({
        q: url,
        type: 'statuses',
        resolve: true,
        limit: 1,
      });

      const quotedStatus = result.statuses[0];
      if (quotedStatus) {
        store.patch(inner.id, {
          quote: { state: 'accepted', quotedStatus },
        } as Partial<FediwayStatus>);
        store.commitMutation(inner.id);
      }
    }
    catch {
      // Resolution failed silently — the RE: text is already stripped from display
    }
  }

  watch(
    () => toValue(statuses),
    (list) => {
      for (const status of list) {
        resolve(status);
      }
    },
    { immediate: true },
  );
}
