import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetClientSingletons, usePublicClient } from '../../src/composables/useClient';

vi.mock('../../src/composables/useAuth', () => ({
  useAuth: () => ({
    getClient: () => null,
    isAuthenticated: { value: false },
  }),
}));

interface NuxtWindow {
  __NUXT__?: { config?: { public?: { defaultInstance?: string } } };
}

function setNuxtInstance(instance: string | undefined): void {
  const w = globalThis as unknown as NuxtWindow;
  if (instance === undefined) {
    delete w.__NUXT__;
    return;
  }
  w.__NUXT__ = { config: { public: { defaultInstance: instance } } };
}

beforeEach(() => {
  _resetClientSingletons();
  setNuxtInstance(undefined);
});

afterEach(() => {
  _resetClientSingletons();
  setNuxtInstance(undefined);
});

describe('usePublicClient — default instance resolution', () => {
  it('uses the Nuxt runtime config when window.__NUXT__ is present', () => {
    setNuxtInstance('fediway.com');
    const client = usePublicClient();
    expect(client.config.url).toBe('https://fediway.com');
  });

  it('honors a custom instance from Nuxt runtime config', () => {
    setNuxtInstance('mastodon.example.org');
    const client = usePublicClient();
    expect(client.config.url).toBe('https://mastodon.example.org');
  });

  it('falls back to fediway.com when no config is present', () => {
    setNuxtInstance(undefined);
    const client = usePublicClient();
    expect(client.config.url).toBe('https://fediway.com');
  });

  it('never falls back to mastodon.social', () => {
    // Privacy invariant: unauthenticated requests must never reach a
    // third-party instance. See `getDefaultInstanceUrl` in useClient.ts.
    setNuxtInstance(undefined);
    const client = usePublicClient();
    expect(client.config.url).not.toContain('mastodon.social');
  });

  it('strips any trailing slash edge case from the configured instance', () => {
    setNuxtInstance('fediway.com');
    const client = usePublicClient();
    expect(client.config.url).toBe('https://fediway.com');
    expect(client.config.url.endsWith('/')).toBe(false);
  });
});
