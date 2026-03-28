import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('profile page loads without "User not found" flash', async ({ page }) => {
    await page.goto('/@jane@mock.social');

    // Should NOT flash "User not found"
    await expect(page.getByText('User not found')).not.toBeVisible();

    // Profile should load — look for the mock user's name
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });
  });

  test('profile tabs work', async ({ page }) => {
    await page.goto('/@jane@mock.social');

    // Wait for profile
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Click Replies tab
    await page.getByRole('button', { name: 'Replies' }).click();

    // Click Media tab
    await page.getByRole('button', { name: 'Media' }).click();

    // Should still be on profile (no crash)
    await expect(page).toHaveURL(/@jane/);
  });
});
