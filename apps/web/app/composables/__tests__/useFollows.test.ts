import type { Relationship } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetFollowsState, useFollows } from '../useFollows';

// Mock @repo/api — configurable per test
const mockFetch = vi.fn();
const mockFollow = vi.fn();
const mockUnfollow = vi.fn();
vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        accounts: {
          $select: (id: string) => ({
            follow: () => mockFollow(id),
            unfollow: () => mockUnfollow(id),
          }),
          relationships: { fetch: mockFetch },
        },
      },
    },
  }),
}));

// Mock @repo/ui
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@repo/ui', () => ({
  useToast: () => ({
    toast: Object.assign(vi.fn(), {
      success: mockToastSuccess,
      error: mockToastError,
    }),
    removeToast: vi.fn(),
  }),
}));

function makeRelationship(id: string, following: boolean): Relationship {
  return {
    id,
    following,
    followedBy: false,
    blocking: false,
    blockedBy: false,
    muting: false,
    mutingNotifications: false,
    requested: false,
    requestedBy: false,
    domainBlocking: false,
    endorsed: false,
    notifying: false,
    note: '',
  } as Relationship;
}

beforeEach(() => {
  _resetFollowsState();
  mockFetch.mockReset();
  mockFollow.mockReset();
  mockUnfollow.mockReset();
  mockToastSuccess.mockClear();
  mockToastError.mockClear();

  // Default: follow/unfollow succeed
  mockFollow.mockImplementation((id: string) => Promise.resolve(makeRelationship(id, true)));
  mockUnfollow.mockImplementation((id: string) => Promise.resolve(makeRelationship(id, false)));
});

