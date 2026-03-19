<script setup lang="ts">
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, Skeleton } from '@repo/ui';
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
      name: 'Fediway',
      version: '0.0.0',
      build: 'web',
    };
  }
}

loadAppInfo();

const infoRows = [
  ['Name', () => appInfo.value?.name],
  ['Version', () => appInfo.value?.version],
  ['Build', () => appInfo.value?.build],
  ['Platform', () => Capacitor.getPlatform()],
] as const;
</script>

<template>
  <div class="space-y-4 px-4 py-6">
    <section>
      <h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        App Information
      </h2>
      <Card>
        <CardContent class="space-y-3 p-4">
          <template v-if="appInfo">
            <div
              v-for="[label, getValue] in infoRows"
              :key="label"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-500 dark:text-gray-400">{{ label }}</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ getValue() }}</span>
            </div>
          </template>
          <Skeleton v-else class="h-24 w-full" />
        </CardContent>
      </Card>
    </section>

    <section>
      <h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        About
      </h2>
      <Card>
        <CardContent class="p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Fediway — A Mastodon client built with Vue, Nuxt, and Capacitor.
          </p>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
