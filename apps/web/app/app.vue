<script setup lang="ts">
import { useTabNavigation } from '~/composables/useTabNavigation';

const { isTabSwitching } = useTabNavigation();

const pageTransition = computed(() => {
  if (isTabSwitching.value)
    return false;
  return { name: 'page', mode: 'out-in' as const };
});
</script>

<template>
  <NuxtLoadingIndicator color="#3b82f6" />
  <NuxtLayout>
    <NuxtPage
      :keepalive-props="{ max: 10 }"
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
</style>
