import type { Status } from '@repo/types';
import { shallowRef } from 'vue';

const replyTarget = shallowRef<Status | null>(null);

export function useMobileReplyTarget() {
  function set(status: Status) {
    replyTarget.value = status;
  }

  function clear() {
    replyTarget.value = null;
  }

  return {
    replyTarget,
    set,
    clear,
  };
}
