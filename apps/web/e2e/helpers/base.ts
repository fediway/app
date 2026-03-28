import { test as base } from '@playwright/test';

/**
 * Extended test fixture for Fediway SPA.
 *
 * Overrides page.goto to use waitUntil: 'commit' by default,
 * preventing ERR_ABORTED on client-side redirects during hydration.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);
    page.goto = (url: string, options?: any) => {
      return originalGoto(url, { waitUntil: 'commit', ...options });
    };
    await use(page);
  },
});

export { expect } from '@playwright/test';
