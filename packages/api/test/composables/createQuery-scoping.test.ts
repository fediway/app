import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the account key — tests can change this to simulate account switches
let mockAccountKey = 'alice@mastodon.social';
vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => mockAccountKey,
}));

// Dynamic import AFTER mock setup
const { _resetQueryCache, createQuery, invalidateAllQueries }
  = await import('../../src/composables/createQuery');

beforeEach(() => {
  _resetQueryCache();
  mockAccountKey = 'alice@mastodon.social';
});

afterEach(() => {
  _resetQueryCache();
  vi.restoreAllMocks();
});

describe('createQuery — account scoping', () => {
  it('auto-scopes keys by active account (default behavior)', async () => {
    const aliceFetcher = vi.fn(() => Promise.resolve('alice-data'));
    const result = createQuery('favourites', '', aliceFetcher);
    await flushPromises();

    expect(result.data.value).toBe('alice-data');

    // Switch to bob — same key should trigger a FRESH fetch
    mockAccountKey = 'bob@fosstodon.org';
    const bobFetcher = vi.fn(() => Promise.resolve('bob-data'));
    const result2 = createQuery('favourites', '', bobFetcher);

    expect(result2.isLoading.value).toBe(true); // Cold load, not cached
    await flushPromises();
    expect(result2.data.value).toBe('bob-data');
  });

  it('alice data is NOT visible to bob after account switch', async () => {
    mockAccountKey = 'alice@mastodon.social';
    const aliceFetcher = vi.fn(() => Promise.resolve('alice-secret'));
    createQuery('messages', '', aliceFetcher);
    await flushPromises();

    // Switch to bob
    mockAccountKey = 'bob@fosstodon.org';
    const bobFetcher = vi.fn(() => Promise.resolve('bob-messages'));
    const bobResult = createQuery('messages', 'default', bobFetcher);

    // Bob should see default value (cold load), NOT alice's data
    expect(bobResult.data.value).toBe('default');
    expect(bobResult.isLoading.value).toBe(true);
  });

  it('scope: public shares cache across accounts', async () => {
    mockAccountKey = 'alice@mastodon.social';
    const fetcher = vi.fn(() => Promise.resolve('trending-data'));
    createQuery('trending', '', fetcher, { scope: 'public' });
    await flushPromises();

    // Switch to bob — same public key should return cached data immediately
    mockAccountKey = 'bob@fosstodon.org';
    const result2 = createQuery('trending', '', fetcher, { scope: 'public' });

    // Data available instantly (cached), though SWR may revalidate in background
    expect(result2.data.value).toBe('trending-data');
  });

  it('scope: public does NOT return account-scoped cache', async () => {
    mockAccountKey = 'alice@mastodon.social';
    // Create an account-scoped query
    const privateFetcher = vi.fn(() => Promise.resolve('private'));
    createQuery('data', '', privateFetcher);
    await flushPromises();

    // Trying to read with scope: public uses a DIFFERENT key
    const publicFetcher = vi.fn(() => Promise.resolve('public'));
    const result = createQuery('data', 'default', publicFetcher, { scope: 'public' });

    expect(result.isLoading.value).toBe(true); // Fresh fetch
    await flushPromises();
    expect(result.data.value).toBe('public');
    expect(publicFetcher).toHaveBeenCalledTimes(1);
  });

  it('same account revisiting returns cached data (SWR)', async () => {
    const fetcher = vi.fn(() => Promise.resolve('cached'));
    const result1 = createQuery('timeline', '', fetcher);
    await flushPromises();

    // Same account, same key — should return cached data
    const result2 = createQuery('timeline', '', fetcher);
    expect(result2.data).toBe(result1.data); // Same ref object
  });

  it('invalidateAllQueries clears all scoped caches', async () => {
    mockAccountKey = 'alice@mastodon.social';
    const fetcher1 = vi.fn(() => Promise.resolve('first'));
    createQuery('test', '', fetcher1);
    await flushPromises();

    invalidateAllQueries();

    const fetcher2 = vi.fn(() => Promise.resolve('second'));
    const result = createQuery('test', 'default', fetcher2);

    expect(result.isLoading.value).toBe(true); // Cold load after invalidation
    await flushPromises();
    expect(result.data.value).toBe('second');
  });

  it('anon scope used when no account is active', async () => {
    mockAccountKey = ''; // getActiveAccountKeySync returns empty or 'anon'

    // This should still work — uses empty string as prefix
    const fetcher = vi.fn(() => Promise.resolve('anon-data'));
    const result = createQuery('explore', '', fetcher);
    await flushPromises();

    expect(result.data.value).toBe('anon-data');
  });
});
