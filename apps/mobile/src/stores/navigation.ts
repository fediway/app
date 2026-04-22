import type { CustomEmoji } from '@repo/types';
import type { NavIconName } from '@repo/ui';
import { useAuth } from '@repo/api';
import { computed, onScopeDispose, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export interface MenuItem {
  id: string;
  label: string;
  icon: NavIconName;
  to: string;
}

export interface CurrentUser {
  name: string;
  username: string;
  acct: string;
  avatar: string;
}

const mockUser: CurrentUser = {
  name: 'Jane Doe',
  username: 'jane',
  acct: 'jane@social.network',
  avatar: 'https://i.pravatar.cc/150?u=jane',
};

const DRAWER_ITEMS: Omit<MenuItem, 'to'>[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'explore' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'messages', label: 'Messages', icon: 'chat' },
  { id: 'favourites', label: 'Likes', icon: 'favourites' },
  { id: 'bookmarks', label: 'Saved', icon: 'saved' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const DRAWER_ROUTES: Record<string, string> = {
  home: '/',
  search: '/search',
  explore: '/explore',
  notifications: '/notifications',
  messages: '/messages',
  favourites: '/favourites',
  bookmarks: '/bookmarks',
  settings: '/settings',
};

const TAB_ITEMS: Omit<MenuItem, 'to'>[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'new-post', label: 'New Post', icon: 'new-post' },
  { id: 'notifications', label: 'Alerts', icon: 'notifications' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

const isDrawerOpen = ref(false);
const pageTitleOverride = ref<{ title: string; avatar?: string; emojis?: readonly CustomEmoji[] } | null>(null);

export function useNavigationStore() {
  const route = useRoute();
  const { currentUser: authUser } = useAuth();

  const currentUser = computed<CurrentUser>(() => {
    if (authUser.value) {
      return {
        name: authUser.value.displayName || authUser.value.username,
        username: authUser.value.username,
        acct: authUser.value.acct,
        avatar: authUser.value.avatar,
      };
    }
    return mockUser;
  });

  const profilePath = computed(() => `/@${currentUser.value.acct}`);

  function getRoute(id: string): string {
    if (id === 'profile')
      return profilePath.value;
    return DRAWER_ROUTES[id] ?? '/';
  }

  const drawerItems = computed<MenuItem[]>(() =>
    DRAWER_ITEMS.map(item => ({ ...item, to: getRoute(item.id) })),
  );

  const tabItems = computed<MenuItem[]>(() =>
    TAB_ITEMS.map(item => ({ ...item, to: getRoute(item.id) })),
  );

  const activeItemId = computed(() => {
    const path = route.path;
    if (path === '/')
      return 'home';
    for (const item of DRAWER_ITEMS) {
      const to = getRoute(item.id);
      if (to !== '/' && (path === to || path.startsWith(`${to}/`)))
        return item.id;
    }
    // Check if on a profile page
    if (path.startsWith('/@'))
      return 'profile';
    return 'home';
  });

  const activeTab = computed(() => {
    const tab = route.meta.tab as string | undefined;
    if (tab)
      return tab;
    return activeItemId.value;
  });

  const pageTitle = computed(() => {
    if (pageTitleOverride.value)
      return pageTitleOverride.value.title;
    const item = DRAWER_ITEMS.find(i => i.id === activeItemId.value);
    return item?.label ?? 'Fediway';
  });

  const pageTitleAvatar = computed(() => pageTitleOverride.value?.avatar ?? null);
  const pageTitleEmojis = computed(() => pageTitleOverride.value?.emojis ?? null);

  function setPageTitle(title: string | null, avatar?: string, emojis?: readonly CustomEmoji[]) {
    pageTitleOverride.value = title ? { title, avatar, emojis } : null;
  }

  /**
   * Set a custom page title (with optional avatar + emojis) that auto-resets when the calling component unmounts.
   */
  function usePageTitle(titleInfo: () => { title: string; avatar?: string; emojis?: readonly CustomEmoji[] } | null) {
    const stop = watch(titleInfo, (val) => {
      pageTitleOverride.value = val;
    }, { immediate: true });

    onScopeDispose(() => {
      stop();
      pageTitleOverride.value = null;
    });
  }

  function openDrawer() {
    isDrawerOpen.value = true;
  }

  function closeDrawer() {
    isDrawerOpen.value = false;
  }

  return reactive({
    currentUser,
    drawerItems,
    tabItems,
    activeItemId,
    activeTab,
    pageTitle,
    pageTitleAvatar,
    pageTitleEmojis,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    setPageTitle,
    usePageTitle,
  });
}