afterEach(() => {
  _resetFollowsState();
});

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('useFollows', () => {
  describe('toggleFollow', () => {
    it('optimistically updates follow state', () => {
      const { toggleFollow, isFollowing } = useFollows();

      expect(isFollowing('1')).toBe(false);
      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);
      toggleFollow('1');
      expect(isFollowing('1')).toBe(false);
    });

    it('syncs server state on API success', async () => {
      const { toggleFollow, isFollowing } = useFollows();

      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);
      expect(mockFollow).toHaveBeenCalledWith('1');

      await flushPromises();
      expect(isFollowing('1')).toBe(true);
    });

    it('rolls back optimistic update on API error', async () => {
      mockFollow.mockImplementation(() => Promise.reject(new Error('Network error')));

      const { toggleFollow, isFollowing } = useFollows();

      expect(isFollowing('1')).toBe(false);
      toggleFollow('1');
      // Optimistic: shows as following
      expect(isFollowing('1')).toBe(true);

      await flushPromises();
      // Rolled back after API failure
      expect(isFollowing('1')).toBe(false);
      expect(mockToastError).toHaveBeenCalled();
    });

    it('rolls back unfollow on API error', async () => {
      // Set up as following first
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);
      const { toggleFollow, isFollowing, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();
      expect(isFollowing('1')).toBe(true);

      // Unfollow fails
      mockUnfollow.mockImplementation(() => Promise.reject(new Error('Server error')));
      toggleFollow('1');
      // Optimistic: shows as unfollowed
      expect(isFollowing('1')).toBe(false);

      await flushPromises();
      // Rolled back to following
      expect(isFollowing('1')).toBe(true);
    });

    it('updates relationship cache on API success', async () => {
      const { toggleFollow, getRelationship } = useFollows();

      toggleFollow('1');
      await flushPromises();

      const rel = getRelationship('1');
      expect(rel.following).toBe(true);
      expect(rel.id).toBe('1');
    });

    it('shows correct toast messages', () => {
      const { toggleFollow } = useFollows();

      toggleFollow('1');
      expect(mockToastSuccess).toHaveBeenCalledWith('Followed');

      toggleFollow('1');
      expect(mockToastSuccess).toHaveBeenCalledWith('Unfollowed');
    });

    it('calls follow API when not following, unfollow when following', async () => {
      const { toggleFollow } = useFollows();

      toggleFollow('1');
      expect(mockFollow).toHaveBeenCalledWith('1');
      expect(mockUnfollow).not.toHaveBeenCalled();

      await flushPromises();
      mockFollow.mockClear();

      toggleFollow('1');
      expect(mockUnfollow).toHaveBeenCalledWith('1');
    });
  });

  describe('hasRelationship', () => {
    it('returns false before fetch, true after', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);
      const { hasRelationship, fetchRelationships } = useFollows();

      expect(hasRelationship('1')).toBe(false);

      fetchRelationships(['1']);
      await flushPromises();

      expect(hasRelationship('1')).toBe(true);
    });
  });

  describe('fetchRelationships', () => {
    it('batch-fetches all provided IDs in one call', async () => {
      mockFetch.mockResolvedValue([
        makeRelationship('1', true),
        makeRelationship('2', false),
        makeRelationship('3', true),
      ]);

      const { fetchRelationships, isFollowing } = useFollows();
      fetchRelationships(['1', '2', '3']);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith({ id: ['1', '2', '3'] });
      expect(isFollowing('1')).toBe(true);
      expect(isFollowing('2')).toBe(false);
      expect(isFollowing('3')).toBe(true);
    });

    it('skips already-cached IDs', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);

      const { fetchRelationships } = useFollows();

      // First fetch caches '1'
      fetchRelationships(['1']);
      await flushPromises();

      mockFetch.mockClear();
      mockFetch.mockResolvedValue([makeRelationship('2', false)]);

      // Second fetch should only request '2'
      fetchRelationships(['1', '2']);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith({ id: ['2'] });
    });

    it('does nothing when all IDs are cached', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);

      const { fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      mockFetch.mockClear();
      fetchRelationships(['1']);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does nothing for empty array', () => {
      const { fetchRelationships } = useFollows();
      fetchRelationships([]);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles API error without crashing', async () => {
      mockFetch.mockRejectedValue(new Error('Network down'));

      const { fetchRelationships, hasRelationship, isFollowing } = useFollows();
      fetchRelationships(['1', '2']);
      await flushPromises();

      // State remains clean — no partial data
      expect(hasRelationship('1')).toBe(false);
      expect(hasRelationship('2')).toBe(false);
      expect(isFollowing('1')).toBe(false);
      expect(isFollowing('2')).toBe(false);
      expect(mockToastError).toHaveBeenCalled();
    });

    it('preserves existing follow state from optimistic toggle', async () => {
      const { toggleFollow, fetchRelationships, isFollowing } = useFollows();

      // User follows before relationships are fetched
      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);

      // Server says not following (e.g., follow API hasn't resolved yet)
      mockFetch.mockResolvedValue([makeRelationship('1', false)]);
      fetchRelationships(['1']);
      await flushPromises();

      // Optimistic toggle takes precedence — followState.has('1') is true
      // so fetchRelationships doesn't overwrite it (line 105-107)
      expect(isFollowing('1')).toBe(true);
    });
  });

  describe('getRelationship', () => {
    it('returns default relationship when not cached', () => {
      const { getRelationship } = useFollows();
      const rel = getRelationship('1');

      expect(rel.id).toBe('1');
      expect(rel.following).toBe(false);
      expect(rel.requested).toBe(false);
    });

    it('returns cached data after fetch', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);

      const { getRelationship, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      const rel = getRelationship('1');
      expect(rel.following).toBe(true);
    });

    it('merges local follow override on top of cached data', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);

      const { toggleFollow, getRelationship, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      expect(getRelationship('1').following).toBe(true);

      // Optimistic unfollow
      toggleFollow('1');
      expect(getRelationship('1').following).toBe(false);
    });

    it('merges optimistic follow over server not-following', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', false)]);

      const { toggleFollow, getRelationship, fetchRelationships } = useFollows();

      // Optimistic follow before cache is populated
      toggleFollow('1');

      // Server says not following (stale data)
      fetchRelationships(['1']);
      await flushPromises();

      // Local override wins
      const rel = getRelationship('1');
      expect(rel.following).toBe(true);
    });

    it('preserves other cached fields when merging follow override', async () => {
      const serverRel = {
        ...makeRelationship('1', true),
        followedBy: true,
        muting: true,
        note: 'a note',
      } as Relationship;
      mockFetch.mockResolvedValue([serverRel]);

      const { toggleFollow, getRelationship, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      // Toggle unfollow — should only change `following`, not other fields
      toggleFollow('1');
      const rel = getRelationship('1');

      expect(rel.following).toBe(false);
      expect(rel.followedBy).toBe(true);
      expect(rel.muting).toBe(true);
      expect(rel.note).toBe('a note');
    });
  });
});
