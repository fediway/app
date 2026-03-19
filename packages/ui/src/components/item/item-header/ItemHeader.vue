<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { AvatarStackItem } from '../../ui/avatar-stack';
import { PhArrowLeft, PhShareNetwork } from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';
import { AvatarStack } from '../../ui/avatar-stack';
import { AverageRating } from '../../ui/average-rating';
import { Button } from '../../ui/button';

interface Props {
  title: string;
  tagLabel?: string;
  creator?: string;
  year?: number | string;
  duration?: string;
  genres?: string;
  averageRating?: number;
  takesCount?: number;
  posterSrc?: string | null;
  posterAlt?: string;
  synopsis?: string;
  followAvatars?: AvatarStackItem[];
  followLabel?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  tagLabel: undefined,
  creator: undefined,
  year: undefined,
  duration: undefined,
  genres: undefined,
  averageRating: undefined,
  takesCount: undefined,
  posterSrc: null,
  posterAlt: 'Poster',
  synopsis: undefined,
  followAvatars: () => [],
  followLabel: undefined,
});

defineEmits<{
  back: [];
  postTake: [];
  share: [];
}>();

const TRAILING_ZEROS_RE = /\.?0+$/;

function formatCount(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 3).replace(TRAILING_ZEROS_RE, '')}`;
  }
  return n.toLocaleString();
}
</script>

<template>
  <div :class="cn('flex flex-col', props.class)">
    <!-- Back button -->
    <div class="px-5 pt-[45px] pb-2">
      <button
        class="flex size-11 items-center justify-center rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
        aria-label="Go back"
        @click="$emit('back')"
      >
        <PhArrowLeft :size="24" />
      </button>
    </div>

    <!-- Title row -->
    <div class="flex items-center gap-2 px-5">
      <slot name="tag" />
      <h1 class="text-xl font-bold text-foreground">
        {{ title }}
      </h1>
    </div>

    <!-- Meta info -->
    <div class="flex flex-col gap-0.5 px-5 mt-1">
      <p v-if="creator || year" class="text-sm text-foreground/80">
        <template v-if="creator">
          {{ creator }}
        </template>
        <template v-if="creator && year">
          ·
        </template>
        <template v-if="year">
          {{ year }}
        </template>
      </p>
      <p v-if="duration || genres" class="text-sm text-foreground/80">
        <template v-if="duration">
          {{ duration }}
        </template>
        <template v-if="duration && genres">
          ·
        </template>
        <template v-if="genres">
          {{ genres }}
        </template>
      </p>
    </div>

    <!-- Rating + takes count -->
    <div v-if="averageRating != null || takesCount != null" class="flex items-center gap-2 px-5 mt-1">
      <AverageRating v-if="averageRating != null" :value="averageRating" />
      <span v-if="takesCount != null" class="text-sm text-foreground">
        {{ formatCount(takesCount) }} takes
      </span>
    </div>

    <!-- Poster + Synopsis -->
    <div v-if="posterSrc || synopsis" class="flex gap-4 px-5 mt-4">
      <div v-if="posterSrc" class="shrink-0 w-[132px] h-[195px] rounded-sm border border-foreground/10 overflow-hidden">
        <img loading="lazy" :src="posterSrc" :alt="posterAlt" class="size-full object-cover">
      </div>
      <p v-if="synopsis" class="flex-1 text-sm text-foreground leading-normal overflow-hidden">
        {{ synopsis }}
      </p>
    </div>

    <!-- Follow avatars -->
    <div v-if="followAvatars.length > 0" class="px-5 mt-4">
      <AvatarStack :avatars="followAvatars" :label="followLabel" />
    </div>

    <!-- CTA buttons -->
    <div class="flex items-center gap-3 px-5 mt-4">
      <Button class="flex-1" @click="$emit('postTake')">
        Post your take
      </Button>
      <Button variant="secondary" size="icon" @click="$emit('share')">
        <PhShareNetwork :size="20" />
      </Button>
    </div>
  </div>
</template>
