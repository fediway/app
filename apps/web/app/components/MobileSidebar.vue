<script setup lang="ts">
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function handleItemClick(item: { id: string; to: string }) {
  navigation.closeSidebar();
  router.push(item.to);
}

function handleOverlayClick() {
  navigation.closeSidebar();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="navigation.isSidebarOpen"
      class="fixed inset-0 z-[200] bg-black/50"
      @click="handleOverlayClick"
    >
      <aside
        class="absolute top-0 left-0 bottom-0 w-[280px] max-w-[80vw] bg-white border-r border-gray-200 overflow-y-auto"
        @click.stop
      >
        <!-- Close Button -->
        <div class="flex justify-end p-2">
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            @click="navigation.closeSidebar"
          >
            <NavIcon name="close" :size="24" />
          </button>
        </div>

        <!-- User Profile Section -->
        <div class="flex flex-col items-center px-4 pb-6 mb-2 border-b border-gray-100">
          <div class="w-16 h-16 rounded-full border border-gray-300 bg-gray-100 mb-3" aria-label="Profile picture" />
          <div class="text-base font-semibold">
            {{ navigation.currentUser.name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ navigation.currentUser.username }}
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex flex-col p-2">
          <button
            v-for="item in navigation.menuItems"
            :key="item.id"
            type="button"
            class="flex items-center gap-4 w-full py-3.5 px-4 bg-transparent border-none cursor-pointer text-left rounded-lg hover:bg-gray-100 transition-colors" :class="[
              navigation.activeItemId === item.id ? 'font-semibold bg-gray-50' : 'text-gray-700',
            ]"
            @click="handleItemClick(item)"
          >
            <NavIcon :name="item.icon" :size="22" />
            <span class="text-base">{{ item.label }}</span>
          </button>
        </nav>
      </aside>
    </div>
  </Teleport>
</template>
