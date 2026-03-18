<script setup lang="ts">
import type { Conversation } from '@repo/types';
import { PhWarningCircle } from '@phosphor-icons/vue';
import { EmptyState, MessageBubble, MessageInput, Skeleton } from '@repo/ui';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSafeClient } from '../composables/useStatusBridge';
import { useNavigationStore } from '../stores/navigation';

const route = useRoute();
const navigation = useNavigationStore();

const conversation = ref<Conversation | null>(null);
const messages = ref<Array<{ id: string; content: string; accountId: string; createdAt: string; favourited?: boolean }>>([]);
const newMessage = ref('');
const loading = ref(true);
const error = ref<Error | null>(null);

const threadId = computed(() => route.params.id as string);

const currentUserId = computed(() => navigation.currentUser.acct ? '1' : '');

const pageTitleInfo = computed(() => {
  const account = conversation.value?.accounts[0];
  if (!account)
    return null;
  return { title: account.displayName, avatar: account.avatar };
});
navigation.usePageTitle(pageTitleInfo);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const client = getSafeClient();
    if (!client)
      return;

    const conversations: Conversation[] = await client.rest.v1.conversations.list();
    conversation.value = conversations.find(c => c.id === threadId.value) ?? null;

    // Load messages from mock data
    const { mockMessages } = await import('../../../../packages/api/src/mock/fixtures/conversations');
    messages.value = mockMessages[threadId.value] ?? [];
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load conversation');
  }
  finally {
    loading.value = false;
  }
}

function handleSend() {
  if (!newMessage.value.trim())
    return;

  messages.value = [
    ...messages.value,
    {
      id: `msg-new-${Date.now()}`,
      content: newMessage.value,
      accountId: currentUserId.value,
      createdAt: new Date().toISOString(),
    },
  ];
  newMessage.value = '';
}

onMounted(load);
watch(threadId, load);
</script>

<template>
  <!-- Loading -->
  <div v-if="loading && !conversation" class="space-y-4 p-4">
    <Skeleton class="ml-auto h-10 w-2/3 rounded-2xl" />
    <Skeleton class="h-10 w-2/3 rounded-2xl" />
    <Skeleton class="ml-auto h-10 w-1/2 rounded-2xl" />
  </div>

  <!-- Error -->
  <EmptyState
    v-else-if="error"
    :icon="PhWarningCircle"
    title="Couldn't load conversation"
    action-label="Try again"
    @action="load"
  />

  <!-- Thread -->
  <div v-else-if="conversation" class="flex h-full flex-col">
    <div class="flex-1 space-y-3 overflow-y-auto p-4">
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :content="msg.content"
        :is-own="msg.accountId === currentUserId"
        :sent-at="msg.createdAt"
      />
    </div>

    <div class="border-t border-gray-200 p-3 dark:border-gray-800">
      <MessageInput
        v-model="newMessage"
        placeholder="Write a message..."
        @send="handleSend"
      />
    </div>
  </div>
</template>
