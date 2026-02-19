import { useAuth } from '@repo/api';
import { useDataMode } from '~/composables/useDataMode';

export default defineNuxtPlugin(async () => {
  const { restoreSession, isAuthenticated } = useAuth();
  const { setMode } = useDataMode();

  try {
    await restoreSession();
    if (isAuthenticated.value) {
      setMode('live');
    }
  }
  catch {
    // Session restore failed — stay in mock mode
  }
});
