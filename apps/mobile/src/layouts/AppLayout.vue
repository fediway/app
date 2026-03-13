<script setup lang="ts">
import AppDrawer from '../components/AppDrawer.vue';
import AppHeader from '../components/AppHeader.vue';
import AppTabBar from '../components/AppTabBar.vue';

function handleCompose() {
  // TODO: M.06 — open PostComposer modal
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-gray-900">
    <AppHeader />
    <AppDrawer />

    <main class="flex-1 pt-[calc(3.5rem+var(--safe-area-inset-top))] pb-[calc(3.5rem+var(--safe-area-inset-bottom))]">
      <slot />
    </main>

    <AppTabBar @compose="handleCompose" />
  </div>
</template>
