import type { ThemePreference } from '@repo/api';
import type { MediaVisibility } from '@repo/ui';
import { useDarkMode } from '@repo/api';
import { useMediaPreferences } from '@repo/ui';
import { reactive, watch } from 'vue';

export interface AppSettings {
  privacy: {
    defaultVisibility: 'public' | 'unlisted' | 'private';
    sensitiveMedia: boolean;
  };
  media: {
    mediaVisibility: MediaVisibility;
    autoplayGifs: boolean;
    reduceMotion: boolean;
  };
}

const STORAGE_KEY = 'fediway-settings';

function getDefaults(): AppSettings {
  return {
    privacy: {
      defaultVisibility: 'public',
      sensitiveMedia: false,
    },
    media: {
      mediaVisibility: 'default',
      autoplayGifs: true,
      reduceMotion: false,
    },
  };
}

function loadFromStorage(): AppSettings {
  if (typeof window === 'undefined')
    return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaults();
      // Deep merge to preserve nested defaults when new keys are added
      return {
        privacy: { ...defaults.privacy, ...parsed.privacy },
        media: { ...defaults.media, ...parsed.media },
      };
    }
  }
  catch { /* ignore */ }
  return getDefaults();
}

// Module-level state — deferred initialization
const settings = reactive<AppSettings>(getDefaults());
let initialized = false;

/**
 * Sync persisted settings → global UI composable refs.
 * Called once on init and whenever media settings change.
 */
function syncMediaPreferences() {
  const prefs = useMediaPreferences();
  prefs.setMediaVisibility(settings.media.mediaVisibility);
  prefs.setAutoplayGifs(settings.media.autoplayGifs);
  prefs.setReduceMotion(settings.media.reduceMotion);
}

export function useSettings() {
  if (!initialized) {
    Object.assign(settings, loadFromStorage());

    if (typeof window !== 'undefined') {
      watch(settings, (val) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      }, { deep: true });
    }

    // Sync media preferences to UI composable on init
    syncMediaPreferences();

    initialized = true;
  }

  const { theme, isDark, setTheme: setDarkModeTheme } = useDarkMode();
  const themeCookie = useCookie('fediway_theme', { maxAge: 60 * 60 * 24 * 365 });
  const resolvedCookie = useCookie('fediway_theme_resolved', { maxAge: 60 * 60 * 24 * 365 });

  function setTheme(value: ThemePreference) {
    themeCookie.value = value;
    setDarkModeTheme(value);
    resolvedCookie.value = isDark.value ? 'dark' : 'light';
  }

  function setDefaultVisibility(visibility: AppSettings['privacy']['defaultVisibility']) {
    settings.privacy.defaultVisibility = visibility;
  }

  function toggleSensitiveMedia() {
    settings.privacy.sensitiveMedia = !settings.privacy.sensitiveMedia;
  }

  function setMediaVisibility(value: MediaVisibility) {
    settings.media.mediaVisibility = value;
    syncMediaPreferences();
  }

  function toggleAutoplayGifs() {
    settings.media.autoplayGifs = !settings.media.autoplayGifs;
    syncMediaPreferences();
  }

  function toggleReduceMotion() {
    settings.media.reduceMotion = !settings.media.reduceMotion;
    syncMediaPreferences();
  }

  return {
    settings,
    theme,
    setTheme,
    setDefaultVisibility,
    toggleSensitiveMedia,
    setMediaVisibility,
    toggleAutoplayGifs,
    toggleReduceMotion,
  };
}

/** Reset all state — for testing only */
export function _resetSettingsState() {
  Object.assign(settings, getDefaults());
  initialized = false;
}
