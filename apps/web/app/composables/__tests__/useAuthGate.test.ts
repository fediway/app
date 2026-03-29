import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const mockIsAuthenticated = ref(true);

vi.mock('@repo/api', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
  }),
}));

// Reset module state between tests — useAuthGate uses module-level refs
let useAuthGate: typeof import('../useAuthGate').useAuthGate;

beforeEach(async () => {
  mockIsAuthenticated.value = true;
  // Re-import to get fresh module-level state
  vi.resetModules();
  const mod = await import('../useAuthGate');
  useAuthGate = mod.useAuthGate;
});

afterEach(() => {
  mockIsAuthenticated.value = true;
});

describe('useAuthGate', () => {
  describe('requireAuth — authenticated user', () => {
    it('executes the action immediately', () => {
      const action = vi.fn();
      const { requireAuth } = useAuthGate();
      const gated = requireAuth(action, 'like this post');

      gated('arg1', 'arg2');

      expect(action).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('returns the action result', () => {
      const action = vi.fn(() => 'result');
      const { requireAuth } = useAuthGate();
      const gated = requireAuth(action, 'like this post');

      expect(gated()).toBe('result');
    });

    it('does not open the prompt', () => {
      const action = vi.fn();
      const { requireAuth, isPromptOpen } = useAuthGate();
      const gated = requireAuth(action, 'like this post');

      gated();

      expect(isPromptOpen.value).toBe(false);
    });
  });

  describe('requireAuth — unauthenticated user', () => {
    it('does not execute the action', () => {
      mockIsAuthenticated.value = false;
      const action = vi.fn();
      const { requireAuth } = useAuthGate();
      const gated = requireAuth(action, 'like this post');

      gated();

      expect(action).not.toHaveBeenCalled();
    });

    it('opens the prompt with the correct label', () => {
      mockIsAuthenticated.value = false;
      const action = vi.fn();
      const { requireAuth, isPromptOpen, promptLabel } = useAuthGate();
      const gated = requireAuth(action, 'like this post');

      gated();

      expect(isPromptOpen.value).toBe(true);
      expect(promptLabel.value).toBe('like this post');
    });

    it('uses default label when none provided', () => {
      mockIsAuthenticated.value = false;
      const action = vi.fn();
      const { requireAuth, promptLabel } = useAuthGate();
      const gated = requireAuth(action);

      gated();

      expect(promptLabel.value).toBe('do this');
    });
  });

  describe('closePrompt', () => {
    it('closes the prompt', () => {
      mockIsAuthenticated.value = false;
      const { requireAuth, isPromptOpen, closePrompt } = useAuthGate();
      const gated = requireAuth(vi.fn(), 'test');

      gated();
      expect(isPromptOpen.value).toBe(true);

      closePrompt();
      expect(isPromptOpen.value).toBe(false);
    });
  });

  describe('shared state', () => {
    it('all callers see the same prompt state', () => {
      mockIsAuthenticated.value = false;
      const gate1 = useAuthGate();
      const gate2 = useAuthGate();
      const gated = gate1.requireAuth(vi.fn(), 'repost this');

      gated();

      expect(gate2.isPromptOpen.value).toBe(true);
      expect(gate2.promptLabel.value).toBe('repost this');
    });
  });
});
