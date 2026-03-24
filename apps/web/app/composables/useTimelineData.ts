import type { FediwayStatus, Status } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient, useStatusStore } from '@repo/api';
import { createDataResult } from './useDataHelpers';

export function useTimelineData() {
  const client = useClient();
  const store = useStatusStore();

  function getFavouritedStatuses(): DataResult<Status[]> {
    return createDataResult('favourites', [] as Status[], async () => {
      const result = await client.rest.v1.favourites.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  function getBookmarkedStatuses(): DataResult<Status[]> {
    return createDataResult('bookmarks', [] as Status[], async () => {
      const result = await client.rest.v1.bookmarks.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  return { getFavouritedStatuses, getBookmarkedStatuses };
}
