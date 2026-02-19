import type { Account, Context, Notification, Status, Tag } from '@repo/types';
import type { Ref } from 'vue';
import { useClient } from '@repo/api';
import { ref } from 'vue';

// Module-level reactive caches
const homeTimeline = ref<Status[]>([]);
const notifications = ref<Notification[]>([]);
const favouritedStatuses = ref<Status[]>([]);
const bookmarkedStatuses = ref<Status[]>([]);
const trendingTags = ref<Tag[]>([]);
const suggestedAccounts = ref<Account[]>([]);
const allAccountsList = ref<Account[]>([]);

const statusCache = new Map<string, Ref<Status | undefined>>();
const contextCache = new Map<string, Ref<Context>>();
const accountCache = new Map<string, Ref<Account | undefined>>();
const accountStatusesCache = new Map<string, Ref<Status[]>>();
const tagStatusesCache = new Map<string, Ref<Status[]>>();
const linkStatusesCache = new Map<string, Ref<Status[]>>();
const searchAccountsCache = new Map<string, Ref<Account[]>>();
const searchStatusesCache = new Map<string, Ref<Status[]>>();
const searchTagsCache = new Map<string, Ref<Tag[]>>();

// Track what's been fetched to avoid duplicate requests
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

export function clearLiveCache() {
  homeTimeline.value = [];
  notifications.value = [];
  favouritedStatuses.value = [];
  bookmarkedStatuses.value = [];
  trendingTags.value = [];
  suggestedAccounts.value = [];
  allAccountsList.value = [];
  statusCache.clear();
  contextCache.clear();
  accountCache.clear();
  accountStatusesCache.clear();
  tagStatusesCache.clear();
  linkStatusesCache.clear();
  searchAccountsCache.clear();
  searchStatusesCache.clear();
  searchTagsCache.clear();
  fetched.clear();
}

