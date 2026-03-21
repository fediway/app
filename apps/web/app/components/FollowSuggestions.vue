<script setup lang="ts">
import { AccountCarousel, FollowButton } from '@repo/ui';

const { getSuggestedAccounts, getProfilePath } = useAccountData();
const { toggleFollow, isFollowing } = useFollows();
const { data: suggestions } = getSuggestedAccounts();

const router = useRouter();

function handleAccountClick(acct: string) {
  router.push(getProfilePath(acct));
}
</script>

<template>
  <div v-if="suggestions.length > 0" class="border-b border-gray-200 bg-gray-50/50 py-4 dark:border-gray-800 dark:bg-gray-800/20">
    <div class="mb-3 flex items-center justify-between px-4">
      <h3 class="font-semibold text-gray-900 dark:text-white">
        Who to follow
      </h3>
      <NuxtLink to="/explore" class="text-sm text-blue-500 no-underline hover:text-blue-600">
        See all
      </NuxtLink>
    </div>

    <AccountCarousel
      :accounts="suggestions"
      @account-click="handleAccountClick"
    >
      <template #action="{ account }">
        <FollowButton
          :is-following="isFollowing(account.id)"
          size="sm"
          class="w-full"
          @follow.prevent.stop="toggleFollow(account.id)"
          @unfollow.prevent.stop="toggleFollow(account.id)"
        />
      </template>
    </AccountCarousel>
  </div>
</template>
