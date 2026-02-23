import type { Ref } from 'vue';
import { ref } from 'vue';

export type DataMode = 'mock' | 'live';

const STORAGE_KEY = 'fediway-data-mode';

const mode = ref<DataMode>('mock');
let initialized = false;

function loadFromStorage(): DataMode {
  // Env var takes priority (set by dev scripts)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_MODE === 'live')
    return 'live';
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_MODE === 'mock')
    return 'mock';
  // Fall back to localStorage
  if (typeof localStorage === 'undefined')
    return 'mock';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'live')
    return 'live';
  return 'mock';
}

function saveToStorage(m: DataMode) {
  if (typeof localStorage === 'undefined')
    return;
  localStorage.setItem(STORAGE_KEY, m);
}

export function useDataMode() {
  if (!initialized) {
    mode.value = loadFromStorage();
    initialized = true;
  }

  function setMode(m: DataMode) {
    mode.value = m;
    saveToStorage(m);
  }

  return {
    mode: mode as Ref<DataMode>,
    setMode,
  };
}
