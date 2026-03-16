import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TextZoom } from '@capacitor/text-zoom';
import { setPlatformAdapter, useAppLifecycle, useAuth, useDarkMode, useDeepLinks, useShareTarget } from '@repo/api';
import { useRouter } from 'vue-router';
import { CapacitorPlatformAdapter } from '../platform-capacitor';
import { useBackButton } from './useBackButton';

let initialized = false;

export function useAppInit() {
  const router = useRouter();

  async function init() {
    if (initialized)
      return;
    initialized = true;

    // Platform adapter — must be set before any auth calls
    setPlatformAdapter(new CapacitorPlatformAdapter());

    // Lock text zoom on native to prevent OS-level font scaling
    if (Capacitor.isNativePlatform()) {
      TextZoom.set({ value: 1.0 });
    }

    // Dark mode
    const darkMode = useDarkMode();
    await darkMode.init().catch(() => { /* use system default */ });

    // Auth — restore session from secure storage
    const { restoreSession } = useAuth();
    await restoreSession().catch(() => { /* stay unauthenticated */ });

    // Back button (Android hardware back)
    if (Capacitor.isNativePlatform()) {
      useBackButton().initListener();
    }

    // Deep links + OAuth callbacks
    initDeepLinks();

    // App lifecycle (pause/resume)
    initLifecycle();

    // Share target
    initShareTarget();
  }

  function initDeepLinks() {
    const deepLinks = useDeepLinks();

    CapacitorApp.addListener('appUrlOpen', async (data) => {
      if (data.url.includes('oauth/callback')) {
        const url = new URL(data.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          router.push({ path: '/login', query: { error } });
          return;
        }

        if (code) {
          try {
            const { handleOAuthCallback } = useAuth();
            await handleOAuthCallback(code);
            router.push('/');
          }
          catch {
            router.push({ path: '/login', query: { error: 'callback_failed' } });
          }
        }
        return;
      }

      const route = deepLinks.resolveUrl(data.url);
      if (route) {
        router.push(route);
      }
    });
  }

  function initLifecycle() {
    const lifecycle = useAppLifecycle();

    lifecycle.onPause(async () => {
      await lifecycle.saveState({
        route: router.currentRoute.value.fullPath,
      });
    });

    CapacitorApp.addListener('pause', () => lifecycle.handlePause());
    CapacitorApp.addListener('resume', () => lifecycle.handleResume());

    CapacitorApp.addListener('appRestoredResult', (data) => {
      lifecycle.appRestoredResult.value = data;
    });

    // Restore route from previous session if within window
    lifecycle.restoreState().then((saved) => {
      if (saved?.route) {
        router.push(saved.route);
      }
    }).catch(() => { /* no state to restore */ });
  }

  function initShareTarget() {
    const shareTarget = useShareTarget();

    shareTarget.onShare((content) => {
      if (content.urls.length > 0) {
        router.push({ path: '/compose', query: { url: content.urls[0] } });
      }
    });
  }

  return { init };
}
