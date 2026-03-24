import type { Ref } from 'vue';
import { ref, shallowRef } from 'vue';

export interface DataResult<T> {
  data: Ref<T>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  refetch: () => void;
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
 * Stale-while-revalidate:
 * - First call: fires fetch, shows loading spinner
 * - Subsequent calls with same key: returns cached data instantly,
 *   re-fetches in background (no spinner, silent update)
 * - refetch(): forces a re-fetch
 */
export function createDataResult<T>(
  key: string,
  defaultValue: T,
  fetcher: () => Promise<T>,
): DataResult<T> {
  if (!registry.has(key)) {
    registry.set(key, {
      data: shallowRef(defaultValue),
      isLoading: ref(false),
      error: ref<Error | null>(null),
    });
  }

  const entry = registry.get(key)!;
  const data = entry.data as Ref<T>;
  const isLoading = entry.isLoading;
  const error = entry.error;

  // Always store the latest fetcher so in-flight completions can detect changes
  latestFetcher.set(key, fetcher);

  function doFetch() {
    const currentFetcher = latestFetcher.get(key)!;

    // Only show loading spinner if no data yet (cold load)
    const isEmpty = data.value === defaultValue
      || (Array.isArray(data.value) && data.value.length === 0)
      || data.value === undefined;
    if (isEmpty) {
      isLoading.value = true;
    }
    error.value = null;

    // Sequence counter — only the latest fetch writes to data
    const seq = (fetchSeq.get(key) ?? 0) + 1;
    fetchSeq.set(key, seq);

    currentFetcher()
      .then((result) => {
        if (fetchSeq.get(key) === seq) {
          data.value = result;
        }
      })
      .catch((err) => {
        if (fetchSeq.get(key) === seq) {
          error.value = err instanceof Error ? err : new Error(String(err));
        }
      })
      .finally(() => {
        if (fetchSeq.get(key) === seq) {
          isLoading.value = false;
          inFlight.delete(key);

          // If the fetcher changed while we were in-flight, re-fetch
          if (latestFetcher.get(key) !== currentFetcher) {
            inFlight.add(key);
            doFetch();
          }
        }
      });
  }

  if (!fetched.has(key)) {
    // First access — fetch with loading spinner
    fetched.add(key);
    inFlight.add(key);
    doFetch();
  }
  else if (!inFlight.has(key)) {
    // Revisit — revalidate silently in background (no spinner)
    inFlight.add(key);
    doFetch();
  }
  // else: in-flight with same or different fetcher — doFetch will
  // detect the fetcher change on completion and re-fetch automatically

  function refetch() {
    fetched.add(key);
    doFetch();
  }

  return { data, isLoading, error, refetch };
}

/**
 * Clear all module-level caches. Call on logout / mode switch.
 */
export function clearAllCaches() {
  registry.clear();
  fetched.clear();
  inFlight.clear();
  fetchSeq.clear();
  latestFetcher.clear();
}

/** Reset all state — for testing only */
export function _resetDataHelpers() {
  registry.clear();
  fetched.clear();
  inFlight.clear();
  fetchSeq.clear();
  latestFetcher.clear();
}
