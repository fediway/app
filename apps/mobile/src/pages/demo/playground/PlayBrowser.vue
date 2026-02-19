<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { onMounted, onUnmounted, ref } from 'vue';

const url = ref('https://fediway.com');
const eventLog = ref<string[]>([]);
const listeners: PluginListenerHandle[] = [];

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift(`[${time}] ${msg}`);
  if (eventLog.value.length > 20)
    eventLog.value.pop();
}

onMounted(async () => {
  try {
    const finishHandle = await Browser.addListener('browserFinished', () => {
      log('browserFinished');
    });
    const pageHandle = await Browser.addListener('browserPageLoaded', () => {
      log('browserPageLoaded');
    });
    listeners.push(finishHandle, pageHandle);
  }
  catch (e) {
    log(`Error adding listeners: ${e instanceof Error ? e.message : String(e)}`);
  }
});

onUnmounted(() => {
  listeners.forEach(h => h.remove());
});

async function openUrl() {
  if (!url.value.trim())
    return;
  try {
    await Browser.open({ url: url.value });
    log(`Opened: ${url.value}`);
  }
  catch (e) {
    log(`Error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function openWithToolbar() {
  if (!url.value.trim())
    return;
  try {
    await Browser.open({
      url: url.value,
      toolbarColor: '#3b82f6',
    });
    log(`Opened with toolbar color: ${url.value}`);
  }
  catch (e) {
    log(`Error: ${e instanceof Error ? e.message : String(e)}`);
  }
}
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
        Browser
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <!-- URL input -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <input
          v-model="url"
          type="url"
          placeholder="https://example.com"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="openUrl"
          >
            Open
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="openWithToolbar"
          >
            Open + Toolbar Color
          </button>
        </div>
      </div>

      <!-- Event log -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Event Log
        </h2>
        <div v-if="eventLog.length" class="space-y-1 text-xs font-mono text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto">
          <div v-for="(entry, i) in eventLog" :key="i">
            {{ entry }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Open a URL to see events...
        </div>
      </div>
    </div>
  </div>
</template>
