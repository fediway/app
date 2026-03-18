<script setup lang="ts">
import { Button, NavIcon } from '@repo/ui';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { canGoBack } = useTabNavigation();
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-[100]">
    <!-- Back arrow when on detail page, hamburger at tab root -->
    <Button
      v-if="canGoBack"
      variant="muted"
      size="icon"
      @click="router.back()"
    >
      <NavIcon name="back" :size="24" />
    </Button>
    <Button
      v-else
      variant="muted"
      size="icon"
      @click="navigation.openSidebar"
    >
      <NavIcon name="menu" :size="24" />
    </Button>
    <h1 class="text-lg font-semibold m-0 dark:text-white">
      {{ navigation.pageTitle }}
    </h1>
    <Button
      variant="muted"
      size="icon"
      @click="router.push('/explore')"
    >
      <NavIcon name="explore" :size="24" />
    </Button>
  </header>
</template>
