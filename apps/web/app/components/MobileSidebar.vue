<script setup lang="ts">
import { NavDrawer, NavDrawerItem, NavDrawerProfile, Skeleton } from '@repo/ui';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function handleItemClick(item: { to: string }) {
  navigation.closeSidebar();
  router.push(item.to);
}

function handleOpenChange(open: boolean) {
  if (!open)
    navigation.closeSidebar();
}
</script>

<template>
  <NavDrawer :open="navigation.isSidebarOpen" @update:open="handleOpenChange">
    <template #header>
      <ClientOnly>
        <NavDrawerProfile
          v-if="navigation.currentUser"
          :avatar="navigation.currentUser.avatar"
          :name="navigation.currentUser.name"
          :handle="`@${navigation.currentUser.username}`"
        />
        <template #fallback>
          <div class="flex items-center gap-3 px-4 py-3">
            <Skeleton class="size-10 rounded-full" />
            <div class="space-y-1.5">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-3 w-16" />
            </div>
          </div>
        </template>
      </ClientOnly>
    </template>

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
  </NavDrawer>
</template>
