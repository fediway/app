import type { Account, Status, Tag } from '@repo/types';
import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetQueryCache } from '../../../src/composables/createQuery';

const mockSetMany = vi.fn();
const mockListSearch = vi.fn();

vi.mock('../../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v2: {
        search: { list: mockListSearch },
      },
    },
  }),
}));

vi.mock('../../../src/composables/useStatusStore', () => ({
  useStatusStore: () => ({
    setMany: mockSetMany,
  }),
}));

afterEach(() => {
  _resetQueryCache();
  mockSetMany.mockReset();
  mockListSearch.mockReset();
});

function makeAccount(id: string): Account {
  return { id, username: `user-${id}` } as Account;
}

function makeStatus(id: string): Status {
  return { id, content: `status-${id}` } as Status;
}

function makeTag(name: string): Tag {
  return { name, url: `/tags/${name}` } as Tag;
}

describe('useSearchData', () => {
  async function getComposable() {
    const mod = await import('../../../src/composables/queries/useSearchData');
    return mod.useSearchData();
  }

  describe('searchAccounts', () => {
    it('returns matching accounts', async () => {
      const accounts = [makeAccount('1'), makeAccount('2')];
      mockListSearch.mockResolvedValue({ accounts });

      const { searchAccounts } = await getComposable();
      const result = searchAccounts('test');

      await flushPromises();

      expect(result.data.value).toEqual(accounts);
      expect(mockListSearch).toHaveBeenCalledWith({ q: 'test', type: 'accounts', limit: 20 });
    });
  });

  describe('searchStatuses', () => {
    it('returns matching statuses', async () => {
      const statuses = [makeStatus('1')];
      mockListSearch.mockResolvedValue({ statuses });

      const { searchStatuses } = await getComposable();
      const result = searchStatuses('query');

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(mockListSearch).toHaveBeenCalledWith({ q: 'query', type: 'statuses', limit: 20 });
      expect(mockSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('searchTags', () => {
    it('returns matching tags', async () => {
      const tags = [makeTag('vue'), makeTag('react')];
      mockListSearch.mockResolvedValue({ hashtags: tags });

      const { searchTags } = await getComposable();
      const result = searchTags('v');

      await flushPromises();

      expect(result.data.value).toEqual(tags);
      expect(mockListSearch).toHaveBeenCalledWith({ q: 'v', type: 'hashtags', limit: 20 });
    });
  });

  describe('empty query', () => {
    it('returns empty arrays without making API calls', async () => {
      const { searchAccounts, searchStatuses, searchTags } = await getComposable();

      const accountsResult = searchAccounts('');
      const statusesResult = searchStatuses('  ');
      const tagsResult = searchTags('');

      await flushPromises();

      expect(accountsResult.data.value).toEqual([]);
      expect(statusesResult.data.value).toEqual([]);
      expect(tagsResult.data.value).toEqual([]);
      expect(mockListSearch).not.toHaveBeenCalled();
    });
  });

  describe('caching', () => {
    it('different queries get separate cache keys', async () => {
      const accounts1 = [makeAccount('1')];
      const accounts2 = [makeAccount('2')];
      mockListSearch
        .mockResolvedValueOnce({ accounts: accounts1 })
        .mockResolvedValueOnce({ accounts: accounts2 });

      const { searchAccounts } = await getComposable();
      const result1 = searchAccounts('alice');
      const result2 = searchAccounts('bob');

      await flushPromises();

      expect(result1.data.value).toEqual(accounts1);
      expect(result2.data.value).toEqual(accounts2);
      expect(result1.data).not.toBe(result2.data);
    });

    it('same query reuses cached refs', async () => {
      mockListSearch.mockResolvedValue({ accounts: [makeAccount('1')] });

      const { searchAccounts } = await getComposable();
      const result1 = searchAccounts('test');

      await flushPromises();

      const result2 = searchAccounts('test');

      expect(result1.data).toBe(result2.data);
    });
  });
});
