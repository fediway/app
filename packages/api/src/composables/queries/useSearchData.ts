import type { Account, FediwayStatus, Status, Tag } from '@repo/types';
import type { QueryResult } from '../createQuery';
import { createQuery } from '../createQuery';
import { useClient } from '../useClient';
import { useStatusStore } from '../useStatusStore';

export function useSearchData() {
  const client = useClient();
  const store = useStatusStore();

  function searchAccounts(query: string): QueryResult<Account[]> {
    if (!query.trim()) {
      return createQuery('searchAccounts:empty', [] as Account[], () => Promise.resolve([]));
    }
    return createQuery(`searchAccounts:${query}`, [] as Account[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'accounts', limit: 20 });
      return result.accounts;
    });
  }

  function searchStatuses(query: string): QueryResult<Status[]> {
    if (!query.trim()) {
      return createQuery('searchStatuses:empty', [] as Status[], () => Promise.resolve([]));
    }
    return createQuery(`searchStatuses:${query}`, [] as Status[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'statuses', limit: 20 });
      store.setMany(result.statuses as FediwayStatus[]);
      return result.statuses;
    });
  }

  function searchTags(query: string): QueryResult<Tag[]> {
    if (!query.trim()) {
      return createQuery('searchTags:empty', [] as Tag[], () => Promise.resolve([]));
    }
    return createQuery(`searchTags:${query}`, [] as Tag[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'hashtags', limit: 20 });
      return result.hashtags;
    });
  }

  return { searchAccounts, searchStatuses, searchTags };
}
