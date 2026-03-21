import type { Account, FediwayStatus, Status } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient, useStatusStore } from '@repo/api';
import { createDataResult } from './useDataHelpers';

const LEADING_AT_RE = /^@/;

export function useAccountData() {
  const client = useClient();
  const store = useStatusStore();

  function getAccountByAcct(acct: string): DataResult<Account | undefined> {
    return createDataResult(`account:${acct}`, undefined as Account | undefined, async () => {
      return await client.rest.v1.accounts.lookup({ acct });
    });
  }

  function getAccountStatuses(acct: string): DataResult<Status[]> {
    return createDataResult(`accountStatuses:${acct}`, [] as Status[], async () => {
      const account = await client.rest.v1.accounts.lookup({ acct });
      const statuses = await client.rest.v1.accounts.$select(account.id).statuses.list({
        limit: 20,
        excludeReplies: true,
      });
      store.setMany(statuses as FediwayStatus[]);
      return statuses;
    });
  }

  function getSuggestedAccounts(): DataResult<Account[]> {
    return createDataResult('suggestions', [] as Account[], async () => {
      const result = await client.rest.v2.suggestions.list({ limit: 10 });
      return result.map(s => s.account);
    });
  }

  function getAllAccounts(): DataResult<Account[]> {
    return createDataResult('allAccounts', [] as Account[], async () => {
      return await client.rest.v1.directory.list({ limit: 40, order: 'active' });
    });
  }

  function getProfilePath(acct: string): string {
    const cleanAcct = acct.replace(LEADING_AT_RE, '');
    return `/@${cleanAcct}`;
  }

  /** Build status path: /@acct/statusId (Mastodon convention) */
  function getStatusPath(statusId: string, acct?: string): string {
    if (acct) {
      return `${getProfilePath(acct)}/${statusId}`;
    }
    const status = store.get(statusId);
    if (status?.account?.acct) {
      return `${getProfilePath(status.account.acct)}/${statusId}`;
    }
    return `/@unknown/${statusId}`;
  }

  return { getAccountByAcct, getAccountStatuses, getSuggestedAccounts, getAllAccounts, getProfilePath, getStatusPath };
}
