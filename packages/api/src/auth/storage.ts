import type { StoredAccount } from '@repo/types';
import { getPlatformAdapter } from '../platform';

const ACCOUNTS_KEY = 'fediway_accounts';
const ACTIVE_ACCOUNT_KEY = 'fediway_active_account';

function tokenKey(domain: string, accountId: string): string {
  return `fediway_token:${domain}:${accountId}`;
}

/**
 * Build a scoped localStorage key for per-account data (drafts, cache, etc.).
 */
export function scopedStorageKey(accountKey: string, baseKey: string): string {
  return `fediway:${accountKey}:${baseKey}`;
}

// --- Account list ---

export function loadAccountList(): StoredAccount[] {
  if (typeof localStorage === 'undefined')
    return [];

  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw)
    return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }
  catch {
    return [];
  }
}

export function saveAccountList(accounts: StoredAccount[]): void {
  if (typeof localStorage === 'undefined')
    return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function addAccountToList(account: StoredAccount): void {
  const accounts = loadAccountList();
  const idx = accounts.findIndex(a => a.key === account.key);
  if (idx >= 0) {
    accounts[idx] = account;
  }
  else {
    accounts.push(account);
  }
  saveAccountList(accounts);
}

export function removeAccountFromList(key: string): void {
  const accounts = loadAccountList().filter(a => a.key !== key);
  saveAccountList(accounts);
}

// --- Active account ---

export function loadActiveAccountKey(): string | null {
  if (typeof localStorage === 'undefined')
    return null;
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
}

export function saveActiveAccountKey(key: string | null): void {
  if (typeof localStorage === 'undefined')
    return;
  if (key === null) {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
  else {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, key);
  }
}

// --- Token storage (secure) ---

export async function storeToken(domain: string, accountId: string, token: string): Promise<void> {
  const adapter = getPlatformAdapter();
  await adapter.secureSet(tokenKey(domain, accountId), token);
}

export async function loadToken(domain: string, accountId: string): Promise<string | null> {
  const adapter = getPlatformAdapter();
  return adapter.secureGet(tokenKey(domain, accountId));
}

export async function removeToken(domain: string, accountId: string): Promise<void> {
  const adapter = getPlatformAdapter();
  await adapter.secureRemove(tokenKey(domain, accountId));
}

// --- Compound operations ---

/**
 * Remove an account completely: token, list entry, fix active key.
 */
export async function removeAccount(key: string): Promise<void> {
  const accounts = loadAccountList();
  const account = accounts.find(a => a.key === key);

  if (account) {
    await removeToken(account.instanceDomain, account.accountId);
  }

  removeAccountFromList(key);

  const activeKey = loadActiveAccountKey();
  if (activeKey === key) {
    const remaining = loadAccountList();
    saveActiveAccountKey(remaining.length > 0 ? remaining[0]!.key : null);
  }
}

/**
 * Clear all account data.
 */
export async function clearAllAccounts(): Promise<void> {
  const accounts = loadAccountList();
  const adapter = getPlatformAdapter();

  for (const account of accounts) {
    await adapter.secureRemove(tokenKey(account.instanceDomain, account.accountId));
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
}
