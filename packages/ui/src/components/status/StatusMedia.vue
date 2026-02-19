<script setup lang="ts">
import type { MediaAttachment } from '@repo/types';
import MediaGallery from '../media/MediaGallery.vue';

interface Props {
  attachments: MediaAttachment[];
  sensitive?: boolean;
}

withDefaults(defineProps<Props>(), {
  sensitive: false,
});

const emit = defineEmits<{
  mediaClick: [attachment: MediaAttachment, index: number];
}>();

function handleMediaClick(attachment: MediaAttachment, index: number) {
  emit('mediaClick', attachment, index);
}
</script>

<template>
  <MediaGallery
    :attachments="attachments"
    :sensitive="sensitive"
    @media-click="handleMediaClick"
  />
</template>
