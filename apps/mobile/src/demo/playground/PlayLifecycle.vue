<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { onMounted, onUnmounted, ref } from 'vue';

const isNative = Capacitor.isNativePlatform();
const eventLog = ref<string[]>([]);
const appInfo = ref<string | null>(null);
const appState = ref<string | null>(null);
const listeners: PluginListenerHandle[] = [];

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift(`[${time}] ${msg}`);
  if (eventLog.value.length > 30)
    eventLog.value.pop();
}

onMounted(async () => {
  // Get app info
  if (isNative) {
    try {
      const info = await App.getInfo();
      appInfo.value = JSON.stringify(info, null, 2);
    }
    catch (e) {
      log(`Error getting info: ${e instanceof Error ? e.message : String(e)}`);
    }

    try {
      const state = await App.getState();
      appState.value = JSON.stringify(state, null, 2);
      log(`Initial state: ${state.isActive ? 'active' : 'inactive'}`);
    }
    catch (e) {
      log(`Error getting state: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  else {
    appInfo.value = JSON.stringify({ name: 'Fediway', version: '0.0.0', build: 'web', id: 'com.fediway.app' }, null, 2);
    appState.value = JSON.stringify({ isActive: true }, null, 2);
  }

  // Listen for lifecycle events
  try {
    const stateHandle = await App.addListener('appStateChange', (state) => {
      log(`appStateChange: ${state.isActive ? 'active' : 'inactive'}`);
      appState.value = JSON.stringify(state, null, 2);
    });
    listeners.push(stateHandle);
  }
  catch (e) {
    log(`Error adding appStateChange listener: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const pauseHandle = await App.addListener('pause', () => {
      log('pause');
    });
    listeners.push(pauseHandle);
  }
  catch (e) {
    log(`Error adding pause listener: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const resumeHandle = await App.addListener('resume', () => {
      log('resume');
    });
    listeners.push(resumeHandle);
  }
  catch (e) {
    log(`Error adding resume listener: ${e instanceof Error ? e.message : String(e)}`);
  }
});

onUnmounted(() => {
  listeners.forEach(h => h.remove());
});

function clearLog() {
  eventLog.value = [];
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
        Lifecycle
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Lifecycle events only fire on native devices. Background/foreground the app to see events.
      </div>

      <!-- App info -->
      <div v-if="appInfo" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          App Info
        </h2>
        <pre class="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ appInfo }}</pre>
      </div>

      <!-- App state -->
      <div v-if="appState" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Current State
        </h2>
        <pre class="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ appState }}</pre>
      </div>

      <!-- Event log -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-medium text-gray-900 dark:text-gray-100">
            Event Log
          </h2>
          <button
            type="button"
            class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700"
            @click="clearLog"
          >
            Clear
          </button>
        </div>
        <div v-if="eventLog.length" class="space-y-1 text-xs font-mono text-gray-600 dark:text-gray-400 max-h-64 overflow-y-auto">
          <div v-for="(entry, i) in eventLog" :key="i">
            {{ entry }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Waiting for lifecycle events...
        </div>
      </div>
    </div>
  </div>
</template>
