import type { PlatformAdapter } from '../src/platform';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlatformAdapter, setPlatformAdapter } from '../src/platform';

describe('platform adapter', () => {
  describe('default web adapter', () => {
    const adapter = getPlatformAdapter();

    afterEach(() => {
      localStorage.clear();
    });

    it('isNative returns false', () => {
      expect(adapter.isNative()).toBe(false);
    });

    it('secureGet returns null for missing key', async () => {
      const value = await adapter.secureGet('nonexistent');
      expect(value).toBeNull();
    });

    it('secureSet and secureGet round-trip', async () => {
      await adapter.secureSet('test-key', 'test-value');
      const value = await adapter.secureGet('test-key');
      expect(value).toBe('test-value');
    });

    it('secureRemove deletes key', async () => {
      await adapter.secureSet('test-key', 'test-value');
      await adapter.secureRemove('test-key');
      const value = await adapter.secureGet('test-key');
      expect(value).toBeNull();
    });

    it('secureSet stores in localStorage', async () => {
      await adapter.secureSet('my-key', 'my-value');
      expect(localStorage.getItem('my-key')).toBe('my-value');
    });
  });

  describe('setPlatformAdapter', () => {
    // Save the original adapter so we can restore it
    const originalAdapter = getPlatformAdapter();

    afterEach(() => {
      setPlatformAdapter(originalAdapter);
    });

    it('replaces the adapter', () => {
      const custom: PlatformAdapter = {
        secureGet: vi.fn(async () => 'custom-value'),
        secureSet: vi.fn(),
        secureRemove: vi.fn(),
        openUrl: vi.fn(),
        isNative: () => true,
      };

      setPlatformAdapter(custom);
      const current = getPlatformAdapter();

      expect(current).toBe(custom);
      expect(current.isNative()).toBe(true);
    });

    it('custom adapter is used by subsequent calls', async () => {
      const store = new Map<string, string>();
      const custom: PlatformAdapter = {
        secureGet: vi.fn(async (key: string) => store.get(key) ?? null),
        secureSet: vi.fn(async (key: string, val: string) => { store.set(key, val); }),
        secureRemove: vi.fn(async (key: string) => { store.delete(key); }),
        openUrl: vi.fn(),
        isNative: () => true,
      };

      setPlatformAdapter(custom);

      const adapter = getPlatformAdapter();
      await adapter.secureSet('k', 'v');
      const result = await adapter.secureGet('k');
      expect(result).toBe('v');
      expect(custom.secureSet).toHaveBeenCalledWith('k', 'v');
    });
  });
});
