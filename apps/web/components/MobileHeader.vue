<script setup lang="ts">
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-[100]">
    <button
      type="button"
      class="flex items-center justify-center w-11 h-11 bg-transparent border-none cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
      @click="navigation.openSidebar"
    >
      <NavIcon name="menu" :size="24" />
    </button>
    <h1 class="text-lg font-semibold m-0 dark:text-white">
      {{ navigation.pageTitle }}
    </h1>
    <button
      type="button"
      class="flex items-center justify-center w-11 h-11 bg-transparent border-none cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
      @click="router.push('/explore')"
    >
      <NavIcon name="explore" :size="24" />
    </button>
  </header>
</template>
