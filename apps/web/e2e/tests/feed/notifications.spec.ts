import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/notifications');
    await expect(page.getByText('liked your post').first()).toBeAttached({ timeout: 10_000 });
  });

  test('renders grouped notifications with both account names', async ({ page }) => {
    await expect(page.getByText('Alex Chen').first()).toBeAttached();
    await expect(page.getByText('Bob Remote').first()).toBeAttached();
  });

  test('shows multiple notification action types', async ({ page }) => {
    await expect(page.getByText('liked your post').first()).toBeAttached();
    // Verify at least one other type is present (repost, mention, or follow)
    const otherTypes = page.locator('text=/reposted your post|mentioned you|followed you/');
    await expect(otherTypes.first()).toBeAttached({ timeout: 5000 });
  });

  test('shows follow back button for follow notifications', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Follow back' })).toBeAttached({ timeout: 5000 });
  });
});
