import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';

beforeEach(() => {
  resetDb();
});

afterEach(() => {
  resetDb();
});

describe('fediwayDB v2 schema', () => {
  it('creates both timelineCache and actionQueue tables', () => {
    const db = getDb();
    expect(db.timelineCache).toBeDefined();
    expect(db.actionQueue).toBeDefined();
  });

  it('actionQueue auto-increments id', async () => {
    const db = getDb();
    const id1 = await db.actionQueue.add({
      type: 'favourite',
      statusId: 's-1',
      createdAt: Date.now(),
      attempts: 0,
    });
    const id2 = await db.actionQueue.add({
      type: 'reblog',
      statusId: 's-2',
      createdAt: Date.now(),
      attempts: 0,
    });
    expect(typeof id1).toBe('number');
    expect(typeof id2).toBe('number');
    expect(id2).toBeGreaterThan(id1);
  });

  it('queuedAction round-trips correctly', async () => {
    const db = getDb();
    const now = Date.now();
    const id = await db.actionQueue.add({
      type: 'bookmark',
      statusId: 's-42',
      createdAt: now,
      attempts: 3,
    });

    const retrieved = await db.actionQueue.get(id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(id);
    expect(retrieved!.type).toBe('bookmark');
    expect(retrieved!.statusId).toBe('s-42');
    expect(retrieved!.createdAt).toBe(now);
    expect(retrieved!.attempts).toBe(3);
  });

  it('resetDb() closes and clears the singleton', async () => {
    const db1 = getDb();
    await db1.actionQueue.add({
      type: 'favourite',
      statusId: 's-1',
      createdAt: Date.now(),
      attempts: 0,
    });

    resetDb();
    const db2 = getDb();
    // New instance after reset
    expect(db2).not.toBe(db1);

    // Data persists in IndexedDB (resetDb closes connection, doesn't delete DB)
    // But the singleton is a fresh instance
    expect(db2.isOpen()).toBe(false);
  });
});

describe('fediwayDB v3 schema', () => {
  it('creates drafts and metadata tables alongside existing tables', () => {
    const db = getDb();
    expect(db.timelineCache).toBeDefined();
    expect(db.actionQueue).toBeDefined();
    expect(db.drafts).toBeDefined();
    expect(db.metadata).toBeDefined();
  });

  it('storedDraft round-trips correctly', async () => {
    const db = getDb();
    const now = Date.now();
    await db.drafts.put({
      accountKey: 'mastodon.social:alice',
      content: 'Hello world',
      spoilerText: '',
      visibility: 'public',
      itemUrl: 'https://example.com',
      itemType: 'link',
      rating: 4,
      updatedAt: now,
    });

    const retrieved = await db.drafts.get('mastodon.social:alice');
    expect(retrieved).toBeDefined();
    expect(retrieved!.accountKey).toBe('mastodon.social:alice');
    expect(retrieved!.content).toBe('Hello world');
    expect(retrieved!.visibility).toBe('public');
    expect(retrieved!.itemUrl).toBe('https://example.com');
    expect(retrieved!.rating).toBe(4);
    expect(retrieved!.updatedAt).toBe(now);
  });

  it('metadataEntry round-trips correctly', async () => {
    const db = getDb();
    await db.metadata.put({ key: 'idb_sentinel', value: '1' });

    const retrieved = await db.metadata.get('idb_sentinel');
    expect(retrieved).toBeDefined();
    expect(retrieved!.key).toBe('idb_sentinel');
    expect(retrieved!.value).toBe('1');
  });
});
