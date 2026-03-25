<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import { computed, ref, watch } from 'vue';
import { RichText } from '../ui/rich-text';

interface Props {
  /** HTML content */
  content: string;
  /** Content warning/spoiler text */
  spoilerText?: string;
  /** Custom emoji */
  emojis?: CustomEmoji[];
  /** Whether content is collapsed behind CW */
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  spoilerText: '',
  emojis: () => [],
  collapsed: false,
});

const emit = defineEmits<{
  toggleCollapse: [];
}>();

const hasSpoiler = computed(() => props.spoilerText.length > 0);
const isCollapsed = ref(props.collapsed || hasSpoiler.value);

watch(() => props.collapsed, (val) => {
  isCollapsed.value = val;
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  emit('toggleCollapse');
}
</script>

<template>
  <div class="status-content">
    <!-- Content Warning -->
    <div v-if="hasSpoiler" class="mb-2">
      <RichText :content="spoilerText" :emojis="emojis" class="text-foreground" />
      <button
        type="button"
        class="mt-2 px-3 py-1 text-sm font-medium text-muted-foreground bg-muted rounded hover:bg-accent transition-colors"
        @click="toggleCollapse"
      >
        {{ isCollapsed ? 'Show more' : 'Show less' }}
      </button>
    </div>

    <!-- Main Content -->
    <div
      v-show="!hasSpoiler || !isCollapsed"
      :class="{ 'mt-2': hasSpoiler }"
    >
      <RichText :content="content" :emojis="emojis" class="text-foreground" />
    </div>
  </div>
</template>
