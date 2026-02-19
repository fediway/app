<script setup lang="ts">
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';

const appInfo = ref<{ name: string; version: string; build: string } | null>(null);

async function loadAppInfo() {
  if (Capacitor.isNativePlatform()) {
    const info = await App.getInfo();
    appInfo.value = {
      name: info.name,
      version: info.version,
      build: info.build,
    };
  }
  else {
    appInfo.value = {
      name: 'Monorepo App',
      version: '0.0.0',
      build: 'web',
    };
  }
}

loadAppInfo();
</script>

<template>
  <div class="px-4 py-6 space-y-6">
    <header class="flex items-center gap-4">
      <router-link to="/">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-2xl font-bold text-gray-900">
        Settings
      </h1>
    </header>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h2 class="text-lg font-semibold mb-3">
        App Information
      </h2>
      <div v-if="appInfo" class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Name</span>
          <span class="font-medium">{{ appInfo.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Version</span>
          <span class="font-medium">{{ appInfo.version }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Build</span>
          <span class="font-medium">{{ appInfo.build }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Platform</span>
          <span class="font-medium">{{ Capacitor.getPlatform() }}</span>
        </div>
      </div>
      <div v-else class="text-gray-500">
        Loading...
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h2 class="text-lg font-semibold mb-2">
        About
      </h2>
      <p class="text-gray-600 text-sm">
        A demonstration of a Turborepo monorepo with shared Vue components
        used across web and mobile applications.
      </p>
    </div>
  </div>
</template>
