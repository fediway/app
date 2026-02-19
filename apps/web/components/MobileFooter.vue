<script setup lang="ts">
import { usePostComposer } from '~/composables/usePostComposer';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
const { activeTab, switchTab } = useTabNavigation();

function handleTabTap(itemId: string) {
  if (itemId === 'new-post') {
    openComposer();
    return;
  }
  switchTab(itemId as any, path => router.push(path));
}
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
          @click="handleTabTap(item.id)"
        >
          <NavIcon :name="item.icon" :size="24" />
        </button>
        <!-- Tab buttons -->
        <button
          v-else
          type="button"
          class="flex items-center justify-center rounded-full transition-colors no-underline w-11 h-11 hover:bg-gray-100 border-none bg-transparent cursor-pointer" :class="[
            activeTab === item.id ? 'text-gray-900' : 'text-gray-500',
          ]"
          @click="handleTabTap(item.id)"
        >
          <NavIcon :name="item.icon" :size="22" />
        </button>
      </template>
    </nav>
  </footer>
</template>
