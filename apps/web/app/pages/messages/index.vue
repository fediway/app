<script setup lang="ts">
import type { Conversation as MastoConversation } from '@repo/types';
import { ChatList, PageHeader } from '@repo/ui';
import { computed } from 'vue';
import { useMessages } from '~/composables/useMessages';

const router = useRouter();
const { getConversations } = useMessages();

// Adapt local mock shape → mastodon Conversation shape for UI component
const conversations = computed(() =>
  getConversations().map(conv => ({
    id: conv.id,
    accounts: [{
      avatar: conv.participant.avatar,
      displayName: conv.participant.displayName,
      acct: conv.participant.acct,
    }],
    lastStatus: {
      content: conv.lastMessage,
      createdAt: conv.lastMessageAt,
    },
    unread: conv.unreadCount > 0,
  }) as unknown as MastoConversation),
);

function navigateToChat(conversationId: string) {
  router.push(`/messages/${conversationId}`);
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Messages" />

    <ChatList
      :conversations="conversations"
      @conversation-click="navigateToChat"
    />
  </div>
</template>
