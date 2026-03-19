<script setup lang="ts">
import { NavDrawer, NavDrawerItem, NavDrawerProfile } from '@repo/ui';
import { onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useBackButton } from '../composables/useBackButton';
import { useNavigationStore } from '../stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { register: registerBackButton } = useBackButton();

let unregisterBack: (() => void) | null = null;

function onOpenChange(open: boolean) {
  if (open) {
    unregisterBack = registerBackButton(90, () => {
      navigation.closeDrawer();
      return true;
    });
  }
  else {
    navigation.closeDrawer();
    unregisterBack?.();
    unregisterBack = null;
  }
}

onBeforeUnmount(() => {
  unregisterBack?.();
  unregisterBack = null;
});

function handleItemClick(item: { to: string }) {
  navigation.closeDrawer();
  router.push(item.to);
}
</script>

<template>
  <NavDrawer :open="navigation.isDrawerOpen" @update:open="onOpenChange">
    <template #header>
      <NavDrawerProfile
        :avatar="navigation.currentUser.avatar"
        :name="navigation.currentUser.name"
        :handle="`@${navigation.currentUser.username}`"
      />
    </template>

    <NavDrawerItem
      v-for="item in navigation.drawerItems"
      :key="item.id"
      :icon="item.icon"
      :label="item.label"
      :active="navigation.activeItemId === item.id"
      @click="handleItemClick(item)"
    />
  </NavDrawer>
</template>
