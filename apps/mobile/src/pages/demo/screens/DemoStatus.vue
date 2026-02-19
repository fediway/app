<script setup lang="ts">
import type { FediwayStatus } from '@repo/types';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Status } from '@repo/ui';
import { reactive } from 'vue';
import { threadAncestors, threadDescendants, threadRoot } from '../mock';

// Make statuses reactive so toggling works
const root = reactive({ ...threadRoot }) as FediwayStatus;
const ancestors = threadAncestors.map(s => reactive({ ...s })) as FediwayStatus[];
const descendants = threadDescendants.map(s => reactive({ ...s })) as FediwayStatus[];

async function hapticFeedback() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}

function toggleFavourite(status: FediwayStatus) {
  status.favourited = !status.favourited;
  status.favouritesCount += status.favourited ? 1 : -1;
  hapticFeedback();
}

function toggleReblog(status: FediwayStatus) {
  status.reblogged = !status.reblogged;
  status.reblogsCount += status.reblogged ? 1 : -1;
  hapticFeedback();
}

function toggleBookmark(status: FediwayStatus) {
  status.bookmarked = !status.bookmarked;
  hapticFeedback();
}

function findStatus(id: string): FediwayStatus | undefined {
  if (root.id === id)
    return root;
  return ancestors.find(s => s.id === id) ?? descendants.find(s => s.id === id);
}

function onFavourite(id: string) {
  const s = findStatus(id);
  if (s)
    toggleFavourite(s);
}

function onReblog(id: string) {
  const s = findStatus(id);
  if (s)
    toggleReblog(s);
}

function onBookmark(id: string) {
  const s = findStatus(id);
  if (s)
    toggleBookmark(s);
}
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4">
      <router-link to="/demo">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">
        Thread
      </h1>
    </header>

    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <!-- Ancestors -->
      <div v-for="status in ancestors" :key="status.id" class="opacity-75">
        <Status
          :status="status"
          @favourite="onFavourite"
          @reblog="onReblog"
          @bookmark="onBookmark"
        />
      </div>

      <!-- Root (highlighted) -->
      <div class="bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-blue-500">
        <Status
          :status="root"
          @favourite="onFavourite"
          @reblog="onReblog"
          @bookmark="onBookmark"
        />
      </div>

      <!-- Descendants -->
      <div v-for="status in descendants" :key="status.id">
        <Status
          :status="status"
          @favourite="onFavourite"
          @reblog="onReblog"
          @bookmark="onBookmark"
        />
      </div>
    </div>
  </div>
</template>
