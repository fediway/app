import type { FediwayStatus } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';
import { useTimelineCache } from '../../src/cache/timeline-cache';

function makeStatus(id: string, content = ''): FediwayStatus {
  return {
    id,
    content: content || `<p>Status ${id}</p>`,
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

describe('useTimelineCache', () => {
  it('save() and load() round-trip statuses', async () => {
    const cache = useTimelineCache('home');
    const statuses = [makeStatus('1'), makeStatus('2'), makeStatus('3')];

    await cache.save(statuses);
    const loaded = await cache.load();

    expect(loaded).toHaveLength(3);
    expect(loaded.map(s => s.id).sort()).toEqual(['1', '2', '3']);
  });

  it('load() returns empty array for unknown timeline', async () => {
    const cache = useTimelineCache('nonexistent');
    const loaded = await cache.load();
    expect(loaded).toEqual([]);
  });

  it('save() deduplicates by statusId within a timeline', async () => {
    const cache = useTimelineCache('home');

    await cache.save([makeStatus('1', 'original')]);
    await cache.save([makeStatus('1', 'updated')]);

    const loaded = await cache.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.content).toContain('updated');
  });

  it('different timelines are isolated', async () => {
    const home = useTimelineCache('home');
    const tag = useTimelineCache('hashtag:vue');

    await home.save([makeStatus('1'), makeStatus('2')]);
    await tag.save([makeStatus('3')]);

    const homeLoaded = await home.load();
    const tagLoaded = await tag.load();

    expect(homeLoaded).toHaveLength(2);
    expect(tagLoaded).toHaveLength(1);
    expect(tagLoaded[0]!.id).toBe('3');
  });

  it('clear() removes only entries for the target timeline', async () => {
    const home = useTimelineCache('home');
    const tag = useTimelineCache('hashtag:vue');

    await home.save([makeStatus('1')]);
    await tag.save([makeStatus('2')]);

    await home.clear();

    const homeLoaded = await home.load();
    const tagLoaded = await tag.load();

    expect(homeLoaded).toHaveLength(0);
    expect(tagLoaded).toHaveLength(1);
  });

  it('prune() trims to 200 entries per timeline', async () => {
    const cache = useTimelineCache('home');

    // Insert 210 statuses
    const statuses = Array.from({ length: 210 }, (_, i) => makeStatus(`s-${i}`));
    await cache.save(statuses);

    const loaded = await cache.load();
    expect(loaded.length).toBeLessThanOrEqual(200);
  });

  it('prune() removes entries older than 7 days', async () => {
    const cache = useTimelineCache('home');

    // Manually insert an old entry
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
    await getDb().timelineCache.put({
      timelineKey: 'home',
      statusId: 'old-1',
      status: makeStatus('old-1'),
      cachedAt: eightDaysAgo,
    });

    // Save a fresh one (triggers prune)
    await cache.save([makeStatus('new-1')]);

    const loaded = await cache.load();
    const ids = loaded.map(s => s.id);
    expect(ids).toContain('new-1');
    expect(ids).not.toContain('old-1');
  });

  it('same status ID in different timelines is kept separately', async () => {
    const home = useTimelineCache('home');
    const local = useTimelineCache('local');

    await home.save([makeStatus('1')]);
    await local.save([makeStatus('1')]);

    const homeLoaded = await home.load();
    const localLoaded = await local.load();

    expect(homeLoaded).toHaveLength(1);
    expect(localLoaded).toHaveLength(1);

    // Clearing one doesn't affect the other
    await home.clear();
    const localAfter = await local.load();
    expect(localAfter).toHaveLength(1);
  });
});
