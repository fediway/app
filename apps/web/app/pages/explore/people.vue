<script setup lang="ts">
import { AccountDisplayName, AccountHandle, Avatar, FollowButton, RichText } from '@repo/ui';

const { getAllAccounts, getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, getRelationship } = useFollows();

const { data: suggestedAccounts } = getAllAccounts();

function handleFollow(accountId: string) {
  toggleFollow(accountId);
}
</script>

<template>
  <div class="w-full">
    <ExploreHeader title="Explore" />

    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <div
        v-for="account in suggestedAccounts"
        :key="account.id"
        class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div class="flex items-start gap-3">
          <NuxtLink :to="getProfilePath(account.acct)" class="shrink-0">
            <Avatar :src="account.avatar" :alt="account.displayName" size="md" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="getProfilePath(account.acct)" class="min-w-0 no-underline">
                <AccountDisplayName
                  :name="account.displayName || account.username"
                  :emojis="account.emojis"
                  class="block truncate"
                />
                <AccountHandle :acct="account.acct" class="block truncate text-sm" />
              </NuxtLink>
              <FollowButton
                :is-following="isFollowing(account.id)"
                :requested="getRelationship(account.id).requested"
                size="sm"
                @follow="handleFollow(account.id)"
                @unfollow="handleFollow(account.id)"
              />
            </div>
            <RichText v-if="account.note" :content="account.note" :emojis="account.emojis" class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400" />
            <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followersCount?.toLocaleString() }}</strong> followers</span>
              <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followingCount?.toLocaleString() }}</strong> following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
