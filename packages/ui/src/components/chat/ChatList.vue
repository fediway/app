<script setup lang="ts">
import type { Conversation } from '@repo/types';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import ConversationListItem from './ChatListItem.vue';

defineProps<{
  conversations: Conversation[];
  loading?: boolean;
  hasMore?: boolean;
  error?: string;
}>();

defineEmits<{
  conversationClick: [conversationId: string];
  loadMore: [];
  retry: [];
}>();
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading && conversations.length === 0" class="divide-y divide-border">
    <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-4 py-3">
      <Skeleton class="size-10 rounded-full" />
      <div class="flex-1 space-y-2">
        <div class="flex justify-between">
          <Skeleton class="h-4 w-1/3" />
          <Skeleton class="h-3 w-12" />
        </div>
        <Skeleton class="h-3 w-2/3" />
      </div>
    </div>
  </div>

  <!-- Error state -->
  <EmptyState
    v-else-if="error"
    :title="error"
    action-label="Try again"
    @action="$emit('retry')"
  />

  <!-- Conversation list -->
  <div v-else-if="conversations.length > 0" class="divide-y divide-border">
    <ConversationListItem
      v-for="conversation in conversations"
      :key="conversation.id"
      :conversation="conversation"
      @click="id => $emit('conversationClick', id)"
    />
  </div>

  <!-- Empty state -->
  <EmptyState v-else title="No messages yet" />
</template>
