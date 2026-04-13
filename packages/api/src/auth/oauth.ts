import { createRestAPIClient } from 'masto';
import { getPlatformAdapter } from '../platform';

export interface OAuthRegistration {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const SCOPES = 'read write follow push';
const PLUS_RE = /\+/g;
const SLASH_RE = /\//g;
const TRAILING_EQUALS_RE = /=+$/;

/**
 * Generate a random code verifier for PKCE.
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate PKCE code challenge from verifier (S256).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(PLUS_RE, '-').replace(SLASH_RE, '_').replace(TRAILING_EQUALS_RE, '');
}

/**
 * Get the OAuth redirect URI for the current environment.
 * Returns a custom URL scheme on native (Capacitor) platforms.
 */
export function getRedirectUri(): string {
  if (getPlatformAdapter().isNative()) {
    return 'com.fediway.app://oauth/callback';
  }
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/oauth/callback`;
  }
  return 'http://localhost:3333/oauth/callback';
}

/**
 * Register Fediway as an OAuth app on the given instance.
 * Uses the REST client for app registration (POST /api/v1/apps).
 */
export async function registerApp(instanceUrl: string, redirectUri: string): Promise<OAuthRegistration> {
  const rest = createRestAPIClient({ url: instanceUrl });
  const app = await rest.v1.apps.create({
    clientName: 'Fediway',
    redirectUris: redirectUri,
    scopes: SCOPES,
    website: 'https://fediway.com',
  });

  if (!app.clientId || !app.clientSecret) {
    throw new Error('OAuth app registration failed — missing client credentials');
  }

  return {
    clientId: app.clientId,
    clientSecret: app.clientSecret,
    redirectUri,
  };
}

/**
 * Build the authorization URL that the user will be redirected to.
 */
export function buildAuthUrl(
  instanceUrl: string,
  registration: OAuthRegistration,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: registration.clientId,
    redirect_uri: registration.redirectUri,
    response_type: 'code',
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${instanceUrl}/oauth/authorize?${params}`;
}

/**
 * Exchange the authorization code for an access token.
 * Uses raw fetch because the masto library doesn't support PKCE (code_verifier).
 */
export async function exchangeCode(
  instanceUrl: string,
  registration: OAuthRegistration,
  code: string,
  codeVerifier: string,
): Promise<string> {
  const response = await fetch(`${instanceUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: registration.clientId,
      client_secret: registration.clientSecret,
      redirect_uri: registration.redirectUri,
      code,
      code_verifier: codeVerifier,
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${body}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * OAuth 2.0 Resource Owner Password Credentials grant (RFC 6749 §4.3).
 * Used when the home instance has the Fediway direct-auth flag enabled — POST email + password,
 * get back a bearer token without the OAuth redirect dance. Only safe for first-party clients.
 */
export async function passwordGrant(
  instanceUrl: string,
  clientId: string,
  clientSecret: string,
  email: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${instanceUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username: email,
      password,
      scope: SCOPES,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error_description?: string; error?: string } | null;
    const message = body?.error_description ?? body?.error ?? `password grant failed (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * Exchange a bearer token for a Devise session cookie via the Fediway SSO bridge.
 * Lets the same login give access to both the JSON API (bearer) and the server-rendered
 * admin / settings pages (session cookie). Best-effort — failure does not block login.
 */
export async function bridgeSession(instanceUrl: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${instanceUrl}/api/fediway/v1/sessions/bridge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  }
  catch {
    return false;
  }
}
