import type { Status } from '@repo/types';
import { useClient, useStatusActions, useStatusStore } from '@repo/api';
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

  const { toggleFavourite, toggleReblog, toggleBookmark } = useStatusActions({
    onError: (err) => {
      // Dismiss optimistic bookmark toast before showing error
      if (err.action === 'bookmark' && bookmarkToastId) {
        removeToast(bookmarkToastId);
        bookmarkToastId = undefined;
      }

      const actionMessages: Record<string, string> = {
        favourite: 'Couldn\'t like this post',
        reblog: 'Couldn\'t boost this post',
        bookmark: 'Couldn\'t save this post',
        delete: 'Couldn\'t delete this post',
      };
      const message = actionMessages[err.action] || 'Action failed';

      if (import.meta.dev) {
        console.error(`[useWebActions] ${err.action} failed for ${err.statusId}:`, err.error);
        toast.error(message, err.error.message);
      }
      else {
        toast.error(message, 'Please try again.');
      }
    },
  });

  function handleBookmark(statusId: string) {
    const status = store.get(statusId);
    const wasBookmarked = status?.bookmarked;
    toggleBookmark(statusId);
    if (wasBookmarked) {
      bookmarkToastId = toast.success('Unsaved');
    }
    else {
      bookmarkToastId = toast.success('Saved', {
        action: { label: 'View', onClick: () => navigateTo('/saved') },
      });
    }
  }

  /** Share status via Web Share API, with clipboard fallback */
  async function handleShare(statusId: string) {
    const { getStatusPath } = useAccountData();
    const status = store.get(statusId);
    const path = getStatusPath(statusId);
    const url = `${window.location.origin}${path}`;

    // Build share context
    const title = status?.account?.displayName
      ? `${status.account.displayName}: ${(status.content || '').replace(/<[^>]*>/g, '').slice(0, 80)}`
      : undefined;
    const text = status?.content
      ? status.content.replace(/<[^>]*>/g, '').slice(0, 200)
      : undefined;

    if (navigator.share) {
      try {
        await navigator.share({ url, title, text });
      }
      catch {
        // User cancelled share — not an error
      }
    }
    else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
      catch {
        toast.error('Failed to copy');
      }
    }
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

  /** Delete with undo-toast: optimistically removes, waits 5s, then commits */
  function handleDelete(statusId: string) {
    const snapshot = store.get(statusId);
    if (!snapshot)
      return;

    // Mark as deleted — withStoreState filters it out
    store.remove(statusId);

    let undone = false;
    const deleteToastId = toast.success('Post deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          undone = true;
          // Restore: clear deleted flag and put data back
          store.restore(statusId);
          store.set(snapshot);
        },
      },
    });

    // Wait 5 seconds, then execute if not undone
    setTimeout(async () => {
      if (undone)
        return;
      try {
        await useClient().rest.v1.statuses.$select(statusId).remove();
      }
      catch {
        // Restore on failure
        store.restore(statusId);
        store.set(snapshot);
        removeToast(deleteToastId);
        toast.error('Couldn\'t delete this post', 'Please try again.');
      }
    }, 5000);
  }

  async function handleMute(accountId: string) {
    try {
      await useClient().rest.v1.accounts.$select(accountId).mute();
      toast.success('User muted');
    }
    catch {
      toast.error('Couldn\'t mute user', 'Please try again.');
    }
  }

  async function handleBlock(accountId: string) {
    try {
      await useClient().rest.v1.accounts.$select(accountId).block();
      toast.success('User blocked');
    }
    catch {
      toast.error('Couldn\'t block user', 'Please try again.');
    }
  }

  async function handleBlockDomain(domain: string) {
    try {
      await useClient().rest.v1.domainBlocks.create({ domain });
      toast.success('Domain blocked');
    }
    catch {
      toast.error('Couldn\'t block domain', 'Please try again.');
    }
  }

  async function handleReport(accountId: string) {
    try {
      await useClient().rest.v1.reports.create({ accountId, category: 'other' });
      toast.success('Report submitted');
    }
    catch {
      toast.error('Couldn\'t submit report', 'Please try again.');
    }
  }

  /**
   * Map statuses through the store for display.
   * Returns a computed that reflects optimistic updates from useStatusActions.
   * Same pattern as mobile's useStatusBridge.
   */
  function withStoreState(source: { value: Status[] }) {
    return computed(() =>
      source.value
        .filter((s) => {
          const id = s.reblog?.id ?? s.id;
          return !store.isDeleted(id);
        })
        .map((s) => {
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
    toggleReblog: requireAuth(toggleReblog, 'repost this'),
    handleBookmark: requireAuth(handleBookmark, 'save this post'),
    handleCopyLink,
    handleShare,
    handleDelete: requireAuth(handleDelete, 'delete this post'),
    handleMute: requireAuth(handleMute, 'mute this user'),
    handleBlock: requireAuth(handleBlock, 'block this user'),
    handleBlockDomain: requireAuth(handleBlockDomain, 'block this domain'),
    handleReport: requireAuth(handleReport, 'report this user'),
    withStoreState,
    getStoreStatus,
    store,
    isAuthenticated,
  };
}
