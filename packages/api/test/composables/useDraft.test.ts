import type { DraftData } from '../../src/cache/db';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';
import { useDraft } from '../../src/composables/useDraft';
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

const DRAFT: DraftData = {
  content: 'I just watched Dune Part Two',
  spoilerText: '',
  visibility: 'public',
  itemUrl: 'https://example.com/dune',
  itemType: 'movie',
  rating: 5,
};

let mock: ReturnType<typeof createMockAdapter>;

beforeEach(() => {
  resetDb();
  mock = createMockAdapter();
  setPlatformAdapter(mock.adapter);
});

afterEach(async () => {
  const db = getDb();
  await db.drafts.clear();
  await db.metadata.clear();
  resetDb();
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('useDraft', () => {
  it('load() returns null when no draft exists', async () => {
    const draft = useDraft('acct:alice');
    const result = await draft.load();
    expect(result).toBeNull();
  });

  it('save() + wait 1s + load() round-trips draft data', async () => {
    const draft = useDraft('acct:alice');
    draft.save(DRAFT);

    await sleep(1100);

    const loaded = await draft.load();
    expect(loaded).toEqual(DRAFT);
  });

  it('save() is debounced — multiple rapid calls result in one Dexie write', async () => {
    const draft = useDraft('acct:alice');

    draft.save({ ...DRAFT, content: 'first' });
    draft.save({ ...DRAFT, content: 'second' });
    draft.save({ ...DRAFT, content: 'third' });

    await sleep(1100);

    const loaded = await draft.load();
    expect(loaded!.content).toBe('third');

    const count = await getDb().drafts.count();
    expect(count).toBe(1);
  });

  it('save() debounce resets on each call (only last value persists)', async () => {
    const draft = useDraft('acct:alice');

    draft.save({ ...DRAFT, content: 'first' });
    await sleep(500);

    // Before the 1s fires, save again — resets the timer
    draft.save({ ...DRAFT, content: 'second' });

    // 500ms after reset — nothing saved yet
    await sleep(500);
    const loaded = await draft.load();
    expect(loaded).toBeNull();

    // Wait remaining time for second timer to fire
    await sleep(600);

    const final = await draft.load();
    expect(final!.content).toBe('second');
  });

  it('flush() writes immediately without waiting for debounce', async () => {
    const draft = useDraft('acct:alice');
    draft.save(DRAFT);

    // Flush should save immediately without waiting for debounce
    await draft.flush();

    const loaded = await draft.load();
    expect(loaded).toEqual(DRAFT);
  });

  it('flush() is a no-op when nothing is pending', async () => {
    const draft = useDraft('acct:alice');
    await draft.flush();

    const count = await getDb().drafts.count();
    expect(count).toBe(0);
  });

  it('discard() removes draft from Dexie', async () => {
    const draft = useDraft('acct:alice');
    draft.save(DRAFT);
    await draft.flush();

    expect(await draft.load()).toEqual(DRAFT);

    await draft.discard();
    expect(await draft.load()).toBeNull();
  });

  it('discard() cancels any pending debounced save', async () => {
    const draft = useDraft('acct:alice');
    draft.save(DRAFT);

    // Discard before debounce fires
    await draft.discard();
    await sleep(1100);

    expect(await draft.load()).toBeNull();
  });

  it('save() writes sentinel to both Dexie metadata and platform adapter', async () => {
    const draft = useDraft('acct:alice');
    draft.save(DRAFT);
    await draft.flush();

    const sentinel = await getDb().metadata.get('idb_sentinel');
    expect(sentinel).toBeDefined();
    expect(sentinel!.value).toBe('1');

    expect(mock.adapter.secureSet).toHaveBeenCalledWith('fediway_idb_sentinel', '1');
  });

  it('drafts are scoped per account (two instances do not collide)', async () => {
    const alice = useDraft('acct:alice');
    const bob = useDraft('acct:bob');

    alice.save({ ...DRAFT, content: 'alice draft' });
    bob.save({ ...DRAFT, content: 'bob draft' });
    await alice.flush();
    await bob.flush();

    const aliceLoaded = await alice.load();
    const bobLoaded = await bob.load();

    expect(aliceLoaded!.content).toBe('alice draft');
    expect(bobLoaded!.content).toBe('bob draft');

    await alice.discard();
    expect(await alice.load()).toBeNull();
    expect(await bob.load()).not.toBeNull();
  });
});
