import { describe, expect, it } from 'vitest';
import { createMastoClient } from '../src/client';

describe('createMastoClient', () => {
  describe('fediway property', () => {
    it('has all fediway api methods', () => {
      const client = createMastoClient({ url: 'https://mastodon.social' });
      expect(client.fediway).toBeDefined();
      expect(typeof client.fediway.createStatus).toBe('function');
      expect(typeof client.fediway.getItem).toBe('function');
      expect(typeof client.fediway.getItemStatuses).toBe('function');
    });
  });

  describe('authentication state', () => {
    it('is not authenticated without token', () => {
      const client = createMastoClient({ url: 'https://mastodon.social' });
      expect(client.isAuthenticated).toBe(false);
    });

    it('is authenticated with token', () => {
      const client = createMastoClient({
        url: 'https://mastodon.social',
        accessToken: 'test-token',
      });
      expect(client.isAuthenticated).toBe(true);
    });
  });

  describe('streaming client', () => {
    it('creates streaming client when authenticated', () => {
      const client = createMastoClient({
        url: 'https://mastodon.social',
        accessToken: 'test-token',
      });
      expect(client.streaming).toBeDefined();
    });

    it('does not create streaming client when unauthenticated', () => {
      const client = createMastoClient({ url: 'https://mastodon.social' });
      expect(client.streaming).toBeUndefined();
    });
  });

  describe('config passthrough', () => {
    it('stores config on the client', () => {
      const config = { url: 'https://mastodon.social', accessToken: 'token' };
      const client = createMastoClient(config);
      expect(client.config).toBe(config);
      expect(client.config.url).toBe('https://mastodon.social');
      expect(client.config.accessToken).toBe('token');
    });

    it('has a rest client', () => {
      const client = createMastoClient({ url: 'https://mastodon.social' });
      expect(client.rest).toBeDefined();
    });
  });
});
