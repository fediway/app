import type { PlatformAdapter } from '../../src/platform';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppLifecycle } from '../../src/composables/useAppLifecycle';
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

describe('useAppLifecycle', () => {
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    setPlatformAdapter(mockAdapter);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('isActive state', () => {
    it('starts as true', () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      expect(lifecycle.isActive.value).toBe(true);
    });

    it('becomes false on handlePause', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      await lifecycle.handlePause();
      expect(lifecycle.isActive.value).toBe(false);
    });

    it('becomes true again on handleResume', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      await lifecycle.handlePause();
      await lifecycle.handleResume();
      expect(lifecycle.isActive.value).toBe(true);
    });
  });

  describe('pause callbacks', () => {
    it('calls registered pause callbacks on handlePause', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const cb = vi.fn();
      lifecycle.onPause(cb);

      await lifecycle.handlePause();
      expect(cb).toHaveBeenCalledOnce();
    });

    it('calls multiple pause callbacks in order', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const order: number[] = [];
      lifecycle.onPause(() => {
        order.push(1);
      });
      lifecycle.onPause(() => {
        order.push(2);
      });
      lifecycle.onPause(() => {
        order.push(3);
      });

      await lifecycle.handlePause();
      expect(order).toEqual([1, 2, 3]);
    });

    it('awaits async pause callbacks', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      let completed = false;
      lifecycle.onPause(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        completed = true;
      });

      const promise = lifecycle.handlePause();
      await vi.advanceTimersByTimeAsync(10);
      await promise;
      expect(completed).toBe(true);
    });

    it('unregister function removes callback', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const cb = vi.fn();
      const unregister = lifecycle.onPause(cb);

      unregister();
      await lifecycle.handlePause();
      expect(cb).not.toHaveBeenCalled();
    });

    it('continues running remaining callbacks when one throws', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const before = vi.fn();
      const after = vi.fn();

      lifecycle.onPause(before);
      lifecycle.onPause(() => {
        throw new Error('boom');
      });
      lifecycle.onPause(after);

      await lifecycle.handlePause();
      expect(before).toHaveBeenCalledOnce();
      expect(after).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledOnce();
      consoleSpy.mockRestore();
    });
  });

  describe('resume callbacks', () => {
    it('calls registered resume callbacks on handleResume', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const cb = vi.fn();
      lifecycle.onResume(cb);

      await lifecycle.handleResume();
      expect(cb).toHaveBeenCalledOnce();
    });

    it('unregister function removes callback', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const cb = vi.fn();
      const unregister = lifecycle.onResume(cb);

      unregister();
      await lifecycle.handleResume();
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('saveState', () => {
    it('persists state with timestamp to platform storage', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      await lifecycle.saveState({ route: '/feed', tab: 'home' });

      const raw = mockAdapter.store.get('fediway_app_state');
      expect(raw).toBeDefined();
      const parsed = JSON.parse(raw!);
      expect(parsed.route).toBe('/feed');
      expect(parsed.tab).toBe('home');
      expect(parsed.timestamp).toBe(Date.now());
    });

    it('overwrites previous state on second save', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      await lifecycle.saveState({ route: '/feed' });
      await lifecycle.saveState({ route: '/profile' });

      const raw = mockAdapter.store.get('fediway_app_state');
      const parsed = JSON.parse(raw!);
      expect(parsed.route).toBe('/profile');
    });
  });

  describe('restoreState', () => {
    it('returns saved state within restore window', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      // Save state 10 minutes ago
      const savedTime = Date.now() - 10 * 60 * 1000;
      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: savedTime,
        route: '/profile',
        tab: 'search',
      }));

      const result = await lifecycle.restoreState();
      expect(result).not.toBeNull();
      expect(result!.route).toBe('/profile');
      expect(result!.tab).toBe('search');
    });

    it('returns null for expired state (beyond 30-min window)', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      // Save state 31 minutes ago
      const savedTime = Date.now() - 31 * 60 * 1000;
      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: savedTime,
        route: '/settings',
      }));

      const result = await lifecycle.restoreState();
      expect(result).toBeNull();
    });

    it('returns null when no state saved', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      const result = await lifecycle.restoreState();
      expect(result).toBeNull();
    });

    it('cleans up storage after restoring', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 5 * 60 * 1000,
        route: '/feed',
      }));

      await lifecycle.restoreState();
      expect(mockAdapter.store.has('fediway_app_state')).toBe(false);
    });

    it('cleans up storage even for expired state', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 60 * 60 * 1000,
        route: '/old',
      }));

      await lifecycle.restoreState();
      expect(mockAdapter.store.has('fediway_app_state')).toBe(false);
    });

    it('handles corrupted storage gracefully', async () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());

      mockAdapter.store.set('fediway_app_state', 'not-json{{{');

      const result = await lifecycle.restoreState();
      expect(result).toBeNull();
      expect(mockAdapter.store.has('fediway_app_state')).toBe(false);
    });

    it('is single-use — second call returns null', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 5 * 60 * 1000,
        route: '/feed',
      }));

      const first = await lifecycle.restoreState();
      expect(first).not.toBeNull();

      const second = await lifecycle.restoreState();
      expect(second).toBeNull();
    });

    it('returns state at exactly the restore window boundary', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      // Exactly 30 minutes — age === restoreWindow, uses > so this is still valid
      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 30 * 60 * 1000,
        route: '/feed',
      }));

      const result = await lifecycle.restoreState();
      expect(result).not.toBeNull();
      expect(result!.route).toBe('/feed');
    });

    it('rejects state 1ms beyond the restore window', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle());

      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 30 * 60 * 1000 - 1,
        route: '/feed',
      }));

      const result = await lifecycle.restoreState();
      expect(result).toBeNull();
    });

    it('respects custom restore window', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
      const [lifecycle] = withSetup(() => useAppLifecycle({ restoreWindow: 5 * 60 * 1000 }));

      // 6 minutes ago — outside 5-min window
      mockAdapter.store.set('fediway_app_state', JSON.stringify({
        timestamp: Date.now() - 6 * 60 * 1000,
        route: '/feed',
      }));

      const result = await lifecycle.restoreState();
      expect(result).toBeNull();
    });
  });

  describe('appRestoredResult', () => {
    it('starts as null', () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      expect(lifecycle.appRestoredResult.value).toBeNull();
    });

    it('can be set by the consumer', () => {
      const [lifecycle] = withSetup(() => useAppLifecycle());
      lifecycle.appRestoredResult.value = {
        pluginId: 'Camera',
        methodName: 'getPhoto',
        data: { path: '/tmp/photo.jpg' },
      };
      expect(lifecycle.appRestoredResult.value.pluginId).toBe('Camera');
    });
  });

  describe('full lifecycle round-trip', () => {
    it('save on pause → restore on cold start', async () => {
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));

      // Simulate running app: save on pause
      const [lifecycle1] = withSetup(() => useAppLifecycle());
      lifecycle1.onPause(async () => {
        await lifecycle1.saveState({ route: '/demo/feed', tab: 'feed' });
      });
      await lifecycle1.handlePause();

      // Simulate cold start 5 minutes later
      vi.setSystemTime(new Date('2025-06-15T12:05:00Z'));
      const [lifecycle2] = withSetup(() => useAppLifecycle());
      const restored = await lifecycle2.restoreState();

      expect(restored).not.toBeNull();
      expect(restored!.route).toBe('/demo/feed');
      expect(restored!.tab).toBe('feed');
    });
  });
});
