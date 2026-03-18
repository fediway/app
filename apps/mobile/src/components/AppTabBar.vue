<script setup lang="ts">
import type { BottomNavItemType } from '@repo/ui';
import {
  PhBell,
  PhHouse,
  PhMagnifyingGlass,
  PhPlusSquare,
  PhUser,
} from '@phosphor-icons/vue';
import { BottomNav } from '@repo/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../stores/navigation';

const emit = defineEmits<{
  compose: [];
}>();

const router = useRouter();
const navigation = useNavigationStore();

const TAB_ICONS: Record<string, any> = {
  'home': PhHouse,
  'search': PhMagnifyingGlass,
  'new-post': PhPlusSquare,
  'notifications': PhBell,
  'profile': PhUser,
};

const navItems = computed<BottomNavItemType[]>(() =>
  navigation.tabItems.map(item => ({
    id: item.id,
    icon: TAB_ICONS[item.id],
    label: item.id === 'new-post' ? undefined : item.label,
    main: item.id === 'new-post',
    active: navigation.activeTab === item.id,
  })),
);

function handleItemClick(item: BottomNavItemType) {
  if (item.id === 'new-post') {
    emit('compose');
    return;
  }

  const navItem = navigation.tabItems.find(t => t.id === item.id);
  if (navItem) {
    router.push(navItem.to);
  }
}
</script>

<template>
  <div class="safe-area-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
    <BottomNav
      :items="navItems"
      @item-click="handleItemClick"
    />
  </div>
</template>
