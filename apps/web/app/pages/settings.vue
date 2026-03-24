<script setup lang="ts">
import { invalidateAllQueries, useAuth } from '@repo/api';
import { Avatar, Button, PageHeader, SegmentedControl, Toggle, VisibilitySelector } from '@repo/ui';
import { useDataMode } from '~/composables/useDataMode';
import { useSettings } from '~/composables/useSettings';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { settings, theme, setTheme, setDefaultVisibility, toggleNotification, toggleSensitiveMedia } = useSettings();
const themeCookie = useCookie('fediway_theme');
const activeTheme = computed(() => themeCookie.value ?? theme.value);
const { mode, setMode } = useDataMode();
const { isAuthenticated, instanceUrl, logout: apiLogout } = useAuth();

const notificationLabels: Record<string, { label: string; description: string }> = {
  likes: { label: 'Likes', description: 'When someone likes your post' },
  reblogs: { label: 'Boosts', description: 'When someone boosts your post' },
  follows: { label: 'New followers', description: 'When someone follows you' },
  mentions: { label: 'Mentions', description: 'When someone mentions you' },
  polls: { label: 'Polls', description: 'When a poll you voted in ends' },
};

function handleDisconnect() {
  apiLogout();
  invalidateAllQueries();
  setMode('mock');
}

function handleLogout() {
  handleDisconnect();
  router.push('/login');
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Settings" />

    <!-- Account Section -->
    <section class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Account
      </h2>
      <div v-if="navigation.currentUser" class="flex items-center gap-4">
        <Avatar :src="navigation.currentUser.avatar" :alt="navigation.currentUser.name" size="lg" />
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
    <section class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Data Source
      </h2>

      <div class="space-y-3">
        <SegmentedControl
          :model-value="mode"
          :options="[
            { value: 'mock', label: 'Mock Data' },
            { value: 'live', label: 'Live API' },
          ]"
          @update:model-value="setMode($event as 'mock' | 'live')"
        />

        <div v-if="mode === 'live'" class="space-y-2 text-sm">
          <div v-if="isAuthenticated" class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-green-500" />
            <span class="text-gray-600 dark:text-gray-300">Connected to {{ instanceUrl }}</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-yellow-500" />
            <span class="text-gray-600 dark:text-gray-300">Not connected</span>
          </div>
          <Button
            v-if="isAuthenticated"
            variant="secondary"
            size="sm"
            @click="handleDisconnect"
          >
            Disconnect
          </Button>
          <Button
            v-else
            size="sm"
            @click="router.push('/login')"
          >
            Connect to instance
          </Button>
        </div>
      </div>
    </section>

    <!-- Appearance Section -->
    <section class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Appearance
      </h2>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
        <SegmentedControl
          :model-value="activeTheme ?? 'system'"
          :options="[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]"
          @update:model-value="setTheme($event as 'light' | 'dark' | 'system')"
        />
      </div>
    </section>

    <!-- Notifications Section -->
    <section class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Notifications
      </h2>

      <div class="space-y-3">
        <Toggle
          v-for="(enabled, key) in settings.notifications"
          :key="key"
          :model-value="enabled"
          :label="notificationLabels[key]?.label ?? String(key)"
          :description="notificationLabels[key]?.description"
          @update:model-value="toggleNotification(key)"
        />
      </div>
    </section>

    <!-- Privacy Section -->
    <section class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Privacy
      </h2>

      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Default post visibility</label>
          <VisibilitySelector
            :model-value="settings.privacy.defaultVisibility"
            @update:model-value="setDefaultVisibility($event as 'public' | 'unlisted' | 'private')"
          />
        </div>

        <Toggle
          :model-value="settings.privacy.sensitiveMedia"
          label="Mark media as sensitive by default"
          description="Hide your media behind a warning"
          @update:model-value="toggleSensitiveMedia()"
        />
      </div>
    </section>

    <!-- About Section -->
    <section class="px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
    <section class="mx-4 mb-4 mt-4 rounded-lg bg-red-50 px-4 py-4 dark:bg-red-950/30">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
        Danger Zone
      </h2>
      <Button
        variant="secondary"
        size="sm"
        class="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
        @click="handleLogout"
      >
        Log out
      </Button>
    </section>
  </div>
</template>
