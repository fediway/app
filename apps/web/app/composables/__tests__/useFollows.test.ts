import type { Relationship } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetFollowsState, useFollows } from '../useFollows';

// Mock @repo/api
const mockFetch = vi.fn();
vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        accounts: {
          $select: (id: string) => ({
            follow: () => Promise.resolve(makeRelationship(id, true)),
            unfollow: () => Promise.resolve(makeRelationship(id, false)),
          }),
          relationships: { fetch: mockFetch },
        },
      },
    },
  }),
}));

// Mock @repo/ui
vi.mock('@repo/ui', () => ({
  useToast: () => ({
    toast: Object.assign(vi.fn(), {
      success: vi.fn(),
      error: vi.fn(),
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
  });
});
