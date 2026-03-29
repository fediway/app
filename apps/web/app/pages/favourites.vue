<script setup lang="ts">
import { PageHeader, Skeleton } from '@repo/ui';

definePageMeta({ keepalive: true });

const { getFavouritedStatusesPaginated } = useTimelineData();
const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getFavouritedStatusesPaginated();
const statuses = useWebActions().withStoreState(rawStatuses);

usePageHeader({ title: 'Likes' });
</script>

<template>
  <div class="w-full">
    <PageHeader title="Likes" />

    <ClientOnly>
      <StatusTimeline
        :statuses="statuses"
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="hasMore"
        :error="error"
        empty-title="No likes yet"
        empty-description="Posts you like will appear here"
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
