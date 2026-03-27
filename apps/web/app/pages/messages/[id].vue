<script setup lang="ts">
import { useAuth } from '@repo/api';
import { EmptyState, MessageBubble, MessageInput, Skeleton } from '@repo/ui';
import { computed, nextTick, ref, watch } from 'vue';
import { usePageHeader } from '~/composables/usePageHeader';

definePageMeta({ mobileFullscreen: true });

const route = useRoute();
const router = useRouter();
const { getConversationDetail, sendDirectMessage, isOwnMessage, formatMessageContent } = useConversationData();

const conversationId = computed(() => {
  const rawId = route.params.id;
  return (Array.isArray(rawId) ? rawId[0] : rawId) || '';
});

const { data, isLoading, error, refetch } = getConversationDetail(conversationId.value);

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

// All participant accts (other accounts + current user) — used to strip routing mentions
// Mastodon's conversation.accounts excludes the current user, so we add them explicitly
const { currentUser } = useAuth();
const allParticipantAccts = computed(() => {
  const accts = conversation.value?.accounts.map(a => a.acct) ?? [];
  if (currentUser.value?.acct)
    accts.push(currentUser.value.acct);
  return accts;
});

const newMessage = ref('');
const messagesContainer = ref<HTMLElement>();
const isSending = ref(false);

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content || !participant.value)
    return;

  isSending.value = true;
  newMessage.value = '';

  try {
    const lastMessageId = threadStatuses.value.at(-1)?.id;
    await sendDirectMessage(participant.value.acct, content, lastMessageId);
    refetch();
  }
  catch {
    // Restore message on failure
    newMessage.value = content;
  }
  finally {
    isSending.value = false;
  }
}

function goBack() {
  router.push('/messages');
}

// Set page header to show participant avatar + name in MobileHeader
usePageHeader({
  title: computed(() => participant.value?.displayName ?? 'Conversation'),
  subtitle: computed(() => participant.value ? `@${participant.value.acct}` : undefined),
  image: computed(() => participant.value?.avatar),
});

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
  <div class="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:min-h-[calc(100vh-32px)]">
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
            :content="formatMessageContent(status.content, allParticipantAccts)"
            :is-own="isOwnMessage(status)"
            :sent-at="status.createdAt"
          />
        </div>

        <!-- Message Input — sticky at bottom -->
        <div class="sticky bottom-0 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3">
          <MessageInput
            v-model="newMessage"
            placeholder="Write a message..."
            :disabled="isSending"
            @send="handleSend"
          />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
