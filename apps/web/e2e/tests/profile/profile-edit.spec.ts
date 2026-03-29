import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Profile Editing', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('settings page shows Edit button on profile card', async ({ page }) => {
    await page.goto('/settings');

    // Profile card should show user info and Edit button
    await expect(page.getByText('Jane Doe').last()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('Edit button opens profile edit modal', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });

    // Click Edit
    await page.getByRole('button', { name: 'Edit' }).click();

    // Modal should open with form fields
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Display name')).toBeVisible();
    await expect(page.getByLabel('Bio')).toBeVisible();
    await expect(page.getByLabel('Change avatar')).toBeVisible();
  });

  test('Cancel closes modal without saving', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });

    // Open modal
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('can edit display name and save', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });

    // Open modal
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Clear and type new name
    const nameInput = page.getByLabel('Display name');
    await nameInput.clear();
    await nameInput.fill('Jane Updated');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Modal should close after save
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('can edit bio and save', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });

    // Open modal
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Type bio
    const bioInput = page.getByLabel('Bio');
    await bioInput.clear();
    await bioInput.fill('Updated bio text');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Modal should close (success)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('shows character count for bio', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });

    // Open modal
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Type some bio text
    const bioInput = page.getByLabel('Bio');
    await bioInput.clear();
    await bioInput.fill('Hello world');

    // Character count should update
    await expect(page.getByText('11 / 500')).toBeVisible();
  });
});
