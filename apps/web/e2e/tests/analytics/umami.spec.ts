import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';
import { getUmamiCalls, installRecordingUmamiScript } from '../../helpers/umami';

const WEBSITE_ID = 'e2e-website-id';

test.describe('Umami analytics', () => {
  test.beforeEach(async ({ page }) => {
    await installRecordingUmamiScript(page);
  });

  test('injects the umami script with data-website-id', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    const attrs = await page.evaluate(() => {
      const el = document.querySelector('script[src*="analytics.fediway.com"]');
      return el
        ? {
            src: el.getAttribute('src'),
            websiteId: el.getAttribute('data-website-id'),
            autoTrack: el.getAttribute('data-auto-track'),
          }
        : null;
    });

    expect(attrs).not.toBeNull();
    expect(attrs?.src).toContain('analytics.fediway.com/script.js');
    expect(attrs?.websiteId).toBe(WEBSITE_ID);
    expect(attrs?.autoTrack).toBe('false');
  });

  test('window.umami is available after the script loads', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    await page.waitForFunction(() => typeof window.umami?.track === 'function', undefined, {
      timeout: 5_000,
    });
  });

  test('home page visit fires a track call with { url: "/", title: "Home" }', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    await expect.poll(async () => {
      const calls = await getUmamiCalls(page);
      return calls.find(c =>
        c.method === 'track'
        && typeof c.args[0] === 'object'
        && c.args[0] !== null
        && (c.args[0] as { url?: string }).url === '/',
      );
    }, { timeout: 5_000 }).toBeDefined();

    const calls = await getUmamiCalls(page);
    const pageView = calls.find(c =>
      c.method === 'track'
      && typeof c.args[0] === 'object'
      && c.args[0] !== null
      && (c.args[0] as { url?: string }).url === '/',
    );
    expect(pageView?.args[0]).toMatchObject({ url: '/', title: 'Home' });
  });

  test('SPA navigation fires additional track calls', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    await expect.poll(async () => {
      const calls = await getUmamiCalls(page);
      return calls.some(c =>
        c.method === 'track'
        && typeof c.args[0] === 'object'
        && (c.args[0] as { url?: string }).url === '/',
      );
    }, { timeout: 5_000 }).toBe(true);

    await page.goto('/explore');

    await expect.poll(async () => {
      const calls = await getUmamiCalls(page);
      return calls.some(c =>
        c.method === 'track'
        && typeof c.args[0] === 'object'
        && (c.args[0] as { url?: string }).url === '/explore',
      );
    }, { timeout: 5_000 }).toBe(true);

    const calls = await getUmamiCalls(page);
    const explorePageView = calls.find(c =>
      c.method === 'track'
      && typeof c.args[0] === 'object'
      && (c.args[0] as { url?: string }).url === '/explore',
    );
    expect(explorePageView?.args[0]).toMatchObject({ url: '/explore', title: 'Explore' });
  });

  test('identify is called with current user after mock login', async ({ page }) => {
    await loginWithMock(page);
    await page.goto('/');

    await expect.poll(async () => {
      const calls = await getUmamiCalls(page);
      return calls.find(c => c.method === 'identify');
    }, { timeout: 5_000 }).toBeDefined();

    const calls = await getUmamiCalls(page);
    const identifyCall = calls.find(c => c.method === 'identify');
    expect(identifyCall?.args[0]).toHaveProperty('acct');
  });
});
