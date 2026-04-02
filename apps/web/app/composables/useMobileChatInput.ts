import { ref, shallowRef } from 'vue';

export interface ChatInputTarget {
  participantAcct: string;
  onSend: (content: string) => void;
}

const chatTarget = shallowRef<ChatInputTarget | null>(null);
const chatMessage = ref('');

export function useMobileChatInput() {
  function set(target: ChatInputTarget) {
    chatTarget.value = target;
  }

  function clear() {
    chatTarget.value = null;
    chatMessage.value = '';
  }

  return {
    chatTarget,
    chatMessage,
    set,
    clear,
  };
}
