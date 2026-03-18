<script setup lang="ts">
import { PhHeart } from '@phosphor-icons/vue';

defineProps<{
  content?: string;
  isOwn: boolean;
  sentAt: string;
  favourited?: boolean;
  sharedStatus?: {
    authorName: string;
    authorAvatar: string;
    content: string;
    imageUrl?: string;
  };
}>();

defineEmits<{
  statusClick: [];
}>();

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime()))
    return '';
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
</script>

<template>
  <div
    class="flex"
    :class="[isOwn ? 'justify-end' : 'justify-start']"
  >
    <div class="max-w-[80%]">
      <!-- Bubble -->
      <div
        class="rounded-2xl px-4 py-2"
        :class="[
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100',
        ]"
      >
        <!-- Shared status preview -->
        <div
          v-if="sharedStatus"
          class="mb-2 cursor-pointer overflow-hidden rounded-lg border"
          :class="[isOwn ? 'border-blue-400 bg-blue-400/20' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900']"
          @click="$emit('statusClick')"
        >
          <img
            v-if="sharedStatus.imageUrl"
            :src="sharedStatus.imageUrl"
            alt="Shared post image"
            class="h-32 w-full object-cover"
            loading="lazy"
          >
          <div class="p-2">
            <div class="mb-1 flex items-center gap-2">
              <img
                :src="sharedStatus.authorAvatar"
                :alt="sharedStatus.authorName"
                class="size-5 rounded-full"
              >
              <span
                class="truncate text-xs font-medium"
                :class="[isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100']"
              >
                {{ sharedStatus.authorName }}
              </span>
            </div>
            <p
              class="line-clamp-2 text-xs"
              :class="[isOwn ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400']"
            >
              {{ sharedStatus.content }}
            </p>
          </div>
        </div>

        <!-- Message text -->
        <p v-if="content" class="whitespace-pre-wrap text-[15px] leading-relaxed">
          {{ content }}
        </p>
      </div>

      <!-- Time + favourite -->
      <div
        class="mt-1 flex items-center gap-1 px-1"
        :class="[isOwn ? 'justify-end' : 'justify-start']"
      >
        <span v-if="favourited && isOwn" class="text-red-500">
          <PhHeart :size="12" weight="fill" />
        </span>
        <span class="text-[11px] text-gray-400">
          {{ formatTime(sentAt) }}
        </span>
      </div>
    </div>
  </div>
</template>
