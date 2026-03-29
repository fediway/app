import type { FediwayStatus } from '@repo/types';
import { getActiveAccountKeySync } from '../auth/account-store';
import { useClient } from './useClient';
import { useStatusStore } from './useStatusStore';

export interface StatusActionError {
  action: 'favourite' | 'reblog' | 'bookmark' | 'delete';
  statusId: string;
  error: Error;
}

export interface UseStatusActionsOptions {
  onError?: (error: StatusActionError) => void;
}

export interface UseStatusActionsReturn {
  toggleFavourite: (id: string) => Promise<void>;
  toggleReblog: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
}

export function useStatusActions(options?: UseStatusActionsOptions): UseStatusActionsReturn {
  // Lazy client — resolved on first action, not during setup.
  // This allows the composable to be called before auth is initialized.
  const store = useStatusStore();
  const getClient = () => useClient();

  // Prevent concurrent mutations on the same status (race condition guard)
  const inFlight = new Set<string>();

  async function toggleFavourite(id: string): Promise<void> {
    if (inFlight.has(`fav:${id}`))
      return;
    const current = store.get(id);
    if (!current)
      return;
    inFlight.add(`fav:${id}`);

    const snapshot = { ...current } as FediwayStatus;
    const wasFavourited = current.favourited;
    const accountKey = getActiveAccountKeySync();

    // Optimistic update — marks status as having a pending mutation
    store.patch(id, {
      favourited: !wasFavourited,
      favouritesCount: wasFavourited
        ? Math.max(0, current.favouritesCount - 1)
        : current.favouritesCount + 1,
    });

    try {
      wasFavourited
        ? await getClient().rest.v1.statuses.$select(id).unfavourite()
        : await getClient().rest.v1.statuses.$select(id).favourite();
      if (getActiveAccountKeySync() === accountKey)
        store.commitMutation(id);
    }
    catch (err) {
      if (getActiveAccountKeySync() === accountKey) {
        store.set(snapshot, { force: true });
        store.commitMutation(id);
        options?.onError?.({
          action: 'favourite',
          statusId: id,
          error: err instanceof Error ? err : new Error('Failed to toggle favourite'),
        });
      }
    }
    finally {
      inFlight.delete(`fav:${id}`);
    }
  }

  async function toggleReblog(id: string): Promise<void> {
    if (inFlight.has(`reblog:${id}`))
      return;
    const current = store.get(id);
    if (!current)
      return;
    inFlight.add(`reblog:${id}`);

    const snapshot = { ...current } as FediwayStatus;
    const wasReblogged = current.reblogged;
    const accountKey = getActiveAccountKeySync();

    // Optimistic update
    store.patch(id, {
      reblogged: !wasReblogged,
      reblogsCount: wasReblogged
        ? Math.max(0, current.reblogsCount - 1)
        : current.reblogsCount + 1,
    });

    try {
      wasReblogged
        ? await getClient().rest.v1.statuses.$select(id).unreblog()
        : await getClient().rest.v1.statuses.$select(id).reblog();
      // Reblog API returns a wrapper status with a different ID — ignore it.
      // The optimistic patch already set reblogged=true on the original.
      if (getActiveAccountKeySync() === accountKey)
        store.commitMutation(id);
    }
    catch (err) {
      if (getActiveAccountKeySync() === accountKey) {
        store.set(snapshot, { force: true });
        store.commitMutation(id);
        options?.onError?.({
          action: 'reblog',
          statusId: id,
          error: err instanceof Error ? err : new Error('Failed to toggle reblog'),
        });
      }
    }
    finally {
      inFlight.delete(`reblog:${id}`);
    }
  }

  async function toggleBookmark(id: string): Promise<void> {
    if (inFlight.has(`bookmark:${id}`))
      return;
    const current = store.get(id);
    if (!current)
      return;
    inFlight.add(`bookmark:${id}`);

    const snapshot = { ...current } as FediwayStatus;
    const wasBookmarked = current.bookmarked;
    const accountKey = getActiveAccountKeySync();

    // Optimistic update
    store.patch(id, {
      bookmarked: !wasBookmarked,
    });

    try {
      wasBookmarked
        ? await getClient().rest.v1.statuses.$select(id).unbookmark()
        : await getClient().rest.v1.statuses.$select(id).bookmark();
      if (getActiveAccountKeySync() === accountKey)
        store.commitMutation(id);
    }
    catch (err) {
      if (getActiveAccountKeySync() === accountKey) {
        store.set(snapshot, { force: true });
        store.commitMutation(id);
        options?.onError?.({
          action: 'bookmark',
          statusId: id,
          error: err instanceof Error ? err : new Error('Failed to toggle bookmark'),
        });
      }
    }
    finally {
      inFlight.delete(`bookmark:${id}`);
    }
  }

  async function deleteStatus(id: string): Promise<void> {
    const current = store.get(id);
    if (!current)
      return;

    try {
      await getClient().rest.v1.statuses.$select(id).remove();
      store.remove(id);
    }
    catch (err) {
      options?.onError?.({
        action: 'delete',
        statusId: id,
        error: err instanceof Error ? err : new Error('Failed to delete status'),
      });
    }
  }

  return {
    toggleFavourite,
    toggleReblog,
    toggleBookmark,
    deleteStatus,
  };
}
