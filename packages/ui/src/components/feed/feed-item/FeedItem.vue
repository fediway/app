<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed, useSlots } from 'vue';
import { cn } from '../../../lib/utils';
import { Avatar } from '../../ui/avatar';
import { RelativeTime } from '../../ui/relative-time';
import { ActionBar } from '../action-bar';

interface Props {
  avatarSrc?: string | null;
  avatarAlt?: string;
  displayName: string;
  handle: string;
  createdAt: string;
  // ActionBar state (pass-through)
  favouritesCount?: number;
  repliesCount?: number;
  reblogsCount?: number;
  favourited?: boolean;
  replied?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  // Reply thread
  hasReplyBelow?: boolean;
  hideActions?: boolean;
  // Separator
  showSeparator?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  avatarSrc: null,
  avatarAlt: 'Avatar',
  favouritesCount: 0,
  repliesCount: 0,
  reblogsCount: 0,
  favourited: false,
  replied: false,
  reblogged: false,
  bookmarked: false,
  visibility: 'public',
  hasReplyBelow: false,
  hideActions: false,
  showSeparator: true,
});

const emit = defineEmits<{
  favourite: [];
  reply: [];
  reblog: [];
  bookmark: [];
  more: [];
}>();

const slots = useSlots();

const actionBarProps = computed(() => ({
  favouritesCount: props.favouritesCount,
  repliesCount: props.repliesCount,
  reblogsCount: props.reblogsCount,
  favourited: props.favourited,
  replied: props.replied,
  reblogged: props.reblogged,
  bookmarked: props.bookmarked,
  visibility: props.visibility,
}));
</script>

<template>
  <article :class="cn('contain-layout-style-paint', props.class)">
    <!-- Pre-header slot (e.g. reblog indicator) -->
    <slot name="pre-header" />

    <div class="flex gap-2 px-5 py-3">
      <!-- Left: avatar + connector -->
      <div class="flex flex-col items-center shrink-0">
        <Avatar :src="avatarSrc" :alt="avatarAlt" size="md" />
        <div v-if="hasReplyBelow" class="w-0.5 flex-1 mt-1 bg-foreground/20 rounded-full" />
      </div>

      <!-- Right: header + content + actions -->
      <div class="min-w-0 flex-1">
        <!-- Header row -->
        <div class="flex items-baseline gap-1 text-base">
          <span class="font-bold text-foreground truncate">{{ displayName }}</span>
          <span class="text-foreground/80 truncate shrink">{{ handle }}</span>
          <RelativeTime :datetime="createdAt" class="text-foreground/60 shrink-0 ml-auto" />
        </div>

        <!-- Content slot -->
        <div class="mt-1">
          <slot />
        </div>

        <!-- Actions: custom slot or default ActionBar -->
        <template v-if="!hideActions">
          <slot v-if="slots.actions" name="actions" />
          <ActionBar
            v-else
            class="mt-2 mb-1"
            v-bind="actionBarProps"
            @favourite="emit('favourite')"
            @reply="emit('reply')"
            @reblog="emit('reblog')"
            @bookmark="emit('bookmark')"
            @more="emit('more')"
          />
        </template>
      </div>
    </div>

    <!-- Separator -->
    <div v-if="showSeparator" class="h-px w-full bg-border" />
  </article>
</template>
