<script setup lang="ts">
import type { Notification } from '@repo/types';
import { NotificationList, PageHeader } from '@repo/ui';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getNotifications } = useNotificationData();
const { getProfileUrl } = useAccountData();

const { data: notifications, isLoading } = getNotifications();

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
      :loading="isLoading && notifications.length === 0"
      @click="handleNotificationClick"
      @profile-click="navigateToProfile"
    />
  </div>
</template>
