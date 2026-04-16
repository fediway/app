import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFollowsState, useFollows } from '../../src/composables/queries/useFollows';

// Mock useClient — return a controllable fake client
const mockFollow = vi.fn();
const mockUnfollow = vi.fn();

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        accounts: {
          $select: () => ({
            follow: mockFollow,
            unfollow: mockUnfollow,
          }),
          relationships: {
            fetch: vi.fn().mockResolvedValue([]),
          },
        },
      },
    },
  }),
}));

beforeEach(() => {
  resetFollowsState();
  mockFollow.mockReset();
  mockUnfollow.mockReset();
  // Default: resolve with a basic relationship
  mockFollow.mockResolvedValue({ id: '1', following: false, requested: true });
  mockUnfollow.mockResolvedValue({ id: '1', following: false, requested: false });
});

describe('useFollows core', () => {
  describe('toggleFollow', () => {
    it('calls follow API when not following', () => {
      const { toggleFollow } = useFollows();
      toggleFollow('1');
      expect(mockFollow).toHaveBeenCalled();
      expect(mockUnfollow).not.toHaveBeenCalled();
    });

    it('calls unfollow API when already following', () => {
      const { toggleFollow } = useFollows();
      // Simulate already following by toggling once and resolving
      mockFollow.mockResolvedValue({ id: '1', following: true, requested: false });
      toggleFollow('1');

      return mockFollow.mock.results[0]!.value.then(() => {
        mockFollow.mockClear();
        toggleFollow('1');
        expect(mockUnfollow).toHaveBeenCalled();
        expect(mockFollow).not.toHaveBeenCalled();
      });
    });

    it('calls unfollow (cancel) when request is pending', async () => {
      const { toggleFollow } = useFollows();

      // First toggle — sends follow, API returns requested: true
      mockFollow.mockResolvedValue({ id: '1', following: false, requested: true });
      toggleFollow('1');
      await mockFollow.mock.results[0]!.value;

      // followState is false (not yet accepted), but requested is true in cache
      mockFollow.mockClear();
      toggleFollow('1');

      // Should call unfollow to cancel the request, not follow again
      expect(mockUnfollow).toHaveBeenCalled();
      expect(mockFollow).not.toHaveBeenCalled();
    });

    it('optimistically clears requested state when cancelling', async () => {
      const { toggleFollow, getRelationship } = useFollows();

      mockFollow.mockResolvedValue({ id: '1', following: false, requested: true });
      toggleFollow('1');
      await mockFollow.mock.results[0]!.value;

      // Before second toggle: requested should be true
      expect(getRelationship('1').requested).toBe(true);

      // Toggle again to cancel
      toggleFollow('1');

      // Optimistically: requested should be cleared
      expect(getRelationship('1').requested).toBe(false);
    });
  });

  describe('isFollowing', () => {
    it('returns false by default', () => {
      const { isFollowing } = useFollows();
      expect(isFollowing('1')).toBe(false);
    });

    it('returns true after optimistic toggle', () => {
      const { toggleFollow, isFollowing } = useFollows();
      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);
    });

    it('reflects API response after resolution', async () => {
      const { toggleFollow, isFollowing } = useFollows();

      // Locked account: following stays false, requested becomes true
      mockFollow.mockResolvedValue({ id: '1', following: false, requested: true });
      toggleFollow('1');

      // Optimistic: true
      expect(isFollowing('1')).toBe(true);

      // After API resolves: false (not accepted yet)
      await mockFollow.mock.results[0]!.value;
      expect(isFollowing('1')).toBe(false);
    });
  });

  describe('getRelationship', () => {
    it('returns default relationship for unknown account', () => {
      const { getRelationship } = useFollows();
      const rel = getRelationship('99');
      expect(rel.following).toBe(false);
      expect(rel.requested).toBe(false);
    });

    it('overlays followState onto cached relationship', async () => {
      const { toggleFollow, getRelationship } = useFollows();

      mockFollow.mockResolvedValue({ id: '1', following: true, requested: false, blocking: false });
      toggleFollow('1');
      await mockFollow.mock.results[0]!.value;

      expect(getRelationship('1').following).toBe(true);
    });
  });

  describe('error rollback', () => {
    it('rolls back followState on API error', async () => {
      const onError = vi.fn();
      const { toggleFollow, isFollowing } = useFollows({ onError });

      mockFollow.mockRejectedValue(new Error('Network error'));
      toggleFollow('1');

      // Optimistic: true
      expect(isFollowing('1')).toBe(true);

      // Wait for rejection
      await vi.waitFor(() => expect(onError).toHaveBeenCalled());

      // Rolled back
      expect(isFollowing('1')).toBe(false);
    });

    it('restores requested state on cancel error', async () => {
      const onError = vi.fn();
      const { toggleFollow, getRelationship } = useFollows({ onError });

      // First: follow succeeds with requested
      mockFollow.mockResolvedValue({ id: '1', following: false, requested: true });
      toggleFollow('1');
      await mockFollow.mock.results[0]!.value;

      // Second: cancel fails
      mockUnfollow.mockRejectedValue(new Error('Network error'));
      toggleFollow('1');

      await vi.waitFor(() => expect(onError).toHaveBeenCalled());

      // Should restore requested: true
      expect(getRelationship('1').requested).toBe(true);
    });
  });
});
