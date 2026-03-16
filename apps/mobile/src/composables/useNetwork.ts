import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { ref } from 'vue';

const isOnline = ref(true);
const connectionType = ref<string>('unknown');
let initialized = false;

async function initGlobal() {
  if (initialized)
    return;
  initialized = true;

  if (!Capacitor.isNativePlatform()) {
    isOnline.value = navigator.onLine;
    window.addEventListener('online', () => {
      isOnline.value = true;
    });
    window.addEventListener('offline', () => {
      isOnline.value = false;
    });
    return;
  }

  const status = await Network.getStatus();
  isOnline.value = status.connected;
  connectionType.value = status.connectionType;

  await Network.addListener('networkStatusChange', (s) => {
    isOnline.value = s.connected;
    connectionType.value = s.connectionType;
  });
}

export function useNetwork() {
  initGlobal();

  return {
    isOnline,
    connectionType,
  };
}
