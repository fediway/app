<script setup lang="ts">
import { useNavigationStore } from '~/stores/navigation';

const navigation = useNavigationStore();
</script>

<template>
  <!-- Sticky at browser top, page bg masks content under rounded corners -->
  <div class="hidden lg:sticky lg:top-0 lg:z-20 lg:block lg:bg-gray-50 dark:lg:bg-gray-950">
    <!-- Page title — vertically + horizontally centered -->
    <div class="flex items-center justify-center py-3">
      <h1 class="text-lg font-bold">
        {{ navigation.pageTitle }}
      </h1>
    </div>
    <!-- Rounded corner decoration — hangs below header, overlaps feed content.
         No background: content is visible through the center.
         Corner fills mask content in the rounded-off areas. -->
    <div class="relative h-0 pointer-events-none">
      <!-- Gray corner fills (quarter-circle cutouts matching border-radius) -->
      <div class="corner-mask-left absolute top-0 left-0 z-20 h-4 w-4" />
      <div class="corner-mask-right absolute top-0 right-0 z-20 h-4 w-4" />
      <!-- Border line only (transparent bg, just the curved border) -->
      <div class="absolute top-0 left-0 right-0 z-20 h-4 rounded-t-2xl border border-b-0 border-border" />
    </div>
  </div>
</template>

<style scoped>
.corner-mask-left,
.corner-mask-right {
  --corner-bg: rgb(249 250 251);
}

.dark .corner-mask-left,
.dark .corner-mask-right {
  --corner-bg: rgb(3 7 18);
}

.corner-mask-left {
  background: radial-gradient(circle at 100% 100%, transparent 1rem, var(--corner-bg) 1rem);
}

.corner-mask-right {
  background: radial-gradient(circle at 0% 100%, transparent 1rem, var(--corner-bg) 1rem);
}
</style>
