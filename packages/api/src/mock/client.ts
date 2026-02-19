import type { Account, Context, FediwayStatus, Notification, Relationship, Status } from '@repo/types';
import type { mastodon } from 'masto';
import type { MastoClient, MastoClientConfig } from '../client';
import type { CreateStatusParams, FediwayAPI } from '../fediway-api';
import {
  allAccounts,
  bookmarkedStatuses,
  currentUserAccount,
  favouritedStatuses,
  mockAccounts,
  mockAccountStatuses,
  mockContexts,
  mockItemAggregations,
  mockNotifications,
  mockStatuses,
  suggestedAccounts,
  taggedStatuses,
  trendingTags,
} from './fixtures';

function delay(): Promise<void> {
  const ms = 30 + Math.random() * 70;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function paginateArray(items: Status[], params?: { limit?: number; maxId?: string; sinceId?: string }): Status[] {
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

export function createMockClient(): MastoClient {
  // In-memory state for the session
  const timelineStatuses = [...mockStatuses];

  function findStatusById(id: string): Status | undefined {
    // Check timeline
    const found = timelineStatuses.find(s => s.id === id);
    if (found)
      return found;

    // Check thread contexts
    for (const ctx of Object.values(mockContexts)) {
      const ancestor = ctx.ancestors.find(s => s.id === id);
      if (ancestor)
        return ancestor;
      const descendant = ctx.descendants.find(s => s.id === id);
      if (descendant)
        return descendant;
    }

    // Check account statuses
    for (const statuses of Object.values(mockAccountStatuses)) {
      const status = statuses.find(s => s.id === id);
      if (status)
        return status;
    }

    return undefined;
  }

  function findAccountByAcct(acct: string): Account | undefined {
    return mockAccounts[acct];
  }

  function findAccountById(id: string): Account | undefined {
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

  function getStatusContext(id: string): Context {
    if (mockContexts[id]) {
      return mockContexts[id];
    }

    const status = findStatusById(id);
    const ancestors: Status[] = [];
    const descendants: Status[] = [];

    if (status?.inReplyToId) {
      let currentId: string | null = status.inReplyToId;
      while (currentId) {
        const parent = findStatusById(currentId);
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

  function searchStatuses(query: string): Status[] {
    if (!query.trim())
      return [];
    const lowerQuery = query.toLowerCase();

    const timelineResults = timelineStatuses.filter(status =>
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

  function searchAccounts(query: string): Account[] {
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

  function searchTags(query: string) {
    if (!query.trim())
      return [];
    const lowerQuery = query.toLowerCase();
    return trendingTags.filter(tag =>
      tag.name.toLowerCase().includes(lowerQuery),
    );
  }

  // Build the mock REST client matching the mastodon.rest.Client shape
  // Only implements the ~20 methods the app actually calls
  const rest = {
    v1: {
      timelines: {
        home: {
          async list(params?: { limit?: number; maxId?: string; sinceId?: string }) {
            await delay();
            return paginateArray(timelineStatuses, params);
          },
        },
        tag: {
          $select(tagName: string) {
            return {
              async list() {
                await delay();
                const normalized = tagName.toLowerCase().replace(/^#/, '');
                const dedicated = taggedStatuses[normalized] || [];
                const fromTimeline = timelineStatuses.filter(status =>
                  status.tags.some(tag => tag.name.toLowerCase() === normalized),
                );
                const allResults = [...dedicated, ...fromTimeline];
                const seen = new Set<string>();
                return allResults
                  .filter((s) => {
                    if (seen.has(s.id))
                      return false;
                    seen.add(s.id);
                    return true;
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              },
            };
          },
        },
      },
      statuses: {
        async create(params: { status: string; spoilerText?: string; visibility?: string; inReplyToId?: string }) {
          await delay();
          const id = `mock-${nextId++}`;
          const status: Status = {
            id,
            uri: `https://social.network/statuses/${id}`,
            createdAt: new Date().toISOString(),
            editedAt: null,
            account: currentUserAccount,
            content: `<p>${params.status.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`,
            visibility: (params.visibility ?? 'public') as Status['visibility'],
            sensitive: false,
            spoilerText: params.spoilerText ?? '',
            mediaAttachments: [],
            application: { name: 'Fediway' },
            mentions: [],
            tags: [],
            emojis: [],
            reblogsCount: 0,
            favouritesCount: 0,
            repliesCount: 0,
            quotesCount: 0,
            quoteApproval: {
              automatic: ['public'],
              manual: [],
              currentUser: 'automatic',
            },
            url: `https://social.network/@jane/${id}`,
            inReplyToId: params.inReplyToId ?? null,
            inReplyToAccountId: null,
            reblog: null,
            poll: null,
            card: null,
            language: 'en',
            text: null,
            favourited: false,
            reblogged: false,
            muted: false,
            bookmarked: false,
            pinned: false,
          } as unknown as Status;
          timelineStatuses.unshift(status);
          return status;
        },
        $select(id: string) {
          return {
            async fetch() {
              await delay();
              const status = findStatusById(id);
              if (!status)
                throw new Error(`Status ${id} not found`);
              return status;
            },
            context: {
              async fetch() {
                await delay();
                return getStatusContext(id);
              },
            },
            async favourite() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.favourited = true;
                status.favouritesCount++;
              }
              return status!;
            },
            async unfavourite() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.favourited = false;
                status.favouritesCount = Math.max(0, status.favouritesCount - 1);
              }
              return status!;
            },
            async reblog() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.reblogged = true;
                status.reblogsCount++;
              }
              return status!;
            },
            async unreblog() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.reblogged = false;
                status.reblogsCount = Math.max(0, status.reblogsCount - 1);
              }
              return status!;
            },
            async bookmark() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.bookmarked = true;
              }
              return status!;
            },
            async unbookmark() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                status.bookmarked = false;
              }
              return status!;
            },
          };
        },
      },
      accounts: {
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
        relationships: {
          async fetch(params: { id: string[] }) {
            await delay();
            return params.id.map(id => ({
              id,
              following: false,
              followedBy: false,
              blocking: false,
              blockedBy: false,
              muting: false,
              mutingNotifications: false,
              requested: false,
              requestedBy: false,
              domainBlocking: false,
              endorsed: false,
              notifying: false,
              note: '',
            } as Relationship));
          },
        },
        $select(id: string) {
          return {
            statuses: {
              async list(params?: { limit?: number; maxId?: string; sinceId?: string }) {
                await delay();
                const account = findAccountById(id);
                if (account) {
                  return paginateArray(mockAccountStatuses[account.acct] || [], params);
                }
                return [];
              },
            },
            async follow() {
              await delay();
              return {
                id,
                following: true,
                followedBy: false,
                blocking: false,
                blockedBy: false,
                muting: false,
                mutingNotifications: false,
                requested: false,
                requestedBy: false,
                domainBlocking: false,
                endorsed: false,
                notifying: false,
                note: '',
              } as Relationship;
            },
            async unfollow() {
              await delay();
              return {
                id,
                following: false,
                followedBy: false,
                blocking: false,
                blockedBy: false,
                muting: false,
                mutingNotifications: false,
                requested: false,
                requestedBy: false,
                domainBlocking: false,
                endorsed: false,
                notifying: false,
                note: '',
              } as Relationship;
            },
          };
        },
      },
      notifications: {
        async list() {
          await delay();
          return mockNotifications as Notification[];
        },
      },
      favourites: {
        async list() {
          await delay();
          return favouritedStatuses;
        },
      },
      bookmarks: {
        async list() {
          await delay();
          return bookmarkedStatuses;
        },
      },
      trends: {
        tags: {
          async list() {
            await delay();
            return trendingTags;
          },
        },
      },
      directory: {
        async list() {
          await delay();
          return allAccounts();
        },
      },
    },
    v2: {
      search: {
        async list(params: { q: string; type?: string; limit?: number }) {
          await delay();
          if (params.type === 'accounts') {
            return {
              accounts: searchAccounts(params.q),
              statuses: [],
              hashtags: [],
            };
          }
          if (params.type === 'statuses') {
            return {
              accounts: [],
              statuses: searchStatuses(params.q),
              hashtags: [],
            };
          }
          if (params.type === 'hashtags') {
            return {
              accounts: [],
              statuses: [],
              hashtags: searchTags(params.q),
            };
          }
          return {
            accounts: searchAccounts(params.q),
            statuses: searchStatuses(params.q),
            hashtags: searchTags(params.q),
          };
        },
      },
      suggestions: {
        async list() {
          await delay();
          return suggestedAccounts.map(account => ({ source: 'staff', account }));
        },
      },
    },
  } as unknown as mastodon.rest.Client;

  // Build the mock Fediway API
  const fediway: FediwayAPI = {
    async createStatus(params: CreateStatusParams): Promise<FediwayStatus> {
      await delay();
      const id = `mock-fw-${nextId++}`;
      const status: FediwayStatus = {
        id,
        uri: `https://social.network/statuses/${id}`,
        createdAt: new Date().toISOString(),
        editedAt: null,
        account: currentUserAccount,
        content: `<p>${params.status.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`,
        visibility: (params.visibility ?? 'public') as FediwayStatus['visibility'],
        sensitive: false,
        spoilerText: '',
        mediaAttachments: [],
        application: { name: 'Fediway' },
        mentions: [],
        tags: [],
        emojis: [],
        reblogsCount: 0,
        favouritesCount: 0,
        repliesCount: 0,
        quotesCount: 0,
        quoteApproval: {
          automatic: ['public'],
          manual: [],
          currentUser: 'automatic',
        },
        url: `https://social.network/@jane/${id}`,
        inReplyToId: null,
        inReplyToAccountId: null,
        reblog: null,
        poll: null,
        card: null,
        language: 'en',
        text: null,
        favourited: false,
        reblogged: false,
        muted: false,
        bookmarked: false,
        pinned: false,
        item: params.itemUrl
          ? {
              url: params.itemUrl,
              type: (params.itemType as import('@repo/types').ItemType) || 'link',
              title: params.itemUrl,
            }
          : undefined,
        rating: params.rating ? { value: params.rating } : undefined,
      } as FediwayStatus;

      timelineStatuses.unshift(status);
      return status;
    },

    async getItem(url: string) {
      await delay();
      const aggregation = mockItemAggregations[url];
      if (!aggregation)
        throw new Error(`Item not found: ${url}`);
      return aggregation;
    },

    async getItemStatuses(url: string) {
      await delay();
      const aggregation = mockItemAggregations[url];
      if (!aggregation)
        return [];
      return [...aggregation.friendsTakes, ...aggregation.recentTakes];
    },
  };

  const config: MastoClientConfig = {
    url: 'https://mock.fediway.local',
  };

  return {
    rest,
    streaming: undefined,
    fediway,
    config,
    isAuthenticated: false,
  };
}
