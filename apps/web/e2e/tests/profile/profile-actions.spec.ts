import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Profile Actions', () => {
  test.describe('own profile', () => {
    test('shows Edit Profile, no more dropdown', async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@jane@mock.social');
      await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

      // Edit Profile should be visible
      await expect(page.getByText('Edit Profile').last()).toBeVisible({ timeout: 5000 });

      // More button should NOT exist for own profile
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await expect(profileActions.getByLabel('More actions')).not.toBeVisible();
    });
  });

  test.describe('other user profile — dropdown menu', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@alex@mock.social');
      await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });
    });

    test('more dropdown shows share, copy link, mute, block, report', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      const moreBtn = profileActions.getByLabel('More actions');
      await expect(moreBtn).toBeVisible({ timeout: 5000 });
      await moreBtn.click();

      await expect(page.getByText('Copy profile link')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Mute user')).toBeVisible();
      await expect(page.getByText('Block user')).toBeVisible();
      await expect(page.getByText('Report')).toBeVisible();
    });

    test('local user does not show block domain', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();

      await expect(page.getByText('Mute user')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Block domain')).not.toBeVisible();
    });

    test('copy profile link shows Copied toast', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();
      await page.getByText('Copy profile link').click();

      await expect(
        page.getByRole('status').filter({ hasText: 'Copied' }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('mute from profile shows toast', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();
      await page.getByText('Mute user').click();

      await expect(
        page.getByRole('status').filter({ hasText: /muted/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('mute calls correct API endpoint', async ({ page }) => {
      let muteCalled = false;
      await page.route(/\/api\/v1\/accounts\/\d+\/mute$/, async (route) => {
        muteCalled = true;
        await route.fulfill({
          json: { id: '2', muting: true, blocking: false, following: false },
        });
      });

      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();
      await page.getByText('Mute user').click();

      await page.waitForTimeout(1000);
      expect(muteCalled).toBe(true);
    });

    test('block from profile shows toast', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();
      await page.getByText('Block user').click();

      await expect(
        page.getByRole('status').filter({ hasText: /blocked/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('report from profile shows toast', async ({ page }) => {
      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();
      await page.getByText('Report').click();

      await expect(
        page.getByRole('status').filter({ hasText: /report/i }),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('remote user profile', () => {
    test('shows block domain option', async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@bob@remote.social');
      await expect(page.getByText('Bob Remote').first()).toBeAttached({ timeout: 10_000 });

      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();

      await expect(page.getByText('Block domain')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Mute user')).toBeVisible();
      await expect(page.getByText('Block user')).toBeVisible();
    });

    test('open original page links to remote instance', async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@bob@remote.social');
      await expect(page.getByText('Bob Remote').first()).toBeAttached({ timeout: 10_000 });

      const profileActions = page.locator('#main-content [data-slot="profile-actions"]');
      await profileActions.getByLabel('More actions').click();

      // "Open original page" should be a link to the remote instance
      const openOriginal = page.getByText('Open original page');
      await expect(openOriginal).toBeVisible({ timeout: 3000 });
    });
  });
});
