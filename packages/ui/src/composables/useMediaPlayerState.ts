import { ref } from 'vue';

/**
 * Global media player state — shared across all video instances.
 *
 * Mute state is session-scoped: unmuting one video unmutes all subsequent videos.
 * Resets to muted on page refresh (fresh consent each session).
 */
const isMuted = ref(true);
const volume = ref(0.5);
const activeVideoId = ref<string | null>(null);

export function useMediaPlayerState() {
  function unmute() {
    isMuted.value = false;
  }

  function mute() {
    isMuted.value = true;
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v));
  }

  function setActiveVideo(id: string | null) {
    activeVideoId.value = id;
  }

  return {
    isMuted,
    volume,
    activeVideoId,
    unmute,
    mute,
    setVolume,
    setActiveVideo,
  };
}
