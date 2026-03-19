<script setup lang="ts">
import type { Status, Tag } from '@repo/types';
import { PhArrowLeft } from '@phosphor-icons/vue';
import { Button, Timeline } from '@repo/ui';
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProfileUrl, getSafeClient, useStatusBridge } from '../composables/useStatusBridge';

const route = useRoute();
const router = useRouter();

const tagName = computed(() => route.params.tag as string);

const rawStatuses = shallowRef<Status[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

const { statuses, toggleFavourite, toggleReblog, toggleBookmark } = useStatusBridge(rawStatuses);

const postCount = computed(() => statuses.value.length);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const client = getSafeClient();
    if (!client)
      return;
    rawStatuses.value = await client.rest.v1.timelines.tag.$select(tagName.value).list();
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load tag timeline');
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

function handleTagClick(tag: Tag) {
  router.push(`/tags/${encodeURIComponent(tag.name)}`);
}

watch(tagName, () => load());
onMounted(load);
</script>

<template>
  <div class="w-full">
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
            {{ postCount }} posts
          </p>
        </div>
      </div>
    </header>

    <div v-if="error && statuses.length === 0" class="flex flex-col items-center justify-center gap-3 py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Couldn't load posts for #{{ tagName }}
      </p>
      <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="load()">
        Try again
      </button>
    </div>

    <div v-else-if="loading && statuses.length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </p>
    </div>

    <div v-else-if="!loading && !error && statuses.length === 0" class="px-4 py-16 text-center">
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

    <Timeline
      v-else
      :statuses="statuses"
      :get-profile-url="getProfileUrl"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
      @tag-click="handleTagClick"
      @reblog="toggleReblog"
      @favourite="toggleFavourite"
      @bookmark="toggleBookmark"
    />
  </div>
</template>
