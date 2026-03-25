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
  tagClick: [tag: Tag];
}>();

const visibleTags = computed(() => props.tags.slice(0, props.limit));
const hiddenCount = computed(() => Math.max(0, props.tags.length - props.limit));
</script>

<template>
  <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
    <button
      v-for="tag in visibleTags"
      :key="tag.name"
      type="button"
      class="inline-flex text-[13px] px-2.5 py-1 rounded-full bg-muted text-foreground hover:bg-accent cursor-pointer transition-colors border-none"
      @click="emit('tagClick', tag)"
    >
      #{{ tag.name }}
    </button>
    <span v-if="hiddenCount > 0" class="text-[13px] text-muted-foreground py-1">
      +{{ hiddenCount }} more
    </span>
  </div>
</template>
