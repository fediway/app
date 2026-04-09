import type { Ref } from 'vue';

export interface VideoPlayerKeyDeps {
  videoRef: Ref<HTMLVideoElement | undefined>;
  volume: Ref<number>;
  videoDuration: Ref<number>;
  hasCaptions: Ref<boolean>;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleCaptions: () => void;
  seekBy: (seconds: number) => void;
  setVolume: (v: number) => void;
  showControls: () => void;
}

export function useVideoPlayerKeys(deps: VideoPlayerKeyDeps) {
  function handleKeyDown(e: KeyboardEvent) {
    if (!deps.videoRef.value)
      return;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        deps.togglePlay();
        break;
      case 'm':
        e.preventDefault();
        deps.toggleMute();
        break;
      case 'f':
        e.preventDefault();
        deps.toggleFullscreen();
        break;
      case 'c':
        e.preventDefault();
        if (deps.hasCaptions.value)
          deps.toggleCaptions();
        break;
      case 'ArrowLeft':
      case 'j':
        e.preventDefault();
        deps.seekBy(e.key === 'j' ? -10 : -5);
        break;
      case 'ArrowRight':
      case 'l':
        e.preventDefault();
        deps.seekBy(e.key === 'l' ? 10 : 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        deps.setVolume(Math.min(1, deps.volume.value + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        deps.setVolume(Math.max(0, deps.volume.value - 0.1));
        break;
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        e.preventDefault();
        deps.videoRef.value.currentTime = deps.videoDuration.value * (Number.parseInt(e.key) / 10);
        deps.showControls();
        break;
    }
  }

  return { handleKeyDown };
}
