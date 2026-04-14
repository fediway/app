import { flushPendingAnalytics, normalizeUmamiPayload } from '~/composables/useAnalytics';

interface UmamiLike {
  track: (...args: unknown[]) => void;
  identify: (...args: unknown[]) => void;
}

interface UmamiPayload {
  url?: string;
  title?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    umami?: UmamiLike;
    fediwayUmamiBeforeSend?: (type: string, payload: UmamiPayload) => UmamiPayload;
  }
}

/**
 * Loads Umami with auto-tracking enabled. Umami hooks `pushState` /
 * `replaceState` itself, builds full event payloads (website id + hostname
 * + screen + ...), and handles server-side format — we don't try to
 * reimplement that. For URL normalization we use Umami's `data-before-send`
 * hook, which is invoked on every outgoing event and lets us collapse
 * high-cardinality dynamic routes (status ids, tag slugs, etc.) through
 * `normalizeRoute()` before the event leaves the client.
 *
 * Prefixed `00.` so it runs before any other plugin that might trigger an
 * analytics call on startup.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public as Record<string, string>;
  const url = config.umamiUrl;
  const websiteId = config.umamiWebsiteId;

  if (!url || !websiteId)
    return;

  window.fediwayUmamiBeforeSend = (_type, payload) => normalizeUmamiPayload(payload);

  const script = document.createElement('script');
  script.async = true;
  script.src = url;
  script.setAttribute('data-website-id', websiteId);
  script.setAttribute('data-before-send', 'fediwayUmamiBeforeSend');

  script.addEventListener('load', () => {
    flushPendingAnalytics();
  }, { once: true });

  document.head.appendChild(script);
});
