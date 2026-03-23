<script setup lang="ts">
import { useTabNavigation } from '~/composables/useTabNavigation';

const { isTabSwitching } = useTabNavigation();

const pageTransition = computed(() => {
  if (isTabSwitching.value)
    return { name: 'tab-switch', mode: 'out-in' as const };
  return { name: 'page', mode: 'out-in' as const };
});
</script>

<template>
  <NuxtLoadingIndicator color="#3b82f6" />
  <NuxtLayout>
    <NuxtPage
      :transition="pageTransition"
    />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 150ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}

/* Instant swap for tab switches — no animation but KeepAlive still works */
.tab-switch-enter-active,
.tab-switch-leave-active {
  transition: none;
}

.tab-switch-enter-from,
.tab-switch-leave-to {
  opacity: 0;
}
</style>
