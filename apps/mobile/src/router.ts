import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { useTransition } from './composables/useTransition';

const appRoutes: RouteRecordRaw[] = [
  // Tab roots
  {
    path: '/',
    component: () => import('./pages/Home.vue'),
    meta: { tab: 'home' },
  },
  {
    path: '/search',
    component: () => import('./pages/Search.vue'),
    meta: { tab: 'search' },
  },
  {
    path: '/notifications',
    component: () => import('./pages/Notifications.vue'),
    meta: { tab: 'notifications' },
  },
  {
    path: '/@:acct(.*)',
    component: () => import('./pages/Profile.vue'),
    meta: { tab: 'profile' },
  },

  // Auth
  {
    path: '/login',
    component: () => import('./pages/Login.vue'),
    meta: { layout: 'auth' },
  },
  {
    path: '/oauth/callback',
    component: () => import('./pages/OAuthCallback.vue'),
    meta: { layout: 'auth' },
  },

  // Stack pages
  {
    path: '/status/:id',
    component: () => import('./pages/Status.vue'),
  },
  {
    path: '/explore',
    component: () => import('./pages/Explore.vue'),
  },
  {
    path: '/messages',
    component: () => import('./pages/Messages.vue'),
  },
  {
    path: '/messages/:id',
    component: () => import('./pages/MessageThread.vue'),
  },
  {
    path: '/tags/:tag',
    component: () => import('./pages/Tag.vue'),
  },
  {
    path: '/favourites',
    component: () => import('./pages/Favourites.vue'),
  },
  {
    path: '/bookmarks',
    component: () => import('./pages/Bookmarks.vue'),
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings.vue'),
  },
];

// Demo/playground routes — excluded from production builds
const demoRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      { path: '/demo', component: () => import('./demo/DemoHome.vue') },
      { path: '/demo/feed', component: () => import('./demo/screens/DemoFeed.vue') },
      { path: '/demo/compose', component: () => import('./demo/screens/DemoCompose.vue') },
      { path: '/demo/status', component: () => import('./demo/screens/DemoStatus.vue') },
      { path: '/demo/profile', component: () => import('./demo/screens/DemoProfile.vue') },
      { path: '/demo/item', component: () => import('./demo/screens/DemoItem.vue') },
      { path: '/demo/settings', component: () => import('./demo/screens/DemoSettings.vue') },
      { path: '/demo/camera', component: () => import('./demo/playground/PlayCamera.vue') },
      { path: '/demo/keyboard', component: () => import('./demo/playground/PlayKeyboard.vue') },
      { path: '/demo/haptics', component: () => import('./demo/playground/PlayHaptics.vue') },
      { path: '/demo/safe-areas', component: () => import('./demo/playground/PlaySafeAreas.vue') },
      { path: '/demo/storage', component: () => import('./demo/playground/PlayStorage.vue') },
      { path: '/demo/network', component: () => import('./demo/playground/PlayNetwork.vue') },
      { path: '/demo/browser', component: () => import('./demo/playground/PlayBrowser.vue') },
      { path: '/demo/status-bar', component: () => import('./demo/playground/PlayStatusBar.vue') },
      { path: '/demo/lifecycle', component: () => import('./demo/playground/PlayLifecycle.vue') },
      { path: '/demo/splash', component: () => import('./demo/playground/PlaySplash.vue') },
    ]
  : [];

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...appRoutes,
    ...demoRoutes,
  ],
});

// Track history depth to detect forward/back navigation
let historyPosition = 0;

router.afterEach(() => {
  const pos = window.history.state?.position;
  if (typeof pos === 'number') {
    historyPosition = pos;
  }
});

router.beforeEach((to) => {
  const { setFade, setSlideLeft, setSlideRight } = useTransition();

  const toIsTab = !!to.meta.tab;

  if (toIsTab) {
    // Navigating to a tab root: fade
    setFade();
  }
  else {
    // Stack navigation: compare history positions
    const nextPosition = window.history.state?.position;
    if (typeof nextPosition === 'number' && nextPosition < historyPosition) {
      setSlideRight();
    }
    else {
      setSlideLeft();
    }
  }
});
