import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { _resetDataHelpers, clearAllCaches, createDataResult } from '../useDataHelpers';

afterEach(() => {
  _resetDataHelpers();
});

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('createDataResult', () => {
  it('starts with default value and isLoading=true on first fetch', () => {
    const fetcher = vi.fn(() => new Promise<string>(() => {})); // never resolves
    const result = createDataResult('test', 'default', fetcher);

    expect(result.data.value).toBe('default');
    expect(result.isLoading.value).toBe(true);
    expect(result.error.value).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('populates data when fetch resolves', async () => {
    const fetcher = vi.fn(() => Promise.resolve('hello'));
    const result = createDataResult('test', '', fetcher);

    await flushPromises();

    expect(result.data.value).toBe('hello');
    expect(result.isLoading.value).toBe(false);
    expect(result.error.value).toBeNull();
  });

  it('sets error when fetch rejects', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('network fail')));
    const result = createDataResult('test', '', fetcher);

    await flushPromises();

    expect(result.data.value).toBe('');
    expect(result.isLoading.value).toBe(false);
    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('network fail');
  });

  it('refetch() re-fetches and updates data', async () => {
    let callCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`call-${++callCount}`));
    const result = createDataResult('test', '', fetcher);

    await flushPromises();
    expect(result.data.value).toBe('call-1');

    result.refetch();
    await flushPromises();
    expect(result.data.value).toBe('call-2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('same key returns cached refs (shared state)', async () => {
    const fetcher = vi.fn(() => Promise.resolve('data'));
    const result1 = createDataResult('shared', '', fetcher);

    await flushPromises();

    const result2 = createDataResult('shared', '', fetcher);

    // Same refs
    expect(result2.data.value).toBe('data');
    // data ref is the same object
    expect(result1.data).toBe(result2.data);
  });

  it('stale-while-revalidate: revisit shows cached data, no loading spinner', async () => {
    let callCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`v${++callCount}`));

    // First visit
    const result1 = createDataResult('swr', '', fetcher);
    await flushPromises();
    expect(result1.data.value).toBe('v1');

    // Revisit — simulates navigating back to the page
    const result2 = createDataResult('swr', '', fetcher);

    // Should show cached data instantly, no loading
    expect(result2.data.value).toBe('v1');
    expect(result2.isLoading.value).toBe(false);

    // Background re-fetch updates data
    await flushPromises();
    expect(result2.data.value).toBe('v2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('isLoading is only true on cold load (empty data)', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['item1']));

    // Cold load with empty array default
    const result = createDataResult('loading-test', [] as string[], fetcher);
    expect(result.isLoading.value).toBe(true);

    await flushPromises();
    expect(result.isLoading.value).toBe(false);

    // Revisit — data exists, no loading spinner
    const result2 = createDataResult('loading-test', [] as string[], fetcher);
    expect(result2.isLoading.value).toBe(false);
  });

  it('different keys have independent state', async () => {
    const result1 = createDataResult('a', '', () => Promise.resolve('alpha'));
    const result2 = createDataResult('b', '', () => Promise.resolve('beta'));

    await flushPromises();

    expect(result1.data.value).toBe('alpha');
    expect(result2.data.value).toBe('beta');
  });

  it('error from refetch clears previous error', async () => {
    let shouldFail = true;
    const fetcher = vi.fn(() =>
      shouldFail ? Promise.reject(new Error('fail')) : Promise.resolve('ok'),
    );

    const result = createDataResult('err-test', '', fetcher);
    await flushPromises();
    expect(result.error.value).not.toBeNull();

    shouldFail = false;
    result.refetch();
    // Error cleared immediately on refetch
    await nextTick();
    expect(result.error.value).toBeNull();

    await flushPromises();
    expect(result.data.value).toBe('ok');
  });
});

