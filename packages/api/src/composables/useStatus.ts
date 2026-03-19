import type { Context, Status } from '@repo/types';
import { ref, shallowRef } from 'vue';
import { useClient } from './useClient';

export interface UseStatusReturn {
  status: ReturnType<typeof shallowRef<Status | null>>;
  context: ReturnType<typeof shallowRef<Context | null>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  fetch: (statusId: string) => Promise<void>;
  favourite: () => Promise<void>;
  unfavourite: () => Promise<void>;
  reblog: () => Promise<void>;
  unreblog: () => Promise<void>;
  bookmark: () => Promise<void>;
  unbookmark: () => Promise<void>;
  deleteStatus: () => Promise<void>;
}

/**
 * Composable for fetching and interacting with a single status
 */
export function useStatus(): UseStatusReturn {
  const status = shallowRef<Status | null>(null);
  const context = shallowRef<Context | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Fetch status and its context (replies)
   */
  async function fetch(statusId: string) {
    const client = useClient();

    isLoading.value = true;
    error.value = null;

    try {
      const [statusResult, contextResult] = await Promise.all([
        client.rest.v1.statuses.$select(statusId).fetch(),
        client.rest.v1.statuses.$select(statusId).context.fetch(),
      ]);

      status.value = statusResult;
      context.value = contextResult;
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch status');
    }
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Favourite the current status
   */
  async function favourite() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).favourite();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to favourite');
    }
  }

  /**
   * Unfavourite the current status
   */
  async function unfavourite() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).unfavourite();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unfavourite');
    }
  }

  /**
   * Reblog the current status
   */
  async function reblog() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).reblog();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to reblog');
    }
  }

  /**
   * Unreblog the current status
   */
  async function unreblog() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).unreblog();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unreblog');
    }
  }

  /**
   * Bookmark the current status
   */
  async function bookmark() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).bookmark();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to bookmark');
    }
  }

  /**
   * Unbookmark the current status
   */
  async function unbookmark() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      status.value = await client.rest.v1.statuses.$select(status.value.id).unbookmark();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unbookmark');
    }
  }

  /**
   * Delete the current status
   */
  async function deleteStatus() {
    if (!status.value)
      return;

    const client = useClient();

    try {
      await client.rest.v1.statuses.$select(status.value.id).remove();
      status.value = null;
      context.value = null;
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete status');
    }
  }

  return {
    status,
    context,
    isLoading,
    error,
    fetch,
    favourite,
    unfavourite,
    reblog,
    unreblog,
    bookmark,
    unbookmark,
    deleteStatus,
  };
}
