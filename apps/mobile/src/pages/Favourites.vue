<script setup lang="ts">
import type { Status } from '@repo/types';
import { Timeline } from '@repo/ui';
import { onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { getProfileUrl, getSafeClient, useStatusBridge } from '../composables/useStatusBridge';

const router = useRouter();

const rawStatuses = shallowRef<Status[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

const { statuses, toggleFavourite, toggleReblog, toggleBookmark } = useStatusBridge(rawStatuses);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const client = getSafeClient();
    if (!client)
      return;
    rawStatuses.value = await client.rest.v1.favourites.list();
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load favourites');
  }
  finally {
    loading.value = false;
  }
}

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tagName: string) {
  router.push(`/tags/${encodeURIComponent(tagName)}`);
}

onMounted(load);
</script>

<template>
  <div v-if="error && statuses.length === 0" class="flex flex-col items-center justify-center gap-3 py-20">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Couldn't load favourites
    </p>
    <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="load()">
      Try again
    </button>
  </div>

  <div v-else class="w-full">
    <div v-if="loading && statuses.length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Loading favourites…
      </p>
    </div>

    <Timeline
      v-else-if="statuses.length > 0"
      :statuses="statuses"
      :loading="false"
      :has-more="false"
      :get-profile-url="getProfileUrl"
      @reblog="toggleReblog"
      @favourite="toggleFavourite"
      @bookmark="toggleBookmark"
      @tag-click="handleTagClick"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
    />

    <div v-if="!loading && !error && statuses.length === 0" class="py-12 text-center text-gray-500">
      <p>No favourites yet</p>
      <p class="mt-1 text-sm">
        Posts you like will appear here
      </p>
    </div>
  </div>
</template>
