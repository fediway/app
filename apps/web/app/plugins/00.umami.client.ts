/**
 * Umami analytics plugin.
 *
 * Loads Umami with auto-tracking disabled — every page view and event fires
 * manually from `useAnalytics()`. Because the script loads asynchronously,
 * calls made *before* the script is ready would otherwise be silently dropped
 * (optional chaining on `window.umami?.track`). To prevent that, this plugin:
 *
 * 1. Installs a synchronous stub on `window.umami` that queues calls into an
 *    array instead of tracking them.
 * 2. Injects the real Umami script.
 * 3. On script load, the real Umami assigns itself to `window.umami`, replacing
 *    the stub. This plugin's `onload` handler then flushes the queue to the
 *    real Umami so early calls are not lost.
 *
 * This plugin is prefixed `00.` so it runs before `api-client.client.ts`,
 * which triggers the very first `trackPageView()` call on initial load.
 */

interface QueueEntry {
  method: 'track' | 'identify';
  args: unknown[];
}

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

  const queue: QueueEntry[] = [];

  const stub: UmamiLike = {
    track: (...args: unknown[]) => {
      queue.push({ method: 'track', args });
    },
    identify: (...args: unknown[]) => {
      queue.push({ method: 'identify', args });
    },
  };

  window.umami = stub;

  const script = document.createElement('script');
  script.defer = true;
  script.src = url;
  script.dataset.websiteId = websiteId;
  script.dataset.autoTrack = 'false';

  script.addEventListener('load', () => {
    // Umami has now assigned itself to window.umami, replacing our stub.
    // Flush anything queued to the stub into the real client.
    const real = window.umami;
    if (!real || real === stub)
      return;

    for (const { method, args } of queue) {
      try {
        (real[method] as (...a: unknown[]) => void)(...args);
      }
      catch {
        // ignore — one bad call shouldn't block others
      }
    }
    queue.length = 0;
  }, { once: true });

  document.head.appendChild(script);
});
