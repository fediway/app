import { vi } from 'vitest';

export const App = {
  addListener: vi.fn(),
  removeAllListeners: vi.fn(),
  getInfo: vi.fn(),
  getState: vi.fn(),
  exitApp: vi.fn(),
  minimizeApp: vi.fn(),
};
