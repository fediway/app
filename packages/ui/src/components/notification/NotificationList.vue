<script setup lang="ts">
import type { Notification } from '@repo/types';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import NotificationItem from './NotificationItem.vue';

defineProps<{
  notifications: Notification[];
  loading?: boolean;
  hasMore?: boolean;
  error?: string;
}>();

defineEmits<{
  click: [notification: Notification];
  profileClick: [acct: string];
  tagClick: [tag: string];
  loadMore: [];
  retry: [];
}>();
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading && notifications.length === 0" class="divide-y divide-border">
    <div v-for="i in 4" :key="i" class="flex gap-3 px-4 py-3">
      <Skeleton class="mt-0.5 size-5 rounded" />
      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <Skeleton class="size-8 rounded-full" />
          <Skeleton class="h-4 w-1/3" />
        </div>
        <Skeleton class="h-3 w-2/3" />
      </div>
    </div>
  </div>

  <!-- Error state -->
  <EmptyState
    v-else-if="error"
    :title="error"
    action-label="Try again"
    @action="$emit('retry')"
  />

  <!-- Notification list -->
  <div v-else-if="notifications.length > 0" class="divide-y divide-border">
    <NotificationItem
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @click="n => $emit('click', n)"
      @profile-click="acct => $emit('profileClick', acct)"
      @tag-click="tag => $emit('tagClick', tag)"
    />
  </div>

  <!-- Empty state -->
  <EmptyState
    v-else
    title="No notifications yet"
    description="When someone interacts with you, you'll see it here"
  />
</template>
