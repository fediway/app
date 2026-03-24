import type { Status } from '@repo/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetDataHelpers } from '../useDataHelpers';

const mockSetMany = vi.fn();
const mockListFavourites = vi.fn();
const mockListBookmarks = vi.fn();

vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        favourites: { list: mockListFavourites },
        bookmarks: { list: mockListBookmarks },
      },
    },
  }),
  useStatusStore: () => ({
    setMany: mockSetMany,
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

afterEach(() => {
  _resetDataHelpers();
  mockSetMany.mockReset();
  mockListFavourites.mockReset();
  mockListBookmarks.mockReset();
});

function makeStatus(id: string): Status {
  return { id, content: `status-${id}` } as Status;
}

describe('useTimelineData', () => {
  // Dynamic import so mocks are applied
  async function getComposable() {
    const mod = await import('../useTimelineData');
    return mod.useTimelineData();
  }

  describe('getFavouritedStatuses', () => {
    it('fetches and returns favourites', async () => {
      const statuses = [makeStatus('1'), makeStatus('2')];
      mockListFavourites.mockResolvedValue(statuses);

      const { getFavouritedStatuses } = await getComposable();
      const result = getFavouritedStatuses();

      expect(result.data.value).toEqual([]);
      expect(result.isLoading.value).toBe(true);

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(result.isLoading.value).toBe(false);
      expect(mockListFavourites).toHaveBeenCalledWith({ limit: 40 });
    });

    it('sets statuses in store via setMany()', async () => {
      const statuses = [makeStatus('1')];
      mockListFavourites.mockResolvedValue(statuses);

      const { getFavouritedStatuses } = await getComposable();
      getFavouritedStatuses();

      await flushPromises();

      expect(mockSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('getBookmarkedStatuses', () => {
    it('fetches and returns bookmarks', async () => {
      const statuses = [makeStatus('3'), makeStatus('4')];
      mockListBookmarks.mockResolvedValue(statuses);

      const { getBookmarkedStatuses } = await getComposable();
      const result = getBookmarkedStatuses();

      expect(result.data.value).toEqual([]);

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(result.isLoading.value).toBe(false);
      expect(mockListBookmarks).toHaveBeenCalledWith({ limit: 40 });
    });

    it('sets statuses in store via setMany()', async () => {
      const statuses = [makeStatus('5')];
      mockListBookmarks.mockResolvedValue(statuses);

      const { getBookmarkedStatuses } = await getComposable();
      getBookmarkedStatuses();

      await flushPromises();

      expect(mockSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('caching', () => {
    it('same key returns cached refs', async () => {
      mockListFavourites.mockResolvedValue([makeStatus('1')]);

      const { getFavouritedStatuses } = await getComposable();
      const result1 = getFavouritedStatuses();

      await flushPromises();

      const result2 = getFavouritedStatuses();

      expect(result1.data).toBe(result2.data);
      expect(result2.data.value).toEqual([makeStatus('1')]);
    });
  });
});
