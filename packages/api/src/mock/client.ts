import type { Account, Context, Conversation, FediwayStatus, Notification, Relationship, Status } from '@repo/types';
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
  mockConversations,
  mockItemAggregations,
  mockNotifications,
  mockStatuses,
  suggestedAccounts,
  taggedStatuses,
  trendingLinks,
  trendingTags,
} from './fixtures';

const HASH_PREFIX_RE = /^#/;
const AMP_RE = /&/g;
const LT_RE = /</g;
const GT_RE = />/g;
const NEWLINE_RE = /\n/g;

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
  // Moderation state — Sets so block/unblock are idempotent like the real API
  const blockedAccountIds = new Set<string>();
  const mutedAccountIds = new Set<string>();
  const mutedStatusIds = new Set<string>();
  const blockedDomainsSet = new Set<string>();
  const mockReports: Array<{ id: string; category: string; comment: string; statusIds: string[]; targetAccount: { id: string }; ruleIds: string[]; actionTaken: boolean; createdAt: string }> = [];
  const mockFiltersList: Array<{ id: string; title: string; context: string[]; filterAction: string; expiresAt: string | null; keywords: Array<{ id: string; keyword: string; wholeWord: boolean }>; statuses: [] }> = [];
  let nextFilterId = 1;
  let nextFilterKeywordId = 1;
  let nextReportId = 1;

  const instanceRules = [
    { id: '1', text: 'No spam or advertising', hint: 'Do not post unsolicited advertisements or spam content.' },
    { id: '2', text: 'No harassment or abuse', hint: 'Be respectful to other users.' },
    { id: '3', text: 'No illegal content', hint: 'Do not post content that violates applicable laws.' },
    { id: '4', text: 'Use content warnings', hint: 'Use CW for sensitive or potentially triggering content.' },
  ];

  // Derives relationship from current Sets — used by both action endpoints and relationships.fetch
  function buildRelationship(accountId: string): Relationship {
    return {
      id: accountId,
      following: false,
      followedBy: false,
      blocking: blockedAccountIds.has(accountId),
      blockedBy: false,
      muting: mutedAccountIds.has(accountId),
      mutingNotifications: mutedAccountIds.has(accountId),
      requested: false,
      requestedBy: false,
      domainBlocking: false,
      endorsed: false,
      notifying: false,
      note: '',
    } as Relationship;
  }

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
                const normalized = tagName.toLowerCase().replace(HASH_PREFIX_RE, '');
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
            content: `<p>${params.status.replace(AMP_RE, '&amp;').replace(LT_RE, '&lt;').replace(GT_RE, '&gt;').replace(NEWLINE_RE, '<br>')}</p>`,
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
            async mute() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                mutedStatusIds.add(id);
                status.muted = true;
              }
              return status!;
            },
            async unmute() {
              await delay();
              const status = findStatusById(id);
              if (status) {
                mutedStatusIds.delete(id);
                status.muted = false;
              }
              return status!;
            },
            async remove() {
              await delay();
              const idx = timelineStatuses.findIndex(s => s.id === id);
              if (idx >= 0)
                timelineStatuses.splice(idx, 1);
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
            return params.id.map(id => buildRelationship(id));
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
              async list(params?: { limit?: number; maxId?: string; sinceId?: string; onlyMedia?: boolean }) {
                await delay();
                const account = findAccountById(id);
                if (account) {
                  let statuses = mockAccountStatuses[account.acct] || [];
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
              const rel = buildRelationship(id);
              return { ...rel, following: true } as Relationship;
            },
            async unfollow() {
              await delay();
              return buildRelationship(id);
            },
            async block() {
              await delay();
              blockedAccountIds.add(id);
              return buildRelationship(id);
            },
            async unblock() {
              await delay();
              blockedAccountIds.delete(id);
              return buildRelationship(id);
            },
            async mute(_params?: { notifications?: boolean; duration?: number }) {
              await delay();
              mutedAccountIds.add(id);
              return buildRelationship(id);
            },
            async unmute() {
              await delay();
              mutedAccountIds.delete(id);
              return buildRelationship(id);
            },
          };
        },
      },
      notifications: {
        async list(params?: { limit?: number; types?: string[] }) {
          await delay();
          let result = mockNotifications as Notification[];
          if (params?.types?.length) {
            result = result.filter(n => params.types!.includes(n.type));
          }
          return result.slice(0, params?.limit ?? 30);
        },
      },
      conversations: {
        async list() {
          await delay();
          return mockConversations as Conversation[];
        },
        $select(id: string) {
          return {
            async read() {
              await delay();
              const conv = mockConversations.find(c => c.id === id);
              if (!conv)
                throw new Error(`Conversation ${id} not found`);
              return { ...conv, unread: false };
            },
          };
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
        links: {
          async list() {
            await delay();
            return trendingLinks;
          },
        },
      },
      directory: {
        async list() {
          await delay();
          return allAccounts();
        },
      },
      blocks: {
        async list() {
          await delay();
          return Array.from(blockedAccountIds, id => findAccountById(id))
            .filter((a): a is Account => a !== undefined);
        },
      },
      mutes: {
        async list() {
          await delay();
          return Array.from(mutedAccountIds, id => findAccountById(id))
            .filter((a): a is Account => a !== undefined);
        },
      },
      domainBlocks: {
        async list() {
          await delay();
          return [...blockedDomainsSet];
        },
        async create(params: { domain: string }) {
          await delay();
          blockedDomainsSet.add(params.domain);
        },
        async remove(params: { domain: string }) {
          await delay();
          blockedDomainsSet.delete(params.domain);
        },
      },
      reports: {
        async create(params: { accountId: string; statusIds?: string[]; comment?: string; forward?: boolean; category?: string; ruleIds?: string[] }) {
          await delay();
          const targetAccount = findAccountById(params.accountId);
          if (!targetAccount)
            throw new Error(`Account ${params.accountId} not found`);
          const report = {
            id: `${nextReportId++}`,
            category: params.category ?? 'other',
            comment: params.comment ?? '',
            statusIds: params.statusIds ?? [],
            targetAccount: { id: params.accountId },
            ruleIds: params.ruleIds ?? [],
            actionTaken: false,
            createdAt: new Date().toISOString(),
          };
          mockReports.push(report);
          return report;
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
      instance: {
        async fetch() {
          await delay();
          return {
            domain: 'mock.fediway.local',
            title: 'Fediway Mock',
            version: '4.3.0',
            rules: instanceRules,
          };
        },
      },
      filters: {
        async list() {
          await delay();
          return [...mockFiltersList];
        },
        async create(params: { title: string; context: string[]; filterAction?: string; expiresIn?: number; keywordsAttributes?: Array<{ keyword: string; wholeWord?: boolean }> }) {
          await delay();
          const id = `${nextFilterId++}`;
          const keywords = (params.keywordsAttributes ?? []).map(kw => ({
            id: `${nextFilterKeywordId++}`,
            keyword: kw.keyword,
            wholeWord: kw.wholeWord ?? false,
          }));
          const filter = {
            id,
            title: params.title,
            context: params.context,
            filterAction: params.filterAction ?? 'warn',
            expiresAt: params.expiresIn
              ? new Date(Date.now() + params.expiresIn * 1000).toISOString()
              : null,
            keywords,
            statuses: [] as [],
          };
          mockFiltersList.push(filter);
          return filter;
        },
        $select(id: string) {
          return {
            async fetch() {
              await delay();
              const filter = mockFiltersList.find(f => f.id === id);
              if (!filter)
                throw new Error(`Filter ${id} not found`);
              return { ...filter };
            },
            async update(params: { title?: string; context?: string[]; filterAction?: string; expiresIn?: number; keywordsAttributes?: Array<{ id?: string; keyword?: string; wholeWord?: boolean; _destroy?: boolean }> }) {
              await delay();
              const filter = mockFiltersList.find(f => f.id === id);
              if (!filter)
                throw new Error(`Filter ${id} not found`);
              if (params.title !== undefined)
                filter.title = params.title;
              if (params.context !== undefined)
                filter.context = params.context;
              if (params.filterAction !== undefined)
                filter.filterAction = params.filterAction;
              if (params.expiresIn !== undefined) {
                filter.expiresAt = params.expiresIn
                  ? new Date(Date.now() + params.expiresIn * 1000).toISOString()
                  : null;
              }
              if (params.keywordsAttributes) {
                for (const kwAttr of params.keywordsAttributes) {
                  if (kwAttr._destroy && kwAttr.id) {
                    filter.keywords = filter.keywords.filter(k => k.id !== kwAttr.id);
                  }
                  else if (kwAttr.id) {
                    const existing = filter.keywords.find(k => k.id === kwAttr.id);
                    if (existing) {
                      if (kwAttr.keyword !== undefined)
                        existing.keyword = kwAttr.keyword;
                      if (kwAttr.wholeWord !== undefined)
                        existing.wholeWord = kwAttr.wholeWord;
                    }
                  }
                  else if (kwAttr.keyword) {
                    filter.keywords.push({
                      id: `${nextFilterKeywordId++}`,
                      keyword: kwAttr.keyword,
                      wholeWord: kwAttr.wholeWord ?? false,
                    });
                  }
                }
              }
              return { ...filter, keywords: [...filter.keywords] };
            },
            async remove() {
              await delay();
              const idx = mockFiltersList.findIndex(f => f.id === id);
              if (idx >= 0)
                mockFiltersList.splice(idx, 1);
            },
          };
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
        content: `<p>${params.status.replace(AMP_RE, '&amp;').replace(LT_RE, '&lt;').replace(GT_RE, '&gt;').replace(NEWLINE_RE, '<br>')}</p>`,
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
