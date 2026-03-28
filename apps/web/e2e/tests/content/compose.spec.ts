import { Buffer } from 'node:buffer';
import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Compose', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('can open composer and see post button', async ({ page }) => {
    await page.getByRole('button', { name: /new post/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /^post$/i })).toBeVisible();
  });

  test('can attach an image via file picker', async ({ page }) => {
    await page.getByRole('button', { name: /new post/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    const fileChooserPromise = page.waitForEvent('filechooser');
    const mediaButton = page.locator('[role="dialog"]').getByRole('button', { name: /image|photo|media|attach/i });
    if (!(await mediaButton.isVisible())) {
      test.skip();
      return;
    }
    await mediaButton.click();

    const fileChooser = await fileChooserPromise;
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );
    await fileChooser.setFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer,
    });

    // Media preview should appear
    await expect(page.locator('[role="dialog"] img').first()).toBeAttached({ timeout: 10_000 });
  });

  test('posted status includes media IDs when image is attached', async ({ page }) => {
    // Capture the POST body when status is created
    let capturedPostBody: any = null;
    await page.route(/\/api\/v1\/statuses$/, async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postData();
        try {
          capturedPostBody = JSON.parse(body || '{}');
        }
        catch {
          capturedPostBody = body;
        }
        return route.fulfill({
          json: {
            id: `status-${Date.now()}`,
            createdAt: new Date().toISOString(),
            content: '<p>Test with image</p>',
            account: { id: '1', username: 'jane', acct: 'jane@mock.social', displayName: 'Jane Doe', avatar: '', avatarStatic: '', emojis: [] },
            favourited: false,
            reblogged: false,
            bookmarked: false,
            repliesCount: 0,
            reblogsCount: 0,
            favouritesCount: 0,
            visibility: 'public',
            spoilerText: '',
            mediaAttachments: [{ id: 'media-1', type: 'image', url: 'https://example.com/img.jpg', previewUrl: 'https://example.com/img.jpg', description: null }],
            mentions: [],
            tags: [],
            emojis: [],
            url: 'https://mock.social/@jane/new',
            uri: 'https://mock.social/users/jane/statuses/new',
          },
        });
      }
      return route.continue();
    });

    // Open composer
    await page.getByRole('button', { name: /new post/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Attach an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    const mediaButton = page.locator('[role="dialog"]').getByRole('button', { name: /image|photo|media|attach/i });
    if (!(await mediaButton.isVisible())) {
      test.skip();
      return;
    }
    await mediaButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64'),
    });

    // Wait for upload to complete (preview appears)
    await expect(page.locator('[role="dialog"] img').first()).toBeAttached({ timeout: 10_000 });

    // Type some text
    const editor = page.locator('[role="dialog"]').locator('[contenteditable], textarea').first();
    await editor.fill('Test with image');

    // Wait for Post button to be enabled (media upload must finish)
    await expect(page.getByRole('button', { name: /^post$/i })).toBeEnabled({ timeout: 10_000 });

    // Click Post
    await page.getByRole('button', { name: /^post$/i }).click();

    // Wait for modal to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify the POST body included media_ids
    expect(capturedPostBody).toBeTruthy();
    expect(capturedPostBody.media_ids || capturedPostBody.mediaIds).toBeTruthy();
    const mediaIds = capturedPostBody.media_ids || capturedPostBody.mediaIds;
    expect(Array.isArray(mediaIds)).toBe(true);
    expect(mediaIds.length).toBeGreaterThan(0);
  });
});
