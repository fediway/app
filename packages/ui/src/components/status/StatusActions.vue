<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  PhArrowsClockwise,
  PhBookmarkSimple,
  PhChat,
  PhDotsThree,
  PhFlag,
  PhHeart,
  PhLink,
  PhPaperPlaneRight,
  PhProhibit,
  PhSpeakerSlash,
} from '@phosphor-icons/vue';
import { computed } from 'vue';
import { cn } from '../../lib/utils';
import { ButtonAction } from '../ui/button-action';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Props {
  repliesCount?: number;
  reblogsCount?: number;
  favouritesCount?: number;
  favourited?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  /** Direct messages and private posts cannot be boosted */
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  /** When false, action buttons render muted (logged-out state) */
  authenticated?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  repliesCount: 0,
  reblogsCount: 0,
  favouritesCount: 0,
  favourited: false,
  reblogged: false,
  bookmarked: false,
  visibility: 'public',
  authenticated: true,
});

const emit = defineEmits<{
  reply: [];
  reblog: [];
  favourite: [];
  bookmark: [];
  share: [];
  copyLink: [];
  sendMessage: [];
  mute: [];
  block: [];
  report: [];
  blockDomain: [];
}>();

const canReblog = computed(() =>
  props.visibility !== 'direct' && props.visibility !== 'private',
);
</script>

<template>
  <div
    data-slot="status-actions"
    :class="cn('flex items-center justify-between', !authenticated && 'opacity-50', props.class)"
  >
    <!-- Left cluster: favourite, reply, reblog -->
    <div class="flex items-center gap-2">
      <ButtonAction
        :count="favouritesCount || null"
        :aria-label="`${favourited ? 'Unfavourite' : 'Favourite'}${favouritesCount ? `, ${favouritesCount} ${favouritesCount === 1 ? 'like' : 'likes'}` : ''}`"
        :aria-pressed="favourited"
        class="w-[60px]"
        :class="{ 'text-rose-500 dark:text-rose-500 hover:text-rose-500': favourited }"
        @click="emit('favourite')"
      >
        <PhHeart :size="20" :weight="favourited ? 'fill' : 'regular'" />
      </ButtonAction>

      <ButtonAction
        :count="repliesCount || null"
        :aria-label="`Reply${repliesCount ? `, ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}` : ''}`"
        class="w-[60px]"
        @click="emit('reply')"
      >
        <PhChat :size="20" />
      </ButtonAction>

      <ButtonAction
        :count="reblogsCount || null"
        :aria-label="`${reblogged ? 'Undo boost' : 'Boost'}${reblogsCount ? `, ${reblogsCount} ${reblogsCount === 1 ? 'boost' : 'boosts'}` : ''}`"
        :aria-pressed="reblogged"
        class="w-[60px]"
        :class="{ 'text-green dark:text-green hover:text-green': reblogged, 'disabled:opacity-40': !canReblog }"
        :disabled="!canReblog"
        @click="canReblog && emit('reblog')"
      >
        <PhArrowsClockwise :size="20" />
      </ButtonAction>
    </div>

    <!-- Right cluster: bookmark, more -->
    <div class="flex items-center gap-[6px]">
      <ButtonAction
        :aria-label="bookmarked ? 'Remove bookmark' : 'Bookmark'"
        :aria-pressed="bookmarked"
        :class="{ 'text-yellow dark:text-yellow hover:text-yellow': bookmarked }"
        @click="emit('bookmark')"
      >
        <PhBookmarkSimple :size="20" :weight="bookmarked ? 'fill' : 'regular'" />
      </ButtonAction>

      <!-- More menu -->
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ButtonAction aria-label="More actions">
            <PhDotsThree :size="20" />
          </ButtonAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="end" :side-offset="8">
          <DropdownMenuItem @select="emit('copyLink')">
            <PhLink :size="16" class="text-foreground/60" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('sendMessage')">
            <PhPaperPlaneRight :size="16" class="text-foreground/60" />
            Send as message
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem @select="emit('mute')">
            <PhSpeakerSlash :size="16" class="text-foreground/60" />
            Mute user
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('block')">
            <PhProhibit :size="16" class="text-foreground/60" />
            Block user
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('blockDomain')">
            <PhProhibit :size="16" class="text-foreground/60" />
            Block domain
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem destructive @select="emit('report')">
            <PhFlag :size="16" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
