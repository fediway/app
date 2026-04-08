<script setup lang="ts">
import {
  PhArrowsIn,
  PhArrowsOut,
  PhClosedCaptioning,
  PhPause,
  PhPictureInPicture,
  PhPlay,
  PhSpeakerHigh,
  PhSpeakerLow,
  PhSpeakerSlash,
} from '@phosphor-icons/vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useMediaPlayerState } from '../../composables/useMediaPlayerState';
import { useMediaPreferences } from '../../composables/useMediaPreferences';
import { useVideoAutoplay } from '../../composables/useVideoAutoplay';

interface Props {
  src: string;
  poster?: string;
  aspectRatio?: number;
  alt?: string;
  videoId: string;
  duration?: number;
  /** Caption/description text (from attachment.description) */
  caption?: string;
}

const props = withDefaults(defineProps<Props>(), {
  poster: undefined,
  aspectRatio: undefined,
  alt: '',
  duration: 0,
  caption: '',
});

const { isMuted, volume, unmute, mute, setVolume } = useMediaPlayerState();
const { shouldAutoplayVideos } = useMediaPreferences();
const videoRef = ref<HTMLVideoElement>();
const playerRef = ref<HTMLElement>();
const seekBarRef = ref<HTMLElement>();

useVideoAutoplay(videoRef, props.videoId, { enabled: shouldAutoplayVideos });

const paused = ref(true);
const currentTime = ref(0);
const videoDuration = ref(props.duration);
const buffered = ref(0);
const controlsVisible = ref(false);
const isFullscreen = ref(false);
const isSeeking = ref(false);
const playbackSpeed = ref(1);
const showCaptions = ref(false);
const actionFlash = ref<'play' | 'pause' | null>(null);
const seekIndicator = ref<'+5' | '-5' | '+10' | '-10' | null>(null);
const showVolumeSlider = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let seekIndicatorTimer: ReturnType<typeof setTimeout> | undefined;
let actionFlashTimer: ReturnType<typeof setTimeout> | undefined;
let lastTapTime = 0;
let lastTapSide: 'left' | 'right' | null = null;

const SPEED_OPTIONS = [1, 1.25, 1.5, 2, 0.5, 0.75] as const;

const progress = computed(() =>
  videoDuration.value > 0 ? (currentTime.value / videoDuration.value) * 100 : 0,
);

const canPiP = computed(() =>
  typeof document !== 'undefined'
  && 'pictureInPictureEnabled' in document
  && document.pictureInPictureEnabled
  && videoDuration.value > 30,
);

const hasCaptions = computed(() => !!props.caption);

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0)
    return PhSpeakerSlash;
  if (volume.value < 0.5)
    return PhSpeakerLow;
  return PhSpeakerHigh;
});

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function formatSpeed(speed: number): string {
  return speed === 1 ? '1x' : `${speed}x`;
}

function showControls() {
  controlsVisible.value = true;
  clearTimeout(hideTimer);
  if (!paused.value) {
    hideTimer = setTimeout(() => {
      controlsVisible.value = false;
      showVolumeSlider.value = false;
    }, 3000);
  }
}

function hideControls() {
  if (!paused.value) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      controlsVisible.value = false;
      showVolumeSlider.value = false;
    }, 1000);
  }
}

function flashAction(action: 'play' | 'pause') {
  actionFlash.value = action;
  clearTimeout(actionFlashTimer);
  actionFlashTimer = setTimeout(() => {
    actionFlash.value = null;
  }, 500);
}

function togglePlay() {
  if (!videoRef.value)
    return;
  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {});
    flashAction('play');
  }
  else {
    videoRef.value.pause();
    flashAction('pause');
  }
  showControls();
}

function toggleMute() {
  if (isMuted.value)
    unmute();
  else
    mute();
}

watch(isMuted, (muted) => {
  if (videoRef.value)
    videoRef.value.muted = muted;
}, { immediate: true });

const isDraggingVolume = ref(false);
const volumeSliderRef = ref<HTMLElement>();

