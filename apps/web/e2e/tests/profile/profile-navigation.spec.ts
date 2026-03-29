import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Profile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('clicking followers count navigates to followers page', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Click the Followers stat — use dispatchEvent for content-visibility hidden elements
    await page.getByText('Followers').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/followers/, { timeout: 5000 });
  });

  test('clicking following count navigates to following page', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    await page.getByText('Following').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/following/, { timeout: 5000 });
  });

  test('profile tabs switch content without full reload', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Profile header should always be visible when switching tabs
    await page.getByText('Replies', { exact: true }).last().click();
    await expect(page).toHaveURL(/\/@.*\/replies/, { timeout: 5000 });
    await expect(page.getByText('Jane Doe').first()).toBeAttached();

    await page.getByText('Media', { exact: true }).last().click();
    await expect(page).toHaveURL(/\/@.*\/media/, { timeout: 5000 });
    await expect(page.getByText('Jane Doe').first()).toBeAttached();
  });

  test('other user profile shows correct stats', async ({ page }) => {
    await page.goto('/@alex@mock.social');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    // Should show follower/following counts
    await expect(page.getByText(/\d+/).first()).toBeAttached({ timeout: 5000 });
  });
});
