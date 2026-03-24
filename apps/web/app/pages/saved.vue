<script setup lang="ts">
import { PageHeader, Skeleton } from '@repo/ui';

const { getBookmarkedStatuses } = useTimelineData();
const { data: rawStatuses, isLoading, error, refetch } = getBookmarkedStatuses();
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader title="Bookmarks" />

    <ClientOnly>
      <StatusTimeline
        :statuses="statuses"
        :is-loading="isLoading"
        :error="error"
        empty-title="No bookmarks yet"
        empty-description="Save posts to read later"
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
