import type { Relationship } from '@repo/types';
import { flushPromises, makeRelationship } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetFollowsState, useFollows } from '../../../src/composables/queries/useFollows';

// Mock useClient — can be toggled to throw for no-auth tests
const mockFetch = vi.fn();
const mockFollow = vi.fn();
const mockUnfollow = vi.fn();
let clientAvailable = true;
vi.mock('../../../src/composables/useClient', () => ({
  useClient: () => {
    if (!clientAvailable)
      throw new Error('Not authenticated');
    return {
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
    };
  },
}));

beforeEach(() => {
  _resetFollowsState();
  mockFetch.mockReset();
  mockFollow.mockReset();
  mockUnfollow.mockReset();
  clientAvailable = true;

  mockFollow.mockImplementation((id: string) => Promise.resolve(makeRelationship(id, true)));
  mockUnfollow.mockImplementation((id: string) => Promise.resolve(makeRelationship(id, false)));
});

afterEach(() => {
  _resetFollowsState();
});

describe('useFollows (shared)', () => {
  describe('toggleFollow', () => {
    it('optimistically updates follow state', () => {
      const { toggleFollow, isFollowing } = useFollows();

      expect(isFollowing('1')).toBe(false);
      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);
      toggleFollow('1');
      expect(isFollowing('1')).toBe(false);
    });

    it('calls onToggle callback with new state', () => {
      const onToggle = vi.fn();
      const { toggleFollow } = useFollows({ onToggle });

      toggleFollow('1');
      expect(onToggle).toHaveBeenCalledWith('1', true);

      toggleFollow('1');
      expect(onToggle).toHaveBeenCalledWith('1', false);
    });

    it('syncs server state on API success', async () => {
      const { toggleFollow, isFollowing } = useFollows();

      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);
      await flushPromises();
      expect(isFollowing('1')).toBe(true);
    });

    it('rolls back optimistic update on API error', async () => {
      mockFollow.mockImplementation(() => Promise.reject(new Error('Network error')));

      const onError = vi.fn();
      const { toggleFollow, isFollowing } = useFollows({ onError });

      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);

      await flushPromises();
      expect(isFollowing('1')).toBe(false);
      expect(onError).toHaveBeenCalledWith('1', expect.any(Error));
    });

    it('rolls back unfollow on API error', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);
      const { toggleFollow, isFollowing, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();
      expect(isFollowing('1')).toBe(true);

      mockUnfollow.mockImplementation(() => Promise.reject(new Error('Server error')));
      toggleFollow('1');
      expect(isFollowing('1')).toBe(false);

      await flushPromises();
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

    it('calls correct API method (follow vs unfollow)', async () => {
      const { toggleFollow } = useFollows();

      toggleFollow('1');
      expect(mockFollow).toHaveBeenCalledWith('1');
      expect(mockUnfollow).not.toHaveBeenCalled();

      await flushPromises();
      mockFollow.mockClear();

      toggleFollow('1');
      expect(mockUnfollow).toHaveBeenCalledWith('1');
    });

    it('rapid double-tap: slow first API does NOT overwrite second toggle', async () => {
      let resolveFollow: (v: Relationship) => void;
      mockFollow.mockImplementation((_id: string) => new Promise<Relationship>((r) => {
        resolveFollow = r;
      }));
      mockUnfollow.mockImplementation((id: string) => Promise.resolve(makeRelationship(id, false)));

      const { toggleFollow, isFollowing } = useFollows();

      toggleFollow('1');
      expect(isFollowing('1')).toBe(true);

      toggleFollow('1');
      expect(isFollowing('1')).toBe(false);

      await flushPromises();
      expect(isFollowing('1')).toBe(false);

      resolveFollow!(makeRelationship('1', true));
      await flushPromises();

      expect(isFollowing('1')).toBe(false);
    });
  });

  describe('no client (unauthenticated)', () => {
    it('toggleFollow rolls back immediately when no client', () => {
      clientAvailable = false;

      const { toggleFollow, isFollowing } = useFollows();
      expect(isFollowing('1')).toBe(false);

      toggleFollow('1');
      // Optimistic set happens, then immediate rollback
      expect(isFollowing('1')).toBe(false);
      expect(mockFollow).not.toHaveBeenCalled();
    });

    it('fetchRelationships does nothing when no client', () => {
      clientAvailable = false;

      const { fetchRelationships, hasRelationship } = useFollows();
      fetchRelationships(['1', '2']);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(hasRelationship('1')).toBe(false);
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
      expect(isFollowing('1')).toBe(true);
      expect(isFollowing('2')).toBe(false);
      expect(isFollowing('3')).toBe(true);
    });

    it('skips already-cached IDs', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);
      const { fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      mockFetch.mockClear();
      mockFetch.mockResolvedValue([makeRelationship('2', false)]);
      fetchRelationships(['1', '2']);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith({ id: ['2'] });
    });

    it('does nothing for empty array', () => {
      const { fetchRelationships } = useFollows();
      fetchRelationships([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles API error without crashing', async () => {
      mockFetch.mockRejectedValue(new Error('Network down'));
      const onError = vi.fn();
      const { fetchRelationships, hasRelationship } = useFollows({ onError });
      fetchRelationships(['1']);
      await flushPromises();

      expect(hasRelationship('1')).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('preserves existing follow state from optimistic toggle', async () => {
      const { toggleFollow, fetchRelationships, isFollowing } = useFollows();
      toggleFollow('1');

      mockFetch.mockResolvedValue([makeRelationship('1', false)]);
      fetchRelationships(['1']);
      await flushPromises();

      expect(isFollowing('1')).toBe(true);
    });
  });

  describe('getRelationship', () => {
    it('returns default relationship when not cached', () => {
      const { getRelationship } = useFollows();
      const rel = getRelationship('1');
      expect(rel.id).toBe('1');
      expect(rel.following).toBe(false);
    });

    it('merges local follow override on top of cached data', async () => {
      mockFetch.mockResolvedValue([makeRelationship('1', true)]);
      const { toggleFollow, getRelationship, fetchRelationships } = useFollows();
      fetchRelationships(['1']);
      await flushPromises();

      expect(getRelationship('1').following).toBe(true);
      toggleFollow('1');
      expect(getRelationship('1').following).toBe(false);
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

      toggleFollow('1');
      const rel = getRelationship('1');
      expect(rel.following).toBe(false);
      expect(rel.followedBy).toBe(true);
      expect(rel.muting).toBe(true);
      expect(rel.note).toBe('a note');
    });
  });
});
