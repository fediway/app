<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface Props {
  repliesCount: number;
  reblogsCount: number;
  favouritesCount: number;
  favourited?: boolean;
  reblogged?: boolean;
  bookmarked?: boolean;
  /** Visibility - direct messages can't be boosted */
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
}

const props = withDefaults(defineProps<Props>(), {
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

const canReblog = computed(() => props.visibility !== 'direct' && props.visibility !== 'private');

const TRAILING_ZERO_RE = /\.0$/;

function formatCount(count: number): string {
  if (count === 0)
    return '';
  if (count >= 1000000)
    return `${(count / 1000000).toFixed(1).replace(TRAILING_ZERO_RE, '')}m`;
  if (count >= 1000)
    return `${(count / 1000).toFixed(1).replace(TRAILING_ZERO_RE, '')}k`;
  return count.toString();
}

function toggleMoreMenu(event: Event) {
  event.stopPropagation();
  showMoreMenu.value = !showMoreMenu.value;
}

function handleCopyLink() {
  emit('copyLink');
  showMoreMenu.value = false;
}

function handleSendMessage() {
  emit('sendMessage');
  showMoreMenu.value = false;
}

function handleMute() {
  emit('mute');
  showMoreMenu.value = false;
}

function handleBlock() {
  emit('block');
  showMoreMenu.value = false;
}

function handleBlockDomain() {
  emit('blockDomain');
  showMoreMenu.value = false;
}

function handleReport() {
  emit('report');
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
  <footer class="flex items-center gap-1 -ml-2">
    <!-- Reply -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border-none cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
      @click="emit('reply')"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span v-if="repliesCount" class="min-w-[1ch]">{{ formatCount(repliesCount) }}</span>
    </button>

    <!-- Reblog/Boost -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border-none text-sm transition-colors" :class="[
        canReblog ? 'cursor-pointer hover:bg-green-50' : 'cursor-not-allowed opacity-50',
        reblogged ? 'text-green-600' : 'text-gray-500 hover:text-green-600',
      ]"
      :disabled="!canReblog"
      @click="canReblog && emit('reblog')"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <span v-if="reblogsCount" class="min-w-[1ch]">{{ formatCount(reblogsCount) }}</span>
    </button>

    <!-- Favourite/Like -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border-none cursor-pointer text-sm transition-colors hover:bg-red-50" :class="[
        favourited ? 'text-red-500' : 'text-gray-500 hover:text-red-500',
      ]"
      @click="emit('favourite')"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" :fill="favourited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span v-if="favouritesCount" class="min-w-[1ch]">{{ formatCount(favouritesCount) }}</span>
    </button>

    <!-- Bookmark -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border-none cursor-pointer text-sm transition-colors hover:bg-yellow-50" :class="[
        bookmarked ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600',
      ]"
      @click="emit('bookmark')"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" :fill="bookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>

    <!-- More Actions -->
    <div ref="menuRef" class="relative ml-auto">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-transparent border-none cursor-pointer text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        @click="toggleMoreMenu"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
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
          class="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
        >
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            @click="handleCopyLink"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copy link
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            @click="handleSendMessage"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            Send as message
          </button>
          <div class="border-t border-gray-100 my-1" />
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            @click="handleMute"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            Mute user
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            @click="handleBlock"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Block user
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            @click="handleBlockDomain"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Block domain
          </button>
          <div class="border-t border-gray-100 my-1" />
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
            @click="handleReport"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            Report
          </button>
        </div>
      </Transition>
    </div>
  </footer>
</template>
