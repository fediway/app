<script setup lang="ts">
import { useTabNavigation } from '~/composables/useTabNavigation';

const { isTabSwitching } = useTabNavigation();

const pageTransition = computed(() => {
  const name = isTabSwitching.value ? 'tab-switch' : 'page';
  return { name, mode: 'out-in' as const };
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

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.tab-switch-enter-active,
.tab-switch-leave-active {
  transition: opacity 0ms;
}

.tab-switch-enter-from,
.tab-switch-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
