<script setup lang="ts">
import type { EmojiSuggestion } from './EmojiList.vue';
import { PhMagnifyingGlass, PhSmiley, PhX } from '@phosphor-icons/vue';
import { useMediaQuery } from '@vueuse/core';
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, VisuallyHidden } from 'reka-ui';
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  emoji: EmojiSuggestion[];
  disabled?: boolean;
}>(), {
  disabled: false,
});

const emit = defineEmits<{
  select: [emoji: string];
}>();

const isOpen = ref(false);
const search = ref('');
const searchInputRef = ref<HTMLInputElement>();
const isMobile = useMediaQuery('(max-width: 1023px)');

const customEmoji = computed(() => props.emoji.filter(e => e.url));

const filteredEmoji = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q)
    return null;
  return customEmoji.value.filter(e => e.shortcode.toLowerCase().includes(q));
});

const categories = computed(() => {
  const source = filteredEmoji.value ?? customEmoji.value;
  const map = new Map<string, EmojiSuggestion[]>();
  for (const e of source) {
    const cat = e.category || 'Custom';
    if (!map.has(cat))
      map.set(cat, []);
    map.get(cat)!.push(e);
  }
  return map;
});

function handleSelect(emoji: EmojiSuggestion) {
  emit('select', emoji.url ? `:${emoji.shortcode}:` : (emoji.native || ''));
}

function handleOpen() {
  if (props.disabled)
    return;
  isOpen.value = true;
  search.value = '';
  setTimeout(() => searchInputRef.value?.focus(), 100);
}
</script>

<template>
  <!-- Trigger button -->
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
    :class="[
      isOpen
        ? 'bg-primary text-primary-foreground'
        : disabled
          ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
          : 'bg-muted text-foreground hover:bg-accent cursor-pointer',
    ]"
    :disabled="disabled"
    aria-label="Custom emoji"
    @click="handleOpen"
  >
    <PhSmiley :size="16" />
  </button>

  <!-- Bottom sheet (mobile) / Dialog -->
  <DialogRoot :open="isOpen" @update:open="v => isOpen = v">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[200] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        class="fixed z-[200] overflow-hidden bg-card shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" :class="[
          isMobile
            ? 'bottom-0 left-0 right-0 rounded-t-2xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
            : 'left-1/2 top-[20vh] -translate-x-1/2 w-80 rounded-2xl data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        ]"
        @open-auto-focus.prevent
      >
        <VisuallyHidden>
          <DialogTitle>Custom Emoji</DialogTitle>
        </VisuallyHidden>

        <!-- Drag handle (mobile) -->
        <div v-if="isMobile" class="flex justify-center py-2">
          <div class="h-1 w-8 rounded-full bg-muted-foreground/30" />
        </div>

        <!-- Header -->
        <div class="flex items-center gap-2 border-b border-border px-4 pb-3" :class="isMobile ? '' : 'pt-4'">
          <div class="flex flex-1 items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5">
            <PhMagnifyingGlass :size="16" class="shrink-0 text-muted-foreground" />
            <input
              ref="searchInputRef"
              v-model="search"
              type="text"
              placeholder="Search custom emoji..."
              class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            >
            <button v-if="search" type="button" class="shrink-0 text-muted-foreground" @click="search = ''">
              <PhX :size="14" />
            </button>
          </div>
          <DialogClose class="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted">
            <PhX :size="18" />
          </DialogClose>
        </div>

        <!-- Emoji grid -->
        <div class="overflow-y-auto p-3" :class="isMobile ? 'max-h-[50vh]' : 'max-h-72'">
          <template v-if="filteredEmoji">
            <div v-if="filteredEmoji.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              No custom emoji found
            </div>
            <div v-else class="grid grid-cols-8 gap-1">
              <button
                v-for="e in filteredEmoji"
                :key="e.shortcode"
                type="button"
                class="flex aspect-square cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-accent"
                :title="`:${e.shortcode}:`"
                @click="handleSelect(e)"
              >
                <img :src="e.url" :alt="e.shortcode" class="size-6 object-contain" loading="lazy" decoding="async">
              </button>
            </div>
          </template>

          <template v-else>
            <div v-if="customEmoji.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              No custom emoji on this instance
            </div>
            <div v-for="[category, emojis] in categories" v-else :key="category" class="mb-4 last:mb-0">
              <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {{ category }}
              </div>
              <div class="grid grid-cols-8 gap-1">
                <button
                  v-for="e in emojis"
                  :key="e.shortcode"
                  type="button"
                  class="flex aspect-square cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-accent"
                  :title="`:${e.shortcode}:`"
                  @click="handleSelect(e)"
                >
                  <img :src="e.url" :alt="e.shortcode" class="size-6 object-contain" loading="lazy" decoding="async">
                </button>
              </div>
            </div>
          </template>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
