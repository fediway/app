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

/**
 * Creates a reactive data result with loading/error tracking.
 *
 * - First call: fires fetch, tracks loading/error
 * - Subsequent calls with same key: returns cached refs (no re-fetch)
 * - refetch(): clears error, re-fetches
 * - Cache-first: shows existing data while refreshing in background
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

  function doFetch() {
    // Only show loading spinner if no data yet
    const isEmpty = data.value === defaultValue
      || (Array.isArray(data.value) && data.value.length === 0)
      || data.value === undefined;
    if (isEmpty) {
      isLoading.value = true;
    }
    error.value = null;

    fetcher()
      .then((result) => {
        data.value = result;
      })
      .catch((err) => {
        error.value = err instanceof Error ? err : new Error(String(err));
        fetched.delete(key);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  // Auto-fetch on first access
  if (!fetched.has(key)) {
    fetched.add(key);
    doFetch();
  }

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
}
