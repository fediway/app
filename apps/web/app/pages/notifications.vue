<script setup lang="ts">
import type { Notification } from '@repo/types';
import { NotificationList, PageHeader } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getNotifications, getProfileUrl } = useData();
const notifications = computed(() => getNotifications());

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
      @click="handleNotificationClick"
      @profile-click="navigateToProfile"
    />
  </div>
</template>
