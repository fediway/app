import { flushPromises, makeStatus } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the account key — tests can change this to simulate account switches
let mockAccountKey = 'testuser@instance.social';
vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => mockAccountKey,
}));

// Dynamic import AFTER mock setup
const { _resetPaginatedQueryCache, createPaginatedQuery, invalidateAllPaginatedQueries }
  = await import('../../src/composables/createPaginatedQuery');

beforeEach(() => {
  _resetPaginatedQueryCache();
  mockAccountKey = 'testuser@instance.social';
});

afterEach(() => {
  _resetPaginatedQueryCache();
  vi.restoreAllMocks();
});

function makeItems(count: number, startId = 1) {
  return Array.from({ length: count }, (_, i) => makeStatus(String(startId + i)));
}

describe('createPaginatedQuery', () => {
  it('fetches initial page and populates data', async () => {
    const items = makeItems(5);
    const fetcher = vi.fn(() => Promise.resolve(items));

    const result = createPaginatedQuery('test', fetcher);

    expect(result.isLoading.value).toBe(true);
    expect(result.data.value).toEqual([]);

    await flushPromises();

    expect(result.data.value).toEqual(items);
    expect(result.isLoading.value).toBe(false);
    expect(fetcher).toHaveBeenCalledWith({ limit: 20, maxId: undefined });
  });

  it('sets hasMore=false when result is less than limit', async () => {
    const fetcher = vi.fn(() => Promise.resolve(makeItems(3)));
    const result = createPaginatedQuery('test', fetcher, { limit: 5 });

    await flushPromises();

    expect(result.hasMore.value).toBe(false);
  });

  it('sets hasMore=true when result equals limit', async () => {
    const fetcher = vi.fn(() => Promise.resolve(makeItems(5)));
    const result = createPaginatedQuery('test', fetcher, { limit: 5 });

    await flushPromises();

    expect(result.hasMore.value).toBe(true);
  });

  it('loadMore appends next page using maxId cursor', async () => {
    const page1 = makeItems(3, 1);
    const page2 = makeItems(3, 10);
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const result = createPaginatedQuery('test', fetcher, { limit: 3 });
    await flushPromises();

    expect(result.data.value).toEqual(page1);

    await result.loadMore();

    expect(result.data.value).toEqual([...page1, ...page2]);
    expect(fetcher).toHaveBeenLastCalledWith({ limit: 3, maxId: '3' });
  });

  it('loadMore deduplicates items', async () => {
    const page1 = makeItems(2, 1);
    const page2 = [makeStatus('2'), makeStatus('3')]; // '2' is a duplicate
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const result = createPaginatedQuery('test', fetcher, { limit: 2 });
    await flushPromises();
    await result.loadMore();

    const ids = result.data.value.map((s: any) => s.id);
    expect(ids).toEqual(['1', '2', '3']); // No duplicate '2'
  });

  it('loadMore does not fire when hasMore is false', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeItems(1));
    const result = createPaginatedQuery('test', fetcher, { limit: 5 });
    await flushPromises();

    expect(result.hasMore.value).toBe(false);
    await result.loadMore();

    expect(fetcher).toHaveBeenCalledTimes(1); // Only initial fetch
  });

  it('loadMore does not fire when error is set', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(makeItems(5))
      .mockRejectedValueOnce(new Error('fail'));

    const result = createPaginatedQuery('test', fetcher, { limit: 5 });
    await flushPromises();

    await result.loadMore(); // This fails
    expect(result.error.value).toBeInstanceOf(Error);

    await result.loadMore(); // Should not fire — error is set
    expect(fetcher).toHaveBeenCalledTimes(2); // Not 3
  });

  it('sets error on initial fetch failure', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('network')));
    const result = createPaginatedQuery('test', fetcher);

    await flushPromises();

    expect(result.error.value?.message).toBe('network');
    expect(result.isLoading.value).toBe(false);
  });

  it('refetch resets state and re-fetches from scratch', async () => {
    const page1 = makeItems(3, 1);
    const page2 = makeItems(3, 10);
    const fetcher = vi.fn()
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const result = createPaginatedQuery('test', fetcher, { limit: 3 });
    await flushPromises();

    result.refetch();
    await flushPromises();

    expect(result.data.value).toEqual(page2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('returns cached data on subsequent access (no re-fetch)', async () => {
    const fetcher = vi.fn(() => Promise.resolve(makeItems(2)));

    const result1 = createPaginatedQuery('cached', fetcher);
    await flushPromises();

    const result2 = createPaginatedQuery('cached', fetcher);

    expect(result2.data.value).toEqual(result1.data.value);
    expect(fetcher).toHaveBeenCalledTimes(1); // Only one fetch
  });

  describe('account scoping', () => {
    it('different accounts get separate cache entries for same key', async () => {
      const aliceData = makeItems(2, 1);
      const bobData = makeItems(2, 10);

      mockAccountKey = 'alice@mastodon.social';
      const fetcher1 = vi.fn(() => Promise.resolve(aliceData));
      const result1 = createPaginatedQuery('favourites', fetcher1);
      await flushPromises();

      expect(result1.data.value).toEqual(aliceData);

      // Switch to bob
      mockAccountKey = 'bob@fosstodon.org';
      const fetcher2 = vi.fn(() => Promise.resolve(bobData));
      const result2 = createPaginatedQuery('favourites', fetcher2);

      expect(result2.isLoading.value).toBe(true); // Fresh fetch, not cached
      await flushPromises();

      expect(result2.data.value).toEqual(bobData);
      // Alice's data is untouched
      expect(result1.data.value).toEqual(aliceData);
    });

    it('scope: public shares cache across accounts', async () => {
      const publicData = makeItems(3);
      const fetcher = vi.fn(() => Promise.resolve(publicData));

      mockAccountKey = 'alice@mastodon.social';
      createPaginatedQuery('trending', fetcher, { scope: 'public' });
      await flushPromises();

      mockAccountKey = 'bob@fosstodon.org';
      const result2 = createPaginatedQuery('trending', fetcher, { scope: 'public' });

      // Should return cached data — same key, no re-fetch
      expect(result2.data.value).toEqual(publicData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('concurrent loadMore calls are guarded — only one fires', async () => {
      let resolveSecondPage: (v: any) => void;
      const fetcher = vi.fn()
        .mockResolvedValueOnce(makeItems(5))
        .mockImplementationOnce(() => new Promise((r) => { resolveSecondPage = r; }));

      const result = createPaginatedQuery('concurrent', fetcher, { limit: 5 });
      await flushPromises();

      // Fire two loadMore calls simultaneously
      const p1 = result.loadMore();
      const p2 = result.loadMore(); // Should be blocked — isLoadingMore is true

      expect(result.isLoadingMore.value).toBe(true);

      resolveSecondPage!(makeItems(3, 10));
      await p1;
      await p2;

      // Only 2 fetcher calls total (initial + 1 loadMore, not 2)
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('loadMore blocked during initial loading', async () => {
      let resolveInitial: (v: any) => void;
      const fetcher = vi.fn(() => new Promise((r) => {
        resolveInitial = r;
      }));

      const result = createPaginatedQuery('loading-guard', fetcher, { limit: 5 });

      // Initial fetch is in-flight
      expect(result.isLoading.value).toBe(true);

      await result.loadMore(); // Should be blocked — isLoading is true
      expect(fetcher).toHaveBeenCalledTimes(1); // Only initial fetch

      resolveInitial!(makeItems(5));
      await flushPromises();
    });

    it('isLoadingMore is false during initial fetch', async () => {
      const fetcher = vi.fn(() => Promise.resolve(makeItems(3)));
      const result = createPaginatedQuery('state-test', fetcher);

      expect(result.isLoading.value).toBe(true);
      expect(result.isLoadingMore.value).toBe(false); // Distinct from isLoading
      await flushPromises();
    });

    it('empty first page sets hasMore=false and shows no sentinel', async () => {
      const fetcher = vi.fn(() => Promise.resolve([]));
      const result = createPaginatedQuery('empty', fetcher, { limit: 20 });
      await flushPromises();

      expect(result.data.value).toEqual([]);
      expect(result.hasMore.value).toBe(false);
      expect(result.isLoading.value).toBe(false);
    });

    it('error during loadMore preserves existing data', async () => {
      const page1 = makeItems(5);
      const fetcher = vi.fn()
        .mockResolvedValueOnce(page1)
        .mockRejectedValueOnce(new Error('network'));

      const result = createPaginatedQuery('error-preserve', fetcher, { limit: 5 });
      await flushPromises();

      await result.loadMore();

      // Data from page 1 is preserved
      expect(result.data.value).toEqual(page1);
      expect(result.error.value?.message).toBe('network');
    });
  });

  it('invalidateAllPaginatedQueries clears all cached data', async () => {
    const fetcher = vi.fn(() => Promise.resolve(makeItems(2)));
    createPaginatedQuery('test', fetcher);
    await flushPromises();

    invalidateAllPaginatedQueries();

    const fetcher2 = vi.fn(() => Promise.resolve(makeItems(3)));
    const result = createPaginatedQuery('test', fetcher2);

    expect(result.isLoading.value).toBe(true); // Cold load
    await flushPromises();

    expect(result.data.value.length).toBe(3); // New data
  });
});
