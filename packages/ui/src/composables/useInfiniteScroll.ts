import type { ComputedRef, Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { ref, watch } from 'vue';

/**
 * Composable for infinite scroll via IntersectionObserver.
 *
 * Place the returned `sentinelRef` on an invisible element at the bottom of your list.
 * When the sentinel enters the viewport (with rootMargin buffer), `onLoadMore` fires.
 */
export function useInfiniteScroll(options: {
  enabled: Ref<boolean> | ComputedRef<boolean>;
  onLoadMore: () => void;
  rootMargin?: string;
}) {
  const sentinelRef = ref<HTMLElement | null>(null);

  const { stop, pause, resume } = useIntersectionObserver(
    sentinelRef,
    ([entry]) => {
      if (entry?.isIntersecting && options.enabled.value) {
        options.onLoadMore();
      }
    },
    {
      rootMargin: options.rootMargin ?? '400px',
    },
  );

  // Pause/resume observation based on enabled state
  watch(options.enabled, (enabled) => {
    if (enabled) {
      resume();
    }
    else {
      pause();
    }
  }, { immediate: true });

  return { sentinelRef, stop };
}
