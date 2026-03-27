import type { AccountCredentials, StoredAccount } from '@repo/types';
import type { MastoClient } from '../client';
import { computed, ref, shallowRef } from 'vue';
import { createMastoClient } from '../client';
import { setOn401Handler } from '../utils/request';
import { clearAllAccountState } from './account-state-cleanup';
import {
  addAccountToList,
  clearAllAccounts,
  loadAccountList,
  loadActiveAccountKey,
  loadToken,
  removeAccount as removeAccountFromStorage,
  saveActiveAccountKey,
  storeToken,
} from './storage';

// Module-level state (singleton, shared across all useAccountStore() calls)
const accounts = ref<StoredAccount[]>([]);
const activeAccountKey = ref<string | null>(null);

/**
 * Synchronous getter for the active account key.
 * Used by createQuery/createPaginatedQuery for auto-scoping cache keys.
 * Not a composable — reads module-level ref directly, no Vue context needed.
 */
export function getActiveAccountKeySync(): string {
  return activeAccountKey.value ?? 'anon';
}
const activeClient = shallowRef<MastoClient | null>(null);
const currentUser = shallowRef<AccountCredentials | null>(null);
const isLoading = ref(false);
const error = ref<Error | null>(null);

const activeAccount = computed(() => {
  if (!activeAccountKey.value)
    return null;
  return accounts.value.find(a => a.key === activeAccountKey.value) ?? null;
});

const isAuthenticated = computed(() => !!activeClient.value?.isAuthenticated);

const instanceUrl = computed(() => activeAccount.value?.instanceUrl ?? null);

function createClientForAccount(account: StoredAccount, token: string): MastoClient {
  const client = createMastoClient({
    url: account.instanceUrl,
    accessToken: token,
  });
  setOn401Handler(() => handleAccountExpired());
  return client;
}

export interface AddAccountOptions {
  instanceUrl: string;
  instanceDomain: string;
  accountId: string;
  username: string;
  acct?: string;
  displayName?: string;
  avatarUrl?: string;
  accessToken: string;
  appRegistration?: StoredAccount['appRegistration'];
  instanceInfo?: StoredAccount['instanceInfo'];
}

async function addAccount(opts: AddAccountOptions): Promise<void> {
  const key = `${opts.instanceDomain}:${opts.accountId}`;

  const account: StoredAccount = {
    key,
    instanceUrl: opts.instanceUrl,
    instanceDomain: opts.instanceDomain,
    accountId: opts.accountId,
    username: opts.username,
    acct: opts.acct,
    displayName: opts.displayName,
    avatarUrl: opts.avatarUrl,
    appRegistration: opts.appRegistration,
    instanceInfo: opts.instanceInfo,
  };

  // Store token securely
  await storeToken(opts.instanceDomain, opts.accountId, opts.accessToken);

  // Update account list
  addAccountToList(account);
  accounts.value = loadAccountList();

  // Set as active
  saveActiveAccountKey(key);
  activeAccountKey.value = key;

  // Create client
  activeClient.value = createClientForAccount(account, opts.accessToken);
}

async function switchAccount(key: string): Promise<void> {
  const account = accounts.value.find(a => a.key === key);
  if (!account) {
    throw new Error(`Account not found: ${key}`);
  }

  // Clear all cached data from previous account before loading new data
  clearAllAccountState();

  isLoading.value = true;
  error.value = null;

  try {
    const token = await loadToken(account.instanceDomain, account.accountId);
    if (!token) {
      throw new Error(`Token not found for account: ${key}`);
    }

    saveActiveAccountKey(key);
    activeAccountKey.value = key;

    activeClient.value = createClientForAccount(account, token);

    // Verify credentials against the server — this is the source of truth.
    // Don't show user data until the server confirms the session is valid.
    // The UI shows a loading skeleton until this resolves.
    const user = await activeClient.value.rest.v1.accounts.verifyCredentials();
    currentUser.value = user;

    // Update stored account with fresh display data
    if (user.displayName !== account.displayName || user.avatar !== account.avatarUrl || user.acct !== account.acct) {
      const updated: StoredAccount = {
        ...account,
        acct: user.acct ?? account.acct,
        displayName: user.displayName ?? account.displayName,
        avatarUrl: user.avatar ?? account.avatarUrl,
      };
      addAccountToList(updated);
      accounts.value = loadAccountList();
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to switch account');
    throw error.value;
  }
  finally {
    isLoading.value = false;
  }
}

async function removeAccount(key: string): Promise<void> {
  await removeAccountFromStorage(key);
  accounts.value = loadAccountList();

  if (activeAccountKey.value === key) {
    currentUser.value = null;
    activeClient.value = null;

    const remaining = accounts.value;
    if (remaining.length > 0) {
      await switchAccount(remaining[0]!.key);
    }
    else {
      activeAccountKey.value = null;
      clearAllAccountState();
    }
  }
}

async function restoreSession(): Promise<void> {
  accounts.value = loadAccountList();

  if (accounts.value.length === 0)
    return;

  let key = loadActiveAccountKey();

  // If the stored active key is invalid, fall back to first account
  if (!key || !accounts.value.some(a => a.key === key)) {
    key = accounts.value[0]!.key;
  }

  try {
    await switchAccount(key);
  }
  catch {
    // Token expired or invalid — clear this account
    await removeAccount(key);
  }
}

function handleAccountExpired(): void {
  const key = activeAccountKey.value;
  if (!key)
    return;

  currentUser.value = null;
  error.value = new Error('Session expired — please log in again');
  clearAllAccountState();

  // Fire and forget — async cleanup
  removeAccount(key);
}

async function logoutAll(): Promise<void> {
  await clearAllAccounts();
  accounts.value = [];
  activeAccountKey.value = null;
  activeClient.value = null;
  currentUser.value = null;
  error.value = null;
  clearAllAccountState();
}

function getClient(): MastoClient | null {
  return activeClient.value;
}

export function useAccountStore() {
  return {
    // State
    accounts,
    activeAccountKey,
    activeClient,
    currentUser,
    isLoading,
    error,

    // Computed
    activeAccount,
    isAuthenticated,
    instanceUrl,

    // Actions
    addAccount,
    switchAccount,
    removeAccount,
    restoreSession,
    handleAccountExpired,
    logoutAll,
    getClient,
  };
}
