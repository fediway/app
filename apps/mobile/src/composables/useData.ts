import type { Account, Context, Notification, Status, Tag } from '@repo/types';
import type { Ref } from 'vue';
import { useClient } from '@repo/api';
import { ref } from 'vue';

const LEADING_HASH_RE = /^#/;
const LEADING_AT_RE = /^@/;

// Module-level reactive caches
const homeTimeline = ref<Status[]>([]);
const notifications = ref<Notification[]>([]);
const favouritedStatuses = ref<Status[]>([]);
const bookmarkedStatuses = ref<Status[]>([]);
const trendingTags = ref<Tag[]>([]);
const suggestedAccounts = ref<Account[]>([]);

const statusCache = new Map<string, Ref<Status | undefined>>();
const contextCache = new Map<string, Ref<Context>>();
const accountCache = new Map<string, Ref<Account | undefined>>();
const accountStatusesCache = new Map<string, Ref<Status[]>>();
const tagStatusesCache = new Map<string, Ref<Status[]>>();
const searchAccountsCache = new Map<string, Ref<Account[]>>();
const searchStatusesCache = new Map<string, Ref<Status[]>>();
const searchTagsCache = new Map<string, Ref<Tag[]>>();

const fetched = new Set<string>();

function markFetched(key: string): boolean {
  if (fetched.has(key))
    return false;
  fetched.add(key);
  return true;
}

function fireAndForget(key: string, fn: () => Promise<void>) {
  fn().catch(() => {
    fetched.delete(key);
  });
}

function getOrCreateRef<T>(cache: Map<string, Ref<T>>, key: string, defaultValue: T): Ref<T> {
  let r = cache.get(key);
  if (!r) {
    r = ref(defaultValue) as Ref<T>;
    cache.set(key, r);
  }
  return r;
}

export function clearDataCache() {
  homeTimeline.value = [];
  notifications.value = [];
  favouritedStatuses.value = [];
  bookmarkedStatuses.value = [];
  trendingTags.value = [];
  suggestedAccounts.value = [];
  statusCache.clear();
  contextCache.clear();
  accountCache.clear();
  accountStatusesCache.clear();
  tagStatusesCache.clear();
  searchAccountsCache.clear();
  searchStatusesCache.clear();
  searchTagsCache.clear();
  fetched.clear();
}

