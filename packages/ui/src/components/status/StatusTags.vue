<script setup lang="ts">
import type { Tag } from '@repo/types';
import { computed } from 'vue';

interface Props {
  tags: Tag[];
  /** Maximum tags to show before "and X more" */
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 5,
});

const emit = defineEmits<{
  tagClick: [tagName: string];
}>();

const visibleTags = computed(() => props.tags.slice(0, props.limit));
const hiddenCount = computed(() => Math.max(0, props.tags.length - props.limit));
</script>

<template>
  <div v-if="tags.length > 0" class="flex flex-wrap gap-x-2 gap-y-0.5">
    <button
      v-for="tag in visibleTags"
      :key="tag.name"
      type="button"
      class="text-sm text-foreground/50 hover:text-foreground/70 cursor-pointer transition-colors"
      @click="emit('tagClick', tag.name)"
    >
      #{{ tag.name }}
    </button>
    <span v-if="hiddenCount > 0" class="text-sm text-foreground/30">
      +{{ hiddenCount }} more
    </span>
  </div>
</template>
