import { ref } from 'vue';

type BackButtonHandler = () => boolean;

interface RegisteredHandler {
  priority: number;
  handler: BackButtonHandler;
}

const handlers = ref<RegisteredHandler[]>([]);

export function useBackButton() {
  function register(priority: number, handler: BackButtonHandler): () => void {
    const entry: RegisteredHandler = { priority, handler };
    handlers.value.push(entry);
    // Keep sorted descending by priority for fast iteration
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

  async function initCapacitorBackButton() {
    try {
      // Dynamic import — only resolves in Capacitor (apps/mobile), fails gracefully on web
      const capacitorApp = '@capacitor/app';
      const { App } = await import(/* @vite-ignore */ capacitorApp);
      App.addListener('backButton', () => {
        if (!handleBackButton()) {
          App.minimizeApp();
        }
      });
    }
    catch {
      // Not running in Capacitor — no-op on web
    }
  }

  return {
    register,
    handleBackButton,
    initCapacitorBackButton,
  };
}

/** Reset all state — for testing only */
export function _resetBackButtonState() {
  handlers.value = [];
}
