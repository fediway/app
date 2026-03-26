import { useAuth } from '@repo/api';
import { useToast } from '@repo/ui';

/**
 * Composable for gating actions behind authentication.
 * Shows a toast prompt and redirects to login when not authenticated.
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  /**
   * Wrap an action function with an auth check.
   * If authenticated, executes the action.
   * If not, shows a toast and redirects to login.
   */
  function requireAuth<T extends (...args: any[]) => any>(
    action: T,
    actionLabel: string = 'do this',
  ): T {
    return ((...args: any[]) => {
      if (isAuthenticated.value) {
        return action(...args);
      }

      toast(`Sign in to ${actionLabel}`);

      // Small delay so the user sees the toast before navigating
      setTimeout(() => {
        const currentPath = window.location.pathname;
        navigateTo(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }, 1000);
    }) as T;
  }

  return { requireAuth, isAuthenticated };
}
