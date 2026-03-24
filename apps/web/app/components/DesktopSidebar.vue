<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import { Button, SideNav, SideNavItem, SideNavProfile, Skeleton } from '@repo/ui';
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
</script>

<template>
  <SideNav>
    <template #profile>
      <ClientOnly>
        <SideNavProfile
          v-if="navigation.currentUser"
          :avatar="navigation.currentUser.avatar"
          :name="navigation.currentUser.name"
          :handle="`@${navigation.currentUser.acct}`"
          @click="navigateTo(`/@${navigation.currentUser.acct}`)"
        />
        <template #fallback>
          <div class="flex items-center gap-3 px-4 py-3">
            <Skeleton class="size-8 rounded-full" />
            <div class="space-y-1">
              <Skeleton class="h-3.5 w-24" />
              <Skeleton class="h-3 w-16" />
            </div>
          </div>
        </template>
      </ClientOnly>
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
