<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ProfileHeader, ProfileInformation, Status } from '@repo/ui';
import { onMounted, onUnmounted } from 'vue';
import { allStatuses, janeAccount } from '../mock';

const profileStatuses = allStatuses.filter(s => s.account.id === janeAccount.id);

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Light });
    }
    catch {
      // Status bar may not be available
    }
  }
});

onUnmounted(async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Default });
    }
    catch {
      // Status bar may not be available
    }
  }
});
</script>

<template>
  <div class="min-h-screen">
    <div class="relative">
      <!-- Back button overlaid on header image -->
      <router-link
        to="/demo"
        class="absolute top-10 left-4 z-10"
      >
        <button
          type="button"
          class="px-3 py-1.5 bg-black/40 text-white text-sm font-medium rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm"
        >
          Back
        </button>
      </router-link>
      <ProfileHeader
        :header-image="janeAccount.header"
        :avatar-src="janeAccount.avatar"
        :avatar-alt="janeAccount.displayName"
      />
    </div>

    <div class="py-4">
      <ProfileInformation :account="janeAccount" />
    </div>

    <div class="border-t border-gray-200 dark:border-gray-700">
      <div class="px-4 py-3">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Posts
        </h2>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <Status
          v-for="status in profileStatuses"
          :key="status.id"
          :status="status"
        />
      </div>
    </div>
  </div>
</template>
