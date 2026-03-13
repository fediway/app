<script setup lang="ts">
import type { NavItem } from '@ui/components/navigation';
import {
  PhBell,
  PhHouse,
  PhMagnifyingGlass,
  PhPlusSquare,
  PhUser,
} from '@phosphor-icons/vue';
import MainNavigation from '@ui/components/navigation/MainNavigation.vue';
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

const navItems = computed<NavItem[]>(() =>
  navigation.tabItems.map(item => ({
    icon: TAB_ICONS[item.id],
    label: item.id === 'new-post' ? undefined : item.label,
    main: item.id === 'new-post',
    active: navigation.activeTab === item.id,
  })),
);

function handleClick(e: Event) {
  const target = (e.target as HTMLElement).closest('button, a');
  if (!target)
    return;

  const nav = target.closest('nav');
  if (!nav)
    return;

  const buttons = [...nav.querySelectorAll(':scope > button, :scope > a')];
  const index = buttons.indexOf(target as Element);
  if (index === -1)
    return;

  const item = navigation.tabItems[index];
  if (!item)
    return;

  if (item.id === 'new-post') {
    emit('compose');
    return;
  }

  router.push(item.to);
}
</script>

<template>
  <div class="safe-area-bottom fixed inset-x-0 bottom-0 z-40" @click="handleClick">
    <MainNavigation :items="navItems" />
  </div>
</template>
