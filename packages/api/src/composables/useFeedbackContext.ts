import { useAccountStore } from '../auth/account-store';
import { useDarkMode } from './useDarkMode';

export interface FeedbackContext {
  app: {
    version: string;
    platform: 'web' | 'ios' | 'android';
  };
  device: {
    userAgent: string;
    viewport: { width: number; height: number };
    screen: { width: number; height: number; pixelRatio: number };
    online: boolean;
    language: string;
    connectionType?: string;
  };
  route: {
    path: string;
    name?: string;
    params: Record<string, string>;
  };
  theme: 'light' | 'dark';
  instanceUrl: string | null;
  user: {
    authenticated: boolean;
    handle: string | null;
  };
  timestamp: string;
  recentErrors: Array<{ message: string; timestamp: number }>;
}

interface RouteInfo {
  path: string;
  name?: string | symbol | null;
  params?: Record<string, string | string[]>;
}

interface CollectContextOptions {
  /** App version override (e.g. from Capacitor App.getInfo()) */
  appVersion?: string;
  /** Platform override (defaults to 'web') */
  platform?: 'web' | 'ios' | 'android';
}

declare global {
  interface Window {
    __FEDIWAY_LAST_ERRORS__?: Array<{ message: string; timestamp: number }>;
  }
}

export function useFeedbackContext() {
  const { isDark } = useDarkMode();
  const store = useAccountStore();

  function collectContext(route: RouteInfo, options?: CollectContextOptions): FeedbackContext {
    const isBrowser = typeof window !== 'undefined';

    const connection = isBrowser ? (navigator as any).connection : undefined;

    return {
      app: {
        version: options?.appVersion ?? '0.1.0-beta',
        platform: options?.platform ?? 'web',
      },
      device: {
        userAgent: isBrowser ? navigator.userAgent : '',
        viewport: {
          width: isBrowser ? window.innerWidth : 0,
          height: isBrowser ? window.innerHeight : 0,
        },
        screen: {
          width: isBrowser ? screen.width : 0,
          height: isBrowser ? screen.height : 0,
          pixelRatio: isBrowser ? window.devicePixelRatio : 1,
        },
        online: isBrowser ? navigator.onLine : true,
        language: isBrowser ? navigator.language : '',
        connectionType: connection?.effectiveType,
      },
      route: {
        path: route.path,
        name: typeof route.name === 'string' ? route.name : typeof route.name === 'symbol' ? route.name.description : undefined,
        params: Object.fromEntries(
          Object.entries(route.params ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]),
        ),
      },
      theme: isDark.value ? 'dark' : 'light',
      instanceUrl: store.instanceUrl.value,
      user: {
        authenticated: store.isAuthenticated.value,
        handle: store.currentUser.value?.acct ?? null,
      },
      timestamp: new Date().toISOString(),
      recentErrors: isBrowser
        ? [...(window.__FEDIWAY_LAST_ERRORS__ ?? [])]
        : [],
    };
  }

  return { collectContext };
}
