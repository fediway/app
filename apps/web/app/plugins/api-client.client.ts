import { useAuth, useDarkMode } from '@repo/api';
import { watch } from 'vue';
import { useDataMode } from '~/composables/useDataMode';

export default defineNuxtPlugin(async () => {
  const { restoreSession, isAuthenticated } = useAuth();
  const { mode, setMode } = useDataMode();
  const { init: initDarkMode, theme, isDark } = useDarkMode();

  await initDarkMode();

  // Preference cookie — stores 'system', 'dark', or 'light' (for settings button SSR).
  const themeCookie = useCookie('fediway_theme', { maxAge: 60 * 60 * 24 * 365 });
  if (themeCookie.value !== theme.value) {
    themeCookie.value = theme.value;
  }

  // Resolved cookie — always 'dark' or 'light' (for SSR .dark class).
  // Handles the 'system' case: resolves via matchMedia so the server knows what to render.
  const resolvedCookie = useCookie('fediway_theme_resolved', { maxAge: 60 * 60 * 24 * 365 });
  resolvedCookie.value = isDark.value ? 'dark' : 'light';

  // Keep resolved cookie in sync when system preference changes.
  watch(isDark, (dark) => {
    resolvedCookie.value = dark ? 'dark' : 'light';
  });

  const envMode = import.meta.env.VITE_API_MODE as string | undefined;

  if (mode.value === 'live') {
    try {
      await restoreSession();
      if (!isAuthenticated.value) {
        if (envMode === 'live') {
          // Env forced live mode — redirect to login, never fall back to mock
          navigateTo('/login');
        }
        else {
          setMode('mock');
        }
      }
    }
    catch {
      if (envMode === 'live') {
        navigateTo('/login');
      }
      else {
        setMode('mock');
      }
    }
  }
  else {
    // In mock mode, try session restore in case user has a stored session
    try {
      await restoreSession();
      if (isAuthenticated.value) {
        setMode('live');
      }
    }
    catch {
      // Stay in mock mode
    }
  }
});
