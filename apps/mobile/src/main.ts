import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/main.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/Home.vue'),
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

const app = createApp(App);
app.use(router);
app.mount('#app');
