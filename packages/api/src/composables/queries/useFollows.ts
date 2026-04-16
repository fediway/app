import type { Relationship } from '@repo/types';
import { reactive } from 'vue';
import { useClient } from '../useClient';

// Module-level state — persists across page navigations
const followState = reactive(new Map<string, boolean>());
const relationshipCache = reactive(new Map<string, Relationship>());
const toggleSeq = new Map<string, number>();

export interface UseFollowsCallbacks {
  onToggle?: (accountId: string, following: boolean) => void;
  onError?: (accountId: string | string[], err: unknown) => void;
}

export function useFollows(callbacks?: UseFollowsCallbacks) {
  function getClient() {
    try {
      return useClient();
    }
    catch {
      return null;
    }
  }

  function toggleFollow(accountId: string) {
    const previous = followState.get(accountId) ?? false;
    // A pending request counts as "engaged" — toggling should cancel it
    const requested = relationshipCache.get(accountId)?.requested ?? false;
    const wasEngaged = previous || requested;

    followState.set(accountId, !wasEngaged);
    // Optimistically clear requested so the button updates immediately
    if (requested) {
      const cached = relationshipCache.get(accountId);
      if (cached)
        relationshipCache.set(accountId, { ...cached, requested: false });
    }
    callbacks?.onToggle?.(accountId, !wasEngaged);

    // Sequence counter — only the latest toggle writes to state
    const seq = (toggleSeq.get(accountId) ?? 0) + 1;
    toggleSeq.set(accountId, seq);

    const client = getClient();
    if (!client) {
      // No client — roll back optimistic update, can't call API
      followState.set(accountId, previous);
      return;
    }

    const apiCall = wasEngaged
      ? client.rest.v1.accounts.$select(accountId).unfollow()
      : client.rest.v1.accounts.$select(accountId).follow();

    apiCall
      .then((rel) => {
        if (toggleSeq.get(accountId) === seq) {
          followState.set(accountId, rel.following);
          relationshipCache.set(accountId, rel);
        }
      })
      .catch((err) => {
        if (toggleSeq.get(accountId) === seq) {
          followState.set(accountId, previous);
          // Restore the original relationship state on error
          if (requested) {
            const cached = relationshipCache.get(accountId);
            if (cached)
              relationshipCache.set(accountId, { ...cached, requested: true });
          }
        }
        callbacks?.onError?.(accountId, err);
      });
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

    client.rest.v1.accounts.relationships.fetch({ id: uncached })
      .then((rels) => {
        for (const rel of rels) {
          relationshipCache.set(rel.id, rel);
          if (!followState.has(rel.id)) {
            followState.set(rel.id, rel.following);
          }
        }
      })
      .catch((err) => {
        callbacks?.onError?.(uncached, err);
      });
  }

  return { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships, followState };
}

/** Reset all follow state. Called on account switch and in tests. */
export function resetFollowsState() {
  followState.clear();
  relationshipCache.clear();
  toggleSeq.clear();
}
