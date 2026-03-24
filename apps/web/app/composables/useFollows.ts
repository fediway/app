import type { Relationship } from '@repo/types';
import { useClient } from '@repo/api';
import { useToast } from '@repo/ui';
import { reactive } from 'vue';

// Module-level state — persists across page navigations
const followState = reactive(new Map<string, boolean>());
const relationshipCache = reactive(new Map<string, Relationship>());

function showError(toast: ReturnType<typeof useToast>['toast'], err: unknown) {
  if (import.meta.dev) {
    toast.error('Action failed', err instanceof Error ? err.message : 'Please try again.');
  }
  else {
    toast.error('Action failed', 'Please try again.');
  }
}

export function useFollows() {
  const { toast } = useToast();

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
    followState.set(accountId, !previous);
    toast.success(previous ? 'Unfollowed' : 'Followed');

    const client = getClient();
    if (client) {
      const apiCall = previous
        ? client.rest.v1.accounts.$select(accountId).unfollow()
        : client.rest.v1.accounts.$select(accountId).follow();

      apiCall
        .then((rel) => {
          followState.set(accountId, rel.following);
          relationshipCache.set(accountId, rel);
        })
        .catch((err) => {
          followState.set(accountId, previous);
          if (import.meta.dev) {
            console.error('[useFollows] toggleFollow failed:', err);
          }
          showError(toast, err);
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
        if (import.meta.dev) {
          console.error('[useFollows] fetchRelationships failed:', err);
        }
        showError(toast, err);
      });
  }

  return { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships, followState };
}

/** Reset all state — for testing only */
export function _resetFollowsState() {
  followState.clear();
  relationshipCache.clear();
}
