import { useAuth } from '@repo/api';
import { useDataMode } from '~/composables/useDataMode';

export default defineNuxtPlugin(async () => {
  const { restoreSession, isAuthenticated } = useAuth();
  const { mode, setMode } = useDataMode();

  if (mode.value === 'live') {
    try {
      await restoreSession();
      if (!isAuthenticated.value) {
        // Session restore failed in live mode — fall back to mock
        setMode('mock');
      }
    }
    catch {
      // Session restore failed — fall back to mock
      setMode('mock');
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
