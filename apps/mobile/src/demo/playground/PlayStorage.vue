<script setup lang="ts">
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { ref } from 'vue';

const key = ref('');
const value = ref('');
const log = ref<string[]>([]);

function addLog(msg: string) {
  const time = new Date().toLocaleTimeString();
  log.value.unshift(`[${time}] ${msg}`);
  if (log.value.length > 30)
    log.value.pop();
}

async function setItem() {
  if (!key.value.trim())
    return;
  try {
    await SecureStorage.set(key.value, value.value);
    addLog(`SET "${key.value}" = "${value.value}"`);
  }
  catch (e) {
    addLog(`ERROR set: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function getItem() {
  if (!key.value.trim())
    return;
  try {
    const result = await SecureStorage.get(key.value);
    addLog(`GET "${key.value}" = ${result !== null ? `"${result}"` : 'null'}`);
  }
  catch (e) {
    addLog(`ERROR get: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function removeItem() {
  if (!key.value.trim())
    return;
  try {
    const removed = await SecureStorage.remove(key.value);
    addLog(`REMOVE "${key.value}" = ${removed}`);
  }
  catch (e) {
    addLog(`ERROR remove: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function listKeys() {
  try {
    const result = await SecureStorage.keys();
    addLog(`KEYS: [${result.join(', ')}]`);
  }
  catch (e) {
    addLog(`ERROR keys: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function clearAll() {
  try {
    await SecureStorage.clear();
    addLog('CLEAR: all items removed');
  }
  catch (e) {
    addLog(`ERROR clear: ${e instanceof Error ? e.message : String(e)}`);
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
        Storage
      </h1>
    </header>

    <div class="px-4 py-6 space-y-4">
      <!-- Inputs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <input
          v-model="key"
          type="text"
          placeholder="Key"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
        <input
          v-model="value"
          type="text"
          placeholder="Value"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="setItem"
        >
          Set
        </button>
        <button
          type="button"
          class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="getItem"
        >
          Get
        </button>
        <button
          type="button"
          class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          @click="removeItem"
        >
          Remove
        </button>
        <button
          type="button"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          @click="listKeys"
        >
          Keys
        </button>
        <button
          type="button"
          class="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
          @click="clearAll"
        >
          Clear
        </button>
      </div>

      <!-- Log -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Operation Log
        </h2>
        <div v-if="log.length" class="space-y-1 text-xs font-mono text-gray-600 dark:text-gray-400 max-h-64 overflow-y-auto">
          <div v-for="(entry, i) in log" :key="i">
            {{ entry }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          No operations yet...
        </div>
      </div>
    </div>
  </div>
</template>
