<script setup lang="ts">
import { MessageBubble, MessageInput, useToast } from '@repo/ui';
import { computed, nextTick, ref, watch } from 'vue';
import { usePageHeader } from '~/composables/usePageHeader';

const route = useRoute();
const router = useRouter();
const { sendDirectMessage, findConversationByAcct } = useConversationData();
const { toast } = useToast();

const acct = computed(() => {
  const raw = route.query.acct;
  return (typeof raw === 'string' ? raw : '') || '';
});

const { data: account, isLoading } = useAccountData().getAccountByAcct(acct.value);

usePageHeader({
  title: computed(() => account.value?.displayName ?? 'New Message'),
  subtitle: computed(() => account.value ? `@${account.value.acct}` : undefined),
  image: computed(() => account.value?.avatar),
});

const message = ref('');
const isSending = ref(false);
const sentMessages = ref<Array<{ id: string; content: string; sentAt: string }>>([]);
const messagesContainer = ref<HTMLElement>();

async function handleSend() {
  const content = message.value.trim();
  if (!content || !acct.value)
    return;

  isSending.value = true;
  const savedContent = content;
  message.value = '';

  const tempId = `temp-${Date.now()}`;
  sentMessages.value.push({
    id: tempId,
    content,
    sentAt: new Date().toISOString(),
  });

  try {
    await sendDirectMessage(acct.value, content);
    const conversationId = await findConversationByAcct(acct.value);
    if (conversationId) {
      router.replace(`/messages/${conversationId}`);
    }
  }
  catch {
    message.value = savedContent;
    sentMessages.value = sentMessages.value.filter(m => m.id !== tempId);
    toast.error('Failed to send message');
  }
  finally {
    isSending.value = false;
  }
}

watch(() => sentMessages.value.length, () => {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  });
});
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <ClientOnly>
      <div v-if="isLoading" class="flex-1 p-4">
        <div class="flex items-center gap-3">
          <div class="size-10 animate-pulse rounded-full bg-muted" />
          <div class="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <template v-else>
        <!-- Recipient info -->
        <div v-if="account" class="flex flex-col items-center gap-2 border-b border-border px-4 py-6">
          <img
            :src="account.avatar"
            :alt="account.displayName"
            class="size-16 rounded-full"
            loading="lazy"
            decoding="async"
          >
          <div class="text-center">
            <div class="font-semibold">
              {{ account.displayName }}
            </div>
            <div class="text-sm text-muted-foreground">
              @{{ account.acct }}
            </div>
          </div>
        </div>

        <!-- Messages (optimistic) -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4">
          <TransitionGroup name="message" tag="div" class="space-y-3">
            <MessageBubble
              v-for="msg in sentMessages"
              :key="msg.id"
              :content="msg.content"
              :is-own="true"
              :sent-at="msg.sentAt"
            />
          </TransitionGroup>
        </div>

        <!-- Input -->
        <div class="border-t border-border p-3">
          <form class="flex items-end gap-2" @submit.prevent="handleSend">
            <MessageInput
              v-model="message"
              :disabled="isSending"
              :placeholder="`Message @${acct}...`"
              class="flex-1"
              @send="handleSend"
            />
          </form>
        </div>
      </template>
    </ClientOnly>
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
</style>
