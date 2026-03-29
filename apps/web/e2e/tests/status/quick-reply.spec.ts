import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Quick Reply', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    // Navigate to status detail
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });
  });

  // Desktop layout renders both mobile (hidden) and desktop (visible) copies.
  // Use .last() to target the visible desktop instance.
  test('quick reply prompt is visible on status detail', async ({ page }) => {
    await expect(page.getByTestId('quick-reply-trigger').last()).toBeVisible({ timeout: 10_000 });
  });

  test('clicking prompt expands with identity hint', async ({ page }) => {
    await page.getByTestId('quick-reply-trigger').last().click();

    // Should show "replying to" hint
    await expect(page.getByText(/replying to/i).first()).toBeVisible({ timeout: 5000 });

    // Textarea should be visible
    await expect(page.getByPlaceholder(/what's your reply/i).last()).toBeVisible();

    // Reply button should be visible
    await expect(page.getByTestId('quick-reply-submit').last()).toBeVisible();
  });

  test('can type and submit a quick reply', async ({ page }) => {
    // Listen for the POST request to /api/v1/statuses
    const postRequestPromise = page.waitForRequest(
      request => request.url().includes('/api/v1/statuses')
        && request.method() === 'POST'
        && !request.url().includes('/context'),
      { timeout: 10_000 },
    );

    await page.getByTestId('quick-reply-trigger').last().click();
    await page.getByPlaceholder(/what's your reply/i).last().fill('Quick reply test');
    await page.getByTestId('quick-reply-submit').last().click();

    const postRequest = await postRequestPromise;
    const body = postRequest.postDataJSON();
    expect(body.status || body.content).toBeTruthy();
    expect(body.in_reply_to_id || body.inReplyToId).toBeTruthy();
  });

  test('expand button opens full compose modal', async ({ page }) => {
    await page.getByTestId('quick-reply-trigger').last().click();
    await page.getByLabel(/open full composer/i).last().click();

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Write a reply')).toBeVisible();
  });
});
