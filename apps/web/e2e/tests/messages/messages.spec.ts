import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Messages', () => {
  test('conversation list loads', async ({ page }) => {
    await loginWithMock(page);

    await page.goto('/messages');

    // Should show at least one conversation (from mock data)
    await expect(
      page.getByText(/Alex Chen|Jane Doe/i).first(),
    ).toBeAttached({ timeout: 10_000 });
  });

  test('can navigate to a conversation thread', async ({ page }) => {
    await loginWithMock(page);

    await page.goto('/messages');

    // Wait for conversation list
    await expect(
      page.getByText(/Alex Chen|Jane Doe/i).first(),
    ).toBeAttached({ timeout: 10_000 });

    // Click the first conversation
    await page.getByText(/Alex Chen|Jane Doe/i).first().dispatchEvent('click');

    // Should navigate to the thread
    await expect(page).toHaveURL(/\/messages\//);

    // Message bubbles should render
    await expect(
      page.locator('[class*="rounded-2xl"]').first()
        .or(page.getByText(/have you seen|new color system/i).first()),
    ).toBeAttached({ timeout: 10_000 });
  });

  test('message input is visible in thread', async ({ page }) => {
    await loginWithMock(page);

    await page.goto('/messages');
    await expect(
      page.getByText(/Alex Chen|Jane Doe/i).first(),
    ).toBeAttached({ timeout: 10_000 });

    // Navigate to thread
    await page.getByText(/Alex Chen|Jane Doe/i).first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/messages\//);

    // Message input should be present
    await expect(page.getByPlaceholder(/write a message/i).first()).toBeAttached({ timeout: 10_000 });
  });
});
