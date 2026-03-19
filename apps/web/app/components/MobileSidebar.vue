<script setup lang="ts">
import { NavDrawer, NavDrawerItem, NavDrawerProfile } from '@repo/ui';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function handleOpenChange(open: boolean) {
  if (open) {
    navigation.openSidebar();
  }
  else {
    navigation.closeSidebar();
  }
}

function handleItemClick(item: { to: string }) {
  navigation.closeSidebar();
  router.push(item.to);
}
</script>

<template>
  <NavDrawer :open="navigation.isSidebarOpen" @update:open="handleOpenChange">
    <template #header>
      <NavDrawerProfile
        :avatar="navigation.currentUser.avatar"
        :name="navigation.currentUser.name"
        :handle="`@${navigation.currentUser.username}`"
      />
    </template>

    <NavDrawerItem
      v-for="item in navigation.menuItems"
      :key="item.id"
      :icon="item.icon"
      :label="item.label"
      :active="navigation.activeItemId === item.id"
      @click="handleItemClick(item)"
    />
  </NavDrawer>
</template>
