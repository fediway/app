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
  <NuxtLoadingIndicator color="var(--primary)" />
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

/*
 * Take leaving page OUT OF DOCUMENT FLOW during transition.
 * Without this, the leaving page (at opacity 0) still occupies vertical space,
 * pushing the entering page below it — causing "feed statuses below messages" ghost.
 */
.page-leave-active {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  will-change: transform;
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

/*
 * Same fix for tab switches — leaving page must not occupy space.
 * Even though transition is instant, there's a single frame where both exist.
 */
.tab-switch-leave-active {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  will-change: transform;
}

.tab-switch-enter-from,
.tab-switch-leave-to {
  opacity: 0;
}
</style>
