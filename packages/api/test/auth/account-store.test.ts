import type { AccountCredentials } from '@repo/types';
import type { MastoClient } from '../../src/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccountStore } from '../../src/auth/account-store';
import { loadAccountList, loadActiveAccountKey, removeToken } from '../../src/auth/storage';

const mockUser: AccountCredentials = {
  id: '42',
  username: 'alice',
  acct: 'alice',
  displayName: 'Alice',
  avatar: 'https://mastodon.social/avatars/alice.png',
  avatarStatic: 'https://mastodon.social/avatars/alice.png',
  header: '',
  headerStatic: '',
  locked: false,
  bot: false,
  discoverable: true,
  indexable: false,
  group: false,
  createdAt: '2023-01-01T00:00:00.000Z',
  note: '',
  url: 'https://mastodon.social/@alice',
  uri: 'https://mastodon.social/users/alice',
  followersCount: 10,
  followingCount: 20,
  statusesCount: 100,
  lastStatusAt: '2024-01-01',
  emojis: [],
  fields: [],
  source: {
    privacy: 'public',
    sensitive: false,
    language: 'en',
    note: '',
    fields: [],
    followRequestsCount: 0,
  },
  role: {
    id: '0',
    name: '',
    permissions: '0',
    color: '',
    highlighted: false,
  },
} as unknown as AccountCredentials;

const mockUser2: AccountCredentials = {
  ...mockUser,
  id: '99',
  username: 'bob',
  displayName: 'Bob',
  avatar: 'https://fosstodon.org/avatars/bob.png',
  url: 'https://fosstodon.org/@bob',
} as unknown as AccountCredentials;

// Mock createMastoClient
vi.mock('../../src/client', () => ({
  createMastoClient: vi.fn((config: { url: string; accessToken?: string }) => ({
    rest: {
      v1: {
        accounts: {
          verifyCredentials: vi.fn(async () => {
            // Return user based on instance URL
            if (config.url.includes('fosstodon'))
              return mockUser2;
            return mockUser;
          }),
        },
      },
    },
    config,
    isAuthenticated: !!config.accessToken,
    fediway: {},
  } as unknown as MastoClient)),
}));

