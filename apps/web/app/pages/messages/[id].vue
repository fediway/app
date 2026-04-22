<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import { useAuth } from '@repo/api';
import { EmptyState, formatCalendarLabel, MediaLightbox, MessageBubble, MessageInput, Skeleton, useToast } from '@repo/ui';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMobileChatInput } from '~/composables/useMobileChatInput';
import { usePageHeader } from '~/composables/usePageHeader';

definePageMeta({
  key: route => route.path,
});

const route = useRoute();
const router = useRouter();
const { getConversationDetail, sendDirectMessage, isOwnMessage, formatMessageContent } = useConversationData();

const { toast } = useToast();

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
    emojis: account.emojis,
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

const isGroupChat = computed(() => (conversation.value?.accounts.length ?? 0) > 1);
const previousMessageCount = ref(0);

function dateSeparator(index: number): string | null {
  const status = threadStatuses.value[index];
  if (!status)
    return null;
  const date = new Date(status.createdAt);
  const prev = index > 0 ? threadStatuses.value[index - 1] : null;
  if (prev && new Date(prev.createdAt).toDateString() === date.toDateString())
    return null;
  return formatCalendarLabel(date);
}

function showSender(index: number): boolean {
  const status = threadStatuses.value[index];
  if (!status || isOwnMessage(status))
    return false;
  if (index === 0)
    return true;
  const prev = threadStatuses.value[index - 1];
  return !prev || prev.account.acct !== status.account.acct;
}

const messagesContainer = ref<HTMLElement>();
const isSending = ref(false);
const lightboxOpen = ref(false);
const lightboxAttachments = ref<MediaAttachment[]>([]);
const lightboxIndex = ref(0);

function openLightbox(attachments: MediaAttachment[], index: number) {
  lightboxAttachments.value = attachments;
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}
const { chatMessage, set: setChatTarget, clear: clearChatTarget } = useMobileChatInput();

async function handleSend(content: string) {
  if (!content.trim() || !participant.value)
    return;

  isSending.value = true;
  const savedContent = content;
  chatMessage.value = '';

  try {
    const lastMessageId = threadStatuses.value.at(-1)?.id;
    await sendDirectMessage(participant.value.acct, content.trim(), lastMessageId);
    refetch();
  }
  catch {
    chatMessage.value = savedContent;
    toast.error('Failed to send message');
  }
  finally {
    isSending.value = false;
  }
}

watch(participant, (p) => {
  if (p) {
    setChatTarget({
      participantAcct: p.acct,
      onSend: handleSend,
    });
  }
}, { immediate: true });

onUnmounted(() => {
  clearChatTarget();
});

function goBack() {
  router.push('/messages');
}

// Set page header to show participant avatar + name in MobileHeader
usePageHeader({
  title: computed(() => participant.value?.displayName ?? 'Conversation'),
  titleEmojis: computed(() => participant.value?.emojis ?? []),
  subtitle: computed(() => participant.value ? `@${participant.value.acct}` : undefined),
  image: computed(() => participant.value?.avatar),
});

function scrollToBottom(smooth = false) {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  });
}

onMounted(() => scrollToBottom());

watch(() => threadStatuses.value.length, (newLen) => {
  const isNewMessage = previousMessageCount.value > 0 && newLen > previousMessageCount.value;
  previousMessageCount.value = newLen;
  scrollToBottom(isNewMessage);
});
</script>

<template>
  <div class="-mb-26 flex h-[calc(100dvh-3.5rem-6.5rem)] flex-col overflow-hidden lg:h-[calc(100dvh-3.5rem)]">
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
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4">
          <TransitionGroup name="message" tag="div" class="space-y-3">
            <template v-for="(status, index) in threadStatuses" :key="status.id">
              <!-- Date separator -->
              <div
                v-if="dateSeparator(index)"
                :key="`sep-${status.id}`"
                class="flex items-center justify-center py-2"
              >
                <span class="text-xs font-medium text-muted-foreground first-letter:uppercase">
                  {{ dateSeparator(index) }}
                </span>
              </div>

              <MessageBubble
                :content="formatMessageContent(status.content, allParticipantAccts)"
                :is-own="isOwnMessage(status)"
                :sent-at="status.createdAt"
                :media-attachments="status.mediaAttachments"
                :card="status.card"
                :sender-name="isGroupChat ? status.account.displayName : undefined"
                :sender-avatar="status.account.avatar"
                :show-sender="showSender(index)"
                @media-click="(_, idx) => openLightbox(status.mediaAttachments, idx)"
                @sender-click="navigateTo(`/@${status.account.acct}`)"
              />
            </template>
          </TransitionGroup>
        </div>
      </template>

      <!-- Desktop input (mobile uses bottom nav via useMobileChatInput) -->
      <div v-if="conversation" class="hidden border-t border-border p-3 lg:block">
        <form class="flex items-end gap-2" @submit.prevent="handleSend(chatMessage)">
          <MessageInput
            v-model="chatMessage"
            :disabled="isSending"
            placeholder="Write a message..."
            class="flex-1"
            @send="handleSend(chatMessage)"
          />
        </form>
      </div>
    </ClientOnly>

    <MediaLightbox
      :attachments="lightboxAttachments"
      :initial-index="lightboxIndex"
      :is-open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>

<style scoped>
.message-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.message-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

.message-move {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
