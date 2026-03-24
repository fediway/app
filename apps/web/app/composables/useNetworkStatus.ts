import { useToast } from '@repo/ui';
import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Watches network connectivity and shows toasts on transitions.
 * Only toasts on transitions — not on initial load.
 */
export function useNetworkStatus() {
  const isOnline = ref(true);
  const { toast, removeToast } = useToast();
  let offlineToastId: string | undefined;
  let initialized = false;

  function handleOnline() {
    isOnline.value = true;
    if (offlineToastId) {
      removeToast(offlineToastId);
      offlineToastId = undefined;
    }
    if (initialized) {
      toast.success('Back online');
    }
  }

  function handleOffline() {
    isOnline.value = false;
    if (initialized) {
      offlineToastId = toast.error('You\'re offline', 'Actions will sync when reconnected.');
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      isOnline.value = navigator.onLine;
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      // Mark initialized after first tick to avoid toast on page load
      initialized = true;
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  });

  return { isOnline };
}
