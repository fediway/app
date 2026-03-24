import type { Account, FediwayStatus } from '@repo/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetDataHelpers } from '../useDataHelpers';

// Mock store
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();
const mockStoreSetMany = vi.fn();

// Mock API methods
const mockLookup = vi.fn();
const mockStatusesList = vi.fn();
const mockFollowersList = vi.fn();
const mockFollowingList = vi.fn();
const mockSuggestionsList = vi.fn();

vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        accounts: {
          lookup: mockLookup,
          $select: (_id: string) => ({
            statuses: { list: mockStatusesList },
            followers: { list: mockFollowersList },
            following: { list: mockFollowingList },
          }),
        },
      },
      v2: {
        suggestions: { list: mockSuggestionsList },
      },
    },
  }),
  useStatusStore: () => ({
    get: mockStoreGet,
    set: mockStoreSet,
    setMany: mockStoreSetMany,
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: '1',
    username: 'alice',
    acct: 'alice',
    displayName: 'Alice',
    url: 'https://example.com/@alice',
    avatar: '',
    avatarStatic: '',
    header: '',
    headerStatic: '',
    locked: false,
    bot: false,
    group: false,
    discoverable: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    note: '',
    followersCount: 10,
    followingCount: 5,
    statusesCount: 100,
    lastStatusAt: '2024-01-01',
    emojis: [],
    fields: [],
    ...overrides,
  } as Account;
}

function makeStatus(overrides: Partial<FediwayStatus> = {}): FediwayStatus {
  return {
    id: 's1',
    createdAt: '2024-01-01T00:00:00.000Z',
    content: '<p>Hello</p>',
    account: makeAccount(),
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    uri: 'https://example.com/statuses/s1',
    url: 'https://example.com/@alice/s1',
    ...overrides,
  } as FediwayStatus;
}

afterEach(() => {
  _resetDataHelpers();
  vi.clearAllMocks();
});

// Import after mocks are set up
async function getComposable() {
  const { useAccountData } = await import('../useAccountData');
  return useAccountData();
}

describe('useAccountData', () => {
  describe('getAccountByAcct', () => {
    it('returns DataResult with account', async () => {
      const account = makeAccount({ acct: 'bob' });
      mockLookup.mockResolvedValue(account);

      const { getAccountByAcct } = await getComposable();
      const result = getAccountByAcct('bob');

      expect(result.data.value).toBeUndefined();
      expect(result.isLoading.value).toBe(true);

      await flushPromises();

      expect(result.data.value).toEqual(account);
      expect(result.isLoading.value).toBe(false);
      expect(result.error.value).toBeNull();
      expect(mockLookup).toHaveBeenCalledWith({ acct: 'bob' });
    });
  });

  describe('getAccountStatuses', () => {
    it('returns statuses for account', async () => {
      const account = makeAccount({ id: '42', acct: 'alice' });
      const statuses = [makeStatus({ id: 's1' }), makeStatus({ id: 's2' })];
      mockLookup.mockResolvedValue(account);
      mockStatusesList.mockResolvedValue(statuses);

      const { getAccountStatuses } = await getComposable();
      const result = getAccountStatuses('alice');

      await flushPromises();

      expect(result.data.value).toEqual(statuses);
      expect(result.isLoading.value).toBe(false);
      expect(mockLookup).toHaveBeenCalledWith({ acct: 'alice' });
      expect(mockStatusesList).toHaveBeenCalledWith({ limit: 20, excludeReplies: true });
      expect(mockStoreSetMany).toHaveBeenCalledWith(statuses);
    });
  });

  describe('getStatusPath', () => {
    it('returns /@acct/statusId when status is in store', async () => {
      const status = makeStatus({ id: 's99', account: makeAccount({ acct: 'carol' }) });
      mockStoreGet.mockReturnValue(status);

      const { getStatusPath } = await getComposable();
      const path = getStatusPath('s99');

      expect(path).toBe('/@carol/s99');
    });

    it('returns /@unknown/statusId when status missing from store', async () => {
      mockStoreGet.mockReturnValue(undefined);

      const { getStatusPath } = await getComposable();
      const path = getStatusPath('s404');

      expect(path).toBe('/@unknown/s404');
    });

    it('uses provided acct instead of store lookup', async () => {
      const { getStatusPath } = await getComposable();
      const path = getStatusPath('s1', 'dave');

      expect(path).toBe('/@dave/s1');
      expect(mockStoreGet).not.toHaveBeenCalled();
    });
  });

  describe('getProfilePath', () => {
    it('strips leading @ if present', async () => {
      const { getProfilePath } = await getComposable();
      expect(getProfilePath('@alice')).toBe('/@alice');
    });

    it('adds @ prefix to bare acct', async () => {
      const { getProfilePath } = await getComposable();
      expect(getProfilePath('bob')).toBe('/@bob');
    });
  });

  describe('getSuggestedAccounts', () => {
    it('returns accounts from API', async () => {
      const accounts = [makeAccount({ id: '1' }), makeAccount({ id: '2' })];
      mockSuggestionsList.mockResolvedValue(
        accounts.map(account => ({ account, source: 'staff' })),
      );

      const { getSuggestedAccounts } = await getComposable();
      const result = getSuggestedAccounts();

      await flushPromises();

      expect(result.data.value).toEqual(accounts);
      expect(result.isLoading.value).toBe(false);
      expect(mockSuggestionsList).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe('getAccountFollowers', () => {
    it('returns follower list', async () => {
      const account = makeAccount({ id: '10', acct: 'alice' });
      const followers = [makeAccount({ id: '20' }), makeAccount({ id: '30' })];
      mockLookup.mockResolvedValue(account);
      mockFollowersList.mockResolvedValue(followers);

      const { getAccountFollowers } = await getComposable();
      const result = getAccountFollowers('alice');

      await flushPromises();

      expect(result.data.value).toEqual(followers);
      expect(result.isLoading.value).toBe(false);
      expect(mockFollowersList).toHaveBeenCalledWith({ limit: 40 });
    });
  });

  describe('getAccountFollowing', () => {
    it('returns following list', async () => {
      const account = makeAccount({ id: '10', acct: 'alice' });
      const following = [makeAccount({ id: '20' }), makeAccount({ id: '30' })];
      mockLookup.mockResolvedValue(account);
      mockFollowingList.mockResolvedValue(following);

      const { getAccountFollowing } = await getComposable();
      const result = getAccountFollowing('alice');

      await flushPromises();

      expect(result.data.value).toEqual(following);
      expect(result.isLoading.value).toBe(false);
      expect(mockFollowingList).toHaveBeenCalledWith({ limit: 40 });
    });
  });

  describe('caching', () => {
    it('same key returns cached refs (no duplicate API call)', async () => {
      const account = makeAccount({ acct: 'alice' });
      mockLookup.mockResolvedValue(account);

      const { getAccountByAcct } = await getComposable();
      const result1 = getAccountByAcct('alice');

      await flushPromises();

      const result2 = getAccountByAcct('alice');

      // Same ref objects
      expect(result1.data).toBe(result2.data);
      expect(result1.isLoading).toBe(result2.isLoading);
      expect(result1.error).toBe(result2.error);
    });
  });
});
