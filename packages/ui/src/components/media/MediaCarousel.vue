<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { ref } from 'vue';
import { vFadeOnLoad } from '../../directives/fadeOnLoad';
import { blurhashStyle } from '../../utils/blurhash';

import 'swiper/css';
import 'swiper/css/pagination';

interface Props {
  attachments: MediaAttachment[];
  sensitive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sensitive: false,
});

const emit = defineEmits<{
  mediaClick: [attachment: MediaAttachment, index: number];
}>();

const revealed = ref(!props.sensitive);
const swiperInstance = ref<SwiperType | null>(null);
const activeIndex = ref(0);

const modules = [Pagination];

function toggleReveal() {
  revealed.value = !revealed.value;
}

function onSwiper(swiper: SwiperType) {
  swiperInstance.value = swiper;
}

function onSlideChange(swiper: SwiperType) {
  activeIndex.value = swiper.activeIndex;
}

function slidePrev() {
  swiperInstance.value?.slidePrev();
}

function slideNext() {
  swiperInstance.value?.slideNext();
}

function handleMediaClick(attachment: MediaAttachment, index: number) {
  emit('mediaClick', attachment, index);
}

const isBeginning = ref(true);
const isEnd = ref(false);

function updateNavState(swiper: SwiperType) {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
}

function focalPointStyle(attachment: MediaAttachment): Record<string, string> {
  const focus = attachment.meta?.focus;
  if (!focus)
    return {};
  const x = ((focus.x + 1) / 2) * 100;
  const y = ((1 - focus.y) / 2) * 100;
  return { objectPosition: `${x.toFixed(1)}% ${y.toFixed(1)}%` };
}
</script>

<template>
  <div v-if="attachments.length > 0" class="relative group">
    <!-- Sensitive content overlay -->
    <div
      v-if="sensitive && !revealed"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-muted cursor-pointer"
      @click="toggleReveal"
    >
      <svg class="w-8 h-8 text-muted-foreground/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
      <span class="text-sm text-muted-foreground font-medium">Sensitive content</span>
      <span class="text-xs text-muted-foreground/60 mt-1">Click to reveal</span>
    </div>

    <!-- Swiper Carousel -->
    <div class="rounded-xl overflow-hidden" :class="{ 'blur-xl': sensitive && !revealed }">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :pagination="{ clickable: true }"
        class="media-carousel"
        @swiper="onSwiper"
        @slide-change="(swiper: any) => { onSlideChange(swiper); updateNavState(swiper); }"
        @init="updateNavState"
      >
        <SwiperSlide
          v-for="(attachment, index) in attachments"
          :key="attachment.id"
        >
          <button
            type="button"
            class="w-full aspect-[16/9] relative bg-muted cursor-pointer"
            :style="blurhashStyle(attachment.blurhash)"
            @click="handleMediaClick(attachment, index)"
          >
            <!-- Image -->
            <img
              v-if="attachment.type === 'image'"
              v-fade-on-load
              :src="attachment.previewUrl || attachment.url || ''"
              :alt="attachment.description || 'Image'"
              class="w-full h-full object-cover"
              :style="focalPointStyle(attachment)"
              loading="lazy"
            >

            <!-- Video -->
            <div
              v-else-if="attachment.type === 'video' || attachment.type === 'gifv'"
              class="w-full h-full relative"
            >
              <img
                v-fade-on-load
                :src="attachment.previewUrl"
                :alt="attachment.description || 'Video'"
                class="w-full h-full object-cover"
                :style="focalPointStyle(attachment)"
                loading="lazy"
              >
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div
                v-if="attachment.type === 'gifv'"
                class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded"
              >
                GIF
              </div>
            </div>

            <!-- Audio -->
            <div
              v-else-if="attachment.type === 'audio'"
              class="w-full h-full flex items-center justify-center bg-accent"
            >
              <svg class="w-12 h-12 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>

            <!-- Alt text indicator -->
            <div
              v-if="attachment.description"
              class="absolute bottom-8 left-2 px-1 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded"
            >
              ALT
            </div>
          </button>
        </SwiperSlide>
      </Swiper>

      <!-- Custom Navigation Buttons -->
      <button
        v-if="attachments.length > 1 && !isBeginning"
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        @click="slidePrev"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="attachments.length > 1 && !isEnd"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        @click="slideNext"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Slide counter -->
      <div
        v-if="attachments.length > 1"
        class="absolute top-2 right-2 z-10 px-2 py-1 bg-black/60 text-white text-xs rounded-full font-medium"
      >
        {{ activeIndex + 1 }} / {{ attachments.length }}
      </div>
    </div>

    <!-- Hide button when revealed -->
    <button
      v-if="sensitive && revealed"
      type="button"
      class="absolute top-2 left-2 z-10 px-2 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70 transition-colors cursor-pointer"
      @click="toggleReveal"
    >
      Hide
    </button>
  </div>
</template>

<style>
.media-carousel {
  --swiper-pagination-color: white;
  --swiper-pagination-bullet-inactive-color: rgba(255, 255, 255, 0.5);
  --swiper-pagination-bullet-inactive-opacity: 1;
}

.media-carousel .swiper-pagination {
  bottom: 8px !important;
}

.media-carousel .swiper-pagination-bullet {
  width: 6px;
  height: 6px;
  margin: 0 3px !important;
}
</style>
