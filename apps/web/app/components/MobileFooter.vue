<script setup lang="ts">
import type { BottomNavItemType } from '@repo/ui';
import type { Component } from 'vue';
import {
  PhBell,
  PhHouse,
  PhMagnifyingGlass,
  PhPlus,
  PhUser,
} from '@phosphor-icons/vue';
import { BottomNav } from '@repo/ui';
import { usePostComposer } from '~/composables/usePostComposer';
import { useScrollDirection } from '~/composables/useScrollDirection';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
const { activeTab, switchTab } = useTabNavigation();
const { hidden } = useScrollDirection();

const iconMap: Record<string, Component> = {
  'home': PhHouse,
  'search': PhMagnifyingGlass,
  'new-post': PhPlus,
  'notifications': PhBell,
  'profile': PhUser,
};

const navItems = computed<BottomNavItemType[]>(() =>
  navigation.mobileFooterItems.map(item => ({
    id: item.id,
    icon: iconMap[item.icon] ?? iconMap[item.id] ?? PhHouse,
    label: item.id === 'new-post' ? undefined : item.label,
    main: item.id === 'new-post',
    active: activeTab.value === item.id,
  })),
);

function handleItemClick(item: BottomNavItemType) {
  if (item.id === 'new-post') {
    openComposer();
    return;
  }
  if (item.id) {
    switchTab(item.id as any, path => router.push(path));
  }
}
</script>

<template>
  <footer
    class="sticky bottom-0 left-0 right-0 z-[100] px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out"
    :class="hidden ? 'translate-y-full' : 'translate-y-0'"
  >
    <BottomNav
      :items="navItems"
      @item-click="handleItemClick"
    />
  </footer>
</template>
