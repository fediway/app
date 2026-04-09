import type { Account } from '@repo/types';
import type { MockState } from '../state';
import {
  bookmarkedStatuses,
  favouritedStatuses,
} from '../fixtures';
import { delay, findAccountById } from '../utils';

export function createBlocksHandler(state: MockState) {
  return {
    async list() {
      await delay();
      return Array.from(state.blockedAccountIds, id => findAccountById(id))
        .filter((a): a is Account => a !== undefined);
    },
  };
}

export function createMutesHandler(state: MockState) {
  return {
    async list() {
      await delay();
      return Array.from(state.mutedAccountIds, id => findAccountById(id))
        .filter((a): a is Account => a !== undefined);
    },
  };
}

export function createDomainBlocksHandler(state: MockState) {
  return {
    async list() {
      await delay();
      return [...state.blockedDomainsSet];
    },
    async create(params: { domain: string }) {
      await delay();
      state.blockedDomainsSet.add(params.domain);
    },
    async remove(params: { domain: string }) {
      await delay();
      state.blockedDomainsSet.delete(params.domain);
    },
  };
}

export function createReportsHandler(state: MockState) {
  return {
    async create(params: { accountId: string; statusIds?: string[]; comment?: string; forward?: boolean; category?: string; ruleIds?: string[] }) {
      await delay();
      const targetAccount = findAccountById(params.accountId);
      if (!targetAccount)
        throw new Error(`Account ${params.accountId} not found`);
      const report = {
        id: `${state.nextReportId++}`,
        category: params.category ?? 'other',
        comment: params.comment ?? '',
        statusIds: params.statusIds ?? [],
        targetAccount: { id: params.accountId },
        ruleIds: params.ruleIds ?? [],
        actionTaken: false,
        createdAt: new Date().toISOString(),
      };
      state.mockReports.push(report);
      return report;
    },
  };
}

export function createFavouritesHandler() {
  return {
    async list() {
      await delay();
      return favouritedStatuses;
    },
  };
}

export function createBookmarksHandler() {
  return {
    async list() {
      await delay();
      return bookmarkedStatuses;
    },
  };
}

export function createFiltersHandler(state: MockState) {
  return {
    async list() {
      await delay();
      return [...state.mockFiltersList];
    },
    async create(params: { title: string; context: string[]; filterAction?: string; expiresIn?: number; keywordsAttributes?: Array<{ keyword: string; wholeWord?: boolean }> }) {
      await delay();
      const id = `${state.nextFilterId++}`;
      const keywords = (params.keywordsAttributes ?? []).map(kw => ({
        id: `${state.nextFilterKeywordId++}`,
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
      state.mockFiltersList.push(filter);
      return filter;
    },
    $select(id: string) {
      return {
        async fetch() {
          await delay();
          const filter = state.mockFiltersList.find(f => f.id === id);
          if (!filter)
            throw new Error(`Filter ${id} not found`);
          return { ...filter };
        },
        async update(params: { title?: string; context?: string[]; filterAction?: string; expiresIn?: number; keywordsAttributes?: Array<{ id?: string; keyword?: string; wholeWord?: boolean; _destroy?: boolean }> }) {
          await delay();
          const filter = state.mockFiltersList.find(f => f.id === id);
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
                  id: `${state.nextFilterKeywordId++}`,
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
          const idx = state.mockFiltersList.findIndex(f => f.id === id);
          if (idx >= 0)
            state.mockFiltersList.splice(idx, 1);
        },
      };
    },
  };
}
