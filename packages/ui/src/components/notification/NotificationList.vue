<script setup lang="ts">
import type { Notification } from '@repo/types';
import type { NotificationGroup } from './groupNotifications';
import { PhCircleNotch } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import { groupNotifications } from './groupNotifications';
import NotificationGroupItem from './NotificationGroup.vue';

const props = defineProps<{
  notifications: Notification[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  lastReadId?: string;
  error?: string;
  followBackAccts?: Set<string>;
}>();

const emit = defineEmits<{
  click: [notification: Notification];
  groupClick: [group: NotificationGroup];
  profileClick: [acct: string];
  tagClick: [tag: string];
  followBack: [acct: string];
  acceptRequest: [accountId: string];
  rejectRequest: [accountId: string];
  loadMore: [];
  retry: [];
}>();

const groups = computed(() => groupNotifications(props.notifications));

function isUnread(mostRecentId: string): boolean {
  if (!props.lastReadId)
    return false;
  try {
    return BigInt(mostRecentId) > BigInt(props.lastReadId);
  }
  catch {
    return mostRecentId > props.lastReadId;
  }
}

function handleGroupClick(group: NotificationGroup) {
  emit('groupClick', group);
  const firstNotification = props.notifications.find(n => n.id === group.mostRecentId);
  if (firstNotification) {
    emit('click', firstNotification);
  }
}

const { sentinelRef } = useInfiniteScroll({
  enabled: computed(() => (props.hasMore ?? false) && !props.loadingMore && !props.loading && !props.error && props.notifications.length > 0),
  onLoadMore: () => emit('loadMore'),
});
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading && notifications.length === 0" class="divide-y divide-border">
    <div v-for="i in 5" :key="i" class="flex gap-3 px-4 py-3.5">
      <Skeleton class="mt-0.5 size-6 rounded" />
      <div class="flex-1 space-y-2.5">
        <div class="flex -space-x-1">
          <Skeleton v-for="j in 2" :key="j" class="size-8 rounded-full ring-2 ring-card" />
        </div>
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-3 w-1/2" />
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

  <!-- Grouped notification list -->
  <div v-else-if="groups.length > 0" class="divide-y divide-border">
    <NotificationGroupItem
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :unread="isUnread(group.mostRecentId)"
      :show-follow-back="group.type === 'follow' && group.accounts.length === 1 && !!followBackAccts?.has(group.accounts[0]?.acct ?? '')"
      @click="handleGroupClick"
      @profile-click="acct => $emit('profileClick', acct)"
      @follow-back="acct => $emit('followBack', acct)"
      @accept-request="id => $emit('acceptRequest', id)"
      @reject-request="id => $emit('rejectRequest', id)"
    />
  </div>

  <!-- Empty state -->
  <EmptyState
    v-else
    title="No notifications yet"
    description="When someone interacts with you, you'll see it here"
  />

  <!-- Loading more spinner -->
  <div v-if="loadingMore" class="flex justify-center py-4">
    <PhCircleNotch :size="20" class="animate-spin text-muted-foreground" />
  </div>

  <!-- Infinite scroll sentinel -->
  <div ref="sentinelRef" class="h-px" />
</template>
