<script setup lang="ts">
import { PageHeader, Skeleton } from '@repo/ui';

definePageMeta({ keepalive: true });

const { getBookmarkedStatusesPaginated } = useTimelineData();
const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getBookmarkedStatusesPaginated();
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader title="Bookmarks" />

    <ClientOnly>
      <StatusTimeline
        :statuses="statuses"
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="hasMore"
        :error="error"
        empty-title="No bookmarks yet"
        empty-description="Save posts to read later"
        @load-more="loadMore()"
        @retry="refetch()"
      />

      <template #fallback>
        <div class="space-y-4 p-4">
          <Skeleton v-for="i in 3" :key="i" class="h-32 w-full" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
