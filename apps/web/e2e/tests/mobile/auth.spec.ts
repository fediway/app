import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Auth', () => {
  test('logged out shows trending feed and sign in pill', async ({ page }) => {
    await page.goto('/');

    // Should show sign in link
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });

    // Feed content should still render (trending)
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('logged in shows home feed without sign in pill', async ({ page }) => {
    await loginWithMock(page);

    // Should show feed
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Sign in link should NOT be visible
    await expect(page.getByRole('link', { name: /sign in/i })).not.toBeVisible();
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
