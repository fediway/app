import { injectAuthState } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('OAuth redirect flow', () => {
  test('back button after login does not go to expired OAuth callback', async ({ page }) => {
    // 1. Visit a protected post page without auth → redirects to login
    await page.goto('/@jane/100');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(page.getByText(/sign in/i).first()).toBeVisible({ timeout: 5000 });

    // 2. Simulate successful login (inject auth state + navigate like OAuth callback would)
    await injectAuthState(page);
    await page.goto('/@jane/100');
    await expect(page).toHaveURL(/\/@jane\/100/, { timeout: 10_000 });

    // 3. Verify post loaded
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // 4. Click back — should NOT go to /login or /oauth/callback
    await page.goBack();
    const url = page.url();
    expect(url).not.toContain('/login');
    expect(url).not.toContain('/oauth');
  });
});
