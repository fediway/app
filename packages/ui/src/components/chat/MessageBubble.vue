<script setup lang="ts">
import type { MediaAttachment, PreviewCard } from '@repo/types';
import { PhHeart, PhPlay } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { vFadeOnLoad } from '../../directives/fadeOnLoad';
import { blurhashStyle } from '../../utils/blurhash';

const props = defineProps<{
  content?: string;
  isOwn: boolean;
  sentAt: string;
  favourited?: boolean;
  mediaAttachments?: MediaAttachment[];
  card?: PreviewCard | null;
  senderName?: string;
  senderAvatar?: string;
  showSender?: boolean;
  sharedStatus?: {
    authorName: string;
    authorAvatar: string;
    content: string;
    imageUrl?: string;
  };
}>();

defineEmits<{
  statusClick: [];
  mediaClick: [attachment: MediaAttachment, index: number];
  senderClick: [];
}>();

const media = computed(() => props.mediaAttachments?.slice(0, 4) ?? []);
const mediaCount = computed(() => media.value.length);
const hasMedia = computed(() => mediaCount.value > 0);
const hasCard = computed(() => props.card && !hasMedia.value && !props.sharedStatus);

function m(index: number): MediaAttachment {
  return media.value[index]!;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime()))
    return '';
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return url;
  }
}

function thumbSrc(a: MediaAttachment): string {
  return a.previewUrl || a.url || '';
}
</script>

