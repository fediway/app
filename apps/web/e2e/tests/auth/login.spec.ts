import { test as baseTest } from '@playwright/test';
import { expectAccessible } from '../../helpers/a11y';
import { loginWithMock, logout } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');

    // Logo visible
    await expect(page.getByText('Fediway')).toBeVisible();

    // Instance input visible
    await expect(page.getByLabel(/instance/i)).toBeVisible();

    // Sign in button visible
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Back button visible
    await expect(page.getByLabel(/go back/i)).toBeVisible();

    // A11y scan
    await expectAccessible(page);
  });

  test('can login with mock data and see home feed', async ({ page }) => {
    await loginWithMock(page);

    // Should be on home page
    await expect(page).toHaveURL('/');

    // Feed should render
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('can logout and return to trending feed', async ({ page }) => {
    await loginWithMock(page);

    // Verify authenticated
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Logout
    await logout(page);

    // Should see sign-in option (not authenticated UI)
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  // This test uses plain Playwright (no mock mode) to test auth redirect
  baseTest('protected routes redirect to login', async ({ page }) => {
    await page.goto('http://localhost:3000/favourites');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
