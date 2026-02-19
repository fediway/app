<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ref } from 'vue';

const isNative = Capacitor.isNativePlatform();
const overlayEnabled = ref(false);
const bgColor = ref('#ffffff');
const info = ref<string | null>(null);
const error = ref<string | null>(null);

async function setStyle(style: Style) {
  try {
    await StatusBar.setStyle({ style });
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function toggleOverlay() {
  try {
    overlayEnabled.value = !overlayEnabled.value;
    await StatusBar.setOverlaysWebView({ overlay: overlayEnabled.value });
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function applyColor() {
  try {
    await StatusBar.setBackgroundColor({ color: bgColor.value });
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function showBar() {
  try {
    await StatusBar.show();
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function hideBar() {
  try {
    await StatusBar.hide();
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function getInfo() {
  try {
    const result = await StatusBar.getInfo();
    info.value = JSON.stringify(result, null, 2);
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
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
        Status Bar
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Status bar controls only work on native devices.
      </div>

      <!-- Style -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Style
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="setStyle(Style.Light)"
          >
            Light
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            @click="setStyle(Style.Dark)"
          >
            Dark
          </button>
        </div>
      </div>

      <!-- Overlay -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              Overlay
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Content renders behind status bar
            </div>
          </div>
          <button
            type="button"
            class="relative w-11 h-6 rounded-full transition-colors"
            :class="overlayEnabled ? 'bg-blue-600' : 'bg-gray-300'"
            @click="toggleOverlay"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
              :class="overlayEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Background color -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 class="font-medium text-gray-900 dark:text-gray-100">
          Background Color
        </h2>
        <div class="flex gap-2">
          <input
            v-model="bgColor"
            type="text"
            placeholder="#ffffff"
            class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
          >
          <button
            type="button"
            class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="applyColor"
          >
            Apply
          </button>
        </div>
      </div>

      <!-- Show/Hide -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Visibility
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="showBar"
          >
            Show
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="hideBar"
          >
            Hide
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="getInfo"
          >
            Get Info
          </button>
        </div>
      </div>

      <!-- Info -->
      <div v-if="info" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
        <pre class="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ info }}</pre>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
        {{ error }}
      </div>
    </div>
  </div>
</template>
