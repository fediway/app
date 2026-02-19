import type { Status } from '@repo/types';
import { ref, shallowRef } from 'vue';
import { useAuth } from './useAuth';

export type TimelineType = 'home' | 'public' | 'local' | 'hashtag' | 'list' | 'account';

export interface TimelineOptions {
  /** Timeline type */
  type: TimelineType;
  /** Hashtag name (for hashtag timeline) */
  hashtag?: string;
  /** List ID (for list timeline) */
  listId?: string;
  /** Account ID (for account timeline) */
  accountId?: string;
  /** Only show statuses with media */
  onlyMedia?: boolean;
  /** Exclude replies */
  excludeReplies?: boolean;
  /** Exclude reblogs */
  excludeReblogs?: boolean;
}

export interface UseTimelineReturn {
  statuses: ReturnType<typeof shallowRef<Status[]>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  hasMore: ReturnType<typeof ref<boolean>>;
  fetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Composable for fetching and managing timeline data
 */
export function useTimeline(options: TimelineOptions): UseTimelineReturn {
  const { getClient } = useAuth();

  const statuses = shallowRef<Status[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const hasMore = ref(true);

  // Track pagination
  let maxId: string | undefined;

  /**
   * Fetch timeline based on type
   */
  async function fetchTimeline(olderThan?: string): Promise<Status[]> {
    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    const params: Record<string, unknown> = {
      limit: 20,
    };

    if (olderThan) {
      params.maxId = olderThan;
    }

    switch (options.type) {
      case 'home':
        return client.rest.v1.timelines.home.list(params);

      case 'public':
        return client.rest.v1.timelines.public.list({
          ...params,
          local: false,
          onlyMedia: options.onlyMedia,
        });

      case 'local':
        return client.rest.v1.timelines.public.list({
          ...params,
          local: true,
          onlyMedia: options.onlyMedia,
        });

      case 'hashtag':
        if (!options.hashtag) {
          throw new Error('Hashtag is required for hashtag timeline');
        }
        return client.rest.v1.timelines.tag.$select(options.hashtag).list(params);

      case 'list':
        if (!options.listId) {
          throw new Error('List ID is required for list timeline');
        }
        return client.rest.v1.timelines.list.$select(options.listId).list(params);

      case 'account':
        if (!options.accountId) {
          throw new Error('Account ID is required for account timeline');
        }
        return client.rest.v1.accounts.$select(options.accountId).statuses.list({
          ...params,
          excludeReplies: options.excludeReplies,
          excludeReblogs: options.excludeReblogs,
          onlyMedia: options.onlyMedia,
        });

      default:
        throw new Error(`Unknown timeline type: ${options.type}`);
    }
  }

  /**
   * Initial fetch
   */
  async function fetch() {
    isLoading.value = true;
    error.value = null;
    maxId = undefined;

    try {
      const result = await fetchTimeline();
      statuses.value = result;
      hasMore.value = result.length >= 20;

      if (result.length > 0) {
        maxId = result[result.length - 1]!.id;
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch timeline');
    }
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Load more (older) statuses
   */
  async function loadMore() {
    if (!hasMore.value || isLoading.value)
      return;

    isLoading.value = true;
    error.value = null;

    try {
      const result = await fetchTimeline(maxId);
      statuses.value = [...statuses.value, ...result];
      hasMore.value = result.length >= 20;

      if (result.length > 0) {
        maxId = result[result.length - 1]!.id;
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load more');
    }
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Refresh timeline (fetch newest)
   */
  async function refresh() {
    await fetch();
  }

  return {
    statuses,
    isLoading,
    error,
    hasMore,
    fetch,
    loadMore,
    refresh,
  };
}
