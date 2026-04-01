<script setup lang="ts">
import { useAuth, useClient } from '@repo/api';
import { Avatar, Button, PageHeader, SegmentedControl, Toggle, VisibilitySelector } from '@repo/ui';
import { useFeedbackModal } from '~/composables/useFeedbackModal';
import { useSettings } from '~/composables/useSettings';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { settings, theme, setTheme, setDefaultVisibility, toggleSensitiveMedia, setMediaVisibility, toggleAutoplayGifs, toggleReduceMotion } = useSettings();
const themeCookie = useCookie('fediway_theme');
const activeTheme = computed(() => themeCookie.value ?? theme.value);
const { isAuthenticated, instanceUrl, logout: apiLogout } = useAuth();
const { open: openFeedback } = useFeedbackModal();
const isEditProfileOpen = ref(false);

usePageHeader({ title: 'Settings' });

// Sync posting defaults to server when they change
async function handleVisibilityChange(value: string) {
  setDefaultVisibility(value as 'public' | 'unlisted' | 'private');
  if (isAuthenticated.value) {
    try {
      const client = useClient();
      await client.rest.v1.accounts.updateCredentials({ source: { privacy: value } as any });
    }
    catch {
      // Server sync failed — local preference still saved
    }
  }
}

async function handleSensitiveToggle() {
  toggleSensitiveMedia();
  if (isAuthenticated.value) {
    try {
      const client = useClient();
      await client.rest.v1.accounts.updateCredentials({ source: { sensitive: settings.privacy.sensitiveMedia } as any });
    }
    catch {
      // Server sync failed — local preference still saved
    }
  }
}

function handleLogout() {
  apiLogout();
  router.push('/');
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Settings" class="lg:hidden" />

    <!-- Profile Card -->
    <section class="border-b border-border px-4 py-5">
      <div v-if="navigation.currentUser" class="flex items-center gap-4">
        <Avatar :src="navigation.currentUser.avatar" :alt="navigation.currentUser.name" size="lg" />
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-foreground">
            {{ navigation.currentUser.name }}
          </div>
          <div class="text-sm text-muted-foreground">
            @{{ navigation.currentUser.acct }}
          </div>
        </div>
        <Button variant="muted" size="sm" @click="isEditProfileOpen = true">
          Edit
        </Button>
      </div>
    </section>

    <!-- Account -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Account
      </h2>
      <div class="space-y-2 text-sm">
        <div v-if="isAuthenticated" class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-green" />
          <span class="text-foreground">Connected to {{ instanceUrl }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-yellow" />
          <span class="text-foreground">Not connected</span>
        </div>
      </div>
    </section>

    <!-- Posting -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Posting
      </h2>

      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-foreground">Default visibility</label>
          <VisibilitySelector
            :model-value="settings.privacy.defaultVisibility"
            @update:model-value="handleVisibilityChange"
          />
        </div>

        <Toggle
          :model-value="settings.privacy.sensitiveMedia"
          label="Mark media as sensitive by default"
          description="Hide your media behind a content warning"
          @update:model-value="handleSensitiveToggle()"
        />
      </div>
    </section>

    <!-- Media -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Media
      </h2>

      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-foreground">Media visibility</label>
          <SegmentedControl
            :model-value="settings.media.mediaVisibility"
            :options="[
              { value: 'default', label: 'Default' },
              { value: 'show_all', label: 'Show all' },
              { value: 'hide_all', label: 'Hide all' },
            ]"
            @update:model-value="setMediaVisibility($event as any)"
          />
          <p class="mt-1 text-xs text-muted-foreground">
            Default hides media only when marked sensitive
          </p>
        </div>

        <Toggle
          :model-value="settings.media.autoplayGifs"
          label="Autoplay animated GIFs"
          description="Animated images play automatically when visible"
          @update:model-value="toggleAutoplayGifs()"
        />

        <Toggle
          :model-value="settings.media.reduceMotion"
          label="Reduce motion"
          description="Disables autoplay for all videos and animations"
          @update:model-value="toggleReduceMotion()"
        />
      </div>
    </section>

    <!-- Content -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Content
      </h2>

      <div class="space-y-1 -mx-2">
        <NuxtLink
          to="/settings/blocked"
          class="flex items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <span class="text-sm text-foreground">Blocked accounts</span>
          <span class="text-sm text-muted-foreground">&rsaquo;</span>
        </NuxtLink>
        <NuxtLink
          to="/settings/muted"
          class="flex items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <span class="text-sm text-foreground">Muted accounts</span>
          <span class="text-sm text-muted-foreground">&rsaquo;</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Appearance -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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

    <!-- Early Access / Help & Feedback -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-1 text-xs font-semibold uppercase tracking-wider text-galaxy-500 dark:text-galaxy-400">
        Early Access
      </h2>
      <p class="mb-3 text-xs text-muted-foreground">
        You're among the first to use Fediway. Your feedback shapes what we build next.
      </p>

      <div class="-mx-2 space-y-1">
        <button
          class="flex w-full items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
          @click="openFeedback()"
        >
          <span class="text-sm text-foreground">Send feedback</span>
          <span class="text-sm text-muted-foreground">&rsaquo;</span>
        </button>
        <a
          href="https://github.com/fediway/app/discussions"
          target="_blank"
          rel="noopener noreferrer"
          class="flex w-full items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <span class="text-sm text-foreground">Feature requests</span>
          <span class="text-sm text-muted-foreground">&rsaquo;</span>
        </a>
      </div>
    </section>

    <!-- About -->
    <section class="border-b border-border px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        About
      </h2>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Version</span>
          <span class="text-foreground">0.1.0-beta</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Source code</span>
          <a href="https://github.com/fediway/app" target="_blank" rel="noopener noreferrer" class="text-galaxy-500 dark:text-galaxy-400 hover:underline">GitHub</a>
        </div>
      </div>
    </section>

    <!-- Log out -->
    <section v-if="isAuthenticated" class="px-4 py-6">
      <Button
        variant="muted"
        class="w-full text-red"
        @click="handleLogout"
      >
        Log out
      </Button>
    </section>
    <!-- Profile Edit Modal -->
    <ClientOnly>
      <ProfileEditModal
        :is-open="isEditProfileOpen"
        @close="isEditProfileOpen = false"
      />
    </ClientOnly>
  </div>
</template>
