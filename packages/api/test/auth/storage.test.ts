import type { StoredAccount } from '@repo/types';
import type { PlatformAdapter } from '../../src/platform';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addAccountToList,
  clearAllAccounts,
  loadAccountList,
  loadActiveAccountKey,
  loadToken,
  removeAccount,
  removeAccountFromList,
  removeToken,
  saveAccountList,
  saveActiveAccountKey,
  scopedStorageKey,
  storeToken,
} from '../../src/auth/storage';
import { getPlatformAdapter, setPlatformAdapter } from '../../src/platform';

function makeAccount(overrides: Partial<StoredAccount> = {}): StoredAccount {
  return {
    key: 'mastodon.social:42',
    instanceUrl: 'https://mastodon.social',
    instanceDomain: 'mastodon.social',
    accountId: '42',
    username: 'alice',
    ...overrides,
  };
}

describe('multi-account storage', () => {
  afterEach(async () => {
    await clearAllAccounts();
    // Also clean up orphan tokens stored directly in token tests
    await removeToken('mastodon.social', '42');
    await removeToken('fosstodon.org', '99');
  });

  describe('account list CRUD', () => {
    it('returns empty array when no accounts stored', () => {
      expect(loadAccountList()).toEqual([]);
    });

    it('saves and loads accounts', () => {
      const accounts = [makeAccount()];
      saveAccountList(accounts);
      expect(loadAccountList()).toEqual(accounts);
    });

    it('adds a new account to the list', () => {
      addAccountToList(makeAccount());
      expect(loadAccountList()).toHaveLength(1);
      expect(loadAccountList()[0]!.key).toBe('mastodon.social:42');
    });

    it('updates an existing account with the same key', () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({ displayName: 'Alice Updated' }));

      const list = loadAccountList();
      expect(list).toHaveLength(1);
      expect(list[0]!.displayName).toBe('Alice Updated');
    });

    it('supports multiple accounts', () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({
        key: 'fosstodon.org:99',
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
      }));

      expect(loadAccountList()).toHaveLength(2);
    });

    it('removes an account from the list', () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({
        key: 'fosstodon.org:99',
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
      }));

      removeAccountFromList('mastodon.social:42');
      const list = loadAccountList();
      expect(list).toHaveLength(1);
      expect(list[0]!.key).toBe('fosstodon.org:99');
    });

    it('handles removing non-existent key gracefully', () => {
      addAccountToList(makeAccount());
      removeAccountFromList('nonexistent:key');
      expect(loadAccountList()).toHaveLength(1);
    });
  });

  describe('active account key', () => {
    it('returns null when no active account set', () => {
      expect(loadActiveAccountKey()).toBeNull();
    });

    it('saves and loads active account key', () => {
      saveActiveAccountKey('mastodon.social:42');
      expect(loadActiveAccountKey()).toBe('mastodon.social:42');
    });

    it('clears active account key with null', () => {
      saveActiveAccountKey('mastodon.social:42');
      saveActiveAccountKey(null);
      expect(loadActiveAccountKey()).toBeNull();
    });
  });

  describe('token storage', () => {
    it('stores and loads a token', async () => {
      await storeToken('mastodon.social', '42', 'secret-token');
      const token = await loadToken('mastodon.social', '42');
      expect(token).toBe('secret-token');
    });

    it('returns null for missing token', async () => {
      const token = await loadToken('mastodon.social', '42');
      expect(token).toBeNull();
    });

    it('removes a token', async () => {
      await storeToken('mastodon.social', '42', 'secret-token');
      await removeToken('mastodon.social', '42');
      const token = await loadToken('mastodon.social', '42');
      expect(token).toBeNull();
    });

    it('uses correct key format with domain and accountId', async () => {
      const secureStore = new Map<string, string>();
      const mockAdapter: PlatformAdapter = {
        secureGet: vi.fn(async (key: string) => secureStore.get(key) ?? null),
        secureSet: vi.fn(async (key: string, value: string) => { secureStore.set(key, value); }),
        secureRemove: vi.fn(async (key: string) => { secureStore.delete(key); }),
        openUrl: vi.fn(),
        isNative: () => false,
      };

      const originalAdapter = getPlatformAdapter();
      setPlatformAdapter(mockAdapter);

      try {
        await storeToken('mastodon.social', '42', 'my-token');
        expect(mockAdapter.secureSet).toHaveBeenCalledWith('fediway_token:mastodon.social:42', 'my-token');
      }
      finally {
        setPlatformAdapter(originalAdapter);
      }
    });
  });

  describe('removeAccount (compound)', () => {
    it('removes token, list entry, and fixes active key', async () => {
      addAccountToList(makeAccount());
      saveActiveAccountKey('mastodon.social:42');
      await storeToken('mastodon.social', '42', 'token');

      await removeAccount('mastodon.social:42');

      expect(loadAccountList()).toHaveLength(0);
      expect(loadActiveAccountKey()).toBeNull();
      const token = await loadToken('mastodon.social', '42');
      expect(token).toBeNull();
    });

    it('switches active to next account when active is removed', async () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({
        key: 'fosstodon.org:99',
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
      }));
      saveActiveAccountKey('mastodon.social:42');

      await removeAccount('mastodon.social:42');

      expect(loadActiveAccountKey()).toBe('fosstodon.org:99');
    });

    it('does not change active key when removing non-active account', async () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({
        key: 'fosstodon.org:99',
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
      }));
      saveActiveAccountKey('mastodon.social:42');

      await removeAccount('fosstodon.org:99');

      expect(loadActiveAccountKey()).toBe('mastodon.social:42');
      expect(loadAccountList()).toHaveLength(1);
    });
  });

  describe('clearAllAccounts', () => {
    it('removes all accounts, tokens, and active key', async () => {
      addAccountToList(makeAccount());
      addAccountToList(makeAccount({
        key: 'fosstodon.org:99',
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
      }));
      saveActiveAccountKey('mastodon.social:42');
      await storeToken('mastodon.social', '42', 'token-1');
      await storeToken('fosstodon.org', '99', 'token-2');

      await clearAllAccounts();

      expect(loadAccountList()).toEqual([]);
      expect(loadActiveAccountKey()).toBeNull();
    });

    it('does not throw when no accounts exist', async () => {
      await expect(clearAllAccounts()).resolves.toBeUndefined();
    });
  });

  describe('scopedStorageKey', () => {
    it('returns correctly formatted key', () => {
      expect(scopedStorageKey('mastodon.social:42', 'drafts'))
        .toBe('fediway:mastodon.social:42:drafts');
    });
  });

  describe('corrupted JSON handling', () => {
    it('returns empty array when accounts JSON is corrupted', () => {
      window.localStorage.setItem('fediway_accounts', 'not-valid-json{{{');
      expect(loadAccountList()).toEqual([]);
    });

    it('returns empty array when accounts JSON is not an array', () => {
      window.localStorage.setItem('fediway_accounts', '{"not": "array"}');
      expect(loadAccountList()).toEqual([]);
    });
  });
});
