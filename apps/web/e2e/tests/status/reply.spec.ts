import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Reply Flow', () => {
  test('clicking reply opens composer with context', async ({ page }) => {
    await loginWithMock(page);

    // Wait for feed
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Click the reply button on the first post (chat bubble icon)
    // Reply button is inside the article's action bar
    const firstArticle = page.locator('article').first();
    const replyButton = firstArticle.getByLabel(/reply/i);
    await replyButton.dispatchEvent('click');

    // Composer modal should open with reply context
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Title should say "Write a reply"
    await expect(page.getByText('Write a reply')).toBeVisible();

    // Reply context should show the @mention
    await expect(page.locator('[role="dialog"]').getByText(/@/).first()).toBeAttached();
  });

  test('reply includes inReplyToId in submission', async ({ page }) => {
    // Capture the POST body
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
            content: '<p>@jane test reply</p>',
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

    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Click reply on first post
    const replyButton = page.locator('article').first().getByLabel(/reply/i);
    await replyButton.dispatchEvent('click');

    // Wait for composer
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Type a reply
    const editor = page.locator('[role="dialog"]').locator('[contenteditable], textarea').first();
    await editor.pressSequentially(' test reply');

    // Submit
    await page.getByRole('button', { name: /^post$/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify the POST included inReplyToId
    expect(capturedPostBody).toBeTruthy();
    expect(capturedPostBody.in_reply_to_id || capturedPostBody.inReplyToId).toBeTruthy();
  });
});
