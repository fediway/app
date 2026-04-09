import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

// Mock API returns fewer statuses than DEFAULT_LIMIT (20), so hasMore is false
// and infinite scroll never triggers. These tests need 20+ mock statuses to work.
// TODO(#mock-data): expand mock fixtures to support pagination testing.
test.describe('Infinite Scroll', () => {
  test.skip('loads more posts when scrolling to bottom', async ({ page }) => {
    await loginWithMock(page);

    const articles = page.locator('article');
    const initialCount = await articles.count();
    expect(initialCount).toBeGreaterThan(0);

    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 300));
      }
    });

    await expect(articles).toHaveCount(initialCount + 3, { timeout: 15_000 });
  });

  test.skip('page 2 posts have unique content', async ({ page }) => {
    await loginWithMock(page);

    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 300));
      }
    });

    await expect(page.getByText('Page two starts here')).toBeAttached({ timeout: 15_000 });
  });
});
