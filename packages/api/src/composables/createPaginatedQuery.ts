import type { Ref } from 'vue';
import { ref, shallowRef } from 'vue';
import { getActiveAccountKeySync } from '../auth/account-store';

export interface PaginatedQueryResult<T> {
  data: Ref<T[]>;
  isLoading: Ref<boolean>;
  isLoadingMore: Ref<boolean>;
  error: Ref<Error | null>;
  hasMore: Ref<boolean>;
  loadMore: () => Promise<void>;
  refetch: () => void;
}

export interface PaginatedQueryOptions {
  limit?: number;
  /**
   * Cache key scoping strategy.
   * - 'account' (default): key is prefixed with the active account key.
   * - 'public': key is used as-is. Only for truly public data.
   */
  scope?: 'account' | 'public';
}

const DEFAULT_LIMIT = 20;

// Module-level state — persists across page navigations (same pattern as createQuery)
const registry = new Map<string, {
  data: Ref<any[]>;
  isLoading: Ref<boolean>;
  isLoadingMore: Ref<boolean>;
  error: Ref<Error | null>;
  hasMore: Ref<boolean>;
  maxId: string | undefined;
  knownIds: Set<string>;
}>();
const fetched = new Set<string>();

/**
 * Creates a reactive paginated data result with cursor-based loading.
 *
 * Cache keys are automatically scoped to the active account by default.
 * Pass `{ scope: 'public' }` for data shared across accounts.
 *
 * Unlike createQuery (single-fetch + SWR), this composable:
 * - Supports loadMore() to append older pages via maxId cursor
 * - Caches all accumulated pages across navigations
 * - Does NOT auto-revalidate (explicit refetch() resets everything)
 *
 * Designed for Mastodon endpoints that accept { limit, maxId }.
 */
export function createPaginatedQuery<T extends { id: string }>(
  key: string,
  fetcher: (params: { limit: number; maxId?: string }) => Promise<T[]>,
  options?: PaginatedQueryOptions,
): PaginatedQueryResult<T> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const resolvedKey = options?.scope === 'public'
    ? key
    : `${getActiveAccountKeySync()}:${key}`;

  if (!registry.has(resolvedKey)) {
    registry.set(resolvedKey, {
      data: shallowRef([]),
      isLoading: ref(false),
      isLoadingMore: ref(false),
      error: ref(null),
      hasMore: ref(true),
      maxId: undefined,
      knownIds: new Set(),
    });
  }

  const entry = registry.get(resolvedKey)!;
  const data = entry.data as Ref<T[]>;
  const isLoading = entry.isLoading;
  const isLoadingMore = entry.isLoadingMore;
  const error = entry.error;
  const hasMore = entry.hasMore;

  function dedup(incoming: T[]): T[] {
    const fresh: T[] = [];
    for (const item of incoming) {
      if (!entry.knownIds.has(item.id)) {
        entry.knownIds.add(item.id);
        fresh.push(item);
      }
    }
    return fresh;
  }

  function trackIds(items: T[]) {
    for (const item of items) {
      entry.knownIds.add(item.id);
    }
  }

  async function doInitialFetch() {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await fetcher({ limit });

      entry.knownIds.clear();
      trackIds(result);
      data.value = result;
      hasMore.value = result.length >= limit;
      entry.maxId = result.at(-1)?.id;
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    }
    finally {
      isLoading.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value || error.value)
      return;

    isLoadingMore.value = true;

    try {
      const result = await fetcher({ limit, maxId: entry.maxId });
      const fresh = dedup(result);

      if (fresh.length > 0) {
        data.value = [...data.value, ...fresh];
      }
      hasMore.value = result.length >= limit;
      if (result.length > 0) {
        entry.maxId = result.at(-1)!.id;
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    }
    finally {
      isLoadingMore.value = false;
    }
  }

  function refetch() {
    entry.knownIds.clear();
    entry.maxId = undefined;
    data.value = [];
    hasMore.value = true;
    fetched.delete(resolvedKey);
    doInitialFetch();
    fetched.add(resolvedKey);
  }

  // First access — fetch. Subsequent — return cached data.
  if (!fetched.has(resolvedKey)) {
    fetched.add(resolvedKey);
    doInitialFetch();
  }

  return { data, isLoading, isLoadingMore, error, hasMore, loadMore, refetch };
}

/**
 * Clear all paginated query caches. Call on logout / mode switch.
 */
export function invalidateAllPaginatedQueries() {
  registry.clear();
  fetched.clear();
}

/** Reset all state — for testing only */
export function _resetPaginatedQueryCache() {
  registry.clear();
  fetched.clear();
}