export function useData() {
  function getClient() {
    return useClient();
  }

  // --- Home Timeline ---

  function getHomeTimeline(): Status[] {
    if (markFetched('homeTimeline')) {
      fireAndForget('homeTimeline', async () => {
        const result = await getClient().rest.v1.timelines.home.list({ limit: 40 });
        homeTimeline.value = result;
      });
    }
    return homeTimeline.value;
  }

  // --- Status by ID ---

  function getStatusById(id: string): Status | undefined {
    const cached = getOrCreateRef(statusCache, id, undefined as Status | undefined);
    if (markFetched(`status:${id}`)) {
      fireAndForget(`status:${id}`, async () => {
        cached.value = await getClient().rest.v1.statuses.$select(id).fetch();
      });
    }
    return cached.value;
  }

  // --- Status Context ---

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

  // --- Account by acct ---

  function getAccountByAcct(acct: string): Account | undefined {
    const cached = getOrCreateRef(accountCache, acct, undefined as Account | undefined);
    if (markFetched(`account:${acct}`)) {
      fireAndForget(`account:${acct}`, async () => {
        cached.value = await getClient().rest.v1.accounts.lookup({ acct });
      });
    }
    return cached.value;
  }

  // --- Account Statuses ---

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

  // --- Notifications ---

  function getNotifications(): Notification[] {
    if (markFetched('notifications')) {
      fireAndForget('notifications', async () => {
        const result = await getClient().rest.v1.notifications.list({ limit: 30 });
        notifications.value = result as Notification[];
      });
    }
    return notifications.value;
  }

  // --- Favourited Statuses ---

  function getFavouritedStatuses(): Status[] {
    if (markFetched('favourites')) {
      fireAndForget('favourites', async () => {
        favouritedStatuses.value = await getClient().rest.v1.favourites.list({ limit: 40 });
      });
    }
    return favouritedStatuses.value;
  }

  // --- Bookmarked Statuses ---

  function getBookmarkedStatuses(): Status[] {
    if (markFetched('bookmarks')) {
      fireAndForget('bookmarks', async () => {
        bookmarkedStatuses.value = await getClient().rest.v1.bookmarks.list({ limit: 40 });
      });
    }
    return bookmarkedStatuses.value;
  }

  // --- Trending Tags ---

  function getTrendingTags(): Tag[] {
    if (markFetched('trendingTags')) {
      fireAndForget('trendingTags', async () => {
        trendingTags.value = await getClient().rest.v1.trends.tags.list();
      });
    }
    return trendingTags.value;
  }

  // --- Statuses by Tag ---

  function getStatusesByTag(tagName: string): Status[] {
    const normalized = tagName.toLowerCase().replace(/^#/, '');
    const cached = getOrCreateRef(tagStatusesCache, normalized, [] as Status[]);
    if (markFetched(`tag:${normalized}`)) {
      fireAndForget(`tag:${normalized}`, async () => {
        cached.value = await getClient().rest.v1.timelines.tag.$select(normalized).list({ limit: 40 });
      });
    }
    return cached.value;
  }

  // --- Tag Info ---

  function getTagInfo(tagName: string): Tag | undefined {
    const normalized = tagName.toLowerCase().replace(/^#/, '');
    const tags = getTrendingTags();
    const found = tags.find(t => t.name.toLowerCase() === normalized);
    if (found)
      return found;

    return {
      name: normalized,
      url: `/tags/${normalized}`,
    } as Tag;
  }

  // --- Statuses by Link ---

  function getStatusesByLink(linkUrl: string): Status[] {
    const decodedUrl = decodeURIComponent(linkUrl);
    const cached = getOrCreateRef(linkStatusesCache, decodedUrl, [] as Status[]);
    if (markFetched(`link:${decodedUrl}`)) {
      fireAndForget(`link:${decodedUrl}`, async () => {
        const result = await getClient().rest.v2.search.list({ q: decodedUrl, type: 'statuses', limit: 40 });
        cached.value = result.statuses;
      });
    }
    return cached.value;
  }

  // --- Link Info ---

  function getLinkInfo(linkUrl: string): { url: string; title: string; source: string } | undefined {
    const decodedUrl = decodeURIComponent(linkUrl);

    const cached = linkStatusesCache.get(decodedUrl);
    if (cached) {
      for (const status of cached.value) {
        if (status.card?.url === decodedUrl) {
          return {
            url: status.card.url,
            title: status.card.title,
            source: status.card.providerName || new URL(decodedUrl).hostname,
          };
        }
      }
    }

    try {
      const url = new URL(decodedUrl);
      return {
        url: decodedUrl,
        title: decodedUrl,
        source: url.hostname.replace('www.', ''),
      };
    }
    catch {
      return undefined;
    }
  }

  // --- Search ---

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

  // --- Suggested Accounts ---

  function getSuggestedAccounts(): Account[] {
    if (markFetched('suggestions')) {
      fireAndForget('suggestions', async () => {
        const result = await getClient().rest.v2.suggestions.list({ limit: 10 });
        suggestedAccounts.value = result.map(s => s.account);
      });
    }
    return suggestedAccounts.value;
  }

  // --- All Accounts (explore/people, SendMessageModal) ---

  function getAllAccounts(): Account[] {
    if (markFetched('allAccounts')) {
      fireAndForget('allAccounts', async () => {
        allAccountsList.value = await getClient().rest.v1.directory.list({ limit: 40, order: 'active' });
      });
    }
    return allAccountsList.value;
  }

  // --- Profile URL (pure function, no API needed) ---

  function getProfileUrl(acct: string): string {
    const cleanAcct = acct.replace(/^@/, '');
    return `/@${cleanAcct}`;
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
    getTagInfo,
    getStatusesByLink,
    getLinkInfo,
    searchAccounts,
    searchStatuses,
    searchTags,
    getSuggestedAccounts,
    getAllAccounts,
    getProfileUrl,
  };
}
