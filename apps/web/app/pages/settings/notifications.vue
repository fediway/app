<script setup lang="ts">
import type { PushAlerts } from '@repo/api';
import { usePushSubscription } from '@repo/api';
import { Button, PageHeader, SettingsSection, Toggle, useToast } from '@repo/ui';

usePageHeader({ title: 'Notifications' });

const { isSupported, isEnabled, isLoading, alerts, enable, disable, updateAlerts } = usePushSubscription();
const { toast } = useToast();

async function handleEnable() {
  const ok = await enable();
  if (!ok)
    toast.error('Could not enable push notifications');
}

async function handleDisable() {
  const ok = await disable();
  if (!ok)
    toast.error('Could not disable push notifications');
}

async function handleAlertToggle(key: keyof PushAlerts, value: boolean) {
  const ok = await updateAlerts({ [key]: value } as Partial<PushAlerts>);
  if (!ok)
    toast.error('Failed to update notification setting');
}

const alertTypes: { key: keyof PushAlerts; label: string; description: string }[] = [
  { key: 'mention', label: 'Mentions', description: 'Someone mentions you in a post' },
  { key: 'follow', label: 'New followers', description: 'Someone follows your account' },
  { key: 'reblog', label: 'Boosts', description: 'Someone boosts one of your posts' },
  { key: 'favourite', label: 'Favourites', description: 'Someone favourites one of your posts' },
  { key: 'poll', label: 'Poll results', description: 'A poll you voted in has ended' },
  { key: 'status', label: 'New posts', description: 'Someone you follow publishes a new post' },
  { key: 'update', label: 'Post edits', description: 'A post you interacted with was edited' },
];
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Notifications" show-back class="lg:hidden" />

    <!-- Browser support -->
    <div v-if="!isSupported" class="px-4 py-8 text-center">
      <p class="text-sm text-muted-foreground">
        Push notifications are not supported in this browser.
      </p>
    </div>

    <template v-else>
      <!-- Master toggle -->
      <SettingsSection title="Push notifications">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-foreground">Enable push notifications</span>
              <p class="text-xs text-muted-foreground">
                Receive notifications even when Fediway is closed
              </p>
            </div>
            <Button
              v-if="!isEnabled"
              size="sm"
              :disabled="isLoading"
              @click="handleEnable"
            >
              {{ isLoading ? 'Enabling…' : 'Enable' }}
            </Button>
            <Button
              v-else
              variant="muted"
              size="sm"
              :disabled="isLoading"
              @click="handleDisable"
            >
              Disable
            </Button>
          </div>
        </div>
      </SettingsSection>

      <!-- Per-type alert toggles -->
      <SettingsSection v-if="isEnabled" title="Notify me about">
        <div class="space-y-4">
          <Toggle
            v-for="alert in alertTypes"
            :key="alert.key"
            :model-value="(alerts as Record<string, boolean>)?.[alert.key] ?? false"
            :label="alert.label"
            :description="alert.description"
            @update:model-value="handleAlertToggle(alert.key, $event)"
          />
        </div>
      </SettingsSection>
    </template>
  </div>
</template>
