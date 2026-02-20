<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useDarkMode } from '@repo/api';
import { watch } from 'vue';

const { isDark } = useDarkMode();

watch(isDark, async (dark) => {
  if (Capacitor.isNativePlatform()) {
    // Style.Dark = light text (for dark backgrounds)
    // Style.Light = dark text (for light backgrounds)
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
  }
}, { immediate: true });
</script>

<template>
  <div class="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
