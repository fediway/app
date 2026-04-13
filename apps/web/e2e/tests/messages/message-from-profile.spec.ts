import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Message from profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('opens existing 1:1 conversation when one exists', async ({ page }) => {
    await page.goto('/@alex');

    // Wait for profile to load
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // Click the Message button
    await page.getByRole('button', { name: 'Message', exact: true }).click();

    // Should navigate to the existing 1:1 conversation, not /messages/new
    await expect(page).toHaveURL(/\/messages\/conv-1/, { timeout: 5000 });
  });

  test('opens new message page when only group chats exist', async ({ page }) => {
    // Bob is only in a group chat (conv-group), no 1:1 exists
    await page.goto('/@bob@remote.social');

    await expect(page.getByText('Bob Remote').first()).toBeAttached({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Message', exact: true }).click();

    // Should navigate to new message page since no 1:1 conversation exists
    await expect(page).toHaveURL(/\/messages\/new\?acct=/, { timeout: 5000 });
  });

  test('new message page uses mobile chat input pattern', async ({ page }) => {
    await page.goto('/messages/new?acct=bob%40remote.social');

    // Wait for recipient info to load
    await expect(page.getByText('Bob Remote').first()).toBeAttached({ timeout: 10_000 });

    // Desktop input should be present (hidden on mobile, visible on lg)
    await expect(page.getByPlaceholder(/message @bob/i).first()).toBeAttached({ timeout: 5000 });
  });
});
