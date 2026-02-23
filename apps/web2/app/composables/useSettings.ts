import { reactive, watch } from 'vue';

export interface AppSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system';
  };
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
    appearance: { theme: 'light' },
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

/** Apply the theme class to <html> */
function applyTheme(theme: AppSettings['appearance']['theme']) {
  if (typeof document === 'undefined')
    return;
  const html = document.documentElement;

  if (theme === 'dark') {
    html.classList.add('dark');
  }
  else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle('dark', prefersDark);
  }
  else {
    html.classList.remove('dark');
  }
}

// Apply on load
if (typeof window !== 'undefined') {
  applyTheme(settings.appearance.theme);

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (settings.appearance.theme === 'system') {
      applyTheme('system');
    }
  });
}

export function useSettings() {
  function setTheme(theme: AppSettings['appearance']['theme']) {
    settings.appearance.theme = theme;
    applyTheme(theme);
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
    setTheme,
    setDefaultVisibility,
    toggleNotification,
    toggleSensitiveMedia,
  };
}