<template>
  <div
    class="flex"
    :class="[isOwn ? 'justify-end' : 'justify-start']"
  >
    <!-- Avatar for other people's messages in group chats -->
    <div v-if="!isOwn && senderAvatar" class="mr-2 mb-3 shrink-0 self-end">
      <button
        v-if="showSender"
        class="cursor-pointer"
        @click="$emit('senderClick')"
      >
        <img
          :src="senderAvatar"
          :alt="senderName || ''"
          class="size-7 rounded-full"
          loading="lazy"
          decoding="async"
        >
      </button>
      <!-- Spacer when avatar is hidden (consecutive messages from same sender) -->
      <div v-else class="size-7" />
    </div>

    <div class="max-w-[80%]">
      <!-- Sender name -->
      <button
        v-if="!isOwn && showSender && senderName"
        class="mb-0.5 cursor-pointer px-1 text-xs font-medium text-muted-foreground hover:underline"
        @click="$emit('senderClick')"
      >
        {{ senderName }}
      </button>

      <!-- Bubble -->
      <div
        class="overflow-hidden rounded-2xl"
        :class="[
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md',
          hasMedia ? '' : 'px-4 py-2',
        ]"
      >
        <!-- Media — iMessage-style grid -->
        <div v-if="hasMedia">
          <!-- 1: full width -->
          <button
            v-if="mediaCount === 1"
            class="relative block h-56 w-full cursor-pointer overflow-hidden bg-muted"
            :style="blurhashStyle(m(0).blurhash)"
            @click="$emit('mediaClick', m(0), 0)"
          >
            <img
              v-fade-on-load
              :src="thumbSrc(m(0))"
              :alt="m(0).description || ''"
              loading="lazy"
              decoding="async"
              class="size-full object-cover"
            >
            <div v-if="m(0).type === 'video'" class="absolute inset-0 flex items-center justify-center">
              <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white">
                <PhPlay :size="20" weight="fill" />
              </div>
            </div>
          </button>

          <!-- 2: side by side -->
          <div v-else-if="mediaCount === 2" class="flex gap-0.5">
            <button
              v-for="(a, i) in media"
              :key="a.id"
              class="relative block h-40 w-1/2 cursor-pointer overflow-hidden bg-muted"
              :style="blurhashStyle(a.blurhash)"
              @click="$emit('mediaClick', a, i)"
            >
              <img
                v-fade-on-load
                :src="thumbSrc(a)"
                :alt="a.description || ''"
                loading="lazy"
                decoding="async"
                class="size-full object-cover"
              >
              <div v-if="a.type === 'video'" class="absolute inset-0 flex items-center justify-center">
                <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white">
                  <PhPlay :size="20" weight="fill" />
                </div>
              </div>
            </button>
          </div>

          <!-- 3: one tall left + two stacked right -->
          <div v-else-if="mediaCount === 3" class="flex h-52 gap-0.5">
            <button
              class="relative block w-1/2 cursor-pointer overflow-hidden bg-muted"
              :style="blurhashStyle(m(0).blurhash)"
              @click="$emit('mediaClick', m(0), 0)"
            >
              <img
                v-fade-on-load
                :src="thumbSrc(m(0))"
                :alt="m(0).description || ''"
                loading="lazy"
                decoding="async"
                class="size-full object-cover"
              >
              <div v-if="m(0).type === 'video'" class="absolute inset-0 flex items-center justify-center">
                <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white">
                  <PhPlay :size="20" weight="fill" />
                </div>
              </div>
            </button>
            <div class="flex w-1/2 flex-col gap-0.5">
              <button
                v-for="(a, i) in media.slice(1)"
                :key="a.id"
                class="relative block flex-1 cursor-pointer overflow-hidden bg-muted"
                :style="blurhashStyle(a.blurhash)"
                @click="$emit('mediaClick', a, i + 1)"
              >
                <img
                  v-fade-on-load
                  :src="thumbSrc(a)"
                  :alt="a.description || ''"
                  loading="lazy"
                  decoding="async"
                  class="size-full object-cover"
                >
                <div v-if="a.type === 'video'" class="absolute inset-0 flex items-center justify-center">
                  <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white">
                    <PhPlay :size="20" weight="fill" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- 4: 2x2 grid -->
          <div v-else class="grid h-64 grid-cols-2 gap-0.5">
            <button
              v-for="(a, i) in media"
              :key="a.id"
              class="relative block cursor-pointer overflow-hidden bg-muted"
              :style="blurhashStyle(a.blurhash)"
              @click="$emit('mediaClick', a, i)"
            >
              <img
                v-fade-on-load
                :src="thumbSrc(a)"
                :alt="a.description || ''"
                loading="lazy"
                decoding="async"
                class="size-full object-cover"
              >
              <div v-if="a.type === 'video'" class="absolute inset-0 flex items-center justify-center">
                <div class="flex size-10 items-center justify-center rounded-full bg-black/50 text-white">
                  <PhPlay :size="20" weight="fill" />
                </div>
              </div>
            </button>
          </div>

          <!-- Text below media -->
          <p v-if="content" class="whitespace-pre-wrap px-4 py-2 text-base leading-relaxed">
            {{ content }}
          </p>
        </div>

        <!-- Shared status preview -->
        <div
          v-else-if="sharedStatus"
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

        <!-- Link preview card -->
        <template v-else-if="hasCard">
          <a
            :href="card!.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 block overflow-hidden rounded-lg border"
            :class="[isOwn ? 'border-primary-foreground/20' : 'border-border']"
            @click.stop
          >
            <img
              v-if="card!.image"
              v-fade-on-load
              :src="card!.image"
              :alt="card!.title || ''"
              loading="lazy"
              decoding="async"
              class="h-32 w-full object-cover"
            >
            <div class="p-2">
              <div
                class="text-[11px]"
                :class="[isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground']"
              >
                {{ getDomain(card!.url) }}
              </div>
              <div
                v-if="card!.title"
                class="line-clamp-2 text-xs font-medium"
                :class="[isOwn ? 'text-primary-foreground' : 'text-foreground']"
              >
                {{ card!.title }}
              </div>
            </div>
          </a>

          <!-- Message text -->
          <p v-if="content" class="whitespace-pre-wrap text-base leading-relaxed">
            {{ content }}
          </p>
        </template>

        <!-- Plain text only -->
        <p v-else-if="content" class="whitespace-pre-wrap text-base leading-relaxed">
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
