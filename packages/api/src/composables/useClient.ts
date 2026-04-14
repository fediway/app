import type { MastoClient } from '../client';
import { createMastoClient } from '../client';
import { createMockClient } from '../mock/client';
import { useAuth } from './useAuth';

let mockClientSingleton: MastoClient | null = null;
let publicClientSingleton: MastoClient | null = null;

export function _resetClientSingletons(): void {
  mockClientSingleton = null;
  publicClientSingleton = null;
}

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

interface NuxtWindow {
  __NUXT__?: { config?: { public?: { defaultInstance?: string } } };
}

// Never fall back to `mastodon.social`: a third-party instance would receive
// unauthenticated browsing activity from users who never signed in there, with
// Fediway's Origin and User-Agent headers attached.
function getDefaultInstanceUrl(): string {
  if (typeof window !== 'undefined') {
    const fromNuxt = (window as unknown as NuxtWindow).__NUXT__?.config?.public?.defaultInstance;
    if (fromNuxt)
      return `https://${fromNuxt}`;
  }

  try {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore -- import.meta.env is typed in Nuxt/Vite consumers but not in base TS
    const fromVite = import.meta.env?.VITE_DEFAULT_INSTANCE;
    if (typeof fromVite === 'string' && fromVite.length > 0)
      return `https://${fromVite}`;
  }
  catch {}

  return 'https://fediway.com';
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
