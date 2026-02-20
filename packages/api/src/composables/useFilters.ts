import type { mastodon } from 'masto';
import { ref, shallowRef } from 'vue';
import { useClient } from './useClient';

export interface CreateFilterParams {
  title: string;
  context: mastodon.v2.FilterContext[];
  filterAction?: mastodon.v2.FilterAction;
  expiresIn?: number;
  keywordsAttributes?: Array<{ keyword: string; wholeWord?: boolean }>;
}

export interface UpdateFilterParams {
  title?: string;
  context?: mastodon.v2.FilterContext[];
  filterAction?: mastodon.v2.FilterAction;
  expiresIn?: number;
  /** Existing keywords need `id`. Omit `id` to add new. Set `_destroy: true` to remove. */
  keywordsAttributes?: Array<{ id?: string; keyword?: string; wholeWord?: boolean; _destroy?: boolean }>;
}

export interface FilterError {
  action: 'fetch' | 'fetchOne' | 'create' | 'update' | 'remove';
  filterId?: string;
  error: Error;
}

export interface UseFiltersOptions {
  onError?: (e: FilterError) => void;
}

export interface UseFiltersReturn {
  filters: ReturnType<typeof shallowRef<mastodon.v2.Filter[]>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  fetchFilters: () => Promise<void>;
  fetchFilter: (id: string) => Promise<mastodon.v2.Filter | undefined>;
  createFilter: (params: CreateFilterParams) => Promise<mastodon.v2.Filter | undefined>;
  updateFilter: (id: string, params: UpdateFilterParams) => Promise<mastodon.v2.Filter | undefined>;
  removeFilter: (id: string) => Promise<void>;
}

export function useFilters(options?: UseFiltersOptions): UseFiltersReturn {
  const client = useClient();

  const filters = shallowRef<mastodon.v2.Filter[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchFilters(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await client.rest.v2.filters.list();
      filters.value = result as mastodon.v2.Filter[];
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch filters');
      error.value = e;
      options?.onError?.({ action: 'fetch', error: e });
    }
    finally {
      isLoading.value = false;
    }
  }

  async function fetchFilter(id: string): Promise<mastodon.v2.Filter | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v2.filters.$select(id).fetch();
      return result as mastodon.v2.Filter;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch filter');
      error.value = e;
      options?.onError?.({ action: 'fetchOne', filterId: id, error: e });
      return undefined;
    }
  }

  async function createFilter(params: CreateFilterParams): Promise<mastodon.v2.Filter | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v2.filters.create(params as Parameters<typeof client.rest.v2.filters.create>[0]);
      const created = result as mastodon.v2.Filter;
      filters.value = [...filters.value, created];
      return created;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create filter');
      error.value = e;
      options?.onError?.({ action: 'create', error: e });
      return undefined;
    }
  }

  async function updateFilter(id: string, params: UpdateFilterParams): Promise<mastodon.v2.Filter | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v2.filters.$select(id).update(params as Parameters<ReturnType<typeof client.rest.v2.filters.$select>['update']>[0]);
      const updated = result as mastodon.v2.Filter;
      filters.value = filters.value.map(f => f.id === id ? updated : f);
      return updated;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update filter');
      error.value = e;
      options?.onError?.({ action: 'update', filterId: id, error: e });
      return undefined;
    }
  }

  async function removeFilter(id: string): Promise<void> {
    try {
      error.value = null;
      await client.rest.v2.filters.$select(id).remove();
      filters.value = filters.value.filter(f => f.id !== id);
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to remove filter');
      error.value = e;
      options?.onError?.({ action: 'remove', filterId: id, error: e });
    }
  }

  return {
    filters,
    isLoading,
    error,
    fetchFilters,
    fetchFilter,
    createFilter,
    updateFilter,
    removeFilter,
  };
}
