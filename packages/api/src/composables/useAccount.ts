import type { Account, Relationship, Status } from '@repo/types';
import { ref, shallowRef } from 'vue';
import { useAuth } from './useAuth';

export interface UseAccountReturn {
  account: ReturnType<typeof shallowRef<Account | null>>;
  relationship: ReturnType<typeof shallowRef<Relationship | null>>;
  statuses: ReturnType<typeof shallowRef<Status[]>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  fetch: (accountId: string) => Promise<void>;
  fetchByAcct: (acct: string) => Promise<void>;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  block: () => Promise<void>;
  unblock: () => Promise<void>;
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
}

/**
 * Composable for fetching and managing account data
 */
export function useAccount(): UseAccountReturn {
  const { getClient, isAuthenticated } = useAuth();

  const account = shallowRef<Account | null>(null);
  const relationship = shallowRef<Relationship | null>(null);
  const statuses = shallowRef<Status[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Fetch account by ID
   */
  async function fetch(accountId: string) {
    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Fetch account info
      account.value = await client.rest.v1.accounts.$select(accountId).fetch();

      // Fetch relationship if authenticated
      if (isAuthenticated.value) {
        const relationships = await client.rest.v1.accounts.relationships.fetch({
          id: [accountId],
        });
        relationship.value = relationships[0] ?? null;
      }

      // Fetch recent statuses
      statuses.value = await client.rest.v1.accounts.$select(accountId).statuses.list({
        limit: 20,
        excludeReplies: true,
      });
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch account');
    }
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch account by acct (username@instance or username for local)
   */
  async function fetchByAcct(acct: string) {
    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Lookup account by acct
      const result = await client.rest.v1.accounts.lookup({ acct });
      await fetch(result.id);
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to lookup account');
      isLoading.value = false;
    }
  }

  /**
   * Follow the current account
   */
  async function follow() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).follow();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to follow');
    }
  }

  /**
   * Unfollow the current account
   */
  async function unfollow() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).unfollow();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unfollow');
    }
  }

  /**
   * Block the current account
   */
  async function block() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).block();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to block');
    }
  }

  /**
   * Unblock the current account
   */
  async function unblock() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).unblock();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unblock');
    }
  }

  /**
   * Mute the current account
   */
  async function mute() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).mute();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to mute');
    }
  }

  /**
   * Unmute the current account
   */
  async function unmute() {
    if (!account.value)
      return;

    const client = getClient();
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      relationship.value = await client.rest.v1.accounts.$select(account.value.id).unmute();
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to unmute');
    }
  }

  return {
    account,
    relationship,
    statuses,
    isLoading,
    error,
    fetch,
    fetchByAcct,
    follow,
    unfollow,
    block,
    unblock,
    mute,
    unmute,
  };
}
