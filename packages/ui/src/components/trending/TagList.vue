<script setup lang="ts">
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import TagListItem from './TagListItem.vue';

defineProps<{
  tags: { name: string; postCount?: number | string }[];
  loading?: boolean;
  error?: string;
}>();

defineEmits<{
  tagClick: [name: string];
  retry: [];
}>();
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading && tags.length === 0" class="space-y-1 px-3">
    <div v-for="i in 5" :key="i" class="flex items-center justify-between py-2">
      <Skeleton class="h-4 w-1/3" />
      <Skeleton class="h-3 w-10" />
    </div>
  </div>

  <!-- Error -->
  <EmptyState
    v-else-if="error"
    :title="error"
    action-label="Try again"
    @action="$emit('retry')"
  />

  <!-- Tags -->
  <div v-else-if="tags.length > 0" class="space-y-0.5">
    <TagListItem
      v-for="tag in tags"
      :key="tag.name"
      :name="tag.name"
      :post-count="tag.postCount"
      @click="name => $emit('tagClick', name)"
    />
  </div>

  <!-- Empty -->
  <EmptyState v-else title="No tags" />
</template>
