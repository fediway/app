<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useDarkMode } from '@repo/api';
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppInit } from './composables/useAppInit';
import AppLayout from './layouts/AppLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

const route = useRoute();
const { isDark } = useDarkMode();
const { init } = useAppInit();

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : AppLayout;
});

// Sync status bar style with dark mode
watch(isDark, async (dark) => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
  }
}, { immediate: true });

onMounted(() => {
  init();
});
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <keep-alive :max="5">
        <component :is="Component" :key="route.meta.tab ? String(route.meta.tab) : route.fullPath" />
      </keep-alive>
    </router-view>
  </component>
</template>
