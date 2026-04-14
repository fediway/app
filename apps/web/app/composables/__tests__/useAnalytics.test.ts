import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetAnalyticsState, flushPendingAnalytics, normalizeRoute, normalizeUmamiPayload, useAnalytics } from '../useAnalytics';

interface MockUmami {
  track: ReturnType<typeof vi.fn>;
  identify: ReturnType<typeof vi.fn>;
}

function installMockUmami(): MockUmami {
  const mock: MockUmami = {
    track: vi.fn(),
    identify: vi.fn(),
  };
  (window as unknown as { umami?: MockUmami }).umami = mock;
  return mock;
}

function clearUmami(): void {
  delete (window as unknown as { umami?: MockUmami }).umami;
}

beforeEach(() => {
  _resetAnalyticsState();
  clearUmami();
});

afterEach(() => {
  _resetAnalyticsState();
  clearUmami();
});

describe('useAnalytics — normalizeRoute', () => {
  describe('static top-level routes', () => {
    const staticCases: Array<[string, string, string]> = [
      ['/', '/', 'Home'],
      ['/login', '/login', 'Login'],
      ['/search', '/search', 'Search'],
      ['/saved', '/saved', 'Saved'],
      ['/favourites', '/favourites', 'Favourites'],
      ['/notifications', '/notifications', 'Notifications'],
      ['/messages', '/messages', 'Messages'],
      ['/settings', '/settings', 'Settings'],
      ['/explore', '/explore', 'Explore'],
      ['/explore/news', '/explore/news', 'Explore — News'],
      ['/explore/people', '/explore/people', 'Explore — People'],
      ['/explore/tags', '/explore/tags', 'Explore — Tags'],
    ];

    it.each(staticCases)('%s → { url: "%s", title: "%s" }', (path, expectedUrl, expectedTitle) => {
      expect(normalizeRoute(path)).toEqual({ url: expectedUrl, title: expectedTitle });
    });
  });

  describe('dynamic routes collapse to canonical URLs', () => {
    it('status detail normalizes any status id', () => {
      expect(normalizeRoute('/@alice/12345')).toEqual({ url: '/status', title: 'Status Detail' });
      expect(normalizeRoute('/@bob/999')).toEqual({ url: '/status', title: 'Status Detail' });
    });

    it('status engagement (favourites/reblogs)', () => {
      expect(normalizeRoute('/@alice/12345/favourites')).toEqual({ url: '/status/engagement', title: 'Status Engagement' });
      expect(normalizeRoute('/@alice/12345/reblogs')).toEqual({ url: '/status/engagement', title: 'Status Engagement' });
    });

    it('profile with any acct', () => {
      expect(normalizeRoute('/@alice')).toEqual({ url: '/profile', title: 'Profile' });
      expect(normalizeRoute('/@bob@example.com')).toEqual({ url: '/profile', title: 'Profile' });
    });

    it('profile tabs', () => {
      expect(normalizeRoute('/@alice/replies')).toEqual({ url: '/profile/tab', title: 'Profile Tab' });
      expect(normalizeRoute('/@alice/media')).toEqual({ url: '/profile/tab', title: 'Profile Tab' });
    });

    it('profile connections', () => {
      expect(normalizeRoute('/@alice/followers')).toEqual({ url: '/profile/connections', title: 'Profile Connections' });
      expect(normalizeRoute('/@alice/following')).toEqual({ url: '/profile/connections', title: 'Profile Connections' });
    });

    it('tags', () => {
      expect(normalizeRoute('/tags/foo')).toEqual({ url: '/tags', title: 'Tag' });
      expect(normalizeRoute('/tags/bar')).toEqual({ url: '/tags', title: 'Tag' });
    });

    it('links', () => {
      expect(normalizeRoute('/links/https%3A%2F%2Fexample.com')).toEqual({ url: '/links', title: 'Link Detail' });
    });

    it('message thread', () => {
      expect(normalizeRoute('/messages/new')).toEqual({ url: '/messages/new', title: 'New Message' });
      expect(normalizeRoute('/messages/abc123')).toEqual({ url: '/messages/thread', title: 'Message Thread' });
    });

    it('notifications filtered', () => {
      expect(normalizeRoute('/notifications/mentions')).toEqual({ url: '/notifications/filtered', title: 'Notifications Filtered' });
    });

    it('settings subpages', () => {
      expect(normalizeRoute('/settings/about')).toEqual({ url: '/settings/sub', title: 'Settings' });
      expect(normalizeRoute('/settings/blocked')).toEqual({ url: '/settings/sub', title: 'Settings' });
    });

    it('oauth callback', () => {
      expect(normalizeRoute('/oauth/callback')).toEqual({ url: '/oauth/callback', title: 'OAuth Callback' });
    });
  });

  describe('unknown route fallback', () => {
    it('falls through to { url: path, title: "Other" }', () => {
      expect(normalizeRoute('/unknown-new-feature')).toEqual({ url: '/unknown-new-feature', title: 'Other' });
    });

    it('never returns empty title (this was the original bug)', () => {
      // Regression guard: the previous implementation returned { title: '' }
      // for unknown routes, which was then silently dropped by the `if (title)`
      // check in trackPageView. Every route must have a non-empty title.
      const paths = ['/', '/explore', '/notifications', '/messages', '/weird-new-path'];
      for (const path of paths) {
        const result = normalizeRoute(path);
        expect(result.title).not.toBe('');
      }
    });
  });
});

