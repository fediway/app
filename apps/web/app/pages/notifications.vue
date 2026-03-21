<script setup lang="ts">
import { PageHeader, TabBar } from '@repo/ui';
import { NOTIFICATION_FILTERS } from '~/composables/useNotificationData';

definePageMeta({ keepalive: true });

const route = useRoute();
const router = useRouter();

const tabs = [
  { label: 'All', value: 'all' },
  ...Object.entries(NOTIFICATION_FILTERS).map(([key, { label }]) => ({
    label,
    value: key,
  })),
];

const activeTab = computed(() => {
  const filter = route.params.filter as string | undefined;
  return filter ?? 'all';
});

function handleTabChange(tab: string) {
  if (tab === 'all') {
    router.push('/notifications');
  }
  else {
    router.push(`/notifications/${tab}`);
  }
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Notifications" />

    <TabBar
      :model-value="activeTab"
      :tabs="tabs"
      @update:model-value="handleTabChange"
    />

    <NuxtPage :key="route.path" />
  </div>
</template>
