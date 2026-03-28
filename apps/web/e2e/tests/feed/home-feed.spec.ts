import { expectAccessible } from '../../helpers/a11y';
import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Home Feed', () => {
  test('shows trending feed when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should render posts (trending feed)
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Should show sign-in option
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();

    // A11y scan
    await expectAccessible(page);
  });

  test('shows home timeline when authenticated', async ({ page }) => {
    await loginWithMock(page);

    // Should render posts
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Should NOT flash "Your timeline is empty"
    // (regression test for the flash-of-empty-state bug)
    await expect(page.getByText('Your timeline is empty')).not.toBeVisible();

    // A11y scan
    await expectAccessible(page);
  });

  test('no flash of empty state on load', async ({ page }) => {
    await loginWithMock(page);

    // Navigate away and back (tests KeepAlive + initial load)
    await page.goto('/search');
    await page.goto('/');

    // Posts should appear quickly — no skeleton or empty state flash
    await expect(page.locator('article').first()).toBeVisible({ timeout: 2000 });
  });
});
