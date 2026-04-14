/**
 * Umami analytics plugin.
 *
 * Loads Umami with auto-tracking disabled — every page view and event fires
 * manually from `useAnalytics()`. Because Umami won't overwrite a
 * pre-existing `window.umami`, we deliberately do NOT stub it here. Instead,
 * `useAnalytics()` queues calls made before the script is loaded and flushes
 * them when the `umami:ready` event fires below.
 *
 * This plugin is prefixed `00.` so it runs before `api-client.client.ts`,
 * which triggers the very first `trackPageView()` call on initial load.
 */

interface UmamiLike {
  track: (...args: unknown[]) => void;
  identify: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    umami?: UmamiLike;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public as Record<string, string>;
  const url = config.umamiUrl;
  const websiteId = config.umamiWebsiteId;

  if (!url || !websiteId)
    return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = url;
  // Umami reads its website id from the script tag via
  // `document.currentScript.getAttribute('data-website-id')`. Using
  // setAttribute rather than the dataset API avoids any timing edge case
  // between property propagation and script execution.
  script.setAttribute('data-website-id', websiteId);
  script.setAttribute('data-auto-track', 'false');

  script.addEventListener('load', () => {
    // Signal to `useAnalytics()` that `window.umami` is now the real client.
    window.dispatchEvent(new Event('umami:ready'));
  }, { once: true });

  document.head.appendChild(script);
});
