import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, reactive, ref } from 'vue';

// Mock auth user — configurable per test
const mockAuthUser = ref<{
  displayName: string;
  username: string;
  acct: string;
  avatar: string;
} | null>(null);

vi.mock('@repo/api', () => ({
  useAuth: () => ({ currentUser: mockAuthUser }),
}));

// Mock Nuxt auto-imports — use real Vue primitives
const mockRoutePath = ref('/');

vi.stubGlobal('useRoute', () => ({
  get path() { return mockRoutePath.value; },
}));

vi.stubGlobal('useState', (_key: string, init: () => any) => ref(init()));
vi.stubGlobal('computed', computed);
vi.stubGlobal('reactive', reactive);

const { useNavigationStore } = await import('../../stores/navigation');

function setAuthUser(user: { displayName: string; username: string; acct: string; avatar: string } | null) {
  mockAuthUser.value = user;
}

const DEFAULT_USER = {
  displayName: 'Jane Doe',
  username: 'jane',
  acct: 'jane@social.network',
  avatar: 'https://example.com/avatar.png',
};

beforeEach(() => {
  mockAuthUser.value = null;
  mockRoutePath.value = '/';
});

describe('useNavigationStore', () => {
  describe('currentUser', () => {
    it('returns null when not authenticated', () => {
      const store = useNavigationStore();
      expect(store.currentUser).toBeNull();
    });

    it('returns mapped user when authenticated', () => {
      setAuthUser(DEFAULT_USER);
      const store = useNavigationStore();

      expect(store.currentUser).toEqual({
        name: 'Jane Doe',
        username: 'jane',
        acct: 'jane@social.network',
        avatar: 'https://example.com/avatar.png',
      });
    });

    it('falls back to username when displayName is empty', () => {
      setAuthUser({ ...DEFAULT_USER, displayName: '' });
      const store = useNavigationStore();

      expect(store.currentUser!.name).toBe('jane');
    });
  });

  describe('profileUrl', () => {
    it('returns /@acct when user exists', () => {
      setAuthUser(DEFAULT_USER);
      const store = useNavigationStore();
      expect(store.menuItems.find((i: any) => i.id === 'profile')!.to).toBe('/@jane@social.network');
    });

    it('returns / when user is null', () => {
      const store = useNavigationStore();
      expect(store.menuItems.find((i: any) => i.id === 'profile')!.to).toBe('/');
    });
  });

  describe('menuItems', () => {
    it('generates all 8 menu items', () => {
      const store = useNavigationStore();

      expect(store.menuItems).toHaveLength(8);
      expect(store.menuItems.map((i: any) => i.id)).toEqual([
        'home',
        'explore',
        'notifications',
        'messages',
        'favourites',
        'saved',
        'profile',
        'settings',
      ]);
    });

    it('maps static routes correctly', () => {
      const store = useNavigationStore();
      const routes = Object.fromEntries(store.menuItems.map((i: any) => [i.id, i.to]));

      expect(routes.home).toBe('/');
      expect(routes.explore).toBe('/explore');
      expect(routes.notifications).toBe('/notifications');
      expect(routes.messages).toBe('/messages');
      expect(routes.favourites).toBe('/favourites');
      expect(routes.saved).toBe('/saved');
      expect(routes.settings).toBe('/settings');
    });

    it('profile route updates reactively with auth', () => {
      const store = useNavigationStore();
      const getProfileRoute = () => store.menuItems.find((i: any) => i.id === 'profile')!.to;

      expect(getProfileRoute()).toBe('/');

      setAuthUser(DEFAULT_USER);
      expect(getProfileRoute()).toBe('/@jane@social.network');
    });
  });

  describe('mobileFooterItems', () => {
    it('generates 5 footer items', () => {
      const store = useNavigationStore();

      expect(store.mobileFooterItems).toHaveLength(5);
      expect(store.mobileFooterItems.map((i: any) => i.id)).toEqual([
        'home',
        'search',
        'new-post',
        'notifications',
        'profile',
      ]);
    });
  });

  describe('activeItemId', () => {
    it('returns home for root path', () => {
      mockRoutePath.value = '/';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('home');
    });

    it('returns explore for /explore', () => {
      mockRoutePath.value = '/explore';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('explore');
    });

    it('returns explore for /explore/tags sub-path', () => {
      mockRoutePath.value = '/explore/tags';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('explore');
    });

    it('returns notifications for /notifications', () => {
      mockRoutePath.value = '/notifications';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('notifications');
    });

    it('returns messages for /messages/123 sub-path', () => {
      mockRoutePath.value = '/messages/123';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('messages');
    });

    it('returns profile for /@acct path', () => {
      setAuthUser(DEFAULT_USER);
      mockRoutePath.value = '/@jane@social.network';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('profile');
    });

    it('returns home for unrecognized paths', () => {
      mockRoutePath.value = '/random/unknown';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('home');
    });

    it('does not match home for paths that just start with /', () => {
      mockRoutePath.value = '/explore';
      const store = useNavigationStore();
      expect(store.activeItemId).toBe('explore');
    });
  });

  describe('pageTitle', () => {
    it('returns Home for root path', () => {
      mockRoutePath.value = '/';
      const store = useNavigationStore();
      expect(store.pageTitle).toBe('Home');
    });

    it('returns Explore for /explore', () => {
      mockRoutePath.value = '/explore';
      const store = useNavigationStore();
      expect(store.pageTitle).toBe('Explore');
    });

    it('returns Settings for /settings', () => {
      mockRoutePath.value = '/settings';
      const store = useNavigationStore();
      expect(store.pageTitle).toBe('Settings');
    });
  });

  describe('sidebar', () => {
    it('starts closed', () => {
      const store = useNavigationStore();
      expect(store.isSidebarOpen).toBe(false);
    });

    it('openSidebar sets to true', () => {
      const store = useNavigationStore();
      store.openSidebar();
      expect(store.isSidebarOpen).toBe(true);
    });

    it('closeSidebar sets to false', () => {
      const store = useNavigationStore();
      store.openSidebar();
      store.closeSidebar();
      expect(store.isSidebarOpen).toBe(false);
    });

    it('toggleSidebar flips state', () => {
      const store = useNavigationStore();
      expect(store.isSidebarOpen).toBe(false);
      store.toggleSidebar();
      expect(store.isSidebarOpen).toBe(true);
      store.toggleSidebar();
      expect(store.isSidebarOpen).toBe(false);
    });
  });
});
