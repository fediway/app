import type { Account, FediwayStatus, Status } from '@repo/types';
import type { PaginatedQueryResult } from '../createPaginatedQuery';
import type { QueryResult } from '../createQuery';
import { getProfilePath as buildProfilePath, getStatusPath as buildStatusPath } from '../../utils/paths';
import { createPaginatedQuery } from '../createPaginatedQuery';
import { createQuery } from '../createQuery';
import { useClient } from '../useClient';
import { useStatusStore } from '../useStatusStore';

export function useAccountData() {
  const client = useClient();
  const store = useStatusStore();

  function getAccountByAcct(acct: string): QueryResult<Account | undefined> {
    return createQuery(`account:${acct}`, undefined as Account | undefined, async () => {
      return await client.rest.v1.accounts.lookup({ acct });
    });
  }

  function getAccountStatuses(acct: string): QueryResult<Status[]> {
    return createQuery(`accountStatuses:${acct}`, [] as Status[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      const statuses = await client.rest.v1.accounts.$select(account.id).statuses.list({
        limit: 20,
        excludeReplies: true,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountStatusesPaginated(acct: string): PaginatedQueryResult<Status> {
    // Cache the account ID to avoid redundant lookups on loadMore
    let accountId: string | undefined;

    return createPaginatedQuery(`accountStatuses:${acct}:paginated`, async ({ limit, maxId }) => {
      if (!accountId) {
        const account = await client.rest.v1.accounts.lookup({ acct });
        accountId = account.id;
      }
      const statuses = await client.rest.v1.accounts.$select(accountId).statuses.list({
        limit,
        maxId,
        excludeReplies: true,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountStatusesWithReplies(acct: string): QueryResult<Status[]> {
    return createQuery(`accountReplies:${acct}`, [] as Status[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      const statuses = await client.rest.v1.accounts.$select(account.id).statuses.list({
        limit: 20,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountStatusesWithRepliesPaginated(acct: string): PaginatedQueryResult<Status> {
    let accountId: string | undefined;

    return createPaginatedQuery(`accountReplies:${acct}:paginated`, async ({ limit, maxId }) => {
      if (!accountId) {
        const account = await client.rest.v1.accounts.lookup({ acct });
        accountId = account.id;
      }
      const statuses = await client.rest.v1.accounts.$select(accountId).statuses.list({
        limit,
        maxId,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountMediaStatuses(acct: string): QueryResult<Status[]> {
    return createQuery(`accountMedia:${acct}`, [] as Status[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      const statuses = await client.rest.v1.accounts.$select(account.id).statuses.list({
        limit: 20,
        onlyMedia: true,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountMediaStatusesPaginated(acct: string): PaginatedQueryResult<Status> {
    let accountId: string | undefined;

    return createPaginatedQuery(`accountMedia:${acct}:paginated`, async ({ limit, maxId }) => {
      if (!accountId) {
        const account = await client.rest.v1.accounts.lookup({ acct });
        accountId = account.id;
      }
      const statuses = await client.rest.v1.accounts.$select(accountId).statuses.list({
        limit,
        maxId,
        onlyMedia: true,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getAccountFollowers(acct: string): QueryResult<Account[]> {
    return createQuery(`accountFollowers:${acct}`, [] as Account[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      return await client.rest.v1.accounts.$select(account.id).followers.list({ limit: 40 });
    });
  }

  function getAccountFollowing(acct: string): QueryResult<Account[]> {
    return createQuery(`accountFollowing:${acct}`, [] as Account[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      return await client.rest.v1.accounts.$select(account.id).following.list({ limit: 40 });
    });
  }

  function getSuggestedAccounts(): QueryResult<Account[]> {
    return createQuery('suggestions', [] as Account[], async () => {
      const result = await client.rest.v2.suggestions.list({ limit: 10 });
      return result.map(s => s.account);
    });
  }

  function getAllAccounts(): QueryResult<Account[]> {
    return createQuery('allAccounts', [] as Account[], async () => {
      return await client.rest.v1.directory.list({ limit: 40, order: 'active' });
    }, { scope: 'public' });
  }

  function getProfilePath(acct: string): string {
    return buildProfilePath(acct);
  }

  /** Build status path — looks up acct from store if not provided */
  function getStatusPath(statusId: string, acct?: string): string {
    if (acct)
      return buildStatusPath(acct, statusId);
    const status = store.get(statusId);
    if (status?.account?.acct)
      return buildStatusPath(status.account.acct, statusId);
    return `/@unknown/${statusId}`;
  }

  return {
    getAccountByAcct,
    getAccountStatuses,
    getAccountStatusesPaginated,
    getAccountStatusesWithReplies,
    getAccountStatusesWithRepliesPaginated,
    getAccountMediaStatuses,
    getAccountMediaStatusesPaginated,
    getAccountFollowers,
    getAccountFollowing,
    getSuggestedAccounts,
    getAllAccounts,
    getProfilePath,
    getStatusPath,
  };
}