describe('useAnalytics — call dispatch', () => {
  describe('when window.umami is already available', () => {
    it('calls track immediately', () => {
      const mock = installMockUmami();
      const { trackFavourite } = useAnalytics();

      trackFavourite('feed');

      expect(mock.track).toHaveBeenCalledWith('favourite', { source: 'feed' });
      expect(mock.track).toHaveBeenCalledTimes(1);
    });

    it('calls identify immediately', () => {
      const mock = installMockUmami();
      const { identify } = useAnalytics();

      identify('alice@fediway.com');

      expect(mock.identify).toHaveBeenCalledWith({ acct: 'alice@fediway.com' });
    });
  });

  describe('when window.umami is NOT yet available', () => {
    it('does not throw when called before the script loads', () => {
      clearUmami();
      const { trackFavourite } = useAnalytics();

      expect(() => trackFavourite('feed')).not.toThrow();
    });

    it('queues calls and replays them when flushPendingAnalytics is called', () => {
      clearUmami();
      const { trackFavourite, trackReblog, identify } = useAnalytics();

      trackFavourite('feed');
      trackReblog('status_detail');
      identify('alice');

      const mock = installMockUmami();
      flushPendingAnalytics();

      expect(mock.track).toHaveBeenCalledTimes(2);
      expect(mock.track).toHaveBeenNthCalledWith(1, 'favourite', { source: 'feed' });
      expect(mock.track).toHaveBeenNthCalledWith(2, 'reblog', { source: 'status_detail' });
      expect(mock.identify).toHaveBeenCalledWith({ acct: 'alice' });
    });

    it('preserves call order when flushing the queue', () => {
      clearUmami();
      const { trackFavourite } = useAnalytics();

      trackFavourite('feed');
      trackFavourite('profile');
      trackFavourite('status_detail');

      const mock = installMockUmami();
      flushPendingAnalytics();

      expect(mock.track.mock.calls).toEqual([
        ['favourite', { source: 'feed' }],
        ['favourite', { source: 'profile' }],
        ['favourite', { source: 'status_detail' }],
      ]);
    });

    it('queued calls with a broken function do not block the rest', () => {
      clearUmami();
      const { trackFavourite } = useAnalytics();

      trackFavourite('feed');
      trackFavourite('profile');

      const mock: MockUmami = {
        track: vi.fn()
          .mockImplementationOnce(() => { throw new Error('boom'); })
          .mockImplementationOnce(() => {}),
        identify: vi.fn(),
      };
      (window as unknown as { umami?: MockUmami }).umami = mock;

      expect(() => flushPendingAnalytics()).not.toThrow();
      expect(mock.track).toHaveBeenCalledTimes(2);
    });

    it('flushPendingAnalytics is a no-op when umami is not yet available', () => {
      clearUmami();
      const { trackFavourite } = useAnalytics();
      trackFavourite('feed');

      expect(() => flushPendingAnalytics()).not.toThrow();
      // Queue is NOT drained because umami still isn't available — the call
      // stays buffered for a future flush.
      const mock = installMockUmami();
      flushPendingAnalytics();
      expect(mock.track).toHaveBeenCalledWith('favourite', { source: 'feed' });
    });

    it('detects umami at call time even without the event', () => {
      // Edge case: if the event was missed but window.umami exists by the
      // next call, that call should still fire immediately.
      clearUmami();
      const { trackFavourite } = useAnalytics();

      trackFavourite('feed'); // queued

      const mock = installMockUmami();
      trackFavourite('profile'); // fires immediately (window.umami now present)

      expect(mock.track).toHaveBeenCalledWith('favourite', { source: 'profile' });
    });
  });

  describe('event payloads', () => {
    it('trackPostCreated with no opts', () => {
      const mock = installMockUmami();
      useAnalytics().trackPostCreated();
      expect(mock.track).toHaveBeenCalledWith('post_created', {});
    });

    it('trackPostCreated with hasMedia', () => {
      const mock = installMockUmami();
      useAnalytics().trackPostCreated({ hasMedia: true });
      expect(mock.track).toHaveBeenCalledWith('post_created', { has_media: 1 });
    });

    it('trackPostCreated with isReply', () => {
      const mock = installMockUmami();
      useAnalytics().trackPostCreated({ isReply: true });
      expect(mock.track).toHaveBeenCalledWith('post_created', { is_reply: 1 });
    });

    it('trackPostCreated with both flags', () => {
      const mock = installMockUmami();
      useAnalytics().trackPostCreated({ hasMedia: true, isReply: true });
      expect(mock.track).toHaveBeenCalledWith('post_created', { has_media: 1, is_reply: 1 });
    });

    it('trackLogin with method', () => {
      const mock = installMockUmami();
      useAnalytics().trackLogin('oauth');
      expect(mock.track).toHaveBeenCalledWith('login', { method: 'oauth' });
    });

    it('trackMessageSent takes no payload', () => {
      const mock = installMockUmami();
      useAnalytics().trackMessageSent();
      expect(mock.track).toHaveBeenCalledWith('message_sent');
    });

    it.each(['feed', 'status_detail', 'profile', 'notification', 'sidebar'] as const)(
      'trackShare propagates source=%s',
      (source) => {
        const mock = installMockUmami();
        useAnalytics().trackShare(source);
        expect(mock.track).toHaveBeenCalledWith('share', { source });
      },
    );
  });
});

