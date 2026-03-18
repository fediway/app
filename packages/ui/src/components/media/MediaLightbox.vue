<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
  attachments: MediaAttachment[];
  initialIndex?: number;
  isOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const emit = defineEmits<{
  close: [];
}>();

const currentIndex = ref(props.initialIndex);
const scale = ref(1);
const isDragging = ref(false);
const position = ref({ x: 0, y: 0 });
const dragStart = ref({ x: 0, y: 0 });

const currentAttachment = computed(() => props.attachments[currentIndex.value]);
const hasMultiple = computed(() => props.attachments.length > 1);
const canGoPrev = computed(() => currentIndex.value > 0);
const canGoNext = computed(() => currentIndex.value < props.attachments.length - 1);

// Reset state when opening
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentIndex.value = props.initialIndex;
    resetZoom();
  }
});

watch(() => props.initialIndex, (index) => {
  currentIndex.value = index;
  resetZoom();
});

function resetZoom() {
  scale.value = 1;
  position.value = { x: 0, y: 0 };
}

function goToPrev() {
  if (canGoPrev.value) {
    currentIndex.value--;
    resetZoom();
  }
}

function goToNext() {
  if (canGoNext.value) {
    currentIndex.value++;
    resetZoom();
  }
}

function close() {
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.isOpen)
    return;

  switch (event.key) {
    case 'Escape':
      close();
      break;
    case 'ArrowLeft':
      goToPrev();
      break;
    case 'ArrowRight':
      goToNext();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case '0':
      resetZoom();
      break;
  }
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.5, 4);
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.5, 1);
  if (scale.value === 1) {
    position.value = { x: 0, y: 0 };
  }
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (event.deltaY < 0) {
    zoomIn();
  }
  else {
    zoomOut();
  }
}

function handleMouseDown(event: MouseEvent) {
  if (scale.value > 1) {
    isDragging.value = true;
    dragStart.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y,
    };
  }
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value && scale.value > 1) {
    position.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y,
    };
  }
}

function handleMouseUp() {
  isDragging.value = false;
}

// Touch support for mobile
let touchStartDistance = 0;
let initialScale = 1;

function handleTouchStart(event: TouchEvent) {
  const touch0 = event.touches[0];
  const touch1 = event.touches[1];
  if (event.touches.length === 2 && touch0 && touch1) {
    touchStartDistance = Math.hypot(
      touch0.clientX - touch1.clientX,
      touch0.clientY - touch1.clientY,
    );
    initialScale = scale.value;
  }
  else if (event.touches.length === 1 && touch0 && scale.value > 1) {
    isDragging.value = true;
    dragStart.value = {
      x: touch0.clientX - position.value.x,
      y: touch0.clientY - position.value.y,
    };
  }
}

function handleTouchMove(event: TouchEvent) {
  const touch0 = event.touches[0];
  const touch1 = event.touches[1];
  if (event.touches.length === 2 && touch0 && touch1) {
    event.preventDefault();
    const distance = Math.hypot(
      touch0.clientX - touch1.clientX,
      touch0.clientY - touch1.clientY,
    );
    if (touchStartDistance < 1)
      return;
    const newScale = initialScale * (distance / touchStartDistance);
    scale.value = Math.min(Math.max(newScale, 1), 4);
    if (scale.value === 1) {
      position.value = { x: 0, y: 0 };
    }
  }
  else if (isDragging.value && event.touches.length === 1 && touch0 && scale.value > 1) {
    position.value = {
      x: touch0.clientX - dragStart.value.x,
      y: touch0.clientY - dragStart.value.y,
    };
  }
}

function handleTouchEnd() {
  isDragging.value = false;
  touchStartDistance = 0;
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen && currentAttachment"
        class="fixed inset-0 z-[100] flex items-center justify-center"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/95" />

        <!-- Close button -->
        <button
          type="button"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          @click="close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Counter -->
        <div
          v-if="hasMultiple"
          class="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-black/50 text-white text-sm rounded-full"
        >
          {{ currentIndex + 1 }} / {{ attachments.length }}
        </div>

        <!-- Zoom controls -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 bg-black/50 rounded-full">
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="scale <= 1"
            @click="zoomOut"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span class="text-white text-sm min-w-[3rem] text-center">{{ Math.round(scale * 100) }}%</span>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="scale >= 4"
            @click="zoomIn"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Previous button -->
        <button
          v-if="hasMultiple && canGoPrev"
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          @click="goToPrev"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Next button -->
        <button
          v-if="hasMultiple && canGoNext"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          @click="goToNext"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Media content -->
        <div
          class="relative max-w-[90vw] max-h-[85vh] select-none"
          :class="{ 'cursor-grab': scale > 1, 'cursor-grabbing': isDragging }"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Image -->
          <img
            v-if="currentAttachment.type === 'image'"
            :src="currentAttachment.url || currentAttachment.previewUrl || ''"
            :alt="currentAttachment.description || 'Image'"
            class="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-100"
            :style="{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }"
            draggable="false"
          >

          <!-- Video -->
          <video
            v-else-if="currentAttachment.type === 'video' || currentAttachment.type === 'gifv'"
            :src="currentAttachment.url || ''"
            :poster="currentAttachment.previewUrl"
            class="max-w-[90vw] max-h-[85vh] object-contain"
            controls
            :autoplay="currentAttachment.type === 'gifv'"
            :loop="currentAttachment.type === 'gifv'"
            :muted="currentAttachment.type === 'gifv'"
          />

          <!-- Audio -->
          <div
            v-else-if="currentAttachment.type === 'audio'"
            class="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg"
          >
            <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <audio :src="currentAttachment.url || ''" controls class="w-80" />
          </div>
        </div>

        <!-- Alt text / Description -->
        <div
          v-if="currentAttachment.description"
          class="absolute bottom-16 left-4 right-4 z-10 mx-auto max-w-2xl"
        >
          <div class="px-4 py-2 bg-black/70 text-white text-sm rounded-lg">
            <span class="font-medium text-white/60 mr-2">ALT:</span>
            {{ currentAttachment.description }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
