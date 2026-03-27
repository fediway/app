import { useAuth, useNotificationMarker } from '@repo/api';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  to: string;
  dot?: boolean;
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

  const { hasUnread: hasUnreadNotifications } = useNotificationMarker();
  const isLoggedIn = computed(() => !!currentUser.value);

  const LOGGED_OUT_MENU: Omit<MenuItem, 'to'>[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
  ];

  const LOGGED_OUT_FOOTER: Omit<MenuItem, 'to'>[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
  ];

  const menuItems = computed<MenuItem[]>(() => {
    const items = isLoggedIn.value ? MENU_ITEMS : LOGGED_OUT_MENU;
    return items.map(item => ({
      ...item,
      to: getRoute(item.id),
      dot: item.id === 'notifications' ? hasUnreadNotifications.value : undefined,
    }));
  });

  const mobileFooterItems = computed<MenuItem[]>(() => {
    const items = isLoggedIn.value ? FOOTER_ITEMS : LOGGED_OUT_FOOTER;
    return items.map(item => ({
      ...item,
      to: getRoute(item.id),
      dot: item.id === 'notifications' ? hasUnreadNotifications.value : undefined,
    }));
  });

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

  // Page header state — set by pages via usePageHeader composable
  const pageHeaderOverride = useState<{
    title: string;
    subtitle?: string;
    image?: string;
    icon?: string;
  } | null>('nav:pageHeaderOverride', () => null);

  // Auto-detect whether current route is a top-level menu destination
  const isMenuPage = computed(() => {
    const path = route.path;
    for (const item of MENU_ITEMS) {
      const to = getRoute(item.id);
      if (to === '/' && path === '/')
        return true;
      if (to !== '/' && (path === to || path.startsWith(`${to}/`)))
        return true;
    }
    return false;
  });

  const showBack = computed(() => !isMenuPage.value);

  const pageTitle = computed(() => {
    if (pageHeaderOverride.value)
      return pageHeaderOverride.value.title;
    const item = MENU_ITEMS.find(i => i.id === activeItemId.value);
    return item?.label ?? 'Home';
  });

  const pageSubtitle = computed(() => pageHeaderOverride.value?.subtitle ?? null);
  const pageImage = computed(() => pageHeaderOverride.value?.image ?? null);
  const pageIcon = computed(() => pageHeaderOverride.value?.icon ?? null);

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
    pageSubtitle,
    pageImage,
    pageIcon,
    pageHeaderOverride,
    showBack,
    menuItems,
    mobileFooterItems,
    currentUser,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  });
}
