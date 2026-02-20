import type { FediwayStatus } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';
import { pruneAllTimelines } from '../../src/cache/timeline-cache';

function makeStatus(id: string): FediwayStatus {
  return {
    id,
    content: `<p>Status ${id}</p>`,
    createdAt: new Date().toISOString(),
    account: {
      id: 'acc-1',
      username: 'testuser',
      acct: 'testuser',
      displayName: 'Test User',
      url: 'https://example.com/@testuser',
    },
    mediaAttachments: [],
    tags: [],
    emojis: [],
    mentions: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    reblog: null,
    card: null,
    poll: null,
    application: null,
    language: 'en',
    uri: `https://example.com/statuses/${id}`,
    url: `https://example.com/@testuser/${id}`,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    muted: false,
    pinned: false,
    quote: null,
  } as unknown as FediwayStatus;
}

beforeEach(async () => {
  resetDb();
  await getDb().timelineCache.clear();
});

afterEach(async () => {
  await getDb().timelineCache.clear();
  resetDb();
});

describe('pruneAllTimelines', () => {
  it('removes entries older than 7 days across all timelines', async () => {
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
    const now = Date.now();

    await getDb().timelineCache.bulkPut([
      { timelineKey: 'home', statusId: 'old-1', status: makeStatus('old-1'), cachedAt: eightDaysAgo },
      { timelineKey: 'local', statusId: 'old-2', status: makeStatus('old-2'), cachedAt: eightDaysAgo },
      { timelineKey: 'home', statusId: 'new-1', status: makeStatus('new-1'), cachedAt: now },
    ]);

    await pruneAllTimelines();

    const remaining = await getDb().timelineCache.toArray();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.statusId).toBe('new-1');
  });

  it('trims each timeline to 200 entries independently', async () => {
    const now = Date.now();

    // 210 entries in 'home', 50 in 'local'
    const homeEntries = Array.from({ length: 210 }, (_, i) => ({
      timelineKey: 'home',
      statusId: `h-${i}`,
      status: makeStatus(`h-${i}`),
      cachedAt: now - (210 - i) * 1000, // oldest first
    }));
    const localEntries = Array.from({ length: 50 }, (_, i) => ({
      timelineKey: 'local',
      statusId: `l-${i}`,
      status: makeStatus(`l-${i}`),
      cachedAt: now - (50 - i) * 1000,
    }));

    await getDb().timelineCache.bulkPut([...homeEntries, ...localEntries]);

    await pruneAllTimelines();

    const homeRemaining = await getDb().timelineCache.where('timelineKey').equals('home').count();
    const localRemaining = await getDb().timelineCache.where('timelineKey').equals('local').count();

    expect(homeRemaining).toBe(200);
    expect(localRemaining).toBe(50);
  });

  it('keeps newest entries when trimming', async () => {
    const now = Date.now();

    const entries = Array.from({ length: 205 }, (_, i) => ({
      timelineKey: 'home',
      statusId: `s-${i}`,
      status: makeStatus(`s-${i}`),
      cachedAt: now - (205 - i) * 1000, // s-0 is oldest, s-204 is newest
    }));

    await getDb().timelineCache.bulkPut(entries);
    await pruneAllTimelines();

    const remaining = await getDb().timelineCache.where('timelineKey').equals('home').toArray();
    const ids = remaining.map(e => e.statusId);

    // Oldest 5 should be pruned (s-0 through s-4)
    expect(ids).not.toContain('s-0');
    expect(ids).not.toContain('s-4');
    // Newest should remain
    expect(ids).toContain('s-204');
    expect(ids).toContain('s-200');
  });

  it('handles empty database without error', async () => {
    await expect(pruneAllTimelines()).resolves.toBeUndefined();
  });

  it('prunes multiple timelines in one call', async () => {
    const now = Date.now();
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);

    // Both timelines have old + new entries
    await getDb().timelineCache.bulkPut([
      { timelineKey: 'home', statusId: 'h-old', status: makeStatus('h-old'), cachedAt: eightDaysAgo },
      { timelineKey: 'home', statusId: 'h-new', status: makeStatus('h-new'), cachedAt: now },
      { timelineKey: 'local', statusId: 'l-old', status: makeStatus('l-old'), cachedAt: eightDaysAgo },
      { timelineKey: 'local', statusId: 'l-new', status: makeStatus('l-new'), cachedAt: now },
    ]);

    await pruneAllTimelines();

    const remaining = await getDb().timelineCache.toArray();
    const ids = remaining.map(e => e.statusId).sort();
    expect(ids).toEqual(['h-new', 'l-new']);
  });
});
