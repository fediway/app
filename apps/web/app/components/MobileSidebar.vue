<script setup lang="ts">
import { NavDrawer, NavDrawerItem, NavDrawerProfile, Skeleton } from '@repo/ui';
import { useFeedbackModal } from '~/composables/useFeedbackModal';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { getProfilePath } = useAccountData();
const { open: openFeedback } = useFeedbackModal();

function handleFeedbackClick() {
  navigation.closeSidebar();
  nextTick(() => openFeedback());
}

function handleItemClick(item: { to: string }) {
  navigation.closeSidebar();
  router.push(item.to);
}

function handleProfileClick() {
  navigation.closeSidebar();
  if (navigation.currentUser) {
    router.push(getProfilePath(navigation.currentUser.acct));
  }
}

function handleStatClick(stat: 'followers' | 'following') {
  navigation.closeSidebar();
  if (navigation.currentUser) {
    router.push(`${getProfilePath(navigation.currentUser.acct)}/${stat}`);
  }
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
          :followers-count="navigation.currentUser.followersCount"
          :following-count="navigation.currentUser.followingCount"
          @profile-click="handleProfileClick"
          @stat-click="handleStatClick"
        />
        <template #fallback>
          <div class="flex items-center gap-3 px-5 py-3">
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
        :dot="item.dot"
        @click="handleItemClick(item)"
      />

      <!-- Early Access feedback — below Settings, same as desktop sidebar -->
      <div class="px-1 pb-4 pt-3">
        <button
          class="group flex w-full items-center gap-3 rounded-xl border border-galaxy-500/20 bg-galaxy-500/5 px-3.5 py-3 text-left transition-colors hover:bg-galaxy-500/10"
          @click="handleFeedbackClick"
        >
          <span class="text-base text-galaxy-500 dark:text-galaxy-400">&#10022;</span>
          <div class="min-w-0 flex-1">
            <span class="text-xs font-semibold text-galaxy-500 dark:text-galaxy-400">Early Access</span>
            <span class="block text-xs text-muted-foreground">Your feedback shapes what's next</span>
          </div>
          <span class="text-sm text-galaxy-500/60 transition-colors group-hover:text-galaxy-500">&rsaquo;</span>
        </button>
      </div>
    </nav>
  </NavDrawer>
</template>
