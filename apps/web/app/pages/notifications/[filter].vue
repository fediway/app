<script setup lang="ts">
import type { Notification } from '@repo/types';
import type { NotificationFilter } from '~/composables/useNotificationData';
import { EmptyState, NotificationList, Skeleton } from '@repo/ui';
import { NOTIFICATION_FILTERS } from '~/composables/useNotificationData';

const route = useRoute();
const router = useRouter();
const { getNotifications } = useNotificationData();
const { getProfilePath, getStatusPath } = useAccountData();

const filter = computed(() => route.params.filter as NotificationFilter);
const filterLabel = computed(() => NOTIFICATION_FILTERS[filter.value]?.label ?? 'Notifications');

const { data: notifications, isLoading, error, refetch } = getNotifications(filter.value);

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
  <ClientOnly>
    <EmptyState
      v-if="error"
      :title="error.message || `Failed to load ${filterLabel.toLowerCase()}`"
      action-label="Try again"
      class="py-12"
      @action="refetch()"
    />

    <EmptyState
      v-else-if="!isLoading && notifications.length === 0"
      :title="`No ${filterLabel.toLowerCase()}`"
      :description="`You don't have any ${filterLabel.toLowerCase()} yet.`"
      class="py-12"
    />

    <NotificationList
      v-else
      :notifications="notifications"
      :loading="isLoading && notifications.length === 0"
      @click="handleNotificationClick"
      @profile-click="navigateToProfile"
    />

    <template #fallback>
      <div class="space-y-3 p-4">
        <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
      </div>
    </template>
  </ClientOnly>
</template>
