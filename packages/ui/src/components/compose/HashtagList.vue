<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Skeleton } from '../ui/skeleton';

export interface HashtagSuggestion {
  name: string;
  postCount?: number;
}

interface Props {
  suggestions: HashtagSuggestion[];
  command?: (item: HashtagSuggestion) => void;
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
    document.getElementById(`hashtag-option-${index}`)
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
    class="w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    role="listbox"
  >
    <!-- Loading -->
    <div v-if="loading && suggestions.length === 0" class="space-y-1 p-2">
      <div v-for="i in 3" :key="i" class="flex items-center justify-between rounded-lg px-3 py-1.5">
        <Skeleton class="h-3.5 w-20" />
        <Skeleton class="h-3 w-10" />
      </div>
    </div>

    <!-- No results -->
    <div v-else-if="!loading && suggestions.length === 0" class="px-3 py-4 text-center text-sm text-muted-foreground">
      No results
    </div>

    <!-- Suggestions -->
    <div v-else class="max-h-64 overflow-y-auto p-1">
      <button
        v-for="(suggestion, index) in suggestions"
        :id="`hashtag-option-${index}`"
        :key="suggestion.name"
        type="button"
        role="option"
        :aria-selected="index === selectedIndex"
        class="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left transition-colors"
        :class="index === selectedIndex ? 'bg-accent' : 'hover:bg-muted'"
        @mousedown.prevent
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <span class="text-sm font-medium text-foreground">#{{ suggestion.name }}</span>
        <span v-if="suggestion.postCount" class="text-xs text-muted-foreground">
          {{ suggestion.postCount.toLocaleString() }}
        </span>
      </button>
    </div>
  </div>
</template>
