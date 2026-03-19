<script setup lang="ts">
import { ChatHeader, EmptyState, MessageBubble, MessageInput } from '@repo/ui';
import { computed, nextTick, ref, watch } from 'vue';
import { useMessages } from '~/composables/useMessages';

const route = useRoute();
const router = useRouter();
const { getMessages, getParticipant, sendMessage, markAsRead } = useMessages();

const conversationId = computed(() => {
  const rawId = route.params.id;
  return (Array.isArray(rawId) ? rawId[0] : rawId) || '1';
});

const participant = computed(() => getParticipant(conversationId.value));
const messages = computed(() => getMessages(conversationId.value));

// Mark as read when entering
watch(conversationId, id => markAsRead(id), { immediate: true });

const newMessage = ref('');
const messagesContainer = ref<HTMLElement>();

function handleSend() {
  if (!newMessage.value.trim())
    return;
  sendMessage(conversationId.value, newMessage.value.trim());
  newMessage.value = '';
}

function goBack() {
  router.push('/messages');
}

function mapSharedStatus(shared?: { authorName: string; authorAvatar: string; content: string; imageUrl?: string }) {
  if (!shared)
    return undefined;
  return {
    authorName: shared.authorName,
    authorAvatar: shared.authorAvatar,
    content: shared.content,
    imageUrl: shared.imageUrl,
  };
}

// Scroll to bottom on new messages
watch(() => messages.value.length, () => {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  });
});
</script>

<template>
  <div class="flex h-full min-h-[calc(100vh-112px)] flex-col lg:min-h-[calc(100vh-32px)]">
    <!-- Chat Header -->
    <ChatHeader
      v-if="participant"
      :participant="participant"
      @back="goBack"
    />

    <!-- Not found -->
    <EmptyState
      v-if="!participant"
      title="Conversation not found"
      action-label="Back to messages"
      class="py-12"
      @action="goBack"
    />

    <template v-else>
      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :content="message.content"
          :is-own="message.isOwn"
          :sent-at="message.sentAt"
          :favourited="message.favourited"
          :shared-status="mapSharedStatus(message.sharedStatus)"
        />
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <MessageInput
          v-model="newMessage"
          placeholder="Write a message..."
          @send="handleSend"
        />
      </div>
    </template>
  </div>
</template>
