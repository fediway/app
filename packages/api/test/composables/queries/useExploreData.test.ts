import type { Status, Tag } from '@repo/types';
import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetQueryCache } from '../../../src/composables/createQuery';

const mockSetMany = vi.fn();
const mockListTrendingTags = vi.fn();
const mockListTagTimeline = vi.fn();
const mockListSearch = vi.fn();

vi.mock('../../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        trends: {
          tags: { list: mockListTrendingTags },
        },
        timelines: {
          tag: {
            $select: (_tag: string) => ({
              list: mockListTagTimeline,
            }),
          },
        },
      },
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
  mockListTrendingTags.mockReset();
  mockListTagTimeline.mockReset();
  mockListSearch.mockReset();
});

function makeTag(name: string): Tag {
  return { name, url: `/tags/${name}` } as Tag;
}

function makeStatus(id: string, cardUrl?: string): Status {
  return {
    id,
    content: `status-${id}`,
    ...(cardUrl ? { card: { url: cardUrl, title: `Title for ${cardUrl}`, providerName: 'Example' } } : {}),
  } as Status;
}

describe('useExploreData', () => {
  async function getComposable() {
    const mod = await import('../../../src/composables/queries/useExploreData');
    return mod.useExploreData();
  }

  describe('getTrendingTags', () => {
    it('returns tags from API', async () => {
      const tags = [makeTag('vue'), makeTag('typescript')];
      mockListTrendingTags.mockResolvedValue(tags);

      const { getTrendingTags } = await getComposable();
      const result = getTrendingTags();

      await flushPromises();

      expect(result.data.value).toEqual(tags);
      expect(result.isLoading.value).toBe(false);
    });
  });

  describe('getStatusesByTag', () => {
    it('returns statuses for a tag', async () => {
      const statuses = [makeStatus('1'), makeStatus('2')];
      mockListTagTimeline.mockResolvedValue(statuses);

      const { getStatusesByTag } = await getComposable();
      const result = getStatusesByTag('vue');

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(mockListTagTimeline).toHaveBeenCalledWith({ limit: 40 });
    });

    it('sets statuses in store', async () => {
      const statuses = [makeStatus('1')];
      mockListTagTimeline.mockResolvedValue(statuses);

      const { getStatusesByTag } = await getComposable();
      getStatusesByTag('vue');

      await flushPromises();

      expect(mockSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('getStatusesByLink', () => {
    it('returns statuses for a link URL', async () => {
      const statuses = [makeStatus('1')];
      mockListSearch.mockResolvedValue({ statuses });

      const { getStatusesByLink } = await getComposable();
      const result = getStatusesByLink('https://example.com/article');

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(mockListSearch).toHaveBeenCalledWith({ q: 'https://example.com/article', type: 'statuses', limit: 40 });
      expect(mockSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('getTagInfo', () => {
    it('returns tag metadata from trending tags', async () => {
      const tags = [makeTag('vue'), makeTag('typescript')];
      mockListTrendingTags.mockResolvedValue(tags);

      const { getTagInfo, getTrendingTags } = await getComposable();
      // Pre-fetch trending tags so they're cached
      getTrendingTags();
      await flushPromises();

      const info = getTagInfo('vue');
      expect(info).toEqual(makeTag('vue'));
    });

    it('returns fallback tag when not found in trending', async () => {
      mockListTrendingTags.mockResolvedValue([]);

      const { getTagInfo, getTrendingTags } = await getComposable();
      getTrendingTags();
      await flushPromises();

      const info = getTagInfo('unknown');
      expect(info).toEqual({ name: 'unknown', url: '/tags/unknown' });
    });
  });

  describe('getLinkInfo', () => {
    it('extracts card from fetched statuses', async () => {
      const url = 'https://example.com/article';
      const statuses = [makeStatus('1', url)];
      mockListSearch.mockResolvedValue({ statuses });

      const { getLinkInfo, getStatusesByLink } = await getComposable();
      // Pre-fetch so statuses are cached
      getStatusesByLink(url);
      await flushPromises();

      const info = getLinkInfo(url);
      expect(info).toMatchObject({
        url,
        title: `Title for ${url}`,
        providerName: 'Example',
      });
    });

    it('returns fallback when no matching card found', async () => {
      const url = 'https://example.com/page';
      mockListSearch.mockResolvedValue({ statuses: [] });

      const { getLinkInfo, getStatusesByLink } = await getComposable();
      getStatusesByLink(url);
      await flushPromises();

      const info = getLinkInfo(url);
      expect(info).toMatchObject({
        url,
        title: url,
        providerName: 'example.com',
      });
    });
  });

  describe('caching', () => {
    it('different tags get separate cache keys', async () => {
      const statuses1 = [makeStatus('1')];
      const statuses2 = [makeStatus('2')];
      mockListTagTimeline.mockResolvedValueOnce(statuses1).mockResolvedValueOnce(statuses2);

      const { getStatusesByTag } = await getComposable();
      const result1 = getStatusesByTag('vue');
      const result2 = getStatusesByTag('react');

      await flushPromises();

      expect(result1.data.value).toEqual(statuses1);
      expect(result2.data.value).toEqual(statuses2);
      expect(result1.data).not.toBe(result2.data);
    });
  });
});
