<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useDarkMode } from '@repo/api';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppInit } from './composables/useAppInit';
import { useTransition } from './composables/useTransition';
import AppLayout from './layouts/AppLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import { useNavigationStore } from './stores/navigation';

const route = useRoute();
const { isDark } = useDarkMode();
const { init } = useAppInit();
const { transitionName } = useTransition();
const navigation = useNavigationStore();

const routeAnnouncement = ref('');
watch(() => navigation.pageTitle, (title) => {
  routeAnnouncement.value = title;
});

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : AppLayout;
});

// Only cache tab root pages, not stack pages
const TAB_PAGES = ['Home', 'SearchPage', 'Notifications', 'Profile'];

const cacheKey = computed(() => {
  return route.meta.tab ? String(route.meta.tab) : route.fullPath;
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
  <div aria-live="polite" class="sr-only">
    {{ routeAnnouncement }}
  </div>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <Transition :name="transitionName" mode="out-in">
        <keep-alive :include="TAB_PAGES">
          <component :is="Component" :key="cacheKey" />
        </keep-alive>
      </Transition>
    </router-view>
  </component>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
  /* Tab switch: fade */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* Stack push: slide left */
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
  .slide-left-enter-from {
    transform: translateX(30%);
    opacity: 0;
  }
  .slide-left-leave-to {
    transform: translateX(-15%);
    opacity: 0;
  }

  /* Stack pop: slide right */
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
  .slide-right-enter-from {
    transform: translateX(-15%);
    opacity: 0;
  }
  .slide-right-leave-to {
    transform: translateX(30%);
    opacity: 0;
  }
}
</style>
