import { useAuth } from '@repo/api';
import { ref } from 'vue';

// Module-level state — shared across all callers (singleton)
const isPromptOpen = ref(false);
const promptLabel = ref('');

/**
 * Composable for gating actions behind authentication.
 * Opens a modal prompt instead of redirecting — keeps the user in context.
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();

  /**
   * Wrap an action function with an auth check.
   * If authenticated, executes the action.
   * If not, opens the auth prompt modal with a contextual message.
   */
  function requireAuth<T extends (...args: any[]) => any>(
    action: T,
    actionLabel: string = 'do this',
  ): T {
    return ((...args: any[]) => {
      if (isAuthenticated.value) {
        return action(...args);
      }
      promptLabel.value = actionLabel;
      isPromptOpen.value = true;
    }) as T;
  }

  function closePrompt() {
    isPromptOpen.value = false;
  }

  return {
    requireAuth,
    isAuthenticated,
    isPromptOpen,
    promptLabel,
    closePrompt,
  };
}
