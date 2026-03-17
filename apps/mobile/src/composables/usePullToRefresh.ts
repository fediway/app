import { onBeforeUnmount, ref } from 'vue';
import { useHaptics } from './useHaptics';

const PULL_THRESHOLD = 80;

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const isRefreshing = ref(false);
  const pullDistance = ref(0);
  const { impact } = useHaptics();

  let startY = 0;
  let tracking = false;

  function onTouchStart(e: TouchEvent) {
    if (isRefreshing.value || window.scrollY > 0)
      return;
    const touch = e.touches[0];
    if (touch) {
      startY = touch.clientY;
      tracking = true;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!tracking || isRefreshing.value)
      return;
    const touch = e.touches[0];
    if (!touch)
      return;
    const delta = touch.clientY - startY;
    if (delta > 0 && window.scrollY <= 0) {
      pullDistance.value = Math.min(delta * 0.5, PULL_THRESHOLD * 1.5);
    }
    else {
      pullDistance.value = 0;
    }
  }

  async function onTouchEnd() {
    if (!tracking)
      return;
    tracking = false;

    if (pullDistance.value >= PULL_THRESHOLD) {
      isRefreshing.value = true;
      impact('light');
      try {
        await onRefresh();
      }
      finally {
        isRefreshing.value = false;
      }
    }
    pullDistance.value = 0;
  }

  let el: HTMLElement | null = null;

  function bind(element: HTMLElement) {
    el = element;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function unbind() {
    if (!el)
      return;
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el = null;
  }

  onBeforeUnmount(unbind);

  return {
    isRefreshing,
    pullDistance,
    bind,
    unbind,
  };
}
