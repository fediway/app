import { flushPromises, makeStatus } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock account key
vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => 'testuser@instance.social',
}));

// Dynamic imports after mock setup
const { clearAllAccountState } = await import('../../src/auth/account-state-cleanup');
const { _resetQueryCache, createQuery } = await import('../../src/composables/createQuery');
const { _resetPaginatedQueryCache, createPaginatedQuery } = await import('../../src/composables/createPaginatedQuery');
const { useStatusStore } = await import('../../src/composables/useStatusStore');
const { resetFollowsState } = await import('../../src/composables/queries/useFollows');

// Mock useClient for useFollows
vi.mock('../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        accounts: {
          relationships: { list: vi.fn(() => Promise.resolve([])) },
          $select: () => ({
            follow: vi.fn(() => Promise.resolve({})),
            unfollow: vi.fn(() => Promise.resolve({})),
          }),
        },
      },
    },
  }),
}));

beforeEach(() => {
  _resetQueryCache();
  _resetPaginatedQueryCache();
  useStatusStore().clear();
  resetFollowsState();
});

afterEach(() => {
  _resetQueryCache();
  _resetPaginatedQueryCache();
  useStatusStore().clear();
  resetFollowsState();
  vi.restoreAllMocks();
});

describe('clearAllAccountState', () => {
  it('clears createQuery cache — next access is a cold load', async () => {
    const fetcher1 = vi.fn(() => Promise.resolve('cached'));
    createQuery('test', '', fetcher1);
    await flushPromises();

    clearAllAccountState();

    const fetcher2 = vi.fn(() => Promise.resolve('fresh'));
    const result = createQuery('test', 'default', fetcher2);

    expect(result.isLoading.value).toBe(true); // Cold load
    expect(result.data.value).toBe('default'); // Not 'cached'
  });

  it('clears createPaginatedQuery cache', async () => {
    const fetcher1 = vi.fn(() => Promise.resolve([makeStatus('1')]));
    createPaginatedQuery('paginated-test', fetcher1);
    await flushPromises();

    clearAllAccountState();

    const fetcher2 = vi.fn(() => Promise.resolve([makeStatus('2')]));
    const result = createPaginatedQuery('paginated-test', fetcher2);

    expect(result.isLoading.value).toBe(true); // Cold load
    await flushPromises();
    expect(result.data.value[0]!.id).toBe('2'); // Fresh data
  });

  it('clears status store', async () => {
    const store = useStatusStore();
    store.set(makeStatus('1') as any);
    store.set(makeStatus('2') as any);

    expect(store.size.value).toBe(2);

    clearAllAccountState();

    expect(store.size.value).toBe(0);
  });

  it('clears all state in one call — no partial cleanup', async () => {
    // Populate query cache
    const fetcher = vi.fn(() => Promise.resolve('data'));
    createQuery('q1', '', fetcher);
    await flushPromises();

    // Populate paginated cache
    const pFetcher = vi.fn(() => Promise.resolve([makeStatus('1')]));
    createPaginatedQuery('pq1', pFetcher);
    await flushPromises();

    // Populate status store
    const store = useStatusStore();
    store.set(makeStatus('99') as any);

    // Clear everything
    clearAllAccountState();

    // Verify ALL cleared
    const freshFetcher = vi.fn(() => Promise.resolve('new'));
    const qResult = createQuery('q1', 'default', freshFetcher);
    expect(qResult.isLoading.value).toBe(true); // Cold load

    const freshPFetcher = vi.fn(() => Promise.resolve([makeStatus('50')]));
    const pResult = createPaginatedQuery('pq1', freshPFetcher);
    expect(pResult.isLoading.value).toBe(true); // Cold load

    expect(store.size.value).toBe(0);
  });
});
