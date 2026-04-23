<script setup lang="ts">
import type { Account } from '@repo/types';
import { useAuth } from '@repo/api';
import { AccountListItem, EmptyState, FollowButton } from '@repo/ui';
import { watch } from 'vue';
import { useFollows } from '~/composables/useFollows';

const props = defineProps<{
  accounts: Account[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}>();

const { getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();
const { isCurrentUser } = useAuth();

// Batch-fetch relationships when accounts change
watch(() => props.accounts, (accts) => {
  if (accts.length > 0) {
    fetchRelationships(accts.map(a => a.id));
  }
}, { immediate: true });
</script>

<template>
  <EmptyState
    v-if="!isLoading && accounts.length === 0"
    :title="emptyTitle"
    :description="emptyDescription"
    class="py-12"
  />

  <div v-else class="divide-y divide-border">
    <AccountListItem
      v-for="account in accounts"
      :key="account.id"
      :account="account"
      :profile-url="getProfilePath(account.acct)"
      @profile-click="navigateTo(getProfilePath($event))"
    >
      <template #action>
        <FollowButton
          v-if="!isCurrentUser(account.id) && hasRelationship(account.id)"
          :is-following="isFollowing(account.id)"
          :requested="getRelationship(account.id).requested"
          size="sm"
          @follow="toggleFollow(account.id)"
          @unfollow="toggleFollow(account.id)"
        />
      </template>
    </AccountListItem>
  </div>
</template>
