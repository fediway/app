import type { FediwayStatus } from '@repo/types';
import { useStatusStore } from '@repo/api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowRef } from 'vue';
import { getProfileUrl, getSafeClient, useStatusBridge } from './useStatusBridge';

vi.mock('@repo/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/api')>();
  return {
    ...actual,
    useStatusActions: vi.fn(() => ({
      toggleFavourite: vi.fn(),
      toggleReblog: vi.fn(),
      toggleBookmark: vi.fn(),
      deleteStatus: vi.fn(),
    })),
    useClient: vi.fn(() => {
      throw new Error('Client not initialized');
    }),
  };
});

function makeStatus(id: string, favourited = false): FediwayStatus {
  return {
    id,
    favourited,
    favouritesCount: favourited ? 1 : 0,
    content: '',
    account: { id: '1', acct: 'alice', displayName: 'Alice', username: 'alice', avatar: '', emojis: [] },
  } as unknown as FediwayStatus;
}

describe('getProfileUrl', () => {
  it('formats acct to profile path', () => {
    expect(getProfileUrl('alice')).toBe('/@alice');
  });

  it('strips leading @', () => {
    expect(getProfileUrl('@alice')).toBe('/@alice');
  });

  it('handles federated acct', () => {
    expect(getProfileUrl('alice@mastodon.social')).toBe('/@alice@mastodon.social');
  });
});

describe('getSafeClient', () => {
  it('returns null when client is not initialized', () => {
    expect(getSafeClient()).toBeNull();
  });
});

describe('useStatusBridge', () => {
  afterEach(() => {
    useStatusStore().clear();
  });

  it('returns empty array when source is empty', () => {
    const source = shallowRef<FediwayStatus[]>([]);
    const { statuses } = useStatusBridge(source);
    expect(statuses.value).toEqual([]);
  });

  it('returns source statuses when store has no overrides', async () => {
    const s1 = makeStatus('1');
    const s2 = makeStatus('2');
    const source = shallowRef([s1, s2]);
    const { statuses } = useStatusBridge(source);

    // watchEffect runs async — flush
    await vi.dynamicImportSettled();

    expect(statuses.value).toHaveLength(2);
    expect(statuses.value[0]!.id).toBe('1');
    expect(statuses.value[1]!.id).toBe('2');
  });

  it('reflects store overrides in computed statuses', async () => {
    const s1 = makeStatus('1', false);
    const source = shallowRef([s1]);
    const { statuses } = useStatusBridge(source);

    // Simulate optimistic update via store
    const store = useStatusStore();
    store.set(makeStatus('1', true));

    expect(statuses.value[0]!.favourited).toBe(true);
  });

  it('populates store from source data', async () => {
    const s1 = makeStatus('1');
    const source = shallowRef([s1]);
    useStatusBridge(source);

    await vi.dynamicImportSettled();

    const store = useStatusStore();
    expect(store.has('1')).toBe(true);
  });

  it('handles undefined source', () => {
    const source = shallowRef<FediwayStatus[] | undefined>(undefined);
    const { statuses } = useStatusBridge(source);
    expect(statuses.value).toEqual([]);
  });

  it('updates store when source ref changes', async () => {
    const source = shallowRef([makeStatus('1')]);
    useStatusBridge(source);
    await vi.dynamicImportSettled();

    const store = useStatusStore();
    expect(store.has('1')).toBe(true);
    expect(store.has('2')).toBe(false);

    // Simulate timeline refresh with new data
    source.value = [makeStatus('2'), makeStatus('3')];
    await vi.dynamicImportSettled();

    expect(store.has('2')).toBe(true);
    expect(store.has('3')).toBe(true);
  });

  it('toggle on unknown ID does not crash', async () => {
    const source = shallowRef<FediwayStatus[]>([]);
    const { toggleFavourite } = useStatusBridge(source);

    // Should not throw — useStatusActions.toggleFavourite returns early if not in store
    await expect(toggleFavourite('nonexistent')).resolves.toBeUndefined();
  });
});

describe('getProfileUrl edge cases', () => {
  it('handles empty string', () => {
    expect(getProfileUrl('')).toBe('/@');
  });

  it('handles double @', () => {
    expect(getProfileUrl('@@alice')).toBe('/@@alice');
  });
});
