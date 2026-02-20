import type { PlatformAdapter } from '../../src/platform';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { _resetDarkMode, useDarkMode } from '../../src/composables/useDarkMode';
import { setPlatformAdapter } from '../../src/platform';
import { withSetup } from '../utils/withSetup';

function createMockAdapter(): PlatformAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    secureGet: vi.fn(async (key: string) => store.get(key) ?? null),
    secureSet: vi.fn(async (key: string, val: string) => { store.set(key, val); }),
    secureRemove: vi.fn(async (key: string) => { store.delete(key); }),
    openUrl: vi.fn(),
    isNative: () => true,
  };
}

// Helper to create a mock matchMedia that can fire change events
type ChangeListener = (e: { matches: boolean }) => void;
function createMockMatchMedia(initialMatches: boolean) {
  const listeners: ChangeListener[] = [];
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_event: string, cb: ChangeListener) => {
      listeners.push(cb);
    }),
    removeEventListener: vi.fn(),
  };
  function fireChange(matches: boolean) {
    mql.matches = matches;
    for (const cb of listeners) {
      cb({ matches });
    }
  }
  return { mql, fireChange };
}

describe('useDarkMode', () => {
  let mockAdapter: ReturnType<typeof createMockAdapter>;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    _resetDarkMode();
    mockAdapter = createMockAdapter();
    setPlatformAdapter(mockAdapter);
    originalMatchMedia = window.matchMedia;
    // Default: system prefers light
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);
    // Clean up any .dark class from previous tests
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  describe('defaults', () => {
    it('theme starts as "system"', () => {
      const [dm] = withSetup(() => useDarkMode());
      expect(dm.theme.value).toBe('system');
    });

    it('isDark reflects system preference (light)', () => {
      const { mql } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());
      expect(dm.isDark.value).toBe(false);
    });

    it('isDark reflects system preference (dark)', () => {
      const { mql } = createMockMatchMedia(true);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());
      expect(dm.isDark.value).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('"dark" makes isDark true', async () => {
      const [dm] = withSetup(() => useDarkMode());
      await dm.setTheme('dark');
      expect(dm.isDark.value).toBe(true);
      expect(dm.theme.value).toBe('dark');
    });

    it('"light" makes isDark false', async () => {
      const [dm] = withSetup(() => useDarkMode());
      await dm.setTheme('light');
      expect(dm.isDark.value).toBe(false);
      expect(dm.theme.value).toBe('light');
    });

    it('"system" delegates to matchMedia', async () => {
      const { mql } = createMockMatchMedia(true);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());

      await dm.setTheme('dark');
      await dm.setTheme('system');
      expect(dm.isDark.value).toBe(true); // system prefers dark
    });

    it('"system" with light system preference → isDark false', async () => {
      const { mql } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());

      await dm.setTheme('dark');
      await dm.setTheme('system');
      expect(dm.isDark.value).toBe(false);
    });
  });

  describe('class toggling', () => {
    it('adds .dark class when isDark is true', async () => {
      const [dm] = withSetup(() => useDarkMode());
      await dm.setTheme('dark');
      await nextTick();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes .dark class when isDark is false', async () => {
      const [dm] = withSetup(() => useDarkMode());
      await dm.setTheme('dark');
      await nextTick();
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      await dm.setTheme('light');
      await nextTick();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('no .dark class on initial light system preference', () => {
      const { mql } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      withSetup(() => useDarkMode());
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('.dark class present on initial dark system preference', () => {
      const { mql } = createMockMatchMedia(true);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      withSetup(() => useDarkMode());
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('persistence', () => {
    it('setTheme calls secureSet with storage key', async () => {
      const [dm] = withSetup(() => useDarkMode());
      await dm.setTheme('dark');
      expect(mockAdapter.secureSet).toHaveBeenCalledWith('fediway_theme', 'dark');
    });

    it('init calls secureGet and applies saved value', async () => {
      mockAdapter.store.set('fediway_theme', 'dark');
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(mockAdapter.secureGet).toHaveBeenCalledWith('fediway_theme');
      expect(dm.theme.value).toBe('dark');
      expect(dm.isDark.value).toBe(true);
    });

    it('init with "light" stored value', async () => {
      mockAdapter.store.set('fediway_theme', 'light');
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(dm.theme.value).toBe('light');
      expect(dm.isDark.value).toBe(false);
    });

    it('init with "system" stored value', async () => {
      mockAdapter.store.set('fediway_theme', 'system');
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(dm.theme.value).toBe('system');
    });
  });

  describe('system preference changes', () => {
    it('updates isDark when system preference changes in "system" mode', async () => {
      const { mql, fireChange } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());

      expect(dm.isDark.value).toBe(false);

      fireChange(true);
      expect(dm.isDark.value).toBe(true);
    });

    it('toggles .dark class on system preference change', async () => {
      const { mql, fireChange } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      withSetup(() => useDarkMode());

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      fireChange(true);
      await nextTick();
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireChange(false);
      await nextTick();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('system preference changes ignored when theme is explicit', async () => {
      const { mql, fireChange } = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mql);
      const [dm] = withSetup(() => useDarkMode());

      await dm.setTheme('light');
      fireChange(true); // system goes dark
      expect(dm.isDark.value).toBe(false); // still light because explicitly set
    });
  });

  describe('invalid stored values', () => {
    it('init with garbage in storage stays at "system"', async () => {
      mockAdapter.store.set('fediway_theme', 'garbage-value');
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(dm.theme.value).toBe('system');
    });

    it('init with empty string stays at "system"', async () => {
      mockAdapter.store.set('fediway_theme', '');
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(dm.theme.value).toBe('system');
    });

    it('init with no saved preference stays at "system"', async () => {
      const [dm] = withSetup(() => useDarkMode());

      await dm.init();
      expect(dm.theme.value).toBe('system');
    });
  });
});
