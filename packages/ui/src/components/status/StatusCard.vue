<script setup lang="ts">
import type { PreviewCard } from '@repo/types';

interface Props {
  card: PreviewCard;
}

defineProps<Props>();

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return url;
  }
}
</script>

<template>
  <a
    :href="card.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors"
    @click.stop
  >
    <!-- Card with image -->
    <template v-if="card.image">
      <!-- Large image layout (for link type with big image) -->
      <div v-if="card.type === 'link'" class="flex flex-col">
        <div class="aspect-[1.91/1] bg-gray-100 overflow-hidden">
          <img
            :src="card.image"
            :alt="card.title || ''"
            loading="lazy"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="p-3">
          <div class="text-xs text-gray-500 mb-1">{{ getDomain(card.url) }}</div>
          <div v-if="card.title" class="font-medium text-gray-900 line-clamp-2 mb-1">
            {{ card.title }}
          </div>
          <div v-if="card.description" class="text-sm text-gray-500 line-clamp-2">
            {{ card.description }}
          </div>
        </div>
      </div>

      <!-- Compact layout (for video/rich embeds) -->
      <div v-else class="flex">
        <div class="w-32 h-32 shrink-0 bg-gray-100 overflow-hidden">
          <img
            :src="card.image"
            :alt="card.title || ''"
            loading="lazy"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="flex-1 p-3 min-w-0">
          <div class="text-xs text-gray-500 mb-1">{{ getDomain(card.url) }}</div>
          <div v-if="card.title" class="font-medium text-gray-900 line-clamp-2 mb-1">
            {{ card.title }}
          </div>
          <div v-if="card.description" class="text-sm text-gray-500 line-clamp-2">
            {{ card.description }}
          </div>
        </div>
      </div>
    </template>

    <!-- Card without image -->
    <div v-else class="p-3">
      <div class="text-xs text-gray-500 mb-1">{{ getDomain(card.url) }}</div>
      <div v-if="card.title" class="font-medium text-gray-900 line-clamp-2 mb-1">
        {{ card.title }}
      </div>
      <div v-if="card.description" class="text-sm text-gray-500 line-clamp-3">
        {{ card.description }}
      </div>
    </div>
  </a>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
