<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { ref } from 'vue';

const isNative = Capacitor.isNativePlatform();
const lastAction = ref<string | null>(null);

async function showSplash() {
  try {
    await SplashScreen.show({ autoHide: false });
    lastAction.value = 'Show (no auto-hide) — call Hide to dismiss';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function hideSplash() {
  try {
    await SplashScreen.hide();
    lastAction.value = 'Hide — splash dismissed';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function showWithAutoHide() {
  try {
    await SplashScreen.show({
      autoHide: true,
      showDuration: 2000,
    });
    lastAction.value = 'Show with auto-hide (2s)';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
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
        Splash Screen
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Splash screen controls only work on native devices.
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <button
          type="button"
          class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="showSplash"
        >
          Show (no auto-hide)
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="hideSplash"
        >
          Hide
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="showWithAutoHide"
        >
          Show with Auto-Hide (2s)
        </button>
      </div>

      <div v-if="lastAction" class="text-sm text-gray-500 dark:text-gray-400 text-center">
        {{ lastAction }}
      </div>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400">
        <strong>Note:</strong> For splash to persist on app launch, set <code class="font-mono">launchAutoHide: false</code> in <code class="font-mono">capacitor.config.ts</code>, then call <code class="font-mono">SplashScreen.hide()</code> when ready.
      </div>
    </div>
  </div>
</template>
