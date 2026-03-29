<script setup lang="ts">
import { ChatList, EmptyState, PageHeader, Skeleton } from '@repo/ui';

const router = useRouter();
const { getConversations } = useConversationData();
const { data: conversations, isLoading, error, refetch } = getConversations();

usePageHeader({ title: 'Messages' });

function navigateToChat(conversationId: string) {
  router.push(`/messages/${conversationId}`);
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Messages" />

    <ClientOnly>
      <!-- Loading -->
      <div v-if="isLoading && conversations.length === 0" class="space-y-1 p-4">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3 rounded-lg px-2 py-3">
          <Skeleton class="size-10 rounded-full" />
          <div class="flex-1 space-y-1.5">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-48" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <EmptyState
        v-else-if="error"
        :title="error.message || 'Failed to load messages'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="conversations.length === 0"
        title="No messages yet"
        description="Direct messages with other users will appear here."
        class="py-12"
      />

      <!-- Conversations list -->
      <ChatList
        v-else
        :conversations="conversations"
        @conversation-click="navigateToChat"
      />
    </ClientOnly>
  </div>
</template>
