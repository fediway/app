import type { FediwayStatus } from '@repo/types';
import { afterEach, describe, expect, it } from 'vitest';
import { computed, nextTick } from 'vue';
// Import directly — no mocking needed, it's a pure data store
import { useStatusStore } from '../../src/composables/useStatusStore';

import { withSetup } from '../utils/withSetup';

function makeStatus(id: string, overrides?: Partial<FediwayStatus>): FediwayStatus {
  return {
    id,
    uri: `https://example.com/statuses/${id}`,
    createdAt: '2024-01-01T00:00:00.000Z',
    editedAt: null,
    account: { id: '1', username: 'test', acct: 'test', displayName: 'Test' } as FediwayStatus['account'],
    content: `<p>Status ${id}</p>`,
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: [],
    application: { name: 'Test' },
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    url: `https://example.com/@test/${id}`,
    inReplyToId: null,
    inReplyToAccountId: null,
    reblog: null,
    poll: null,
    card: null,
    language: 'en',
    text: null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    pinned: false,
    ...overrides,
  } as FediwayStatus;
}

afterEach(() => {
  // Clear the module-level store between tests
  const [store] = withSetup(() => useStatusStore());
  store.clear();
});

describe('useStatusStore', () => {
  it('starts empty', () => {
    const [store] = withSetup(() => useStatusStore());
    expect(store.size.value).toBe(0);
  });

  it('set() adds a status, get() retrieves it', () => {
    const [store] = withSetup(() => useStatusStore());
    const status = makeStatus('1');
    store.set(status);
    expect(store.get('1')).toEqual(status);
  });

  it('set() replaces existing status with same ID', () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1', { content: '<p>Original</p>' }));
    store.set(makeStatus('1', { content: '<p>Updated</p>' }));
    expect(store.get('1')?.content).toBe('<p>Updated</p>');
    expect(store.size.value).toBe(1);
  });

  it('setMany() adds multiple statuses', () => {
    const [store] = withSetup(() => useStatusStore());
    store.setMany([makeStatus('1'), makeStatus('2'), makeStatus('3')]);
    expect(store.size.value).toBe(3);
    expect(store.get('1')).toBeDefined();
    expect(store.get('2')).toBeDefined();
    expect(store.get('3')).toBeDefined();
  });

  it('remove() deletes a status and returns true', () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1'));
    expect(store.remove('1')).toBe(true);
    expect(store.get('1')).toBeUndefined();
    expect(store.size.value).toBe(0);
  });

  it('remove() returns false for missing status', () => {
    const [store] = withSetup(() => useStatusStore());
    expect(store.remove('nonexistent')).toBe(false);
  });

  it('patch() merges partial and returns updated status', () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1', { favourited: false, favouritesCount: 0 }));
    const updated = store.patch('1', { favourited: true, favouritesCount: 1 });
    expect(updated?.favourited).toBe(true);
    expect(updated?.favouritesCount).toBe(1);
    // Original fields preserved
    expect(updated?.id).toBe('1');
    expect(updated?.content).toBe('<p>Status 1</p>');
  });

  it('patch() returns undefined for missing status', () => {
    const [store] = withSetup(() => useStatusStore());
    expect(store.patch('nonexistent', { favourited: true })).toBeUndefined();
  });

  it('has() checks existence', () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1'));
    expect(store.has('1')).toBe(true);
    expect(store.has('2')).toBe(false);
  });

  it('clear() empties the store', () => {
    const [store] = withSetup(() => useStatusStore());
    store.setMany([makeStatus('1'), makeStatus('2')]);
    store.clear();
    expect(store.size.value).toBe(0);
    expect(store.has('1')).toBe(false);
  });

  it('two get() calls for same ID return same object', () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1'));
    const a = store.get('1');
    const b = store.get('1');
    expect(a).toBe(b);
  });

  it('reactivity: computed based on get() updates after set()', async () => {
    const [store] = withSetup(() => useStatusStore());
    const [derived] = withSetup(() => computed(() => store.get('1')?.favourited));

    expect(derived.value).toBeUndefined();

    store.set(makeStatus('1', { favourited: false }));
    await nextTick();
    expect(derived.value).toBe(false);

    store.set(makeStatus('1', { favourited: true }));
    await nextTick();
    expect(derived.value).toBe(true);
  });

  it('reactivity: computed based on get() updates after patch()', async () => {
    const [store] = withSetup(() => useStatusStore());
    store.set(makeStatus('1', { favouritesCount: 0 }));

    const [count] = withSetup(() => computed(() => store.get('1')?.favouritesCount));
    expect(count.value).toBe(0);

    store.patch('1', { favouritesCount: 5 });
    await nextTick();
    expect(count.value).toBe(5);
  });
});
