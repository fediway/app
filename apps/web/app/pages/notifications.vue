<script setup lang="ts">
import type { Notification } from '@repo/types';
import { PhAt, PhHeart, PhRepeat, PhUserPlus } from '@phosphor-icons/vue';
import { AccountDisplayName, Avatar, RelativeTime, StatusContent } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getNotifications, getProfileUrl } = useData();
const notifications = computed(() => getNotifications());

function getNotificationText(notification: Notification): string {
  switch (notification.type) {
    case 'favourite':
      return 'liked your post';
    case 'reblog':
      return 'boosted your post';
    case 'follow':
      return 'followed you';
    case 'mention':
      return 'mentioned you';
    default:
      return 'interacted with you';
  }
}

function handleNotificationClick(notification: Notification) {
  if (notification.status) {
    router.push(`/status/${notification.status.id}`);
  }
  else if (notification.type === 'follow') {
    router.push(getProfileUrl(notification.account.acct));
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
      <h1 class="text-xl font-bold">
        Notifications
      </h1>
    </div>

    <!-- Notification List -->
    <div class="divide-y divide-gray-100">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        @click="handleNotificationClick(notification)"
      >
        <div class="flex gap-3">
          <!-- Icon indicator -->
          <div class="shrink-0 w-8 flex justify-end">
            <PhHeart v-if="notification.type === 'favourite'" :size="20" weight="fill" class="text-red-500" />
            <PhRepeat v-else-if="notification.type === 'reblog'" :size="20" class="text-green-500" />
            <PhUserPlus v-else-if="notification.type === 'follow'" :size="20" class="text-blue-500" />
            <PhAt v-else-if="notification.type === 'mention'" :size="20" class="text-purple-500" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Account info row -->
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink :to="getProfileUrl(notification.account.acct)">
                <Avatar
                  :src="notification.account.avatar"
                  :alt="notification.account.displayName"
                  size="sm"
                />
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <AccountDisplayName
                  :name="notification.account.displayName || notification.account.username"
                  :emojis="notification.account.emojis"
                />
                <span class="text-gray-500 ml-1">
                  {{ getNotificationText(notification) }}
                </span>
              </div>
              <RelativeTime
                :datetime="notification.createdAt"
                class="text-xs text-gray-400 shrink-0"
              />
            </div>

            <!-- Status preview for favourite/reblog/mention -->
            <div
              v-if="notification.status && (notification.type === 'favourite' || notification.type === 'reblog')"
              class="mt-2 pl-2 border-l-2 border-gray-200"
            >
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ notification.status.content.replace(/<[^>]*>/g, '') }}
              </p>
            </div>

            <!-- Full status for mentions -->
            <div
              v-if="notification.status && notification.type === 'mention'"
              class="mt-2 p-3 bg-gray-50 rounded-lg"
            >
              <StatusContent
                :content="notification.status.content"
                :spoiler-text="notification.status.spoilerText"
                :emojis="notification.status.emojis"
              />
            </div>

            <!-- Follow: show account bio snippet -->
            <div
              v-if="notification.type === 'follow'"
              class="mt-1"
            >
              <p class="text-sm text-gray-500 line-clamp-1">
                {{ notification.account.note.replace(/<[^>]*>/g, '') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notifications.length === 0" class="text-center py-12 text-gray-500">
      <p>No notifications yet</p>
      <p class="text-sm mt-1">
        When someone interacts with you, you'll see it here
      </p>
    </div>
  </div>
</template>
