import type { MastoClient } from '../client';
import { createMockClient } from '../mock/client';
import { useAuth } from './useAuth';

let mockClientSingleton: MastoClient | null = null;

function isMockMode(): boolean {
  try {
    // Access Vite env var — available at build time in Vite apps
    // Cast through unknown since ImportMeta doesn't include .env without Vite types
    const meta = import.meta as unknown as Record<string, unknown>;
    const env = meta.env as Record<string, string> | undefined;
    return env?.VITE_API_MODE === 'mock';
  }
  catch {
    return false;
  }
}

function getMockClient(): MastoClient {
  if (!mockClientSingleton) {
    mockClientSingleton = createMockClient();
  }
  return mockClientSingleton;
}

/**
 * Returns the current MastoClient.
 * In mock mode, returns a mock client when no authenticated session exists.
 * In live mode, throws if not initialized.
 */
export function useClient(): MastoClient {
  const { getClient } = useAuth();
  const client = getClient();
  if (client) {
    return client;
  }

  // Fall back to mock client when no auth client exists and we're in mock mode
  if (isMockMode()) {
    return getMockClient();
  }

  throw new Error('API client not initialized — call useAuth().login() or restoreSession() first');
}
