import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';
import { checkDbIntegrity, writeSentinel } from '../../src/cache/integrity';
import { setPlatformAdapter } from '../../src/platform';

function createMockAdapter() {
  const store = new Map<string, string>();
  return {
    adapter: {
      secureGet: vi.fn(async (key: string) => store.get(key) ?? null),
      secureSet: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
      secureRemove: vi.fn(async (key: string) => { store.delete(key); }),
      openUrl: vi.fn(async () => {}),
      isNative: vi.fn(() => false),
    },
    store,
  };
}

let mock: ReturnType<typeof createMockAdapter>;

beforeEach(() => {
  resetDb();
  mock = createMockAdapter();
  setPlatformAdapter(mock.adapter);
});

afterEach(async () => {
  const db = getDb();
  await db.metadata.clear();
  resetDb();
});

describe('writeSentinel', () => {
  it('writes to both Dexie and platform adapter', async () => {
    await writeSentinel();

    const dbEntry = await getDb().metadata.get('idb_sentinel');
    expect(dbEntry).toBeDefined();
    expect(dbEntry!.value).toBe('1');

    expect(mock.adapter.secureSet).toHaveBeenCalledWith('fediway_idb_sentinel', '1');
    expect(mock.store.get('fediway_idb_sentinel')).toBe('1');
  });
});

describe('checkDbIntegrity', () => {
  it('returns true when no sentinel exists (fresh install)', async () => {
    const result = await checkDbIntegrity();
    expect(result).toBe(true);
  });

  it('returns true when sentinel exists in both Dexie and platform', async () => {
    await writeSentinel();

    const result = await checkDbIntegrity();
    expect(result).toBe(true);
  });

  it('returns false when platform has sentinel but Dexie does not (purge)', async () => {
    await writeSentinel();
    // Simulate iOS purge: clear Dexie but leave platform adapter intact
    await getDb().metadata.clear();

    const result = await checkDbIntegrity();
    expect(result).toBe(false);
  });

  it('cleans up platform sentinel after detecting purge', async () => {
    await writeSentinel();
    await getDb().metadata.clear();

    await checkDbIntegrity();

    expect(mock.adapter.secureRemove).toHaveBeenCalledWith('fediway_idb_sentinel');
    expect(mock.store.has('fediway_idb_sentinel')).toBe(false);
  });
});
