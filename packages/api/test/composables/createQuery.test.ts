import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { _resetQueryCache, createQuery, invalidateAllQueries } from '../../src/composables/createQuery';

beforeEach(() => {
  _resetQueryCache();
});

afterEach(() => {
  _resetQueryCache();
});

describe('createQuery', () => {
  it('starts with default value and isLoading=true on first fetch', () => {
    const fetcher = vi.fn(() => new Promise<string>(() => {}));
    const result = createQuery('test', 'default', fetcher);

    expect(result.data.value).toBe('default');
    expect(result.isLoading.value).toBe(true);
    expect(result.error.value).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('populates data when fetch resolves', async () => {
    const fetcher = vi.fn(() => Promise.resolve('hello'));
    const result = createQuery('test', '', fetcher);

    await flushPromises();

    expect(result.data.value).toBe('hello');
    expect(result.isLoading.value).toBe(false);
    expect(result.error.value).toBeNull();
  });

  it('sets error when fetch rejects', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('network fail')));
    const result = createQuery('test', '', fetcher);

    await flushPromises();

    expect(result.data.value).toBe('');
    expect(result.isLoading.value).toBe(false);
    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('network fail');
  });

  it('refetch() re-fetches and updates data', async () => {
    let callCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`call-${++callCount}`));
    const result = createQuery('test', '', fetcher);

    await flushPromises();
    expect(result.data.value).toBe('call-1');

    result.refetch();
    await flushPromises();
    expect(result.data.value).toBe('call-2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('same key returns cached refs (shared state)', async () => {
    const fetcher = vi.fn(() => Promise.resolve('data'));
    const result1 = createQuery('shared', '', fetcher);

    await flushPromises();

    const result2 = createQuery('shared', '', fetcher);

    expect(result2.data.value).toBe('data');
    expect(result1.data).toBe(result2.data);
  });

  it('stale-while-revalidate: revisit shows cached data, no loading spinner', async () => {
    let callCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`v${++callCount}`));

    const result1 = createQuery('swr', '', fetcher);
    await flushPromises();
    expect(result1.data.value).toBe('v1');

    const result2 = createQuery('swr', '', fetcher);

    expect(result2.data.value).toBe('v1');
    expect(result2.isLoading.value).toBe(false);

    await flushPromises();
    expect(result2.data.value).toBe('v2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('isLoading is only true on cold load (empty data)', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['item1']));

    const result = createQuery('loading-test', [] as string[], fetcher);
    expect(result.isLoading.value).toBe(true);

    await flushPromises();
    expect(result.isLoading.value).toBe(false);

    const result2 = createQuery('loading-test', [] as string[], fetcher);
    expect(result2.isLoading.value).toBe(false);
  });

  it('different keys have independent state', async () => {
    const result1 = createQuery('a', '', () => Promise.resolve('alpha'));
    const result2 = createQuery('b', '', () => Promise.resolve('beta'));

    await flushPromises();

    expect(result1.data.value).toBe('alpha');
    expect(result2.data.value).toBe('beta');
  });

  it('error from refetch clears previous error', async () => {
    let shouldFail = true;
    const fetcher = vi.fn(() =>
      shouldFail ? Promise.reject(new Error('fail')) : Promise.resolve('ok'),
    );

    const result = createQuery('err-test', '', fetcher);
    await flushPromises();
    expect(result.error.value).not.toBeNull();

    shouldFail = false;
    result.refetch();
    await nextTick();
    expect(result.error.value).toBeNull();

    await flushPromises();
    expect(result.data.value).toBe('ok');
  });
});

