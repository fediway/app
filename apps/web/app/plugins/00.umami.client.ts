import { flushPendingAnalytics } from '~/composables/useAnalytics';

interface UmamiLike {
  track: (...args: unknown[]) => void;
  identify: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    umami?: UmamiLike;
  }
}

/**
 * Loads Umami with auto-tracking disabled — every page view and event is
 * fired manually from `useAnalytics()`. Prefixed `00.` so it runs before
 * `api-client.client.ts`, which triggers the first `trackPageView()` call.
 *
 * Umami's tracker preserves a pre-existing `window.umami` and would never
 * install the real client on top of a stub, so queueing lives in the
 * composable rather than here.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public as Record<string, string>;
  const url = config.umamiUrl;
  const websiteId = config.umamiWebsiteId;

  if (!url || !websiteId)
    return;

  const script = document.createElement('script');
  script.async = true;
  script.src = url;
  script.setAttribute('data-website-id', websiteId);
  script.setAttribute('data-auto-track', 'false');

  script.addEventListener('load', () => {
    flushPendingAnalytics();
  }, { once: true });

  document.head.appendChild(script);
});
