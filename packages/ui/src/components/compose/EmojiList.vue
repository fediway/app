<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Skeleton } from '../ui/skeleton';

export interface EmojiSuggestion {
  /** Shortcode without colons (e.g., "blobcat") */
  shortcode: string;
  /** URL to the emoji image (for custom emoji) */
  url?: string;
  /** Native unicode character (for unicode emoji) */
  native?: string;
  /** Category for grouping */
  category?: string;
}

interface Props {
  suggestions: EmojiSuggestion[];
  command?: (item: EmojiSuggestion) => void;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  command: undefined,
  loading: false,
});

const selectedIndex = ref(0);

watch(() => props.suggestions, () => {
  selectedIndex.value = 0;
});

watch(selectedIndex, (index) => {
  nextTick(() => {
    document.getElementById(`emoji-option-${index}`)
      ?.scrollIntoView({ block: 'nearest' });
  });
});

function selectItem(index: number) {
  const item = props.suggestions[index];
  if (item)
    props.command?.(item);
}

/** Called by Tiptap suggestion's onKeyDown */
function onKeyDown(event: KeyboardEvent): boolean {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.suggestions.length - 1) % props.suggestions.length;
    return true;
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.suggestions.length;
    return true;
  }
  if (event.key === 'Enter' || event.key === 'Tab') {
    selectItem(selectedIndex.value);
    return true;
  }
  return false;
}

defineExpose({ onKeyDown });
</script>

<template>
  <div
    class="w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    role="listbox"
  >
    <!-- Loading -->
    <div v-if="loading && suggestions.length === 0" class="space-y-1 p-2">
      <div v-for="i in 3" :key="i" class="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <Skeleton class="size-6 shrink-0 rounded" />
        <Skeleton class="h-3.5 w-20" />
      </div>
    </div>

    <!-- No results -->
    <div v-else-if="!loading && suggestions.length === 0" class="px-3 py-4 text-center text-sm text-muted-foreground">
      No emoji found
    </div>

    <!-- Suggestions -->
    <div v-else class="max-h-64 overflow-y-auto p-1">
      <button
        v-for="(suggestion, index) in suggestions"
        :id="`emoji-option-${index}`"
        :key="suggestion.shortcode"
        type="button"
        role="option"
        :aria-selected="index === selectedIndex"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
        :class="index === selectedIndex ? 'bg-accent' : 'hover:bg-muted'"
        @mousedown.prevent="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <!-- Custom emoji (image) or native unicode -->
        <span v-if="suggestion.url" class="flex size-6 shrink-0 items-center justify-center">
          <img :src="suggestion.url" :alt="suggestion.shortcode" class="size-5 object-contain" loading="lazy" decoding="async">
        </span>
        <span v-else-if="suggestion.native" class="flex size-6 shrink-0 items-center justify-center text-lg">
          {{ suggestion.native }}
        </span>

        <span class="truncate text-sm text-muted-foreground">:{{ suggestion.shortcode }}:</span>
      </button>
    </div>
  </div>
</template>
