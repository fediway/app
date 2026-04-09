<script setup lang="ts">
interface Props {
  progress: number;
  buffered: number;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
}

interface Emits {
  (e: 'seekStart', event: MouseEvent | TouchEvent): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
</script>

<template>
  <div
    class="group/seek relative h-1 cursor-pointer rounded-full bg-white/30 transition-[height] duration-150 hover:h-2"
    :class="{ 'h-2': isSeeking }"
    role="slider"
    :aria-label="`Seek: ${formatTime(currentTime)} of ${formatTime(duration)}`"
    :aria-valuenow="Math.round(currentTime)"
    :aria-valuemin="0"
    :aria-valuemax="Math.round(duration)"
    :aria-valuetext="`${formatTime(currentTime)} of ${formatTime(duration)}`"
    @mousedown.prevent="emit('seekStart', $event)"
    @touchstart.prevent="emit('seekStart', $event)"
  >
    <div class="absolute inset-y-0 left-0 rounded-full bg-white/30" :style="{ width: `${buffered}%` }" />
    <div class="absolute inset-y-0 left-0 rounded-full bg-white" :style="{ width: `${progress}%` }" />
    <div
      class="absolute top-1/2 size-3.5 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover/seek:opacity-100"
      :class="{ '!opacity-100': isSeeking }"
      :style="{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }"
    />
  </div>
</template>
