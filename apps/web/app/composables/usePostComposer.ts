import type { Status } from '@repo/types';
import { ref } from 'vue';

const isOpen = ref(false);
const replyingTo = ref<Status | null>(null);

export function usePostComposer() {
  function open(replyTo?: Status) {
    replyingTo.value = replyTo ?? null;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    replyingTo.value = null;
  }

  return {
    isOpen,
    replyingTo,
    open,
    close,
  };
}

/** Reset all state — for testing only */
export function _resetPostComposerState() {
  isOpen.value = false;
  replyingTo.value = null;
}
