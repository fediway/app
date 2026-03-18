<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhStar } from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';
import { StatusActions } from '../../status';
import { Avatar } from '../../ui/avatar';

interface Props {
  avatarSrc?: string | null;
  avatarAlt?: string;
  displayName: string;
  rating: number;
  timeAgo: string;
  content?: string;
  // StatusActions state (pass-through)
  favouritesCount?: number;
  repliesCount?: number;
  reblogsCount?: number;
  favourited?: boolean;
  replied?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  // Separator
  showSeparator?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  avatarSrc: null,
  avatarAlt: 'Avatar',
  content: '',
  favouritesCount: 0,
  repliesCount: 0,
  reblogsCount: 0,
  favourited: false,
  replied: false,
  reblogged: false,
  bookmarked: false,
  visibility: 'public',
  showSeparator: true,
});

const emit = defineEmits<{
  favourite: [];
  reply: [];
  reblog: [];
  bookmark: [];
  more: [];
}>();
</script>

<template>
  <article :class="cn('contain-layout-style-paint', props.class)">
    <div class="flex gap-2 px-5 py-3">
      <!-- Left: avatar -->
      <div class="shrink-0">
        <Avatar :src="avatarSrc" :alt="avatarAlt" size="md" />
      </div>

      <!-- Right: header + content + actions -->
      <div class="min-w-0 flex-1">
        <!-- Header: name + stars -->
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-base text-foreground truncate">{{ displayName }}</span>
          <div class="flex shrink-0 gap-0.5">
            <PhStar
              v-for="i in 5"
              :key="i"
              :size="20"
              :weight="i <= rating ? 'fill' : 'regular'"
              :class="i <= rating ? 'text-yellow' : 'text-foreground/20'"
            />
          </div>
        </div>

        <!-- Time -->
        <p class="text-sm text-foreground/80">
          {{ timeAgo }}
        </p>

        <!-- Content -->
        <p v-if="content" class="mt-1 text-base text-foreground leading-[22px]">
          {{ content }}
        </p>

        <!-- Actions -->
        <StatusActions
          class="mt-2 mb-1"
          :favourites-count="favouritesCount"
          :replies-count="repliesCount"
          :reblogs-count="reblogsCount"
          :favourited="favourited"
          :reblogged="reblogged"
          :bookmarked="bookmarked"
          :visibility="visibility"
          @favourite="emit('favourite')"
          @reply="emit('reply')"
          @reblog="emit('reblog')"
          @bookmark="emit('bookmark')"
        />
      </div>
    </div>

    <!-- Separator -->
    <div v-if="showSeparator" class="h-px w-full bg-border" />
  </article>
</template>
