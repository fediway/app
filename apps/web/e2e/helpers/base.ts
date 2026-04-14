import { test as base, expect } from '@playwright/test';
import { setupMockApi } from './mock-api';
import { installNoOpUmamiScript } from './umami';

export { expect };

/**
 * Extended test fixture for Fediway E2E tests.
 *
 * 1. Intercepts all API calls with mock data (network-level mocking).
 *    The production build has zero mock code — mocking happens in Playwright.
 *
 * 2. Intercepts the Umami analytics script so no test touches a real
 *    analytics endpoint. Tests that want to assert tracking behavior can
 *    override the route with `installRecordingUmamiScript` from `helpers/umami.ts`.
 *
 * 3. Waits for Nuxt SPA hydration after page.goto().
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockApi(page);
    await installNoOpUmamiScript(page);

    // Wrap goto to wait for SPA hydration
    const originalGoto = page.goto.bind(page);
    page.goto = async (url: string, options?: Parameters<typeof originalGoto>[1]) => {
      const response = await originalGoto(url, options);
      // Wait for Nuxt app to mount (loading template replaced with real content)
      await page.waitForFunction(
        () => {
          const root = document.querySelector('#__nuxt');
          if (!root)
            return false;
          return root.children.length > 0 && root.innerHTML.length > 200;
        },
        { timeout: 15_000 },
      ).catch(() => {
        // Fallback — page may have already hydrated
      });
      return response;
    };

    await use(page);
  },
});
