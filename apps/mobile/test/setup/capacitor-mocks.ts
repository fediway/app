import { vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
    isPluginAvailable: vi.fn(() => true),
  },
  registerPlugin: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    getInfo: vi.fn(),
    getState: vi.fn(),
    exitApp: vi.fn(),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
    vibrate: vi.fn(),
    selectionStart: vi.fn(),
    selectionChanged: vi.fn(),
    selectionEnd: vi.fn(),
  },
}));

vi.mock('@capacitor/keyboard', () => ({
  Keyboard: {
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    setAccessoryBarVisible: vi.fn(),
    setScroll: vi.fn(),
    setStyle: vi.fn(),
    setResizeMode: vi.fn(),
  },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: vi.fn(),
    setBackgroundColor: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    getInfo: vi.fn(),
    setOverlaysWebView: vi.fn(),
  },
}));
