import type { Account, Context, FediwayStatus, Status } from '@repo/types';
import type { QueryResult } from '../createQuery';
import { createQuery } from '../createQuery';
import { useClient } from '../useClient';
import { useStatusStore } from '../useStatusStore';

export function useStatusData() {
  const client = useClient();
  const store = useStatusStore();

  function getStatusById(id: string): QueryResult<Status | undefined> {
    return createQuery(`status:${id}`, undefined as Status | undefined, async () => {
      const status = await client.rest.v1.statuses.$select(id).fetch();
      store.set(status as FediwayStatus);
      return status;
    });
  }

  function getStatusContext(id: string): QueryResult<Context> {
    const empty: Context = { ancestors: [], descendants: [] };
    return createQuery(`context:${id}`, empty, async () => {
      const context = await client.rest.v1.statuses.$select(id).context.fetch();
      store.setMany([...context.ancestors, ...context.descendants] as FediwayStatus[]);
      return context;
    });
  }

  function getRebloggedBy(id: string): QueryResult<Account[]> {
    return createQuery(`rebloggedBy:${id}`, [] as Account[], async () => {
      const accounts = await client.rest.v1.statuses.$select(id).rebloggedBy.list();
      return accounts;
    });
  }

  function getFavouritedBy(id: string): QueryResult<Account[]> {
    return createQuery(`favouritedBy:${id}`, [] as Account[], async () => {
      const accounts = await client.rest.v1.statuses.$select(id).favouritedBy.list();
      return accounts;
    });
  }

  return { getStatusById, getStatusContext, getRebloggedBy, getFavouritedBy };
}
