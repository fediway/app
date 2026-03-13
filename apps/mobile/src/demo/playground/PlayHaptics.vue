<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { ref } from 'vue';

const isNative = Capacitor.isNativePlatform();
const lastAction = ref<string | null>(null);

async function impact(style: ImpactStyle) {
  try {
    await Haptics.impact({ style });
    lastAction.value = `Impact: ${style}`;
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function notification(type: NotificationType) {
  try {
    await Haptics.notification({ type });
    lastAction.value = `Notification: ${type}`;
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function vibrate() {
  try {
    await Haptics.vibrate({ duration: 300 });
    lastAction.value = 'Vibrate: 300ms';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function selectionStart() {
  try {
    await Haptics.selectionStart();
    lastAction.value = 'Selection: start';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function selectionChanged() {
  try {
    await Haptics.selectionChanged();
    lastAction.value = 'Selection: changed';
  }
  catch (e) {
    lastAction.value = `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function selectionEnd() {
  try {
    await Haptics.selectionEnd();
    lastAction.value = 'Selection: end';
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
        Haptics
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <div v-if="!isNative" class="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        Haptics only work on native devices.
      </div>

      <!-- Impact -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Impact
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="impact(ImpactStyle.Light)"
          >
            Light
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="impact(ImpactStyle.Medium)"
          >
            Medium
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            @click="impact(ImpactStyle.Heavy)"
          >
            Heavy
          </button>
        </div>
      </div>

      <!-- Notification -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Notification
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            @click="notification(NotificationType.Success)"
          >
            Success
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
            @click="notification(NotificationType.Warning)"
          >
            Warning
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            @click="notification(NotificationType.Error)"
          >
            Error
          </button>
        </div>
      </div>

      <!-- Vibrate -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Vibrate
        </h2>
        <button
          type="button"
          class="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          @click="vibrate"
        >
          Vibrate (300ms)
        </button>
      </div>

      <!-- Selection -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Selection
        </h2>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="selectionStart"
          >
            Start
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="selectionChanged"
          >
            Changed
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="selectionEnd"
          >
            End
          </button>
        </div>
      </div>

      <!-- Last action -->
      <div v-if="lastAction" class="text-sm text-gray-500 dark:text-gray-400 text-center">
        {{ lastAction }}
      </div>
    </div>
  </div>
</template>
