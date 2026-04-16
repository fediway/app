<script setup lang="ts">
import type { StatusVisibility } from '@repo/types';
import type { MediaVisibility } from '@repo/ui';
import { useAccountPreferences, useAuth } from '@repo/api';
import { PageHeader, SegmentedControl, SettingsNavItem, SettingsSection, Toggle, useToast, VisibilitySelector } from '@repo/ui';
import { useSettings } from '~/composables/useSettings';

usePageHeader({ title: 'Privacy & safety' });

const { currentUser } = useAuth();
const { settings, setDefaultVisibility, toggleSensitiveMedia, setMediaVisibility } = useSettings();
const { update } = useAccountPreferences();
const { toast } = useToast();

async function handleUpdate(patch: Parameters<typeof update>[0]) {
  const ok = await update(patch);
  if (!ok)
    toast.error('Failed to save setting');
}

async function handleVisibilityChange(value: string) {
  setDefaultVisibility(value as 'public' | 'unlisted' | 'private');
  await handleUpdate({ source: { privacy: value as StatusVisibility } });
}

async function handleSensitiveToggle() {
  toggleSensitiveMedia();
  await handleUpdate({ source: { sensitive: settings.privacy.sensitiveMedia } });
}

async function handleLanguageChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  await handleUpdate({ source: { language: value } });
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
];
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Privacy & safety" show-back class="lg:hidden" />

    <!-- Posting defaults -->
    <SettingsSection title="Posting defaults">
      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-foreground">Default visibility</label>
          <VisibilitySelector
            :model-value="settings.privacy.defaultVisibility"
            @update:model-value="handleVisibilityChange"
          />
        </div>

        <div>
          <label for="post-language" class="mb-2 block text-sm font-medium text-foreground">Post language</label>
          <select
            id="post-language"
            class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            :value="currentUser?.source?.language ?? 'en'"
            @change="handleLanguageChange"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
    </SettingsSection>

    <!-- Sensitive content -->
    <SettingsSection title="Sensitive content">
      <div class="space-y-4">
        <Toggle
          :model-value="settings.privacy.sensitiveMedia"
          label="Mark my media as sensitive"
          description="Always hide your media behind a content warning"
          @update:model-value="handleSensitiveToggle()"
        />

        <div>
          <label class="mb-2 block text-sm font-medium text-foreground">Display sensitive media from others</label>
          <SegmentedControl
            :model-value="settings.media.mediaVisibility"
            :options="[
              { value: 'default', label: 'Only sensitive' },
              { value: 'show_all', label: 'Show all media' },
              { value: 'hide_all', label: 'Hide all media' },
            ]"
            @update:model-value="setMediaVisibility($event as MediaVisibility)"
          />
          <p class="mt-1 text-xs text-muted-foreground">
            "Only sensitive" blurs media only when the author flagged it
          </p>
        </div>
      </div>
    </SettingsSection>

    <!-- Account visibility -->
    <SettingsSection title="Account visibility">
      <div class="space-y-4">
        <Toggle
          :model-value="currentUser?.locked ?? false"
          label="Require follow approval"
          description="New followers will need your approval before they can follow you"
          @update:model-value="handleUpdate({ locked: $event })"
        />

        <Toggle
          :model-value="(currentUser as any)?.discoverable ?? true"
          label="Show in profile directory"
          description="Your profile will appear in your server's directory"
          @update:model-value="handleUpdate({ discoverable: $event })"
        />

        <Toggle
          :model-value="(currentUser as any)?.hideCollections ?? false"
          label="Hide follows and followers"
          description="Your follow and follower lists will be hidden on your profile"
          @update:model-value="handleUpdate({ hideCollections: $event })"
        />

        <Toggle
          :model-value="currentUser?.bot ?? false"
          label="Mark as automated account"
          description="Signals to others that this account is a bot"
          @update:model-value="handleUpdate({ bot: $event })"
        />
      </div>
    </SettingsSection>

    <!-- Content -->
    <SettingsSection title="Content">
      <div class="-mx-2 space-y-1">
        <SettingsNavItem to="/settings/blocked" label="Blocked accounts" />
        <SettingsNavItem to="/settings/muted" label="Muted accounts" />
      </div>
    </SettingsSection>
  </div>
</template>
