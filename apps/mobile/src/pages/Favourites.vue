<script setup lang="ts">
import type { Tag } from '@repo/types';
import { Timeline } from '@repo/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';

const router = useRouter();
const { getFavouritedStatuses, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();

const statuses = computed(() => withOverridesAll(getFavouritedStatuses()));

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${encodeURIComponent(tag.name)}`);
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
  <div class="w-full">
    <Timeline
      :statuses="statuses"
      :loading="false"
      :has-more="false"
      :get-profile-url="getProfileUrl"
      @reblog="handleReblog"
      @favourite="handleFavourite"
      @bookmark="handleBookmark"
      @tag-click="handleTagClick"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
    />

    <div v-if="statuses.length === 0" class="py-12 text-center text-gray-500">
      <p>No favourites yet</p>
      <p class="mt-1 text-sm">
        Posts you like will appear here
      </p>
    </div>
  </div>
</template>
