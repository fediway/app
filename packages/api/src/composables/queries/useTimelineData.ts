import type { FediwayStatus, Status } from '@repo/types';
import type { PaginatedQueryResult } from '../createPaginatedQuery';
import type { QueryResult } from '../createQuery';
import { createPaginatedQuery } from '../createPaginatedQuery';
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

  function getFavouritedStatusesPaginated(): PaginatedQueryResult<Status> {
    return createPaginatedQuery('favourites:paginated', async ({ limit, maxId }) => {
      const result = await client.rest.v1.favourites.list({ limit, maxId });
      store.setMany(result as FediwayStatus[]);
      return result;
    }, { limit: 20 });
  }

  function getBookmarkedStatuses(): QueryResult<Status[]> {
    return createQuery('bookmarks', [] as Status[], async () => {
      const result = await client.rest.v1.bookmarks.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  function getBookmarkedStatusesPaginated(): PaginatedQueryResult<Status> {
    return createPaginatedQuery('bookmarks:paginated', async ({ limit, maxId }) => {
      const result = await client.rest.v1.bookmarks.list({ limit, maxId });
      store.setMany(result as FediwayStatus[]);
      return result;
    }, { limit: 20 });
  }

  return {
    getFavouritedStatuses,
    getFavouritedStatusesPaginated,
    getBookmarkedStatuses,
    getBookmarkedStatusesPaginated,
  };
}
