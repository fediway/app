import type { Relationship } from '@repo/types';
import type { MockState } from '../state';
import {
  allAccounts,
  currentUserAccount,
  mockAccountStatuses,
} from '../fixtures';
import {
  buildRelationship,
  delay,
  findAccountByAcct,
  findAccountById,
  paginateArray,
} from '../utils';

export function createAccountsHandler(state: MockState) {
  return {
    async lookup(params: { acct: string }) {
      await delay();
      const account = findAccountByAcct(params.acct);
      if (!account)
        throw new Error(`Account ${params.acct} not found`);
      return account;
    },
    async verifyCredentials() {
      await delay();
      return currentUserAccount;
    },
    async updateCredentials(params: { displayName?: string; note?: string; avatar?: any; source?: any }) {
      await delay();
      const updated: any = { ...currentUserAccount };
      if (params.displayName !== undefined)
        updated.displayName = params.displayName;
      if (params.note !== undefined)
        updated.note = `<p>${params.note}</p>`;
      updated.source = { note: params.note ?? '', privacy: params.source?.privacy ?? 'public', sensitive: params.source?.sensitive ?? false, language: 'en', fields: [] };
      return updated;
    },
    relationships: {
      async fetch(params: { id: string[] }) {
        await delay();
        return params.id.map(id => buildRelationship(state, id));
      },
    },
    $select(id: string) {
      return {
        async fetch() {
          await delay();
          const account = findAccountById(id);
          if (!account)
            throw new Error(`Account ${id} not found`);
          return account;
        },
        statuses: {
          async list(params?: { limit?: number; maxId?: string; sinceId?: string; onlyMedia?: boolean; pinned?: boolean }) {
            await delay();
            const account = findAccountById(id);
            if (account) {
              let statuses = mockAccountStatuses[account.acct] || [];
              if (params?.pinned) {
                return statuses.filter(s => s.pinned).slice(0, params?.limit ?? 5);
              }
              if (params?.onlyMedia) {
                statuses = statuses.filter(s => s.mediaAttachments && s.mediaAttachments.length > 0);
              }
              return paginateArray(statuses, params);
            }
            return [];
          },
        },
        followers: {
          async list(_params?: { limit?: number }) {
            await delay();
            return allAccounts().filter(a => a.id !== id).slice(0, _params?.limit ?? 40);
          },
        },
        following: {
          async list(_params?: { limit?: number }) {
            await delay();
            return allAccounts().filter(a => a.id !== id).slice(0, Math.min(_params?.limit ?? 40, 5));
          },
        },
        async follow() {
          await delay();
          const rel = buildRelationship(state, id);
          return { ...rel, following: true } as Relationship;
        },
        async unfollow() {
          await delay();
          return buildRelationship(state, id);
        },
        async block() {
          await delay();
          state.blockedAccountIds.add(id);
          return buildRelationship(state, id);
        },
        async unblock() {
          await delay();
          state.blockedAccountIds.delete(id);
          return buildRelationship(state, id);
        },
        async mute(_params?: { notifications?: boolean; duration?: number }) {
          await delay();
          state.mutedAccountIds.add(id);
          return buildRelationship(state, id);
        },
        async unmute() {
          await delay();
          state.mutedAccountIds.delete(id);
          return buildRelationship(state, id);
        },
      };
    },
  };
}
