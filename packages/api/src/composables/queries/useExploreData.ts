import type { FediwayStatus, Status, Tag, TrendLink } from '@repo/types';
import type { PaginatedQueryResult } from '../createPaginatedQuery';
import type { QueryResult } from '../createQuery';
import { createPaginatedQuery } from '../createPaginatedQuery';
import { createQuery } from '../createQuery';
import { useClient, usePublicClient } from '../useClient';
import { useStatusStore } from '../useStatusStore';

const LEADING_HASH_RE = /^#/;

export interface LinkInfo {
  url: string;
  title: string;
  description?: string;
  image?: string | null;
  providerName?: string | null;
  blurhash?: string | null;
  language?: string | null;
  authorName?: string | null;
  authors?: { name: string }[];
}

export function useExploreData() {
  const client = useClient();
  const publicClient = usePublicClient();
  const store = useStatusStore();

  function getTrendingTags(): QueryResult<Tag[]> {
    return createQuery('trendingTags', [] as Tag[], async () => {
      return await publicClient.rest.v1.trends.tags.list();
    }, { scope: 'public' });
  }

  function getTrendingStatuses(): QueryResult<Status[]> {
    return createQuery('trendingStatuses', [] as Status[], async () => {
      const result = await publicClient.rest.v1.trends.statuses.list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    }, { scope: 'public' });
  }

  function getTrendingLinks(): QueryResult<TrendLink[]> {
    return createQuery('trendingLinks', [] as TrendLink[], async () => {
      return await publicClient.rest.v1.trends.links.list();
    }, { scope: 'public' });
  }

  function getStatusesByTag(tagName: string): QueryResult<Status[]> {
    const normalized = tagName.toLowerCase().replace(LEADING_HASH_RE, '');
    return createQuery(`tag:${normalized}`, [] as Status[], async () => {
      const result = await client.rest.v1.timelines.tag.$select(normalized).list({ limit: 40 });
      store.setMany(result as FediwayStatus[]);
      return result;
    });
  }

  function getStatusesByTagPaginated(tagName: string): PaginatedQueryResult<Status> {
    const normalized = tagName.toLowerCase().replace(LEADING_HASH_RE, '');
    return createPaginatedQuery(`tag:${normalized}:paginated`, async ({ limit, maxId }) => {
      const result = await client.rest.v1.timelines.tag.$select(normalized).list({ limit, maxId });
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

  function getStatusesByLink(linkUrl: string): QueryResult<Status[]> {
    const decodedUrl = decodeURIComponent(linkUrl);
    return createQuery(`link:${decodedUrl}`, [] as Status[], async () => {
      const result = await client.rest.v2.search.list({ q: decodedUrl, type: 'statuses', limit: 40 });
      store.setMany(result.statuses as FediwayStatus[]);
      return result.statuses;
    });
  }

  function getLinkInfo(linkUrl: string): LinkInfo | undefined {
    const decodedUrl = decodeURIComponent(linkUrl);
    const result = getStatusesByLink(decodedUrl);

    for (const status of result.data.value) {
      if (status.card?.url === decodedUrl) {
        const card = status.card;
        return {
          url: card.url,
          title: card.title,
          description: card.description || undefined,
          image: card.image,
          providerName: card.providerName,
          blurhash: card.blurhash,
          language: (card as unknown as Record<string, unknown>).language as string | undefined,
          authorName: (card as unknown as Record<string, unknown>).authorName as string | undefined,
          authors: (card as unknown as Record<string, unknown>).authors as { name: string }[] | undefined,
        };
      }
    }

    try {
      const url = new URL(decodedUrl);
      return {
        url: decodedUrl,
        title: decodedUrl,
        providerName: url.hostname.replace('www.', ''),
      };
    }
    catch {
      return undefined;
    }
  }

  return { getTrendingTags, getTrendingStatuses, getTrendingLinks, getStatusesByTag, getStatusesByTagPaginated, getTagInfo, getStatusesByLink, getLinkInfo };
}
