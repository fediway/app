<script setup lang="ts">
import {
  PhPause,
  PhPlay,
} from '@phosphor-icons/vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useMediaPlayerState } from '../../composables/useMediaPlayerState';
import { useMediaPreferences } from '../../composables/useMediaPreferences';
import { useVideoAutoplay } from '../../composables/useVideoAutoplay';
import { useVideoPlayerKeys } from '../../composables/useVideoPlayerKeys';
import VideoPlayerControls from './VideoPlayerControls.vue';

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

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function showControls() {
  controlsVisible.value = true;
  clearTimeout(hideTimer);
  if (!paused.value) {
    hideTimer = setTimeout(() => {
      controlsVisible.value = false;
    }, 3000);
  }
}

function hideControls() {
  if (!paused.value) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      controlsVisible.value = false;
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

watch(volume, (v) => {
  if (videoRef.value)
    videoRef.value.volume = v;
}, { immediate: true });

function handleSetVolume(v: number) {
  const clamped = Math.max(0, Math.min(1, v));
  setVolume(clamped);
  if (videoRef.value)
    videoRef.value.volume = clamped;
  if (isMuted.value && clamped > 0)
    unmute();
}

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

function seekTo(event: MouseEvent | TouchEvent, seekBarEl: HTMLElement) {
  if (!videoRef.value)
    return;
  const rect = seekBarEl.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0]!.clientX : event.clientX;
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  videoRef.value.currentTime = videoDuration.value * ratio;
  currentTime.value = videoRef.value.currentTime;
  showControls();
}

function handleSeekStart(event: MouseEvent | TouchEvent) {
  const seekBarEl = (event.currentTarget || event.target) as HTMLElement;
  isSeeking.value = true;
  seekTo(event, seekBarEl);

  const isTouch = 'touches' in event;
  const moveEvent = isTouch ? 'touchmove' : 'mousemove';
  const endEvent = isTouch ? 'touchend' : 'mouseup';

  function onMove(e: Event) {
    seekTo(e as MouseEvent | TouchEvent, seekBarEl);
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

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

function handleVideoClick(e: MouseEvent) {
  e.stopPropagation();
  if (isTouchDevice)
    return;
  togglePlay();
}

function handleVideoTouch(e: TouchEvent) {
  e.stopPropagation();
}

function handleVideoTouchEnd(e: TouchEvent) {
  e.stopPropagation();
  e.preventDefault();

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

const { handleKeyDown } = useVideoPlayerKeys({
  videoRef,
  volume,
  videoDuration,
  hasCaptions,
  togglePlay,
  toggleMute,
  toggleFullscreen,
  toggleCaptions,
  seekBy,
  setVolume: handleSetVolume,
  showControls,
});

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

      <VideoPlayerControls
        :paused="paused"
        :current-time="currentTime"
        :duration="videoDuration"
        :buffered="buffered"
        :progress="progress"
        :is-seeking="isSeeking"
        :is-fullscreen="isFullscreen"
        :is-muted="isMuted"
        :volume="volume"
        :playback-speed="playbackSpeed"
        :show-captions="showCaptions"
        :has-captions="hasCaptions"
        :can-pi-p="canPiP"
        :controls-visible="controlsVisible"
        @toggle-play="togglePlay"
        @toggle-mute="toggleMute"
        @toggle-fullscreen="toggleFullscreen"
        @toggle-pip="togglePiP"
        @toggle-captions="toggleCaptions"
        @cycle-speed="cycleSpeed"
        @seek-start="handleSeekStart"
        @set-volume="handleSetVolume"
      />
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
