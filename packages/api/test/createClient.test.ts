import { describe, expect, it } from 'vitest';
import { createClient } from '../src/createClient';

describe('createClient', () => {
  it('returns mock client when config.mock is true', () => {
    const client = createClient({ url: 'https://mastodon.social', mock: true });
    expect(client.isAuthenticated).toBe(false);
    expect(client.config.url).toBe('https://mock.fediway.local');
  });

  it('returns real MastoClient when config.mock is false', () => {
    const client = createClient({ url: 'https://mastodon.social', mock: false });
    expect(client.config.url).toBe('https://mastodon.social');
  });

  it('mock client has same interface shape as real client', () => {
    const mockClient = createClient({ url: 'https://mastodon.social', mock: true });
    const realClient = createClient({ url: 'https://mastodon.social', mock: false });

    expect(typeof mockClient.rest).toBe(typeof realClient.rest);
    expect(typeof mockClient.fediway).toBe(typeof realClient.fediway);
    expect(typeof mockClient.config).toBe(typeof realClient.config);
    expect(typeof mockClient.isAuthenticated).toBe(typeof realClient.isAuthenticated);
  });

  it('defaults to real client when mock flag is not set', () => {
    const client = createClient({ url: 'https://mastodon.social' });
    expect(client.config.url).toBe('https://mastodon.social');
  });
});
