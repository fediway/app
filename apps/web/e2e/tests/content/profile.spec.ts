import { expectAccessible } from '../../helpers/a11y';
import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('profile page loads without "User not found" flash', async ({ page }) => {
    // Wait for feed
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Click on a profile link (avatar or display name)
    await page.locator('article').first().getByRole('button').first().click();

    // Should NOT flash "User not found" (loading state should show first)
    await expect(page.getByText('User not found')).not.toBeVisible();

    // Profile should eventually load
    await expect(page.getByText(/posts|followers|following/i).first()).toBeVisible({ timeout: 10_000 });

    // A11y scan
    await expectAccessible(page);
  });

  test('profile tabs work', async ({ page }) => {
    // Navigate to a profile
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('article').first().getByRole('button').first().click();

    // Wait for profile
    await expect(page.getByText(/posts|followers|following/i).first()).toBeVisible({ timeout: 10_000 });

    // Click Replies tab
    await page.getByRole('button', { name: 'Replies' }).click();

    // Click Media tab
    await page.getByRole('button', { name: 'Media' }).click();

    // No errors
    await expect(page.getByText(/error|failed/i)).not.toBeVisible();
  });
});
