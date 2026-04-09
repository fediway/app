import type { Ref } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useMediaPlayerState } from './useMediaPlayerState';

export function useVideoAutoplay(
  videoRef: Ref<HTMLVideoElement | undefined>,
  videoId: string,
  options: { enabled?: Ref<boolean> } = {},
) {
  const { activeVideoId, setActiveVideo } = useMediaPlayerState();
  const isVisible = ref(false);

  let observer: IntersectionObserver | null = null;

  function tryPlay() {
    if (!videoRef.value || !isVisible.value)
      return;
    if (options.enabled?.value === false)
      return;

    if (activeVideoId.value && activeVideoId.value !== videoId) {
      const prev = document.querySelector(
        `[data-video-id="${activeVideoId.value}"] video`,
      ) as HTMLVideoElement | null;
      prev?.pause();
    }
    setActiveVideo(videoId);
    videoRef.value.play().catch(() => {});
  }

  function tryPause() {
    if (activeVideoId.value === videoId) {
      videoRef.value?.pause();
      setActiveVideo(null);
    }
  }

  function setup() {
    if (!videoRef.value || typeof IntersectionObserver === 'undefined')
      return;

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible.value = entry.intersectionRatio >= 0.5;

          if (isVisible.value) {
            tryPlay();
          }
          else {
            tryPause();
          }
        }
      },
      { threshold: [0, 0.5] },
    );

    observer.observe(videoRef.value);
  }

  watch(videoRef, (el) => {
    observer?.disconnect();
    if (el)
      setup();
  }, { immediate: true });

  if (options.enabled) {
    watch(options.enabled, (enabled) => {
      if (enabled) {
        tryPlay();
      }
      else {
        tryPause();
      }
    });
  }

  onBeforeUnmount(() => {
    observer?.disconnect();
    if (activeVideoId.value === videoId)
      setActiveVideo(null);
  });

  return { isVisible };
}
