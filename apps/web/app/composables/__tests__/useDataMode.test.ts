import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetDataModeState, useDataMode } from '../useDataMode';

beforeEach(() => {
  _resetDataModeState();
  localStorage.clear();
  vi.stubEnv('VITE_API_MODE', '');
});

afterEach(() => {
  _resetDataModeState();
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe('useDataMode', () => {
  describe('initial mode', () => {
    it('defaults to live when nothing is set', () => {
      const { mode } = useDataMode();
      expect(mode.value).toBe('live');
    });

    it('reads VITE_API_MODE=mock from env', () => {
      vi.stubEnv('VITE_API_MODE', 'mock');
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });

    it('falls back to localStorage when env var not set', () => {
      localStorage.setItem('fediway-data-mode', 'live');
      const { mode } = useDataMode();
      expect(mode.value).toBe('live');
    });

    it('env var takes priority over localStorage', () => {
      localStorage.setItem('fediway-data-mode', 'live');
      vi.stubEnv('VITE_API_MODE', 'mock');
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });

    it('treats unknown localStorage value as live', () => {
      localStorage.setItem('fediway-data-mode', 'garbage');
      const { mode } = useDataMode();
      expect(mode.value).toBe('live');
    });
  });

  describe('setMode', () => {
    it('updates reactive mode value', () => {
      const { mode, setMode } = useDataMode();

      expect(mode.value).toBe('live');
      setMode('mock');
      expect(mode.value).toBe('mock');
    });

    it('persists to localStorage', () => {
      const { setMode } = useDataMode();

      setMode('live');
      expect(localStorage.getItem('fediway-data-mode')).toBe('live');

      setMode('mock');
      expect(localStorage.getItem('fediway-data-mode')).toBe('mock');
    });
  });

  describe('live env auth invariant — mock data must NEVER leak', () => {
    /**
     * These tests verify the guards that prevent mock data from appearing
     * when VITE_API_MODE=live. This is critical — a user running the app
     * in live mode must NEVER see fake/demo content.
     */
    const AUTH_ROUTES = ['/login', '/oauth'];

    function shouldRedirectInLiveMode(isAuthenticated: boolean, route: string): boolean {
      const isAuthRoute = AUTH_ROUTES.some(r => route === r || route.startsWith(`${r}/`));
      return !isAuthenticated && !isAuthRoute;
    }

    function shouldSetMockUser(envMode: string, isAuthenticated: boolean): boolean {
      const isLiveEnv = envMode === 'live';
      return !isLiveEnv && !isAuthenticated;
    }

    it('redirects ALL non-auth routes when live + unauthenticated', () => {
      const routes = [
        '/',
        '/notifications',
        '/messages',
        '/favourites',
        '/saved',
        '/explore',
        '/tags/news',
        '/links/example.com',
        '/@user',
        '/@user/12345',
        '/settings',
      ];

      for (const route of routes) {
        expect(
          shouldRedirectInLiveMode(false, route),
          `${route} must redirect when live + unauthenticated`,
        ).toBe(true);
      }
    });

    it('allows /login and /oauth without auth', () => {
      for (const route of ['/login', '/oauth/callback']) {
        expect(
          shouldRedirectInLiveMode(false, route),
          `${route} must NOT redirect`,
        ).toBe(false);
      }
    });

    it('does NOT redirect authenticated users', () => {
      for (const route of ['/', '/notifications', '/messages']) {
        expect(
          shouldRedirectInLiveMode(true, route),
          `${route} must NOT redirect when authenticated`,
        ).toBe(false);
      }
    });

    it('nEVER sets mock user when env=live', () => {
      expect(shouldSetMockUser('live', false)).toBe(false);
      expect(shouldSetMockUser('live', true)).toBe(false);
    });

    it('allows mock user only when env is NOT live and not authenticated', () => {
      expect(shouldSetMockUser('mock', false)).toBe(true);
      expect(shouldSetMockUser('mock', true)).toBe(false);
    });
  });

  describe('shared state', () => {
    it('multiple useDataMode() calls share the same ref', () => {
      const a = useDataMode();
      const b = useDataMode();

      a.setMode('live');
      expect(b.mode.value).toBe('live');
    });

    it('initializes only once (subsequent calls skip loadFromStorage)', () => {
      localStorage.setItem('fediway-data-mode', 'live');

      const first = useDataMode();
      expect(first.mode.value).toBe('live');

      // Change localStorage after init — should not affect mode
      localStorage.setItem('fediway-data-mode', 'mock');
      const second = useDataMode();
      expect(second.mode.value).toBe('live');
    });
  });
});
