<script setup lang="ts">
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';

const imageUri = ref<string | null>(null);
const error = ref<string | null>(null);
const permissionStatus = ref<string | null>(null);
const isNative = Capacitor.isNativePlatform();

async function checkPermissions() {
  try {
    const status = await Camera.checkPermissions();
    permissionStatus.value = `Camera: ${status.camera}, Photos: ${status.photos}`;
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function requestPermissions() {
  try {
    const status = await Camera.requestPermissions();
    permissionStatus.value = `Camera: ${status.camera}, Photos: ${status.photos}`;
    error.value = null;
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function takePhoto(source: CameraSource) {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source,
    });
    if (photo.webPath) {
      imageUri.value = photo.webPath;
    }
    error.value = null;
  }
  catch (e) {
    if (e instanceof Error && !e.message.includes('cancelled')) {
      error.value = e.message;
    }
  }
}

async function pickImages() {
  try {
    const result = await Camera.pickImages({
      quality: 80,
      limit: 4,
    });
    const first = result.photos[0];
    if (first?.webPath) {
      imageUri.value = first.webPath;
    }
    error.value = null;
  }
  catch (e) {
    if (e instanceof Error && !e.message.includes('cancelled')) {
      error.value = e instanceof Error ? e.message : String(e);
    }
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
        Camera
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Some camera features only work on native devices.
      </div>

      <!-- Permissions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 class="font-medium text-gray-900 dark:text-gray-100">
          Permissions
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="checkPermissions"
          >
            Check
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="requestPermissions"
          >
            Request
          </button>
        </div>
        <div v-if="permissionStatus" class="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {{ permissionStatus }}
        </div>
      </div>

      <!-- Capture -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 class="font-medium text-gray-900 dark:text-gray-100">
          Capture
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="takePhoto(CameraSource.Camera)"
          >
            Camera
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="takePhoto(CameraSource.Photos)"
          >
            Gallery
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="takePhoto(CameraSource.Prompt)"
          >
            Prompt
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="pickImages"
          >
            Pick Multiple
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Preview -->
      <div v-if="imageUri" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Preview
        </h2>
        <img :src="imageUri" alt="Captured photo" class="w-full rounded-lg">
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono break-all">
          {{ imageUri }}
        </p>
      </div>
    </div>
  </div>
</template>
