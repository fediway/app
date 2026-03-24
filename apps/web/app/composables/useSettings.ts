import type { ThemePreference } from '@repo/api';
import { useDarkMode } from '@repo/api';
import { reactive, watch } from 'vue';

export interface AppSettings {
  notifications: {
    mentions: boolean;
    follows: boolean;
    favourites: boolean;
    reblogs: boolean;
    polls: boolean;
  };
  privacy: {
    defaultVisibility: 'public' | 'unlisted' | 'private';
    sensitiveMedia: boolean;
  };
}

const STORAGE_KEY = 'fediway-settings';

function getDefaults(): AppSettings {
  return {
    notifications: {
      mentions: true,
      follows: true,
      favourites: true,
      reblogs: true,
      polls: true,
    },
    privacy: {
      defaultVisibility: 'public',
      sensitiveMedia: false,
    },
  };
}

function loadFromStorage(): AppSettings {
  if (typeof window === 'undefined')
    return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw)
      return { ...getDefaults(), ...JSON.parse(raw) };
  }
  catch { /* ignore */ }
  return getDefaults();
}

// Module-level state — deferred initialization
const settings = reactive<AppSettings>(getDefaults());
let initialized = false;

export function useSettings() {
  if (!initialized) {
    Object.assign(settings, loadFromStorage());

    if (typeof window !== 'undefined') {
      watch(settings, (val) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      }, { deep: true });
    }

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

  function toggleNotification(key: keyof AppSettings['notifications']) {
    settings.notifications[key] = !settings.notifications[key];
  }

  function toggleSensitiveMedia() {
    settings.privacy.sensitiveMedia = !settings.privacy.sensitiveMedia;
  }

  return {
    settings,
    theme,
    setTheme,
    setDefaultVisibility,
    toggleNotification,
    toggleSensitiveMedia,
  };
}

/** Reset all state — for testing only */
export function _resetSettingsState() {
  Object.assign(settings, getDefaults());
  initialized = false;
}
