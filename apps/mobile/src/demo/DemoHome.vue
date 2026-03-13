<script setup lang="ts">
const appScreens = [
  { path: '/demo/feed', title: 'Feed', description: 'Timeline with pull-to-refresh and new posts banner' },
  { path: '/demo/compose', title: 'Compose', description: 'Text, camera attach, keyboard, haptic submit' },
  { path: '/demo/status', title: 'Thread', description: 'Thread view with optimistic toggles' },
  { path: '/demo/profile', title: 'Profile', description: 'Profile header behind status bar' },
  { path: '/demo/item', title: 'Item Page', description: 'Ratings, distribution, friend takes' },
  { path: '/demo/settings', title: 'Settings', description: 'Dark mode toggle and network status' },
];

const playgroundPages = [
  { path: '/demo/camera', title: 'Camera', description: 'Photo capture and gallery picker' },
  { path: '/demo/keyboard', title: 'Keyboard', description: 'Keyboard events and height tracking' },
  { path: '/demo/haptics', title: 'Haptics', description: 'Impact, notification, and vibrate' },
  { path: '/demo/safe-areas', title: 'Safe Areas', description: 'Inset visualization and readout' },
  { path: '/demo/storage', title: 'Storage', description: 'SecureStorage CRUD operations' },
  { path: '/demo/network', title: 'Network', description: 'Connection status and listener' },
  { path: '/demo/browser', title: 'Browser', description: 'Open URLs in system browser' },
  { path: '/demo/status-bar', title: 'Status Bar', description: 'Style, overlay, color, show/hide' },
  { path: '/demo/lifecycle', title: 'Lifecycle', description: 'App state change event log' },
  { path: '/demo/splash', title: 'Splash Screen', description: 'Show, hide, and auto-hide' },
];
</script>

<template>
  <div class="px-4 py-6 space-y-6">
    <header class="flex items-center gap-4">
      <router-link to="/">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Demo
      </h1>
    </header>

    <section>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        App Screens
      </h2>
      <div class="space-y-2">
        <router-link
          v-for="screen in appScreens"
          :key="screen.path"
          :to="screen.path"
          class="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div class="font-medium text-gray-900 dark:text-gray-100">
            {{ screen.title }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ screen.description }}
          </div>
        </router-link>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Native Playground
      </h2>
      <div class="space-y-2">
        <router-link
          v-for="page in playgroundPages"
          :key="page.path"
          :to="page.path"
          class="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div class="font-medium text-gray-900 dark:text-gray-100">
            {{ page.title }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ page.description }}
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>
