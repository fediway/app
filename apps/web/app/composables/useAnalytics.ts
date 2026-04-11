declare global {
  interface Window {
    umami?: {
      track: ((event: string, data?: Record<string, string | number>) => void)
        & ((payload: { url: string; title: string }) => void);
      identify: (data: Record<string, string | number>) => void;
    };
  }
}

export type AnalyticsSource = 'feed' | 'status_detail' | 'profile' | 'notification' | 'message' | 'search' | 'explore' | 'composer' | 'sidebar';

function track(event: string, data?: Record<string, string | number>) {
  window.umami?.track(event, data);
}

function normalizeRoute(path: string): { url: string; title: string } {
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
  if (path.startsWith('/messages/new'))
    return { url: '/messages/new', title: 'New Message' };
  if (path.match(/^\/messages\/.+/))
    return { url: '/messages/thread', title: 'Message Thread' };
  if (path.match(/^\/notifications\/.+/))
    return { url: '/notifications/filtered', title: 'Notifications Filtered' };
  if (path.startsWith('/settings/'))
    return { url: '/settings/sub', title: 'Settings' };
  if (path === '/oauth/callback')
    return { url: '/oauth/callback', title: 'OAuth Callback' };
  return { url: path, title: '' };
}

export function useAnalytics() {
  return {
    identify: (acct: string) => {
      window.umami?.identify({ acct });
    },

    trackPageView: (path: string) => {
      const normalized = normalizeRoute(path);
      if (normalized.title) {
        window.umami?.track(normalized);
      }
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
