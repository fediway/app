<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import MediaPreviewItem from './MediaPreviewItem.vue';

export interface MediaItem {
  id?: string;
  file?: File;
  previewUrl: string;
  altText: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  type: 'image' | 'video' | 'gifv';
}

interface Props {
  media: MediaItem[];
  maxItems?: number;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 4,
  disabled: false,
});

const emit = defineEmits<{
  remove: [index: number];
  editAlt: [index: number];
  retry: [index: number];
}>();
</script>

<template>
  <div
    v-if="media.length > 0"
    :class="cn('flex gap-2 overflow-x-auto', props.class)"
  >
    <MediaPreviewItem
      v-for="(item, index) in media"
      :key="item.previewUrl"
      :preview-url="item.previewUrl"
      :alt-text="item.altText"
      :progress="item.progress"
      :status="item.status"
      :type="item.type"
      :disabled="disabled"
      @remove="emit('remove', index)"
      @edit-alt="emit('editAlt', index)"
      @retry="emit('retry', index)"
    />
  </div>
</template>
