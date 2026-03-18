<script setup lang="ts">
import type { Notification } from '@repo/types';
import { NotificationList } from '@repo/ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePullToRefresh } from '../composables/usePullToRefresh';
import { getProfileUrl, getSafeClient } from '../composables/useStatusBridge';

defineOptions({ name: 'Notifications' });

const router = useRouter();
const containerRef = ref<HTMLElement>();
const { isRefreshing, pullDistance, bind } = usePullToRefresh(load);

const notifications = ref<Notification[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const client = getSafeClient();
    if (!client)
      return;
    notifications.value = await client.rest.v1.notifications.list();
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load notifications');
  }
  finally {
    loading.value = false;
  }
}

function handleNotificationClick(notification: Notification) {
  if (notification.status) {
    router.push(`/status/${notification.status.id}`);
  }
  else {
    router.push(getProfileUrl(notification.account.acct));
  }
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

onMounted(() => {
  load();
  if (containerRef.value) {
    bind(containerRef.value);
  }
});
</script>

<template>
  <div ref="containerRef">
    <!-- Pull to refresh indicator -->
    <div
      v-if="pullDistance > 0 || isRefreshing"
      class="flex items-center justify-center overflow-hidden text-sm text-gray-400 transition-[height] dark:text-gray-500"
      :style="{ height: isRefreshing ? '48px' : `${pullDistance}px` }"
    >
      {{ isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh' }}
    </div>

    <NotificationList
      :notifications="notifications"
      :loading="loading"
      :error="error?.message"
      :has-more="false"
      @click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @retry="load"
    />
  </div>
</template>
