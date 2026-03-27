<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import { computed, defineAsyncComponent, ref } from 'vue';
import { vFadeOnLoad } from '../../directives/fadeOnLoad';
import { blurhashStyle } from '../../utils/blurhash';

const props = withDefaults(defineProps<Props>(), {
  sensitive: false,
  maxGridItems: 4,
  forceCarousel: false,
});

const emit = defineEmits<{
  mediaClick: [attachment: MediaAttachment, index: number];
}>();

const MediaCarousel = defineAsyncComponent(() => import('./MediaCarousel.vue'));

interface Props {
  attachments: MediaAttachment[];
  sensitive?: boolean;
  /** Maximum number of items in grid before switching to carousel */
  maxGridItems?: number;
  /** Force carousel mode regardless of count */
  forceCarousel?: boolean;
}

const revealed = ref(!props.sensitive);

// ── Computed ────────────────────────────────────────────

const visualAttachments = computed(() =>
  props.attachments.filter(a => a.type !== 'audio'),
);

const audioAttachments = computed(() =>
  props.attachments.filter(a => a.type === 'audio'),
);

const gridItems = computed(() =>
  visualAttachments.value.slice(0, props.maxGridItems),
);

const remainingCount = computed(() =>
  Math.max(0, visualAttachments.value.length - props.maxGridItems),
);

type DisplayMode = 'empty' | 'single' | 'grid' | 'carousel';

const displayMode = computed<DisplayMode>(() => {
  const count = visualAttachments.value.length;
  if (count === 0)
    return 'empty';
  if (count === 1)
    return 'single';
  if (count <= props.maxGridItems && !props.forceCarousel)
    return 'grid';
  if (props.forceCarousel && count <= 1)
    return count === 0 ? 'empty' : 'single';
  return 'carousel';
});

// ── Single image aspect ratio ───────────────────────────

const MIN_ASPECT = 0.8; // 4:5 portrait
const MAX_ASPECT = 1.78; // 16:9 landscape

const singleImageStyle = computed(() => {
  if (visualAttachments.value.length !== 1)
    return {};
  const att = visualAttachments.value[0]!;
  const meta = att.meta?.original ?? att.meta?.small;
  let aspect = 16 / 9;
  if (meta && 'aspect' in meta && typeof meta.aspect === 'number') {
    aspect = Math.max(MIN_ASPECT, Math.min(MAX_ASPECT, meta.aspect));
  }
  return { aspectRatio: `${aspect}` };
});

// ── Grid layout classes ─────────────────────────────────

const gridLayoutClass = computed(() => {
  const count = gridItems.value.length;
  if (count === 2)
    return 'grid-cols-2';
  if (count === 3)
    return 'grid-cols-2 grid-rows-2';
  if (count === 4)
    return 'grid-cols-2 grid-rows-2';
  return '';
});

const gridContainerStyle = computed(() => {
  const count = gridItems.value.length;
  if (count >= 2)
    return { height: '320px' };
  return {};
});

// ── Per-cell helpers ────────────────────────────────────

function cellStyle(index: number): Record<string, string> {
  const count = gridItems.value.length;
  if (count === 3 && index === 0) {
    return { gridRow: '1 / -1' };
  }
  return {};
}

function cornerClass(index: number): string {
  const count = gridItems.value.length;
  if (count === 1)
    return 'rounded-xl';
  if (count === 2)
    return index === 0 ? 'rounded-l-xl' : 'rounded-r-xl';
  if (count === 3) {
    if (index === 0)
      return 'rounded-l-xl';
    if (index === 1)
      return 'rounded-tr-xl';
    return 'rounded-br-xl';
  }
  // count === 4
  if (index === 0)
    return 'rounded-tl-xl';
  if (index === 1)
    return 'rounded-tr-xl';
  if (index === 2)
    return 'rounded-bl-xl';
  return 'rounded-br-xl';
}

// ── Focal point ─────────────────────────────────────────

function focalPointStyle(attachment: MediaAttachment): Record<string, string> {
  const focus = attachment.meta?.focus;
  if (!focus)
    return {};
  const x = ((focus.x + 1) / 2) * 100;
  const y = ((1 - focus.y) / 2) * 100;
  return { objectPosition: `${x.toFixed(1)}% ${y.toFixed(1)}%` };
}

// ── Image source with blurhash fallback ─────────────────

