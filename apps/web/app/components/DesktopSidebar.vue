<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import { Button, SideNav, SideNavItem, SideNavProfile } from '@repo/ui';
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
</script>

<template>
  <SideNav>
    <template #profile>
      <SideNavProfile
        :avatar="navigation.currentUser.avatar"
        :name="navigation.currentUser.name"
        :handle="`@${navigation.currentUser.acct}`"
        @click="navigateTo(`/@${navigation.currentUser.acct}`)"
      />
    </template>

    <template #action>
      <Button class="w-full py-3 text-[15px]" @click="openComposer()">
        <PhPlus :size="20" />
        <span>New Post</span>
      </Button>
    </template>

    <SideNavItem
      v-for="item in navigation.menuItems"
      :key="item.id"
      :icon="item.icon"
      :label="item.label"
      :active="navigation.activeItemId === item.id"
      @click="navigateTo(item.to)"
    />
  </SideNav>
</template>
