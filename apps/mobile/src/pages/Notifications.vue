<script setup lang="ts">
import type { Notification } from '@repo/types';
import { PhAt, PhHeart, PhRepeat, PhStar, PhUserPlus } from '@phosphor-icons/vue';
import { AccountDisplayName, Avatar, RelativeTime, StatusContent } from '@repo/ui';
import { useRouter } from 'vue-router';
import { useData } from '../composables/useData';

defineOptions({ name: 'Notifications' });

const router = useRouter();
const { getNotifications, getProfileUrl } = useData();

const NOTIFICATION_ICONS: Record<string, { icon: typeof PhHeart; color: string }> = {
  favourite: { icon: PhHeart, color: 'text-red-500' },
  reblog: { icon: PhRepeat, color: 'text-green-500' },
  follow: { icon: PhUserPlus, color: 'text-blue-500' },
  mention: { icon: PhAt, color: 'text-purple-500' },
  poll: { icon: PhStar, color: 'text-yellow-500' },
};

function getNotificationMeta(type: string) {
  return NOTIFICATION_ICONS[type] ?? { icon: PhStar, color: 'text-gray-500' };
}

function getNotificationText(notification: Notification): string {
  switch (notification.type) {
    case 'favourite': return 'favourited your post';
    case 'reblog': return 'boosted your post';
    case 'follow': return 'followed you';
    case 'mention': return 'mentioned you';
    case 'poll': return 'poll has ended';
    default: return 'interacted with you';
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
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-800">
    <button
      v-for="notification in getNotifications()"
      :key="notification.id"
      class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      @click="handleNotificationClick(notification)"
    >
      <!-- Icon -->
      <div class="mt-0.5 flex-shrink-0">
        <component
          :is="getNotificationMeta(notification.type).icon"
          :class="getNotificationMeta(notification.type).color"
          :size="20"
          weight="fill"
        />
      </div>

      <!-- Content -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start gap-2">
          <Avatar :src="notification.account.avatar" :alt="notification.account.displayName" size="sm" />
          <div class="min-w-0 flex-1">
            <p class="text-sm">
              <AccountDisplayName :name="notification.account.displayName" :emojis="notification.account.emojis" />
              <span class="text-gray-500 dark:text-gray-400"> {{ getNotificationText(notification) }}</span>
            </p>
            <RelativeTime :datetime="notification.createdAt" class="text-xs text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <!-- Status preview -->
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

    <div v-if="getNotifications().length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        No notifications yet
      </p>
    </div>
  </div>
</template>
