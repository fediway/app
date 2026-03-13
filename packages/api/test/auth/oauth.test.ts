import { createRestAPIClient } from 'masto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildAuthUrl,
  exchangeCode,
  generateCodeChallenge,
  generateCodeVerifier,
  getRedirectUri,
  registerApp,
} from '../../src/auth/oauth';

vi.mock('masto', () => ({
  createRestAPIClient: vi.fn(),
}));

const mockCreateRestAPIClient = vi.mocked(createRestAPIClient);
const BASE64URL_INVALID_CHARS_RE = /[+/=]/;
const OAUTH_CALLBACK_RE = /\/oauth\/callback$/;

describe('pkce', () => {
  it('generateCodeVerifier returns a base64url string', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThan(0);
    // base64url: no +, /, or =
    expect(verifier).not.toMatch(BASE64URL_INVALID_CHARS_RE);
  });

  it('generateCodeVerifier produces unique values', () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });

  it('generateCodeVerifier has expected length for 32 random bytes', () => {
    const verifier = generateCodeVerifier();
    // 32 bytes → 43 chars in base64url (no padding)
    expect(verifier.length).toBe(43);
  });

  it('generateCodeChallenge returns a different base64url string', async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge.length).toBeGreaterThan(0);
    expect(challenge).not.toMatch(BASE64URL_INVALID_CHARS_RE);
    expect(challenge).not.toBe(verifier);
  });

  it('same verifier always produces same challenge', async () => {
    const verifier = generateCodeVerifier();
    const a = await generateCodeChallenge(verifier);
    const b = await generateCodeChallenge(verifier);
    expect(a).toBe(b);
  });

  it('different verifiers produce different challenges', async () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    const c1 = await generateCodeChallenge(v1);
    const c2 = await generateCodeChallenge(v2);
    expect(c1).not.toBe(c2);
  });
});

describe('getRedirectUri', () => {
  it('uses window.location.origin in browser', () => {
    // happy-dom provides window
    const uri = getRedirectUri();
    expect(uri).toMatch(OAUTH_CALLBACK_RE);
  });
});

describe('buildAuthUrl', () => {
  it('constructs a valid OAuth authorization URL', () => {
    const url = buildAuthUrl(
      'https://mastodon.social',
      {
        clientId: 'client-123',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3333/oauth/callback',
      },
      'challenge-abc',
    );

    expect(url).toContain('https://mastodon.social/oauth/authorize');
    expect(url).toContain('client_id=client-123');
    expect(url).toContain('response_type=code');
    expect(url).toContain('code_challenge=challenge-abc');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain(encodeURIComponent('http://localhost:3333/oauth/callback'));
  });

  it('includes scope parameter', () => {
    const url = buildAuthUrl(
      'https://mastodon.social',
      { clientId: 'x', clientSecret: 'y', redirectUri: 'http://localhost/cb' },
      'ch',
    );
    expect(url).toContain('scope=');
  });
});

describe('registerApp', () => {
  beforeEach(() => {
    mockCreateRestAPIClient.mockReturnValue({
      v1: {
        apps: {
          create: vi.fn().mockResolvedValue({
            clientId: 'returned-client-id',
            clientSecret: 'returned-client-secret',
          }),
        },
      },
    } as unknown as ReturnType<typeof createRestAPIClient>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns client credentials from instance', async () => {
    const reg = await registerApp('https://mastodon.social', 'http://localhost:3333/oauth/callback');
    expect(reg.clientId).toBe('returned-client-id');
    expect(reg.clientSecret).toBe('returned-client-secret');
    expect(reg.redirectUri).toBe('http://localhost:3333/oauth/callback');
  });

  it('creates rest client with correct instance url', async () => {
    await registerApp('https://custom-instance.org', 'http://localhost/cb');
    expect(mockCreateRestAPIClient).toHaveBeenCalledWith({ url: 'https://custom-instance.org' });
  });

  it('passes correct app params', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      clientId: 'id',
      clientSecret: 'secret',
    });
    mockCreateRestAPIClient.mockReturnValue({
      v1: { apps: { create: mockCreate } },
    } as unknown as ReturnType<typeof createRestAPIClient>);

    await registerApp('https://mastodon.social', 'http://localhost/cb');

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      clientName: 'Fediway',
      redirectUris: 'http://localhost/cb',
      website: 'https://fediway.com',
    }));
  });

  it('throws when clientId is missing', async () => {
    mockCreateRestAPIClient.mockReturnValue({
      v1: {
        apps: {
          create: vi.fn().mockResolvedValue({ clientId: null, clientSecret: 'secret' }),
        },
      },
    } as unknown as ReturnType<typeof createRestAPIClient>);

    await expect(registerApp('https://mastodon.social', 'http://localhost/cb'))
      .rejects
      .toThrow('missing client credentials');
  });

  it('throws when clientSecret is missing', async () => {
    mockCreateRestAPIClient.mockReturnValue({
      v1: {
        apps: {
          create: vi.fn().mockResolvedValue({ clientId: 'id', clientSecret: null }),
        },
      },
    } as unknown as ReturnType<typeof createRestAPIClient>);

    await expect(registerApp('https://mastodon.social', 'http://localhost/cb'))
      .rejects
      .toThrow('missing client credentials');
  });
});

describe('exchangeCode', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const registration = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    redirectUri: 'http://localhost:3333/oauth/callback',
  };

  it('exchanges code for access token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'returned-token' }),
    });

    const token = await exchangeCode('https://mastodon.social', registration, 'auth-code', 'verifier');
    expect(token).toBe('returned-token');
  });

  it('posts to the correct endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token' }),
    });

    await exchangeCode('https://mastodon.social', registration, 'code', 'verifier');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mastodon.social/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('sends correct body parameters including code_verifier', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token' }),
    });

    await exchangeCode('https://mastodon.social', registration, 'the-code', 'the-verifier');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toMatchObject({
      grant_type: 'authorization_code',
      client_id: 'client-id',
      client_secret: 'client-secret',
      redirect_uri: 'http://localhost:3333/oauth/callback',
      code: 'the-code',
      code_verifier: 'the-verifier',
    });
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('invalid_grant'),
    });

    await expect(exchangeCode('https://mastodon.social', registration, 'bad-code', 'verifier'))
      .rejects
      .toThrow('Token exchange failed (400)');
  });
});
