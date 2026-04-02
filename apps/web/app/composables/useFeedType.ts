import { ref } from 'vue';

export type FeedType = 'home' | 'explore' | 'trending';

const feedType = ref<FeedType>('home');

export function useFeedType() {
  function set(type: FeedType) {
    feedType.value = type;
  }

  return {
    feedType,
    set,
  };
}
