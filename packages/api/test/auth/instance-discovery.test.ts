import { createRestAPIClient } from 'masto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { discoverInstance, normalizeInstanceUrl } from '../../src/auth/instance-discovery';

vi.mock('masto', () => ({
  createRestAPIClient: vi.fn(),
}));

const mockCreateRestAPIClient = vi.mocked(createRestAPIClient);

describe('normalizeInstanceUrl', () => {
  it('adds https:// to a plain domain', () => {
    expect(normalizeInstanceUrl('mastodon.social')).toBe('https://mastodon.social');
  });

  it('strips http:// and replaces with https://', () => {
    expect(normalizeInstanceUrl('http://mastodon.social')).toBe('https://mastodon.social');
  });

  it('keeps https://', () => {
    expect(normalizeInstanceUrl('https://mastodon.social')).toBe('https://mastodon.social');
  });

  it('strips trailing slash', () => {
    expect(normalizeInstanceUrl('mastodon.social/')).toBe('https://mastodon.social');
    expect(normalizeInstanceUrl('mastodon.social///')).toBe('https://mastodon.social');
  });

  it('lowercases the domain', () => {
    expect(normalizeInstanceUrl('Mastodon.Social')).toBe('https://mastodon.social');
  });

  it('trims whitespace', () => {
    expect(normalizeInstanceUrl('  mastodon.social  ')).toBe('https://mastodon.social');
  });

  it('strips path segments', () => {
    expect(normalizeInstanceUrl('mastodon.social/about')).toBe('https://mastodon.social');
  });

  it('handles full URL with path', () => {
    expect(normalizeInstanceUrl('https://mastodon.social/about/more')).toBe('https://mastodon.social');
  });

  it('handles domain with port-like appearance', () => {
    expect(normalizeInstanceUrl('instance.local')).toBe('https://instance.local');
  });
});

describe('discoverInstance', () => {
  function mockInstance(overrides: Record<string, unknown> = {}) {
    return {
      domain: 'mastodon.social',
      version: '4.3.0',
      configuration: {
        urls: { streaming: 'wss://mastodon.social/api/v1/streaming' },
        statuses: { maxCharacters: 500 },
      },
      ...overrides,
    };
  }

  function setupMock(instance: ReturnType<typeof mockInstance>) {
    mockCreateRestAPIClient.mockReturnValue({
      v2: {
        instance: {
          fetch: vi.fn().mockResolvedValue(instance),
        },
      },
    } as unknown as ReturnType<typeof createRestAPIClient>);
  }

  beforeEach(() => {
    setupMock(mockInstance());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns instance info for a valid instance', async () => {
    const info = await discoverInstance('https://mastodon.social');
    expect(info.domain).toBe('mastodon.social');
    expect(info.version).toBe('4.3.0');
    expect(info.streamingUrl).toBe('wss://mastodon.social/api/v1/streaming');
    expect(info.maxChars).toBe(500);
  });

  it('creates rest client with the provided url', async () => {
    await discoverInstance('https://custom-instance.org');
    expect(mockCreateRestAPIClient).toHaveBeenCalledWith({ url: 'https://custom-instance.org' });
  });

  it('throws for version below 4.3.0', async () => {
    setupMock(mockInstance({ version: '4.2.9' }));

    await expect(discoverInstance('https://old.instance'))
      .rejects
      .toThrow('too old');
  });

  it('accepts version 4.3.0 exactly', async () => {
    setupMock(mockInstance({ version: '4.3.0' }));
    const info = await discoverInstance('https://mastodon.social');
    expect(info.version).toBe('4.3.0');
  });

  it('accepts versions above minimum', async () => {
    setupMock(mockInstance({ version: '4.4.0' }));
    const info = await discoverInstance('https://mastodon.social');
    expect(info.version).toBe('4.4.0');
  });

  it('handles versions with prerelease suffixes', async () => {
    setupMock(mockInstance({ version: '4.3.1-alpha.1+glitch' }));
    const info = await discoverInstance('https://mastodon.social');
    expect(info.version).toBe('4.3.1-alpha.1+glitch');
  });

  it('rejects major version too low', async () => {
    setupMock(mockInstance({ version: '3.5.0' }));

    await expect(discoverInstance('https://old.instance'))
      .rejects
      .toThrow('too old');
  });

  it('accepts major version above minimum', async () => {
    setupMock(mockInstance({ version: '5.0.0' }));
    const info = await discoverInstance('https://mastodon.social');
    expect(info.version).toBe('5.0.0');
  });

  it('falls back streaming url when not in config', async () => {
    setupMock(mockInstance({
      configuration: {
        urls: {},
        statuses: { maxCharacters: 500 },
      },
    }));

    const info = await discoverInstance('https://example.com');
    expect(info.streamingUrl).toBe('https://example.com/api/v1/streaming');
  });

  it('falls back maxChars to 500 when not in config', async () => {
    setupMock(mockInstance({
      configuration: {
        urls: { streaming: 'wss://example.com' },
        statuses: {},
      },
    }));

    const info = await discoverInstance('https://example.com');
    expect(info.maxChars).toBe(500);
  });

  it('propagates network errors', async () => {
    mockCreateRestAPIClient.mockReturnValue({
      v2: {
        instance: {
          fetch: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      },
    } as unknown as ReturnType<typeof createRestAPIClient>);

    await expect(discoverInstance('https://unreachable.instance'))
      .rejects
      .toThrow('Network error');
  });
});
