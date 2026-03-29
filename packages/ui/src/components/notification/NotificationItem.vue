<script setup lang="ts">
import type { Notification } from '@repo/types';
import type { Component } from 'vue';
import { PhArrowsClockwise, PhAt, PhHeart, PhStar, PhUserPlus } from '@phosphor-icons/vue';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import StatusContent from '../status/StatusContent.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';

defineProps<{
  notification: Notification;
  unread?: boolean;
}>();

const emit = defineEmits<{
  click: [notification: Notification];
  profileClick: [acct: string];
  tagClick: [tag: string];
}>();

const ICON_MAP: Record<string, { icon: Component; color: string }> = {
  favourite: { icon: PhHeart, color: 'text-rose-500' },
  reblog: { icon: PhArrowsClockwise, color: 'text-green' },
  follow: { icon: PhUserPlus, color: 'text-galaxy-500' },
  mention: { icon: PhAt, color: 'text-galaxy-500' },
  poll: { icon: PhStar, color: 'text-yellow' },
};

function getIcon(type: string) {
  return ICON_MAP[type] ?? { icon: PhStar, color: 'text-muted-foreground' };
}

function getText(type: string): string {
  switch (type) {
    case 'favourite': return 'liked your post';
    case 'reblog': return 'reposted your post';
    case 'follow': return 'followed you';
    case 'mention': return 'mentioned you';
    case 'poll': return 'poll has ended';
    default: return 'interacted with you';
  }
}
</script>

<template>
  <button
    class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
    :class="unread ? 'bg-muted' : ''"
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
        <button type="button" class="shrink-0" @click.stop="$emit('profileClick', notification.account.acct)">
          <Avatar :src="notification.account.avatar" :alt="notification.account.displayName" size="sm" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-sm">
            <AccountDisplayName
              :name="notification.account.displayName || notification.account.username"
              :emojis="notification.account.emojis"
            />
            <span class="ml-1 text-muted-foreground">{{ getText(notification.type) }}</span>
          </p>
          <RelativeTime :datetime="notification.createdAt" class="text-xs" />
        </div>
      </div>

      <!-- Status preview -->
      <div v-if="notification.status" class="mt-2 rounded-lg border border-border p-3">
        <StatusContent
          :content="notification.status.content"
          :spoiler-text="notification.status.spoilerText"
          :emojis="notification.status.emojis"
          :mentions="notification.status.mentions"
          :collapsed="notification.status.content.length > 200"
          @mention-click="emit('profileClick', $event)"
          @hashtag-click="emit('tagClick', $event)"
        />
      </div>
    </div>
  </button>
</template>
