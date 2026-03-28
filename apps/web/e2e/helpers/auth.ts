import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { mockAccount } from '../fixtures/mock-data';

/**
 * Inject authenticated state into localStorage before navigation.
 *
 * This is the worldclass pattern (Cal.com, Grafana, Stripe):
 * Instead of clicking through a login flow in every test, inject
 * the auth tokens and account data directly into browser storage.
 * The app boots up already authenticated.
 */
export async function injectAuthState(page: Page) {
  const accountKey = `${mockAccount.username}@mock.social`;
  const domain = 'mock.social';
  const accountId = mockAccount.id;

  await page.addInitScript(({ accountKey, domain, accountId, account }) => {
    // Account list
    const storedAccount = {
      key: accountKey,
      instanceUrl: `https://${domain}`,
      instanceDomain: domain,
      accountId,
      acct: account.acct,
      displayName: account.displayName,
      avatarUrl: account.avatar,
    };
    localStorage.setItem('fediway_accounts', JSON.stringify([storedAccount]));

    // Active account
    localStorage.setItem('fediway_active_account', accountKey);

    // Auth token (stored via platform adapter — web uses localStorage)
    localStorage.setItem(`fediway_token:${domain}:${accountId}`, 'mock-e2e-token');
  }, { accountKey, domain, accountId, account: mockAccount });
}

/**
 * Login by injecting auth state, then navigating to home.
 * The app boots already authenticated — no login page interaction needed.
 */
export async function loginWithMock(page: Page) {
  await injectAuthState(page);
  await page.goto('/');
  // Wait for the authenticated feed to render
  await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
}

/**
 * Login by clicking "Continue with mock data" on the login page.
 * Use this only for tests that specifically test the login flow itself.
 */
export async function loginViaUI(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /mock data/i }).click();
  await expect(page).toHaveURL('/');
}

/**
 * Logout via settings page.
 */
export async function logout(page: Page) {
  await page.goto('/settings');
  await page.getByRole('button', { name: /log out/i }).click();
  // After logout, app redirects to login (settings is a protected route)
  await page.waitForURL(/\/(login|$)/, { timeout: 10_000 });
}