describe('normalizeUmamiPayload (before-send hook)', () => {
  it('collapses a dynamic status-detail URL', () => {
    const input = {
      website: 'wid',
      hostname: 'fediway.com',
      url: '/@alice/12345',
      title: 'Some Post',
      screen: '1920x1080',
      language: 'en-US',
    };
    const output = normalizeUmamiPayload(input);

    expect(output.url).toBe('/status');
    expect(output.title).toBe('Status Detail');
  });

  it('preserves non-url payload fields verbatim', () => {
    const input = {
      website: 'wid',
      hostname: 'fediway.com',
      url: '/',
      title: 'Original',
      screen: '1920x1080',
      language: 'en-US',
      referrer: 'https://example.com',
      id: 'user-id',
    };
    const output = normalizeUmamiPayload(input);

    expect(output.website).toBe('wid');
    expect(output.hostname).toBe('fediway.com');
    expect(output.screen).toBe('1920x1080');
    expect(output.language).toBe('en-US');
    expect(output.referrer).toBe('https://example.com');
    expect(output.id).toBe('user-id');
  });

  it('replaces url and title for home', () => {
    const input = { url: '/', title: 'fediway.com' };
    const output = normalizeUmamiPayload(input);
    expect(output).toMatchObject({ url: '/', title: 'Home' });
  });

  it('replaces url and title for a profile route', () => {
    const input = { url: '/@bob@example.com', title: 'Bob on Fediway' };
    const output = normalizeUmamiPayload(input);
    expect(output).toMatchObject({ url: '/profile', title: 'Profile' });
  });

  it('collapses a tag route', () => {
    const input = { url: '/tags/webdev', title: '#webdev' };
    const output = normalizeUmamiPayload(input);
    expect(output).toMatchObject({ url: '/tags', title: 'Tag' });
  });

  it('falls back to { path, "Other" } for unknown routes', () => {
    const input = { url: '/experimental-route', title: 'Experimental' };
    const output = normalizeUmamiPayload(input);
    expect(output).toMatchObject({ url: '/experimental-route', title: 'Other' });
  });

  it('returns payload untouched when url is missing', () => {
    const input = { website: 'wid', title: 'no url here' };
    const output = normalizeUmamiPayload(input);
    expect(output).toEqual(input);
  });

  it('returns payload untouched when url is not a string', () => {
    const input = { website: 'wid', url: 123 as unknown as string, title: 'bad' };
    const output = normalizeUmamiPayload(input);
    expect(output).toEqual(input);
  });

  it('does not mutate the input payload', () => {
    const input = { url: '/@alice/12345', title: 'Original', extra: 'keep' };
    const before = JSON.stringify(input);
    normalizeUmamiPayload(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});
