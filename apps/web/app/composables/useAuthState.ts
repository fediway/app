/**
 * SSR-safe auth state.
 *
 * The bridge between server and client:
 * - Server reads the `fediway_auth` cookie to determine auth state
 * - Client syncs this with the real auth state from useAuth()
 * - Both share the same useState → zero hydration mismatches
 *
 * The cookie is NOT the token — it's just a boolean flag.
 * The actual token stays in localStorage/secureStorage.
 */
export function useAuthState() {
  const authCookie = useCookie('fediway_auth', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  // useState is shared between server and client
  // Server: initialized from cookie
  // Client: already set by server during SSR, then synced with real auth
  const isAuthenticated = useState('auth:authenticated', () => {
    return authCookie.value === 'true';
  });

  /** Call on successful login — sets cookie + state */
  function setAuthenticated() {
    authCookie.value = 'true';
    isAuthenticated.value = true;
  }

  /** Call on logout or 401 — clears cookie + state */
  function clearAuthenticated() {
    authCookie.value = null;
    isAuthenticated.value = false;
  }

  return {
    isAuthenticated,
    authCookie,
    setAuthenticated,
    clearAuthenticated,
  };
}
