import { shallowRef } from 'vue';
import { getPlatformAdapter } from '../platform';

const STORAGE_KEY = 'fediway_app_state';
const DEFAULT_RESTORE_WINDOW = 30 * 60 * 1000; // 30 minutes

export interface SavedAppState {
  timestamp: number;
  route?: string;
  tab?: string;
  [key: string]: unknown;
}

export interface AppRestoredResult {
  pluginId: string;
  methodName: string;
  data?: unknown;
}

export interface UseAppLifecycleOptions {
  /** Max age in ms for state restoration. Defaults to 30 minutes. */
  restoreWindow?: number;
}

type LifecycleCallback = () => void | Promise<void>;

/**
 * Platform-agnostic app lifecycle management.
 *
 * The composable provides the logic — the consumer wires platform events:
 * - Native: `App.addListener('pause', () => lifecycle.handlePause())`
 * - Web: `document.addEventListener('visibilitychange', ...)`
 *
 * Manages:
 * - Reactive `isActive` state
 * - Pause/resume callback registration
 * - State persistence with timestamp-based cold start detection
 * - Camera `appRestoredResult` forwarding (Android)
 */
export function useAppLifecycle(options?: UseAppLifecycleOptions) {
  const restoreWindow = options?.restoreWindow ?? DEFAULT_RESTORE_WINDOW;
  const isActive = shallowRef(true);
  const appRestoredResult = shallowRef<AppRestoredResult | null>(null);

  const pauseCallbacks: LifecycleCallback[] = [];
  const resumeCallbacks: LifecycleCallback[] = [];

  /**
   * Register a callback to run when the app pauses (backgrounded).
   * Returns an unregister function.
   */
  function onPause(callback: LifecycleCallback): () => void {
    pauseCallbacks.push(callback);
    return () => {
      const idx = pauseCallbacks.indexOf(callback);
      if (idx >= 0)
        pauseCallbacks.splice(idx, 1);
    };
  }

  /**
   * Register a callback to run when the app resumes (foregrounded).
   * Returns an unregister function.
   */
  function onResume(callback: LifecycleCallback): () => void {
    resumeCallbacks.push(callback);
    return () => {
      const idx = resumeCallbacks.indexOf(callback);
      if (idx >= 0)
        resumeCallbacks.splice(idx, 1);
    };
  }

  /**
   * Call when the app is paused/backgrounded. Runs all registered pause callbacks.
   * Errors in individual callbacks are caught so one failure doesn't block the rest.
   */
  async function handlePause(): Promise<void> {
    isActive.value = false;
    for (const cb of pauseCallbacks) {
      try {
        await cb();
      }
      catch (err) {
        console.error('[useAppLifecycle] pause callback error:', err);
      }
    }
  }

  /**
   * Call when the app resumes/foregrounds. Runs all registered resume callbacks.
   * Errors in individual callbacks are caught so one failure doesn't block the rest.
   */
  async function handleResume(): Promise<void> {
    isActive.value = true;
    for (const cb of resumeCallbacks) {
      try {
        await cb();
      }
      catch (err) {
        console.error('[useAppLifecycle] resume callback error:', err);
      }
    }
  }

  /**
   * Persist app state for later restoration. Called from a pause callback.
   */
  async function saveState(state: Omit<SavedAppState, 'timestamp'>): Promise<void> {
    const saved: SavedAppState = { ...state, timestamp: Date.now() };
    await getPlatformAdapter().secureSet(STORAGE_KEY, JSON.stringify(saved));
  }

  /**
   * Restore previously saved state if within the restore window.
   * Returns null if no state saved or if it's too old.
   * Cleans up storage after reading.
   */
  async function restoreState(): Promise<SavedAppState | null> {
    const raw = await getPlatformAdapter().secureGet(STORAGE_KEY);
    if (!raw)
      return null;

    let state: SavedAppState;
    try {
      state = JSON.parse(raw) as SavedAppState;
    }
    catch {
      await getPlatformAdapter().secureRemove(STORAGE_KEY);
      return null;
    }

    // Always clean up — state is single-use
    await getPlatformAdapter().secureRemove(STORAGE_KEY);

    const age = Date.now() - state.timestamp;
    if (age > restoreWindow) {
      return null;
    }

    return state;
  }

  return {
    /** Whether the app is currently in the foreground */
    isActive,
    /** Result from Android activity restoration (e.g. Camera killed by OS) */
    appRestoredResult,
    /** Register a pause callback. Returns unregister function. */
    onPause,
    /** Register a resume callback. Returns unregister function. */
    onResume,
    /** Notify the composable that the app was paused */
    handlePause,
    /** Notify the composable that the app was resumed */
    handleResume,
    /** Persist state for cold start restoration */
    saveState,
    /** Restore state if within the restore window */
    restoreState,
  };
}
