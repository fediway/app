import type { PlatformAdapter } from '@repo/api';

/**
 * Capacitor platform adapter — uses native secure storage and in-app browser.
 * Dynamic imports so this module doesn't crash in test/web environments.
 */
export class CapacitorPlatformAdapter implements PlatformAdapter {
  async secureGet(key: string): Promise<string | null> {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    return await SecureStorage.getItem(key);
  }

  async secureSet(key: string, value: string): Promise<void> {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    await SecureStorage.setItem(key, value);
  }

  async secureRemove(key: string): Promise<void> {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    await SecureStorage.removeItem(key);
  }

  async openUrl(url: string): Promise<void> {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  }

  isNative(): boolean {
    return true;
  }
}