describe('createQuery — edge cases', () => {
  it('race condition: slow first fetch is discarded when fast revisit fetch wins', async () => {
    let resolveFirst: (v: string) => void;
    const slowFetcher = vi.fn(() => new Promise<string>((r) => {
      resolveFirst = r;
    }));
    const fastFetcher = vi.fn(() => Promise.resolve('fresh'));

    const result1 = createQuery('race', '', slowFetcher);
    expect(result1.isLoading.value).toBe(true);

    const result2 = createQuery('race', '', fastFetcher);
    result2.refetch();

    await flushPromises();
    expect(result2.data.value).toBe('fresh');

    resolveFirst!('stale');
    await flushPromises();
    expect(result2.data.value).toBe('fresh');
  });

  it('revalidation uses the NEW fetcher, not the original one', async () => {
    const fetcherA = vi.fn(() => Promise.resolve('from-A'));
    const fetcherB = vi.fn(() => Promise.resolve('from-B'));

    createQuery('fetcher-swap', '', fetcherA);
    await flushPromises();
    expect(fetcherA).toHaveBeenCalledOnce();

    const result = createQuery('fetcher-swap', '', fetcherB);
    await flushPromises();

    expect(fetcherB).toHaveBeenCalledOnce();
    expect(result.data.value).toBe('from-B');
  });

  it('revalidation failure preserves stale data and does NOT set error', async () => {
    const goodFetcher = vi.fn(() => Promise.resolve('good-data'));
    const badFetcher = vi.fn(() => Promise.reject(new Error('network down')));

    // First fetch succeeds
    createQuery('err-preserve', '', goodFetcher);
    await flushPromises();

    // Revisit fails — stale data survives, error NOT shown
    const result = createQuery('err-preserve', '', badFetcher);
    await flushPromises();

    expect(result.data.value).toBe('good-data');
    expect(result.error.value).toBeNull(); // No error — stale data is sufficient
    expect(result.isLoading.value).toBe(false);
  });

  it('cold load failure DOES set error (no stale data to show)', async () => {
    const badFetcher = vi.fn(() => Promise.reject(new Error('failed')));

    const result = createQuery('cold-fail', '', badFetcher);
    await flushPromises();

    expect(result.data.value).toBe('');
    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('failed');
  });

  it('concurrent calls with same key share refs and deduplicate fetch', async () => {
    let fetchCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`result-${++fetchCount}`));

    const result1 = createQuery('concurrent', '', fetcher);
    const result2 = createQuery('concurrent', '', fetcher);

    expect(result1.data).toBe(result2.data);

    await flushPromises();

    expect(fetchCount).toBe(1);
    expect(result1.data.value).toBe('result-1');
  });

  it('in-flight fetch with stale fetcher re-fetches with new fetcher on completion', async () => {
    let resolveFirst: (v: string) => void;
    const fetcherA = vi.fn(() => new Promise<string>((r) => {
      resolveFirst = r;
    }));
    const fetcherB = vi.fn(() => Promise.resolve('from-B'));

    createQuery('fetcher-inflight', '', fetcherA);
    expect(fetcherA).toHaveBeenCalledOnce();

    const result = createQuery('fetcher-inflight', '', fetcherB);
    expect(fetcherB).not.toHaveBeenCalled();

    resolveFirst!('from-A');
    await flushPromises();

    expect(fetcherB).toHaveBeenCalledOnce();
    expect(result.data.value).toBe('from-B');
  });

  it('invalidateAllQueries makes next access a cold load again', async () => {
    const fetcher = vi.fn(() => Promise.resolve('data'));

    createQuery('clear-test', '', fetcher);
    await flushPromises();

    invalidateAllQueries();

    const result = createQuery('clear-test', '', fetcher);
    expect(result.isLoading.value).toBe(true);
    expect(result.data.value).toBe('');

    await flushPromises();
    expect(result.data.value).toBe('data');
  });

  it('non-Error rejection is wrapped in Error', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const fetcher = vi.fn(() => Promise.reject('string error'));

    const result = createQuery('non-error', '', fetcher);
    await flushPromises();

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('string error');
  });

  it('handles fetcher that returns undefined', async () => {
    const fetcher = vi.fn(() => Promise.resolve(undefined as unknown as string));

    const result = createQuery('undef', 'default', fetcher);
    await flushPromises();

    expect(result.data.value).toBeUndefined();
    expect(result.isLoading.value).toBe(false);
  });

  it('isEmpty check treats populated array as non-empty (no loading on revalidate)', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a', 'b']));

    const result1 = createQuery('array-check', [] as string[], fetcher);
    expect(result1.isLoading.value).toBe(true);
    await flushPromises();

    const result2 = createQuery('array-check', [] as string[], fetcher);
    expect(result2.isLoading.value).toBe(false);
  });
});

describe('createQuery — critical edge cases', () => {
  it('fetcher that throws synchronously is caught and sets error', () => {
    const fetcher = vi.fn((): Promise<string> => {
      throw new Error('sync throw');
    });

    const result = createQuery('sync-throw', '', fetcher);

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('sync throw');
    expect(result.isLoading.value).toBe(false);
  });

  it('invalidateAllQueries during in-flight does not corrupt next fetch', async () => {
    let resolveFirst: (v: string) => void;
    const slowFetcher = vi.fn(() => new Promise<string>((r) => {
      resolveFirst = r;
    }));

    const result1 = createQuery('cache-clear', '', slowFetcher);
    expect(result1.isLoading.value).toBe(true);

    invalidateAllQueries();

    const freshFetcher = vi.fn(() => Promise.resolve('fresh'));
    const result2 = createQuery('cache-clear', '', freshFetcher);
    expect(result2.isLoading.value).toBe(true);

    await flushPromises();
    expect(result2.data.value).toBe('fresh');

    resolveFirst!('stale');
    await flushPromises();
    expect(result2.data.value).toBe('fresh');
  });

  it('refetch while in-flight increments sequence and discards old result', async () => {
    let resolveFirst: (v: string) => void;
    const slowFetcher = vi.fn(() => new Promise<string>((r) => {
      resolveFirst = r;
    }));
    const fastFetcher = vi.fn(() => Promise.resolve('fast'));

    const result = createQuery('refetch-inflight', '', slowFetcher);

    createQuery('refetch-inflight', '', fastFetcher);
    result.refetch();

    await flushPromises();
    expect(result.data.value).toBe('fast');

    resolveFirst!('slow');
    await flushPromises();
    expect(result.data.value).toBe('fast');
  });
});
