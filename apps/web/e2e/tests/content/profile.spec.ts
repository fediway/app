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

    // Profile should load
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });
  });

  test('profile tabs work', async ({ page }) => {
    await page.goto('/@jane@mock.social');

    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Click Replies tab (use last() — first is hidden mobile layout)
    await page.getByText('Replies', { exact: true }).last().click();

    // Click Media tab
    await page.getByText('Media', { exact: true }).last().click();

    // Should still be on profile
    await expect(page).toHaveURL(/@jane/);
  });
});
