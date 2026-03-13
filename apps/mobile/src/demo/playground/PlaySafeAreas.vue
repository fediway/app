<script setup lang="ts">
import { onMounted, ref } from 'vue';

const insets = ref({ top: '0px', right: '0px', bottom: '0px', left: '0px' });

onMounted(() => {
  const style = getComputedStyle(document.documentElement);
  insets.value = {
    top: style.getPropertyValue('env(safe-area-inset-top)') || getEnvValue('safe-area-inset-top'),
    right: style.getPropertyValue('env(safe-area-inset-right)') || getEnvValue('safe-area-inset-right'),
    bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || getEnvValue('safe-area-inset-bottom'),
    left: style.getPropertyValue('env(safe-area-inset-left)') || getEnvValue('safe-area-inset-left'),
  };
});

function getEnvValue(name: string): string {
  // Create a temporary element to measure env() values
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.width = '0';
  el.style.height = `env(${name}, 0px)`;
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const value = `${getComputedStyle(el).height}`;
  document.body.removeChild(el);
  return value;
}
</script>

<template>
  <div class="min-h-screen relative">
    <!-- Top inset bar -->
    <div
      class="fixed top-0 left-0 right-0 bg-red-400/60 z-20"
      :style="{ height: `env(safe-area-inset-top, 0px)` }"
    />
    <!-- Bottom inset bar -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-blue-400/60 z-20"
      :style="{ height: `env(safe-area-inset-bottom, 0px)` }"
    />
    <!-- Left inset bar -->
    <div
      class="fixed top-0 bottom-0 left-0 bg-green-400/60 z-20"
      :style="{ width: `env(safe-area-inset-left, 0px)` }"
    />
    <!-- Right inset bar -->
    <div
      class="fixed top-0 bottom-0 right-0 bg-yellow-400/60 z-20"
      :style="{ width: `env(safe-area-inset-right, 0px)` }"
    />

    <header class="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4" style="margin-top: env(safe-area-inset-top, 0px);">
      <router-link to="/demo">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">
        Safe Areas
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Inset Values
        </h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span class="w-3 h-3 bg-red-400 rounded" />
              Top
            </span>
            <span class="font-mono text-gray-900 dark:text-gray-100">{{ insets.top }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span class="w-3 h-3 bg-yellow-400 rounded" />
              Right
            </span>
            <span class="font-mono text-gray-900 dark:text-gray-100">{{ insets.right }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span class="w-3 h-3 bg-blue-400 rounded" />
              Bottom
            </span>
            <span class="font-mono text-gray-900 dark:text-gray-100">{{ insets.bottom }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span class="w-3 h-3 bg-green-400 rounded" />
              Left
            </span>
            <span class="font-mono text-gray-900 dark:text-gray-100">{{ insets.left }}</span>
          </div>
        </div>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        Colored bars show each safe area inset. Values of 0px are expected on web.
      </div>
    </div>
  </div>
</template>
