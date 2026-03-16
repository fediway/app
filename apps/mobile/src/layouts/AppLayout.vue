<script setup lang="ts">
import AppDrawer from '../components/AppDrawer.vue';
import AppHeader from '../components/AppHeader.vue';
import AppTabBar from '../components/AppTabBar.vue';
import NetworkBanner from '../components/NetworkBanner.vue';
import PostComposer from '../components/PostComposer.vue';
import { useOfflineSync } from '../composables/useOfflineSync';
import { usePostComposer } from '../composables/usePostComposer';

const { open: openComposer } = usePostComposer();
useOfflineSync();
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-gray-900">
    <AppHeader />
    <AppDrawer />
    <NetworkBanner />

    <main class="flex-1 pt-[calc(3.5rem+var(--safe-area-inset-top))] pb-[calc(3.5rem+var(--safe-area-inset-bottom))]">
      <slot />
    </main>

    <AppTabBar @compose="openComposer()" />
    <PostComposer />
  </div>
</template>
