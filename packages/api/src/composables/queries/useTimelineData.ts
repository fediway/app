import type { FediwayStatus, Status } from '@repo/types';
import type { QueryResult } from '../createQuery';
import { createQuery } from '../createQuery';
import { useClient } from '../useClient';
import { useStatusStore } from '../useStatusStore';

export function useTimelineData() {
  const client = useClient();
  const store = useStatusStore();

  function getFavouritedStatuses(): QueryResult<Status[]> {
    return createQuery('favourites', [] as Status[], async () => {
      const result = await client.rest.v1.favourites.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  function getBookmarkedStatuses(): QueryResult<Status[]> {
    return createQuery('bookmarks', [] as Status[], async () => {
      const result = await client.rest.v1.bookmarks.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  return { getFavouritedStatuses, getBookmarkedStatuses };
}
