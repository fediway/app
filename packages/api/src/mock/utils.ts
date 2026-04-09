import type { Account, Status } from '@repo/types';
import type { MockState } from './state';
import {
  mockAccounts,
  mockAccountStatuses,
  mockContexts,
  suggestedAccounts,
  taggedStatuses,
  trendingTags,
} from './fixtures';

export function delay(): Promise<void> {
  const ms = 30 + Math.random() * 70;
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function paginateArray(items: Status[], params?: { limit?: number; maxId?: string; sinceId?: string }): Status[] {
  let start = 0;
  let end = items.length;
  if (params?.maxId) {
    const idx = items.findIndex(s => s.id === params.maxId);
    if (idx !== -1)
      start = idx + 1;
    else return [];
  }
  if (params?.sinceId) {
    const idx = items.findIndex(s => s.id === params.sinceId);
    if (idx !== -1)
      end = idx;
  }
  return items.slice(start, Math.min(start + (params?.limit ?? 20), end));
}

let nextId = 5000;

export function getNextId(): string {
  return `mock-${nextId++}`;
}

export function getNextFediwayId(): string {
  return `mock-fw-${nextId++}`;
}

export function findStatusById(state: MockState, id: string): Status | undefined {
  const found = state.timelineStatuses.find(s => s.id === id);
  if (found)
    return found;

  for (const ctx of Object.values(mockContexts)) {
    const ancestor = ctx.ancestors.find(s => s.id === id);
    if (ancestor)
      return ancestor;
    const descendant = ctx.descendants.find(s => s.id === id);
    if (descendant)
      return descendant;
  }

  for (const statuses of Object.values(mockAccountStatuses)) {
    const status = statuses.find(s => s.id === id);
    if (status)
      return status;
  }

  return undefined;
}

export function findAccountByAcct(acct: string): Account | undefined {
  return mockAccounts[acct];
}

export function findAccountById(id: string): Account | undefined {
  for (const account of Object.values(mockAccounts)) {
    if (account.id === id)
      return account;
  }
  for (const account of suggestedAccounts) {
    if (account.id === id)
      return account;
  }
  return undefined;
}

export function searchStatuses(state: MockState, query: string): Status[] {
  if (!query.trim())
    return [];
  const lowerQuery = query.toLowerCase();

  const timelineResults = state.timelineStatuses.filter(status =>
    status.content.toLowerCase().includes(lowerQuery)
    || status.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)),
  );

  const taggedResults: Status[] = [];
  for (const statuses of Object.values(taggedStatuses)) {
    for (const status of statuses) {
      if (
        status.content.toLowerCase().includes(lowerQuery)
        || status.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery))
      ) {
        taggedResults.push(status);
      }
    }
  }

  const allResults = [...timelineResults, ...taggedResults];
  const seen = new Set<string>();
  return allResults.filter((status) => {
    if (seen.has(status.id))
      return false;
    seen.add(status.id);
    return true;
  });
}

export function searchAccounts(query: string): Account[] {
  if (!query.trim())
    return [];
  const lowerQuery = query.toLowerCase();
  return Object.values(mockAccounts).filter(
    account =>
      account.displayName.toLowerCase().includes(lowerQuery)
      || account.acct.toLowerCase().includes(lowerQuery)
      || account.username.toLowerCase().includes(lowerQuery),
  );
}

export function searchTags(query: string) {
  if (!query.trim())
    return [];
  const lowerQuery = query.toLowerCase();
  return trendingTags.filter(tag =>
    tag.name.toLowerCase().includes(lowerQuery),
  );
}

export function buildRelationship(state: MockState, accountId: string) {
  return {
    id: accountId,
    following: false,
    followedBy: false,
    blocking: state.blockedAccountIds.has(accountId),
    blockedBy: false,
    muting: state.mutedAccountIds.has(accountId),
    mutingNotifications: state.mutedAccountIds.has(accountId),
    requested: false,
    requestedBy: false,
    domainBlocking: false,
    endorsed: false,
    notifying: false,
    note: '',
  };
}

export function getStatusContext(state: MockState, id: string) {
  if (mockContexts[id]) {
    return mockContexts[id];
  }

  const status = findStatusById(state, id);
  const ancestors: Status[] = [];
  const descendants: Status[] = [];

  if (status?.inReplyToId) {
    let currentId: string | null = status.inReplyToId;
    while (currentId) {
      const parent = findStatusById(state, currentId);
      if (parent) {
        ancestors.unshift(parent);
        currentId = parent.inReplyToId ?? null;
      }
      else {
        break;
      }
    }
  }

  for (const ctx of Object.values(mockContexts)) {
    for (const reply of ctx.descendants) {
      if (reply.inReplyToId === id) {
        descendants.push(reply);
        const nested = ctx.descendants.filter(r => r.inReplyToId === reply.id);
        descendants.push(...nested);
      }
    }
  }

  return { ancestors, descendants };
}