// Quadratic curve: slider position → actual volume (perceptually linear)
function sliderToVolume(ratio: number): number {
  return ratio * ratio;
}
function volumeToSlider(vol: number): number {
  return Math.sqrt(vol);
}

const volumeSliderPercent = computed(() =>
  isMuted.value ? 0 : volumeToSlider(volume.value) * 100,
);

function applyVolumeFromPointer(e: PointerEvent) {
  const el = volumeSliderRef.value;
  if (!el)
    return;
  const rect = el.getBoundingClientRect();
  // Vertical: bottom = 0, top = 1
  const ratio = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
  const vol = sliderToVolume(ratio);
  setVolume(vol);
  if (videoRef.value)
    videoRef.value.volume = vol;
  if (isMuted.value && vol > 0)
    unmute();
}

function onVolumePointerDown(e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDraggingVolume.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  applyVolumeFromPointer(e);
}

function onVolumePointerMove(e: PointerEvent) {
  if (!isDraggingVolume.value)
    return;
  applyVolumeFromPointer(e);
}

function onVolumePointerUp(e: PointerEvent) {
  if (!isDraggingVolume.value)
    return;
  isDraggingVolume.value = false;
  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
}

function handleVolumeKeyDown(e: KeyboardEvent) {
  const step = 0.05;
  const bigStep = 0.15;
  let newVol = volume.value;
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      e.preventDefault();
      newVol = Math.min(1, volume.value + step);
      break;
    case 'ArrowDown':
    case 'ArrowLeft':
      e.preventDefault();
      newVol = Math.max(0, volume.value - step);
      break;
    case 'PageUp':
      e.preventDefault();
      newVol = Math.min(1, volume.value + bigStep);
      break;
    case 'PageDown':
      e.preventDefault();
      newVol = Math.max(0, volume.value - bigStep);
      break;
    case 'Home':
      e.preventDefault();
      newVol = 0;
      break;
    case 'End':
      e.preventDefault();
      newVol = 1;
      break;
    default:
      return;
  }
  setVolume(newVol);
  if (videoRef.value)
    videoRef.value.volume = newVol;
  if (isMuted.value && newVol > 0)
    unmute();
}

watch(volume, (v) => {
  if (videoRef.value)
    videoRef.value.volume = v;
}, { immediate: true });

function cycleSpeed() {
  const currentIndex = (SPEED_OPTIONS as readonly number[]).indexOf(playbackSpeed.value);
  const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
  playbackSpeed.value = SPEED_OPTIONS[nextIndex]!;
  if (videoRef.value)
    videoRef.value.playbackRate = playbackSpeed.value;
  showControls();
}

function toggleCaptions() {
  showCaptions.value = !showCaptions.value;
}

function seekTo(event: MouseEvent | TouchEvent) {
  if (!videoRef.value || !seekBarRef.value)
    return;
  const rect = seekBarRef.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0]!.clientX : event.clientX;
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  videoRef.value.currentTime = videoDuration.value * ratio;
  currentTime.value = videoRef.value.currentTime;
  showControls();
}

function startSeek(event: MouseEvent | TouchEvent) {
  isSeeking.value = true;
  seekTo(event);

  const isTouch = 'touches' in event;
  const moveEvent = isTouch ? 'touchmove' : 'mousemove';
  const endEvent = isTouch ? 'touchend' : 'mouseup';

  function onMove(e: Event) {
    seekTo(e as MouseEvent | TouchEvent);
  }
  function onEnd() {
    isSeeking.value = false;
    document.removeEventListener(moveEvent, onMove, true);
    document.removeEventListener(endEvent, onEnd, true);
  }

  document.addEventListener(moveEvent, onMove, true);
  document.addEventListener(endEvent, onEnd, true);
}

function seekBy(seconds: number) {
  if (!videoRef.value)
    return;
  videoRef.value.currentTime = Math.max(0, Math.min(videoDuration.value, videoRef.value.currentTime + seconds));

  seekIndicator.value = `${seconds > 0 ? '+' : ''}${seconds}` as typeof seekIndicator.value;
  clearTimeout(seekIndicatorTimer);
  seekIndicatorTimer = setTimeout(() => {
    seekIndicator.value = null;
  }, 600);

  showControls();
}

