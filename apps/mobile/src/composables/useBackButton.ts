import { App } from '@capacitor/app';
import { ref } from 'vue';

type BackButtonHandler = () => boolean;

interface RegisteredHandler {
  priority: number;
  handler: BackButtonHandler;
}

const handlers = ref<RegisteredHandler[]>([]);
let listenerActive = false;

export function useBackButton() {
  function register(priority: number, handler: BackButtonHandler): () => void {
    const entry: RegisteredHandler = { priority, handler };
    handlers.value.push(entry);
    handlers.value.sort((a, b) => b.priority - a.priority);

    return () => {
      const index = handlers.value.indexOf(entry);
      if (index !== -1) {
        handlers.value.splice(index, 1);
      }
    };
  }

  function handleBackButton(): boolean {
    for (const { handler } of handlers.value) {
      if (handler()) {
        return true;
      }
    }
    return false;
  }

  function initListener() {
    if (listenerActive)
      return;
    listenerActive = true;

    App.addListener('backButton', () => {
      if (!handleBackButton()) {
        App.minimizeApp();
      }
    });
  }

  return {
    register,
    handleBackButton,
    initListener,
  };
}
