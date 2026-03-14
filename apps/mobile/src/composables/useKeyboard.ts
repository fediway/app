import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { onUnmounted, ref } from 'vue';

export function useKeyboard() {
  const height = ref(0);
  const isVisible = ref(false);

  const listeners: PluginListenerHandle[] = [];

  async function init() {
    if (!Capacitor.isNativePlatform())
      return;

    listeners.push(
      await Keyboard.addListener('keyboardWillShow', (info) => {
        height.value = info.keyboardHeight;
        isVisible.value = true;
      }),
      await Keyboard.addListener('keyboardDidHide', () => {
        height.value = 0;
        isVisible.value = false;
      }),
    );
  }

  function cleanup() {
    for (const listener of listeners) {
      listener.remove();
    }
    listeners.length = 0;
  }

  onUnmounted(cleanup);

  return {
    height,
    isVisible,
    init,
    cleanup,
  };
}
