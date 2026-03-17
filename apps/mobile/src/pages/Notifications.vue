<script setup lang="ts">
import type { Notification } from '@repo/types';
import { PhAt, PhHeart, PhRepeat, PhStar, PhUserPlus } from '@phosphor-icons/vue';
import { AccountDisplayName, Avatar, RelativeTime, StatusContent } from '@repo/ui';
import { computed, onMounted, ref } from 'vue';
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

const NOTIFICATION_ICONS: Record<string, { icon: typeof PhHeart; color: string }> = {
  favourite: { icon: PhHeart, color: 'text-red-500' },
  reblog: { icon: PhRepeat, color: 'text-green-500' },
  follow: { icon: PhUserPlus, color: 'text-blue-500' },
  mention: { icon: PhAt, color: 'text-purple-500' },
  poll: { icon: PhStar, color: 'text-yellow-500' },
};

const DEFAULT_META = { icon: PhStar, color: 'text-gray-500' };

function getNotificationText(type: string): string {
  switch (type) {
    case 'favourite': return 'favourited your post';
    case 'reblog': return 'boosted your post';
    case 'follow': return 'followed you';
    case 'mention': return 'mentioned you';
    case 'poll': return 'poll has ended';
    default: return 'interacted with you';
  }
}

const enrichedNotifications = computed(() =>
  notifications.value.map(n => ({
    ...n,
    meta: NOTIFICATION_ICONS[n.type] ?? DEFAULT_META,
    text: getNotificationText(n.type),
    ariaLabel: `${n.account.displayName} ${getNotificationText(n.type)}`,
  })),
);

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

    <div v-if="error && notifications.length === 0" class="flex flex-col items-center justify-center gap-3 py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Couldn't load notifications
      </p>
      <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="load()">
        Try again
      </button>
    </div>

    <template v-else>
      <div v-if="loading && notifications.length === 0" class="flex items-center justify-center py-20">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Loading notifications…
        </p>
      </div>

      <ul v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <li v-for="notification in enrichedNotifications" :key="notification.id">
          <button
            :aria-label="notification.ariaLabel"
            class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            @click="handleNotificationClick(notification)"
          >
            <div class="mt-0.5 flex-shrink-0">
              <component
                :is="notification.meta.icon"
                :class="notification.meta.color"
                :size="20"
                weight="fill"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start gap-2">
                <Avatar :src="notification.account.avatar" :alt="notification.account.displayName" size="sm" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm">
                    <AccountDisplayName :name="notification.account.displayName" :emojis="notification.account.emojis" />
                    <span class="text-gray-500 dark:text-gray-400"> {{ notification.text }}</span>
                  </p>
                  <RelativeTime :datetime="notification.createdAt" class="text-xs text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div v-if="notification.status" class="mt-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <StatusContent
                  :content="notification.status.content"
                  :spoiler-text="notification.status.spoilerText"
                  :emojis="notification.status.emojis"
                  :collapsed="notification.status.content.length > 200"
                />
              </div>
            </div>
          </button>
        </li>
      </ul>

      <div v-if="!loading && !error && notifications.length === 0" class="flex items-center justify-center py-20">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No notifications yet
        </p>
      </div>
    </template>
  </div>
</template>
