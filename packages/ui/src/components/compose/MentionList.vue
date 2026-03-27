<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { Avatar } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export interface MentionSuggestion {
  id: string;
  acct: string;
  displayName: string;
  avatar: string;
}

interface Props {
  suggestions: MentionSuggestion[];
  /** Called by Tiptap to insert the selected mention node */
  command?: (item: MentionSuggestion) => void;
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

// Scroll selected item into view
watch(selectedIndex, (index) => {
  nextTick(() => {
    document.getElementById(`mention-option-${index}`)
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

const listRef = ref<HTMLElement>();
onMounted(() => {
  listRef.value?.focus();
});
</script>

<template>
  <div
    ref="listRef"
    class="w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    role="listbox"
  >
    <!-- Loading -->
    <div v-if="loading && suggestions.length === 0" class="space-y-1 p-2 max-h-64 overflow-y-auto">
      <div v-for="i in 3" :key="i" class="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <Skeleton class="size-8 shrink-0 rounded-full" />
        <div class="flex-1 space-y-1">
          <Skeleton class="h-3.5 w-24" />
          <Skeleton class="h-3 w-16" />
        </div>
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
        :id="`mention-option-${index}`"
        :key="suggestion.id"
        type="button"
        role="option"
        :aria-selected="index === selectedIndex"
        class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
        :class="index === selectedIndex ? 'bg-accent' : 'hover:bg-muted'"
        @mousedown.prevent
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <Avatar :src="suggestion.avatar" :alt="suggestion.displayName" size="sm" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-foreground">
            {{ suggestion.displayName }}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            @{{ suggestion.acct }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
