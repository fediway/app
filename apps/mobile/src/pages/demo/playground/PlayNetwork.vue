<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { onMounted, onUnmounted, ref } from 'vue';

interface NetworkInfo {
  connected: boolean;
  connectionType: string;
}

const status = ref<NetworkInfo | null>(null);
const changeLog = ref<string[]>([]);
const listeners: PluginListenerHandle[] = [];

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  changeLog.value.unshift(`[${time}] ${msg}`);
  if (changeLog.value.length > 20)
    changeLog.value.pop();
}

onMounted(async () => {
  try {
    const initial = await Network.getStatus();
    status.value = initial as unknown as NetworkInfo;
    log(`Initial: ${initial.connected ? 'connected' : 'disconnected'} (${initial.connectionType})`);
  }
  catch (e) {
    log(`Error getting status: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const handle = await Network.addListener('networkStatusChange', (s) => {
      status.value = s as unknown as NetworkInfo;
      log(`Changed: ${s.connected ? 'connected' : 'disconnected'} (${s.connectionType})`);
    });
    listeners.push(handle);
  }
  catch (e) {
    log(`Error adding listener: ${e instanceof Error ? e.message : String(e)}`);
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
        Network
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <!-- Status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Connection Status
        </h2>
        <div v-if="status" class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full"
              :class="status.connected ? 'bg-green-500' : 'bg-red-500'"
            />
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ status.connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Type</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ status.connectionType }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>

      <!-- Change log -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Change History
        </h2>
        <div v-if="changeLog.length" class="space-y-1 text-xs font-mono text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto">
          <div v-for="(entry, i) in changeLog" :key="i">
            {{ entry }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Waiting for changes...
        </div>
      </div>
    </div>
  </div>
</template>
