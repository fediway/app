<script setup lang="ts">
import type { Conversation } from '@repo/types';
import Avatar from '../primitives/Avatar.vue';
import RelativeTime from '../primitives/RelativeTime.vue';

defineProps<{
  conversation: Conversation;
}>();

defineEmits<{
  click: [conversationId: string];
}>();

const HTML_STRIP_RE = /<[^>]*>/g;

function getParticipant(conversation: Conversation) {
  return conversation.accounts[0];
}

function getPreviewText(conversation: Conversation): string {
  if (!conversation.lastStatus)
    return '';
  return conversation.lastStatus.content.replace(HTML_STRIP_RE, '').slice(0, 100);
}
</script>

<template>
  <button
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    @click="$emit('click', conversation.id)"
  >
    <Avatar
      v-if="getParticipant(conversation)"
      :src="getParticipant(conversation)?.avatar"
      :alt="getParticipant(conversation)?.displayName"
      size="md"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="truncate font-semibold text-gray-900 dark:text-gray-100">
          {{ getParticipant(conversation)?.displayName }}
        </span>
        <RelativeTime
          v-if="conversation.lastStatus"
          :datetime="conversation.lastStatus.createdAt"
          class="shrink-0 text-xs text-gray-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <p
          class="truncate text-sm"
          :class="[conversation.unread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500']"
        >
          {{ getPreviewText(conversation) }}
        </p>
        <span
          v-if="conversation.unread"
          class="flex size-2 shrink-0 rounded-full bg-blue-500"
        />
      </div>
    </div>
  </button>
</template>
