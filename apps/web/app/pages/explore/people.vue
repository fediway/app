<script setup lang="ts">
import { AccountCard, FollowButton } from '@repo/ui';
import { watch } from 'vue';

const { getAllAccounts, getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();

const { data: accounts } = getAllAccounts();

// Batch-fetch relationships when accounts load (one API call instead of N)
watch(accounts, (accts) => {
  if (accts.length > 0) {
    fetchRelationships(accts.map(a => a.id));
  }
}, { immediate: true });
</script>

<template>
  <div class="w-full">
    <ExploreHeader title="Explore" />

    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div class="flex items-center justify-between gap-3">
          <AccountCard
            :account="account"
            :profile-url="getProfilePath(account.acct)"
            show-bio
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
        <div class="mt-2 flex items-center gap-4 pl-12 text-sm text-gray-500">
          <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followersCount?.toLocaleString() }}</strong> followers</span>
          <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followingCount?.toLocaleString() }}</strong> following</span>
        </div>
      </div>
    </div>
  </div>
</template>
