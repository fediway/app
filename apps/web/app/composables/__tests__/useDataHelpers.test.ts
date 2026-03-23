import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { _resetDataHelpers, createDataResult } from '../useDataHelpers';

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
