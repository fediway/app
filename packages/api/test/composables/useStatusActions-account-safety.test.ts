import { describe, expect, it, vi } from 'vitest';

/**
 * Tests that mutations from a previous account don't write to the store
 * after an account switch. The scenario:
 *
 * 1. User taps Like (mutation starts, account = "A")
 * 2. User switches account (clearAllAccountState → store cleared)
 * 3. Mutation completes → should NOT write to store (account changed)
 */

// Mock the account key — starts as 'account-a', can be changed
let mockAccountKey = 'account-a';
vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => mockAccountKey,
}));

// Mock the client — favourite resolves after a delay
const mockFavourite = vi.fn();
const mockUnfavourite = vi.fn();
vi.mock('../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        statuses: {
          $select: () => ({
            favourite: mockFavourite,
            unfavourite: mockUnfavourite,
          }),
        },
      },
    },
  }),
}));

describe('useStatusActions — account switch safety', () => {
  it('discards mutation result if account changed during in-flight', async () => {
    // Reset mocks
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();

    // Make favourite resolve after we switch accounts
    let resolveFavourite: (value: any) => void;
    mockFavourite.mockImplementation(() => new Promise((resolve) => {
      resolveFavourite = resolve;
    }));

    // Import fresh (after mocks)
    const { useStatusStore } = await import('../../src/composables/useStatusStore');
    const { useStatusActions } = await import('../../src/composables/useStatusActions');

    const store = useStatusStore();
    const { toggleFavourite } = useStatusActions();

    // Seed a status
    store.set({
      id: '1',
      favourited: false,
      favouritesCount: 5,
    } as any);

    // Start the mutation (account = 'account-a')
    const mutationPromise = toggleFavourite('1');

    // Optimistic update should have happened
    expect(store.get('1')?.favourited).toBe(true);
    expect(store.get('1')?.favouritesCount).toBe(6);

    // Simulate account switch — clear store, change account key
    store.clear();
    mockAccountKey = 'account-b';

    // Seed a different status for the new account
    store.set({
      id: '1',
      favourited: false,
      favouritesCount: 10,
    } as any);

    // Now resolve the mutation from the old account
    resolveFavourite!({ id: '1', favourited: true, favouritesCount: 6 });
    await mutationPromise;

    // The store should NOT have been modified by the old mutation
    // It should still reflect account-b's data
    const status = store.get('1');
    expect(status?.favourited).toBe(false);
    expect(status?.favouritesCount).toBe(10);
  });

  it('discards rollback if account changed during in-flight error', async () => {
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();

    // Make favourite reject after we switch accounts
    let rejectFavourite: (error: Error) => void;
    mockFavourite.mockImplementation(() => new Promise((_resolve, reject) => {
      rejectFavourite = reject;
    }));

    const { useStatusStore } = await import('../../src/composables/useStatusStore');
    const { useStatusActions } = await import('../../src/composables/useStatusActions');

    const store = useStatusStore();
    store.clear();
    const onError = vi.fn();
    const { toggleFavourite } = useStatusActions({ onError });

    store.set({
      id: '2',
      favourited: false,
      favouritesCount: 5,
    } as any);

    const mutationPromise = toggleFavourite('2');

    // Switch account
    store.clear();
    mockAccountKey = 'account-b';

    // Seed new account data
    store.set({
      id: '2',
      favourited: false,
      favouritesCount: 20,
    } as any);

    // Old mutation fails
    rejectFavourite!(new Error('Network error'));
    await mutationPromise;

    // Account-b data should be untouched — no rollback from account-a
    const status = store.get('2');
    expect(status?.favouritesCount).toBe(20);

    // onError should NOT have been called (wrong account)
    expect(onError).not.toHaveBeenCalled();
  });

  it('applies mutation result if account has NOT changed', async () => {
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();
    mockFavourite.mockResolvedValue({
      id: '1',
      favourited: true,
      favouritesCount: 6,
    });

    const { useStatusStore } = await import('../../src/composables/useStatusStore');
    const { useStatusActions } = await import('../../src/composables/useStatusActions');

    const store = useStatusStore();
    store.clear();
    const { toggleFavourite } = useStatusActions();

    store.set({
      id: '1',
      favourited: false,
      favouritesCount: 5,
    } as any);

    await toggleFavourite('1');

    // Mutation should have committed (same account)
    const status = store.get('1');
    expect(status?.favourited).toBe(true);
  });
});
