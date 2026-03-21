<script setup lang="ts">
import type { Account } from '@repo/types';
import { AccountCard, EmptyState, FollowButton } from '@repo/ui';
import { useFollows } from '~/composables/useFollows';

defineProps<{
  accounts: Account[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}>();

const { getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, getRelationship } = useFollows();
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
