import type { Ref } from 'vue';
import { ref, shallowRef } from 'vue';
import { getActiveAccountKeySync } from '../auth/account-store';

export interface QueryResult<T> {
  data: Ref<T>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  refetch: () => void;
}

export interface QueryOptions {
  /**
   * Cache key scoping strategy.
   * - 'account' (default): key is prefixed with the active account key.
   *   Different accounts get separate cache entries. Use for any per-user data.
   * - 'public': key is used as-is. Shared across accounts.
   *   Only for truly public data (trending, explore).
   */
  scope?: 'account' | 'public';
}

// Module-level state — persists across page navigations
const registry = new Map<string, { data: Ref<any>; isLoading: Ref<boolean>; error: Ref<Error | null> }>();
const fetched = new Set<string>();
const inFlight = new Set<string>();
const fetchSeq = new Map<string, number>();
const latestFetcher = new Map<string, () => Promise<any>>();

/**
 * Creates a reactive data result with loading/error tracking.
 *
 * Cache keys are automatically scoped to the active account by default,
 * preventing cross-account data leakage. Pass `{ scope: 'public' }` for
 * data that is genuinely shared (trending, explore).
 *
 * Stale-while-revalidate:
 * - First call: fires fetch, shows loading spinner
 * - Subsequent calls with same key: returns cached data instantly,
 *   re-fetches in background (no spinner, silent update)
 * - refetch(): forces a re-fetch
 */
export function createQuery<T>(
  key: string,
  defaultValue: T,
  fetcher: () => Promise<T>,
  options?: QueryOptions,
): QueryResult<T> {
  const resolvedKey = options?.scope === 'public'
    ? key
    : `${getActiveAccountKeySync()}:${key}`;

  if (!registry.has(resolvedKey)) {
    registry.set(resolvedKey, {
      data: shallowRef(defaultValue),
      isLoading: ref(false),
      error: ref<Error | null>(null),
    });
  }

  const entry = registry.get(resolvedKey)!;
  const data = entry.data as Ref<T>;
  const isLoading = entry.isLoading;
  const error = entry.error;

  // Always store the latest fetcher so in-flight completions can detect changes
  latestFetcher.set(resolvedKey, fetcher);

  function doFetch() {
    const currentFetcher = latestFetcher.get(resolvedKey)!;

    // Only show loading spinner if no data yet (cold load)
    const isEmpty = data.value === defaultValue
      || (Array.isArray(data.value) && data.value.length === 0)
      || data.value === undefined;
    if (isEmpty) {
      isLoading.value = true;
      error.value = null; // Clear error on cold load / retry (not during revalidation)
    }

    // Sequence counter — only the latest fetch writes to data
    const seq = (fetchSeq.get(resolvedKey) ?? 0) + 1;
    fetchSeq.set(resolvedKey, seq);

    let fetchPromise: Promise<T>;
    try {
      fetchPromise = currentFetcher();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      isLoading.value = false;
      inFlight.delete(resolvedKey);
      return;
    }

    fetchPromise
      .then((result) => {
        if (fetchSeq.get(resolvedKey) === seq) {
          data.value = result;
          error.value = null; // Clear any previous error on success
        }
      })
      .catch((err) => {
        if (fetchSeq.get(resolvedKey) === seq) {
          // Only set error if no data exists (cold load failure).
          // During revalidation, keep stale data visible — don't replace
          // a working view with an error screen because of a transient failure.
          const hasData = data.value !== defaultValue
            && !(Array.isArray(data.value) && data.value.length === 0)
            && data.value !== undefined;
          if (!hasData) {
            error.value = err instanceof Error ? err : new Error(String(err));
          }
        }
      })
      .finally(() => {
        if (fetchSeq.get(resolvedKey) === seq) {
          isLoading.value = false;
          inFlight.delete(resolvedKey);

          // If the fetcher changed while we were in-flight, re-fetch
          if (latestFetcher.get(resolvedKey) !== currentFetcher) {
            inFlight.add(resolvedKey);
            doFetch();
          }
        }
      });
  }

  if (!fetched.has(resolvedKey)) {
    // First access — fetch with loading spinner
    fetched.add(resolvedKey);
    inFlight.add(resolvedKey);
    doFetch();
  }
  else if (!inFlight.has(resolvedKey)) {
    // Revisit — revalidate silently in background (no spinner)
    inFlight.add(resolvedKey);
    doFetch();
  }
  // else: in-flight with same or different fetcher — doFetch will
  // detect the fetcher change on completion and re-fetch automatically

  function refetch() {
    fetched.add(resolvedKey);
    doFetch();
  }

  return { data, isLoading, error, refetch };
}

/**
 * Clear all module-level caches. Call on logout / mode switch.
 */
export function invalidateAllQueries() {
  registry.clear();
  fetched.clear();
  inFlight.clear();
  fetchSeq.clear();
  latestFetcher.clear();
}

/** Reset all state — for testing only */
export function _resetQueryCache() {
  registry.clear();
  fetched.clear();
  inFlight.clear();
  fetchSeq.clear();
  latestFetcher.clear();
}