describe('useAccountStore', () => {
  let store: ReturnType<typeof useAccountStore>;

  beforeEach(() => {
    store = useAccountStore();
  });

  afterEach(async () => {
    await store.logoutAll();
    await removeToken('mastodon.social', '42');
    await removeToken('fosstodon.org', '99');
  });

  describe('initial state', () => {
    it('starts with empty accounts', () => {
      expect(store.accounts.value).toEqual([]);
    });

    it('starts unauthenticated', () => {
      expect(store.isAuthenticated.value).toBe(false);
    });

    it('has no active account', () => {
      expect(store.activeAccount.value).toBeNull();
    });

    it('has no client', () => {
      expect(store.getClient()).toBeNull();
    });
  });

  describe('addAccount', () => {
    it('adds an account and sets it as active', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      expect(store.accounts.value).toHaveLength(1);
      expect(store.activeAccountKey.value).toBe('mastodon.social:42');
      expect(store.isAuthenticated.value).toBe(true);
    });

    it('persists account to storage', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      const stored = loadAccountList();
      expect(stored).toHaveLength(1);
      expect(stored[0]!.key).toBe('mastodon.social:42');
    });

    it('creates a client', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      expect(store.getClient()).not.toBeNull();
      expect(store.getClient()!.isAuthenticated).toBe(true);
    });
  });

  describe('multiple accounts', () => {
    it('second account becomes active', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.addAccount({
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
        accessToken: 'token-bob',
      });

      expect(store.accounts.value).toHaveLength(2);
      expect(store.activeAccountKey.value).toBe('fosstodon.org:99');
    });

    it('first account stays in list', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.addAccount({
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
        accessToken: 'token-bob',
      });

      const keys = store.accounts.value.map(a => a.key);
      expect(keys).toContain('mastodon.social:42');
      expect(keys).toContain('fosstodon.org:99');
    });
  });

  describe('switchAccount', () => {
    it('switches to another account', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.addAccount({
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
        accessToken: 'token-bob',
      });

      await store.switchAccount('mastodon.social:42');

      expect(store.activeAccountKey.value).toBe('mastodon.social:42');
      expect(store.currentUser.value?.id).toBe('42');
    });

    it('verifies credentials on switch', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.switchAccount('mastodon.social:42');
      expect(store.currentUser.value).not.toBeNull();
    });

    it('throws on nonexistent key', async () => {
      await expect(store.switchAccount('nonexistent:key')).rejects.toThrow('Account not found');
    });
  });

  describe('removeAccount', () => {
    it('removes active account and switches to next', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.addAccount({
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
        accessToken: 'token-bob',
      });

      await store.removeAccount('fosstodon.org:99');

      expect(store.accounts.value).toHaveLength(1);
      expect(store.activeAccountKey.value).toBe('mastodon.social:42');
    });

    it('clears everything when last account removed', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.removeAccount('mastodon.social:42');

      expect(store.accounts.value).toHaveLength(0);
      expect(store.activeAccountKey.value).toBeNull();
      expect(store.isAuthenticated.value).toBe(false);
    });

    it('does not change active when removing non-active account', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.addAccount({
        instanceUrl: 'https://fosstodon.org',
        instanceDomain: 'fosstodon.org',
        accountId: '99',
        username: 'bob',
        accessToken: 'token-bob',
      });

      // Active is fosstodon:99, remove mastodon:42
      await store.removeAccount('mastodon.social:42');

      expect(store.accounts.value).toHaveLength(1);
      expect(store.activeAccountKey.value).toBe('fosstodon.org:99');
    });
  });

  describe('restoreSession', () => {
    it('restores from storage', async () => {
      // First, add an account to populate storage
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      // Reset in-memory state (simulate app restart)
      store.accounts.value = [];
      store.activeAccountKey.value = null;
      store.activeClient.value = null;
      store.currentUser.value = null;

      await store.restoreSession();

      expect(store.accounts.value).toHaveLength(1);
      expect(store.activeAccountKey.value).toBe('mastodon.social:42');
      expect(store.isAuthenticated.value).toBe(true);
    });

    it('no-op when storage is empty', async () => {
      await store.restoreSession();

      expect(store.accounts.value).toEqual([]);
      expect(store.isAuthenticated.value).toBe(false);
    });

    it('falls back to first account if active key is invalid', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      // Corrupt the active key in storage
      window.localStorage.setItem('fediway_active_account', 'nonexistent:key');

      // Reset in-memory state
      store.accounts.value = [];
      store.activeAccountKey.value = null;
      store.activeClient.value = null;
      store.currentUser.value = null;

      await store.restoreSession();

      expect(store.activeAccountKey.value).toBe('mastodon.social:42');
    });
  });

  describe('logoutAll', () => {
    it('clears everything', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      await store.logoutAll();

      expect(store.accounts.value).toEqual([]);
      expect(store.activeAccountKey.value).toBeNull();
      expect(store.activeClient.value).toBeNull();
      expect(store.currentUser.value).toBeNull();
      expect(store.isAuthenticated.value).toBe(false);
      expect(loadAccountList()).toEqual([]);
      expect(loadActiveAccountKey()).toBeNull();
    });
  });

  describe('handleAccountExpired', () => {
    it('clears user and removes the active account', async () => {
      await store.addAccount({
        instanceUrl: 'https://mastodon.social',
        instanceDomain: 'mastodon.social',
        accountId: '42',
        username: 'alice',
        accessToken: 'token-alice',
      });

      store.handleAccountExpired();

      // Give the async cleanup a tick to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.currentUser.value).toBeNull();
      expect(store.error.value).not.toBeNull();
    });
  });
});
