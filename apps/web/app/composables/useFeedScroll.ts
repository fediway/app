import { useMediaQuery } from '@vueuse/core';
import { ref } from 'vue';

const feedEl = ref<HTMLElement | null>(null);
let isDesktop: ReturnType<typeof useMediaQuery> | null = null;

function getIsDesktop() {
  if (!isDesktop)
    isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop;
}

export function useFeedScroll() {
  function getScrollPosition(): number {
    if (typeof window === 'undefined')
      return 0;
    if (getIsDesktop().value && feedEl.value)
      return feedEl.value.scrollTop;
    return window.scrollY;
  }

  function scrollTo(y: number, behavior?: ScrollBehavior) {
    if (typeof window === 'undefined')
      return;
    const options: ScrollToOptions = { top: y, behavior };
    if (getIsDesktop().value && feedEl.value)
      feedEl.value.scrollTo(options);
    else
      window.scrollTo(options);
  }

  return {
    feedEl,
    isDesktop: getIsDesktop(),
    getScrollPosition,
    scrollTo,
  };
}

/** Reset all state — for testing only */
export function _resetFeedScrollState() {
  feedEl.value = null;
  isDesktop = null;
}