function imageSrc(attachment: MediaAttachment): string {
  if (attachment.previewUrl)
    return attachment.previewUrl;
  if (attachment.url)
    return attachment.url;
  return '';
}

// ── Sensitive toggle ────────────────────────────────────

function toggleReveal() {
  revealed.value = !revealed.value;
}
</script>

<template>
  <!-- Empty -->
  <div v-if="displayMode === 'empty' && audioAttachments.length === 0" />

  <div v-else>
    <!-- Carousel (5+) -->
    <MediaCarousel
      v-if="displayMode === 'carousel'"
      :attachments="visualAttachments"
      :sensitive="sensitive"
      @media-click="(att, idx) => emit('mediaClick', att, idx)"
    />

    <!-- Grid / Single (1-4) -->
    <div v-else-if="displayMode !== 'empty'" class="relative">
      <!-- Sensitive content overlay -->
      <button
        v-if="sensitive && !revealed"
        type="button"
        aria-label="Reveal sensitive content"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-muted cursor-pointer"
        @click="toggleReveal"
      >
        <svg aria-hidden="true" class="w-8 h-8 text-muted-foreground/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
        <span class="text-sm text-muted-foreground font-medium">Sensitive content</span>
        <span class="text-xs text-muted-foreground/60 mt-1">Click to reveal</span>
      </button>

      <!-- Grid container -->
      <div
        class="grid gap-0.5 overflow-hidden rounded-xl"
        :class="[gridLayoutClass, { 'blur-xl': sensitive && !revealed }]"
        :style="[gridContainerStyle, displayMode === 'single' ? singleImageStyle : {}]"
      >
        <button
          v-for="(attachment, index) in gridItems"
          :key="attachment.id"
          type="button"
          class="relative overflow-hidden bg-muted cursor-pointer h-full w-full"
          :class="[cornerClass(index)]"
          :style="{ ...cellStyle(index), ...blurhashStyle(attachment.blurhash) }"
          @click="emit('mediaClick', attachment, index)"
        >
          <!-- Image -->
          <img
            v-if="attachment.type === 'image'"
            v-fade-on-load
            :src="imageSrc(attachment)"
            :alt="attachment.description || 'Image'"
            class="w-full h-full object-cover"
            :style="focalPointStyle(attachment)"
            loading="lazy"
            decoding="async"
          >

          <!-- Video thumbnail -->
          <div
            v-else-if="attachment.type === 'video'"
            class="w-full h-full relative"
          >
            <img
              v-fade-on-load
              :src="imageSrc(attachment)"
              :alt="attachment.description || 'Video'"
              class="w-full h-full object-cover"
              :style="focalPointStyle(attachment)"
              loading="lazy"
              decoding="async"
            >
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- GifV thumbnail -->
          <div
            v-else-if="attachment.type === 'gifv'"
            class="w-full h-full relative"
          >
            <img
              v-fade-on-load
              :src="imageSrc(attachment)"
              :alt="attachment.description || 'GIF'"
              class="w-full h-full object-cover"
              :style="focalPointStyle(attachment)"
              loading="lazy"
              decoding="async"
            >
            <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded">
              GIF
            </div>
          </div>

          <!-- ALT badge -->
          <div
            v-if="attachment.description"
            class="absolute bottom-2 left-2 px-1 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded"
          >
            ALT
          </div>

          <!-- "+N" overlay on last grid item -->
          <div
            v-if="remainingCount > 0 && index === gridItems.length - 1"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <span class="text-white text-2xl font-bold">+{{ remainingCount }}</span>
          </div>
        </button>
      </div>

      <!-- Hide button when sensitive and revealed -->
      <button
        v-if="sensitive && revealed"
        type="button"
        aria-label="Hide sensitive content"
        class="absolute top-2 right-2 z-10 px-2 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70 transition-colors cursor-pointer"
        @click="toggleReveal"
      >
        Hide
      </button>
    </div>

    <!-- Audio attachments (rendered below grid) -->
    <div v-if="audioAttachments.length > 0" class="mt-2 space-y-2">
      <div
        v-for="audio in audioAttachments"
        :key="audio.id"
        class="flex items-center gap-3 p-3 bg-muted rounded-xl"
      >
        <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">
            {{ audio.description || 'Audio' }}
          </p>
          <audio :src="audio.url || ''" controls class="w-full mt-1" />
        </div>
      </div>
    </div>
  </div>
</template>
