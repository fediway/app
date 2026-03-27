<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import { Button, SideNav, SideNavItem, SideNavProfile } from '@repo/ui';
import { useAuthState } from '~/composables/useAuthState';
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const { isAuthenticated } = useAuthState();
const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
</script>

<template>
  <!-- Logged out — just icon, tagline, sign in -->
  <div v-if="!isAuthenticated" class="flex flex-col items-start px-4 pt-14">
    <img src="/images/app-icon-transparent.svg" alt="Fediway" class="size-10 mb-4">
    <p class="text-sm text-muted-foreground mb-6">
      Social media as it should be
    </p>
    <Button as-child class="w-full py-3 text-base">
      <NuxtLink to="/login">
        Sign in
      </NuxtLink>
    </Button>
  </div>

  <!-- Logged in — full navigation -->
  <SideNav v-else>
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
            <img src="/images/app-icon-transparent.svg" alt="Fediway" class="size-8">
          </div>
        </template>
      </ClientOnly>
    </template>

    <template #action>
      <Button class="w-full py-3 text-base" @click="openComposer()">
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
