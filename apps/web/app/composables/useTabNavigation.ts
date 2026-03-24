import { computed, nextTick, ref } from 'vue';
import { useFeedScroll } from '~/composables/useFeedScroll';
import { useNavigationStore } from '~/stores/navigation';

export type TabId = 'home' | 'search' | 'new-post' | 'notifications' | 'profile';

interface TabState {
  lastPath: string;
  scrollY: number;
}

const TAB_ROOTS: Record<Exclude<TabId, 'new-post' | 'profile'>, string> = {
  home: '/',
  search: '/search',
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
    const state = getTabState(activeTab.value);
    return state.lastPath === getTabRoot(activeTab.value);
  });

  const canGoBack = computed(() => !isAtTabRoot.value);

  function saveCurrentScroll() {
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

  function onRouteChange(toPath: string, _fromPath: string) {
    if (isTabSwitching.value) {
      isTabSwitching.value = false;
      return;
    }

    // Check if the new path matches a tab root
    const allTabIds: TabId[] = ['home', 'search', 'notifications', 'profile'];
    const matchedTab = allTabIds.find(id => getTabRoot(id) === toPath);

    if (matchedTab) {
      activeTab.value = matchedTab;
      const state = getTabState(matchedTab);
      state.lastPath = toPath;
    }
    else {
      // Detail page within current tab
      const state = getTabState(activeTab.value);
      state.lastPath = toPath;
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
