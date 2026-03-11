<script setup lang="ts">
import type { PluginListenerHandle } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { onMounted, onUnmounted, ref } from 'vue';

const text = ref('');
const imageUri = ref<string | null>(null);
const keyboardHeight = ref(0);
const keyboardVisible = ref(false);
const error = ref<string | null>(null);
const posted = ref(false);

const listeners: PluginListenerHandle[] = [];

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    const showHandle = await Keyboard.addListener('keyboardWillShow', (info) => {
      keyboardHeight.value = info.keyboardHeight;
      keyboardVisible.value = true;
    });
    const hideHandle = await Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.value = 0;
      keyboardVisible.value = false;
    });
    listeners.push(showHandle, hideHandle);
  }
});

onUnmounted(() => {
  listeners.forEach(h => h.remove());
});

async function takePhoto() {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
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

function removeImage() {
  imageUri.value = null;
}

async function submitPost() {
  if (!text.value.trim() && !imageUri.value)
    return;

  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  posted.value = true;
  text.value = '';
  imageUri.value = null;

  setTimeout(() => {
    posted.value = false;
  }, 2000);
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
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
        Compose
      </h1>
    </header>

    <div class="flex-1 px-4 py-4 space-y-4">
      <textarea
        v-model="text"
        placeholder="I just..."
        rows="6"
        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500"
      />

      <!-- Image preview -->
      <div v-if="imageUri" class="relative">
        <img
          :src="imageUri"
          alt="Attached photo"
          class="w-full max-h-64 object-cover rounded-lg"
        >
        <button
          type="button"
          class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
          @click="removeImage"
        >
          &times;
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Posted confirmation -->
      <div v-if="posted" class="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        Post submitted! (demo)
      </div>

      <!-- Keyboard info -->
      <div v-if="keyboardVisible" class="text-xs text-gray-500 dark:text-gray-400">
        Keyboard height: {{ keyboardHeight }}px
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          @click="takePhoto"
        >
          Camera
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          :disabled="!text.trim() && !imageUri"
          @click="submitPost"
        >
          Post
        </button>
      </div>
    </div>
  </div>
</template>
