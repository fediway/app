import type { UseFollowsCallbacks } from '@repo/api';
/**
 * Web wrapper around shared useFollows — adds toast feedback.
 * The core logic (optimistic updates, relationship cache, sequence tracking)
 * lives in @repo/api. This wrapper only adds UI feedback.
 */
import { useFollows as useFollowsCore } from '@repo/api';
import { useToast } from '@repo/ui';

export { resetFollowsState } from '@repo/api';

export function useFollows() {
  const { toast } = useToast();

  const callbacks: UseFollowsCallbacks = {
    onToggle: (_accountId, following) => {
      toast.success(following ? 'Followed' : 'Unfollowed');
    },
    onError: (_accountId, err) => {
      if (import.meta.dev) {
        console.error('[useFollows] failed:', err);
        toast.error('Action failed', err instanceof Error ? err.message : 'Please try again.');
      }
      else {
        toast.error('Action failed', 'Please try again.');
      }
    },
  };

  return useFollowsCore(callbacks);
}
