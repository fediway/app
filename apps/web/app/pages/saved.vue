<script setup lang="ts">
import { PageHeader } from '@repo/ui';

const { getBookmarkedStatuses } = useTimelineData();
const { data: rawStatuses, isLoading } = getBookmarkedStatuses();
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader title="Bookmarks" />

    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No bookmarks yet"
      empty-description="Save posts to read later"
    />
  </div>
</template>
