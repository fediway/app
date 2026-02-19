<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import { computed, ref } from 'vue';
import MediaCarousel from './MediaCarousel.vue';

interface Props {
  attachments: MediaAttachment[];
  sensitive?: boolean;
  /** Maximum number of images to show in grid before switching to carousel */
  maxGridItems?: number;
  /** Force carousel mode regardless of attachment count */
  forceCarousel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sensitive: false,
  maxGridItems: 4,
  forceCarousel: false,
});

const emit = defineEmits<{
  mediaClick: [attachment: MediaAttachment, index: number];
}>();

const revealed = ref(!props.sensitive);

// Use carousel when there's more than 1 image
const useCarousel = computed(() => {
  return props.attachments.length > 1;
});

// For grid mode, limit to maxGridItems
const gridAttachments = computed(() => {
  return props.attachments.slice(0, props.maxGridItems);
});

// Count of remaining items not shown in grid
const remainingCount = computed(() => {
  return Math.max(0, props.attachments.length - props.maxGridItems);
});

function toggleReveal() {
  revealed.value = !revealed.value;
}

// Grid layout based on number of attachments
const gridClass = computed(() => {
  const count = gridAttachments.value.length;
  if (count === 1)
    return 'grid-cols-1';
  if (count === 2)
    return 'grid-cols-2';
  if (count === 3)
    return 'grid-cols-2';
  return 'grid-cols-2';
});

function attachmentClass(index: number) {
  const count = gridAttachments.value.length;
  if (count === 1)
    return 'col-span-1 aspect-[16/9]';
  if (count === 2)
    return 'aspect-square';
  if (count === 3 && index === 0)
    return 'row-span-2 aspect-[3/4]';
  if (count === 3)
    return 'aspect-square';
  return 'aspect-square';
}

function handleCarouselClick(attachment: MediaAttachment, index: number) {
  emit('mediaClick', attachment, index);
}
</script>

<template>
  <!-- Carousel mode for many images -->
  <MediaCarousel
    v-if="useCarousel"
    :attachments="attachments"
    :sensitive="sensitive"
    @media-click="handleCarouselClick"
  />

  <!-- Grid mode for few images -->
  <div v-else class="relative">
    <!-- Sensitive content overlay -->
    <div
      v-if="sensitive && !revealed"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 cursor-pointer"
      @click="toggleReveal"
    >
      <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
      <span class="text-sm text-gray-500 font-medium">Sensitive content</span>
      <span class="text-xs text-gray-400 mt-1">Click to reveal</span>
    </div>

    <!-- Media grid -->
    <div
      class="grid gap-0.5 overflow-hidden" :class="[
        gridClass,
        { 'blur-xl': sensitive && !revealed },
      ]"
    >
      <button
        v-for="(attachment, index) in gridAttachments"
        :key="attachment.id"
        type="button"
        class="relative bg-gray-100 overflow-hidden cursor-pointer" :class="[
          attachmentClass(index),
        ]"
        @click="emit('mediaClick', attachment, index)"
      >
        <!-- Image -->
        <img
          v-if="attachment.type === 'image'"
          :src="attachment.previewUrl || attachment.url || ''"
          :alt="attachment.description || 'Image'"
          class="w-full h-full object-cover"
          loading="lazy"
        >

        <!-- Video -->
        <div
          v-else-if="attachment.type === 'video' || attachment.type === 'gifv'"
          class="w-full h-full relative"
        >
          <img
            :src="attachment.previewUrl"
            :alt="attachment.description || 'Video'"
            class="w-full h-full object-cover"
            loading="lazy"
          >
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Audio -->
        <div
          v-else-if="attachment.type === 'audio'"
          class="w-full h-full flex items-center justify-center bg-gray-200"
        >
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        <!-- Alt text indicator -->
        <div
          v-if="attachment.description"
          class="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded font-medium"
        >
          ALT
        </div>

        <!-- Remaining count overlay on last item -->
        <div
          v-if="remainingCount > 0 && index === gridAttachments.length - 1"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <span class="text-white text-2xl font-bold">+{{ remainingCount }}</span>
        </div>
      </button>
    </div>

    <!-- Hide button when revealed -->
    <button
      v-if="sensitive && revealed"
      type="button"
      class="absolute top-2 right-2 z-10 px-2 py-1 bg-black/50 text-white text-xs rounded hover:bg-black/70 transition-colors"
      @click="toggleReveal"
    >
      Hide
    </button>
  </div>
</template>

<style scoped>
button,
img {
  border-radius: 0 !important;
}
</style>
