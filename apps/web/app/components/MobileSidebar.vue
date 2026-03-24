<script setup lang="ts">
import { NavDrawerItem, NavDrawerProfile } from '@repo/ui';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function handleItemClick(item: { to: string }) {
  navigation.closeSidebar();
  router.push(item.to);
}
</script>

<template>
  <aside class="flex flex-col h-full overflow-y-auto bg-white dark:bg-gray-900">
    <!-- Header: user profile -->
    <div class="border-b border-gray-100 dark:border-gray-800">
      <NavDrawerProfile
        :avatar="navigation.currentUser.avatar"
        :name="navigation.currentUser.name"
        :handle="`@${navigation.currentUser.username}`"
      />
    </div>

    <!-- Menu items -->
    <nav aria-label="Main menu" class="flex flex-col p-2">
      <NavDrawerItem
        v-for="item in navigation.menuItems"
        :key="item.id"
        :icon="item.icon"
        :label="item.label"
        :active="navigation.activeItemId === item.id"
        @click="handleItemClick(item)"
      />
    </nav>
  </aside>
</template>
