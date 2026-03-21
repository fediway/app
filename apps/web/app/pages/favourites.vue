<script setup lang="ts">
import { PageHeader } from '@repo/ui';

const { getFavouritedStatuses } = useTimelineData();
const { data: rawStatuses, isLoading } = getFavouritedStatuses();
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader title="Favourites" />

    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No favourites yet"
      empty-description="Posts you like will appear here"
    />
  </div>
</template>
