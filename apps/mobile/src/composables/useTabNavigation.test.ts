import { describe, expect, it, vi } from 'vitest';

vi.mock('../stores/navigation', () => ({
  useNavigationStore: vi.fn(() => ({
    tabItems: [
      { id: 'home', to: '/' },
      { id: 'search', to: '/search' },
      { id: 'notifications', to: '/notifications' },
      { id: 'profile', to: '/@alice' },
    ],
  })),
}));

const { useTabNavigation } = await import('./useTabNavigation');

describe('useTabNavigation', () => {
  it('isAtTabRoot reflects current path vs tab root', () => {
    const { isAtTabRoot, onRouteChange } = useTabNavigation();

    // Navigate back to home root
    onRouteChange('/');
    expect(isAtTabRoot.value).toBe(true);

    // Navigate to a deep path
    onRouteChange('/status/123');
    expect(isAtTabRoot.value).toBe(false);

    // Navigate back to root
    onRouteChange('/');
    expect(isAtTabRoot.value).toBe(true);
  });

  it('canGoBack is inverse of isAtTabRoot', () => {
    const { canGoBack, onRouteChange } = useTabNavigation();
    onRouteChange('/');
    expect(canGoBack.value).toBe(false);

    onRouteChange('/status/123');
    expect(canGoBack.value).toBe(true);
  });

  it('onRouteChange to tab root switches active tab', () => {
    const { activeTab, onRouteChange } = useTabNavigation();
    onRouteChange('/search');
    expect(activeTab.value).toBe('search');

    onRouteChange('/notifications');
    expect(activeTab.value).toBe('notifications');

    onRouteChange('/');
    expect(activeTab.value).toBe('home');
  });

  it('switchTab calls navigate with target path', () => {
    const navigate = vi.fn();
    const { switchTab, onRouteChange } = useTabNavigation();

    // Ensure we're on home
    onRouteChange('/');

    // Switch to search
    switchTab('search', navigate);
    expect(navigate).toHaveBeenCalledWith('/search');
  });

  it('tapping active tab at non-root pops to root', () => {
    const navigate = vi.fn();
    const { switchTab, onRouteChange } = useTabNavigation();

    onRouteChange('/');
    onRouteChange('/status/123');

    // Tap home again while on a deep page
    switchTab('home', navigate);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('tapping active tab at root scrolls to top', () => {
    const navigate = vi.fn();
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { switchTab, onRouteChange } = useTabNavigation();

    // Make sure we're at home root
    onRouteChange('/');

    switchTab('home', navigate);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollSpy.mockRestore();
  });

  it('ignores new-post tab', () => {
    const navigate = vi.fn();
    const { switchTab } = useTabNavigation();
    switchTab('new-post', navigate);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('remembers last path per tab', () => {
    const navigate = vi.fn();
    const { switchTab, onRouteChange } = useTabNavigation();

    // Go to search, then a deep page
    onRouteChange('/search');
    onRouteChange('/status/456');

    // Switch to home
    switchTab('home', navigate);

    // Switch back to search — should restore deep path
    navigate.mockClear();
    switchTab('search', navigate);
    expect(navigate).toHaveBeenCalledWith('/status/456');
  });

  it('isTabSwitching resets after onRouteChange', () => {
    const navigate = vi.fn();
    const { isTabSwitching, switchTab, onRouteChange } = useTabNavigation();

    onRouteChange('/');

    // switchTab sets isTabSwitching = true
    switchTab('search', navigate);
    expect(isTabSwitching.value).toBe(true);

    // onRouteChange should reset it
    onRouteChange('/search');
    expect(isTabSwitching.value).toBe(false);
  });

  it('non-tab deep path tracks on current tab', () => {
    const { activeTab, canGoBack, onRouteChange } = useTabNavigation();

    onRouteChange('/');
    expect(activeTab.value).toBe('home');

    // Navigate to a path that doesn't match any tab root
    onRouteChange('/settings');
    expect(activeTab.value).toBe('home');
    expect(canGoBack.value).toBe(true);
  });

  it('tapping active tab from deep path resets lastPath to root', () => {
    const navigate = vi.fn();
    const { switchTab, onRouteChange, isAtTabRoot } = useTabNavigation();

    onRouteChange('/');
    onRouteChange('/status/789');

    // Tap home — should pop to root
    switchTab('home', navigate);
    // After the switchTab, isTabSwitching is true, simulate the route change
    onRouteChange('/');

    expect(isAtTabRoot.value).toBe(true);
  });
});
