import type { UsePostsCallbacks } from '@repo/api';
/**
 * Web wrapper around shared usePosts — adds toast feedback.
 * The core logic (placeholder creation, API publish, cache invalidation)
 * lives in @repo/api. This wrapper only adds UI feedback.
 */
import { usePosts as usePostsCore } from '@repo/api';
import { useToast } from '@repo/ui';

export { _resetPostsState } from '@repo/api';

export function usePosts() {
  const { toast } = useToast();

  const callbacks: UsePostsCallbacks = {
    onPublished: () => {
      toast.success('Post published');
    },
    onError: (err) => {
      console.error('[usePosts] Failed to create status:', err);
      toast.error('Failed to post', 'Please try again.');
    },
    onAuthError: () => {
      toast.error('Not signed in');
    },
  };

  return usePostsCore(callbacks);
}
