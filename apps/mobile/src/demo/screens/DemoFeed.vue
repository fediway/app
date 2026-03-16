<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Timeline } from '@repo/ui';
import { onBeforeUnmount, ref } from 'vue';
import { allStatuses } from '../mock';

const statuses = ref([...allStatuses]);
const showNewPosts = ref(false);
const isRefreshing = ref(false);

// Simulate new posts arriving after 5s
const timer = setTimeout(() => {
  showNewPosts.value = true;
}, 5000);

onBeforeUnmount(() => clearTimeout(timer));

function loadNewPosts() {
  showNewPosts.value = false;
  // Simulate: just shuffle to top to show the banner worked
  statuses.value = [...allStatuses];
}

let touchStartY = 0;

async function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0];
  if (touch)
    touchStartY = touch.clientY;
}

async function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0];
  if (!touch)
    return;
  const delta = touch.clientY - touchStartY;
  if (delta > 100 && window.scrollY === 0) {
    isRefreshing.value = true;
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    // Simulate refresh delay
    setTimeout(() => {
      statuses.value = [...allStatuses];
      isRefreshing.value = false;
    }, 1000);
  }
}
</script>

<template>
  <div
    class="min-h-screen"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
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
        Feed
      </h1>
    </header>

    <!-- Refreshing indicator -->
    <div
      v-if="isRefreshing"
      class="flex justify-center py-3 text-sm text-gray-500"
    >
      Refreshing...
    </div>

    <!-- New posts banner -->
    <button
      v-if="showNewPosts"
      type="button"
      class="w-full py-2 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
      @click="loadNewPosts"
    >
      New posts available
    </button>

    <Timeline
      :statuses="statuses"
      :loading="false"
      :has-more="false"
    />
  </div>
</template>
