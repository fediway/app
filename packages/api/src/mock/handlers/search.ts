import type { MockState } from '../state';
import {
  allAccounts,
  suggestedAccounts,
  trendingLinks,
  trendingTags,
} from '../fixtures';
import {
  delay,
  searchAccounts,
  searchStatuses,
  searchTags,
} from '../utils';

export function createSearchHandler(state: MockState) {
  return {
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
          statuses: searchStatuses(state, params.q),
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
        statuses: searchStatuses(state, params.q),
        hashtags: searchTags(params.q),
      };
    },
  };
}

export function createTrendsHandler() {
  return {
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
  };
}

export function createDirectoryHandler() {
  return {
    async list() {
      await delay();
      return allAccounts();
    },
  };
}

export function createSuggestionsHandler() {
  return {
    async list() {
      await delay();
      return suggestedAccounts.map(account => ({ source: 'staff', account }));
    },
  };
}
