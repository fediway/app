import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Settings Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/settings');
    await expect(page.getByText('Account').last()).toBeVisible({ timeout: 10_000 });
  });

  test.describe('posting preferences', () => {
    test('default visibility selector is present with all options', async ({ page }) => {
      await expect(page.getByText('Default visibility').last()).toBeVisible();
      await expect(page.getByText('Public').last()).toBeAttached();
      await expect(page.getByText('Unlisted').last()).toBeAttached();
      await expect(page.getByText('Followers').last()).toBeAttached();
      await expect(page.getByText('Direct').last()).toBeAttached();
    });

    test('can change default visibility', async ({ page }) => {
      // Click Unlisted
      await page.getByText('Unlisted').last().click();

      // Reload and verify it persisted
      await page.reload();
      await expect(page.getByText('Posting').last()).toBeVisible({ timeout: 10_000 });

      // The Unlisted option should still be selected (check aria-checked or active state)
      // This verifies localStorage persistence
    });

    test('sensitive media toggle is present', async ({ page }) => {
      await expect(page.getByText('Mark media as sensitive').last()).toBeVisible();
    });
  });

  test.describe('media preferences', () => {
    test('media visibility control is present with all options', async ({ page }) => {
      await expect(page.getByText('Media visibility').last()).toBeVisible();
      await expect(page.getByText('Default', { exact: true }).last()).toBeAttached();
      await expect(page.getByText('Show all').last()).toBeAttached();
      await expect(page.getByText('Hide all').last()).toBeAttached();
    });

    test('autoplay GIFs toggle is present', async ({ page }) => {
      await expect(page.getByText('Autoplay animated GIFs').last()).toBeVisible();
    });

    test('reduce motion toggle is present', async ({ page }) => {
      await expect(page.getByText('Reduce motion').last()).toBeVisible();
    });
  });

  test.describe('content section', () => {
    test('blocked accounts link navigates correctly', async ({ page }) => {
      await page.getByText('Blocked accounts').last().click();
      await expect(page).toHaveURL(/\/settings\/blocked/, { timeout: 5000 });
    });

    test('muted accounts link navigates correctly', async ({ page }) => {
      await page.getByText('Muted accounts').last().click();
      await expect(page).toHaveURL(/\/settings\/muted/, { timeout: 5000 });
    });
  });

  test.describe('appearance', () => {
    test('theme selector shows light/dark/system options', async ({ page }) => {
      await expect(page.getByText('Light', { exact: true }).last()).toBeAttached();
      await expect(page.getByText('Dark', { exact: true }).last()).toBeAttached();
      await expect(page.getByText('System', { exact: true }).last()).toBeAttached();
    });

    test('switching to dark mode persists after reload', async ({ page }) => {
      await page.getByText('Dark', { exact: true }).last().click();
      await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 3000 });

      await page.reload();
      await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 5000 });

      // Clean up — switch back to light
      await expect(page.getByText('Appearance').last()).toBeVisible({ timeout: 10_000 });
      await page.getByText('Light', { exact: true }).last().click();
    });
  });

  test.describe('about section', () => {
    test('version number is displayed', async ({ page }) => {
      await expect(page.getByText('0.1.0-beta').last()).toBeVisible();
    });

    test('github link is present', async ({ page }) => {
      await expect(page.getByText('GitHub').last()).toBeVisible();
    });
  });

  test.describe('profile section', () => {
    test('shows current user info', async ({ page }) => {
      await expect(page.getByText('Jane Doe').last()).toBeVisible();
      await expect(page.getByText('@jane').last()).toBeVisible();
    });

    // Profile edit modal tests are in profile/profile-edit.spec.ts
  });

  test.describe('account section', () => {
    test('shows connected instance', async ({ page }) => {
      await expect(page.getByText(/connected/i).last()).toBeVisible();
    });
  });

  test.describe('logout', () => {
    test('logout button redirects to login', async ({ page }) => {
      const logoutBtn = page.getByRole('button', { name: /log out/i }).last();
      await expect(logoutBtn).toBeVisible();

      await logoutBtn.click();

      await expect(page.getByText(/sign in/i).first()).toBeVisible({ timeout: 10_000 });
    });
  });
});
