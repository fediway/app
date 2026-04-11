<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useMediaPreferences } from '../../composables/useMediaPreferences';
import { vFadeOnLoad } from '../../directives/fadeOnLoad';
import { blurhashStyle } from '../../utils/blurhash';
import GifvPlayer from './GifvPlayer.vue';
import VideoPlayer from './VideoPlayer.vue';

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

const { shouldReveal, mediaVisibility } = useMediaPreferences();
const revealed = ref(shouldReveal(props.sensitive));

// Reset reveal state when the preference changes
watch(mediaVisibility, () => {
  revealed.value = shouldReveal(props.sensitive);
});

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

// Use natural aspect ratio clamped to reasonable bounds.
// Images: 4:5 to 16:9 (tighter portrait limit).
// Videos: 9:16 to 16:9 (phone videos allowed taller) + max-height cap.
// The max-height prevents very tall videos from dominating the feed.

const IMAGE_MIN_ASPECT = 0.8; // 4:5 portrait
const VIDEO_MIN_ASPECT = 0.5625; // 9:16 portrait (phone video)
const MAX_ASPECT = 1.78; // 16:9 landscape

function extractAspect(meta: Record<string, unknown> | undefined): number | null {
  if (!meta)
    return null;
  if ('aspect' in meta && typeof meta.aspect === 'number')
    return meta.aspect;
  if ('width' in meta && 'height' in meta
    && typeof meta.width === 'number' && typeof meta.height === 'number'
    && meta.height > 0) {
    return meta.width / meta.height;
  }
  return null;
}

const singleMediaAspect = computed(() => {
  if (visualAttachments.value.length !== 1)
    return 16 / 9;
  const att = visualAttachments.value[0]!;
  const isVideo = att.type === 'video' || att.type === 'gifv';
  const minAspect = isVideo ? VIDEO_MIN_ASPECT : IMAGE_MIN_ASPECT;

  // Try original first, then small — either may have aspect or width/height
  const rawAspect = extractAspect(att.meta?.original as unknown as Record<string, unknown>)
    ?? extractAspect(att.meta?.small as unknown as Record<string, unknown>);

  if (rawAspect) {
    return Math.max(minAspect, Math.min(MAX_ASPECT, rawAspect));
  }
  return 16 / 9;
});

const singleMediaIsVideo = computed(() => {
  if (visualAttachments.value.length !== 1)
    return false;
  const type = visualAttachments.value[0]!.type;
  return type === 'video' || type === 'gifv';
});

const singleImageStyle = computed(() => {
  if (visualAttachments.value.length !== 1)
    return {};
  const style: Record<string, string> = { aspectRatio: `${singleMediaAspect.value}` };
  // Cap height for portrait videos so they don't dominate the feed
  if (singleMediaIsVideo.value && singleMediaAspect.value < 1) {
    style.maxHeight = 'min(70vh, 550px)';
  }
  return style;
});

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

function focalPointStyle(attachment: MediaAttachment): Record<string, string> {
  const focus = attachment.meta?.focus;
  if (!focus)
    return {};
  const x = ((focus.x + 1) / 2) * 100;
  const y = ((1 - focus.y) / 2) * 100;
  return { objectPosition: `${x.toFixed(1)}% ${y.toFixed(1)}%` };
}

function imageSrc(attachment: MediaAttachment): string {
  if (attachment.previewUrl)
    return attachment.previewUrl;
  if (attachment.url)
    return attachment.url;
  return '';
}

function toggleReveal() {
  revealed.value = !revealed.value;
}
</script>

<template>
  <div v-if="displayMode === 'empty' && audioAttachments.length === 0" />

  <div v-else>
    <MediaCarousel
      v-if="displayMode === 'carousel'"
      :attachments="visualAttachments"
      :sensitive="sensitive"
      @media-click="(att, idx) => emit('mediaClick', att, idx)"
    />

    <div v-else-if="displayMode !== 'empty'" class="relative">
      <!-- Content overlay (sensitive or "hide all" preference) -->
      <button
        v-if="!revealed"
        type="button"
        aria-label="Reveal media"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-muted cursor-pointer"
        @click="toggleReveal"
      >
        <svg aria-hidden="true" class="w-8 h-8 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
        <span class="text-sm text-muted-foreground font-medium">{{ sensitive ? 'Sensitive content' : 'Media hidden' }}</span>
        <span class="text-xs text-muted-foreground mt-1">Click to reveal</span>
      </button>

      <div
        class="grid gap-0.5 overflow-hidden rounded-xl"
        :class="[gridLayoutClass, { 'blur-xl': !revealed }]"
        :style="[gridContainerStyle, displayMode === 'single' ? singleImageStyle : {}]"
      >
        <template v-for="(attachment, index) in gridItems" :key="attachment.id">
          <div
            v-if="attachment.type === 'video'"
            class="relative overflow-hidden bg-muted h-full w-full"
            :class="[cornerClass(index)]"
            :style="{ ...cellStyle(index), ...blurhashStyle(attachment.blurhash) }"
          >
            <VideoPlayer
              :src="attachment.url ?? ''"
              :poster="attachment.previewUrl ?? undefined"
              :aspect-ratio="displayMode === 'single' ? singleMediaAspect : undefined"
              :alt="attachment.description || ''"
              :video-id="attachment.id"
              :caption="attachment.description || ''"
              class="size-full"
            />
          </div>

          <div
            v-else-if="attachment.type === 'gifv'"
            class="relative overflow-hidden bg-muted h-full w-full"
            :class="[cornerClass(index)]"
            :style="{ ...cellStyle(index), ...blurhashStyle(attachment.blurhash) }"
          >
            <GifvPlayer
              :src="attachment.url ?? ''"
              :poster="attachment.previewUrl ?? undefined"
              :alt="attachment.description || ''"
              :video-id="attachment.id"
              class="size-full"
            />
          </div>

          <button
            v-else
            type="button"
            class="relative overflow-hidden bg-muted cursor-pointer h-full w-full"
            :class="[cornerClass(index)]"
            :style="{ ...cellStyle(index), ...blurhashStyle(attachment.blurhash) }"
            @click="emit('mediaClick', attachment, index)"
          >
            <img
              v-fade-on-load
              :src="imageSrc(attachment)"
              :alt="attachment.description || 'Image'"
              class="w-full h-full object-cover"
              :style="focalPointStyle(attachment)"
              loading="lazy"
              decoding="async"
            >

            <div
              v-if="attachment.description"
              class="absolute bottom-2 left-2 px-1 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded"
            >
              ALT
            </div>

            <div
              v-if="remainingCount > 0 && index === gridItems.length - 1"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <span class="text-white text-2xl font-bold">+{{ remainingCount }}</span>
            </div>
          </button>
        </template>
      </div>

      <button
        v-if="!shouldReveal(sensitive) && revealed"
        type="button"
        aria-label="Hide sensitive content"
        class="absolute top-2 right-2 z-10 px-2 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70 transition-colors cursor-pointer"
        @click="toggleReveal"
      >
        Hide
      </button>
    </div>

    <div v-if="audioAttachments.length > 0" class="mt-2 space-y-2">
      <div
        v-for="audio in audioAttachments"
        :key="audio.id"
        class="flex items-center gap-3 p-3 bg-muted rounded-xl"
      >
        <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
