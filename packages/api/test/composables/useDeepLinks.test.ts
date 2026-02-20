import { describe, expect, it } from 'vitest';
import { useDeepLinks } from '../../src/composables/useDeepLinks';
import { withSetup } from '../utils/withSetup';

describe('useDeepLinks', () => {
  describe('capture paths', () => {
    it('resolves /@username', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/@alice');
      expect(result).toEqual({ path: '/@alice' });
    });

    it('resolves /@username/postId', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/@alice/123');
      expect(result).toEqual({ path: '/@alice/123' });
    });

    it('resolves /items/*', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/items/https://example.com');
      expect(result).toEqual({ path: '/items/https://example.com' });
    });

    it('resolves /tags/*', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/tags/music');
      expect(result).toEqual({ path: '/tags/music' });
    });
  });

  describe('query preservation', () => {
    it('includes query params when present', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/@alice?ref=share');
      expect(result).toEqual({ path: '/@alice', query: { ref: 'share' } });
    });

    it('includes multiple query params', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/tags/music?ref=share&source=app');
      expect(result).toEqual({ path: '/tags/music', query: { ref: 'share', source: 'app' } });
    });

    it('omits query key when no search params', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://fediway.com/@alice');
      expect(result).not.toHaveProperty('query');
    });
  });

  describe('excluded paths', () => {
    it('excludes /settings', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/settings')).toBeNull();
    });

    it('excludes /settings/notifications', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/settings/notifications')).toBeNull();
    });

    it('excludes /auth/login', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/auth/login')).toBeNull();
    });

    it('excludes /oauth/callback', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/oauth/callback')).toBeNull();
    });

    it('excludes /auth (bare)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/auth')).toBeNull();
    });

    it('excludes /oauth (bare)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/oauth')).toBeNull();
    });
  });

  describe('unrecognized paths', () => {
    it('returns null for /', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/')).toBeNull();
    });

    it('returns null for /explore', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/explore')).toBeNull();
    });

    it('returns null for /notifications', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/notifications')).toBeNull();
    });

    it('returns null for bare /@ (no username)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/@')).toBeNull();
    });

    it('returns null for bare /tags/ (no tag)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/tags/')).toBeNull();
    });

    it('returns null for bare /items/ (no item)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('https://fediway.com/items/')).toBeNull();
    });
  });

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('')).toBeNull();
    });

    it('returns null for non-URL string', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('not a url')).toBeNull();
    });

    it('returns null for malformed URL', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.resolveUrl('://missing-scheme')).toBeNull();
    });
  });

  describe('any domain', () => {
    it('resolves regardless of domain (native layer filters)', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('https://other-instance.social/@bob');
      expect(result).toEqual({ path: '/@bob' });
    });

    it('resolves custom scheme URLs', () => {
      const [dl] = withSetup(() => useDeepLinks());
      const result = dl.resolveUrl('com.fediway.app://host/@alice');
      expect(result).toEqual({ path: '/@alice' });
    });
  });

  describe('isCapturePath', () => {
    it('returns true for /@username', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isCapturePath('/@alice')).toBe(true);
    });

    it('returns true for /items/something', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isCapturePath('/items/https://example.com')).toBe(true);
    });

    it('returns true for /tags/something', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isCapturePath('/tags/music')).toBe(true);
    });

    it('returns false for bare /@', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isCapturePath('/@')).toBe(false);
    });

    it('returns false for /explore', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isCapturePath('/explore')).toBe(false);
    });
  });

  describe('isExcludedPath', () => {
    it('returns true for /settings', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/settings')).toBe(true);
    });

    it('returns true for /settings/notifications', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/settings/notifications')).toBe(true);
    });

    it('returns true for /auth', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/auth')).toBe(true);
    });

    it('returns true for /oauth/callback', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/oauth/callback')).toBe(true);
    });

    it('returns false for /@alice', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/@alice')).toBe(false);
    });

    it('returns false for /tags/music', () => {
      const [dl] = withSetup(() => useDeepLinks());
      expect(dl.isExcludedPath('/tags/music')).toBe(false);
    });
  });
});
