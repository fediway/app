import type { Status } from '@repo/types';
import { useAuth } from '@repo/api';
import { reactive } from 'vue';
import { useDataMode } from './useDataMode';

// Module-level state — persists across page navigations
const overrides = reactive(new Map<string, {
  favourited?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  favouritesCount?: number;
  reblogsCount?: number;
}>());

function callApi(fn: () => Promise<unknown>) {
  fn().catch((err) => {
    console.error('[useInteractions] API call failed:', err);
  });
}

export function useInteractions() {
  const { mode } = useDataMode();

  function getClient() {
    const { getClient } = useAuth();
    return getClient();
  }

  function toggleFavourite(statusId: string, statuses: Status[]) {
    const status = findStatus(statusId, statuses);
    if (!status)
      return;
    const current = overrides.get(statusId) || {};
    const isFav = current.favourited ?? status.favourited ?? false;
    const count = current.favouritesCount ?? status.favouritesCount;
    overrides.set(statusId, {
      ...current,
      favourited: !isFav,
      favouritesCount: count + (isFav ? -1 : 1),
    });

    if (mode.value === 'live') {
      const client = getClient();
      if (client) {
        callApi(async () => {
          if (isFav) {
            await client.rest.v1.statuses.$select(statusId).unfavourite();
          }
          else {
            await client.rest.v1.statuses.$select(statusId).favourite();
          }
        });
      }
    }
  }

  function toggleReblog(statusId: string, statuses: Status[]) {
    const status = findStatus(statusId, statuses);
    if (!status)
      return;
    const current = overrides.get(statusId) || {};
    const isReblogged = current.reblogged ?? status.reblogged ?? false;
    const count = current.reblogsCount ?? status.reblogsCount;
    overrides.set(statusId, {
      ...current,
      reblogged: !isReblogged,
      reblogsCount: count + (isReblogged ? -1 : 1),
    });

    if (mode.value === 'live') {
      const client = getClient();
      if (client) {
        callApi(async () => {
          if (isReblogged) {
            await client.rest.v1.statuses.$select(statusId).unreblog();
          }
          else {
            await client.rest.v1.statuses.$select(statusId).reblog();
          }
        });
      }
    }
  }

  function toggleBookmark(statusId: string, statuses: Status[]) {
    const status = findStatus(statusId, statuses);
    if (!status)
      return;
    const current = overrides.get(statusId) || {};
    const isBookmarked = current.bookmarked ?? status.bookmarked ?? false;
    overrides.set(statusId, {
      ...current,
      bookmarked: !isBookmarked,
    });

    if (mode.value === 'live') {
      const client = getClient();
      if (client) {
        callApi(async () => {
          if (isBookmarked) {
            await client.rest.v1.statuses.$select(statusId).unbookmark();
          }
          else {
            await client.rest.v1.statuses.$select(statusId).bookmark();
          }
        });
      }
    }
  }

  /** Apply interaction overrides to a single status */
  function withOverrides(status: Status): Status {
    // Check the display status (handles reblogs)
    const displayId = status.reblog?.id ?? status.id;
    const o = overrides.get(displayId);
    if (!o)
      return status;

    if (status.reblog) {
      return { ...status, reblog: { ...status.reblog, ...o } };
    }
    return { ...status, ...o };
  }

  /** Apply interaction overrides to an array of statuses */
  function withOverridesAll(statuses: Status[]): Status[] {
    return statuses.map(withOverrides);
  }

  return { toggleFavourite, toggleReblog, toggleBookmark, withOverrides, withOverridesAll };
}

function findStatus(id: string, statuses: Status[]): Status | undefined {
  for (const s of statuses) {
    if (s.id === id)
      return s;
    if (s.reblog?.id === id)
      return s.reblog;
  }
  return undefined;
}
