<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  PhArrowsClockwise,
  PhBookmarkSimple,
  PhChat,
  PhCopy,
  PhDotsThree,
  PhFlag,
  PhHeart,
  PhPaperPlaneRight,
  PhProhibit,
  PhSpeakerSlash,
  PhTrash,
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
  /** Whether the current user authored this post */
  isOwnPost?: boolean;
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
  isOwnPost: false,
});

const emit = defineEmits<{
  reply: [];
  reblog: [];
  favourite: [];
  bookmark: [];
  share: [];
  copyLink: [];
  sendMessage: [];
  delete: [];
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
        :aria-label="`${favourited ? 'Unlike' : 'Like'}${favouritesCount ? `, ${favouritesCount} ${favouritesCount === 1 ? 'like' : 'likes'}` : ''}`"
        :aria-pressed="favourited"
        animation="pop"
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
        :aria-label="`${reblogged ? 'Undo repost' : 'Repost'}${reblogsCount ? `, ${reblogsCount} ${reblogsCount === 1 ? 'repost' : 'reposts'}` : ''}`"
        :aria-pressed="reblogged"
        animation="spin"
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
        :aria-label="bookmarked ? 'Unsave' : 'Save'"
        :aria-pressed="bookmarked"
        animation="settle"
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
            <PhCopy :size="16" class="text-muted-foreground" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('sendMessage')">
            <PhPaperPlaneRight :size="16" class="text-muted-foreground" />
            Send as message
          </DropdownMenuItem>

          <!-- Own post actions -->
          <template v-if="isOwnPost">
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive @select="emit('delete')">
              <PhTrash :size="16" />
              Delete post
            </DropdownMenuItem>
          </template>

          <!-- Other user actions -->
          <template v-else>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="emit('mute')">
              <PhSpeakerSlash :size="16" class="text-muted-foreground" />
              Mute user
            </DropdownMenuItem>
            <DropdownMenuItem @select="emit('block')">
              <PhProhibit :size="16" class="text-muted-foreground" />
              Block user
            </DropdownMenuItem>
            <DropdownMenuItem @select="emit('blockDomain')">
              <PhProhibit :size="16" class="text-muted-foreground" />
              Block domain
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem destructive @select="emit('report')">
              <PhFlag :size="16" />
              Report
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
