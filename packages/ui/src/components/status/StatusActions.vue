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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { cn } from '../../lib/utils';
import { ButtonAction } from '../ui/button-action';

interface Props {
  repliesCount?: number;
  reblogsCount?: number;
  favouritesCount?: number;
  favourited?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  /** Direct messages and private posts cannot be boosted */
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
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

const showMoreMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const canReblog = computed(() =>
  props.visibility !== 'direct' && props.visibility !== 'private',
);

function toggleMoreMenu(event: Event) {
  event.stopPropagation();
  showMoreMenu.value = !showMoreMenu.value;
}

function emitAndClose(event: 'copyLink' | 'sendMessage' | 'mute' | 'block' | 'blockDomain' | 'report') {
  emit(event);
  showMoreMenu.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMoreMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div
    data-slot="status-actions"
    :class="cn('flex items-center justify-between', props.class)"
  >
    <!-- Left cluster: favourite, reply, reblog -->
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
        @click="emit('reply')"
      >
        <PhChat :size="20" />
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

      <!-- More menu -->
      <div ref="menuRef" class="relative">
        <ButtonAction @click="toggleMoreMenu">
          <PhDotsThree :size="20" />
        </ButtonAction>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showMoreMenu"
            class="absolute right-0 bottom-full z-50 mb-2 w-48 rounded-xl border border-border bg-card py-1 shadow-lg"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              @click="emitAndClose('copyLink')"
            >
              <PhLink :size="16" class="text-foreground/60" />
              Copy link
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              @click="emitAndClose('sendMessage')"
            >
              <PhPaperPlaneRight :size="16" class="text-foreground/60" />
              Send as message
            </button>
            <div class="my-1 border-t border-border" />
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              @click="emitAndClose('mute')"
            >
              <PhSpeakerSlash :size="16" class="text-foreground/60" />
              Mute user
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              @click="emitAndClose('block')"
            >
              <PhProhibit :size="16" class="text-foreground/60" />
              Block user
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
              @click="emitAndClose('blockDomain')"
            >
              <PhProhibit :size="16" class="text-foreground/60" />
              Block domain
            </button>
            <div class="my-1 border-t border-border" />
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red hover:bg-red-background"
              @click="emitAndClose('report')"
            >
              <PhFlag :size="16" />
              Report
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
