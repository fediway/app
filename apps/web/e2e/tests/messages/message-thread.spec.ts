import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Message Thread', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('messages page shows conversation list', async ({ page }) => {
    await page.goto('/messages');
    // Conversation shows "Alex Chen" with message preview
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });
  });

  test('can navigate to a conversation thread', async ({ page }) => {
    await page.goto('/messages');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // Click the conversation
    await page.getByText('Alex Chen').first().dispatchEvent('click');

    // Should navigate to thread
    await expect(page).toHaveURL(/\/messages\//, { timeout: 5000 });
  });

  test('message thread has input field', async ({ page }) => {
    await page.goto('/messages');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    await page.getByText('Alex Chen').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/messages\//, { timeout: 5000 });

    // Should have a message input ("Write a message...")
    await expect(page.getByPlaceholder(/write a message/i).last()).toBeVisible({ timeout: 5000 });
  });
});
