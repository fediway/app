import type { MastoClient } from '../client';
import { useAuth } from './useAuth';

/**
 * Returns the current MastoClient or throws if not initialized.
 * Convenience wrapper over useAuth().getClient() with a null check.
 */
export function useClient(): MastoClient {
  const { getClient } = useAuth();
  const client = getClient();
  if (!client) {
    throw new Error('API client not initialized — call useAuth().login() or restoreSession() first');
  }
  return client;
}
