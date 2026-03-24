import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetDataModeState, useDataMode } from '../useDataMode';

beforeEach(() => {
  _resetDataModeState();
  localStorage.clear();
  vi.stubEnv('VITE_API_MODE', '');
});

afterEach(() => {
  _resetDataModeState();
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe('useDataMode', () => {
  describe('initial mode', () => {
    it('defaults to mock when nothing is set', () => {
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });

    it('reads VITE_API_MODE=live from env', () => {
      vi.stubEnv('VITE_API_MODE', 'live');
      const { mode } = useDataMode();
      expect(mode.value).toBe('live');
    });

    it('reads VITE_API_MODE=mock from env', () => {
      vi.stubEnv('VITE_API_MODE', 'mock');
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });

    it('falls back to localStorage when env var not set', () => {
      localStorage.setItem('fediway-data-mode', 'live');
      const { mode } = useDataMode();
      expect(mode.value).toBe('live');
    });

    it('env var takes priority over localStorage', () => {
      localStorage.setItem('fediway-data-mode', 'live');
      vi.stubEnv('VITE_API_MODE', 'mock');
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });

    it('treats unknown localStorage value as mock', () => {
      localStorage.setItem('fediway-data-mode', 'garbage');
      const { mode } = useDataMode();
      expect(mode.value).toBe('mock');
    });
  });

  describe('setMode', () => {
    it('updates reactive mode value', () => {
      const { mode, setMode } = useDataMode();

      expect(mode.value).toBe('mock');
      setMode('live');
      expect(mode.value).toBe('live');
    });

    it('persists to localStorage', () => {
      const { setMode } = useDataMode();

      setMode('live');
      expect(localStorage.getItem('fediway-data-mode')).toBe('live');

      setMode('mock');
      expect(localStorage.getItem('fediway-data-mode')).toBe('mock');
    });
  });

  describe('shared state', () => {
    it('multiple useDataMode() calls share the same ref', () => {
      const a = useDataMode();
      const b = useDataMode();

      a.setMode('live');
      expect(b.mode.value).toBe('live');
    });

    it('initializes only once (subsequent calls skip loadFromStorage)', () => {
      localStorage.setItem('fediway-data-mode', 'live');

      const first = useDataMode();
      expect(first.mode.value).toBe('live');

      // Change localStorage after init — should not affect mode
      localStorage.setItem('fediway-data-mode', 'mock');
      const second = useDataMode();
      expect(second.mode.value).toBe('live');
    });
  });
});
