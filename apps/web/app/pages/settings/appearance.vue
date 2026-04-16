<script setup lang="ts">
import { PageHeader, SegmentedControl, SettingsSection, Toggle } from '@repo/ui';
import { useSettings } from '~/composables/useSettings';

usePageHeader({ title: 'Appearance' });

const { settings, theme, setTheme, toggleAutoplayGifs, toggleReduceMotion } = useSettings();
const themeCookie = useCookie('fediway_theme');
const activeTheme = computed(() => themeCookie.value ?? theme.value);
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Appearance" show-back class="lg:hidden" />

    <SettingsSection title="Theme">
      <SegmentedControl
        :model-value="activeTheme ?? 'system'"
        :options="[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ]"
        @update:model-value="setTheme($event as 'light' | 'dark' | 'system')"
      />
    </SettingsSection>

    <SettingsSection title="Motion">
      <div class="space-y-4">
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
    </SettingsSection>
  </div>
</template>
