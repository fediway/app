import type { Account, FediwayStatus, Status, Tag } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient, useStatusStore } from '@repo/api';
import { createDataResult } from './useDataHelpers';

export function useSearchData() {
  const client = useClient();
  const store = useStatusStore();

  function searchAccounts(query: string): DataResult<Account[]> {
    if (!query.trim()) {
      return createDataResult('searchAccounts:empty', [] as Account[], () => Promise.resolve([]));
    }
    return createDataResult(`searchAccounts:${query}`, [] as Account[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'accounts', limit: 20 });
      return result.accounts;
    });
  }

  function searchStatuses(query: string): DataResult<Status[]> {
    if (!query.trim()) {
      return createDataResult('searchStatuses:empty', [] as Status[], () => Promise.resolve([]));
    }
    return createDataResult(`searchStatuses:${query}`, [] as Status[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'statuses', limit: 20 });
      store.setMany(result.statuses as FediwayStatus[]);
      return result.statuses;
    });
  }

  function searchTags(query: string): DataResult<Tag[]> {
    if (!query.trim()) {
      return createDataResult('searchTags:empty', [] as Tag[], () => Promise.resolve([]));
    }
    return createDataResult(`searchTags:${query}`, [] as Tag[], async () => {
      const result = await client.rest.v2.search.list({ q: query, type: 'hashtags', limit: 20 });
      return result.hashtags;
    });
  }

  return { searchAccounts, searchStatuses, searchTags };
}
