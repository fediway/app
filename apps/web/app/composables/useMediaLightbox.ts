import type { MediaAttachment } from '@repo/types';
import { ref } from 'vue';

const isOpen = ref(false);
const attachments = ref<MediaAttachment[]>([]);
const initialIndex = ref(0);

export function useMediaLightbox() {
  function open(media: MediaAttachment[], index: number = 0) {
    attachments.value = media;
    initialIndex.value = index;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return {
    isOpen,
    attachments,
    initialIndex,
    open,
    close,
  };
}
