<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { onMounted, onUnmounted, ref } from 'vue';

interface NetworkInfo {
  connected: boolean;
  connectionType: string;
}

const isDark = ref(document.documentElement.classList.contains('dark'));
const networkStatus = ref<NetworkInfo | null>(null);
const listeners: PluginListenerHandle[] = [];

async function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);

  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({
        style: isDark.value ? Style.Dark : Style.Light,
      });
    }
    catch {
      // StatusBar may not be available
    }
  }
}

onMounted(async () => {
  try {
    networkStatus.value = await Network.getStatus() as unknown as NetworkInfo;
  }
  catch {
    // Network plugin may not be available
  }

  try {
    const handle = await Network.addListener('networkStatusChange', (status) => {
      networkStatus.value = status as unknown as NetworkInfo;
    });
    listeners.push(handle);
  }
  catch {
    // Listener may not be available
  }
});

onUnmounted(() => {
  listeners.forEach(h => h.remove());
});
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4">
      <router-link to="/demo">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <!-- Dark mode toggle -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              Dark Mode
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Toggle dark color scheme
            </div>
          </div>
          <button
            type="button"
            class="relative w-11 h-6 rounded-full transition-colors"
            :class="isDark ? 'bg-blue-600' : 'bg-gray-300'"
            @click="toggleDarkMode"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
              :class="isDark ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Network status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Network Status
        </h2>
        <div v-if="networkStatus" class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Connected</span>
            <span
              class="font-medium"
              :class="networkStatus.connected ? 'text-green-600' : 'text-red-600'"
            >
              {{ networkStatus.connected ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Type</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ networkStatus.connectionType }}
            </span>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    </div>
  </div>
</template>
