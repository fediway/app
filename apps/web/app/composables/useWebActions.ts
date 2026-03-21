import type { Status } from '@repo/types';
import { useStatusActions, useStatusStore } from '@repo/api';
import { useToast } from '@repo/ui';
import { computed } from 'vue';

/**
 * Web-specific wrapper around useStatusActions.
 * Centralizes toast feedback and error handling for all interaction pages.
 *
 * - Bookmark: shows "Saved" / "Removed" toast (the only interaction needing confirmation)
 * - Errors: dev mode shows error detail, prod shows generic message
 * - Favourite/reblog: no toast (icon state change is sufficient feedback)
 */
export function useWebActions() {
  const store = useStatusStore();
  const { toast, removeToast } = useToast();

  // Track bookmark toast so we can dismiss it on error
  let bookmarkToastId: string | undefined;

  const { toggleFavourite, toggleReblog, toggleBookmark, deleteStatus } = useStatusActions({
    onError: (err) => {
      // Dismiss optimistic bookmark toast before showing error
      if (err.action === 'bookmark' && bookmarkToastId) {
        removeToast(bookmarkToastId);
        bookmarkToastId = undefined;
      }

      if (import.meta.dev) {
        console.error(`[useWebActions] ${err.action} failed for ${err.statusId}:`, err.error);
        toast.error('Action failed', err.error.message);
      }
      else {
        toast.error('Action failed', 'Please try again.');
      }
    },
  });

  function handleBookmark(statusId: string) {
    const status = store.get(statusId);
    const wasBookmarked = status?.bookmarked;
    toggleBookmark(statusId);
    bookmarkToastId = toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Saved');
  }

  /**
   * Map statuses through the store for display.
   * Returns a computed that reflects optimistic updates from useStatusActions.
   * Same pattern as mobile's useStatusBridge.
   */
  function withStoreState(source: { value: Status[] }) {
    return computed(() =>
      source.value.map((s) => {
        const id = s.reblog?.id ?? s.id;
        const stored = store.get(id);
        if (!stored)
          return s;
        if (s.reblog)
          return { ...s, reblog: { ...s.reblog, ...stored } } as Status;
        return { ...s, ...stored } as Status;
      }),
    );
  }

  /**
   * Get a single status from the store, falling back to the raw value.
   */
  function getStoreStatus(raw: Status | undefined): Status | undefined {
    if (!raw)
      return undefined;
    return (store.get(raw.id) as Status) ?? raw;
  }

  return {
    toggleFavourite,
    toggleReblog,
    handleBookmark,
    deleteStatus,
    withStoreState,
    getStoreStatus,
    store,
  };
}
