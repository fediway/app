<script setup lang="ts">
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const navigation = useNavigationStore();
const route = useRoute();
const { open: openComposer } = usePostComposer();

// Update active item based on current route
watchEffect(() => {
  const item = navigation.mobileFooterItems.find(item => item.to === route.path);
  if (item) {
    navigation.setActiveItem(item.id);
  }
});
</script>

<template>
  <footer class="fixed bottom-0 left-0 right-0 h-14 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-[100]">
    <nav class="flex items-center justify-around h-full">
      <template v-for="item in navigation.mobileFooterItems" :key="item.id">
        <!-- New Post Button (opens modal) -->
        <button
          v-if="item.id === 'new-post'"
          type="button"
          class="flex items-center justify-center rounded-full transition-colors w-12 h-12 bg-gray-900 text-white hover:bg-gray-700"
          @click="openComposer()"
        >
          <NavIcon :name="item.icon" :size="24" />
        </button>
        <!-- Regular navigation links -->
        <NuxtLink
          v-else
          :to="item.to"
          class="flex items-center justify-center rounded-full transition-colors no-underline w-11 h-11 hover:bg-gray-100" :class="[
            navigation.activeItemId === item.id ? 'text-gray-900' : 'text-gray-500',
          ]"
        >
          <NavIcon :name="item.icon" :size="22" />
        </NuxtLink>
      </template>
    </nav>
  </footer>
</template>