// Desktop: immediate play/pause. Mobile: single tap = play/pause, double-tap = seek.
const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

function handleVideoClick(e: MouseEvent) {
  e.stopPropagation();

  // On touch devices, use the touch handler instead
  if (isTouchDevice)
    return;

  togglePlay();
}

function handleVideoTouch(e: TouchEvent) {
  // Let the touchend handler manage taps
  e.stopPropagation();
}

function handleVideoTouchEnd(e: TouchEvent) {
  e.stopPropagation();
  e.preventDefault(); // Prevent ghost click

  const now = Date.now();
  const touch = e.changedTouches[0];
  if (!touch)
    return;

  const rect = playerRef.value?.getBoundingClientRect();
  if (!rect)
    return;

  const tapX = touch.clientX - rect.left;
  const side = tapX < rect.width / 2 ? 'left' : 'right';

  if (now - lastTapTime < 300 && lastTapSide === side) {
    seekBy(side === 'left' ? -5 : 5);
    lastTapTime = 0;
    lastTapSide = null;
  }
  else {
    lastTapTime = now;
    lastTapSide = side;
    setTimeout(() => {
      if (lastTapTime === now) {
        togglePlay();
        lastTapTime = 0;
        lastTapSide = null;
      }
    }, 300);
  }
}

function toggleFullscreen() {
  if (!playerRef.value)
    return;
  if (document.fullscreenElement)
    document.exitFullscreen();
  else
    playerRef.value.requestFullscreen().catch(() => {});
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

async function togglePiP() {
  if (!videoRef.value)
    return;
  if (document.pictureInPictureElement)
    await document.exitPictureInPicture();
  else
    await videoRef.value.requestPictureInPicture();
}

function onPlay() {
  paused.value = false;
  showControls();
}
function onPause() {
  paused.value = true;
  controlsVisible.value = true;
  clearTimeout(hideTimer);
}
function onTimeUpdate() {
  if (!videoRef.value || isSeeking.value)
    return;
  currentTime.value = videoRef.value.currentTime;
}
function onLoadedMetadata() {
  if (videoRef.value) {
    videoDuration.value = videoRef.value.duration;
    videoRef.value.volume = volume.value;
    videoRef.value.playbackRate = playbackSpeed.value;
  }
}
function onProgress() {
  if (!videoRef.value || !videoRef.value.buffered.length)
    return;
  buffered.value = (videoRef.value.buffered.end(videoRef.value.buffered.length - 1) / videoDuration.value) * 100;
}

function handleKeyDown(e: KeyboardEvent) {
  if (!videoRef.value)
    return;
  switch (e.key) {
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlay();
      break;
    case 'm':
      e.preventDefault();
      toggleMute();
      break;
    case 'f':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'c':
      e.preventDefault();
      if (hasCaptions.value)
        toggleCaptions();
      break;
    case 'ArrowLeft':
    case 'j':
      e.preventDefault();
      seekBy(e.key === 'j' ? -10 : -5);
      break;
    case 'ArrowRight':
    case 'l':
      e.preventDefault();
      seekBy(e.key === 'l' ? 10 : 5);
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(Math.min(1, volume.value + 0.1));
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(Math.max(0, volume.value - 0.1));
      break;
    case '0': case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9':
      e.preventDefault();
      videoRef.value.currentTime = videoDuration.value * (Number.parseInt(e.key) / 10);
      showControls();
      break;
  }
}

if (typeof document !== 'undefined')
  document.addEventListener('fullscreenchange', onFullscreenChange);

onBeforeUnmount(() => {
  clearTimeout(hideTimer);
  clearTimeout(seekIndicatorTimer);
  clearTimeout(actionFlashTimer);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div
    ref="playerRef"
    :data-video-id="videoId"
    class="group relative overflow-hidden bg-black"
    :class="{ 'cursor-pointer': paused }"
    :style="aspectRatio && !isFullscreen ? { aspectRatio: String(aspectRatio) } : undefined"
    tabindex="0"
    role="region"
    :aria-label="alt || 'Video player'"
    @mouseenter="showControls"
    @mousemove="showControls"
    @mouseleave="hideControls"
    @keydown="handleKeyDown"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      :muted="isMuted"
      playsinline
      preload="none"
      class="size-full object-contain"
      @click="handleVideoClick"
      @touchstart.passive="handleVideoTouch"
      @touchend="handleVideoTouchEnd"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @progress="onProgress"
    />

    <div
      v-if="showCaptions && hasCaptions && !paused"
      class="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-4"
    >
      <div class="max-w-[80%] rounded-lg bg-black/75 px-3 py-1.5 text-center text-sm leading-snug text-white">
        {{ caption }}
      </div>
    </div>

    <Transition name="action-flash">
      <div
        v-if="actionFlash"
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div class="flex size-16 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
          <PhPlay v-if="actionFlash === 'play'" :size="32" weight="fill" />
          <PhPause v-else :size="32" weight="fill" />
        </div>
      </div>
    </Transition>

    <Transition name="seek-flash">
      <div
        v-if="seekIndicator"
        class="pointer-events-none absolute inset-y-0 flex items-center"
        :class="seekIndicator.startsWith('-') ? 'left-0 w-1/3 justify-center' : 'right-0 w-1/3 justify-center'"
      >
        <div class="rounded-full bg-black/40 px-4 py-2 text-lg font-bold text-white backdrop-blur-sm">
          {{ seekIndicator }}s
        </div>
      </div>
    </Transition>

    <div
      class="absolute inset-0 flex flex-col justify-end transition-opacity duration-200"
      :class="controlsVisible || paused ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      @click.self="togglePlay"
    >
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      <div
        v-if="paused && !actionFlash"
        class="absolute inset-0 flex items-center justify-center"
        @click.stop="togglePlay"
      >
        <div class="flex size-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform active:scale-90">
          <PhPlay :size="28" weight="fill" />
        </div>
      </div>

      <div class="relative z-10 space-y-2 px-3 pb-3" @click.stop @touchend.stop>
        <div
          ref="seekBarRef"
          class="group/seek relative h-1 cursor-pointer rounded-full bg-white/30 transition-[height] duration-150 hover:h-2"
          :class="{ 'h-2': isSeeking }"
          role="slider"
          :aria-label="`Seek: ${formatTime(currentTime)} of ${formatTime(videoDuration)}`"
          :aria-valuenow="Math.round(currentTime)"
          :aria-valuemin="0"
          :aria-valuemax="Math.round(videoDuration)"
          :aria-valuetext="`${formatTime(currentTime)} of ${formatTime(videoDuration)}`"
          @mousedown.prevent="startSeek"
          @touchstart.prevent="startSeek"
        >
          <div class="absolute inset-y-0 left-0 rounded-full bg-white/30" :style="{ width: `${buffered}%` }" />
          <div class="absolute inset-y-0 left-0 rounded-full bg-white" :style="{ width: `${progress}%` }" />
          <div
            class="absolute top-1/2 size-3.5 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover/seek:opacity-100"
            :class="{ '!opacity-100': isSeeking }"
            :style="{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }"
          />
        </div>

        <div class="flex items-center gap-1 text-white">
          <button
            type="button"
            class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
            :aria-label="paused ? 'Play' : 'Pause'"
            @click.stop="togglePlay"
          >
            <PhPlay v-if="paused" :size="20" weight="fill" />
            <PhPause v-else :size="20" weight="fill" />
          </button>

          <div
            class="relative"
            @mouseenter="showVolumeSlider = true"
            @mouseleave="!isDraggingVolume && (showVolumeSlider = false)"
          >
            <button
              type="button"
              class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
              :aria-label="isMuted ? 'Unmute' : 'Mute'"
              @click.stop="toggleMute"
            >
              <component :is="volumeIcon" :size="20" />
            </button>

            <Transition name="volume-slider">
              <div
                v-if="showVolumeSlider || isDraggingVolume"
                class="absolute bottom-full left-1/2 hidden pb-2 lg:block"
                style="transform: translateX(-50%)"
                @click.stop
              >
                <div class="rounded-lg bg-black/75 px-1 py-3 backdrop-blur-sm">
                  <!-- Slider track container: 36px wide hit area, 100px tall -->
                  <div
                    ref="volumeSliderRef"
                    class="group/vol relative mx-auto flex h-[88px] w-9 cursor-pointer items-center justify-center select-none"
                    style="touch-action: none"
                    role="slider"
                    aria-label="Volume"
                    aria-orientation="vertical"
                    :aria-valuenow="Math.round(volume * 100)"
                    :aria-valuemin="0"
                    :aria-valuemax="100"
                    :aria-valuetext="`${Math.round(volume * 100)}% volume`"
                    tabindex="0"
                    @pointerdown="onVolumePointerDown"
                    @pointermove="onVolumePointerMove"
                    @pointerup="onVolumePointerUp"
                    @keydown.stop="handleVolumeKeyDown"
                  >
                    <div class="relative h-full w-[3px] rounded-full bg-white/30">
                      <div
                        class="absolute inset-x-0 bottom-0 rounded-full bg-white"
                        :style="{ height: `${volumeSliderPercent}%` }"
                      />
                      <div
                        class="absolute size-3 rounded-full bg-white shadow-md transition-[bottom,scale]"
                        :style="{ bottom: `calc(${volumeSliderPercent}% - 6px)`, left: '-4.5px' }"
                        :class="isDraggingVolume ? 'scale-125' : 'group-hover/vol:scale-110'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <span class="text-xs tabular-nums text-white/80" aria-hidden="true">
            {{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}
          </span>

          <div class="flex-1" />

          <button
            type="button"
            class="flex h-7 cursor-pointer items-center justify-center rounded-full bg-white/20 px-2 text-xs font-semibold tabular-nums transition-all hover:bg-white/30 active:scale-90"
            aria-label="Playback speed"
            @click.stop="cycleSpeed"
          >
            {{ formatSpeed(playbackSpeed) }}
          </button>

          <button
            v-if="hasCaptions"
            type="button"
            class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
            :class="{ 'text-galaxy-400': showCaptions }"
            :aria-label="showCaptions ? 'Hide captions' : 'Show captions'"
            :aria-pressed="showCaptions"
            @click.stop="toggleCaptions"
          >
            <PhClosedCaptioning :size="20" :weight="showCaptions ? 'fill' : 'regular'" />
          </button>

          <button
            v-if="canPiP"
            type="button"
            class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
            aria-label="Picture in picture"
            @click.stop="togglePiP"
          >
            <PhPictureInPicture :size="20" />
          </button>

          <button
            type="button"
            class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
            :aria-label="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
            @click.stop="toggleFullscreen"
          >
            <PhArrowsIn v-if="isFullscreen" :size="20" />
            <PhArrowsOut v-else :size="20" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!controlsVisible && paused && videoDuration > 0"
      class="pointer-events-none absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs tabular-nums text-white"
    >
      {{ formatTime(videoDuration) }}
    </div>
  </div>
</template>

<style>
.action-flash-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.action-flash-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.action-flash-enter-from { opacity: 0; transform: scale(0.8); }
.action-flash-leave-to { opacity: 0; transform: scale(1.3); }

.seek-flash-enter-active,
.seek-flash-leave-active { transition: opacity 0.2s ease; }
.seek-flash-enter-from,
.seek-flash-leave-to { opacity: 0; }

.volume-slider-enter-active { transition: opacity 0.15s ease-out; }
.volume-slider-leave-active { transition: opacity 0.12s ease-in 0.1s; }
.volume-slider-enter-from,
.volume-slider-leave-to { opacity: 0; }
</style>
