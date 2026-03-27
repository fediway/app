<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhArrowClockwise, PhX } from '@phosphor-icons/vue';
import { cn } from '../../lib/utils';

interface Props {
  /** Preview image URL (object URL or data URL) */
  previewUrl: string;
  /** Alt text (empty string if none) */
  altText: string;
  /** Upload progress 0-100 */
  progress: number;
  /** Upload status */
  status: 'uploading' | 'complete' | 'error';
  /** Media type */
  type: 'image' | 'video' | 'gifv';
  /** Disabled during submission */
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  remove: [];
  editAlt: [];
  retry: [];
}>();
</script>

<template>
  <div
    :class="cn(
      'relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted',
      props.class,
    )"
  >
    <!-- Thumbnail -->
    <img
      :src="previewUrl"
      alt=""
      decoding="async"
      class="size-full object-cover"
    >

    <!-- Upload progress overlay -->
    <div
      v-if="status === 'uploading'"
      class="absolute inset-0 flex items-center justify-center bg-black/40"
    >
      <svg class="size-10" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="white"
          stroke-opacity="0.3"
          stroke-width="3"
        />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="94.25"
          :stroke-dashoffset="94.25 - (94.25 * progress / 100)"
          class="origin-center -rotate-90"
        />
      </svg>
    </div>

    <!-- Error overlay -->
    <div
      v-if="status === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-black/50"
    >
      <button
        type="button"
        class="rounded-full bg-red p-1.5 text-white transition-opacity hover:opacity-80"
        aria-label="Retry upload"
        :disabled="disabled"
        @click="emit('retry')"
      >
        <PhArrowClockwise :size="16" />
      </button>
    </div>

    <!-- Remove button -->
    <button
      v-if="status !== 'uploading'"
      type="button"
      class="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white transition-opacity hover:bg-black/80"
      aria-label="Remove media"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <PhX :size="14" />
    </button>

    <!-- ALT badge -->
    <button
      v-if="status === 'complete' && type === 'image'"
      type="button"
      class="absolute bottom-1 left-1 rounded px-1 py-0.5 text-[10px] font-bold leading-none transition-opacity"
      :class="altText ? 'bg-blue text-white' : 'bg-black/50 text-white/70'"
      aria-label="Edit alt text"
      :disabled="disabled"
      @click="emit('editAlt')"
    >
      ALT
    </button>
  </div>
</template>
