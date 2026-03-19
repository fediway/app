<script setup lang="ts">
import type { Notification } from '@repo/types';
import { NotificationList, PageHeader } from '@repo/ui';
import { computed, onMounted, ref } from 'vue';
import { useData } from '~/composables/useData';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getNotifications, getProfileUrl } = useData();

const loading = ref(true);
const notifications = computed(() => getNotifications());

onMounted(() => {
  // getNotifications fires-and-forgets internally; mark loading done on next tick
  setTimeout(() => {
    loading.value = false;
  }, 100);
});

function handleNotificationClick(notification: Notification) {
  if (notification.status) {
    router.push(`/status/${notification.status.id}`);
  }
  else if (notification.type === 'follow') {
    router.push(getProfileUrl(notification.account.acct));
  }
}

function navigateToProfile(acct: string) {
  router.push(getProfileUrl(acct));
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Notifications" />

    <NotificationList
      :notifications="notifications"
      :loading="loading && notifications.length === 0"
      @click="handleNotificationClick"
      @profile-click="navigateToProfile"
    />
  </div>
</template>
