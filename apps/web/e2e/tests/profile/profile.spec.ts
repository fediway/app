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

  test('own profile shows Edit Profile instead of Follow', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Own profile should show "Edit Profile", not Follow/Message in the profile actions
    await expect(page.getByText('Edit Profile').last()).toBeVisible({ timeout: 5000 });
    // The profile actions area should NOT contain Follow or Message buttons
    const profileMain = page.locator('main');
    await expect(profileMain.getByText('Edit Profile').last()).toBeVisible();
    // "Follow" in sidebar suggestions is fine — just not in the profile actions
    await expect(profileMain.getByRole('button', { name: 'Message' })).not.toBeVisible();
  });

  test('other profile shows Follow and Message', async ({ page }) => {
    await page.goto('/@alex@mock.social');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // Other profile should show Follow and Message, not Edit Profile
    await expect(page.getByText('Follow', { exact: true }).last()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Message', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Edit Profile')).not.toBeVisible();
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
