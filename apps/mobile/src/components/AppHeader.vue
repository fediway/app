<script setup lang="ts">
import { PhArrowLeft, PhList, PhMagnifyingGlass } from '@phosphor-icons/vue';
import { Button } from '@repo/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../stores/navigation';

const props = withDefaults(defineProps<{
  showBack?: boolean;
}>(), {
  showBack: false,
});

const router = useRouter();
const navigation = useNavigationStore();

const showBackButton = computed(() => {
  return props.showBack || !navigation.activeTab;
});
</script>

<template>
  <header class="safe-area-top fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div class="flex h-14 items-center justify-between px-2">
      <!-- Left: back or menu -->
      <Button
        v-if="showBackButton"
        variant="muted"
        size="icon"
        aria-label="Go back"
        @click="router.back()"
      >
        <PhArrowLeft :size="24" />
      </Button>
      <Button
        v-else
        variant="muted"
        size="icon"
        aria-label="Open menu"
        @click="navigation.openDrawer()"
      >
        <PhList :size="24" />
      </Button>

      <!-- Center: title -->
      <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ navigation.pageTitle }}
      </h1>

      <!-- Right: explore -->
      <Button
        variant="muted"
        size="icon"
        aria-label="Explore"
        @click="router.push('/explore')"
      >
        <PhMagnifyingGlass :size="24" />
      </Button>
    </div>
  </header>
</template>
