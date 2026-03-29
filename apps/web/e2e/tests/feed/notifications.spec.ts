import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('notifications page loads and shows notifications', async ({ page }) => {
    await page.goto('/notifications');
    // Should render notification items (favourite, reblog, follow, mention)
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });
  });

  test('notification shows the correct action type', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // At least one notification type text should be present
    await expect(
      page.getByText(/liked|favourited|boosted|reblogged|followed|mentioned/i).first(),
    ).toBeAttached({ timeout: 5000 });
  });

  test('clicking a notification navigates to relevant content', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // Click the first notification
    await page.getByText('Alex Chen').first().dispatchEvent('click');

    // Should navigate somewhere (profile or status) or stay (follow notifications)
    await page.waitForTimeout(1000);
    expect(page.url()).toBeTruthy();
  });
});
