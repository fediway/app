<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ref } from 'vue';

const isModalOpen = ref(false);

async function openModal() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}
</script>

<template>
  <div class="px-4 py-6 space-y-6">
    <header class="text-center">
      <h1 class="text-2xl font-bold text-gray-900">
        Fediway
      </h1>
      <p class="mt-2 text-gray-600">
        Social meets taste — built with Capacitor + Vue
      </p>
    </header>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h2 class="text-lg font-semibold mb-2">
        Cross-Platform
      </h2>
      <p class="text-gray-600">
        This app runs on iOS, Android, and the web using the same Vue codebase.
      </p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h2 class="text-lg font-semibold mb-2">
        Native Features
      </h2>
      <p class="text-gray-600">
        Access native device features through Capacitor plugins.
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <router-link to="/demo" class="block">
        <button
          type="button"
          class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Demo
        </button>
      </router-link>
      <button
        type="button"
        class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        @click="openModal"
      >
        Open Modal (with Haptics)
      </button>
      <router-link to="/settings" class="block">
        <button
          type="button"
          class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Settings
        </button>
      </router-link>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">
          Native Modal
        </h3>
        <p class="text-gray-600 mb-4">
          This modal triggered haptic feedback on native devices.
        </p>
        <button
          type="button"
          class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
