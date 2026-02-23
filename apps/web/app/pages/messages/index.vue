<script setup lang="ts">
import { useMessages } from '~/composables/useMessages';

const { getConversations } = useMessages();

const conversations = computed(() => getConversations());

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60)
    return `${diffMin}m`;
  if (diffHour < 24)
    return `${diffHour}h`;
  if (diffDay < 7)
    return `${diffDay}d`;
  return date.toLocaleDateString();
}
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200">
      <h1 class="text-xl font-bold">
        Messages
      </h1>
    </div>

    <!-- Conversation List -->
    <div class="divide-y divide-gray-100">
      <NuxtLink
        v-for="conversation in conversations"
        :key="conversation.id"
        :to="`/messages/${conversation.id}`"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors no-underline"
      >
        <!-- Avatar -->
        <img
          :src="conversation.participant.avatar"
          :alt="conversation.participant.displayName"
          class="w-12 h-12 rounded-full object-cover"
        >

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-gray-900 truncate">
              {{ conversation.participant.displayName }}
            </span>
            <span class="text-xs text-gray-500 flex-shrink-0">
              {{ formatTime(conversation.lastMessageAt) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <p
              class="text-sm truncate" :class="[
                conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500',
              ]"
            >
              {{ conversation.lastMessage }}
            </p>
            <span
              v-if="conversation.unreadCount > 0"
              class="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
            >
              {{ conversation.unreadCount }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-if="conversations.length === 0" class="text-center py-12 text-gray-500">
      <p>No messages yet</p>
    </div>
  </div>
</template>
