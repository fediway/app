import { describe, expect, it, vi } from 'vitest';

/**
 * Tests rapid toggle behavior — user taps like→unlike→like in quick succession.
 *
 * Current behavior: inFlight guard drops the 2nd and 3rd taps.
 * Only the first tap's intent reaches the API.
 *
 * Expected worldclass behavior: all taps update the UI optimistically,
 * and the final intent is sent to the API (debounced or queued).
 */

let mockAccountKey = 'account-a';
vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => mockAccountKey,
}));

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

describe('useStatusActions — rapid toggle', () => {
  it('second tap during in-flight mutation is dropped', async () => {
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();
    mockUnfavourite.mockReset();

    // First favourite takes 100ms to resolve
    mockFavourite.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ id: '1', favourited: true, favouritesCount: 6 }), 100),
    ));
    mockUnfavourite.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ id: '1', favourited: false, favouritesCount: 5 }), 100),
    ));

    const { useStatusStore } = await import('../../src/composables/useStatusStore');
    const { useStatusActions } = await import('../../src/composables/useStatusActions');

    const store = useStatusStore();
    store.clear();
    const { toggleFavourite } = useStatusActions();

    // Seed status: not favourited
    store.set({
      id: '1',
      favourited: false,
      favouritesCount: 5,
    } as any);

    // Tap 1: like (starts API call)
    const tap1 = toggleFavourite('1');
    expect(store.get('1')?.favourited).toBe(true); // optimistic

    // Tap 2: unlike (while tap 1 is in-flight)
    const tap2 = toggleFavourite('1');

    // The key question: did tap 2 get dropped by inFlight guard?
    // If dropped: favourited stays true (tap 1's optimistic state)
    // If processed: favourited would flip back to false
    const afterTap2 = store.get('1')?.favourited;

    await tap1;
    await tap2;

    // How many API calls were made?
    const totalCalls = mockFavourite.mock.calls.length + mockUnfavourite.mock.calls.length;

    // Current behavior: tap 2 is dropped, only 1 API call
    // This test documents the current behavior
    expect(totalCalls).toBe(1);
    expect(afterTap2).toBe(true); // tap 2 was dropped, state unchanged

    // If we implement debounced intent (Phase 4), this test should change to:
    // expect(totalCalls).toBe(1); // still 1 call (debounced)
    // expect(afterTap2).toBe(false); // tap 2 applied optimistically
    // expect(store.get('1')?.favourited).toBe(false); // final intent: unlike
  });

  it('rapid triple toggle (like→unlike→like) reflects final intent in UI', async () => {
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();
    mockUnfavourite.mockReset();

    // Slow API — each call takes 200ms
    mockFavourite.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ id: '1', favourited: true, favouritesCount: 6 }), 200),
    ));
    mockUnfavourite.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ id: '1', favourited: false, favouritesCount: 5 }), 200),
    ));

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

    // Three rapid taps: like → unlike → like
    const tap1 = toggleFavourite('1'); // like
    const tap2 = toggleFavourite('1'); // unlike (dropped by inFlight)
    const tap3 = toggleFavourite('1'); // like (dropped by inFlight)

    // With current inFlight guard: taps 2 and 3 are dropped
    // UI shows: liked (from tap 1's optimistic update)
    expect(store.get('1')?.favourited).toBe(true);

    await tap1;
    await tap2;
    await tap3;

    // Only 1 API call made (taps 2 and 3 dropped)
    const totalCalls = mockFavourite.mock.calls.length + mockUnfavourite.mock.calls.length;
    expect(totalCalls).toBe(1);

    // Final state: liked (from tap 1, taps 2+3 never processed)
    // This is CORRECT by accident — user wanted like→unlike→like = liked
    // But if user did like→unlike = unlike, the unlike would be dropped = BUG
    expect(store.get('1')?.favourited).toBe(true);
  });

  it('double tap (like→unlike) should result in unliked state', async () => {
    mockAccountKey = 'account-a';
    mockFavourite.mockReset();
    mockUnfavourite.mockReset();

    // Slow API
    mockFavourite.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ id: '1', favourited: true, favouritesCount: 6 }), 200),
    ));

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

    // Tap 1: like
    const tap1 = toggleFavourite('1');
    expect(store.get('1')?.favourited).toBe(true);

    // Tap 2: unlike (user changed their mind)
    const tap2 = toggleFavourite('1');

    // With current behavior: tap 2 is DROPPED
    // UI still shows: liked — this is WRONG, user wanted unlike
    const finalState = store.get('1')?.favourited;

    await tap1;
    await tap2;

    // Document the bug: user intended unlike, but got like
    // This test will need to change when Phase 4 (debounce) is implemented
    expect(finalState).toBe(true); // BUG: should be false
    expect(mockUnfavourite).not.toHaveBeenCalled(); // BUG: unlike was dropped
  });
});