export function useData() {
  function getClient() {
    return useClient();
  }

  function getHomeTimeline(): Status[] {
    if (markFetched('homeTimeline')) {
      fireAndForget('homeTimeline', async () => {
        homeTimeline.value = await getClient().rest.v1.timelines.home.list({ limit: 40 });
      });
    }
    return homeTimeline.value;
  }

  function getStatusById(id: string): Status | undefined {
    const cached = getOrCreateRef(statusCache, id, undefined as Status | undefined);
    if (markFetched(`status:${id}`)) {
      fireAndForget(`status:${id}`, async () => {
        cached.value = await getClient().rest.v1.statuses.$select(id).fetch();
      });
    }
    return cached.value;
  }

  function getStatusContext(id: string): Context {
    const empty: Context = { ancestors: [], descendants: [] };
    const cached = getOrCreateRef(contextCache, id, empty);
    if (markFetched(`context:${id}`)) {
      fireAndForget(`context:${id}`, async () => {
        cached.value = await getClient().rest.v1.statuses.$select(id).context.fetch();
      });
    }
    return cached.value;
  }

  function getAccountByAcct(acct: string): Account | undefined {
    const cached = getOrCreateRef(accountCache, acct, undefined as Account | undefined);
    if (markFetched(`account:${acct}`)) {
      fireAndForget(`account:${acct}`, async () => {
        cached.value = await getClient().rest.v1.accounts.lookup({ acct });
      });
    }
    return cached.value;
  }

  function getAccountStatuses(acct: string): Status[] {
    const cached = getOrCreateRef(accountStatusesCache, acct, [] as Status[]);
    if (markFetched(`accountStatuses:${acct}`)) {
      fireAndForget(`accountStatuses:${acct}`, async () => {
        const client = getClient();
        const account = await client.rest.v1.accounts.lookup({ acct });
        cached.value = await client.rest.v1.accounts.$select(account.id).statuses.list({
          limit: 20,
          excludeReplies: true,
        });
      });
    }
    return cached.value;
  }

  function getNotifications(): Notification[] {
    if (markFetched('notifications')) {
      fireAndForget('notifications', async () => {
        notifications.value = await getClient().rest.v1.notifications.list({ limit: 30 }) as Notification[];
      });
    }
    return notifications.value;
  }

  function getFavouritedStatuses(): Status[] {
    if (markFetched('favourites')) {
      fireAndForget('favourites', async () => {
        favouritedStatuses.value = await getClient().rest.v1.favourites.list({ limit: 40 });
      });
    }
    return favouritedStatuses.value;
  }

  function getBookmarkedStatuses(): Status[] {
    if (markFetched('bookmarks')) {
      fireAndForget('bookmarks', async () => {
        bookmarkedStatuses.value = await getClient().rest.v1.bookmarks.list({ limit: 40 });
      });
    }
    return bookmarkedStatuses.value;
  }

  function getTrendingTags(): Tag[] {
    if (markFetched('trendingTags')) {
      fireAndForget('trendingTags', async () => {
        trendingTags.value = await getClient().rest.v1.trends.tags.list();
      });
    }
    return trendingTags.value;
  }

  function getStatusesByTag(tagName: string): Status[] {
    const normalized = tagName.toLowerCase().replace(LEADING_HASH_RE, '');
    const cached = getOrCreateRef(tagStatusesCache, normalized, [] as Status[]);
    if (markFetched(`tag:${normalized}`)) {
      fireAndForget(`tag:${normalized}`, async () => {
        cached.value = await getClient().rest.v1.timelines.tag.$select(normalized).list({ limit: 40 });
      });
    }
    return cached.value;
  }

  function searchAccounts(query: string): Account[] {
    if (!query.trim())
      return [];
    const cached = getOrCreateRef(searchAccountsCache, query, [] as Account[]);
    if (markFetched(`searchAccounts:${query}`)) {
      fireAndForget(`searchAccounts:${query}`, async () => {
        const result = await getClient().rest.v2.search.list({ q: query, type: 'accounts', limit: 20 });
        cached.value = result.accounts;
      });
    }
    return cached.value;
  }

  function searchStatuses(query: string): Status[] {
    if (!query.trim())
      return [];
    const cached = getOrCreateRef(searchStatusesCache, query, [] as Status[]);
    if (markFetched(`searchStatuses:${query}`)) {
      fireAndForget(`searchStatuses:${query}`, async () => {
        const result = await getClient().rest.v2.search.list({ q: query, type: 'statuses', limit: 20 });
        cached.value = result.statuses;
      });
    }
    return cached.value;
  }

  function searchTags(query: string): Tag[] {
    if (!query.trim())
      return [];
    const cached = getOrCreateRef(searchTagsCache, query, [] as Tag[]);
    if (markFetched(`searchTags:${query}`)) {
      fireAndForget(`searchTags:${query}`, async () => {
        const result = await getClient().rest.v2.search.list({ q: query, type: 'hashtags', limit: 20 });
        cached.value = result.hashtags;
      });
    }
    return cached.value;
  }

  function getSuggestedAccounts(): Account[] {
    if (markFetched('suggestions')) {
      fireAndForget('suggestions', async () => {
        const result = await getClient().rest.v2.suggestions.list({ limit: 10 });
        suggestedAccounts.value = result.map(s => s.account);
      });
    }
    return suggestedAccounts.value;
  }

  function getProfileUrl(acct: string): string {
    return `/@${acct.replace(LEADING_AT_RE, '')}`;
  }

  return {
    getHomeTimeline,
    getStatusById,
    getStatusContext,
    getAccountByAcct,
    getAccountStatuses,
    getNotifications,
    getFavouritedStatuses,
    getBookmarkedStatuses,
    getTrendingTags,
    getStatusesByTag,
    searchAccounts,
    searchStatuses,
    searchTags,
    getSuggestedAccounts,
    getProfileUrl,
  };
}
