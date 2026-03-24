<script setup lang="ts">
import type { Account } from '@repo/types';
import { AccountCard, EmptyState, FollowButton } from '@repo/ui';
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

  <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
    <div
      v-for="account in accounts"
      :key="account.id"
      class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div class="flex items-center justify-between gap-3">
        <AccountCard
          :account="account"
          :profile-url="getProfilePath(account.acct)"
          class="min-w-0 flex-1"
        />
        <FollowButton
          v-if="hasRelationship(account.id)"
          :is-following="isFollowing(account.id)"
          :requested="getRelationship(account.id).requested"
          size="sm"
          @follow="toggleFollow(account.id)"
          @unfollow="toggleFollow(account.id)"
        />
      </div>
    </div>
  </div>
</template>
