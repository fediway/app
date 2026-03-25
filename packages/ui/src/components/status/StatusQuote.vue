<script setup lang="ts">
import type { Status } from '@repo/types';
import { computed } from 'vue';
import { RelativeTime } from '../ui/relative-time';
import { RichText } from '../ui/rich-text';

interface Props {
  status: Status;
  /** Recursion depth guard */
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
});

const emit = defineEmits<{
  click: [statusId: string];
}>();

function handleClick(event: MouseEvent) {
  event.stopPropagation();
  emit('click', props.status.id);
}

const firstMediaUrl = computed(() => {
  const media = props.status.mediaAttachments[0];
  if (!media)
    return null;
  return media.previewUrl ?? media.url;
});
</script>

<template>
  <div
    class="border border-border rounded-xl overflow-hidden hover:bg-muted transition-colors cursor-pointer"
    @click="handleClick"
  >
    <div class="p-3">
      <!-- Author row -->
      <div class="flex items-center gap-2 mb-2">
        <img
          :src="status.account.avatar"
          :alt="status.account.displayName"
          class="w-5 h-5 rounded-full"
        >
        <span class="font-medium text-sm truncate">{{ status.account.displayName }}</span>
        <span class="text-muted-foreground text-sm truncate">@{{ status.account.acct }}</span>
        <span class="text-gray-400 dark:text-gray-500 text-sm">·</span>
        <RelativeTime :datetime="status.createdAt" class="text-sm" />
      </div>

      <!-- Content -->
      <RichText :content="status.content" :emojis="status.emojis" class="text-sm text-foreground line-clamp-3" />

      <!-- Media preview (if has media) -->
      <div
        v-if="firstMediaUrl"
        class="mt-2 rounded-lg overflow-hidden"
      >
        <img
          :src="firstMediaUrl"
          alt="Media"
          class="w-full h-32 object-cover"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 :deep(p) {
  margin: 0;
}
</style>
