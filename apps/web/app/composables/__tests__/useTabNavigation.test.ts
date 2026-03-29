import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { _resetTabNavigationState, useTabNavigation } from '../useTabNavigation';

const mockStore = {
  mobileFooterItems: [
    { id: 'home', label: 'Home', icon: 'home', to: '/' },
    { id: 'search', label: 'Search', icon: 'search', to: '/search' },
    { id: 'new-post', label: 'New Post', icon: 'new-post', to: '/new' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', to: '/notifications' },
    { id: 'profile', label: 'Profile', icon: 'profile', to: '/@jane@social.network' },
  ],
};

vi.mock('~/stores/navigation', () => ({
  useNavigationStore: () => mockStore,
}));

// Mock window.scrollTo
const scrollToMock = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true });
Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });

let tab: ReturnType<typeof useTabNavigation>;
let navigateMock: ReturnType<typeof vi.fn<(path: string) => void>>;

beforeEach(() => {
  _resetTabNavigationState();
  tab = useTabNavigation();
  navigateMock = vi.fn<(path: string) => void>();
  scrollToMock.mockClear();
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
});

describe('useTabNavigation', () => {
  it('starts with home tab active', () => {
    expect(tab.activeTab.value).toBe('home');
  });

  it('switchTab to different tab navigates to its root', () => {
    tab.switchTab('search', navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('/search');
    expect(tab.activeTab.value).toBe('search');
  });

  it('switchTab restores lastPath when switching back', () => {
    // Navigate to search, then simulate visiting a detail page within search
    tab.switchTab('search', navigateMock);
    tab.onRouteChange('/search', '/');
    tab.onRouteChange('/search/detail', '/search');

    // Switch to home
    tab.switchTab('home', navigateMock);

    // Switch back to search — should go to last visited path
    navigateMock.mockClear();
    tab.switchTab('search', navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('/search/detail');
  });

  it('same-tab tap pops to root when on sub-page', () => {
    // Go to search tab
    tab.switchTab('search', navigateMock);
    tab.onRouteChange('/search', '/');

    // Simulate navigating to detail within search
    tab.onRouteChange('/search/detail', '/search');

    // Tap search again
    navigateMock.mockClear();
    tab.switchTab('search', navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('/search');
  });

  it('same-tab tap at root scrolls to top', () => {
    // Already at home root
    tab.switchTab('home', navigateMock);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('new-post tab is a no-op', () => {
    tab.switchTab('new-post', navigateMock);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(tab.activeTab.value).toBe('home');
  });

  it('onRouteChange detects tab root and sets activeTab', () => {
    tab.onRouteChange('/notifications', '/');
    expect(tab.activeTab.value).toBe('notifications');
  });

  it('onRouteChange updates lastPath for detail pages', () => {
    // Start at home, navigate to a status detail
    tab.onRouteChange('/@jane/123', '/');
    expect(tab.activeTab.value).toBe('home'); // Still in home tab

    // Switch away and back — should restore to the detail page
    tab.switchTab('search', navigateMock);
    navigateMock.mockClear();
    tab.switchTab('home', navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('/@jane/123');
  });

  it('tab-switch-triggered navigation does not double-update', () => {
    tab.switchTab('search', navigateMock);
    // Simulate the route change that Nuxt triggers after navigation
    tab.onRouteChange('/search', '/');
    // activeTab should still be search, not re-set
    expect(tab.activeTab.value).toBe('search');
  });

  it('scroll save/restore round-trips correctly', async () => {
    // Simulate being scrolled down on home
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    tab.saveCurrentScroll();

    // Switch to search
    tab.switchTab('search', navigateMock);

    // Switch back to home
    scrollToMock.mockClear();
    tab.switchTab('home', navigateMock);
    // restoreScroll calls window.scrollTo after nextTick
    await nextTick();
    expect(scrollToMock).toHaveBeenCalledWith({ top: 500, behavior: undefined });
  });

  it('isAtTabRoot is true at tab root', () => {
    expect(tab.isAtTabRoot.value).toBe(true);
  });

  it('canGoBack is true when not at tab root', () => {
    tab.onRouteChange('/@jane/123', '/');
    expect(tab.canGoBack.value).toBe(true);
    expect(tab.isAtTabRoot.value).toBe(false);
  });

  it('profile tab uses dynamic root URL', () => {
    tab.switchTab('profile', navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('/@jane@social.network');
    expect(tab.activeTab.value).toBe('profile');
  });

  it('non-tab routes clear activeTab', () => {
    tab.onRouteChange('/settings', '/');
    expect(tab.activeTab.value).toBeNull();

    tab.onRouteChange('/favourites', '/settings');
    expect(tab.activeTab.value).toBeNull();
  });

  it('onRouteChange detects profile tab root', () => {
    tab.onRouteChange('/@jane@social.network', '/');
    expect(tab.activeTab.value).toBe('profile');
  });

  it('same-tab pop-to-root resets scroll to 0', async () => {
    // Go to search, then a detail page
    tab.switchTab('search', navigateMock);
    tab.onRouteChange('/search', '/');
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
    tab.saveCurrentScroll();
    tab.onRouteChange('/search/detail', '/search');

    // Tap search again — should pop to root with scroll 0
    scrollToMock.mockClear();
    tab.switchTab('search', navigateMock);
    await nextTick();
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: undefined });
  });

  it('isTabSwitching is cleared after onRouteChange', () => {
    tab.switchTab('search', navigateMock);
    expect(tab.isTabSwitching.value).toBe(true);
    tab.onRouteChange('/search', '/');
    expect(tab.isTabSwitching.value).toBe(false);
  });
});
