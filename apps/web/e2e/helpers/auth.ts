import type { Page } from '@playwright/test';

/**
 * Login using mock mode — clicks "Continue with mock data" on the login page.
 * Uses waitUntil: 'commit' because the SPA may redirect during hydration.
 */
export async function loginWithMock(page: Page) {
  await page.goto('/login', { waitUntil: 'commit' });
  await page.getByRole('button', { name: /mock data/i }).click({ timeout: 15_000 });
  await page.waitForURL('/', { timeout: 15_000 });
}

/**
 * Logout via settings page.
 */
export async function logout(page: Page) {
  await page.goto('/settings', { waitUntil: 'commit' });
  await page.getByRole('button', { name: /log out/i }).click({ timeout: 15_000 });
  await page.waitForURL('/', { timeout: 15_000 });
}
