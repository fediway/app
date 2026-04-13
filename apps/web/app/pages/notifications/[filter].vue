<script setup lang="ts">
import type { NotificationGroupType } from '@repo/ui';
import type { NotificationFilter } from '~/composables/useNotificationData';
import { useNotificationMarker } from '@repo/api';
import { EmptyState, NotificationList, Skeleton } from '@repo/ui';
import { NOTIFICATION_FILTERS } from '~/composables/useNotificationData';

const route = useRoute();
const router = useRouter();
const { getNotificationsPaginated } = useNotificationData();
const { getProfilePath, getStatusPath } = useAccountData();
const { lastReadId } = useNotificationMarker();

const filter = computed(() => route.params.filter as NotificationFilter);
const filterLabel = computed(() => NOTIFICATION_FILTERS[filter.value]?.label ?? 'Notifications');

const { data: notifications, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getNotificationsPaginated(filter.value);

function handleGroupClick(group: NotificationGroupType) {
  if (group.status) {
    router.push(getStatusPath(group.status.id, group.status.account.acct));
  }
  else if (group.type === 'follow' || group.type === 'follow_request') {
    const acct = group.accounts[0]?.acct;
    if (acct)
      router.push(getProfilePath(acct));
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
      :loading-more="isLoadingMore"
      :has-more="hasMore"
      :last-read-id="lastReadId ?? undefined"
      @group-click="handleGroupClick"
      @profile-click="navigateToProfile"
      @tag-click="(tag) => router.push(`/tags/${tag}`)"
      @load-more="loadMore()"
    />

    <template #fallback>
      <div class="space-y-3 p-4">
        <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
      </div>
    </template>
  </ClientOnly>
</template>
