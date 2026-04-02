<script setup lang="ts">
import { PhHeart, PhPlus, PhSparkle } from '@phosphor-icons/vue';
import { Button, SideNav, SideNavItem, SideNavProfile } from '@repo/ui';
import { useAuthState } from '~/composables/useAuthState';
import { useFeedbackModal } from '~/composables/useFeedbackModal';
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const { isAuthenticated } = useAuthState();
const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
const { open: openFeedback } = useFeedbackModal();
const config = useRuntimeConfig();
const defaultInstance = config.public.defaultInstance as string;
</script>

<template>
  <!-- Logged out — just icon, tagline, sign in -->
  <div v-if="!isAuthenticated" class="flex flex-col px-4">
    <p class="mb-2 text-2xl font-bold text-foreground">
      Your feed, your way <PhHeart :size="22" weight="fill" class="inline-block align-text-bottom text-rose-400" />
    </p>
    <span class="mt-2 mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-galaxy-500 dark:text-galaxy-400">
      <PhSparkle :size="12" weight="fill" />
      Early Access
    </span>
    <div class="flex gap-2 w-full">
      <Button as-child size="sm" class="flex-1">
        <a :href="`https://${defaultInstance}/auth/sign_up`" target="_blank" rel="noopener noreferrer">
          Create account
        </a>
      </Button>
      <Button as-child variant="secondary" size="sm" class="flex-1">
        <NuxtLink to="/login">
          Sign in
        </NuxtLink>
      </Button>
    </div>
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
      <span class="inline-flex items-center gap-1.5 px-4 pb-1 text-xs font-medium text-galaxy-500 dark:text-galaxy-400">
        <PhSparkle :size="12" weight="fill" />
        Early Access
      </span>
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
      :dot="item.dot"
      @click="navigateTo(item.to)"
    />

    <template #footer>
      <SideNavItem
        icon="feedback"
        label="Feedback"
        @click="openFeedback()"
      />
    </template>
  </SideNav>
</template>
