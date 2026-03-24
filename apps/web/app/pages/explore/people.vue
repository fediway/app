<script setup lang="ts">
import { AccountCard, EmptyState, FollowButton, Skeleton } from '@repo/ui';
import { watch } from 'vue';

const { exploreTabs } = useDiscoveryTabs();
const { getAllAccounts, getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();

const { data: accounts, isLoading, error, refetch } = getAllAccounts();

// Batch-fetch relationships when accounts load (one API call instead of N)
watch(accounts, (accts) => {
  if (accts.length > 0) {
    fetchRelationships(accts.map(a => a.id));
  }
}, { immediate: true });
</script>

<template>
  <div class="w-full">
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <ClientOnly>
      <EmptyState
        v-if="error"
        :title="error.message || 'Failed to load people'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <EmptyState
        v-else-if="!isLoading && accounts.length === 0"
        title="No people to show"
        description="Check back later for suggestions."
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

      <template #fallback>
        <div class="space-y-3 p-4">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <Skeleton class="size-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-48" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
