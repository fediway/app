<script setup lang="ts">
import type { Component } from 'vue';
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
import { computed, ref } from 'vue';
import VideoPlayerSeekBar from './VideoPlayerSeekBar.vue';

interface Props {
  paused: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  progress: number;
  isSeeking: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  volume: number;
  playbackSpeed: number;
  showCaptions: boolean;
  hasCaptions: boolean;
  canPiP: boolean;
  controlsVisible: boolean;
}

interface Emits {
  (e: 'togglePlay'): void;
  (e: 'toggleMute'): void;
  (e: 'toggleFullscreen'): void;
  (e: 'togglePip'): void;
  (e: 'toggleCaptions'): void;
  (e: 'cycleSpeed'): void;
  (e: 'seekStart', event: MouseEvent | TouchEvent): void;
  (e: 'setVolume', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const volumeIcon = computed<Component>(() => {
  if (props.isMuted || props.volume === 0)
    return PhSpeakerSlash;
  if (props.volume < 0.5)
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

function sliderToVolume(ratio: number): number {
  return ratio * ratio;
}
function volumeToSlider(vol: number): number {
  return Math.sqrt(vol);
}

const volumeSliderPercent = computed(() =>
  props.isMuted ? 0 : volumeToSlider(props.volume) * 100,
);

const showVolumeSlider = ref(false);
const isDraggingVolume = ref(false);
const volumeSliderRef = ref<HTMLElement>();

function applyVolumeFromPointer(e: PointerEvent) {
  const el = volumeSliderRef.value;
  if (!el)
    return;
  const rect = el.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
  emit('setVolume', sliderToVolume(ratio));
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
  let newVol = props.volume;
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      e.preventDefault();
      newVol = Math.min(1, props.volume + step);
      break;
    case 'ArrowDown':
    case 'ArrowLeft':
      e.preventDefault();
      newVol = Math.max(0, props.volume - step);
      break;
    case 'PageUp':
      e.preventDefault();
      newVol = Math.min(1, props.volume + bigStep);
      break;
    case 'PageDown':
      e.preventDefault();
      newVol = Math.max(0, props.volume - bigStep);
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
  emit('setVolume', newVol);
}
</script>

<template>
  <div class="relative z-10 space-y-2 px-3 pb-3" @click.stop @touchend.stop>
    <VideoPlayerSeekBar
      :progress="progress"
      :buffered="buffered"
      :current-time="currentTime"
      :duration="duration"
      :is-seeking="isSeeking"
      @seek-start="emit('seekStart', $event)"
    />

    <div class="flex items-center gap-1 text-white">
      <button
        type="button"
        class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
        :aria-label="paused ? 'Play' : 'Pause'"
        @click.stop="emit('togglePlay')"
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
          @click.stop="emit('toggleMute')"
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
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>

      <div class="flex-1" />

      <button
        type="button"
        class="flex h-7 cursor-pointer items-center justify-center rounded-full bg-white/20 px-2 text-xs font-semibold tabular-nums transition-all hover:bg-white/30 active:scale-90"
        aria-label="Playback speed"
        @click.stop="emit('cycleSpeed')"
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
        @click.stop="emit('toggleCaptions')"
      >
        <PhClosedCaptioning :size="20" :weight="showCaptions ? 'fill' : 'regular'" />
      </button>

      <button
        v-if="canPiP"
        type="button"
        class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
        aria-label="Picture in picture"
        @click.stop="emit('togglePip')"
      >
        <PhPictureInPicture :size="20" />
      </button>

      <button
        type="button"
        class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-transform active:scale-90"
        :aria-label="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
        @click.stop="emit('toggleFullscreen')"
      >
        <PhArrowsIn v-if="isFullscreen" :size="20" />
        <PhArrowsOut v-else :size="20" />
      </button>
    </div>
  </div>
</template>
