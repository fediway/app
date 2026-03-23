import { useAuth } from '@repo/api';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  to: string;
}

export interface CurrentUser {
  name: string;
  username: string;
  acct: string;
  avatar: string;
}

const MENU_ITEMS: Omit<MenuItem, 'to'>[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'explore' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'messages', label: 'Messages', icon: 'chat' },
  { id: 'favourites', label: 'Favourites', icon: 'favourites' },
  { id: 'saved', label: 'Saved', icon: 'saved' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const MENU_ROUTES: Record<string, string> = {
  home: '/',
  explore: '/explore',
  notifications: '/notifications',
  messages: '/messages',
  favourites: '/favourites',
  saved: '/saved',
  settings: '/settings',
};

const FOOTER_ITEMS: Omit<MenuItem, 'to'>[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'new-post', label: 'New Post', icon: 'new-post' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

export function useNavigationStore() {
  const route = useRoute();
  const { currentUser: authUser } = useAuth();
  const isSidebarOpen = useState('nav:sidebar', () => false);

  const currentUser = computed<CurrentUser | null>(() => {
    if (authUser.value) {
      return {
        name: authUser.value.displayName || authUser.value.username,
        username: authUser.value.username,
        acct: authUser.value.acct,
        avatar: authUser.value.avatar,
      };
    }
    return null;
  });

  const profileUrl = computed(() => currentUser.value ? `/@${currentUser.value.acct}` : '/');

  function getRoute(id: string) {
    return id === 'profile' ? profileUrl.value : (MENU_ROUTES[id] ?? '/');
  }

  const menuItems = computed<MenuItem[]>(() =>
    MENU_ITEMS.map(item => ({ ...item, to: getRoute(item.id) })),
  );

  const mobileFooterItems = computed<MenuItem[]>(() =>
    FOOTER_ITEMS.map(item => ({ ...item, to: getRoute(item.id) })),
  );

  const activeItemId = computed(() => {
    const path = route.path;
    for (const item of MENU_ITEMS) {
      const to = getRoute(item.id);
      if (to === '/') {
        if (path === '/')
          return item.id;
      }
      else if (path === to || path.startsWith(`${to}/`)) {
        return item.id;
      }
    }
    return 'home';
  });

  const pageTitle = computed(() => {
    const item = MENU_ITEMS.find(i => i.id === activeItemId.value);
    return item?.label ?? 'Home';
  });

  function openSidebar() {
    isSidebarOpen.value = true;
  }

  function closeSidebar() {
    isSidebarOpen.value = false;
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  return reactive({
    isSidebarOpen,
    activeItemId,
    pageTitle,
    menuItems,
    mobileFooterItems,
    currentUser,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  });
}
