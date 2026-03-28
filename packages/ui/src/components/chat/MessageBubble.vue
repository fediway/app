<script setup lang="ts">
import { PhHeart } from '@phosphor-icons/vue';
import { vFadeOnLoad } from '../../directives/fadeOnLoad';

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
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md',
        ]"
      >
        <!-- Shared status preview -->
        <div
          v-if="sharedStatus"
          class="mb-2 cursor-pointer overflow-hidden rounded-lg border"
          :class="[isOwn ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border bg-background']"
          @click="$emit('statusClick')"
        >
          <img
            v-if="sharedStatus.imageUrl"
            v-fade-on-load
            :src="sharedStatus.imageUrl"
            alt="Shared post image"
            class="h-32 w-full object-cover"
            loading="lazy"
            decoding="async"
          >
          <div class="p-2">
            <div class="mb-1 flex items-center gap-2">
              <img
                :src="sharedStatus.authorAvatar"
                :alt="sharedStatus.authorName"
                class="size-5 rounded-full"
                loading="lazy"
                decoding="async"
              >
              <span
                class="truncate text-xs font-medium"
                :class="[isOwn ? 'text-primary-foreground' : 'text-foreground']"
              >
                {{ sharedStatus.authorName }}
              </span>
            </div>
            <p
              class="line-clamp-2 text-xs"
              :class="[isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground']"
            >
              {{ sharedStatus.content }}
            </p>
          </div>
        </div>

        <!-- Message text -->
        <p v-if="content" class="whitespace-pre-wrap text-base leading-relaxed">
          {{ content }}
        </p>
      </div>

      <!-- Time + favourite -->
      <div
        class="mt-1 flex items-center gap-1 px-1"
        :class="[isOwn ? 'justify-end' : 'justify-start']"
      >
        <span v-if="favourited && isOwn" class="text-red">
          <PhHeart :size="12" weight="fill" />
        </span>
        <span class="text-xs text-muted-foreground-subtle">
          {{ formatTime(sentAt) }}
        </span>
      </div>
    </div>
  </div>
</template>
