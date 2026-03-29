import { computed, nextTick, ref } from 'vue';
import { useFeedScroll } from '~/composables/useFeedScroll';
import { useNavigationStore } from '~/stores/navigation';

export type TabId = 'home' | 'search' | 'new-post' | 'messages' | 'notifications' | 'profile' | null;

interface TabState {
  lastPath: string;
  scrollY: number;
}

const TAB_ROOTS: Record<Exclude<TabId, 'new-post' | 'profile' | null>, string> = {
  home: '/',
  search: '/search',
  messages: '/messages',
  notifications: '/notifications',
};

const activeTab = ref<TabId>('home');
const tabStates = ref(new Map<TabId, TabState>());
const isTabSwitching = ref(false);

export function useTabNavigation() {
  const navigation = useNavigationStore();
  const { getScrollPosition, scrollTo: feedScrollTo } = useFeedScroll();

  function getTabRoot(tabId: TabId): string {
    if (tabId === 'profile') {
      const profileItem = navigation.mobileFooterItems.find(i => i.id === 'profile');
      return profileItem?.to ?? '/';
    }
    return TAB_ROOTS[tabId as keyof typeof TAB_ROOTS] ?? '/';
  }

  function getTabState(tabId: TabId): TabState {
    if (!tabStates.value.has(tabId)) {
      tabStates.value.set(tabId, { lastPath: getTabRoot(tabId), scrollY: 0 });
    }
    return tabStates.value.get(tabId)!;
  }

  const isAtTabRoot = computed(() => {
    if (!activeTab.value)
      return true;
    const state = getTabState(activeTab.value);
    return state.lastPath === getTabRoot(activeTab.value);
  });

  const canGoBack = computed(() => !isAtTabRoot.value);

  function saveCurrentScroll() {
    if (!activeTab.value)
      return;
    const state = getTabState(activeTab.value);
    state.scrollY = getScrollPosition();
  }

  function restoreScroll(tabId: TabId) {
    const state = getTabState(tabId);
    nextTick(() => {
      feedScrollTo(state.scrollY);
    });
  }

  function switchTab(tabId: TabId, navigate: (path: string) => void) {
    if (tabId === 'new-post')
      return;

    if (tabId === activeTab.value) {
      // Same tab tap
      if (!isAtTabRoot.value) {
        // Pop to root
        const root = getTabRoot(tabId);
        const state = getTabState(tabId);
        state.lastPath = root;
        state.scrollY = 0;
        isTabSwitching.value = true;
        navigate(root);
      }
      else {
        // Already at root — smooth scroll to top
        feedScrollTo(0, 'smooth');
      }
      return;
    }

    // Different tab
    saveCurrentScroll();
    activeTab.value = tabId;

    const state = getTabState(tabId);
    isTabSwitching.value = true;
    navigate(state.lastPath);
    restoreScroll(tabId);
  }

  function isChildOfTab(path: string, tabId: TabId): boolean {
    const root = getTabRoot(tabId);
    if (root === '/') {
      // Home tab: only track paths that are post details (/@user/id)
      // or the root itself — NOT /favourites, /saved, /settings, etc.
      return path === '/' || path.startsWith('/@');
    }
    return path === root || path.startsWith(`${root}/`);
  }

  function onRouteChange(toPath: string, _fromPath: string) {
    if (isTabSwitching.value) {
      isTabSwitching.value = false;
      return;
    }

    // Check if the new path matches a tab root
    const allTabIds: TabId[] = ['home', 'search', 'messages', 'notifications', 'profile'];
    const matchedTab = allTabIds.find(id => getTabRoot(id) === toPath);

    if (matchedTab) {
      activeTab.value = matchedTab;
      const state = getTabState(matchedTab);
      state.lastPath = toPath;
    }
    else if (activeTab.value && isChildOfTab(toPath, activeTab.value)) {
      // Detail page within current tab (e.g., /messages/123 within messages tab)
      const state = getTabState(activeTab.value);
      state.lastPath = toPath;
    }
    else {
      // Non-tab pages (/favourites, /saved, /settings, /explore, /tags)
      // Clear active tab so no bottom nav item is highlighted
      activeTab.value = null;
    }
  }

  return {
    activeTab: computed(() => activeTab.value),
    isAtTabRoot,
    canGoBack,
    isTabSwitching: computed(() => isTabSwitching.value),
    switchTab,
    onRouteChange,
    saveCurrentScroll,
    restoreScroll,
  };
}

// Export for testing — allows resetting module-level state
export function _resetTabNavigationState() {
  activeTab.value = 'home';
  tabStates.value.clear();
  isTabSwitching.value = false;
}
