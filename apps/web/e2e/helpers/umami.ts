import type { Page } from '@playwright/test';

const UMAMI_SCRIPT_PATTERN = /analytics\.fediway\.com\/script\.js/;
const UMAMI_COLLECT_PATTERN = /analytics\.fediway\.com\/api\//;

/**
 * Default interception — installs a no-op `window.umami` shim so tests that
 * don't care about analytics aren't affected by real network calls. Any
 * subsequent route registration with the same pattern will override this.
 */
export async function installNoOpUmamiScript(page: Page): Promise<void> {
  await page.route(UMAMI_SCRIPT_PATTERN, route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `
      (function(){
        if (window.umami) return;
        window.umami = { track: function(){}, identify: function(){} };
      })();
    `,
  }));

  // Swallow any collect requests too, in case the real Umami script slips
  // through (e.g. in a test that disables interception by accident).
  await page.route(UMAMI_COLLECT_PATTERN, route => route.fulfill({ status: 200, body: '{}' }));
}

/**
 * Recording interception — replaces the default no-op with a shim that
 * captures every track/identify call into `window.__umamiCalls` for assertions.
 *
 * Call this in a test's `beforeEach` *before* `page.goto`, so the interception
 * is in place when the umami script is first loaded during page load.
 */
export async function installRecordingUmamiScript(page: Page): Promise<void> {
  await page.unroute(UMAMI_SCRIPT_PATTERN);
  await page.route(UMAMI_SCRIPT_PATTERN, route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `
      (function(){
        if (window.umami) return;
        window.__umamiCalls = [];
        window.umami = {
          track: function() {
            window.__umamiCalls.push({ method: 'track', args: Array.from(arguments) });
          },
          identify: function() {
            window.__umamiCalls.push({ method: 'identify', args: Array.from(arguments) });
          }
        };
      })();
    `,
  }));
}

export interface UmamiCall {
  method: 'track' | 'identify';
  args: unknown[];
}

/**
 * Reads the captured call log installed by `installRecordingUmamiScript`.
 */
export async function getUmamiCalls(page: Page): Promise<UmamiCall[]> {
  return await page.evaluate(() =>
    (window as unknown as { __umamiCalls?: UmamiCall[] }).__umamiCalls ?? [],
  );
}
