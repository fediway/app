import type { Status } from '@repo/types';
import { ref } from 'vue';

const isOpen = ref(false);
const statusToShare = ref<Status | null>(null);

export function useSendMessageModal() {
  function open(status: Status) {
    statusToShare.value = status;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    statusToShare.value = null;
  }

  return {
    isOpen,
    statusToShare,
    open,
    close,
  };
}
