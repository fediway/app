import type { Status } from '@repo/types';
import type { ComputedRef } from 'vue';
import { computed, ref, shallowRef } from 'vue';
import { useClient } from './useClient';

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
  pendingStatuses: ReturnType<typeof shallowRef<Status[]>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  hasMore: ReturnType<typeof ref<boolean>>;
  hasGap: ReturnType<typeof ref<boolean>>;
  newStatusCount: ComputedRef<number>;
  fetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  poll: () => Promise<void>;
  showNew: () => void;
  fillGap: () => Promise<void>;
  startPolling: (ms?: number) => void;
  stopPolling: () => void;
}

const DEFAULT_LIMIT = 20;

/**
 * Composable for fetching and managing timeline data with polling, gap detection, and deduplication.
 */
export function useTimeline(options: TimelineOptions): UseTimelineReturn {
  const client = useClient();

  const statuses = shallowRef<Status[]>([]);
  const pendingStatuses = shallowRef<Status[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const hasMore = ref(true);
  const hasGap = ref(false);

  const newStatusCount = computed(() => pendingStatuses.value.length);

  // Pagination cursors
  let maxId: string | undefined;
  let sinceId: string | undefined;

  // Dedup set
  const knownIds = new Set<string>();

  // Polling state
  let pollIntervalId: ReturnType<typeof setInterval> | undefined;
  let visibilityHandler: (() => void) | undefined;
  let pollIntervalMs = 30_000;

  /**
   * Deduplicate incoming statuses against known IDs.
   */
  function dedup(incoming: Status[]): Status[] {
    const result: Status[] = [];
    for (const status of incoming) {
      if (!knownIds.has(status.id)) {
        knownIds.add(status.id);
        result.push(status);
      }
    }
    return result;
  }

  /**
   * Track IDs from a batch of statuses.
   */
  function trackIds(items: Status[]) {
    for (const s of items) {
      knownIds.add(s.id);
    }
  }

  /**
   * Fetch timeline based on type, supporting both maxId and sinceId.
   */
  async function fetchTimeline(opts?: { olderThan?: string; newerThan?: string }): Promise<Status[]> {
    const params: Record<string, unknown> = {
      limit: DEFAULT_LIMIT,
    };

    if (opts?.olderThan) {
      params.maxId = opts.olderThan;
    }
    if (opts?.newerThan) {
      params.sinceId = opts.newerThan;
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
   * Initial fetch. Resets all state.
   */
  async function fetch() {
    isLoading.value = true;
    error.value = null;
    maxId = undefined;
    sinceId = undefined;
    knownIds.clear();
    pendingStatuses.value = [];
    hasGap.value = false;

    try {
      const result = await fetchTimeline();
      trackIds(result);
      statuses.value = result;
      hasMore.value = result.length >= DEFAULT_LIMIT;

      if (result.length > 0) {
        maxId = result[result.length - 1]!.id;
        sinceId = result[0]!.id;
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
   * Load more (older) statuses.
   */
  async function loadMore() {
    if (!hasMore.value || isLoading.value)
      return;

    isLoading.value = true;
    error.value = null;

    try {
      const result = await fetchTimeline({ olderThan: maxId });
      const fresh = dedup(result);
      statuses.value = [...statuses.value, ...fresh];
      hasMore.value = result.length >= DEFAULT_LIMIT;

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
   * Refresh: stop polling, re-fetch from scratch.
   */
  async function refresh() {
    stopPolling();
    await fetch();
  }

  /**
   * Poll for new statuses since the newest known.
   * New statuses go into pendingStatuses (not shown yet).
   * Errors are silently swallowed.
   */
  async function poll() {
    if (!sinceId)
      return;

    try {
      const result = await fetchTimeline({ newerThan: sinceId });
      if (result.length === 0)
        return;

      const fresh = dedup(result);
      if (fresh.length > 0) {
        pendingStatuses.value = [...fresh, ...pendingStatuses.value];
        sinceId = result[0]!.id;
      }

      if (result.length >= DEFAULT_LIMIT) {
        hasGap.value = true;
      }
    }
    catch {
      // Poll errors are silent — don't set error ref
    }
  }

  /**
   * Merge pending statuses into the main list.
   */
  function showNew() {
    if (pendingStatuses.value.length === 0)
      return;

    statuses.value = [...pendingStatuses.value, ...statuses.value];
    pendingStatuses.value = [];
    hasGap.value = false;

    // Update sinceId to newest
    if (statuses.value.length > 0) {
      sinceId = statuses.value[0]!.id;
    }
  }

  /**
   * Fill a gap between the oldest pending status and the newest displayed status.
   */
  async function fillGap() {
    if (pendingStatuses.value.length === 0 || statuses.value.length === 0)
      return;

    const oldestPending = pendingStatuses.value[pendingStatuses.value.length - 1];
    const newestDisplayed = statuses.value[0];
    if (!oldestPending || !newestDisplayed)
      return;

    try {
      const result = await fetchTimeline({
        olderThan: oldestPending.id,
        newerThan: newestDisplayed.id,
      });
      const fresh = dedup(result);
      if (fresh.length > 0) {
        pendingStatuses.value = [...pendingStatuses.value, ...fresh];
      }
      if (result.length < DEFAULT_LIMIT) {
        hasGap.value = false;
      }
    }
    catch {
      // Silent — gap fill is best-effort
    }
  }

  /**
   * Start polling on an interval, with visibility-aware auto-pause.
   */
  function startPolling(ms?: number) {
    stopPolling();
    pollIntervalMs = ms ?? 30_000;

    pollIntervalId = setInterval(poll, pollIntervalMs);

    if (typeof document !== 'undefined') {
      visibilityHandler = () => {
        if (document.visibilityState === 'hidden') {
          if (pollIntervalId !== undefined) {
            clearInterval(pollIntervalId);
            pollIntervalId = undefined;
          }
        }
        else {
          // Resume: immediate poll + restart interval
          poll();
          if (pollIntervalId === undefined) {
            pollIntervalId = setInterval(poll, pollIntervalMs);
          }
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  }

  /**
   * Stop polling and clean up listener.
   */
  function stopPolling() {
    if (pollIntervalId !== undefined) {
      clearInterval(pollIntervalId);
      pollIntervalId = undefined;
    }
    if (visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = undefined;
    }
  }

  return {
    statuses,
    pendingStatuses,
    isLoading,
    error,
    hasMore,
    hasGap,
    newStatusCount,
    fetch,
    loadMore,
    refresh,
    poll,
    showNew,
    fillGap,
    startPolling,
    stopPolling,
  };
}
