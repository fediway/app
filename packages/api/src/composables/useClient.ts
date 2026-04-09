import type { MastoClient } from '../client';
import { createMastoClient } from '../client';
import { createMockClient } from '../mock/client';
import { useAuth } from './useAuth';

let mockClientSingleton: MastoClient | null = null;
let publicClientSingleton: MastoClient | null = null;

function isMockMode(): boolean {
  try {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore -- import.meta.env is typed in Nuxt/Vite consumers but not in base TS
    return import.meta.env?.VITE_API_MODE === 'mock';
  }
  catch {
    return false;
  }
}

function getDefaultInstanceUrl(): string {
  try {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore
    return `https://${import.meta.env?.NUXT_PUBLIC_DEFAULT_INSTANCE || 'mastodon.social'}`;
  }
  catch {
    return 'https://mastodon.social';
  }
}

function getMockClient(): MastoClient {
  if (!mockClientSingleton) {
    mockClientSingleton = createMockClient();
  }
  return mockClientSingleton;
}

function getPublicClient(): MastoClient {
  if (!publicClientSingleton) {
    publicClientSingleton = createMastoClient({
      url: getDefaultInstanceUrl(),
      // No accessToken — read-only public API access
    });
  }
  return publicClientSingleton;
}

/**
 * Returns a public (unauthenticated) client for the default instance.
 * Use for instance-level data (trending, explore) that doesn't vary by user.
 */
export function usePublicClient(): MastoClient {
  if (isMockMode())
    return getMockClient();
  return getPublicClient();
}

/**
 * Returns the current MastoClient. Always returns a working client:
 * 1. Authenticated client (full read + write access)
 * 2. Mock client (when VITE_API_MODE=mock)
 * 3. Public client (unauthenticated, read-only for default instance)
 */
export function useClient(): MastoClient {
  const { getClient } = useAuth();
  const client = getClient();
  if (client) {
    return client;
  }

  if (isMockMode()) {
    return getMockClient();
  }

  // Unauthenticated — return a public client for the default instance.
  // Supports read-only API calls (public timelines, profiles, trending).
  // Write operations (favourite, boost, etc.) will fail with a 401.
  return getPublicClient();
}
