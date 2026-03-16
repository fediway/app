<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { onMounted, onUnmounted, ref } from 'vue';

const keyboardHeight = ref(0);
const keyboardVisible = ref(false);
const eventLog = ref<string[]>([]);
const isNative = Capacitor.isNativePlatform();
const listeners: PluginListenerHandle[] = [];

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift(`[${time}] ${msg}`);
  if (eventLog.value.length > 20)
    eventLog.value.pop();
}

onMounted(async () => {
  if (isNative) {
    const showHandle = await Keyboard.addListener('keyboardWillShow', (info) => {
      keyboardHeight.value = info.keyboardHeight;
      keyboardVisible.value = true;
      log(`keyboardWillShow — height: ${info.keyboardHeight}px`);
    });
    const hideHandle = await Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.value = 0;
      keyboardVisible.value = false;
      log('keyboardDidHide');
    });
    listeners.push(showHandle, hideHandle);
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
        Keyboard
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Keyboard events only fire on native devices.
      </div>

      <!-- Status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Status
        </h2>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Visible</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ keyboardVisible ? 'Yes' : 'No' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Height</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ keyboardHeight }}px</span>
          </div>
        </div>
      </div>

      <!-- Inputs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 class="font-medium text-gray-900 dark:text-gray-100">
          Test Inputs
        </h2>
        <input
          type="text"
          placeholder="Text input"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
        <textarea
          placeholder="Textarea"
          rows="3"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
        />
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
          Tap an input field to see events...
        </div>
      </div>
    </div>
  </div>
</template>
