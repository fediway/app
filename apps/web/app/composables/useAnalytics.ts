// The window.umami typing is declared in `plugins/00.umami.client.ts` so
// the stub + real client share one shape across the app.

export type AnalyticsSource = 'feed' | 'status_detail' | 'profile' | 'notification' | 'message' | 'search' | 'explore' | 'composer' | 'sidebar';

interface UmamiTrackPayload {
  url: string;
  title: string;
}

/**
 * Normalizes an SPA path into a stable `{ url, title }` payload for Umami.
 *
 * Two goals:
 * 1. **Track every route.** A route with no explicit mapping falls through
 *    to `{ url: path, title: 'Other' }` so it still reaches Umami. The old
 *    behavior (empty `title` silently dropping the call) meant the home feed,
 *    explore, notifications, and every top-level nav target never tracked.
 * 2. **Collapse high-cardinality dynamic routes** (user profiles, status
 *    detail, tags, etc.) to a shared canonical URL so Umami doesn't explode
 *    into one row per status id.
 */
function normalizeRoute(path: string): UmamiTrackPayload {
  // Static top-level routes — tracked verbatim.
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

  // Explore hub and its tabs.
  if (path === '/explore')
    return { url: '/explore', title: 'Explore' };
  if (path === '/explore/news')
    return { url: '/explore/news', title: 'Explore — News' };
  if (path === '/explore/people')
    return { url: '/explore/people', title: 'Explore — People' };
  if (path === '/explore/tags')
    return { url: '/explore/tags', title: 'Explore — Tags' };

  // Dynamic routes — collapsed to canonical URLs to keep Umami cardinality low.
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

  // Unknown — track the raw path so we catch anything missed, with a neutral title.
  return { url: path, title: 'Other' };
}

function track(event: string, data?: Record<string, string | number>) {
  window.umami?.track(event, data);
}

export function useAnalytics() {
  return {
    identify: (acct: string) => {
      window.umami?.identify({ acct });
    },

    trackPageView: (path: string) => {
      const normalized = normalizeRoute(path);
      window.umami?.track(normalized);
    },

    trackPostCreated: (opts?: { hasMedia?: boolean; isReply?: boolean }) =>
      track('post_created', {
        ...(opts?.hasMedia && { has_media: 1 }),
        ...(opts?.isReply && { is_reply: 1 }),
      }),
    trackFavourite: (source: AnalyticsSource) => track('favourite', { source }),
    trackReblog: (source: AnalyticsSource) => track('reblog', { source }),
    trackBookmark: (source: AnalyticsSource) => track('bookmark', { source }),
    trackFollow: (source: AnalyticsSource) => track('follow', { source }),
    trackMessageSent: () => track('message_sent'),
    trackShare: (source: AnalyticsSource) => track('share', { source }),
    trackLogin: (method: 'oauth' | 'mock') => track('login', { method }),
    trackLogout: () => track('logout'),
    trackSignupStarted: () => track('signup_started'),
  };
}
