import type { AddAccountOptions } from '../auth/account-store';
import { computed, ref } from 'vue';
import { useAccountStore } from '../auth/account-store';
import { discoverInstance, normalizeInstanceUrl } from '../auth/instance-discovery';
import {
  buildAuthUrl,
  exchangeCode,
  generateCodeChallenge,
  generateCodeVerifier,
  getRedirectUri,
  registerApp,
} from '../auth/oauth';
import { createMastoClient } from '../client';

// PKCE state persisted between redirect and callback
const oauthState = ref<{
  instanceUrl: string;
  domain: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} | null>(null);

/**
 * Composable for managing Mastodon authentication state.
 * Delegates to useAccountStore() for multi-account storage.
 * Public API is unchanged from the single-account version.
 */
export function useAuth() {
  const store = useAccountStore();

  const isAuthenticated = store.isAuthenticated;
  const currentUser = computed(() => store.currentUser.value);
  const instanceUrl = store.instanceUrl;
  const isLoading = store.isLoading;
  const error = store.error;

  /**
   * Login with access token (for dev/testing)
   */
  async function login(url: string, accessToken: string) {
    store.isLoading.value = true;
    store.error.value = null;

    try {
      // Create a temporary client to verify credentials
      const tempClient = createMastoClient({ url, accessToken });
      const user = await tempClient.rest.v1.accounts.verifyCredentials();

      let domain: string;
      try {
        domain = new URL(url).hostname;
      }
      catch {
        domain = url.replace(/^https?:\/\//, '').split('/')[0] ?? url;
      }

      const opts: AddAccountOptions = {
        instanceUrl: url,
        instanceDomain: domain,
        accountId: user.id,
        username: user.username,
        displayName: user.displayName ?? undefined,
        avatarUrl: user.avatar ?? undefined,
        accessToken,
      };

      await store.addAccount(opts);
      store.currentUser.value = user;
    }
    catch (err) {
      store.error.value = err instanceof Error ? err : new Error('Login failed');
      throw store.error.value;
    }
    finally {
      store.isLoading.value = false;
    }
  }

  /**
   * Start OAuth login flow — discovers instance, registers app, redirects to auth page
   */
  async function loginWithOAuth(instanceInput: string) {
    store.isLoading.value = true;
    store.error.value = null;

    try {
      const url = normalizeInstanceUrl(instanceInput);
      const info = await discoverInstance(url);

      const redirectUri = getRedirectUri();
      const registration = await registerApp(url, redirectUri);

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Persist OAuth state for the callback
      oauthState.value = {
        instanceUrl: url,
        domain: info.domain,
        codeVerifier,
        clientId: registration.clientId,
        clientSecret: registration.clientSecret,
        redirectUri,
      };

      // Also persist to sessionStorage so it survives the redirect
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('fediway_oauth_state', JSON.stringify(oauthState.value));
      }

      const authUrl = buildAuthUrl(url, registration, codeChallenge);

      // Redirect to the instance's OAuth page
      window.location.href = authUrl;
    }
    catch (err) {
      store.error.value = err instanceof Error ? err : new Error('OAuth login failed');
      store.isLoading.value = false;
      throw store.error.value;
    }
  }

  /**
   * Handle the OAuth callback — exchange code for token, initialize session
   */
  async function handleOAuthCallback(code: string) {
    store.isLoading.value = true;
    store.error.value = null;

    try {
      // Restore OAuth state from sessionStorage if needed
      let oauth = oauthState.value;
      if (!oauth && typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem('fediway_oauth_state');
        if (raw) {
          oauth = JSON.parse(raw);
          oauthState.value = oauth;
        }
      }

      if (!oauth) {
        throw new Error('OAuth state not found — please try logging in again');
      }

      const accessToken = await exchangeCode(
        oauth.instanceUrl,
        {
          clientId: oauth.clientId,
          clientSecret: oauth.clientSecret,
          redirectUri: oauth.redirectUri,
        },
        code,
        oauth.codeVerifier,
      );

      // Clean up OAuth state
      oauthState.value = null;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('fediway_oauth_state');
      }

      // Create a temporary client to verify credentials
      const tempClient = createMastoClient({ url: oauth.instanceUrl, accessToken });
      const user = await tempClient.rest.v1.accounts.verifyCredentials();

      const opts: AddAccountOptions = {
        instanceUrl: oauth.instanceUrl,
        instanceDomain: oauth.domain,
        accountId: user.id,
        username: user.username,
        displayName: user.displayName ?? undefined,
        avatarUrl: user.avatar ?? undefined,
        accessToken,
        appRegistration: {
          clientId: oauth.clientId,
          clientSecret: oauth.clientSecret,
        },
      };

      await store.addAccount(opts);
      store.currentUser.value = user;
    }
    catch (err) {
      store.error.value = err instanceof Error ? err : new Error('OAuth callback failed');
      store.isLoading.value = false;
      throw store.error.value;
    }
  }

  /**
   * Handle 401 — delegate to account store
   */
  function handle401() {
    store.handleAccountExpired();
  }

  /**
   * Logout current account
   */
  async function logout() {
    const account = store.activeAccount.value;
    if (account) {
      await store.removeAccount(account.key);
    }
  }

  /**
   * Get the current masto client
   */
  function getClient() {
    return store.getClient();
  }

  /**
   * Restore session from storage
   */
  async function restoreSession() {
    await store.restoreSession();
  }

  return {
    // State
    isAuthenticated,
    currentUser,
    instanceUrl,
    isLoading,
    error,

    // Actions
    login,
    loginWithOAuth,
    handleOAuthCallback,
    handle401,
    logout,
    getClient,
    restoreSession,
  };
}
