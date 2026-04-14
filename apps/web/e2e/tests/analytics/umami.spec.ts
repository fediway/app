import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';
import { installRecordingUmamiScript } from '../../helpers/umami';

const WEBSITE_ID = 'e2e-website-id';

test.describe('Umami analytics', () => {
  test.beforeEach(async ({ page }) => {
    await installRecordingUmamiScript(page);
  });

  test('injects the umami script with data-website-id and data-before-send', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    const attrs = await page.evaluate(() => {
      const el = document.querySelector('script[src*="analytics.fediway.com"]');
      return el
        ? {
            src: el.getAttribute('src'),
            websiteId: el.getAttribute('data-website-id'),
            beforeSend: el.getAttribute('data-before-send'),
            autoTrack: el.getAttribute('data-auto-track'),
          }
        : null;
    });

    expect(attrs).not.toBeNull();
    expect(attrs?.src).toContain('analytics.fediway.com/script.js');
    expect(attrs?.websiteId).toBe(WEBSITE_ID);
    expect(attrs?.beforeSend).toBe('fediwayUmamiBeforeSend');
    expect(attrs?.autoTrack).toBeNull();
  });

  test('window.fediwayUmamiBeforeSend normalizes dynamic routes', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    const result = await page.evaluate(() => {
      const hook = (window as unknown as {
        fediwayUmamiBeforeSend?: (
          type: string,
          payload: Record<string, unknown>,
        ) => Record<string, unknown>;
      }).fediwayUmamiBeforeSend;
      if (!hook)
        return null;
      return hook('event', {
        website: 'aa13804e-2def-4135-8778-fa0c1bf64f9d',
        hostname: 'fediway.com',
        url: '/@alice/12345',
        title: 'Raw Title',
        screen: '1920x1080',
      });
    });

    expect(result).toMatchObject({
      website: 'aa13804e-2def-4135-8778-fa0c1bf64f9d',
      hostname: 'fediway.com',
      url: '/status',
      title: 'Status Detail',
      screen: '1920x1080',
    });
  });

  test('before-send hook collapses a tag route to /tags', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    const result = await page.evaluate(() => {
      const hook = (window as unknown as {
        fediwayUmamiBeforeSend?: (
          type: string,
          payload: Record<string, unknown>,
        ) => Record<string, unknown>;
      }).fediwayUmamiBeforeSend;
      return hook?.('event', { url: '/tags/webdev', title: 'original' });
    });

    expect(result).toMatchObject({ url: '/tags', title: 'Tag' });
  });

  test('before-send hook preserves payload when url is missing', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    const result = await page.evaluate(() => {
      const hook = (window as unknown as {
        fediwayUmamiBeforeSend?: (
          type: string,
          payload: Record<string, unknown>,
        ) => Record<string, unknown>;
      }).fediwayUmamiBeforeSend;
      return hook?.('event', { website: 'wid', title: 'no url' });
    });

    expect(result).toMatchObject({ website: 'wid', title: 'no url' });
    expect(result).not.toHaveProperty('url');
  });

  test('window.umami is available after the script loads', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    await page.waitForFunction(() => typeof window.umami?.track === 'function', undefined, {
      timeout: 5_000,
    });
  });
});
