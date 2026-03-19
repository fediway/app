<script setup lang="ts">
import type { Notification } from '@repo/types';
import type { Component } from 'vue';
import { PhAt, PhHeart, PhRepeat, PhStar, PhUserPlus } from '@phosphor-icons/vue';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import StatusContent from '../status/StatusContent.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';

defineProps<{
  notification: Notification;
}>();

defineEmits<{
  click: [notification: Notification];
  profileClick: [acct: string];
}>();

const ICON_MAP: Record<string, { icon: Component; color: string }> = {
  favourite: { icon: PhHeart, color: 'text-red-500' },
  reblog: { icon: PhRepeat, color: 'text-green-500' },
  follow: { icon: PhUserPlus, color: 'text-blue-500' },
  mention: { icon: PhAt, color: 'text-purple-500' },
  poll: { icon: PhStar, color: 'text-yellow-500' },
};

function getIcon(type: string) {
  return ICON_MAP[type] ?? { icon: PhStar, color: 'text-gray-500' };
}

function getText(type: string): string {
  switch (type) {
    case 'favourite': return 'favourited your post';
    case 'reblog': return 'boosted your post';
    case 'follow': return 'followed you';
    case 'mention': return 'mentioned you';
    case 'poll': return 'poll has ended';
    default: return 'interacted with you';
  }
}
</script>

<template>
  <button
    class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    @click="$emit('click', notification)"
  >
    <!-- Type icon -->
    <div class="mt-0.5 shrink-0">
      <component
        :is="getIcon(notification.type).icon"
        :class="getIcon(notification.type).color"
        :size="20"
        weight="fill"
      />
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <div class="flex items-start gap-2">
        <a @click.stop="$emit('profileClick', notification.account.acct)">
          <Avatar :src="notification.account.avatar" :alt="notification.account.displayName" size="sm" />
        </a>
        <div class="min-w-0 flex-1">
          <p class="text-sm">
            <AccountDisplayName
              :name="notification.account.displayName || notification.account.username"
              :emojis="notification.account.emojis"
            />
            <span class="text-gray-500 dark:text-gray-400"> {{ getText(notification.type) }}</span>
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
</template>
