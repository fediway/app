import type { ComputedRef, Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { getPlatformAdapter } from '../platform';

const STORAGE_KEY = 'fediway_theme';
const VALID_THEMES = ['light', 'dark', 'system'] as const;

export type ThemePreference = typeof VALID_THEMES[number];

export interface UseDarkModeReturn {
  theme: Readonly<Ref<ThemePreference>>;
  isDark: ComputedRef<boolean>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  init: () => Promise<void>;
}

// Module-level refs — shared across all callers (same pattern as useAccountStore)
const theme = ref<ThemePreference>('system');
const systemPrefersDark = ref(false);

const isDark = computed<boolean>(() => {
  if (theme.value === 'dark')
    return true;
  if (theme.value === 'light')
    return false;
  return systemPrefersDark.value;
});

let matchMediaBound = false;

/**
 * Shared dark mode composable.
 *
 * Uses module-level refs so all callers share the same reactive state.
 * Manages theme preference (light / dark / system), toggles the `.dark`
 * class on `<html>`, and persists the choice via PlatformAdapter.
 *
 * The consumer wires platform-specific side effects (e.g. StatusBar style).
 */
export function useDarkMode(): UseDarkModeReturn {
  // Bind matchMedia listener once
  if (!matchMediaBound && typeof window !== 'undefined' && window.matchMedia) {
    matchMediaBound = true;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = mql.matches;
    mql.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches;
    });

    // Toggle .dark class on <html> — single watcher for the lifetime of the app
    watch(isDark, (dark) => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', dark);
      }
    }, { immediate: true });
  }

  async function setTheme(value: ThemePreference): Promise<void> {
    theme.value = value;
    await getPlatformAdapter().secureSet(STORAGE_KEY, value);
  }

  // TODO: prevent flash-of-light-theme on reload (needs inline script + CSS via Vite transformIndexHtml plugin)
  async function init(): Promise<void> {
    const saved = await getPlatformAdapter().secureGet(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved as ThemePreference)) {
      theme.value = saved as ThemePreference;
    }
  }

  return {
    theme,
    isDark,
    setTheme,
    init,
  };
}

/** Reset module state — for tests only. */
export function _resetDarkMode(): void {
  theme.value = 'system';
  systemPrefersDark.value = false;
  matchMediaBound = false;
}
