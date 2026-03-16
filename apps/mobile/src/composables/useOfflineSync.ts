import { useActionQueue } from '@repo/api';
import { watch } from 'vue';
import { useNetwork } from './useNetwork';

let initialized = false;

export function useOfflineSync() {
  if (initialized)
    return;
  initialized = true;

  const { isOnline } = useNetwork();
  const { pending, isProcessing, processQueue } = useActionQueue({
    onError: (e) => {
      console.error('[offlineSync] Failed to process action:', e.action.type, e.error);
    },
  });

  // Process queue whenever we come back online
  watch(isOnline, (online) => {
    if (online && pending.value.length > 0 && !isProcessing.value) {
      processQueue();
    }
  });

  return { pending, isProcessing, isOnline };
}
