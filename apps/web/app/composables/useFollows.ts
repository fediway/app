import type { Relationship } from '@repo/types';
import { useClient } from '@repo/api';
import { reactive } from 'vue';

// Module-level state — persists across page navigations
const followState = reactive(new Map<string, boolean>());
const relationshipCache = reactive(new Map<string, Relationship>());

function callApi(fn: () => Promise<unknown>) {
  fn().catch((err) => {
    console.error('[useFollows] API call failed:', err);
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

  function getRelationship(accountId: string): Relationship {
    const cached = relationshipCache.get(accountId);
    if (cached) {
      // Merge local override on top of cached server data
      return {
        ...cached,
        following: followState.has(accountId) ? followState.get(accountId)! : cached.following,
      };
    }

    // Fetch from API
    const client = getClient();
    if (client && !relationshipCache.has(accountId)) {
      callApi(async () => {
        const rels = await client.rest.v1.accounts.relationships.fetch({ id: [accountId] });
        if (rels[0]) {
          relationshipCache.set(accountId, rels[0]);
          if (!followState.has(accountId)) {
            followState.set(accountId, rels[0].following);
          }
        }
      });
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

  return { toggleFollow, isFollowing, getRelationship, followState };
}
