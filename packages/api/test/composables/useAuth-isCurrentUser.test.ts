import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, shallowRef } from 'vue';

import { useAuth } from '../../src/composables/useAuth';

const currentUser = shallowRef<{ id: string; acct: string } | null>(null);

vi.mock('../../src/auth/account-store', () => ({
  useAccountStore: () => ({
    currentUser,
    isAuthenticated: ref(false),
    instanceUrl: ref<string | null>(null),
    isLoading: ref(false),
    error: ref<Error | null>(null),
  }),
}));

beforeEach(() => {
  currentUser.value = null;
});

describe('useAuth.isCurrentUser', () => {
  it('returns false when not logged in', () => {
    const { isCurrentUser } = useAuth();
    expect(isCurrentUser('123')).toBe(false);
  });

  it('returns true when id matches the current user', () => {
    currentUser.value = { id: '42', acct: 'jane@example.com' };
    const { isCurrentUser } = useAuth();
    expect(isCurrentUser('42')).toBe(true);
  });

  it('returns false when id does not match', () => {
    currentUser.value = { id: '42', acct: 'jane@example.com' };
    const { isCurrentUser } = useAuth();
    expect(isCurrentUser('99')).toBe(false);
  });

  it('returns false for nullish ids', () => {
    currentUser.value = { id: '42', acct: 'jane@example.com' };
    const { isCurrentUser } = useAuth();
    expect(isCurrentUser(undefined)).toBe(false);
    expect(isCurrentUser(null)).toBe(false);
    expect(isCurrentUser('')).toBe(false);
  });
});
