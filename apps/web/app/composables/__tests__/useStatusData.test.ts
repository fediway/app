import type { Context, Status } from '@repo/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetDataHelpers } from '../useDataHelpers';

// Mock @repo/api
const mockStatusFetch = vi.fn();
const mockContextFetch = vi.fn();
const mockStoreSet = vi.fn();
const mockStoreSetMany = vi.fn();

vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        statuses: {
          $select: (_id: string) => ({
            fetch: mockStatusFetch,
            context: { fetch: mockContextFetch },
          }),
        },
      },
    },
  }),
  useStatusStore: () => ({
    set: mockStoreSet,
    setMany: mockStoreSetMany,
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function makeStatus(id: string): Status {
  return { id, content: `Status ${id}` } as unknown as Status;
}

function makeContext(ancestorIds: string[], descendantIds: string[]): Context {
  return {
    ancestors: ancestorIds.map(id => makeStatus(id)),
    descendants: descendantIds.map(id => makeStatus(id)),
  } as Context;
}

afterEach(() => {
  _resetDataHelpers();
  mockStatusFetch.mockReset();
  mockContextFetch.mockReset();
  mockStoreSet.mockReset();
  mockStoreSetMany.mockReset();
});

describe('useStatusData', () => {
  // Dynamic import to ensure mocks are in place
  async function getUseStatusData() {
    const mod = await import('../useStatusData');
    return mod.useStatusData;
  }

  describe('getStatusById', () => {
    it('returns DataResult with correct status after fetch', async () => {
      const status = makeStatus('123');
      mockStatusFetch.mockResolvedValue(status);

      const useStatusData = await getUseStatusData();
      const { getStatusById } = useStatusData();
      const result = getStatusById('123');

      expect(result.data.value).toBeUndefined();
      expect(result.isLoading.value).toBe(true);

      await flushPromises();

      expect(result.data.value).toEqual(status);
      expect(result.isLoading.value).toBe(false);
      expect(result.error.value).toBeNull();
    });

    it('sets status in store via store.set()', async () => {
      const status = makeStatus('456');
      mockStatusFetch.mockResolvedValue(status);

      const useStatusData = await getUseStatusData();
      const { getStatusById } = useStatusData();
      getStatusById('456');

      await flushPromises();

      expect(mockStoreSet).toHaveBeenCalledWith(status);
    });
  });

  describe('getStatusContext', () => {
    it('returns ancestors and descendants', async () => {
      const context = makeContext(['a1', 'a2'], ['d1', 'd2', 'd3']);
      mockContextFetch.mockResolvedValue(context);

      const useStatusData = await getUseStatusData();
      const { getStatusContext } = useStatusData();
      const result = getStatusContext('789');

      await flushPromises();

      expect(result.data.value).toEqual(context);
      expect(result.data.value.ancestors).toHaveLength(2);
      expect(result.data.value.descendants).toHaveLength(3);
      expect(result.isLoading.value).toBe(false);
      expect(result.error.value).toBeNull();
    });

    it('sets all context statuses in store via setMany()', async () => {
      const context = makeContext(['a1'], ['d1', 'd2']);
      mockContextFetch.mockResolvedValue(context);

      const useStatusData = await getUseStatusData();
      const { getStatusContext } = useStatusData();
      getStatusContext('789');

      await flushPromises();

      expect(mockStoreSetMany).toHaveBeenCalledWith([
        ...context.ancestors,
        ...context.descendants,
      ]);
    });

    it('has default value of { ancestors: [], descendants: [] }', async () => {
      mockContextFetch.mockImplementation(() => new Promise(() => {})); // never resolves

      const useStatusData = await getUseStatusData();
      const { getStatusContext } = useStatusData();
      const result = getStatusContext('999');

      expect(result.data.value).toEqual({ ancestors: [], descendants: [] });
      expect(result.isLoading.value).toBe(true);
    });
  });

  describe('caching', () => {
    it('same key returns cached refs (no duplicate fetch)', async () => {
      const status = makeStatus('100');
      mockStatusFetch.mockResolvedValue(status);

      const useStatusData = await getUseStatusData();
      const { getStatusById } = useStatusData();

      const result1 = getStatusById('100');
      await flushPromises();

      const result2 = getStatusById('100');

      // Same ref objects
      expect(result1.data).toBe(result2.data);
      expect(result1.isLoading).toBe(result2.isLoading);
      expect(result1.error).toBe(result2.error);

      // Data is immediately available (cached)
      expect(result2.data.value).toEqual(status);
    });
  });

  describe('error handling', () => {
    it('sets error state on network failure', async () => {
      mockStatusFetch.mockRejectedValue(new Error('network error'));

      const useStatusData = await getUseStatusData();
      const { getStatusById } = useStatusData();
      const result = getStatusById('err');

      await flushPromises();

      expect(result.data.value).toBeUndefined();
      expect(result.isLoading.value).toBe(false);
      expect(result.error.value).toBeInstanceOf(Error);
      expect(result.error.value!.message).toBe('network error');
    });
  });
});
