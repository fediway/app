import { clearTimelineCache } from '../cache/timeline-cache';
import { invalidateAllPaginatedQueries } from '../composables/createPaginatedQuery';
import { invalidateAllQueries } from '../composables/createQuery';
import { resetFollowsState } from '../composables/queries/useFollows';
import { resetPostsState } from '../composables/queries/usePosts';
import { resetItemStoreState } from '../composables/useItemStore';
import { resetNotificationMarkerState } from '../composables/useNotificationMarker';
import { useStatusStore } from '../composables/useStatusStore';

/**
 * Clears ALL per-account cached state.
 *
 * Called on every account transition (login, logout, switch, expiry).
 * This is the SINGLE source of truth for cache cleanup.
 *
 * If you add new module-level state that holds per-account data,
 * register its cleanup here.
 */
export function clearAllAccountState(): void {
  // Query caches (createQuery + createPaginatedQuery registries)
  invalidateAllQueries();
  invalidateAllPaginatedQueries();

  // Status entity store (global Map of cached statuses)
  useStatusStore().clear();

  // Follow state (optimistic toggles + relationship cache)
  resetFollowsState();

  // User posts (optimistic placeholders)
  resetPostsState();

  // Item entity store (link/movie/song/book metadata)
  resetItemStoreState();

  // Notification marker (unread badge state + polling)
  resetNotificationMarkerState();

  // IndexedDB timeline cache (fire-and-forget, async)
  clearTimelineCache().catch(() => {});
}
