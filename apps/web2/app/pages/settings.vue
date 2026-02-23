<script setup lang="ts">
import { useAuth } from '@repo/api';
import { clearLiveCache } from '~/composables/useData';
import { useDataMode } from '~/composables/useDataMode';
import { useSettings } from '~/composables/useSettings';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { settings, setTheme, setDefaultVisibility, toggleNotification, toggleSensitiveMedia } = useSettings();
const { mode, setMode } = useDataMode();
const { isAuthenticated, instanceUrl, logout: apiLogout } = useAuth();

function handleDisconnect() {
  apiLogout();
  clearLiveCache();
  setMode('mock');
}

function handleLogout() {
  handleDisconnect();
  router.push('/login');
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
      <h1 class="text-xl font-bold dark:text-white">
        Settings
      </h1>
    </div>

    <!-- Account Section -->
    <section class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Account
      </h2>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div>
          <div class="font-semibold text-gray-900 dark:text-white">
            {{ navigation.currentUser.name }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ navigation.currentUser.username }}
          </div>
        </div>
      </div>
    </section>

    <!-- Data Source Section -->
    <section class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Data Source
      </h2>

      <div class="space-y-3">
        <div class="flex gap-2">
          <button
            v-for="m in ['mock', 'live'] as const"
            :key="m"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize" :class="[
              mode === m
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="setMode(m)"
          >
            {{ m === 'mock' ? 'Mock Data' : 'Live API' }}
          </button>
        </div>

        <div v-if="mode === 'live'" class="text-sm space-y-2">
          <div v-if="isAuthenticated" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full" />
            <span class="text-gray-600 dark:text-gray-300">Connected to {{ instanceUrl }}</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span class="w-2 h-2 bg-yellow-500 rounded-full" />
            <span class="text-gray-600 dark:text-gray-300">Not connected</span>
          </div>
          <button
            v-if="isAuthenticated"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
            @click="handleDisconnect"
          >
            Disconnect
          </button>
          <button
            v-else
            class="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            @click="router.push('/login')"
          >
            Connect to instance
          </button>
        </div>
      </div>
    </section>

    <!-- Appearance Section -->
    <section class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Appearance
      </h2>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
        <div class="flex gap-2">
          <button
            v-for="theme in ['light', 'dark', 'system'] as const"
            :key="theme"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize" :class="[
              settings.appearance.theme === theme
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="setTheme(theme)"
          >
            {{ theme }}
          </button>
        </div>
      </div>
    </section>

    <!-- Notifications Section -->
    <section class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Notifications
      </h2>

      <div class="space-y-3">
        <div
          v-for="(enabled, key) in settings.notifications"
          :key="key"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ key }}</span>
          <button
            class="relative w-11 h-6 rounded-full transition-colors" :class="[
              enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600',
            ]"
            @click="toggleNotification(key)"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="[
                enabled ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- Privacy Section -->
    <section class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Privacy
      </h2>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Default post visibility</label>
          <div class="flex gap-2">
            <button
              v-for="visibility in ['public', 'unlisted', 'private'] as const"
              :key="visibility"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize" :class="[
                settings.privacy.defaultVisibility === visibility
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              @click="setDefaultVisibility(visibility)"
            >
              {{ visibility }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Mark media as sensitive by default</span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Hide your media behind a warning
            </p>
          </div>
          <button
            class="relative w-11 h-6 rounded-full transition-colors" :class="[
              settings.privacy.sensitiveMedia ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600',
            ]"
            @click="toggleSensitiveMedia()"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="[
                settings.privacy.sensitiveMedia ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        About
      </h2>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Version</span>
          <span class="text-gray-900 dark:text-white">1.0.0</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Source code</span>
          <a href="#" class="text-blue-500 hover:underline">GitHub</a>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Report an issue</span>
          <a href="#" class="text-blue-500 hover:underline">Open issue</a>
        </div>
      </div>
    </section>

    <!-- Danger Zone -->
    <section class="px-4 py-4 mt-4 bg-red-50 dark:bg-red-950/30 rounded-lg mx-4 mb-4">
      <h2 class="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
        Danger Zone
      </h2>
      <button
        class="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
        @click="handleLogout"
      >
        Log out
      </button>
    </section>
  </div>
</template>
