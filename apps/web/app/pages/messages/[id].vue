<script setup lang="ts">
import { PhArrowLeft, PhHeart, PhPaperPlaneRight } from '@phosphor-icons/vue';
import { useMessages } from '~/composables/useMessages';

const route = useRoute();
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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function handleSend() {
  if (!newMessage.value.trim())
    return;
  sendMessage(conversationId.value, newMessage.value.trim());
  newMessage.value = '';
}
</script>

<template>
  <div class="flex flex-col h-full min-h-[calc(100vh-112px)] lg:min-h-[calc(100vh-32px)]">
    <!-- Chat Header -->
    <div v-if="participant" class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
      <NuxtLink to="/messages" class="text-gray-500 hover:text-gray-700 lg:hidden">
        <PhArrowLeft :size="24" />
      </NuxtLink>
      <img
        :src="participant.avatar"
        :alt="participant.displayName"
        class="w-10 h-10 rounded-full object-cover"
      >
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-gray-900 truncate">
          {{ participant.displayName }}
        </div>
        <div class="text-xs text-gray-500 truncate">
          @{{ participant.acct }}
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!participant" class="p-8 text-center text-gray-500">
      <p>Conversation not found</p>
      <NuxtLink to="/messages" class="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
        Back to messages
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Messages -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex" :class="[
            message.isOwn ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            class="max-w-[80%] relative group" :class="[
              message.isOwn ? 'items-end' : 'items-start',
            ]"
          >
            <!-- Message Bubble -->
            <div
              class="rounded-2xl px-4 py-2" :class="[
                message.isOwn
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md',
              ]"
            >
              <!-- Shared Status Preview -->
              <div
                v-if="message.sharedStatus"
                class="mb-2 rounded-lg overflow-hidden border" :class="[
                  message.isOwn ? 'border-blue-400 bg-blue-400/20' : 'border-gray-200 bg-white',
                ]"
              >
                <img
                  v-if="message.sharedStatus.imageUrl"
                  :src="message.sharedStatus.imageUrl"
                  alt="Shared post image"
                  class="w-full h-32 object-cover"
                >
                <div class="p-2">
                  <div class="flex items-center gap-2 mb-1">
                    <img
                      :src="message.sharedStatus.authorAvatar"
                      :alt="message.sharedStatus.authorName"
                      class="w-5 h-5 rounded-full"
                    >
                    <span
                      class="text-xs font-medium truncate" :class="[
                        message.isOwn ? 'text-white' : 'text-gray-900',
                      ]"
                    >
                      {{ message.sharedStatus.authorName }}
                    </span>
                  </div>
                  <p
                    class="text-xs line-clamp-2" :class="[
                      message.isOwn ? 'text-blue-100' : 'text-gray-600',
                    ]"
                  >
                    {{ message.sharedStatus.content }}
                  </p>
                </div>
              </div>

              <!-- Message Text -->
              <p v-if="message.content" class="text-[15px] leading-relaxed whitespace-pre-wrap">
                {{ message.content }}
              </p>
            </div>

            <!-- Time & Favourite Indicator -->
            <div
              class="flex items-center gap-1 mt-1 px-1" :class="[
                message.isOwn ? 'justify-end' : 'justify-start',
              ]"
            >
              <span
                v-if="message.favourited && message.isOwn"
                class="text-red-500"
                title="Favourited"
              >
                <PhHeart :size="12" weight="fill" />
              </span>
              <span class="text-[11px] text-gray-400">
                {{ formatTime(message.sentAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="px-4 py-3 border-t border-gray-200 bg-white">
        <form class="flex items-center gap-2" @submit.prevent="handleSend">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Write a message..."
            class="flex-1 px-4 py-2 bg-gray-100 rounded-full text-[15px] outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          >
          <button
            type="submit"
            :disabled="!newMessage.trim()"
            class="w-10 h-10 rounded-full flex items-center justify-center transition-colors" :class="[
              newMessage.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ]"
          >
            <PhPaperPlaneRight :size="20" />
          </button>
        </form>
      </div>
    </template>
  </div>
</template>
