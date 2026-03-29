import { computed, ref } from 'vue';

/**
 * Global media display preferences — shared across all media components.
 *
 * Same singleton pattern as useMediaPlayerState (runtime state).
 * Values are set by the app shell from persisted user settings.
 * Components read them reactively.
 */

export type MediaVisibility = 'default' | 'show_all' | 'hide_all';

const mediaVisibility = ref<MediaVisibility>('default');
const autoplayGifs = ref(true);
const reduceMotion = ref(false);

// OS-level preference
const osReduceMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export function useMediaPreferences() {
  /** True when app setting OR OS preference requests reduced motion */
  const effectiveReduceMotion = computed(() => reduceMotion.value || osReduceMotion);

  /** Whether a video should autoplay (respects reduce motion) */
  const shouldAutoplayVideos = computed(() => !effectiveReduceMotion.value);

  /** Whether GIFs should autoplay (respects both settings) */
  const shouldAutoplayGifs = computed(() => autoplayGifs.value && !effectiveReduceMotion.value);

  /** Whether media should start revealed for a given sensitive flag */
  function shouldReveal(sensitive: boolean): boolean {
    if (mediaVisibility.value === 'show_all')
      return true;
    if (mediaVisibility.value === 'hide_all')
      return false;
    return !sensitive;
  }

  function setMediaVisibility(value: MediaVisibility) {
    mediaVisibility.value = value;
  }

  function setAutoplayGifs(value: boolean) {
    autoplayGifs.value = value;
  }

  function setReduceMotion(value: boolean) {
    reduceMotion.value = value;
  }

  return {
    mediaVisibility,
    autoplayGifs,
    reduceMotion,
    effectiveReduceMotion,
    shouldAutoplayVideos,
    shouldAutoplayGifs,
    shouldReveal,
    setMediaVisibility,
    setAutoplayGifs,
    setReduceMotion,
  };
}
