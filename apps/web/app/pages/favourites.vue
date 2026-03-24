<script setup lang="ts">
import { PageHeader, Skeleton } from '@repo/ui';

const { getFavouritedStatuses } = useTimelineData();
const { data: rawStatuses, isLoading, error, refetch } = getFavouritedStatuses();
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader title="Favourites" />

    <ClientOnly>
      <StatusTimeline
        :statuses="statuses"
        :is-loading="isLoading"
        :error="error"
        empty-title="No favourites yet"
        empty-description="Posts you like will appear here"
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
