<script setup lang="ts">
import type { NotificationGroupType } from '@repo/ui';
import { useClient, useNotificationMarker } from '@repo/api';
import { EmptyState, NotificationList, Skeleton, useToast } from '@repo/ui';
import { computed, watch } from 'vue';
import { useFollows } from '~/composables/useFollows';

const router = useRouter();
const { getNotifications } = useNotificationData();
const { getProfilePath, getStatusPath } = useAccountData();
const { lastReadId } = useNotificationMarker();
const { toggleFollow, getRelationship, fetchRelationships } = useFollows();

const client = useClient();
const { toast } = useToast();
const { data: notifications, isLoading, error, refetch } = getNotifications();

const followNotificationAccts = computed(() => {
  return notifications.value
    .filter(n => n.type === 'follow')
    .map(n => ({ id: n.account.id, acct: n.account.acct }));
});

watch(followNotificationAccts, (accts) => {
  const ids = accts.map(a => a.id);
  if (ids.length > 0) {
    fetchRelationships(ids);
  }
}, { immediate: true });

const followBackAccts = computed(() => {
  const set = new Set<string>();
  for (const { id, acct } of followNotificationAccts.value) {
    const rel = getRelationship(id);
    if (!rel.following) {
      set.add(acct);
    }
  }
  return set;
});

function handleGroupClick(group: NotificationGroupType) {
  if (group.status) {
    router.push(getStatusPath(group.status.id, group.status.account.acct));
  }
  else if (group.type === 'follow' || group.type === 'follow_request') {
    // Navigate to the first displayed account's profile (matches displayed name order)
    const acct = group.accounts[0]?.acct;
    if (acct)
      router.push(getProfilePath(acct));
  }
}

function handleFollowBack(acct: string) {
  const account = notifications.value.find(n => n.account.acct === acct)?.account;
  if (account) {
    toggleFollow(account.id);
  }
}

async function handleAcceptRequest(accountId: string) {
  try {
    await client.rest.v1.followRequests.$select(accountId).authorize();
    toast.success('Follow request accepted');
    refetch();
  }
  catch {
    toast.error('Failed to accept request');
  }
}

async function handleRejectRequest(accountId: string) {
  try {
    await client.rest.v1.followRequests.$select(accountId).reject();
    toast.success('Follow request declined');
    refetch();
  }
  catch {
    toast.error('Failed to decline request');
  }
}
</script>

<template>
  <div>
    <ClientOnly>
      <EmptyState
        v-if="error"
        :title="error.message || 'Failed to load notifications'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <EmptyState
        v-else-if="!isLoading && notifications.length === 0"
        title="No notifications yet"
        description="When someone interacts with you, it will show up here."
        class="py-12"
      />

      <NotificationList
        v-else
        :notifications="notifications"
        :loading="isLoading && notifications.length === 0"
        :last-read-id="lastReadId ?? undefined"
        :follow-back-accts="followBackAccts"
        @group-click="handleGroupClick"
        @profile-click="acct => router.push(getProfilePath(acct))"
        @tag-click="tag => router.push(`/tags/${tag}`)"
        @follow-back="handleFollowBack"
        @accept-request="handleAcceptRequest"
        @reject-request="handleRejectRequest"
      />

      <template #fallback>
        <div class="space-y-3 p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
