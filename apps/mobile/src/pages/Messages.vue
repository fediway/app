<script setup lang="ts">
import type { Conversation } from '@repo/types';
import { ChatList } from '@repo/ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getSafeClient } from '../composables/useStatusBridge';

const router = useRouter();
const conversations = ref<Conversation[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const client = getSafeClient();
    if (!client)
      return;
    conversations.value = await client.rest.v1.conversations.list();
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load messages');
  }
  finally {
    loading.value = false;
  }
}

function handleConversationClick(id: string) {
  router.push(`/messages/${id}`);
}

onMounted(load);
</script>

<template>
  <ChatList
    :conversations="conversations"
    :loading="loading"
    :error="error?.message"
    @conversation-click="handleConversationClick"
    @retry="load"
  />
</template>
