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
  <div v-if="suggestions.length > 0" class="border-b border-border bg-muted/50 py-4">
    <div class="mb-3 flex items-center justify-between px-4">
      <h3 class="font-semibold text-foreground">
        Who to follow
      </h3>
      <NuxtLink to="/explore" class="text-sm text-galaxy-500 no-underline hover:text-galaxy-600">
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
