import type { FediwayStatus, Status, Tag, TrendLink } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient, useStatusStore } from '@repo/api';
import { createDataResult } from './useDataHelpers';

const LEADING_HASH_RE = /^#/;

export function useExploreData() {
  const client = useClient();
  const store = useStatusStore();

  function getTrendingTags(): DataResult<Tag[]> {
    return createDataResult('trendingTags', [] as Tag[], async () => {
      return await client.rest.v1.trends.tags.list();
    });
  }

  function getTrendingLinks(): DataResult<TrendLink[]> {
    return createDataResult('trendingLinks', [] as TrendLink[], async () => {
      return await client.rest.v1.trends.links.list();
    });
  }

  function getStatusesByTag(tagName: string): DataResult<Status[]> {
    const normalized = tagName.toLowerCase().replace(LEADING_HASH_RE, '');
    return createDataResult(`tag:${normalized}`, [] as Status[], async () => {
      const result = await client.rest.v1.timelines.tag.$select(normalized).list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  function getTagInfo(tagName: string): Tag | undefined {
    const normalized = tagName.toLowerCase().replace(LEADING_HASH_RE, '');
    const tagsResult = getTrendingTags();
    const found = tagsResult.data.value.find((t: Tag) => t.name.toLowerCase() === normalized);
    if (found)
      return found;

    return {
      name: normalized,
      url: `/tags/${normalized}`,
    } as Tag;
  }

  function getStatusesByLink(linkUrl: string): DataResult<Status[]> {
    const decodedUrl = decodeURIComponent(linkUrl);
    return createDataResult(`link:${decodedUrl}`, [] as Status[], async () => {
      const result = await client.rest.v2.search.list({ q: decodedUrl, type: 'statuses', limit: 40 });
      store.setMany(result.statuses as FediwayStatus[]);
      return result.statuses;
    });
  }

  function getLinkInfo(linkUrl: string): { url: string; title: string; source: string } | undefined {
    const decodedUrl = decodeURIComponent(linkUrl);
    const result = getStatusesByLink(decodedUrl);

    for (const status of result.data.value) {
      if (status.card?.url === decodedUrl) {
        return {
          url: status.card.url,
          title: status.card.title,
          source: status.card.providerName || new URL(decodedUrl).hostname,
        };
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

  return { getTrendingTags, getTrendingLinks, getStatusesByTag, getTagInfo, getStatusesByLink, getLinkInfo };
}
