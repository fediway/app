import type { Ref } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useMediaPlayerState } from './useMediaPlayerState';

/**
 * Autoplay a video when it enters the viewport, pause when it leaves.
 * Only one video plays at a time — entering a new one pauses the previous.
 *
 * Disabled when `enabled` ref is false (e.g. reduce motion, autoplay prefs).
 */
export function useVideoAutoplay(
  videoRef: Ref<HTMLVideoElement | undefined>,
  videoId: string,
  options: { enabled?: Ref<boolean> } = {},
) {
  const { activeVideoId, setActiveVideo } = useMediaPlayerState();
  const isVisible = ref(false);

  let observer: IntersectionObserver | null = null;

  function setup() {
    if (!videoRef.value || typeof IntersectionObserver === 'undefined')
      return;

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible.value = entry.intersectionRatio >= 0.5;

          // Don't autoplay if disabled
          if (options.enabled?.value === false) {
            if (activeVideoId.value === videoId) {
              videoRef.value?.pause();
              setActiveVideo(null);
            }
            return;
          }

          if (entry.intersectionRatio >= 0.5) {
            // Entering viewport — play this, pause any other
            if (activeVideoId.value && activeVideoId.value !== videoId) {
              const prev = document.querySelector(
                `[data-video-id="${activeVideoId.value}"] video`,
              ) as HTMLVideoElement | null;
              prev?.pause();
            }
            setActiveVideo(videoId);
            videoRef.value?.play().catch(() => {});
          }
          else {
            // Leaving viewport — pause
            if (activeVideoId.value === videoId) {
              videoRef.value?.pause();
              setActiveVideo(null);
            }
          }
        }
      },
      { threshold: [0, 0.5] },
    );

    observer.observe(videoRef.value);
  }

  // Setup when video element is available
  watch(videoRef, (el) => {
    observer?.disconnect();
    if (el)
      setup();
  }, { immediate: true });

  // When enabled changes, pause if disabled
  if (options.enabled) {
    watch(options.enabled, (enabled) => {
      if (!enabled && activeVideoId.value === videoId) {
        videoRef.value?.pause();
        setActiveVideo(null);
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
