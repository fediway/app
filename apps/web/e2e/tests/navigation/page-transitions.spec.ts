import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Page Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('navigating to profile and back preserves feed', async ({ page }) => {
    const feed = page.locator('#main-content');
    const countBefore = await feed.locator('article').count();

    // Navigate to profile
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Go back
    await page.goBack();

    // Feed should still have same articles
    await expect(feed.locator('article')).toHaveCount(countBefore, { timeout: 10_000 });
  });

  test('navigating to settings and back preserves feed', async ({ page }) => {
    const feed = page.locator('#main-content');
    const countBefore = await feed.locator('article').count();

    await page.goto('/settings');
    await expect(page.getByText('Settings').first()).toBeAttached({ timeout: 10_000 });

    await page.goBack();
    await expect(feed.locator('article')).toHaveCount(countBefore, { timeout: 10_000 });
  });

  test('explore tabs do not flash (header persists)', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByText('For you').first()).toBeAttached({ timeout: 5000 });

    // Click News tab — use dispatchEvent for content-visibility hidden elements
    await page.getByText('News').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/explore\/news/, { timeout: 5000 });

    // Search input should still be present (header persists, no flash)
    await expect(page.getByPlaceholder('Search...').first()).toBeAttached({ timeout: 2000 });

    // Click back to For You
    await page.getByText('For you').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/explore$/, { timeout: 5000 });
  });

  /**
   * Content leak detection: during page transitions, the leaving page must overlay
   * (position: absolute) not stack below the entering page. We detect stacking by
   * measuring #main-content.scrollHeight on every animation frame during a slowed-down
   * transition. If it spikes to the SUM of both pages, they're stacking (bug).
   * If it stays near the MAX of either page, they're overlaying (correct).
   */

  test('feed → settings: no content stacking during transition', async ({ page }) => {
    // Slow the transition to 2s to guarantee we catch any overlap frame
    await page.addStyleTag({
      content: `.page-leave-active, .page-enter-active { transition-duration: 2000ms !important; }`,
    });

    const feedHeight = await page.evaluate(() => {
      const main = document.querySelector('#main-content') || document.querySelector('main');
      return main ? main.scrollHeight : 0;
    });

    // Start RAF measurement loop BEFORE navigating
    await page.evaluate(() => {
      const w = window as any;
      w.__maxScrollHeight = 0;
      w.__rafRunning = true;
      (function measure() {
        if (!w.__rafRunning)
          return;
        const main = document.querySelector('#main-content') || document.querySelector('main');
        if (main && main.scrollHeight > w.__maxScrollHeight)
          w.__maxScrollHeight = main.scrollHeight;
        requestAnimationFrame(measure);
      })();
    });

    // Client-side navigate (page.goto reloads the SPA, losing injected CSS)
    await page.locator('nav').getByText('Settings').click();
    await expect(page.getByRole('heading', { name: 'Appearance' }).last()).toBeVisible({ timeout: 10_000 });

    // Wait for the slow transition to fully complete
    await page.waitForTimeout(2500);

    await page.evaluate(() => {
      (window as any).__rafRunning = false;
    });
    const maxHeight = await page.evaluate(() => (window as any).__maxScrollHeight);
    const settingsHeight = await page.evaluate(() => {
      const main = document.querySelector('#main-content') || document.querySelector('main');
      return main ? main.scrollHeight : 0;
    });

    // If pages stacked: maxHeight ≈ feedHeight + settingsHeight
    // If pages overlayed: maxHeight ≈ max(feedHeight, settingsHeight)
    const threshold = Math.max(feedHeight, settingsHeight) + 200;
    expect(maxHeight).toBeLessThan(threshold);
  });

  test('after navigation, no ghost content from previous page', async ({ page }) => {
    // Navigate to settings via sidebar
    await page.locator('nav').getByText('Settings').click();
    await expect(page.getByRole('heading', { name: 'Appearance' }).last()).toBeVisible({ timeout: 10_000 });

    // Wait for transition to fully complete
    await page.waitForTimeout(500);

    // No feed articles should exist in main after transition completes
    const articleCount = await page.locator('#main-content article, main article').count();
    expect(articleCount).toBe(0);
  });

  test('main container has overflow containment', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const main = document.querySelector('#main-content');
      return main ? getComputedStyle(main).overflow : 'not found';
    });
    expect(overflow).toBe('clip');
  });

  test('bottom nav shows no active tab on non-tab pages', async ({ page }) => {
    // Navigate to a non-tab page
    await page.goto('/settings');
    await expect(page.getByText('Settings').first()).toBeAttached({ timeout: 10_000 });

    // No bottom nav item should be active (aria-current)
    const activeNavItems = page.locator('nav[aria-label="Tab navigation"] [aria-current="page"]');
    await expect(activeNavItems).toHaveCount(0, { timeout: 3000 });
  });
});
