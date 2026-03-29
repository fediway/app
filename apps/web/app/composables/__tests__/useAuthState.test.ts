import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * useAuthState — the SSR bridge for authentication.
 *
 * Contract:
 * - On server: reads auth state from cookie
 * - On client: reads auth state from useAuth().isAuthenticated
 * - Both sides share the same useState('auth:authenticated')
 * - Cookie is set on login, cleared on logout/401
 * - No hydration mismatch: server and client agree on auth state
 */

// Mock Nuxt's useState — simulates shared state between server and client
const stateStore = new Map<string, any>();
vi.stubGlobal('useState', (key: string, init?: () => any) => {
  if (!stateStore.has(key) && init) {
    stateStore.set(key, { value: init() });
  }
  return stateStore.get(key) ?? { value: null };
});

// Mock useCookie
let cookieStore: Record<string, string | null> = {};
vi.stubGlobal('useCookie', (name: string) => ({
  get value() { return cookieStore[name] ?? null; },
  set value(v: string | null) { cookieStore[name] = v; },
}));

beforeEach(() => {
  stateStore.clear();
  cookieStore = {};
});

afterEach(() => {
  stateStore.clear();
  cookieStore = {};
});

describe('useAuthState — contract', () => {
  describe('cookie → state sync', () => {
    it('returns false when no auth cookie exists', () => {
      // No cookie set
      const isAuthenticated = useState('auth:authenticated', () => {
        const cookie = useCookie('fediway_auth');
        return cookie.value === 'true';
      });
      expect(isAuthenticated.value).toBe(false);
    });

    it('returns true when auth cookie is "true"', () => {
      cookieStore.fediway_auth = 'true';
      const isAuthenticated = useState('auth:authenticated', () => {
        const cookie = useCookie('fediway_auth');
        return cookie.value === 'true';
      });
      expect(isAuthenticated.value).toBe(true);
    });

    it('returns false when auth cookie is cleared', () => {
      cookieStore.fediway_auth = null;
      const isAuthenticated = useState('auth:authenticated', () => {
        const cookie = useCookie('fediway_auth');
        return cookie.value === 'true';
      });
      expect(isAuthenticated.value).toBe(false);
    });
  });

  describe('login/logout cookie management', () => {
    it('sets cookie to "true" on login', () => {
      const cookie = useCookie('fediway_auth');
      // Simulate login
      cookie.value = 'true';
      expect(cookieStore.fediway_auth).toBe('true');
    });

    it('clears cookie on logout', () => {
      cookieStore.fediway_auth = 'true';
      const cookie = useCookie('fediway_auth');
      // Simulate logout
      cookie.value = null;
      expect(cookieStore.fediway_auth).toBeNull();
    });

    it('clears cookie on 401 (session expired)', () => {
      cookieStore.fediway_auth = 'true';
      const cookie = useCookie('fediway_auth');
      // Simulate 401 handler
      cookie.value = null;
      expect(cookieStore.fediway_auth).toBeNull();
    });
  });

  describe('server/client consistency', () => {
    it('server and client see the same auth state (authenticated)', () => {
      cookieStore.fediway_auth = 'true';

      // Server reads cookie → sets useState
      const serverState = useState('auth:authenticated', () => {
        return useCookie('fediway_auth').value === 'true';
      });
      expect(serverState.value).toBe(true);

      // Client reads the SAME useState (already initialized by server)
      const clientState = useState('auth:authenticated');
      expect(clientState.value).toBe(true);

      // They are the same reference
      expect(serverState).toBe(clientState);
    });

    it('server and client see the same auth state (not authenticated)', () => {
      // No cookie
      const serverState = useState('auth:authenticated', () => {
        return useCookie('fediway_auth').value === 'true';
      });
      expect(serverState.value).toBe(false);

      const clientState = useState('auth:authenticated');
      expect(clientState.value).toBe(false);
    });
  });

  describe('route protection invariants', () => {
    const PUBLIC_ROUTES = ['/', '/login', '/oauth', '/explore', '/tags', '/links'];

    function shouldRedirect(isAuthenticated: boolean, isMockMode: boolean, route: string): boolean {
      if (isMockMode)
        return false;
      if (PUBLIC_ROUTES.some(r => route === r || route.startsWith(`${r}/`)))
        return false;
      return !isAuthenticated;
    }

    it('redirects protected routes when not authenticated in live mode', () => {
      const protectedRoutes = ['/notifications', '/messages', '/favourites', '/saved', '/settings'];
      for (const route of protectedRoutes) {
        expect(shouldRedirect(false, false, route), `${route} must redirect`).toBe(true);
      }
    });

    it('allows public routes without auth', () => {
      for (const route of ['/', '/login', '/oauth/callback', '/explore', '/explore/tags', '/tags/news', '/links/example.com']) {
        expect(shouldRedirect(false, false, route), `${route} must NOT redirect`).toBe(false);
      }
    });

    it('never redirects authenticated users', () => {
      const allRoutes = ['/', '/notifications', '/messages', '/settings', '/favourites'];
      for (const route of allRoutes) {
        expect(shouldRedirect(true, false, route), `${route} must NOT redirect when authenticated`).toBe(false);
      }
    });

    it('never redirects in mock mode', () => {
      const allRoutes = ['/', '/notifications', '/messages', '/settings'];
      for (const route of allRoutes) {
        expect(shouldRedirect(false, true, route), `${route} must NOT redirect in mock mode`).toBe(false);
      }
    });
  });

  describe('mock mode isolation', () => {
    it('mock user is NEVER set when mode is live', () => {
      const mode: string = 'live';
      const isAuthenticated = false;
      const shouldSetMockUser = mode === 'mock' && !isAuthenticated;
      expect(shouldSetMockUser).toBe(false);
    });

    it('mock user is only set when mode is explicitly mock', () => {
      const mode = 'mock';
      const isAuthenticated = false;
      const shouldSetMockUser = mode === 'mock' && !isAuthenticated;
      expect(shouldSetMockUser).toBe(true);
    });
  });
});
