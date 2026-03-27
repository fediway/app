import type { ComputedRef, Ref } from 'vue';
import { computed, ref } from 'vue';
import { getActiveAccountKeySync } from '../auth/account-store';
import { useClient } from './useClient';

export interface UseNotificationMarkerReturn {
  hasUnread: ComputedRef<boolean>;
  lastReadId: Ref<string | null>;
  fetchMarker: () => Promise<void>;
  markAsRead: () => Promise<void>;
  startPolling: (ms?: number) => void;
  stopPolling: () => void;
}

// Module-level state, scoped by account key
const states = new Map<string, {
  lastReadId: Ref<string | null>;
  newestKnownId: Ref<string | null>;
}>();

// Polling state (single global instance — only one account active at a time)
let pollIntervalId: ReturnType<typeof setInterval> | undefined;
let visibilityHandler: (() => void) | undefined;
let pollIntervalMs = 60_000;

function getState() {
  const key = getActiveAccountKeySync();
  if (!states.has(key)) {
    states.set(key, {
      lastReadId: ref(null),
      newestKnownId: ref(null),
    });
  }
  return states.get(key)!;
}

/**
 * Compare two Mastodon Snowflake IDs.
 * Returns true if a > b (a is newer than b).
 */
function isNewer(a: string, b: string): boolean {
  try {
    return BigInt(a) > BigInt(b);
  }
  catch {
    return a > b; // Fallback for non-numeric IDs (forks)
  }
}

/**
 * Composable for tracking notification read/unread state.
 *
 * Uses Mastodon's markers API to store the last-read notification ID server-side.
 * Polls for new notifications and compares against the marker to determine unread state.
 */
export function useNotificationMarker(): UseNotificationMarkerReturn {
  const state = getState();

  const hasUnread = computed(() => {
    const newest = state.newestKnownId.value;
    const lastRead = state.lastReadId.value;
    if (!newest || !lastRead)
      return false;
    return isNewer(newest, lastRead);
  });

  /**
   * Fetch the marker (last-read ID) and the newest notification ID.
   * Called on app start and after account switch.
   */
  async function fetchMarker() {
    try {
      const client = useClient();

      // Fetch marker and newest notification in parallel
      const [markerResult, notifications] = await Promise.all([
        client.rest.v1.markers.fetch({ timeline: ['notifications'] }).catch(() => null),
        Promise.resolve(client.rest.v1.notifications.list({ limit: 1 })).catch(() => []),
      ]);

      if (markerResult?.notifications) {
        state.lastReadId.value = (markerResult.notifications as any).lastReadId
          ?? (markerResult.notifications as any).last_read_id
          ?? null;
      }

      if (notifications.length > 0) {
        state.newestKnownId.value = notifications[0]!.id;
      }
    }
    catch {
      // Markers API may not be supported (some forks). Fail silently.
    }
  }

  /**
   * Check for new notifications (lightweight poll — fetches 1 item).
   */
  async function checkForNew() {
    try {
      const client = useClient();
      const notifications = await client.rest.v1.notifications.list({ limit: 1 });
      if (notifications.length > 0) {
        state.newestKnownId.value = notifications[0]!.id;
      }
    }
    catch {
      // Poll errors are silent
    }
  }

  /**
   * Mark all notifications as read by updating the server-side marker.
   */
  async function markAsRead() {
    const newest = state.newestKnownId.value;
    if (!newest)
      return;

    // Optimistic: update local state immediately
    state.lastReadId.value = newest;

    try {
      const client = useClient();
      await client.rest.v1.markers.create({
        notifications: { lastReadId: newest },
      } as any);
    }
    catch {
      // Marker update failed. Local state is still updated (optimistic).
      // Next fetchMarker will reconcile with server.
    }
  }

  /**
   * Start polling for new notifications with visibility-aware auto-pause.
   */
  function startPolling(ms?: number) {
    stopPolling();
    pollIntervalMs = ms ?? 60_000;

    pollIntervalId = setInterval(checkForNew, pollIntervalMs);

    if (typeof document !== 'undefined') {
      visibilityHandler = () => {
        if (document.visibilityState === 'hidden') {
          if (pollIntervalId !== undefined) {
            clearInterval(pollIntervalId);
            pollIntervalId = undefined;
          }
        }
        else {
          checkForNew();
          if (pollIntervalId === undefined) {
            pollIntervalId = setInterval(checkForNew, pollIntervalMs);
          }
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  }

  /**
   * Stop polling and clean up listener.
   */
  function stopPolling() {
    if (pollIntervalId !== undefined) {
      clearInterval(pollIntervalId);
      pollIntervalId = undefined;
    }
    if (visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = undefined;
    }
  }

  return {
    hasUnread,
    lastReadId: state.lastReadId,
    fetchMarker,
    markAsRead,
    startPolling,
    stopPolling,
  };
}

/**
 * Clear all notification marker state. Called on account switch.
 */
export function resetNotificationMarkerState() {
  states.clear();
  // Stop any active polling
  if (pollIntervalId !== undefined) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
  if (visibilityHandler && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = undefined;
  }
}
