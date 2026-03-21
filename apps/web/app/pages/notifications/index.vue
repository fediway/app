<script setup lang="ts">
import type { Notification } from '@repo/types';
import { EmptyState, NotificationList } from '@repo/ui';

const router = useRouter();
const { getNotifications } = useNotificationData();
const { getProfilePath, getStatusPath } = useAccountData();

const { data: notifications, isLoading } = getNotifications();

function handleNotificationClick(notification: Notification) {
  if (notification.status) {
    router.push(getStatusPath(notification.status.id, notification.status.account.acct));
  }
  else if (notification.type === 'follow') {
    router.push(getProfilePath(notification.account.acct));
  }
}

function navigateToProfile(acct: string) {
  router.push(getProfilePath(acct));
}
</script>

<template>
  <EmptyState
    v-if="!isLoading && notifications.length === 0"
    title="No notifications yet"
    description="When someone interacts with you, it will show up here."
    class="py-12"
  />

  <NotificationList
    v-else
    :notifications="notifications"
    :loading="isLoading && notifications.length === 0"
    @click="handleNotificationClick"
    @profile-click="navigateToProfile"
  />
</template>
