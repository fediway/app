<script setup lang="ts">
import type { BottomNavItemType } from '@repo/ui';
import type { Component } from 'vue';
import type { TabId } from '~/composables/useTabNavigation';
import {
  PhChatCircle,
  PhHouse,
  PhMagnifyingGlass,
  PhPlus,
  PhUser,
} from '@phosphor-icons/vue';
import { useAuth } from '@repo/api';
import { Avatar, BottomNav, Button, MessageInput } from '@repo/ui';
import { useMobileChatInput } from '~/composables/useMobileChatInput';
import { useMobileReplyTarget } from '~/composables/useMobileReplyTarget';
import { usePostComposer } from '~/composables/usePostComposer';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
const { activeTab, switchTab } = useTabNavigation();
const { isAuthenticated, currentUser } = useAuth();
const { replyTarget } = useMobileReplyTarget();
const { chatTarget, chatMessage } = useMobileChatInput();
const config = useRuntimeConfig();
const defaultInstance = config.public.defaultInstance as string;

const iconMap: Record<string, Component> = {
  'home': PhHouse,
  'search': PhMagnifyingGlass,
  'new-post': PhPlus,
  'chat': PhChatCircle,
  'profile': PhUser,
};

const navItems = computed<BottomNavItemType[]>(() =>
  navigation.mobileFooterItems.map(item => ({
    id: item.id,
    icon: iconMap[item.icon] ?? iconMap[item.id] ?? PhHouse,
    label: item.id === 'new-post' ? undefined : item.label,
    ariaLabel: item.id === 'new-post' ? 'New Post' : undefined,
    main: item.id === 'new-post',
    active: activeTab.value === item.id,
    dot: item.dot,
  })),
);

function handleItemClick(item: BottomNavItemType) {
  if (item.id === 'new-post') {
    openComposer();
    return;
  }
  if (item.id) {
    switchTab(item.id as TabId, path => router.push(path));
  }
}

const replyPlaceholder = computed(() =>
  replyTarget.value
    ? `Reply to @${replyTarget.value.account.acct}...`
    : 'Write a reply...',
);

function handleReplyClick() {
  if (replyTarget.value)
    openComposer(replyTarget.value);
}

function handleChatSend() {
  if (chatTarget.value && chatMessage.value.trim()) {
    chatTarget.value.onSend(chatMessage.value);
  }
}
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
  >
    <!-- Logged out: auth buttons in the same floating pill -->
    <div
      v-if="!isAuthenticated"
      class="flex items-center gap-3 rounded-full bg-card px-4 py-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
    >
      <Button as-child variant="secondary" class="flex-1 rounded-full">
        <NuxtLink to="/login">
          Sign in
        </NuxtLink>
      </Button>
      <Button as-child class="flex-1 rounded-full">
        <a :href="`https://${defaultInstance}/auth/sign_up`" target="_blank" rel="noopener noreferrer">
          Create account
        </a>
      </Button>
    </div>

    <!-- Chat input on conversation detail -->
    <div
      v-else-if="chatTarget"
      class="rounded-full bg-card px-3 py-2 shadow-[0_2px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
    >
      <MessageInput
        v-model="chatMessage"
        placeholder="Write a message..."
        @send="handleChatSend"
      />
    </div>

    <!-- Reply bar on status detail -->
    <button
      v-else-if="replyTarget"
      type="button"
      class="flex w-full items-center gap-3 rounded-full bg-card px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] cursor-text"
      @click="handleReplyClick"
    >
      <Avatar
        :src="currentUser?.avatar"
        :alt="currentUser?.displayName || currentUser?.username"
        size="sm"
        class="shrink-0"
      />
      <span class="flex-1 text-left text-base text-muted-foreground truncate">{{ replyPlaceholder }}</span>
    </button>

    <nav v-else aria-label="Tab navigation">
      <BottomNav
        :items="navItems"
        @item-click="handleItemClick"
      />
    </nav>
  </div>
</template>
