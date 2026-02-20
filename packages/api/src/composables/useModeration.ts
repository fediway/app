import type { Account, Relationship } from '@repo/types';
import { ref, shallowRef } from 'vue';
import { useClient } from './useClient';

export interface ModerationError {
  action: 'block' | 'unblock' | 'mute' | 'unmute' | 'muteConversation' | 'unmuteConversation' | 'blockDomain' | 'unblockDomain' | 'fetchBlocks' | 'fetchMutes' | 'fetchDomainBlocks';
  targetId?: string;
  error: Error;
}

export interface UseModerationOptions {
  onError?: (e: ModerationError) => void;
}

export interface MuteAccountParams {
  notifications?: boolean;
  duration?: number;
}

export interface UseModerationReturn {
  isLoading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  blockedAccounts: ReturnType<typeof shallowRef<Account[]>>;
  mutedAccounts: ReturnType<typeof shallowRef<Account[]>>;
  blockedDomains: ReturnType<typeof shallowRef<string[]>>;
  blockAccount: (id: string) => Promise<Relationship | undefined>;
  unblockAccount: (id: string) => Promise<Relationship | undefined>;
  muteAccount: (id: string, params?: MuteAccountParams) => Promise<Relationship | undefined>;
  unmuteAccount: (id: string) => Promise<Relationship | undefined>;
  muteConversation: (statusId: string) => Promise<void>;
  unmuteConversation: (statusId: string) => Promise<void>;
  blockDomain: (domain: string) => Promise<void>;
  unblockDomain: (domain: string) => Promise<void>;
  fetchBlockedAccounts: () => Promise<void>;
  fetchMutedAccounts: () => Promise<void>;
  fetchBlockedDomains: () => Promise<void>;
}

export function useModeration(options?: UseModerationOptions): UseModerationReturn {
  const client = useClient();

  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const blockedAccounts = shallowRef<Account[]>([]);
  const mutedAccounts = shallowRef<Account[]>([]);
  const blockedDomains = shallowRef<string[]>([]);

  async function blockAccount(id: string): Promise<Relationship | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v1.accounts.$select(id).block();
      return result;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to block account');
      error.value = e;
      options?.onError?.({ action: 'block', targetId: id, error: e });
      return undefined;
    }
  }

  async function unblockAccount(id: string): Promise<Relationship | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v1.accounts.$select(id).unblock();
      return result;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to unblock account');
      error.value = e;
      options?.onError?.({ action: 'unblock', targetId: id, error: e });
      return undefined;
    }
  }

  async function muteAccount(id: string, params?: MuteAccountParams): Promise<Relationship | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v1.accounts.$select(id).mute(params);
      return result;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to mute account');
      error.value = e;
      options?.onError?.({ action: 'mute', targetId: id, error: e });
      return undefined;
    }
  }

  async function unmuteAccount(id: string): Promise<Relationship | undefined> {
    try {
      error.value = null;
      const result = await client.rest.v1.accounts.$select(id).unmute();
      return result;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to unmute account');
      error.value = e;
      options?.onError?.({ action: 'unmute', targetId: id, error: e });
      return undefined;
    }
  }

  // Conversation mute/unmute operates on statuses, not accounts
  async function muteConversation(statusId: string): Promise<void> {
    try {
      error.value = null;
      await client.rest.v1.statuses.$select(statusId).mute();
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to mute conversation');
      error.value = e;
      options?.onError?.({ action: 'muteConversation', targetId: statusId, error: e });
    }
  }

  async function unmuteConversation(statusId: string): Promise<void> {
    try {
      error.value = null;
      await client.rest.v1.statuses.$select(statusId).unmute();
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to unmute conversation');
      error.value = e;
      options?.onError?.({ action: 'unmuteConversation', targetId: statusId, error: e });
    }
  }

  async function blockDomain(domain: string): Promise<void> {
    try {
      error.value = null;
      await client.rest.v1.domainBlocks.create({ domain });
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to block domain');
      error.value = e;
      options?.onError?.({ action: 'blockDomain', targetId: domain, error: e });
    }
  }

  async function unblockDomain(domain: string): Promise<void> {
    try {
      error.value = null;
      await client.rest.v1.domainBlocks.remove({ domain });
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to unblock domain');
      error.value = e;
      options?.onError?.({ action: 'unblockDomain', targetId: domain, error: e });
    }
  }

  async function fetchBlockedAccounts(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await client.rest.v1.blocks.list();
      blockedAccounts.value = result as Account[];
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch blocked accounts');
      error.value = e;
      options?.onError?.({ action: 'fetchBlocks', error: e });
    }
    finally {
      isLoading.value = false;
    }
  }

  async function fetchMutedAccounts(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await client.rest.v1.mutes.list();
      mutedAccounts.value = result as Account[];
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch muted accounts');
      error.value = e;
      options?.onError?.({ action: 'fetchMutes', error: e });
    }
    finally {
      isLoading.value = false;
    }
  }

  async function fetchBlockedDomains(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await client.rest.v1.domainBlocks.list();
      blockedDomains.value = result as string[];
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch blocked domains');
      error.value = e;
      options?.onError?.({ action: 'fetchDomainBlocks', error: e });
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    blockedAccounts,
    mutedAccounts,
    blockedDomains,
    blockAccount,
    unblockAccount,
    muteAccount,
    unmuteAccount,
    muteConversation,
    unmuteConversation,
    blockDomain,
    unblockDomain,
    fetchBlockedAccounts,
    fetchMutedAccounts,
    fetchBlockedDomains,
  };
}
