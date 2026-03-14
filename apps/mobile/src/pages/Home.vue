<script setup lang="ts">
import { Timeline } from '@repo/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';

defineOptions({ name: 'Home' });

const router = useRouter();
const { getHomeTimeline, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();

const statuses = computed(() => withOverridesAll(getHomeTimeline()));

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tag: string) {
  router.push(`/tags/${encodeURIComponent(tag)}`);
}

function handleFavourite(id: string) {
  toggleFavourite(id, statuses.value);
}

function handleReblog(id: string) {
  toggleReblog(id, statuses.value);
}

function handleBookmark(id: string) {
  toggleBookmark(id, statuses.value);
}
</script>

<template>
  <div class="min-h-screen">
    <Timeline
      :statuses="statuses"
      :loading="statuses.length === 0"
      :has-more="false"
      :get-profile-url="getProfileUrl"
      @favourite="handleFavourite"
      @reblog="handleReblog"
      @bookmark="handleBookmark"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
      @tag-click="handleTagClick"
    />

    <div v-if="statuses.length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Loading timeline...
      </p>
    </div>
  </div>
</template>
