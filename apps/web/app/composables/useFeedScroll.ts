import { useMediaQuery } from '@vueuse/core';
import { ref } from 'vue';

const feedEl = ref<HTMLElement | null>(null);
const isDesktop = useMediaQuery('(min-width: 1024px)');

export function useFeedScroll() {
  function getScrollPosition(): number {
    if (isDesktop.value && feedEl.value) {
      return feedEl.value.scrollTop;
    }
    return window.scrollY;
  }

  function scrollTo(y: number, behavior?: ScrollBehavior) {
    const options: ScrollToOptions = { top: y, behavior };
    if (isDesktop.value && feedEl.value) {
      feedEl.value.scrollTo(options);
    }
    else {
      window.scrollTo(options);
    }
  }

  return {
    feedEl,
    isDesktop,
    getScrollPosition,
    scrollTo,
  };
}
