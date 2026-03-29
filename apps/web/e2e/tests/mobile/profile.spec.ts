import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('own profile shows Edit Profile button', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Edit Profile' }).first()).toBeAttached({ timeout: 5000 });
  });

  test('other profile shows Follow and Message', async ({ page }) => {
    await page.goto('/@alex@mock.social');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Follow' }).first()).toBeAttached({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Message' }).first()).toBeAttached({ timeout: 5000 });
  });

  test('profile header and stats are visible', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });
    await expect(page.getByText(/followers/i).first()).toBeAttached({ timeout: 5000 });
    await expect(page.getByText(/following/i).first()).toBeAttached({ timeout: 5000 });
  });
});
