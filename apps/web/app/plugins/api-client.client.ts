import { useAccountStore, useAuth, useClient, useDarkMode } from '@repo/api';
import { useToast } from '@repo/ui';
import { watch } from 'vue';
import { useAuthState } from '~/composables/useAuthState';
import { useDataMode } from '~/composables/useDataMode';

export default defineNuxtPlugin(async () => {
  const { restoreSession, isAuthenticated } = useAuth();
  const { setAuthenticated, clearAuthenticated } = useAuthState();
  const { mode, setMode } = useDataMode();
  const { init: initDarkMode, theme, isDark } = useDarkMode();

  await initDarkMode();

  const themeCookie = useCookie('fediway_theme', { maxAge: 60 * 60 * 24 * 365 });
  if (themeCookie.value !== theme.value) {
    themeCookie.value = theme.value;
  }

  const resolvedCookie = useCookie('fediway_theme_resolved', { maxAge: 60 * 60 * 24 * 365 });
  resolvedCookie.value = isDark.value ? 'dark' : 'light';

  watch(isDark, (dark) => {
    resolvedCookie.value = dark ? 'dark' : 'light';
  });

  const isMockMode = mode.value === 'mock';

  if (isMockMode) {
    // Mock mode — explicitly requested via VITE_API_MODE=mock
    try {
      await restoreSession();
      if (isAuthenticated.value) {
        setMode('live');
        setAuthenticated();
      }
    }
    catch {
      // Stay in mock mode
    }

    // Set mock user for sidebar/navigation
    if (mode.value === 'mock' && !isAuthenticated.value) {
      try {
        const client = useClient();
        const mockUser = await client.rest.v1.accounts.verifyCredentials();
        const store = useAccountStore();
        store.currentUser.value = mockUser;
      }
      catch {
        // Mock client not available
      }
    }
  }
  else {
    // Live mode (default) — restore session
    try {
      await restoreSession();
    }
    catch {
      // Session restore failed
    }

    // Sync auth cookie with real auth state
    if (isAuthenticated.value) {
      setAuthenticated();
    }
    else {
      clearAuthenticated();
    }
  }

  const { toast } = useToast();

  watch(isAuthenticated, (authenticated) => {
    if (authenticated) {
      setAuthenticated();
    }
    else {
      clearAuthenticated();
      if (mode.value === 'live') {
        const currentPath = window.location.pathname;
        const redirect = currentPath !== '/' && currentPath !== '/login'
          ? `?redirect=${encodeURIComponent(currentPath)}`
          : '';
        toast('Session expired — please sign in again');
        navigateTo(`/login${redirect}`, { replace: true });
      }
    }
  });
});
