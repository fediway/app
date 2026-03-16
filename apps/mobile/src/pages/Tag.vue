<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue';
import { Timeline } from '@repo/ui';
import Button from '@ui/components/ui/button/Button.vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';

const route = useRoute();
const router = useRouter();
const { getStatusesByTag, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();

const tagName = computed(() => route.params.tag as string);
const statuses = computed(() => withOverridesAll(getStatusesByTag(tagName.value)));

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
  <div class="w-full">
    <!-- Header -->
    <header class="sticky top-[calc(3.5rem+var(--safe-area-inset-top))] z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div class="flex items-center gap-3">
        <Button variant="muted" size="icon" class="-ml-2 size-9" @click="router.back()">
          <PhArrowLeft :size="20" />
        </Button>
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            #{{ tagName }}
          </h1>
          <p class="text-xs text-gray-500">
            {{ statuses.length }} posts
          </p>
        </div>
      </div>
    </header>

    <!-- Empty state -->
    <div v-if="statuses.length === 0" class="px-4 py-16 text-center">
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <span class="text-3xl text-gray-400">#</span>
      </div>
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        No posts yet
      </h3>
      <p class="text-gray-500">
        Be the first to post with #{{ tagName }}
      </p>
    </div>

    <!-- Timeline -->
    <Timeline
      v-else
      :statuses="statuses"
      :get-profile-url="getProfileUrl"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
      @tag-click="handleTagClick"
      @reblog="handleReblog"
      @favourite="handleFavourite"
      @bookmark="handleBookmark"
    />
  </div>
</template>
