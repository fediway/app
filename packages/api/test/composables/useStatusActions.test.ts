import type { FediwayStatus } from '@repo/types';
import type { StatusActionError } from '../../src/composables/useStatusActions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStatusStore } from '../../src/composables/useStatusStore';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

let mockClient: ReturnType<typeof createMockClient>;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

const { useStatusActions } = await import('../../src/composables/useStatusActions');

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

let store: ReturnType<typeof useStatusStore>;

beforeEach(() => {
  mockClient = createMockClient();
  [store] = withSetup(() => useStatusStore());
  store.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  store.clear();
});

describe('useStatusActions', () => {
  describe('toggleFavourite', () => {
    it('optimistically sets favourited=true and increments count', async () => {
      store.set(makeStatus('1', { favourited: false, favouritesCount: 3 }));
      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleFavourite('1');

      // Optimistic: should be updated immediately
      expect(store.get('1')?.favourited).toBe(true);
      expect(store.get('1')?.favouritesCount).toBe(4);

      await promise;
    });

    it('calls API and updates with server response', async () => {
      // Seed the mock client with a status so it can find it
      const created = await mockClient.rest.v1.statuses.create({ status: 'test' });
      store.set(makeStatus(created.id, { favourited: false, favouritesCount: 0 }));

      const [actions] = withSetup(() => useStatusActions());
      await actions.toggleFavourite(created.id);

      // After API completes, store has server state
      const status = store.get(created.id);
      expect(status?.favourited).toBe(true);
    });

    it('rolls back on API failure', async () => {
      store.set(makeStatus('1', { favourited: false, favouritesCount: 3 }));

      // Make the API call fail
      const origSelect = mockClient.rest.v1.statuses.$select;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        favourite: async () => { throw new Error('Network error'); },
      });

      const [actions] = withSetup(() => useStatusActions());
      await actions.toggleFavourite('1');

      // Should be rolled back
      expect(store.get('1')?.favourited).toBe(false);
      expect(store.get('1')?.favouritesCount).toBe(3);

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('fires onError callback on failure', async () => {
      store.set(makeStatus('1', { favourited: false, favouritesCount: 0 }));

      const origSelect = mockClient.rest.v1.statuses.$select;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        favourite: async () => { throw new Error('API down'); },
      });

      const errors: StatusActionError[] = [];
      const [actions] = withSetup(() => useStatusActions({ onError: e => errors.push(e) }));
      await actions.toggleFavourite('1');

      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('favourite');
      expect(errors[0]!.statusId).toBe('1');
      expect(errors[0]!.error.message).toBe('API down');

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('unfavourites when already favourited', async () => {
      const created = await mockClient.rest.v1.statuses.create({ status: 'test' });
      // Favourite it first via mock so the mock state is consistent
      await mockClient.rest.v1.statuses.$select(created.id).favourite();
      store.set(makeStatus(created.id, { favourited: true, favouritesCount: 1 }));

      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleFavourite(created.id);

      // Optimistic
      expect(store.get(created.id)?.favourited).toBe(false);
      expect(store.get(created.id)?.favouritesCount).toBe(0);

      await promise;

      expect(store.get(created.id)?.favourited).toBe(false);
    });
  });

  describe('toggleReblog', () => {
    it('optimistically sets reblogged=true and increments count', async () => {
      store.set(makeStatus('1', { reblogged: false, reblogsCount: 2 }));
      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleReblog('1');

      expect(store.get('1')?.reblogged).toBe(true);
      expect(store.get('1')?.reblogsCount).toBe(3);

      await promise;
    });

    it('rolls back on API failure', async () => {
      store.set(makeStatus('1', { reblogged: false, reblogsCount: 2 }));

      const origSelect = mockClient.rest.v1.statuses.$select;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        reblog: async () => { throw new Error('Network error'); },
      });

      const [actions] = withSetup(() => useStatusActions());
      await actions.toggleReblog('1');

      expect(store.get('1')?.reblogged).toBe(false);
      expect(store.get('1')?.reblogsCount).toBe(2);

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('unreblogs when already reblogged', async () => {
      const created = await mockClient.rest.v1.statuses.create({ status: 'test' });
      await mockClient.rest.v1.statuses.$select(created.id).reblog();
      store.set(makeStatus(created.id, { reblogged: true, reblogsCount: 1 }));

      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleReblog(created.id);

      expect(store.get(created.id)?.reblogged).toBe(false);
      expect(store.get(created.id)?.reblogsCount).toBe(0);

      await promise;
      expect(store.get(created.id)?.reblogged).toBe(false);
    });
  });

  describe('toggleBookmark', () => {
    it('optimistically sets bookmarked=true', async () => {
      store.set(makeStatus('1', { bookmarked: false }));
      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleBookmark('1');

      expect(store.get('1')?.bookmarked).toBe(true);

      await promise;
    });

    it('rolls back on API failure', async () => {
      store.set(makeStatus('1', { bookmarked: false }));

      const origSelect = mockClient.rest.v1.statuses.$select;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        bookmark: async () => { throw new Error('Network error'); },
      });

      const [actions] = withSetup(() => useStatusActions());
      await actions.toggleBookmark('1');

      expect(store.get('1')?.bookmarked).toBe(false);

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('unbookmarks when already bookmarked', async () => {
      const created = await mockClient.rest.v1.statuses.create({ status: 'test' });
      await mockClient.rest.v1.statuses.$select(created.id).bookmark();
      store.set(makeStatus(created.id, { bookmarked: true }));

      const [actions] = withSetup(() => useStatusActions());

      const promise = actions.toggleBookmark(created.id);

      expect(store.get(created.id)?.bookmarked).toBe(false);

      await promise;
      expect(store.get(created.id)?.bookmarked).toBe(false);
    });
  });

  describe('deleteStatus', () => {
    it('calls API then removes from store', async () => {
      const created = await mockClient.rest.v1.statuses.create({ status: 'to delete' });
      store.set(makeStatus(created.id));

      const [actions] = withSetup(() => useStatusActions());
      await actions.deleteStatus(created.id);

      expect(store.has(created.id)).toBe(false);
    });

    it('does NOT remove optimistically (status stays until API confirms)', async () => {
      const created = await mockClient.rest.v1.statuses.create({ status: 'to delete' });
      store.set(makeStatus(created.id));

      // Slow down the delete to verify status persists during API call
      const origSelect = mockClient.rest.v1.statuses.$select;
      let resolveDelete!: () => void;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        remove: () => new Promise<void>((resolve) => { resolveDelete = resolve; }),
      });

      const [actions] = withSetup(() => useStatusActions());
      const promise = actions.deleteStatus(created.id);

      // Status should still be in store while API is in-flight
      expect(store.has(created.id)).toBe(true);

      resolveDelete();
      await promise;

      expect(store.has(created.id)).toBe(false);

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('fires onError on failure, status remains in store', async () => {
      store.set(makeStatus('1'));

      const origSelect = mockClient.rest.v1.statuses.$select;
      mockClient.rest.v1.statuses.$select = (id: string) => ({
        ...origSelect(id),
        remove: async () => { throw new Error('Forbidden'); },
      });

      const errors: StatusActionError[] = [];
      const [actions] = withSetup(() => useStatusActions({ onError: e => errors.push(e) }));
      await actions.deleteStatus('1');

      expect(store.has('1')).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('delete');

      mockClient.rest.v1.statuses.$select = origSelect;
    });

    it('no-ops for missing status', async () => {
      const [actions] = withSetup(() => useStatusActions());
      // Should not throw
      await actions.deleteStatus('nonexistent');
      expect(store.has('nonexistent')).toBe(false);
    });
  });
});
