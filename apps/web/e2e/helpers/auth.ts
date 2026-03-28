import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Login by clicking "Continue with mock data" on the login page.
 * With route interception active, this sets the app to mock mode
 * and the intercepted API provides all data.
 */
export async function loginWithMock(page: Page) {
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
  await expect(page).toHaveURL('/');
}
