import { useAuth } from '@repo/api';
import { defineStore } from 'pinia';
import { useDataMode } from '~/composables/useDataMode';

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

const mockUser: CurrentUser = {
  name: 'Jane Doe',
  username: 'jane',
  acct: 'jane@social.network',
  avatar: 'https://i.pravatar.cc/150?u=jane',
};

export const useNavigationStore = defineStore('navigation', () => {
  const isSidebarOpen = ref(false);
  const activeItemId = ref('home');
  const pageTitle = ref('Home');

  const currentUser = computed<CurrentUser>(() => {
    const { mode } = useDataMode();
    if (mode.value === 'live') {
      const { currentUser: authUser } = useAuth();
      if (authUser.value) {
        return {
          name: authUser.value.displayName || authUser.value.username,
          username: authUser.value.username,
          acct: authUser.value.acct,
          avatar: authUser.value.avatar,
        };
      }
    }
    return mockUser;
  });

  const profileUrl = computed(() => `/@${currentUser.value.acct}`);

  const menuItems = computed<MenuItem[]>(() => [
    { id: 'home', label: 'Home', icon: 'home', to: '/' },
    { id: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', to: '/notifications' },
    { id: 'messages', label: 'Messages', icon: 'chat', to: '/messages' },
    { id: 'favourites', label: 'Favourites', icon: 'favourites', to: '/favourites' },
    { id: 'saved', label: 'Saved', icon: 'saved', to: '/saved' },
    { id: 'profile', label: 'Profile', icon: 'profile', to: profileUrl.value },
    { id: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
  ]);

  const mobileFooterItems = computed<MenuItem[]>(() => [
    { id: 'home', label: 'Home', icon: 'home', to: '/' },
    { id: 'search', label: 'Search', icon: 'search', to: '/search' },
    { id: 'new-post', label: 'New Post', icon: 'new-post', to: '/new' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', to: '/notifications' },
    { id: 'profile', label: 'Profile', icon: 'profile', to: profileUrl.value },
  ]);

  function openSidebar() {
    isSidebarOpen.value = true;
  }

  function closeSidebar() {
    isSidebarOpen.value = false;
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  function setActiveItem(id: string) {
    activeItemId.value = id;
    const item = menuItems.value.find(item => item.id === id);
    if (item) {
      pageTitle.value = item.label;
    }
  }

  return {
    isSidebarOpen,
    activeItemId,
    pageTitle,
    menuItems,
    mobileFooterItems,
    currentUser,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setActiveItem,
  };
});
