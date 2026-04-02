import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Infinite Scroll', () => {
  test('loads more posts when scrolling to bottom', async ({ page }) => {
    await loginWithMock(page);

    const feed = page.locator('[role="feed"]');
    const initialCount = await feed.locator('article').count();
    expect(initialCount).toBeGreaterThan(0);

    // Scroll to bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for new posts to appear (page 2 has different IDs)
    await expect(feed.locator('article')).toHaveCount(initialCount + 3, { timeout: 10_000 });
  });

  test('page 2 posts have unique content', async ({ page }) => {
    await loginWithMock(page);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Page 2 content should appear
    await expect(page.getByText('Page two starts here')).toBeAttached({ timeout: 10_000 });
  });
});
