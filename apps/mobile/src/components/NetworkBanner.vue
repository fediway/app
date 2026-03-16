<script setup lang="ts">
import { PhWifiSlash } from '@phosphor-icons/vue';
import { useNetwork } from '../composables/useNetwork';

const { isOnline } = useNetwork();
</script>

<template>
  <Transition name="banner">
    <div
      v-if="!isOnline"
      class="fixed inset-x-0 z-50 flex items-center justify-center gap-2 bg-orange-500 px-4 py-2 text-sm font-medium text-white"
      :style="{ top: 'calc(3.5rem + var(--safe-area-inset-top))' }"
    >
      <PhWifiSlash :size="16" />
      <span>No internet connection</span>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.banner-enter-from,
.banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
