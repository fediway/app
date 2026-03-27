<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const { getStatusesByTagPaginated } = useExploreData();

const tagName = computed(() => {
  const tag = route.params.tag;
  return Array.isArray(tag) ? tag[0] : tag;
});

const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getStatusesByTagPaginated(tagName.value || '');
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
      :is-loading-more="isLoadingMore"
      :has-more="hasMore"
      :error="error"
      empty-title="No posts yet"
      :empty-description="`Be the first to post with #${tagName}`"
      @load-more="loadMore()"
      @retry="refetch()"
    />
  </div>
</template>
