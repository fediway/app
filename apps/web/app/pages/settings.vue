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
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Account
      </h2>
      <div v-if="navigation.currentUser" class="flex items-center gap-4">
        <Avatar :src="navigation.currentUser.avatar" :alt="navigation.currentUser.name" size="lg" />
        <div>
          <div class="font-semibold text-foreground">
            {{ navigation.currentUser.name }}
          </div>
          <div class="text-sm text-muted-foreground">
            {{ navigation.currentUser.username }}
          </div>
        </div>
      </div>
    </section>

    <!-- Data Source Section -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
            <span class="text-foreground">Connected to {{ instanceUrl }}</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-yellow-500" />
            <span class="text-foreground">Not connected</span>
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
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Appearance
      </h2>

      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Theme</label>
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
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Privacy
      </h2>

      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-foreground">Default post visibility</label>
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
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        About
      </h2>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Version</span>
          <span class="text-foreground">1.0.0</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Source code</span>
          <a href="#" class="text-galaxy-500 hover:underline">GitHub</a>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Report an issue</span>
          <a href="#" class="text-galaxy-500 hover:underline">Open issue</a>
        </div>
      </div>
    </section>

    <!-- Danger Zone -->
    <section class="mx-4 mb-4 mt-4 rounded-lg bg-red-background px-4 py-4">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-red">
        Danger Zone
      </h2>
      <Button
        variant="secondary"
        size="sm"
        class="border-red-200 text-red hover:bg-red-background dark:border-red-800"
        @click="handleLogout"
      >
        Log out
      </Button>
    </section>
  </div>
</template>
