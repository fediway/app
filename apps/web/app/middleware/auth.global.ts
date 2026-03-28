import { useAuthState } from '~/composables/useAuthState';
import { useDataMode } from '~/composables/useDataMode';

/**
 * Global auth middleware — client-only.
 * Server skips (Elk pattern) — auth is resolved on client by the plugin.
 * The plugin handles redirect to /login if not authenticated.
 */
const PUBLIC_ROUTES = ['/', '/login', '/oauth', '/explore', '/tags', '/links'];

export default defineNuxtRouteMiddleware((to) => {
  // Skip on server — auth state is client-side (Mastodon OAuth tokens in localStorage)
  if (import.meta.server)
    return;

  const { mode } = useDataMode();
  const { isAuthenticated } = useAuthState();

  // Mock mode (explicitly requested) — everything accessible
  if (mode.value === 'mock')
    return;

  // Authenticated user on login page → redirect to home (or saved redirect)
  if (isAuthenticated.value && to.path === '/login') {
    const redirect = to.query.redirect as string;
    // Validate redirect is a safe relative path (prevent open redirect to external sites)
    const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
    return navigateTo(safeRedirect, { replace: true });
  }

  // Public routes — accessible without auth
  if (PUBLIC_ROUTES.some(route => to.path === route || to.path.startsWith(`${route}/`)))
    return;

  // Not authenticated → redirect to login
  if (!isAuthenticated.value) {
    const redirect = to.path !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    return navigateTo(`/login${redirect}`);
  }
});
