<script setup lang="ts">
import { PhPlay } from '@phosphor-icons/vue';
import { ref } from 'vue';
import { useMediaPreferences } from '../../composables/useMediaPreferences';
import { useVideoAutoplay } from '../../composables/useVideoAutoplay';

interface Props {
  /** Video source URL (MP4 served by Mastodon for gifv type) */
  src: string;
  /** Poster/thumbnail URL */
  poster?: string;
  /** Aspect ratio (width / height) for zero-CLS container */
  aspectRatio?: number;
  /** Alt text for accessibility */
  alt?: string;
  /** Unique ID for autoplay coordination */
  videoId: string;
}

const props = withDefaults(defineProps<Props>(), {
  poster: undefined,
  aspectRatio: undefined,
  alt: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { shouldAutoplayGifs } = useMediaPreferences();
const videoRef = ref<HTMLVideoElement>();
const manuallyPlaying = ref(false);

useVideoAutoplay(videoRef, props.videoId, { enabled: shouldAutoplayGifs });

function handleClick(e: MouseEvent) {
  if (!shouldAutoplayGifs.value) {
    // Manual play/pause when autoplay is off
    e.stopPropagation();
    if (videoRef.value?.paused) {
      videoRef.value.play().catch(() => {});
      manuallyPlaying.value = true;
    }
    else {
      videoRef.value?.pause();
      manuallyPlaying.value = false;
    }
    return;
  }
  emit('click', e);
}
</script>

<template>
  <div
    :data-video-id="videoId"
    class="relative overflow-hidden bg-black"
    :style="aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined"
    @click="handleClick"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      :aria-label="alt || 'Animated image'"
      muted
      loop
      playsinline
      preload="none"
      class="size-full object-cover"
    />

    <!-- Play overlay when autoplay is off and not playing -->
    <div
      v-if="!shouldAutoplayGifs && !manuallyPlaying"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
        <PhPlay :size="20" weight="fill" />
      </div>
    </div>

    <!-- GIF badge -->
    <div class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
      GIF
    </div>
  </div>
</template>
