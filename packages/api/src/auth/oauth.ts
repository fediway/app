import { createRestAPIClient } from 'masto';

export interface OAuthRegistration {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const SCOPES = 'read write follow push';

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
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Get the OAuth redirect URI for the current environment.
 */
export function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
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
