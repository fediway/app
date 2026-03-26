import type { Ref } from 'vue';
import { ref } from 'vue';

export type DataMode = 'mock' | 'live';

const STORAGE_KEY = 'fediway-data-mode';

const mode = ref<DataMode>('live');
let initialized = false;

function loadFromStorage(): DataMode {
  // Env var ALWAYS overrides localStorage
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_MODE === 'mock')
    return 'mock';
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_MODE === 'live')
    return 'live';
  // Fall back to localStorage
  if (typeof localStorage === 'undefined')
    return 'live';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'mock')
    return 'mock';
  // Default is ALWAYS live
  return 'live';
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

/** Reset all state — for testing only */
export function _resetDataModeState() {
  mode.value = 'live';
  initialized = false;
}
