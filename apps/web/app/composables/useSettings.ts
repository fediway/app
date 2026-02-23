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

const settings = reactive<AppSettings>(loadFromStorage());

// Persist to localStorage on any change
if (typeof window !== 'undefined') {
  watch(settings, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }, { deep: true });
}

export function useSettings() {
  const { theme, isDark, setTheme: setDarkModeTheme } = useDarkMode();
  // Preference cookie — 'system'|'dark'|'light' (for settings button SSR).
  const themeCookie = useCookie('fediway_theme', { maxAge: 60 * 60 * 24 * 365 });
  // Resolved cookie — always 'dark'|'light' (for SSR .dark class on <html>).
  const resolvedCookie = useCookie('fediway_theme_resolved', { maxAge: 60 * 60 * 24 * 365 });

  function setTheme(value: ThemePreference) {
    themeCookie.value = value;
    setDarkModeTheme(value);
    // Sync resolved cookie immediately so the next SSR has the right class.
    // nextTick isn't needed — isDark is a computed that updates synchronously after setTheme.
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
