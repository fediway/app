<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const { getStatusesByTag } = useExploreData();

const tagName = computed(() => {
  const tag = route.params.tag;
  return Array.isArray(tag) ? tag[0] : tag;
});

const { data: rawStatuses, isLoading } = getStatusesByTag(tagName.value || '');
const statuses = useWebActions().withStoreState(rawStatuses);

usePageHeader({
  title: computed(() => `#${tagName.value}`),
  subtitle: computed(() => `${statuses.value.length} posts`),
});
</script>

<template>
  <div class="w-full">
    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No posts yet"
      :empty-description="`Be the first to post with #${tagName}`"
    />
  </div>
</template>
