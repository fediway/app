<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  PhArrowsClockwise,
  PhBookmarkSimple,
  PhChat,
  PhDotsThree,
  PhHeart,
} from '@phosphor-icons/vue';
import { computed } from 'vue';
import { cn } from '../../../lib/utils';
import { ButtonAction } from '../../ui/button-action';

interface Props {
  favouritesCount?: number;
  repliesCount?: number;
  reblogsCount?: number;
  favourited?: boolean;
  replied?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  /** Direct messages and private posts cannot be boosted */
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  favouritesCount: 0,
  repliesCount: 0,
  reblogsCount: 0,
  favourited: false,
  replied: false,
  reblogged: false,
  bookmarked: false,
  visibility: 'public',
});

const emit = defineEmits<{
  favourite: [];
  reply: [];
  reblog: [];
  bookmark: [];
  more: [];
}>();

const canReblog = computed(() =>
  props.visibility !== 'direct' && props.visibility !== 'private',
);
</script>

<template>
  <div
    data-slot="action-bar"
    :class="cn('flex items-center justify-between', props.class)"
  >
    <!-- Left cluster: favourite, reply, reblog (each fixed width to keep alignment) -->
    <div class="flex items-center gap-2">
      <ButtonAction
        :count="favouritesCount || null"
        class="w-[60px]"
        :class="{ 'text-red hover:text-red': favourited }"
        @click="emit('favourite')"
      >
        <PhHeart :size="20" :weight="favourited ? 'fill' : 'regular'" />
      </ButtonAction>

      <ButtonAction
        :count="repliesCount || null"
        class="w-[60px]"
        :class="{ 'text-blue hover:text-blue': replied }"
        @click="emit('reply')"
      >
        <PhChat :size="20" :weight="replied ? 'fill' : 'regular'" />
      </ButtonAction>

      <ButtonAction
        :count="reblogsCount || null"
        class="w-[60px]"
        :class="{ 'text-green hover:text-green': reblogged, 'disabled:opacity-40': !canReblog }"
        :disabled="!canReblog"
        @click="canReblog && emit('reblog')"
      >
        <PhArrowsClockwise :size="20" />
      </ButtonAction>
    </div>

    <!-- Right cluster: bookmark, more -->
    <div class="flex items-center gap-[6px]">
      <ButtonAction
        :class="{ 'text-yellow hover:text-yellow': bookmarked }"
        @click="emit('bookmark')"
      >
        <PhBookmarkSimple :size="20" :weight="bookmarked ? 'fill' : 'regular'" />
      </ButtonAction>

      <ButtonAction @click="emit('more')">
        <PhDotsThree :size="20" />
      </ButtonAction>
    </div>
  </div>
</template>
