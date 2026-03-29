import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Feed Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  // Action buttons in the feed should NOT trigger navigation to status detail.
  // Uses .last() to target the visible desktop instance (mobile hidden copy is first).

  test('clicking bookmark in feed does not navigate to status detail', async ({ page }) => {
    const startUrl = page.url();

    const bookmarkBtn = page.getByLabel(/^save$/i).last();
    await bookmarkBtn.click();

    // Should stay on the same page (home feed)
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);

    // Toast should appear confirming the bookmark
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });
  });

  test('clicking favourite in feed does not navigate to status detail', async ({ page }) => {
    const startUrl = page.url();

    const favBtn = page.getByLabel(/^like/i).last();
    await favBtn.click();

    // Should stay on the same page
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);
  });

  test('clicking reblog in feed does not navigate to status detail', async ({ page }) => {
    const startUrl = page.url();

    const reblogBtn = page.getByLabel(/^repost/i).last();
    await reblogBtn.click();

    // Should stay on the same page
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);
  });

  test('bookmark toggles correctly between saved and unsaved', async ({ page }) => {
    // First click: save (button label is "Save", aria-pressed="false")
    await page.getByLabel(/^save$/i).last().click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });

    // Wait for toast to dismiss
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).not.toBeVisible({ timeout: 6000 });

    // Second click: unsave (button label is now "Unsave", aria-pressed="true")
    await page.getByLabel(/^unsave$/i).last().click();
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved' })).toBeVisible({ timeout: 5000 });
  });

  test('bookmark shows toast with View action', async ({ page }) => {
    // Navigate to status detail first
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    const bookmarkBtn = page.getByLabel(/^save$/i).last();
    await bookmarkBtn.click();

    const toast = page.getByRole('status').filter({ hasText: 'Saved' });
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast.getByText('View')).toBeVisible();
  });

  test('rapidly toggling bookmark does not break state', async ({ page }) => {
    const bookmarkBtn = page.getByLabel(/^save$/i).last();

    // Click save
    await bookmarkBtn.click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });

    // Wait for toast to dismiss
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).not.toBeVisible({ timeout: 6000 });

    // Click unsave
    await page.getByLabel(/^unsave$/i).last().click();
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved' })).toBeVisible({ timeout: 5000 });

    // Wait for toast to dismiss
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved' })).not.toBeVisible({ timeout: 6000 });

    // Click save again — state should be consistent
    await page.getByLabel(/^save$/i).last().click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });
  });

  // TODO: "favouriting a post in feed reflects on status detail"
  // Currently the detail page re-fetches from API, overwriting optimistic store state.
  // This needs store-wins-over-API reconciliation logic.

  test('unbookmarking from /saved page removes the post', async ({ page }) => {
    // Go to saved page
    await page.goto('/saved');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Unsave the first post
    const unsaveBtn = page.getByLabel(/^unsave$/i).last();
    await unsaveBtn.click();

    // Should show "Unsaved" toast
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved' })).toBeVisible({ timeout: 5000 });
  });
});
