import type { FediwayStatus } from '@repo/types';
import { getDb } from './db';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_PER_TIMELINE = 200;

export function useTimelineCache(timelineKey: string) {
  /**
   * Load cached statuses for this timeline, newest first.
   */
  async function load(): Promise<FediwayStatus[]> {
    const entries = await getDb().timelineCache.where('timelineKey').equals(timelineKey).reverse().sortBy('cachedAt');
    return entries.map(e => e.status);
  }

  /**
   * Save statuses to cache, then prune old/excess entries.
   */
  async function save(statuses: FediwayStatus[]): Promise<void> {
    const now = Date.now();
    const entries = statuses.map(status => ({
      timelineKey,
      statusId: status.id,
      status,
      cachedAt: now,
    }));
    await getDb().timelineCache.bulkPut(entries);
    await prune();
  }

  /**
   * Remove entries older than 7 days, then trim to 200 per timeline.
   */
  async function prune(): Promise<void> {
    const cutoff = Date.now() - MAX_AGE_MS;

    // Delete old entries across all timelines
    await getDb().timelineCache.where('cachedAt').below(cutoff).delete();

    // Trim to max per timeline
    const entries = await getDb().timelineCache.where('timelineKey').equals(timelineKey).sortBy('cachedAt');

    if (entries.length > MAX_PER_TIMELINE) {
      const toDelete = entries.slice(0, entries.length - MAX_PER_TIMELINE);
      const keys = toDelete.map(e => [e.timelineKey, e.statusId] as [string, string]);
      await getDb().timelineCache.bulkDelete(keys);
    }
  }

  /**
   * Delete all cached entries for this timeline.
   */
  async function clear(): Promise<void> {
    await getDb().timelineCache.where('timelineKey').equals(timelineKey).delete();
  }

  return { load, save, prune, clear };
}
