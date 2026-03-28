import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Quick Reply', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('quick reply input is visible on status detail page', async ({ page }) => {
    // Navigate to feed, click a post to open detail
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Quick reply should be visible with placeholder
    await expect(page.getByText(/reply to|write a reply/i).first()).toBeAttached({ timeout: 10_000 });
  });

  test('clicking quick reply expands the input', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Click the reply placeholder to expand
    await page.getByText(/reply to|write a reply/i).first().click();

    // Textarea should now be visible
    await expect(page.getByPlaceholder(/reply to|write a reply/i).first()).toBeVisible({ timeout: 5000 });

    // Reply button should be visible
    await expect(page.getByRole('button', { name: /reply/i }).first()).toBeVisible();
  });

  test('can type and submit a quick reply', async ({ page }) => {
    // Intercept status creation
    let capturedPostBody: any = null;
    await page.route(/\/api\/v1\/statuses$/, async (route) => {
      if (route.request().method() === 'POST') {
        try {
          capturedPostBody = JSON.parse(route.request().postData() || '{}');
        }
        catch {
          capturedPostBody = route.request().postData();
        }
        return route.fulfill({
          json: {
            id: `reply-${Date.now()}`,
            createdAt: new Date().toISOString(),
            content: '<p>Quick reply from E2E</p>',
            account: { id: '1', username: 'jane', acct: 'jane@mock.social', displayName: 'Jane Doe', avatar: '', avatarStatic: '', emojis: [] },
            favourited: false,
            reblogged: false,
            bookmarked: false,
            repliesCount: 0,
            reblogsCount: 0,
            favouritesCount: 0,
            visibility: 'public',
            spoilerText: '',
            mediaAttachments: [],
            mentions: [],
            tags: [],
            emojis: [],
            inReplyToId: '100',
            url: 'https://mock.social/@jane/reply',
            uri: 'https://mock.social/users/jane/statuses/reply',
          },
        });
      }
      return route.continue();
    });

    // Navigate to status detail
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Click placeholder to expand
    await page.getByText(/reply to|write a reply/i).first().click();

    // Type a reply
    const textarea = page.getByPlaceholder(/reply to|write a reply/i).first();
    await textarea.fill('Quick reply from E2E');

    // Click Reply button
    await page.getByRole('button', { name: /reply/i }).first().click();

    // Verify the POST included inReplyToId
    expect(capturedPostBody).toBeTruthy();
    expect(capturedPostBody.in_reply_to_id || capturedPostBody.inReplyToId).toBeTruthy();
  });

  test('expand button opens full compose modal', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Expand quick reply
    await page.getByText(/reply to|write a reply/i).first().click();

    // Click the expand button (arrows-out icon)
    await page.getByLabel(/open full composer/i).click();

    // Full compose modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Should show "Write a reply" title (reply context)
    await expect(page.getByText('Write a reply')).toBeVisible();
  });
});
