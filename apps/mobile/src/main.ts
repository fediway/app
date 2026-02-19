import { App as CapacitorApp } from '@capacitor/app';
import { setPlatformAdapter, useAuth } from '@repo/api';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { CapacitorPlatformAdapter } from './platform-capacitor';
import './assets/main.css';

// Set native platform adapter BEFORE any auth calls
setPlatformAdapter(new CapacitorPlatformAdapter());

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./pages/Login.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./pages/Settings.vue'),
    },
    // Demo hub
    { path: '/demo', component: () => import('./pages/demo/DemoHome.vue') },
    // App screens
    { path: '/demo/feed', component: () => import('./pages/demo/screens/DemoFeed.vue') },
    { path: '/demo/compose', component: () => import('./pages/demo/screens/DemoCompose.vue') },
    { path: '/demo/status', component: () => import('./pages/demo/screens/DemoStatus.vue') },
    { path: '/demo/profile', component: () => import('./pages/demo/screens/DemoProfile.vue') },
    { path: '/demo/item', component: () => import('./pages/demo/screens/DemoItem.vue') },
    { path: '/demo/settings', component: () => import('./pages/demo/screens/DemoSettings.vue') },
    // Native playground
    { path: '/demo/camera', component: () => import('./pages/demo/playground/PlayCamera.vue') },
    { path: '/demo/keyboard', component: () => import('./pages/demo/playground/PlayKeyboard.vue') },
    { path: '/demo/haptics', component: () => import('./pages/demo/playground/PlayHaptics.vue') },
    { path: '/demo/safe-areas', component: () => import('./pages/demo/playground/PlaySafeAreas.vue') },
    { path: '/demo/storage', component: () => import('./pages/demo/playground/PlayStorage.vue') },
    { path: '/demo/network', component: () => import('./pages/demo/playground/PlayNetwork.vue') },
    { path: '/demo/browser', component: () => import('./pages/demo/playground/PlayBrowser.vue') },
    { path: '/demo/status-bar', component: () => import('./pages/demo/playground/PlayStatusBar.vue') },
    { path: '/demo/lifecycle', component: () => import('./pages/demo/playground/PlayLifecycle.vue') },
    { path: '/demo/splash', component: () => import('./pages/demo/playground/PlaySplash.vue') },
  ],
});

// Listen for OAuth deep links (com.fediway.app://oauth/callback?code=...)
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
  }
});

// Restore session from secure storage on cold start
const { restoreSession } = useAuth();
restoreSession().catch(() => { /* stay unauthenticated */ });

const app = createApp(App);
app.use(router);
app.mount('#app');
