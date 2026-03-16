<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  PhBookmarkSimple,
  PhChatCircle,
  PhDotsThree,
  PhHeart,
  PhRepeat,
} from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';
import { ButtonAction } from '../../ui/button-action';

interface Props {
  favouritesCount?: number;
  repliesCount?: number;
  reblogsCount?: number;
  favourited?: boolean;
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

const canReblog = $computed(() =>
  props.visibility !== 'direct' && props.visibility !== 'private',
);
</script>

<template>
  <div
    data-slot="action-bar"
    :class="cn('flex items-center justify-between', props.class)"
  >
    <!-- Left cluster: reply, reblog, favourite (each fixed width to keep alignment) -->
    <div class="flex items-center gap-2">
      <ButtonAction
        :count="repliesCount || null"
        class="w-[60px]"
        @click="emit('reply')"
      >
        <PhChatCircle :size="20" />
      </ButtonAction>

      <ButtonAction
        :count="reblogsCount || null"
        class="w-[60px]"
        :class="{ 'text-green hover:text-green': reblogged, 'disabled:opacity-40': !canReblog }"
        :disabled="!canReblog"
        @click="canReblog && emit('reblog')"
      >
        <PhRepeat :size="20" />
      </ButtonAction>

      <ButtonAction
        :count="favouritesCount || null"
        class="w-[60px]"
        :class="{ 'text-red hover:text-red': favourited }"
        @click="emit('favourite')"
      >
        <PhHeart :size="20" :weight="favourited ? 'fill' : 'regular'" />
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
