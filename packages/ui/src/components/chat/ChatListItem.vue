<script setup lang="ts">
import type { Conversation } from '@repo/types';
import { computed } from 'vue';
import AvatarStack from '../ui/avatar-stack/AvatarStack.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';

const props = defineProps<{
  conversation: Conversation;
}>();

defineEmits<{
  click: [conversationId: string];
}>();

const HTML_STRIP_RE = /<[^>]*>/g;

const isGroup = computed(() => props.conversation.accounts.length > 1);

const displayName = computed(() => {
  const accounts = props.conversation.accounts;
  if (accounts.length <= 3) {
    return accounts.map(a => a.displayName || a.username).join(', ');
  }
  const shown = accounts.slice(0, 2).map(a => a.displayName || a.username).join(', ');
  return `${shown} +${accounts.length - 2}`;
});

const avatarStackItems = computed(() =>
  props.conversation.accounts.map(a => ({
    src: a.avatar,
    alt: a.displayName || a.username,
  })),
);

function isOwnMessage(conversation: Conversation): boolean {
  if (!conversation.lastStatus)
    return false;
  return !conversation.accounts.some(a => a.acct === conversation.lastStatus!.account.acct);
}

function getSenderName(conversation: Conversation): string | null {
  if (!conversation.lastStatus || !isGroup.value)
    return null;
  if (isOwnMessage(conversation))
    return 'You';
  const sender = conversation.lastStatus.account;
  return sender.displayName || sender.username;
}

function getMessageText(conversation: Conversation): string {
  if (!conversation.lastStatus)
    return '';
  return conversation.lastStatus.content.replace(HTML_STRIP_RE, '').slice(0, 100);
}
</script>

<template>
  <button
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
    @click="$emit('click', conversation.id)"
  >
    <AvatarStack
      v-if="isGroup"
      :avatars="avatarStackItems"
      :max="3"
      class="shrink-0"
    />
    <Avatar
      v-else-if="conversation.accounts[0]"
      :src="conversation.accounts[0]?.avatar"
      :alt="conversation.accounts[0]?.displayName"
      size="md"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="truncate font-semibold text-foreground">
          {{ displayName }}
        </span>
        <RelativeTime
          v-if="conversation.lastStatus"
          :datetime="conversation.lastStatus.createdAt"
          class="shrink-0 text-xs text-muted-foreground"
        />
      </div>
      <div class="flex items-center gap-2">
        <p
          class="truncate text-sm" :class="[
            conversation.unread && !isOwnMessage(conversation)
              ? 'font-medium text-foreground'
              : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          <span v-if="getSenderName(conversation)" class="text-gray-400 dark:text-gray-500">{{ getSenderName(conversation) }}: </span>{{ getMessageText(conversation) }}
        </p>
        <span
          v-if="conversation.unread"
          class="flex size-2 shrink-0 rounded-full bg-galaxy-500"
        />
      </div>
    </div>
  </button>
</template>