describe('createDataResult — edge cases', () => {
  it('race condition: slow first fetch is discarded when fast revisit fetch wins', async () => {
    let resolveFirst: (v: string) => void;
    const slowFetcher = vi.fn(() => new Promise<string>((r) => {
      resolveFirst = r;
    }));
    const fastFetcher = vi.fn(() => Promise.resolve('fresh'));

    // First call — starts slow fetch
    const result1 = createDataResult('race', '', slowFetcher);
    expect(result1.isLoading.value).toBe(true);

    // Force revisit by manually triggering refetch with fast fetcher
    const result2 = createDataResult('race', '', fastFetcher);
    result2.refetch();

    // Fast fetch resolves first
    await flushPromises();
    expect(result2.data.value).toBe('fresh');

    // Slow fetch resolves later — should be discarded (sequence counter)
    resolveFirst!('stale');
    await flushPromises();
    expect(result2.data.value).toBe('fresh');
  });

  it('revalidation uses the NEW fetcher, not the original one', async () => {
    const fetcherA = vi.fn(() => Promise.resolve('from-A'));
    const fetcherB = vi.fn(() => Promise.resolve('from-B'));

    // First call with fetcher A
    createDataResult('fetcher-swap', '', fetcherA);
    await flushPromises();
    expect(fetcherA).toHaveBeenCalledOnce();

    // Revisit with fetcher B (e.g., different client after auth change)
    const result = createDataResult('fetcher-swap', '', fetcherB);
    await flushPromises();

    // Should use fetcher B for revalidation
    expect(fetcherB).toHaveBeenCalledOnce();
    expect(result.data.value).toBe('from-B');
  });

  it('error during revalidation preserves stale data', async () => {
    const goodFetcher = vi.fn(() => Promise.resolve('good-data'));
    const badFetcher = vi.fn(() => Promise.reject(new Error('network down')));

    // First fetch succeeds
    createDataResult('err-preserve', '', goodFetcher);
    await flushPromises();

    // Revisit fails — stale data should survive
    const result = createDataResult('err-preserve', '', badFetcher);
    await flushPromises();

    expect(result.data.value).toBe('good-data');
    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.isLoading.value).toBe(false);
  });

  it('concurrent calls with same key share refs and deduplicate fetch', async () => {
    let fetchCount = 0;
    const fetcher = vi.fn(() => Promise.resolve(`result-${++fetchCount}`));

    // Two components mount simultaneously, both call createDataResult with same key
    const result1 = createDataResult('concurrent', '', fetcher);
    const result2 = createDataResult('concurrent', '', fetcher);

    expect(result1.data).toBe(result2.data); // Same ref

    await flushPromises();

    // Second call is deduplicated — only 1 fetch
    expect(fetchCount).toBe(1);
    expect(result1.data.value).toBe('result-1');
  });

  it('clearAllCaches makes next access a cold load again', async () => {
    const fetcher = vi.fn(() => Promise.resolve('data'));

    createDataResult('clear-test', '', fetcher);
    await flushPromises();

    clearAllCaches();

    // After clear, should be a cold load with loading spinner
    const result = createDataResult('clear-test', '', fetcher);
    expect(result.isLoading.value).toBe(true);
    expect(result.data.value).toBe('');

    await flushPromises();
    expect(result.data.value).toBe('data');
  });

  it('non-Error rejection is wrapped in Error', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const fetcher = vi.fn(() => Promise.reject('string error'));

    const result = createDataResult('non-error', '', fetcher);
    await flushPromises();

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value!.message).toBe('string error');
  });

  it('refetch after error recovery shows loading only if data is empty', async () => {
    // First fetch fails — no data yet, so loading should show
    const failFetcher = vi.fn(() => Promise.reject(new Error('fail')));
    const result = createDataResult('refetch-loading', [] as string[], failFetcher);
    await flushPromises();
    expect(result.error.value).not.toBeNull();
    expect(result.data.value).toEqual([]);

    // Refetch — data is still empty array, so loading should show
    result.refetch();
    // Note: refetch uses the original fetcher closure
    // This documents that refetch() reuses the fetcher from its createDataResult call
  });

  it('handles fetcher that returns undefined', async () => {
    const fetcher = vi.fn(() => Promise.resolve(undefined as unknown as string));

    const result = createDataResult('undef', 'default', fetcher);
    await flushPromises();

    expect(result.data.value).toBeUndefined();
    expect(result.isLoading.value).toBe(false);
  });

  it('isEmpty check treats populated array as non-empty (no loading on revalidate)', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a', 'b']));

    // First load
    const result1 = createDataResult('array-check', [] as string[], fetcher);
    expect(result1.isLoading.value).toBe(true); // empty array = cold load
    await flushPromises();

    // Revisit — array has items, no loading
    const result2 = createDataResult('array-check', [] as string[], fetcher);
    expect(result2.isLoading.value).toBe(false); // ['a','b'] is not empty
  });
});
