import type { Status } from '@repo/types';
import { useStatusActions, useStatusStore } from '@repo/api';
import { useToast } from '@repo/ui';
import { computed } from 'vue';
import { useAuthGate } from './useAuthGate';

/**
 * Web-specific wrapper around useStatusActions.
 * Centralizes toast feedback, error handling, and auth gating for all interaction pages.
 *
 * - Auth: all mutations gated via useAuthGate (opens modal for logged-out users)
 * - Bookmark: shows "Saved" / "Removed" toast (the only interaction needing confirmation)
 * - Errors: dev mode shows error detail, prod shows generic message
 * - Favourite/reblog: no toast (icon state change is sufficient feedback)
 */
export function useWebActions() {
  const store = useStatusStore();
  const { toast, removeToast } = useToast();
  const { requireAuth, isAuthenticated } = useAuthGate();

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

  /** Copy status URL to clipboard + toast */
  async function handleCopyLink(statusId: string) {
    const { getStatusPath } = useAccountData();
    const path = getStatusPath(statusId);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied');
    }
    catch {
      toast.error('Failed to copy');
    }
  }

  /** Delete status with confirmation callback */
  async function handleDelete(statusId: string) {
    await deleteStatus(statusId);
    toast.success('Post deleted');
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
    const stored = store.get(raw.id);
    if (!stored)
      return raw;
    return { ...raw, ...stored } as Status;
  }

  return {
    toggleFavourite: requireAuth(toggleFavourite, 'like this post'),
    toggleReblog: requireAuth(toggleReblog, 'boost this post'),
    handleBookmark: requireAuth(handleBookmark, 'bookmark this post'),
    handleCopyLink,
    handleDelete: requireAuth(handleDelete, 'delete this post'),
    withStoreState,
    getStoreStatus,
    store,
    isAuthenticated,
  };
}
