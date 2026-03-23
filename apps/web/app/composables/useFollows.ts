import type { Relationship } from '@repo/types';
import { useClient } from '@repo/api';
import { useToast } from '@repo/ui';
import { reactive } from 'vue';

// Module-level state — persists across page navigations
const followState = reactive(new Map<string, boolean>());
const relationshipCache = reactive(new Map<string, Relationship>());

const { toast } = useToast();

function callApi(fn: () => Promise<unknown>) {
  fn().catch((err) => {
    if (import.meta.dev) {
      console.error('[useFollows] API call failed:', err);
      toast.error('Action failed', err instanceof Error ? err.message : 'Please try again.');
    }
    else {
      toast.error('Action failed', 'Please try again.');
    }
  });
}

export function useFollows() {
  function getClient() {
    try {
      return useClient();
    }
    catch {
      return null;
    }
  }

  function toggleFollow(accountId: string) {
    const current = followState.get(accountId) ?? false;
    followState.set(accountId, !current);
    toast.success(current ? 'Unfollowed' : 'Followed');

    const client = getClient();
    if (client) {
      callApi(async () => {
        let rel: Relationship;
        if (current) {
          rel = await client.rest.v1.accounts.$select(accountId).unfollow();
        }
        else {
          rel = await client.rest.v1.accounts.$select(accountId).follow();
        }
        // Sync server state back
        followState.set(accountId, rel.following);
        relationshipCache.set(accountId, rel);
      });
    }
  }

  function isFollowing(accountId: string): boolean {
    return followState.get(accountId) ?? false;
  }

  function hasRelationship(accountId: string): boolean {
    return relationshipCache.has(accountId);
  }

  function getRelationship(accountId: string): Relationship {
    const cached = relationshipCache.get(accountId);
    if (cached) {
      // Merge local override on top of cached server data
      return {
        ...cached,
        following: followState.has(accountId) ? followState.get(accountId)! : cached.following,
      };
    }

    return {
      id: accountId,
      following: followState.get(accountId) ?? false,
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

  /** Batch-fetch relationships for multiple accounts in one API call */
  function fetchRelationships(accountIds: string[]) {
    const uncached = accountIds.filter(id => !relationshipCache.has(id));
    if (uncached.length === 0)
      return;

    const client = getClient();
    if (!client)
      return;

    callApi(async () => {
      const rels = await client.rest.v1.accounts.relationships.fetch({ id: uncached });
      for (const rel of rels) {
        relationshipCache.set(rel.id, rel);
        if (!followState.has(rel.id)) {
          followState.set(rel.id, rel.following);
        }
      }
    });
  }

  return { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships, followState };
}

/** Reset all state — for testing only */
export function _resetFollowsState() {
  followState.clear();
  relationshipCache.clear();
}
