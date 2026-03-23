<script setup lang="ts">
import type { Conversation, Status } from '@repo/types';
import { useClient } from '@repo/api';
import { ChatHeader, EmptyState, MessageBubble, MessageInput, Skeleton } from '@repo/ui';
import { computed, nextTick, ref, watch } from 'vue';
import { createDataResult } from '~/composables/useDataHelpers';

const route = useRoute();
const router = useRouter();
const client = useClient();

const conversationId = computed(() => {
  const rawId = route.params.id;
  return (Array.isArray(rawId) ? rawId[0] : rawId) || '';
});

// Fetch the conversation directly + its message thread in one shot
const { data, isLoading, error } = createDataResult<{ conversation: Conversation | null; messages: Status[] }>(
  `conversation-detail:${conversationId.value}`,
  { conversation: null, messages: [] },
  async () => {
    // First, get the conversation (mark as read)
    const conv = await client.rest.v1.conversations.$select(conversationId.value).read();

    if (!conv?.lastStatus) {
      return { conversation: conv, messages: [] };
    }

    // Then fetch the thread context
    const context = await client.rest.v1.statuses.$select(conv.lastStatus.id).context.fetch();
    const messages = [...context.ancestors, conv.lastStatus, ...context.descendants];

    return { conversation: conv, messages };
  },
);

const conversation = computed(() => data.value.conversation);
const threadStatuses = computed(() => data.value.messages);

const participant = computed(() => {
  const account = conversation.value?.accounts[0];
  if (!account)
    return null;
  return {
    displayName: account.displayName,
    acct: account.acct,
    avatar: account.avatar,
  };
});

// Determine which messages are "own" (sent by the logged-in user, not the participant)
function isOwnMessage(status: Status): boolean {
  const participantAcct = participant.value?.acct;
  return status.account.acct !== participantAcct;
}

function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

const newMessage = ref('');
const messagesContainer = ref<HTMLElement>();

function handleSend() {
  if (!newMessage.value.trim())
    return;

  const participantAccount = conversation.value?.accounts[0];
  if (!participantAccount)
    return;

  client.rest.v1.statuses.create({
    status: `@${participantAccount.acct} ${newMessage.value.trim()}`,
    visibility: 'direct',
  });

  newMessage.value = '';
}

function goBack() {
  router.push('/messages');
}

// Scroll to bottom on new messages
watch(() => threadStatuses.value.length, () => {
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

    <ClientOnly>
      <!-- Loading -->
      <div v-if="isLoading" class="flex-1 space-y-3 p-4">
        <div v-for="i in 3" :key="i" class="flex" :class="i % 2 === 0 ? 'justify-end' : ''">
          <Skeleton class="h-12 w-48 rounded-2xl" />
        </div>
      </div>

      <!-- Not found -->
      <EmptyState
        v-else-if="error || !conversation"
        title="Conversation not found"
        action-label="Back to messages"
        class="py-12"
        @action="goBack"
      />

      <template v-else>
        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <MessageBubble
            v-for="status in threadStatuses"
            :key="status.id"
            :content="stripHtml(status.content)"
            :is-own="isOwnMessage(status)"
            :sent-at="status.createdAt"
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
    </ClientOnly>
  </div>
</template>
