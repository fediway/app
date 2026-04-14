export type AnalyticsSource = 'feed' | 'status_detail' | 'profile' | 'notification' | 'message' | 'search' | 'explore' | 'composer' | 'sidebar';

interface UmamiTrackPayload {
  url: string;
  title: string;
}

/**
 * Resolves an SPA path to a `{ url, title }` payload for Umami. Dynamic
 * routes collapse to canonical URLs so Umami cardinality stays bounded;
 * unmapped routes fall through to `{ url: path, title: 'Other' }` so every
 * navigation is tracked.
 */
export function normalizeRoute(path: string): UmamiTrackPayload {
  if (path === '/')
    return { url: '/', title: 'Home' };
  if (path === '/login')
    return { url: '/login', title: 'Login' };
  if (path === '/search')
    return { url: '/search', title: 'Search' };
  if (path === '/saved')
    return { url: '/saved', title: 'Saved' };
  if (path === '/favourites')
    return { url: '/favourites', title: 'Favourites' };
  if (path === '/notifications')
    return { url: '/notifications', title: 'Notifications' };
  if (path === '/messages')
    return { url: '/messages', title: 'Messages' };
  if (path === '/settings')
    return { url: '/settings', title: 'Settings' };
  if (path === '/explore')
    return { url: '/explore', title: 'Explore' };
  if (path === '/explore/news')
    return { url: '/explore/news', title: 'Explore — News' };
  if (path === '/explore/people')
    return { url: '/explore/people', title: 'Explore — People' };
  if (path === '/explore/tags')
    return { url: '/explore/tags', title: 'Explore — Tags' };
  if (path.match(/^\/@[^/]+\/\d+\/(favourites|reblogs)/))
    return { url: '/status/engagement', title: 'Status Engagement' };
  if (path.match(/^\/@[^/]+\/\d+/))
    return { url: '/status', title: 'Status Detail' };
  if (path.match(/^\/@[^/]+\/(followers|following)/))
    return { url: '/profile/connections', title: 'Profile Connections' };
  if (path.match(/^\/@[^/]+\/(replies|media)/))
    return { url: '/profile/tab', title: 'Profile Tab' };
  if (path.match(/^\/@/))
    return { url: '/profile', title: 'Profile' };
  if (path.startsWith('/tags/'))
    return { url: '/tags', title: 'Tag' };
  if (path.startsWith('/links/'))
    return { url: '/links', title: 'Link Detail' };
  if (path === '/messages/new')
    return { url: '/messages/new', title: 'New Message' };
  if (path.match(/^\/messages\/.+/))
    return { url: '/messages/thread', title: 'Message Thread' };
  if (path.match(/^\/notifications\/.+/))
    return { url: '/notifications/filtered', title: 'Notifications Filtered' };
  if (path.startsWith('/settings/'))
    return { url: '/settings/sub', title: 'Settings' };
  if (path === '/oauth/callback')
    return { url: '/oauth/callback', title: 'OAuth Callback' };

  return { url: path, title: 'Other' };
}

/**
 * Normalizes a payload object (as received by Umami's `data-before-send` hook)
 * by collapsing dynamic route URLs to canonical ones. Returned payload is a
 * new object — never mutates the input.
 */
export function normalizeUmamiPayload<T extends Record<string, unknown>>(payload: T): T {
  if (typeof payload.url !== 'string')
    return payload;
  const normalized = normalizeRoute(payload.url);
  return { ...payload, url: normalized.url, title: normalized.title };
}

// Umami's tracker preserves a pre-existing `window.umami` and will not install
// the real client on top of a stub, so we queue calls here instead of stubbing.
const pending: Array<() => void> = [];

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function flushPendingAnalytics(): void {
  if (!hasWindow() || !window.umami)
    return;
  while (pending.length > 0) {
    const fn = pending.shift();
    try {
      fn?.();
    }
    catch {
      // Drop the failing call so one broken entry cannot block the rest.
    }
  }
}

export function _resetAnalyticsState(): void {
  pending.length = 0;
}

function callUmami(fn: (umami: NonNullable<typeof window.umami>) => void): void {
  if (!hasWindow())
    return;
  if (window.umami) {
    if (pending.length > 0)
      flushPendingAnalytics();
    fn(window.umami);
    return;
  }
  pending.push(() => {
    if (window.umami)
      fn(window.umami);
  });
}

export function useAnalytics() {
  return {
    identify: (acct: string) => {
      callUmami(u => u.identify({ acct }));
    },

    trackPostCreated: (opts?: { hasMedia?: boolean; isReply?: boolean }) => {
      const data = {
        ...(opts?.hasMedia && { has_media: 1 }),
        ...(opts?.isReply && { is_reply: 1 }),
      };
      callUmami(u => u.track('post_created', data));
    },
    trackFavourite: (source: AnalyticsSource) =>
      callUmami(u => u.track('favourite', { source })),
    trackReblog: (source: AnalyticsSource) =>
      callUmami(u => u.track('reblog', { source })),
    trackBookmark: (source: AnalyticsSource) =>
      callUmami(u => u.track('bookmark', { source })),
    trackFollow: (source: AnalyticsSource) =>
      callUmami(u => u.track('follow', { source })),
    trackMessageSent: () =>
      callUmami(u => u.track('message_sent')),
    trackShare: (source: AnalyticsSource) =>
      callUmami(u => u.track('share', { source })),
    trackLogin: (method: 'oauth' | 'mock') =>
      callUmami(u => u.track('login', { method })),
    trackLogout: () =>
      callUmami(u => u.track('logout')),
    trackSignupStarted: () =>
      callUmami(u => u.track('signup_started')),
  };
}
