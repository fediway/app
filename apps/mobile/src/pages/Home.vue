<script setup lang="ts">
import type { Tag } from '@repo/types';
import { useTimeline } from '@repo/api';
import { Timeline } from '@repo/ui';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProfileUrl, useStatusBridge } from '../composables/useStatusBridge';

defineOptions({ name: 'Home' });

const router = useRouter();

const timeline = useTimeline({ type: 'home', cache: true });
const { statuses, toggleFavourite, toggleReblog, toggleBookmark } = useStatusBridge(timeline.statuses);

onMounted(async () => {
  await timeline.fetch();
  timeline.startPolling(30_000);
});

onUnmounted(() => {
  timeline.stopPolling();
});

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${encodeURIComponent(tag.name)}`);
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Error state -->
    <div v-if="timeline.error.value && statuses.length === 0" class="flex flex-col items-center justify-center gap-4 py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Couldn't load timeline
      </p>
      <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="timeline.fetch()">
        Try again
      </button>
    </div>

    <!-- Timeline -->
    <Timeline
      v-else
      :statuses="statuses"
      :loading="timeline.isLoading.value && statuses.length === 0"
      :has-more="timeline.hasMore.value"
      :get-profile-url="getProfileUrl"
      @favourite="toggleFavourite"
      @reblog="toggleReblog"
      @bookmark="toggleBookmark"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
      @tag-click="handleTagClick"
      @load-more="timeline.loadMore()"
    />

    <!-- Empty state -->
    <div v-if="!timeline.isLoading.value && !timeline.error.value && statuses.length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Your timeline is empty
      </p>
    </div>
  </div>
</template>
